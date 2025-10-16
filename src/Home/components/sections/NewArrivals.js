import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import { getProductsController } from 'shops-query/src/modules/products/index';
import { fetchCouponCode } from 'shops-query/src/modules/CouponCode/index';
import { addProductToCart, getProductCartStatus } from '../../../common/utils/cartUtils';
import { useToast } from '../../../common/components/Toast';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../../config/appIds';
import '../styles/NewArrivals.css';

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="new-arrivals-product-skeleton">
    <div className="new-arrivals-product-skeleton-image"></div>
    <div className="new-arrivals-product-info">
      <div className="new-arrivals-product-skeleton-title"></div>
      <div className="new-arrivals-product-skeleton-price"></div>
    </div>
  </div>
);

const NewArrivals = ({ 
  title = "NEW ARRIVALS", 
  subtitle = "",
  limit = 8,
  sortNewest = true
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [featureImages, setFeatureImages] = useState({}); // Cache for feature images
  const [addingToCart, setAddingToCart] = useState({}); // Track loading state for each product
  const [cartSuccess, setCartSuccess] = useState({}); // Track success state for each product
  const [cartQuantities, setCartQuantities] = useState({}); // Track cart quantities for each product
  const [coupons, setCoupons] = useState([]);  // Store available coupons
  const scrollContainerRef = useRef(null);
  const { showSuccess, showError } = useToast();

  // Helper function to check if product has discount
  const hasDiscount = (product) => {
    // If product has discount field with value greater than 0
    if (product.discount && parseFloat(product.discount) > 0) {
      return true;
    }
    
    // Check if originalPrice and discountedPrice exist and originalPrice is higher
    if (product.originalPrice && product.discountedPrice && 
        parseFloat(product.originalPrice) > parseFloat(product.discountedPrice)) {
      return true;
    }
    
    // Check if prize (current price) and originalPrice exist and originalPrice is higher
    if (product.prize && product.originalPrice && 
        parseFloat(product.originalPrice) > parseFloat(product.prize)) {
      return true;
    }
    
    return false;
  };

  // Calculate discounted price based on original price and discount percentage
  const calculateDiscountedPrice = (product) => {
    if (!product.prize) return 0;
    
    const originalPrice = parseFloat(product.prize);
    
    // If product has a discount percentage, apply it
    if (product.discount && parseFloat(product.discount) > 0) {
      const discountPercent = parseFloat(product.discount);
      const discountAmount = originalPrice * (discountPercent / 100);
      return Math.round(originalPrice - discountAmount);
    }
    
    // If product has discountedPrice field, use it
    if (product.discountedPrice) {
      return parseFloat(product.discountedPrice);
    }
    
    return originalPrice;
  };

  const formatPrice = (price) => {
    if (!price) return "₹0.00";
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNzEuODc1IDEyNSAxNTAgMTI1WiIgZmlsbD0iI0QxRDFEMSIvPgo8cGF0aCBkPSJNMTk4IDE4Ni4yNUMxOTUuMTg4IDE4Ni4yNSAxOTMuMzEyIDE4NS44MTIgMTkxLjQzOCAxODQuODEyQzE4Ny4xODggMTgzLjM3NSAxODIuNSAxODMuMzc1IDE3OC4yNSAxODQuODEyQzE3Ni4zNzUgMTg1LjM3NSAxNzQuNSAxODYuMjUgMTcyIDE4Ni4yNUMxNjkuNSAxODYuMjUgMTY3LjYyNSAxODUuODEyIDE2NS43NSAxODQuODEyQzE2MS41IDE4My4zNzUgMTU2LjgxMiAxODMuMzc1IDE1Mi41NjIgMTg0LjgxMkMxNTAuNjg4IDE4NS4zNzUgMTQ4LjgxMiAxODYuMjUgMTQ2LjMxMiAxODYuMjVDMTQzLjgxMiAxODYuMjUgMTQxLjkzOCAxODUuODEyIDE0MC4wNjIgMTg0LjgxMkMxMzUuODEyIDE4My4zNzUgMTMxLjEyNSAxODMuMzc1IDEyNi44NzUgMTg0LjgxMkMxMzEuNTYyIDE5NS42MjUgMTQ0IDIwMS42ODggMTU4IDE5OS4zMTJDMTcyIDE5Ni45MzggMTgzLjM3NSAxODcuNTYyIDE4OCAxNzMuMjVDMTkxLjI1IDE3Ny4wNjIgMTk1LjE4OCAxNzkuODc1IDIwMCAxODEuM0MxOTkuNSAxODIuNzUgMTk5IDE4NC42MjUgMTk4IDE4Ni4yNVoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==';
  };

  // Handle product hover to load feature image
  const handleProductHover = async (product) => {
    if (!product || !product.featureImage || featureImages[product.id]) {
      setHoveredProductId(product?.id || null);
      return;
    }

    setHoveredProductId(product.id);
    
    if (product.featureImage && !featureImages[product.id]) {
      const img = new Image();
      img.onload = () => {
        setFeatureImages(prev => ({
          ...prev,
          [product.id]: `${IMAGE_PREFIX}${product.featureImage}`
        }));
      };
      img.onerror = () => {
        setFeatureImages(prev => ({
          ...prev,
          [product.id]: null
        }));
      };
      img.src = `${IMAGE_PREFIX}${product.featureImage}`;
    }
  };

  // Handle product hover out
  const handleProductHoverOut = () => {
    setHoveredProductId(null);
  };

  // Get the current image to display (default or feature on hover)
  const getCurrentImage = (product) => {
    const isHovered = hoveredProductId === product.id;
    const hasFeatureImage = product.featureImage && featureImages[product.id];
    
    if (isHovered && hasFeatureImage) {
      return featureImages[product.id];
    }
    
    // Default image logic
    if (product.productImage && product.productImage.length > 0) {
      return `${IMAGE_PREFIX}${product.productImage[0].image}`;
    } else if (product.featureImage) {
      return `${IMAGE_PREFIX}${product.featureImage}`;
    } else {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNjQuMzc1IDEyNSAxMzggMTI1SDE1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTE5OCAxODYuMjVDMTk1LjE4OCAxODYuMjUgMTkzLjMxMiAxODUuODEyIDE5MS40MzggMTg0LjgxMkMxODcuMTg4IDE4My4zNzUgMTgyLjUgMTgzLjM3NSAxNzguMjUgMTg0LjgxMkMxNzYuMzc1IDE4NS4zNzUgMTc0LjUgMTg2LjI1IDE3MiAxODYuMjVDMTY5LjUgMTg2LjI1IDE2Ny42MjUgMTg1LjgxMiAxNjNS43NSAxODQuODEyQzE2MS41IDE4My4zNzUgMTU2LjgxMiAxODMuMzc1IDE1Mi41NjIgMTg0LjgxMkMxNTAuNjg4IDE4NS4zNzUgMTQ4LjgxMiAxODYuMjUgMTQ2LjMxMiAxODYuMjVDMTQzLjgxMiAxODYuMjUgMTQxLjkzOCAxODUuODEyIDE0MC4wNjIgMTg0LjgxMkMxMzUuODEyIDE4My4zNzUgMTMxLjEyNSAxODMuMzc1IDEyNi44NzUgMTg0LjgxMkMxMzEuNTYyIDE5NS42MjUgMTQ0IDIwMS42ODggMTU4IDE5OS4zMTJDMTcyIDE5Ni45MzggMTgzLjM3NSAxODcuNTYyIDE4OCAxNzMuMjVDMTkxLjI1IDE3Ny4wNjIgMTk1LjE4OCAxNzkuODc1IDIwMCAxODEuM0MxOTkuNSAxODIuNzUgMTk5IDE4NC42MjUgMTk4IDE4Ni4yNVoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==';
    }
  };

  // Handle product navigation to detail page
  const handleProductClick = (product, e) => {
    // Don't navigate if cart button was clicked
    if (e.target.closest('.cart-button') || e.target.closest('.cart-icon-container')) {
      return;
    }
    
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  // Handle adding product to cart
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!product) {
      showError('Unable to add product to cart: Invalid product data');
      return;
    }

    const stateKey = product.id || product.productId;
    if (!stateKey) {
      showError('Unable to add product to cart: Missing product identifier');
      return;
    }

    if (addingToCart[stateKey]) {
      return;
    }

    setAddingToCart(prev => ({ ...prev, [stateKey]: true }));
    
    try {
      const result = await addProductToCart(product, 'newarrivals', 1);
      
      if (result.success) {
        setCartSuccess(prev => ({ ...prev, [stateKey]: true }));
        
        if (result.action === 'quantity_updated') {
          showSuccess(`${product.name} quantity updated to ${result.newQuantity} in cart`);
        } else if (result.action === 'item_added') {
          showSuccess(`${product.name} added to cart`);
        }
        
        setTimeout(() => {
          setCartSuccess(prev => ({ ...prev, [stateKey]: false }));
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Failed to add to cart');
      }
      
    } catch (error) {
      showError(`Failed to add ${product.name || 'product'} to cart`);
    } finally {
      setAddingToCart(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  useEffect(() => {
    return () => {
      setCartSuccess({});
      setAddingToCart({});
    };
  }, []);

  useEffect(() => {
    const checkCartStatus = async () => {
      if (products.length > 0) {
        const quantities = {};
        
        for (const product of products) {
          try {
            const status = await getProductCartStatus(product, 'newarrivals');
            const productKey = product.id || product.productId;
            quantities[productKey] = status.quantity;
          } catch (error) {
            // Skip error
          }
        }
        
        setCartQuantities(quantities);
      }
    };

    checkCartStatus();
  }, [products]);

  useEffect(() => {
    const handleCartUpdate = (event) => {
      const { action } = event.detail;
      
      if (action === 'add' || action === 'update_quantity') {
        const checkCartStatus = async () => {
          const quantities = {};
          
          for (const product of products) {
            try {
              const status = await getProductCartStatus(product, 'newarrivals');
              const productKey = product.id || product.productId;
              quantities[productKey] = status.quantity;
            } catch (error) {
              // Skip error
            }
          }
          
          setCartQuantities(quantities);
        };

        checkCartStatus();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [products]);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        // Fetch products and coupons in parallel
        const [productData, couponData] = await Promise.all([
          getProductsController(HOME_CONFIG.shopId),
          fetchCouponCode(HOME_CONFIG.shopId)
        ]);
        
        // Store coupons for later use
        setCoupons(couponData || []);
        
        if (productData && productData.length > 0) {
          let sortedProducts = [...productData]
            .filter(product => product && product.publish);
          
          if (sortNewest) {
            sortedProducts = sortedProducts.sort((a, b) => {
              const dateA = a.addedon ? new Date(a.addedon) : new Date(0);
              const dateB = b.addedon ? new Date(b.addedon) : new Date(0);
              return dateB - dateA;
            });
          }
          
          sortedProducts = sortedProducts.slice(0, limit);
          
          setProducts(sortedProducts);
          setError(null);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);



  // Show loading state with skeletons
  if (loading) {
    const skeletonCount = 6;
    const shouldCenterSkeletons = skeletonCount <= 4;
    
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-container">
          <div className={`products-grid ${shouldCenterSkeletons ? 'centered-grid' : ''}`} ref={scrollContainerRef}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ProductSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || products.length === 0) {
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-container">
          <div className="products-error">
            <p>Unable to load products. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if products should be centered (4 or fewer products)
  const shouldCenter = products.length <= 4;

  return (
    <div className="new-arrivals-container">
      <div className="new-arrivals-header">
        <h2 className="new-arrivals-title">{title}</h2>
        {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
      </div>
      
      <div className="products-container">
        <div className={`products-grid ${shouldCenter ? 'centered-grid' : ''}`} ref={scrollContainerRef}>
          {products.map((product) => {
            const isDiscounted = hasDiscount(product);
            
            return (
              <div 
                key={product.id} 
                className="new-arrivals-product-card"
                onMouseEnter={() => handleProductHover(product)}
                onMouseLeave={handleProductHoverOut}
                onClick={(e) => handleProductClick(product, e)}
                style={{ cursor: 'pointer' }}
              >
                <div className="new-arrivals-product-image-container">
                  {/* Show sale badge only if product has discount */}
                  {isDiscounted && (
                    <div className="new-arrivals-sale-badge">Sale</div>
                  )}
                  <img
                    src={getCurrentImage(product)}
                    alt={product.name}
                    className="new-arrivals-product-image"
                    onError={handleImageError}
                  />
                  
                  {/* Hover Action Icons */}
                  <div className="product-hover-actions">
                    <button
                      className={`product-action-icon cart-button ${addingToCart[product.id || product.productId] ? 'loading' : ''} ${cartSuccess[product.id || product.productId] ? 'success' : ''}`}
                      tabIndex="0"
                      role="button"
                      aria-label={cartQuantities[product.id || product.productId] > 0 
                        ? `Add more ${product.name} to cart (currently ${cartQuantities[product.id || product.productId]} in cart)` 
                        : `Add ${product.name} to cart`}
                      disabled={addingToCart[product.id || product.productId]}
                      onClick={(e) => handleAddToCart(product, e)}
                      title={cartQuantities[product.id || product.productId] > 0 
                        ? `Currently ${cartQuantities[product.id || product.productId]} in cart - click to add one more` 
                        : 'Add to cart'}
                    >
                      {addingToCart[product.id || product.productId] ? (
                        <div className="new-arrivals-spinner"></div>
                      ) : cartSuccess[product.id || product.productId] ? (
                        <span className="success-check">✓</span>
                      ) : (
                        <FiShoppingBag />
                      )}
                    </button>
                    <button
                      className="product-action-icon"
                      tabIndex="0"
                      role="button"
                      aria-label={`Quick view ${product.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product, e);
                      }}
                    >
                      <FiSearch />
                    </button>
                  </div>
                </div>
                
                <div className="new-arrivals-product-info">
                  <h3 className="new-arrivals-product-name">{product.name}</h3>
                  <div className="new-arrivals-product-price">
                    {isDiscounted ? (
                      <>
                        <span className="new-arrivals-current-price">
                          {formatPrice(calculateDiscountedPrice(product))}
                        </span>
                        <span className="new-arrivals-old-price">
                          {formatPrice(product.prize)}
                        </span>
                      </>
                    ) : (
                      <span className="new-arrivals-current-price">
                        {formatPrice(product.prize || product.originalPrice || product.discountedPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;