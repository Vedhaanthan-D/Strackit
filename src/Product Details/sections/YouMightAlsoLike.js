import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiSearch } from 'react-icons/fi';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import { addProductToCart, getProductCartStatus } from '../../common/utils/cartUtils';
import { useToast } from '../../common/components/Toast';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import '../styles/YouMightAlsoLike.css';

// Arrow icons for navigation
const ChevronLeft = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Loading skeleton component
const ProductCardSkeleton = () => (
  <div className="you-might-like-card-skeleton">
    <div className="you-might-like-image-skeleton"></div>
    <div className="you-might-like-content-skeleton">
      <div className="you-might-like-name-skeleton"></div>
      <div className="you-might-like-price-skeleton"></div>
    </div>
  </div>
);

const YouMightAlsoLike = ({ currentProductId, shopId = HOME_CONFIG.shopId }) => {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [featureImages, setFeatureImages] = useState({}); // Cache for feature images
  const [addingToCart, setAddingToCart] = useState({}); // Track loading state for each product
  const [cartSuccess, setCartSuccess] = useState({}); // Track success state for each product
  const [cartQuantities, setCartQuantities] = useState({}); // Track cart quantities for each product
  const scrollContainerRef = useRef(null);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all products from the shop
        const allProducts = await getProductsController(shopId);
        
        if (allProducts && allProducts.length > 0) {
          // Filter out current product and only include published products
          let filteredProducts = allProducts
            .filter(product => 
              product && 
              product.publish && 
              product.id.toString() !== currentProductId?.toString()
            );

          // Shuffle products for variety
          filteredProducts = shuffleArray(filteredProducts);

          // Limit to 8 products for carousel
          const relatedProducts = filteredProducts.slice(0, 8);
          
          setProducts(relatedProducts);
          setError(null);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError('Failed to load related products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, shopId]);

  // Clear success states when component unmounts
  useEffect(() => {
    return () => {
      setCartSuccess({});
      setAddingToCart({});
    };
  }, []);

  // Check cart status for all products when they load
  useEffect(() => {
    const checkCartStatus = async () => {
      if (products.length > 0) {
        const quantities = {};
        
        for (const product of products) {
          try {
            const status = await getProductCartStatus(product, 'youmightalsolike');
            const productKey = product.id || product.productId;
            quantities[productKey] = status.quantity;
          } catch (error) {
            // Silently handle errors
          }
        }
        
        setCartQuantities(quantities);
      }
    };

    checkCartStatus();
  }, [products]);

  // Listen for cart updates to refresh quantities
  useEffect(() => {
    const handleCartUpdate = (event) => {
      const { action, productId } = event.detail;
      
      if (action === 'add' || action === 'update_quantity') {
        // Refresh cart quantities for all products
        const checkCartStatus = async () => {
          const quantities = {};
          
          for (const product of products) {
            try {
              const status = await getProductCartStatus(product, 'youmightalsolike');
              const productKey = product.id || product.productId;
              quantities[productKey] = status.quantity;
            } catch (error) {
              // Silently handle errors
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

  // Shuffle array for randomized recommendations
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check if product has discount (improved dynamic detection)
  const hasDiscount = (product) => {
    // Check multiple price field combinations
    const originalPrice = parseFloat(product.originalPrice || 0);
    const discountedPrice = parseFloat(product.discountedPrice || 0);
    const prize = parseFloat(product.prize || 0);
    const viewPrice = parseFloat(product.viewPrice || 0);
    const price = parseFloat(product.price || 0);
    const discountField = parseFloat(product.discount || 0);
    
    // Method 1: originalPrice vs discountedPrice
    const hasOriginalVsDiscounted = originalPrice > 0 && discountedPrice > 0 && originalPrice > discountedPrice;
    
    // Method 2: Check discount field
    const hasDiscountField = discountField > 0;
    
    // Method 3: If we have specific original and discounted fields
    const hasBothPriceFields = product.originalPrice && product.discountedPrice;
    
    const result = hasOriginalVsDiscounted || hasDiscountField;
    
    // Console log for debugging
    console.log(`Product ${product.name} discount check:`, {
      originalPrice,
      discountedPrice,
      prize,
      viewPrice,
      price,
      discountField,
      hasOriginalVsDiscounted,
      hasDiscountField,
      hasBothPriceFields,
      result
    });
    
    return result;
  };

  // Calculate discount percentage for display
  const getDiscountPercentage = (product) => {
    const originalPrice = parseFloat(product.originalPrice || product.prize || product.viewPrice || 0);
    const discountedPrice = parseFloat(product.discountedPrice || product.price || 0);
    
    if (originalPrice > 0 && discountedPrice > 0 && originalPrice > discountedPrice) {
      return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
    
    // Fallback to discount field
    if (product.discount) {
      return Math.round(parseFloat(product.discount));
    }
    
    return 0;
  };

  // Format price (improved to handle different currencies and edge cases)
  const formatPrice = (price) => {
    const numPrice = parseFloat(price || 0);
    
    // Handle zero or invalid prices
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Price not available';
    }
    
    // Check if price looks like Indian Rupees (typically larger numbers)
    if (numPrice >= 100) {
      return `₹${numPrice.toFixed(0)}`;
    } else if (numPrice > 0) {
      return `$${numPrice.toFixed(2)}`;
    } else {
      return 'Contact for price';
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNjQuMzc1IDEyNSAxMzggMTI1SDE1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTE5OCAxODYuMjVDMTk1LjE4OCAxODYuMjUgMTkzLjMxMiAxODUuODEyIDE5MS40MzggMTg0LjgxMkMxODcuMTg4IDE4My4zNzUgMTgyLjUgMTgzLjM3NSAxNzguMjUgMTg0LjgxMkMxNzYuMzc1IDE4NS4zNzUgMTc0LjUgMTg2LjI1IDE3MiAxODYuMjVDMTY5LjUgMTg2LjI1IDE2Ny42MjUgMTg1LjgxMiAxNjUuNzUgMTg0LjgxMkMxNjEuNSAxODMuMzc1IDE1Ni44MTIgMTgzLjM3NSAxNTIuNTYyIDE4NC44MTJDMTUwLjY4OCAxODUuMzc1IDE0OC44MTIgMTg2LjI1IDE0Ni4zMTIgMTg2LjI1QzE0My44MTIgMTg2LjI1IDE0MS45MzggMTg1LjgxMiAxNDAuMDYyIDE4NC44MTJDMTM1LjgxMiAxODMuMzc1IDEzMS4xMjUgMTgzLjM3NSAxMjYuODc1IDE4NC44MTJDMTI1IDE4NS4zNzUgMTIzLjEyNSAxODYuMjUgMTIwLjYyNSAxODYuMjVDMTE4LjEyNSAxODYuMjUgMTE2LjI1IDE4NS44MTIgMTE0LjM3NSAxODQuODEyQzExMC4xMjUgMTgzLjM3NSAxMDUuNDM4IDE4My4zNzUgMTAxLjE4OCAxODQuODEyQzk5LjMxMjUgMTg1LjM3NSA5Ny40Mzc1IDE4Ni4yNSA5NSAxODYuMjVDOTIuNTYyNSAxODYuMjUgOTAuNjg3NSAxODUuODEyIDg4LjgxMjUgMTg0LjgxMkM4NC41NjI1IDE4My4zNzUgNzkuODc1IDE4My4zNzUgNzUuNjI1IDE4NC44MTJDNC4xODc1IDE4NS4zNzUgNzIuMzEyNSAxODYuMjUgNjkuODEyNSAxODYuMjVDNjcuMzEyNSAxODYuMjUgNjUuNDM3NSAxODUuODEyIDYzLjU2MjUgMTg0LjgxMkM1OS4zMTI1IDE4My4zNzUgNTQuNjI1IDE4My4zNzUgNTAuMzc1IDE4NC44MTJDMTU0IDE4NS44MTIgMTQ0IDIwMS42ODggMTU4IDE5OS4zMTJDMTcyIDE5Ni45MzggMTgzLjM3NSAxODcuNTYyIDE4OCAxNzMuMjVDMTkxLjI1IDE3Ny4wNjIgMTk1LjE4OCAxNzkuODc1IDIwMCAxODEuM0MxOTkuNSAxODIuNzUgMTk5IDE4NC42MjUgMTk4IDE4Ni4yNVoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==';
  };

  // Handle product click
  const handleProductClick = (product, e) => {
    // Don't navigate if cart button was clicked
    if (e.target.closest('.cart-button') || e.target.closest('.cart-icon-container')) {
      return;
    }
    
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  // Handle product hover to load feature image
  const handleProductHover = async (product) => {
    if (!product || !product.featureImage || featureImages[product.id]) {
      setHoveredProductId(product?.id || null);
      return;
    }

    setHoveredProductId(product.id);
    
    // Preload the feature image
    if (product.featureImage && !featureImages[product.id]) {
      const img = new Image();
      img.onload = () => {
        setFeatureImages(prev => ({
          ...prev,
          [product.id]: `${IMAGE_PREFIX}${product.featureImage}`
        }));
      };
      img.onerror = () => {
        // If feature image fails to load, mark as failed so we don't retry
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

  // Handle adding product to cart
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!product) {
      showSuccess('Unable to add product to cart: Invalid product data');
      return;
    }

    const stateKey = product.id || product.productId;
    if (!stateKey) {
      showSuccess('Unable to add product to cart: Missing product identifier');
      return;
    }

    if (addingToCart[stateKey]) {
      return;
    }

    setAddingToCart(prev => ({ ...prev, [stateKey]: true }));
    
    try {
      const result = await addProductToCart(product, 'youmightalsolike', 1);
      
      if (result.success) {
        setCartSuccess(prev => ({ ...prev, [stateKey]: true }));
        
        // Show toast notification
        if (result.action === 'quantity_updated') {
          showSuccess(`${product.name} quantity updated to ${result.newQuantity} in cart`);
        } else if (result.action === 'item_added') {
          showSuccess(`${product.name} added to cart`);
        }
        
        // Clear success message after 2 seconds
        setTimeout(() => {
          setCartSuccess(prev => ({ ...prev, [stateKey]: false }));
        }, 2000);
        
      } else {
        throw new Error(result.error || 'Failed to add to cart');
      }
      
    } catch (error) {
      const errorMessage = error.message || 'Unknown error occurred';
      showSuccess(`Failed to add ${product.name || 'product'} to cart. Error: ${errorMessage}. Please try again.`);
      
    } finally {
      setAddingToCart(prev => ({ ...prev, [stateKey]: false }));
    }
  };

  // Check scroll position and update button states and current index
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      // Calculate which card is currently most visible
      const cardElements = scrollContainerRef.current.querySelectorAll('.you-might-also-like-card');
      if (cardElements.length > 0) {
        const cardWidth = cardElements[0].offsetWidth;
        const gap = 24;
        
        // Calculate which card is most visible in the viewport
        const visibleIndex = Math.round(scrollLeft / (cardWidth + gap));
        if (visibleIndex !== currentIndex && visibleIndex >= 0 && visibleIndex < products.length) {
          setCurrentIndex(visibleIndex);
        }
      }
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Get the width of a single card including gap
      const cardElements = scrollContainerRef.current.querySelectorAll('.you-might-also-like-card, .you-might-like-card-skeleton');
      if (cardElements.length > 0) {
        const cardWidth = cardElements[0].offsetWidth;
        const gap = 24; // This should match the gap in your CSS
        const scrollAmount = cardWidth + gap;
        
        scrollContainerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Get the width of a single card including gap
      const cardElements = scrollContainerRef.current.querySelectorAll('.you-might-also-like-card, .you-might-like-card-skeleton');
      if (cardElements.length > 0) {
        const cardWidth = cardElements[0].offsetWidth;
        const gap = 24; // This should match the gap in your CSS
        const scrollAmount = cardWidth + gap;
        
        scrollContainerRef.current.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // Update scroll buttons when products change
  useEffect(() => {
    if (!loading && products.length > 0) {
      setTimeout(checkScrollButtons, 100);
    }
  }, [loading, products]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, []);

  // Don't render if no products or if it's loading and no products yet
  if ((!loading && products.length === 0) || error) {
    return null;
  }

  return (
    <div className="you-might-also-like">
      <div className="you-might-also-like-container">
        {/* Header */}
        <h2 className="you-might-also-like-title">You Might Also Like</h2>

        {/* Products Carousel */}
        <div className="you-might-also-like-carousel">
          {/* Left Arrow */}
          <button 
            className={`carousel-arrow carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>

          {/* Products Container */}
          <div className="you-might-also-like-products" ref={scrollContainerRef}>
            {loading ? (
              // Loading skeletons
              [...Array(4)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : (
              // Actual products
              products.map((product, index) => {
                const isDiscounted = hasDiscount(product);
                const discountPercentage = getDiscountPercentage(product);
                
                // Better pricing logic
                let currentPrice, originalPrice;
                
                if (isDiscounted) {
                  // If discounted, try to get both prices
                  currentPrice = parseFloat(product.discountedPrice || product.price || product.prize || product.viewPrice || 0);
                  originalPrice = parseFloat(product.originalPrice || product.prize || product.viewPrice || currentPrice);
                } else {
                  // If not discounted, use the main price
                  currentPrice = parseFloat(product.prize || product.viewPrice || product.price || product.originalPrice || 0);
                  originalPrice = currentPrice;
                }

                console.log(`Product ${product.name} pricing:`, {
                  isDiscounted,
                  currentPrice,
                  originalPrice,
                  productData: {
                    prize: product.prize,
                    viewPrice: product.viewPrice,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    discountedPrice: product.discountedPrice
                  }
                });

                return (
                  <div 
                    key={product.id} 
                    className="you-might-also-like-card"
                    onMouseEnter={() => handleProductHover(product)}
                    onMouseLeave={handleProductHoverOut}
                    onClick={(e) => handleProductClick(product, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Dynamic Sale Badge */}
                    {(isDiscounted || index === 0) && (
                      <div className="sale-badge" data-discount={index === 0 ? 'Sale' : (discountPercentage > 0 ? `${discountPercentage}% OFF` : 'Sale')}>
                        <span className="sale-text">
                          {index === 0 ? 'Sale' : (discountPercentage > 0 ? `${discountPercentage}% OFF` : 'Sale')}
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="you-might-also-like-image-container">
                      <img
                        src={getCurrentImage(product)}
                        alt={product.name}
                        className="you-might-also-like-image"
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
                            <div className="spinner"></div>
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

                    {/* Product Info */}
                    <div className="you-might-also-like-content">
                      <h3 className="you-might-also-like-name">{product.name}</h3>
                      <div className="you-might-also-like-price">
                        <span className="current-price">{formatPrice(currentPrice)}</span>
                        {isDiscounted && (
                          <span className="original-price">{formatPrice(originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Arrow */}
          <button 
            className={`carousel-arrow carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Pagination Dots */}
        {products.length > 4 && (
          <div className="carousel-dots">
            {Array.from({ length: products.length }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    // Get the width of a single card including gap
                    const cardElements = scrollContainerRef.current.querySelectorAll('.you-might-also-like-card');
                    if (cardElements.length > 0) {
                      const cardWidth = cardElements[0].offsetWidth;
                      const gap = 24; // This should match the gap in your CSS
                      const scrollAmount = index * (cardWidth + gap);
                      
                      scrollContainerRef.current.scrollTo({
                        left: scrollAmount,
                        behavior: 'smooth'
                      });
                      setCurrentIndex(index);
                    }
                  }
                }}
                aria-label={`Go to product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouMightAlsoLike;