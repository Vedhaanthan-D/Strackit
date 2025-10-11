import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiMinus, FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import { MdNote, MdLocalOffer, MdLocalShipping } from 'react-icons/md';
import { CART_CONFIG, IMAGE_PREFIX } from '../../../config/appIds';
import { fetchCart, addToCart, removeFromCart, updateCartQuantity } from 'shops-query/src/modules/cart/index';
import { getProductsController } from 'shops-query/src/modules/products/index';
import { fetchCouponCode } from 'shops-query/src/modules/CouponCode/Controller/index';
import { fetchShippingCost } from 'shops-query/src/modules/ShippingCost/Controller/index';
import '../styles/CartSidebar.css';

// Empty Cart Icon Component
const EmptyCartIcon = () => (
  <FiShoppingCart className="empty-cart-icon" size={80} />
);

// Loading Skeleton for cart items
const CartItemSkeleton = () => (
  <div className="cart-item-skeleton">
    <div className="cart-item-image-skeleton"></div>
    <div className="cart-item-details-skeleton">
      <div className="cart-item-name-skeleton"></div>
      <div className="cart-item-price-skeleton"></div>
    </div>
  </div>
);

// Loading Skeleton for recommended products
const RecommendedProductSkeleton = () => (
  <div className="recommended-product-skeleton">
    <div className="recommended-product-image-skeleton"></div>
    <div className="recommended-product-name-skeleton"></div>
    <div className="recommended-product-price-skeleton"></div>
    <div className="recommended-product-button-skeleton"></div>
  </div>
);

const CartSidebar = ({ isOpen, onClose, cartItemCount, setCartItemCount }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [shippingCosts, setShippingCosts] = useState([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500);
  const recommendedScrollRef = useRef(null);
  
  // Constants from config
  const { shopId, userId } = CART_CONFIG;
  const imagePrefix = IMAGE_PREFIX;
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.prize);
    const discount = parseFloat(item.Discount);
    const finalPrice = price - discount;
    return total + (finalPrice * item.quantity);
  }, 0);
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Dynamic free shipping calculation
  const calculateFreeShippingEligibility = () => {
    // Check for free shipping coupons first
    const freeShippingCoupon = coupons.find(coupon => {
      const isActive = coupon.status === 'active' || coupon.status === 1;
      const isValidDate = new Date() >= new Date(coupon.validityFrom) && 
                          new Date() <= new Date(coupon.validityTo);
      const meetsMinimum = subtotal >= parseFloat(coupon.priceRange || 0);
      
      // Check if coupon provides free shipping (discount could be 100% of shipping or name/description indicates free shipping)
      const isFreeShipping = coupon.name?.toLowerCase().includes('free shipping') ||
                             coupon.description?.toLowerCase().includes('free shipping') ||
                             coupon.code?.toLowerCase().includes('freeship');
      
      return isActive && isValidDate && meetsMinimum && isFreeShipping;
    });
    
    if (freeShippingCoupon) {
      return {
        qualifies: true,
        threshold: parseFloat(freeShippingCoupon.priceRange || 0),
        couponBased: true
      };
    }
    
    // Check shipping cost tiers
    const applicableShipping = shippingCosts
      .filter(shipping => subtotal >= parseFloat(shipping.purchaseRange || 0))
      .sort((a, b) => parseFloat(b.purchaseRange) - parseFloat(a.purchaseRange))[0];
    
    if (applicableShipping && parseFloat(applicableShipping.price) === 0) {
      return {
        qualifies: true,
        threshold: parseFloat(applicableShipping.purchaseRange || 0),
        couponBased: false
      };
    }
    
    // Find next free shipping tier
    const nextFreeTier = shippingCosts
      .filter(shipping => 
        parseFloat(shipping.price || 0) === 0 && 
        parseFloat(shipping.purchaseRange || 0) > subtotal
      )
      .sort((a, b) => parseFloat(a.purchaseRange) - parseFloat(b.purchaseRange))[0];
    
    if (nextFreeTier) {
      return {
        qualifies: false,
        threshold: parseFloat(nextFreeTier.purchaseRange),
        couponBased: false
      };
    }
    
    // Use default threshold
    return {
      qualifies: subtotal >= freeShippingThreshold,
      threshold: freeShippingThreshold,
      couponBased: false
    };
  };
  
  const freeShippingInfo = calculateFreeShippingEligibility();
  const amountForFreeShipping = Math.max(0, freeShippingInfo.threshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingInfo.threshold) * 100);

  // Fetch coupon data
  const fetchCouponData = async () => {
    try {
      const couponData = await fetchCouponCode(shopId);
      setCoupons(couponData || []);
    } catch (err) {
      setCoupons([]);
    }
  };

  // Fetch shipping cost data
  const fetchShippingData = async () => {
    try {
      const shippingData = await fetchShippingCost(shopId);
      setShippingCosts(shippingData || []);
      
      // Update default threshold based on shipping data
      const freeShippingTiers = shippingData
        .filter(shipping => parseFloat(shipping.price || 0) === 0)
        .sort((a, b) => parseFloat(a.purchaseRange) - parseFloat(b.purchaseRange));
      
      if (freeShippingTiers.length > 0) {
        setFreeShippingThreshold(parseFloat(freeShippingTiers[0].purchaseRange));
      }
    } catch (err) {
      setShippingCosts([]);
    }
  };

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await fetchCart(shopId, userId);
      setCartItems(cartData);
      setCartItemCount(cartData?.reduce((total, item) => total + item.quantity, 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommended products
  const fetchRecommendedProducts = async () => {
    try {
      setRecommendedLoading(true);
      const productsData = await getProductsController(shopId);
      
      if (productsData && productsData.length > 0) {
        // Filter published products and exclude items already in cart
        const cartProductIds = cartItems.map(item => item.productId);
        const availableProducts = productsData
          .filter(product => 
            product && 
            product.publish && 
            !cartProductIds.includes(product.id)
          )
          .slice(0, 8); // Limit to 8 recommendations
        
        setRecommendedProducts(availableProducts);
      }
    } catch (err) {
      setRecommendedProducts([]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartQuantity({
        userId,
        productId,
        shopId,
        quantity: newQuantity
      });
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      // Update cart count
      const newCartItems = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      setCartItemCount(newCartItems.reduce((total, item) => total + item.quantity, 0));
    } catch (err) {
      // Failed to update quantity, refresh cart data
      fetchCartData();
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      await removeFromCart({
        userId,
        productId,
        shopId
      });
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.filter(item => item.productId !== productId)
      );
      
      // Update cart count
      const removedItem = cartItems.find(item => item.productId === productId);
      if (removedItem) {
        setCartItemCount(prev => prev - removedItem.quantity);
      }
    } catch (err) {
      // Failed to remove item, refresh cart data
      fetchCartData();
    }
  };

  // Add recommended product to cart
  const addToCartFunc = async (product) => {
    try {
      await addToCart({
        productId: product.id,
        shopId,
        userId,
        quantity: 1
      });
      
      // Refresh cart data
      fetchCartData();
      // Refresh recommendations (to exclude newly added item)
      fetchRecommendedProducts();
    } catch (err) {
      // Failed to add item
      setError('Failed to add item to cart');
    }
  };

  // Scroll recommended products
  const scrollRecommended = (direction) => {
    if (recommendedScrollRef.current) {
      const scrollAmount = 250;
      const currentScrollLeft = recommendedScrollRef.current.scrollLeft;
      const targetScrollLeft = direction === 'left' 
        ? currentScrollLeft - scrollAmount 
        : currentScrollLeft + scrollAmount;
      
      recommendedScrollRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Handle View Cart navigation
  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA0MEMzNy41IDQwIDI3LjUgNTAgMjcuNSA2Mi41QzMwIDYwIDMzLjc1IDU4Ljc1IDM3LjUgNTguNzVDNDEuMjUgNTguNzUgNDUgNjAgNDcuNSA2Mi41QzQ4Ljc1IDYzLjc1IDUxLjI1IDYzLjc1IDUyLjUgNjIuNUM1NSA2MCA1OC43NSA1OC43NSA2Mi41IDU4Ljc1QzY2LjI1IDU4Ljc1IDcwIDYwIDcyLjUgNjIuNUM3Mi41IDUwIDYyLjUgNDAgNTAgNDBaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo=';
  };

  // Fetch initial data when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchCartData();
      fetchCouponData();
      fetchShippingData();
    }
  }, [isOpen]);

  // Fetch recommendations when cart changes
  useEffect(() => {
    if (isOpen && cartItems.length >= 0) {
      fetchRecommendedProducts();
    }
  }, [isOpen, cartItems]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-sidebar-overlay" onClick={handleOverlayClick}>
      <div className="cart-sidebar">
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">Shopping Cart</h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close cart">
            <FiX size={24} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && (
          <div className="free-shipping-section">
            <div className="free-shipping-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${freeShippingProgress}%` }}
                ></div>
                <div className="progress-icon">
                  {freeShippingProgress >= 100 ? '✓' : '📦'}
                </div>
              </div>
              {!freeShippingInfo.qualifies ? (
                <p className="shipping-text">
                  Buy <strong>₹{amountForFreeShipping.toFixed(2)}</strong> more to enjoy <strong>FREE shipping</strong>
                  {freeShippingInfo.couponBased && (
                    <span className="coupon-indicator"> (Coupon eligible)</span>
                  )}
                </p>
              ) : (
                <p className="shipping-text congratulations">
                  <strong>Congratulations! You qualify for FREE shipping</strong>
                  {freeShippingInfo.couponBased && (
                    <span className="coupon-indicator"> (Coupon applied)</span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="cart-content">
          {loading ? (
            <div className="cart-loading">
              {[1, 2, 3].map(i => <CartItemSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="cart-error">
              <p>Error loading cart: {error}</p>
              <button onClick={fetchCartData} className="retry-btn">Retry</button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="empty-cart">
              <EmptyCartIcon />
              <h3 className="empty-cart-title">Your cart is empty</h3>
              <p className="empty-cart-description">
                You may check out all the available products and buy some in the shop.
              </p>
              <button className="continue-shopping-btn" onClick={onClose}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            /* Cart Items */
            <div className="cart-items">
              {cartItems.map((item) => {
                const price = parseFloat(item.prize);
                const discount = parseFloat(item.Discount);
                const finalPrice = price - discount;
                
                return (
                  <div key={`${item.productId}-${item.id}`} className="cart-item">
                    <div className="cart-item-image">
                      <img 
                        src={item.featureImage ? `${imagePrefix}${item.featureImage}` : ''} 
                        alt={item.name}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price">
                        {discount > 0 ? (
                          <>
                            <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                            <span className="original-price">₹{price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="current-price">₹{price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommended Products Section */}
          {cartItems.length > 0 && (
            <div className="recommendations-section">
              <div className="recommendations-header">
                <h3 className="recommendations-title">You may also like</h3>
                <div className="recommendations-nav">
                  <button 
                    className="nav-btn"
                    onClick={() => scrollRecommended('left')}
                    aria-label="Scroll left"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button 
                    className="nav-btn"
                    onClick={() => scrollRecommended('right')}
                    aria-label="Scroll right"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="recommendations-container" ref={recommendedScrollRef}>
                {recommendedLoading ? (
                  <>
                    {[1, 2, 3, 4].map(i => <RecommendedProductSkeleton key={i} />)}
                  </>
                ) : (
                  recommendedProducts.map((product) => {
                    const price = parseFloat(product.prize);
                    const discount = parseFloat(product.Discount);
                    const finalPrice = price - discount;
                    
                    return (
                      <div key={product.id} className="recommended-product">
                        <div className="recommended-product-image">
                          <img 
                            src={product.featureImage ? `${imagePrefix}${product.featureImage}` : ''} 
                            alt={product.name}
                            onError={handleImageError}
                          />
                        </div>
                        <h4 className="recommended-product-name">{product.name}</h4>
                        <div className="recommended-product-price">
                          {discount > 0 ? (
                            <>
                              <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                              <span className="original-price">₹{price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="current-price">₹{price.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addToCartFunc(product)}
                        >
                          + Add to Cart
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-actions">
              <button className="action-btn">
                <MdNote className="action-icon" />
                Order Note
              </button>
              <button className="action-btn">
                <MdLocalOffer className="action-icon" />
                Coupon
              </button>
              <button className="action-btn">
                <MdLocalShipping className="action-icon" />
                Shipping
              </button>
            </div>
            
            <div className="cart-total">
              <div className="total-line">
                <span className="total-label">Total</span>
                <span className="total-amount">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="tax-note">Taxes and <span className="shipping-link">shipping</span> calculated at checkout</p>
            </div>
            
            <div className="cart-buttons">
              <button className="checkout-btn">Check Out</button>
              <button className="view-cart-btn" onClick={handleViewCart}>View Cart</button>
            </div>
          </div>
        )}

        {/* Empty cart footer with recommendations */}
        {cartItems.length === 0 && recommendedProducts.length > 0 && (
          <div className="empty-cart-recommendations">
            <div className="recommendations-header">
              <h3 className="recommendations-title">You may also like</h3>
              <div className="recommendations-nav">
                <button 
                  className="nav-btn"
                  onClick={() => scrollRecommended('left')}
                  aria-label="Scroll left"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button 
                  className="nav-btn"
                  onClick={() => scrollRecommended('right')}
                  aria-label="Scroll right"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="recommendations-container" ref={recommendedScrollRef}>
              {recommendedLoading ? (
                <>
                  {[1, 2, 3, 4].map(i => <RecommendedProductSkeleton key={i} />)}
                </>
              ) : (
                recommendedProducts.map((product) => {
                  const price = parseFloat(product.prize);
                  const discount = parseFloat(product.Discount);
                  const finalPrice = price - discount;
                  
                  return (
                    <div key={product.id} className="recommended-product">
                      <div className="recommended-product-image">
                        <img 
                          src={product.featureImage ? `${imagePrefix}${product.featureImage}` : ''} 
                          alt={product.name}
                          onError={handleImageError}
                        />
                      </div>
                      <h4 className="recommended-product-name">{product.name}</h4>
                      <div className="recommended-product-price">
                        {discount > 0 ? (
                          <>
                            <span className="discounted-price">₹{finalPrice.toFixed(2)}</span>
                            <span className="original-price">₹{price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="current-price">₹{price.toFixed(2)}</span>
                        )}
                      </div>
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => addToCartFunc(product)}
                      >
                        + Add to Cart
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;