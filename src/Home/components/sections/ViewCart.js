import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { fetchCart, removeFromCart, updateCartQuantity } from 'shops-query/src/modules/cart/index.js';
import '../styles/ViewCart.css';

const ViewCart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Constants
  const shopId = 488;
  const userId = 1968;
  const imagePrefix = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";
  const freeShippingThreshold = 530;
  
  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.prize || 0);
    const discount = parseFloat(item.Discount || 0);
    const finalPrice = price - discount;
    return total + (finalPrice * item.quantity);
  }, 0);
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cartData = await fetchCart(shopId, userId);
      setCartItems(cartData || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error('Error updating quantity:', err);
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
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/');
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA0MEMzNy41IDQwIDI3LjUgNTAgMjcuNSA2Mi41QzMwIDYwIDMzLjc1IDU4Ljc1IDM3LjUgNTguNzVDNDEuMjUgNTguNzUgNDUgNjAgNDcuNSA2Mi41QzQ4Ljc1IDYzLjc1IDUxLjI1IDYzLjc1IDUyLjUgNjIuNUM1NSA2MCA1OC43NSA1OC43NSA2Mi41IDU4Ljc1QzY2LjI1IDU4Ljc1IDcwIDYwIDcyLjUgNjIuNUM3Mi41IDUwIDYyLjUgNDAgNTAgNDBaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo=';
  };

  // Handle checkout
  const handleCheckout = () => {
    // Navigate to checkout or handle checkout process
    console.log('Proceeding to checkout...');
    // navigate('/checkout');
  };

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  return (
    <div className="view-cart-container">
      <div className="view-cart-header">
        <h1>Your Shopping Cart</h1>
      </div>
      
      <div className="view-cart-content">
        {/* Left section - Cart Products */}
        <div className="cart-products-section">
          {loading ? (
            <div className="cart-loading">
              <p>Loading cart items...</p>
            </div>
          ) : error ? (
            <div className="cart-error">
              <p>Error loading cart: {error}</p>
              <button onClick={fetchCartData} className="retry-btn">Retry</button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>Your cart is empty</p>
              <button onClick={handleContinueShopping} className="continue-shopping-btn">CONTINUE SHOPPING</button>
            </div>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="product-col">PRODUCT</th>
                    <th className="quantity-col">QUANTITY</th>
                    <th className="total-col">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const price = parseFloat(item.prize || 0);
                    const discount = parseFloat(item.Discount || 0);
                    const finalPrice = price - discount;
                    const itemTotal = finalPrice * item.quantity;
                    
                    return (
                      <tr key={`${item.productId}-${item.id}`} className="cart-item-row">
                        <td className="product-col">
                          <div className="product-info">
                            <div className="product-image">
                              <img 
                                src={item.featureImage ? `${imagePrefix}${item.featureImage}` : ''} 
                                alt={item.name}
                                onError={handleImageError}
                              />
                            </div>
                            <div className="product-details">
                              <h3 className="product-name">{item.name}</h3>
                              <p className="product-price">${finalPrice.toFixed(2)}</p>
                              <p className="product-variant">Title: <strong>Default Title</strong></p>
                              <button 
                                className="delete-btn"
                                onClick={() => removeItem(item.productId)}
                              >
                                DELETE
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="quantity-col">
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
                        </td>
                        <td className="total-col">
                          <span className="item-total">${itemTotal.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="cart-footer">
                <button onClick={handleContinueShopping} className="continue-shopping-link">
                  CONTINUE SHOPPING
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Right section - Order Summary */}
        <div className="order-summary-section">
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
                    ★
                  </div>
                </div>
                {amountForFreeShipping > 0 ? (
                  <p className="shipping-text">
                    Buy <strong>${amountForFreeShipping.toFixed(2)} USD</strong> more to enjoy <strong>FREE shipping</strong>
                  </p>
                ) : (
                  <p className="shipping-text">
                    <strong>Congratulations! You qualify for FREE shipping</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="order-notes">
            <h3>Order special instructions</h3>
            <textarea 
              value={orderNotes} 
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add special instructions for your order"
            ></textarea>
          </div>

          {/* Coupon Code */}
          <div className="coupon-section">
            <h3>Coupon</h3>
            <input 
              type="text" 
              value={coupon} 
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter coupon code"
            />
          </div>

          {/* Shipping Information */}
          <div className="shipping-section">
            <h3>Shipping</h3>
            <div className="shipping-form">
              <label>Country/region</label>
              <select 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">--</option>
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
              </select>

              <label>Postal code</label>
              <input 
                type="text" 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* Order Total */}
          <div className="order-total">
            <div className="subtotal">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="shipping">
              <span>Shipping</span>
              <span>{subtotal >= freeShippingThreshold ? 'Free' : 'Calculated at checkout'}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <p className="tax-note">Taxes and shipping calculated at checkout</p>
          </div>

          {/* Checkout Button */}
          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            CHECK OUT
          </button>
        </div>
      </div>
      
      
    </div>
  );
};

export default ViewCart;