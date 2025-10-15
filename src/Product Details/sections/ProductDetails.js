import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import { fetchProducts } from 'shops-query/src/modules/products/queries/get.js';
import { getShippingCost } from 'shops-query/src/modules/ShippingCost/queries/index.js';
import { addToCart } from 'shops-query/src/modules/cart/index.js';
import { fetchWishlist } from 'shops-query/src/modules/wishlist/queries/get';
import { addToWishlistController, removeFromWishlistController } from 'shops-query/src/modules/wishlist/index.js';
import { useToast } from '../../common/components/Toast.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import ProductSupremeQuality from './ProductSupremeQuality.js';
import YouMightAlsoLike from './YouMightAlsoLike.js';
import '../styles/ProductDetails.css';

// Star rating component
const StarRating = ({ rating = 0, reviewCount = 0 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        className={`star ${i <= rating ? 'filled' : ''}`}
      >
        ★
      </span>
    );
  }
  
  return (
    <div className="star-rating">
      <div className="stars">{stars}</div>
      {reviewCount > 0 ? (
        <span className="review-count">({reviewCount} reviews)</span>
      ) : (
        <span className="no-reviews">No reviews</span>
      )}
    </div>
  );
};

// Loading skeleton for product details
const ProductDetailsSkeleton = () => (
  <div className="product-details-skeleton">
    <div className="product-images-skeleton">
      <div className="main-image-skeleton"></div>
      <div className="thumbnail-images-skeleton">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="thumbnail-skeleton"></div>
        ))}
      </div>
    </div>
    <div className="product-info-skeleton">
      <div className="breadcrumb-skeleton"></div>
      <div className="title-skeleton"></div>
      <div className="rating-skeleton"></div>
      <div className="price-skeleton"></div>
      <div className="description-skeleton"></div>
      <div className="buttons-skeleton">
        <div className="button-skeleton"></div>
        <div className="button-skeleton"></div>
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Tab switching state
  const [tabLoading, setTabLoading] = useState(false);
  const [shippingData, setShippingData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  
  // Zoom functionality state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  
  // Add to cart state
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product) return;
      
      try {
        const wishlistData = await fetchWishlist(HOME_CONFIG.userId, HOME_CONFIG.shopId);
        const isProductInWishlist = wishlistData?.some(item => item.productId === parseInt(id));
        setIsInWishlist(isProductInWishlist);
      } catch (err) {
        console.error('Error checking wishlist status:', err);
      }
    };

    checkWishlistStatus();
  }, [product, id]);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Scroll to top when product changes
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Get all products from the shop
        const products = await getProductsController(HOME_CONFIG.shopId);
        
        if (products && products.length > 0) {
          // Find the specific product by ID
          const foundProduct = products.find(p => p.id.toString() === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
            
            // If Description tab is active by default, fetch detailed product data
            if (activeTab === 'description') {
              await fetchDetailedProductData(foundProduct.id);
            }
          } else {
            setError('Product not found');
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Auto-fetch description data when product is loaded and description tab is active
  useEffect(() => {
    if (product && activeTab === 'description' && !productDetails && !tabLoading) {
      fetchDetailedProductData(product.id);
    }
  }, [product, activeTab, productDetails, tabLoading]);

  // Fetch detailed product data for tabs
  const fetchDetailedProductData = async (productId) => {
    try {
      setTabLoading(true);
      
      // Fetch detailed product data using direct GraphQL query by product ID
      const detailedProduct = await fetchProducts({ productId: productId });
      
      if (detailedProduct) {
        setProductDetails(detailedProduct);
      }
      
    } catch (err) {
      // Handle error silently
    } finally {
      setTabLoading(false);
    }
  };

  // Handle tab switching - refetch product details when Description tab is selected
  const handleTabSwitch = async (tabName) => {
    setActiveTab(tabName);
    
    if (tabName === 'description' && product?.id) {
      // Always fetch fresh product description data when Description tab is selected
      await fetchDetailedProductData(product.id);
    }
    
    // If switching to shipping tab and shipping data not loaded, fetch it
    if (tabName === 'shipping' && !shippingData && product) {
      try {
        setTabLoading(true);
        const shipping = await getShippingCost(HOME_CONFIG.shopId);
        setShippingData(shipping);
      } catch (err) {
        // Handle error silently
      } finally {
        setTabLoading(false);
      }
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwQzIxMCAyMDAgMTc4IDIzMiAxNzggMjcyQzE4NSAyNjUgMTk1IDI2MCAyMDYgMjYwQzIxNyAyNjAgMjI3IDI2NSAyMzQgMjcyQzIzOSAyNzcgMjQ5IDI3NyAyNTQgMjcyQzI2MSAyNjUgMjcxIDI2MCAyODIgMjYwQzI5MyAyNjAgMzAzIDI2NSAzMTAgMjcyQzMxMCAyMzIgMjkwIDIwMCAyNTAgMjAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8cGF0aCBkPSJNMzMwIDMwMEMzMjUgMzAwIDMyMiAyOTkgMzE5IDI5N0MzMTMgMjk1IDMwNiAyOTUgMzAwIDI5N0MyOTcgMjk4IDI5NCAzMDAgMjkwIDMwMEMyODYgMzAwIDI4MyAyOTkgMjgwIDI5N0MyNzQgMjk1IDI2NyAyOTUgMjYxIDI5N0MyNTggMjk4IDI1NSAzMDAgMjUxIDMwMEMyNDcgMzAwIDI0NCAyOTkgMjQxIDI5N0MyMzUgMjk1IDIyOCAyOTUgMjIyIDI5N0MyMjkgMzEwIDI0NSAzMjAgMjY1IDMxOEMyODUgMzE2IDMwMiAzMDYgMzEwIDI5MEMzMTUgMjk1IDMyMCAyOTggMzI1IDMwMEMzMjQgMzAxIDMyMiAzMDEgMzMwIDMwMFoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==';
  };

  // Format price
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Check if product has discount
  const hasDiscount = (product) => {
    return product.originalPrice && product.discountedPrice && 
           parseFloat(product.originalPrice) > parseFloat(product.discountedPrice);
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, discountedPrice) => {
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Get product images
  const getProductImages = (product) => {
    const images = [];
    
    // Add product images if they exist
    if (product.productImage && product.productImage.length > 0) {
      product.productImage.forEach(img => {
        if (img.image) {
          images.push(`${IMAGE_PREFIX}${img.image}`);
        }
      });
    }
    
    // Add feature image as fallback
    if (product.featureImage && images.length === 0) {
      images.push(`${IMAGE_PREFIX}${product.featureImage}`);
    }
    
    // Default placeholder if no images
    if (images.length === 0) {
      images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwQzIxMCAyMDAgMTc4IDIzMiAxNzggMjcyQzE4NSAyNjUgMTk1IDI2MCAyMDYgMjYwQzIxNyAyNjAgMjI3IDI2NSAyMzQgMjcyQzIzOSAyNzcgMjQ5IDI3NyAyNTQgMjcyQzI2MSAyNjUgMjcxIDI2MCAyODIgMjYwQzI5MyAyNjAgMzAzIDI2NSAzMTAgMjcyQzMxMCAyMzIgMjkwIDIwMCAyNTAgMjAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8cGF0aCBkPSJNMzMwIDMwMEMzMjUgMzAwIDMyMiAyOTkgMzE5IDI5N0MzMTMgMjk1IDMwNiAyOTUgMzAwIDI5N0MyOTcgMjk4IDI5NCAzMDAgMjkwIDMwMEMyODYgMzAwIDI4MyAyOTkgMjgwIDI5N0MyNzQgMjk1IDI2NyAyOTUgMjYxIDI5N0MyNTggMjk4IDI1NSAzMDAgMjUxIDMwMEMyNDcgMzAwIDI0NCAyOTkgMjQxIDI5N0MyMzUgMjk1IDIyOCAyOTUgMjIyIDI5N0MyMjkgMzEwIDI0NSAzMjAgMjY1IDMxOEMyODUgMzE2IDMwMiAzMDYgMzEwIDI5MEMzMTUgMjk1IDMyMCAyOTggMzI1IDMwMEMzMjQgMzAxIDMyMiAzMDEgMzMwIDMwMFoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==');
    }
    
    return images;
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      if (!product) {
        showToastMessage('Product not found', 'error');
        return;
      }

      // Prevent multiple clicks during loading
      if (addToCartLoading) {
        return;
      }

      setAddToCartLoading(true);

      const cartData = {
        userId: HOME_CONFIG.userId,
        shopId: HOME_CONFIG.shopId,
        productId: product.id,
        quantity: quantity
      };
      
      // Simulate API call delay to show loading animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the addToCart API
      const result = await addToCart(cartData);
      
      if (result) {
        showToastMessage(`Only ${quantity} item was added to your cart due to availability.`, 'success');
      } else {
        showToastMessage('Failed to add item to cart', 'error');
      }
    } catch (error) {
      // Handle specific error messages
      if (error.message && error.message.includes('Failed to verify item in cart after add operation')) {
        showToastMessage('Item is already in your cart or cart limit reached.', 'error');
      } else if (error.message && error.message.includes('Failed to add to cart')) {
        showToastMessage('Failed to add item to cart. Please try again.', 'error');
      } else {
        showToastMessage('Failed to add item to cart. Please try again.', 'error');
      }
    } finally {
      setAddToCartLoading(false);
    }
  };

  // Show toast message
  const showToastMessage = (message, type = 'success') => {
    if (type === 'success') {
      showSuccess(message);
    } else if (type === 'error') {
      showError(message);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;
    
    // Prevent multiple clicks
    if (wishlistLoading) return;
    
    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlistController({
          userId: HOME_CONFIG.userId,
          productId: product.id,
          shopId: HOME_CONFIG.shopId
        });
        
        setIsInWishlist(false);
        showToastMessage(`${product?.name || 'Product'} removed from wishlist!`, 'success');
      } else {
        // Add to wishlist
        await addToWishlistController(
          product.id,
          HOME_CONFIG.shopId,
          HOME_CONFIG.userId
        );
        
        setIsInWishlist(true);
        showToastMessage(`${product?.name || 'Product'} added to wishlist!`, 'success');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToastMessage('Failed to update wishlist. Please try again.', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    showToastMessage(`Proceeding to checkout with ${quantity} item(s)!`, 'success');
  };

  // Zoom functionality handlers
  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentages for zoom positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Constrain zoom position to prevent going outside bounds
    const constrainedX = Math.max(0, Math.min(100, xPercent));
    const constrainedY = Math.max(0, Math.min(100, yPercent));
    
    setZoomPosition({ x: constrainedX, y: constrainedY });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    setIsZooming(true);
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    const constrainedX = Math.max(0, Math.min(100, xPercent));
    const constrainedY = Math.max(0, Math.min(100, yPercent));
    
    setZoomPosition({ x: constrainedX, y: constrainedY });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isZooming) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    const constrainedX = Math.max(0, Math.min(100, xPercent));
    const constrainedY = Math.max(0, Math.min(100, yPercent));
    
    setZoomPosition({ x: constrainedX, y: constrainedY });
  };

  const handleTouchEnd = () => {
    setIsZooming(false);
  };

  // Strip HTML tags from description for the summary view
  const getPlainTextDescription = (htmlString) => {
    if (!htmlString) return "";
    // Remove HTML tags and decode entities
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || "";
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-details-container">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="product-details-error">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <button 
            className="back-to-home-button"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages(product);
  const isDiscounted = hasDiscount(product);
  const currentPrice = isDiscounted ? product.discountedPrice : (product.prize || product.originalPrice || product.discountedPrice);
  const originalPrice = product.originalPrice;

  return (
    <div className="product-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
        <span className="breadcrumb-separator">&gt;</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-details-content">
        {/* Product Images Section */}
        <div className="product-images-section">
          <div 
            className={`main-image-container ${isZooming ? 'zooming' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="main-product-image"
              onError={handleImageError}
              style={{
                transform: isZooming 
                  ? `scale(2.5)`
                  : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail-container ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="thumbnail-image"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Information Panel */}
        <div className="product-info-panel">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <button 
              className={`favorite-button ${isInWishlist ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart className={`heart-icon ${isInWishlist ? 'filled' : ''}`} />
            </button>
          </div>
          
          {/* Rating */}
          <StarRating rating={4} reviewCount={0} />
          
          {/* Price Section */}
          <div className="pd-price-section">
            <span className="pd-current-price">{formatPrice(currentPrice)}</span>
            {isDiscounted && (
              <>
                <span className="pd-original-price">{formatPrice(originalPrice)}</span>
                <span className="pd-discount-badge">
                  SAVE {getDiscountPercentage(originalPrice, product.discountedPrice)}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="product-description">
            <p>
              {getPlainTextDescription(product.description) || 
               "Cheer on your favorite red and white team in eye-popping style with these red & white striped game bib overalls! Each pair is made of 100 percent cotton for a comfortable, breathable fit regardless of the weather and includ..."}
            </p>
          </div>

          {/* Purchase Buttons */}
          <div className="purchase-buttons">
            <div className="quantity-and-cart-row">
              <div className="quantity-selector">
                <button 
                  className="product-quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                  min="1"
                />
                <button 
                  className="product-quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              <button 
                className="pd-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={addToCartLoading}
              >
                {addToCartLoading ? (
                  <span className="loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                ) : (
                  <>
                    <span className="pd-btn-text">ADD TO CART</span>
                    <span className="pd-btn-text-hidden">ADD TO CART</span>
                  </>
                )}
              </button>
            </div>
            <button 
              className="pd-buy-now-btn"
              onClick={handleBuyNow}
            >
              BUY IT NOW
            </button>
          </div>

          {/* Shipping & Return Policy */}
          <div className="policy-section">
            <div className="policy-item">
              <span className="policy-icon">🚚</span>
              <div className="policy-text">
                <strong>Estimate delivery times:</strong> <strong>12-26 days</strong> (International), <strong>3-6 days</strong> (United States).
              </div>
            </div>
            <div className="policy-item">
              <span className="policy-icon">📦</span>
              <div className="policy-text">
                <strong>Return within</strong> <strong>45 days</strong> of purchase. Duties & taxes are non-refundable.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switching Component */}
      <div className="product-tabs-section">
        <div className="product-tabs-header">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('description')}
          >
            Description
          </button>
          <button 
            className={`tab-button ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('shipping')}
          >
            Shipping & return
          </button>
        </div>

        <div className="tab-content">
          {tabLoading && (
            <div className="tab-loading">
              <p>Loading...</p>
            </div>
          )}

          {!tabLoading && activeTab === 'description' && (
            <div className="description-content">
              {/* Product Description - Only from backend data */}
              {productDetails?.description && (
                <div className="description-section">
                  <div dangerouslySetInnerHTML={{ 
                    __html: productDetails.description 
                  }} />
                </div>
              )}
              
              {/* Product Specifications - Only from backend data */}
              {productDetails?.specification && (
                <div className="specifications-section">
                  <h3>Product Specifications</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: productDetails.specification 
                  }} />
                </div>
              )}
              
              {/* How to Use - Only from backend data */}
              {productDetails?.howToUse && productDetails.howToUse.trim() && (
                <div className="features-section">
                  <h3>How to Use</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: productDetails.howToUse 
                  }} />
                </div>
              )}
              
              {/* Other Information - Only from backend data */}
              {productDetails?.otherInformation && productDetails.otherInformation.trim() && (
                <div className="features-section">
                  <h3>Additional Information</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: productDetails.otherInformation 
                  }} />
                </div>
              )}

              {/* Message when no backend data is available */}
              {!productDetails?.description && !productDetails?.specification && 
               !productDetails?.howToUse && !productDetails?.otherInformation && (
                <div className="no-description-message">
                  <p>Product description is not available at this time.</p>
                </div>
              )}
            </div>
          )}

          {!tabLoading && activeTab === 'shipping' && (
            <div className="shipping-content">
              {shippingData && shippingData.length > 0 ? (
                <div className="shipping-info-detailed">
                  <h3>Shipping Information</h3>
                  {shippingData.map((shipping, index) => (
                    <div key={index} className="shipping-tier">
                      <p>
                        <strong>Orders {shipping.purchaseRange}:</strong> 
                        {shipping.price === 0 ? ' Free shipping' : ` ₹${shipping.price} shipping cost`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="shipping-info-default">
                  <p>For all orders exceeding a value of 100USD shipping is offered for free.</p>
                </div>
              )}
              
              <div className="return-policy">
                <h3>Return Policy</h3>
                <p>
                  Returns will be accepted for up to 45 days of Customer's receipt or tracking number on unworn items. 
                  You, as a Customer, are obliged to inform us via email before you return the item.
                </p>
                <p>
                  Otherwise, standard shipping charges apply. Check out our delivery{' '}
                  <a href="/terms" className="terms-link">Terms & Conditions</a> for more details.
                </p>
              </div>
              
              {/* Estimate delivery information */}
              <div className="delivery-estimate">
                <h3>Delivery Estimates</h3>
                <p><strong>International:</strong> 12-26 days</p>
                <p><strong>United States:</strong> 3-6 days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Supreme Quality Section */}
      <ProductSupremeQuality 
        product={product} 
        productId={id}
      />

      {/* You Might Also Like Section */}
      <YouMightAlsoLike 
        currentProductId={id}
        shopId={HOME_CONFIG.shopId}
      />
    </div>
  );
};

export default ProductDetails;