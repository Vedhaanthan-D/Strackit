import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiX, FiCopy, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaPinterestP, FaInstagram } from 'react-icons/fa';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import { fetchProducts } from 'shops-query/src/modules/products/queries/get.js';
import { getOfferProductsController } from 'shops-query/src/modules/offerProducts/index.js';
import { fetchCouponCode } from 'shops-query/src/modules/CouponCode/index.js';
import { getShippingCost } from 'shops-query/src/modules/ShippingCost/queries/index.js';
import { addToCart } from 'shops-query/src/modules/cart/index.js';
import { fetchWishlist } from 'shops-query/src/modules/wishlist/queries/get';
import { addToWishlistController, removeFromWishlistController } from 'shops-query/src/modules/wishlist/index.js';
import { useToast } from '../../common/sections/Toast.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import { PRODUCT_LAYOUT_SPACING, BUTTON_TYPOGRAPHY, getSocialMediaUrl, PAGE_LAYOUT_CONFIG, getHorizontalSpacing, getContentGap, getGridRatio } from './productDetailsConfig.js';
import { getProductActions } from './productActionsConfig.js';
import ProductSupremeQuality from './ProductSupremeQuality.js';
import YouMightAlsoLike from './YouMightAlsoLike.js';
import '../styles/ProductDetails.css';

// Star rating component
const StarRating = ({ product, productDetails }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span 
        key={i} 
        className="star"
      >
        ★
      </span>
    );
  }

  // Determine reviews count from a few possible fields
  const reviewsCount = (product && (product.reviewsCount || (product.reviews && product.reviews.length))) ||
                       (productDetails && (productDetails.reviewsCount || (productDetails.reviews && productDetails.reviews.length))) ||
                       0;

  return (
    <div className="star-rating" aria-label={`Rating: ${reviewsCount} reviews`}>
      <div className="stars">{stars}</div>
      <div className="review-text">{reviewsCount === 0 ? 'No reviews' : `${reviewsCount} review${reviewsCount > 1 ? 's' : ''}`}</div>
    </div>
  );
};

// Product Action Buttons Component - Dynamic and Data-Driven
const ProductActionButtons = ({ product, onActionClick }) => {
  // Fetch action buttons from configuration
  // Can optionally filter by product category
  const categorySlug = product?.category?.slug || product?.categorySlug || null;
  const actionButtons = getProductActions(categorySlug);

  const handleButtonClick = (button) => {
    if (onActionClick) {
      onActionClick(button.action, button, product);
    } else {
      // Default actions
      switch (button.action) {
        case 'sizeGuide':
          console.log('Size Guide clicked for:', product.name);
          // Can open modal or navigate to size guide
          break;
        case 'compareColor':
          console.log('Compare Color clicked for:', product.name);
          // Can open color comparison modal
          break;
        case 'askQuestion':
          console.log('Ask Question clicked for:', product.name);
          // Can open contact form or FAQ
          break;
        case 'share':
          console.log('Share clicked for:', product.name);
          // Handle share functionality
          if (navigator.share) {
            navigator.share({
              title: product.name,
              text: product.description,
              url: window.location.href
            }).catch(err => console.log('Share failed:', err));
          } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            console.log('Link copied to clipboard');
          }
          break;
        default:
          console.log('Action clicked:', button.action);
      }
    }
  };

  return (
    <div className="product-action-buttons">
      {actionButtons.map((button) => {
        const IconComponent = button.icon;
        return (
          <button
            key={button.id}
            className="action-button"
            onClick={() => handleButtonClick(button)}
            aria-label={button.ariaLabel}
            title={button.tooltip || button.label}
          >
            <IconComponent className="action-icon" aria-hidden="true" />
            <span className="action-label">{button.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Loading skeleton for product details
const ProductDetailsSkeleton = () => (
  <div className="product-details-skeleton">
    <div className="product-images-skeleton">
      <div className="main-image-skeleton"></div>
      <div className="thumbnail-images-skeleton">
        {[1, 2, 3].map(i => (
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

  const { showSuccess, showError, showWarning } = useToast();
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
  const [addedToCart, setAddedToCart] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const infoRef = useRef(null);
  
  // Wishlist state
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Modal states
  const [showSizeGuideModal, setShowSizeGuideModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyLinkSuccess, setCopyLinkSuccess] = useState(false);

  // Image navigation hover state
  const [showImageNavigation, setShowImageNavigation] = useState(false);

  // Discount and offer state
  const [offerProducts, setOfferProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [dynamicPricing, setDynamicPricing] = useState({
    originalPrice: null,
    discountedPrice: null,
    discountPercentage: null,
    hasDiscount: false
  });

  // Simple scroll-based floating cart visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Show floating cart when scrolled more than 300px
      const shouldShow = scrollY > 300 && !addedToCart;
      
      // console.log('Scroll position:', {
      //   scrollY,
      //   shouldShow,
      //   addedToCart
      // });
      
      setShowFloatingCart(shouldShow);
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [addedToCart]);

  // Dynamic spacing configuration - Set CSS variables from config
  useEffect(() => {
    const updateSpacingVariables = () => {
      const screenWidth = window.innerWidth;
      const root = document.documentElement;
      
      // Get spacing values from configuration
      let actionMenuGap;
      if (screenWidth < 768) {
        actionMenuGap = PRODUCT_LAYOUT_SPACING.actionMenuToPurchaseGap.mobile;
      } else if (screenWidth < 1024) {
        actionMenuGap = PRODUCT_LAYOUT_SPACING.actionMenuToPurchaseGap.tablet;
      } else {
        actionMenuGap = PRODUCT_LAYOUT_SPACING.actionMenuToPurchaseGap.desktop;
      }
      
      // Set CSS custom properties dynamically for spacing
      root.style.setProperty('--action-menu-to-purchase-gap', `${actionMenuGap}px`);
      
      // Set button typography CSS variables from configuration
      root.style.setProperty('--button-letter-spacing', BUTTON_TYPOGRAPHY.letterSpacing);
      root.style.setProperty('--button-font-size', BUTTON_TYPOGRAPHY.fontSize);
      root.style.setProperty('--button-font-weight', BUTTON_TYPOGRAPHY.fontWeight);
      root.style.setProperty('--button-font-family', BUTTON_TYPOGRAPHY.fontFamily);
      root.style.setProperty('--button-text-transform', BUTTON_TYPOGRAPHY.textTransform);
      
      // Set page layout CSS variables from configuration (NEW)
      const horizontalSpacing = getHorizontalSpacing(screenWidth);
      const contentGap = getContentGap(screenWidth);
      const gridRatio = getGridRatio(screenWidth);
      
      root.style.setProperty('--page-horizontal-spacing', `${horizontalSpacing}px`);
      root.style.setProperty('--content-gap', `${contentGap}px`);
      root.style.setProperty('--grid-template-columns', gridRatio);
      
      // Set max content width if enabled
      if (PAGE_LAYOUT_CONFIG.maxContentWidth.enabled) {
        root.style.setProperty('--max-content-width', `${PAGE_LAYOUT_CONFIG.maxContentWidth.maxWidth}px`);
      }
    };

    // Initial setup
    updateSpacingVariables();

    // Update on window resize
    window.addEventListener('resize', updateSpacingVariables);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateSpacingVariables);
    };
  }, []);

  // Helper function to check if product has discount (similar to New Arrivals)
  const hasProductDiscount = (product) => {
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

  // Calculate discounted price based on original price and discount percentage (similar to New Arrivals)
  const calculateDiscountedPrice = (product) => {
    if (!product.prize && !product.originalPrice) return 0;
    
    // Use prize as base price (similar to New Arrivals)
    const basePrice = parseFloat(product.prize || product.originalPrice || product.viewPrice || 0);
    
    // If product has a discount percentage, apply it
    if (product.discount && parseFloat(product.discount) > 0) {
      const discountPercent = parseFloat(product.discount);
      const discountAmount = basePrice * (discountPercent / 100);
      return Math.round(basePrice - discountAmount);
    }
    
    // If product has discountedPrice field, use it
    if (product.discountedPrice) {
      return parseFloat(product.discountedPrice);
    }
    
    return basePrice;
  };

  // Fetch offer products and calculate dynamic pricing
  const fetchOfferData = async () => {
    if (!product) return;

    // console.log('Product data for pricing:', {
    //   id: product.id,
    //   name: product.name,
    //   originalPrice: product.originalPrice,
    //   discountedPrice: product.discountedPrice,
    //   prize: product.prize,
    //   viewPrice: product.viewPrice,
    //   discount: product.discount,
    //   fullProduct: product
    // });

    try {
      // Fetch offer products for the current shop
      const offers = await getOfferProductsController(HOME_CONFIG.shopId);
      setOfferProducts(offers);
      console.log('Offers fetched:', offers);

      // Check if current product is in offers
      const currentProductOffer = offers.find(offer => offer.productId === product.id);
      console.log('Current product offer:', currentProductOffer);
      
      // Fetch coupons for additional discounts
      const shopCoupons = await fetchCouponCode(HOME_CONFIG.shopId);
      setCoupons(shopCoupons);
      console.log('Coupons fetched:', shopCoupons);

      // Calculate pricing similar to New Arrivals
      const isDiscounted = hasProductDiscount(product);
      let originalPrice = parseFloat(product.prize || product.originalPrice || product.viewPrice || 0);
      let discountedPrice = originalPrice;
      let discountPercentage = 0;

      if (isDiscounted) {
        discountedPrice = calculateDiscountedPrice(product);
        
        // If product is in offers, use offer pricing
        if (currentProductOffer) {
          discountedPrice = parseFloat(currentProductOffer.prize || currentProductOffer.viewPrice || discountedPrice);
        }

        // Calculate discount percentage
        if (product.discount && parseFloat(product.discount) > 0) {
          discountPercentage = parseFloat(product.discount);
        } else if (originalPrice && discountedPrice && originalPrice > discountedPrice) {
          discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
        }
      }

      // Apply coupon logic if available
      if (shopCoupons && shopCoupons.length > 0) {
        // Find the best applicable coupon (highest discount value)
        const applicableCoupons = shopCoupons.filter(coupon => 
          coupon.isActive && 
          (!coupon.minOrderAmount || discountedPrice >= parseFloat(coupon.minOrderAmount || 0)) &&
          (!coupon.maxOrderAmount || discountedPrice <= parseFloat(coupon.maxOrderAmount || Infinity)) &&
          coupon.discountValue && parseFloat(coupon.discountValue) > 0
        );
        
        if (applicableCoupons.length > 0) {
          // Sort coupons by discount value and pick the best one
          const bestCoupon = applicableCoupons.reduce((best, current) => {
            const currentDiscount = parseFloat(current.discountValue || 0);
            const bestDiscount = parseFloat(best.discountValue || 0);
            
            if (current.discountType === 'percentage' && best.discountType === 'percentage') {
              return currentDiscount > bestDiscount ? current : best;
            } else if (current.discountType === 'fixed' && best.discountType === 'fixed') {
              return currentDiscount > bestDiscount ? current : best;
            } else if (current.discountType === 'percentage' && best.discountType === 'fixed') {
              const currentDiscountAmount = (discountedPrice * currentDiscount) / 100;
              return currentDiscountAmount > bestDiscount ? current : best;
            } else if (current.discountType === 'fixed' && best.discountType === 'percentage') {
              const bestDiscountAmount = (discountedPrice * bestDiscount) / 100;
              return currentDiscount > bestDiscountAmount ? current : best;
            }
            return best;
          });
          
          console.log('Applying best coupon:', bestCoupon);
          
          if (bestCoupon.discountType === 'percentage') {
            const couponDiscount = (discountedPrice * parseFloat(bestCoupon.discountValue || 0)) / 100;
            discountedPrice = Math.max(discountedPrice - couponDiscount, 0);
          } else if (bestCoupon.discountType === 'fixed') {
            discountedPrice = Math.max(discountedPrice - parseFloat(bestCoupon.discountValue || 0), 0);
          }
          
          // Recalculate discount percentage with coupon applied
          if (originalPrice > discountedPrice) {
            discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
          }
        }
      }

      const hasDiscount = discountPercentage > 0 && originalPrice > discountedPrice;

      setDynamicPricing({
        originalPrice,
        discountedPrice: hasDiscount ? discountedPrice : originalPrice,
        discountPercentage,
        hasDiscount
      });

      console.log('Dynamic pricing calculated:', {
        originalPrice,
        discountedPrice,
        discountPercentage,
        hasDiscount,
        isDiscounted,
        currentProductOffer: !!currentProductOffer,
        totalCouponsAvailable: shopCoupons?.length || 0,
        pricingDetails: {
          basePrice: parseFloat(product.prize || product.originalPrice || 0),
          productDiscount: product.discount,
          finalPrice: discountedPrice,
          savingsAmount: originalPrice - discountedPrice
        }
      });

    } catch (error) {
      console.error('Error fetching offer data:', error);
    }
  };
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

  // Fetch offer data when product changes
  useEffect(() => {
    if (product) {
      fetchOfferData();
    }
  }, [product]);

  // Ensure floating add-to-cart is visible on small screens once product is loaded
  useEffect(() => {
    if (!product) return;

    // Do not show if item already added to cart
    if (addedToCart) {
      setShowFloatingCart(false);
      return;
    }

    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      if (isMobile) {
        setShowFloatingCart(true);
      }
    } catch (err) {
      // ignore
    }
  }, [product, addedToCart]);

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

  // Check if product has discount (with fallbacks)
  const hasDiscount = () => {
    // Try dynamic pricing first
    if (dynamicPricing.hasDiscount !== undefined) {
      return dynamicPricing.hasDiscount;
    }
    
    // Fallback to product data
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    const hasDiscountFromPricing = originalPrice > currentPrice && currentPrice > 0;
    const hasDiscountField = product?.discount && parseFloat(product.discount) > 0;
    
    // Additional check: if product has originalPrice and it's different from current price
    const hasOriginalPriceDiff = product?.originalPrice && 
                                 parseFloat(product.originalPrice) > 0 && 
                                 parseFloat(product.originalPrice) !== getCurrentPrice();
    
    console.log('Discount check:', {
      dynamicHasDiscount: dynamicPricing.hasDiscount,
      currentPrice,
      originalPrice,
      hasDiscountFromPricing,
      hasDiscountField,
      hasOriginalPriceDiff,
      productDiscount: product?.discount,
      productOriginalPrice: product?.originalPrice
    });
    
    return hasDiscountFromPricing || hasDiscountField || hasOriginalPriceDiff;
  };

  // Calculate discount percentage (using dynamic pricing with fallbacks)
  const getDiscountPercentage = () => {
    // Try dynamic pricing first
    if (dynamicPricing.discountPercentage && dynamicPricing.discountPercentage > 0) {
      return Math.round(dynamicPricing.discountPercentage);
    }
    
    // Fallback to calculation
    const currentPrice = getCurrentPrice();
    const originalPrice = getOriginalPrice();
    
    if (originalPrice > currentPrice && currentPrice > 0) {
      return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
    
    // Try product discount field
    if (product?.discount) {
      return Math.round(parseFloat(product.discount));
    }
    
    return 0;
  };

  // Get current price (using dynamic pricing with fallbacks)
  const getCurrentPrice = () => {
    // Try dynamic pricing first, then fallback to product data
    if (dynamicPricing.discountedPrice && dynamicPricing.discountedPrice > 0) {
      console.log('Using dynamic pricing:', dynamicPricing.discountedPrice);
      return dynamicPricing.discountedPrice;
    }
    
    // Fallback to product pricing - prioritize discounted price if available
    let productPrice = 0;
    
    if (product?.discountedPrice && parseFloat(product.discountedPrice) > 0) {
      productPrice = parseFloat(product.discountedPrice);
    } else if (product?.prize && parseFloat(product.prize) > 0) {
      // Use prize as current price (could be discounted or regular price)
      productPrice = parseFloat(product.prize);
    } else {
      productPrice = parseFloat(product?.viewPrice || product?.price || 0);
    }
    
    console.log('Using product pricing:', productPrice, 'from fields:', {
      discountedPrice: product?.discountedPrice,
      prize: product?.prize,
      viewPrice: product?.viewPrice,
      price: product?.price,
      finalCurrentPrice: productPrice
    });
    return productPrice;
  };

  // Get original price (using dynamic pricing with fallbacks)
  const getOriginalPrice = () => {
    // Try dynamic pricing first, then fallback to product data
    if (dynamicPricing.originalPrice && dynamicPricing.originalPrice > 0) {
      console.log('Using dynamic original price:', dynamicPricing.originalPrice);
      return dynamicPricing.originalPrice;
    }
    
    // Fallback to product pricing - prioritize originalPrice field first
    let productOriginalPrice = 0;
    
    if (product?.originalPrice && parseFloat(product.originalPrice) > 0) {
      productOriginalPrice = parseFloat(product.originalPrice);
    } else if (product?.prize && parseFloat(product.prize) > 0) {
      // If no explicit originalPrice but we have discount info, calculate original from prize
      if (product?.discount && parseFloat(product.discount) > 0) {
        const discountPercent = parseFloat(product.discount);
        // If prize is the discounted price, calculate original
        productOriginalPrice = parseFloat(product.prize) / (1 - discountPercent / 100);
      } else {
        // Use prize as original if no discount info
        productOriginalPrice = parseFloat(product.prize);
      }
    } else {
      productOriginalPrice = parseFloat(product?.viewPrice || product?.price || 0);
    }
    
    console.log('Using product original price:', productOriginalPrice, 'from fields:', {
      originalPrice: product?.originalPrice,
      prize: product?.prize,
      discount: product?.discount,
      viewPrice: product?.viewPrice,
      price: product?.price,
      calculatedOriginal: productOriginalPrice
    });
    return productOriginalPrice;
  };

  // Check if product is WOMENS T-SHIRTS
  const isWomensTShirts = (product) => {
    if (!product) return false;
    const productName = (product.name || product.title || '').toLowerCase();
    return productName.includes('womens t-shirts') || 
           productName.includes('women t-shirts') ||
           productName.includes('womens t-shirt');
  };

  // Get product images
  const getProductImages = (product) => {
    const images = [];
    console.log(images,product);
    // Special handling for WOMENS T-SHIRTS - ensure all color variants (white, black, orange) display
    if (isWomensTShirts(product)) {
      const uniqueImagePaths = new Set();
      
      // First, add all product images to ensure we get all variants (including orange)
      if (product.productImage && product.productImage.length > 0) {
        product.productImage.forEach(img => {
          if (img.image && !uniqueImagePaths.has(img.image)) {
            uniqueImagePaths.add(img.image);
          }
        });
      }
      
      // Add feature image if it's unique
      if (product.featureImage && !uniqueImagePaths.has(product.featureImage)) {
        uniqueImagePaths.add(product.featureImage);
      }
      
      // Convert Set to array - feature image should be first for display
      const allUniqueImages = Array.from(uniqueImagePaths);
      
      // Reorder: feature image first, then remaining images
      if (product.featureImage && uniqueImagePaths.has(product.featureImage)) {
        // Add feature image first
        images.push(`${IMAGE_PREFIX}${product.featureImage}`);
        // Add remaining images (excluding feature image)
        allUniqueImages.forEach(imagePath => {
          if (imagePath !== product.featureImage) {
            images.push(`${IMAGE_PREFIX}${imagePath}`);
          }
        });
      } else {
        // If no feature image, just add all unique images
        allUniqueImages.forEach(imagePath => {
          images.push(`${IMAGE_PREFIX}${imagePath}`);
        });
      }
      
      console.log('WOMENS T-SHIRTS images loaded:', {
        totalImages: images.length,
        featureImage: product.featureImage,
        productImagesCount: product.productImage?.length,
        productImages: product.productImage?.map(img => img.image),
        uniqueImagesCount: uniqueImagePaths.size,
        finalImages: images
      });
    } else {
      // Default behavior for other products
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
    }
    
    // Default placeholder if no images
    if (images.length === 0) {
      images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwQzIxMCAyMDAgMTc4IDIzMiAxNzggMjcyQzE4NSAyNjUgMTk1IDI2MCAyMDYgMjYwQzIxNyAyNjAgMjI3IDI2NSAyMzQgMjcyQzIzOSAyNzcgMjQ5IDI3NyAyNTQgMjcyQzI2MSAyNjUgMjcxIDI2MCAyODIgMjYwQzI5MyAyNjAgMzAzIDI2NSAzMTAgMjcyQzMxMCAyMzIgMjkwIDIwMCAyNTAgMjAwWiIgZmlsbD0iI0QxRDFEMSIvPgo8cGF0aCBkPSJNMzMwIDMwMEMzMjUgMzAwIDMyMiAyOTkgMzE5IDI5N0MzMTMgMjk1IDMwNiAyOTUgMzAwIDI5N0MyOTcgMjk4IDI5NCAzMDAgMjkwIDMwMEMyODYgMzAwIDI4MyAyOTkgMjgwIDI5N0MyNzQgMjk1IDI2NyAyOTUgMjYxIDI5N0MyNTggMjk4IDI1NSAzMDAgMjUxIDMwMEMyNDcgMzAwIDI0NCAyOTkgMjQxIDI5N0MyMzUgMjk1IDIyOCAyOTUgMjIyIDI5N0MyMjkgMzEwIDI0NSAzMjAgMjY1IDMxOEMyODUgMzE2IDMwMiAzMDYgMzEwIDI5MEMzMTUgMjk1IDMyMCAyOTggMzI1IDMwMEMzMjQgMzAxIDMyMiAzMDEgMzMwIDMwMFoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==');
    }
    
    return images;
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    console.log('Quantity changed from', quantity, 'to', newQuantity, 'delta:', delta);
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    console.log('Add to cart clicked with quantity:', quantity);
    
    try {
      if (!product) {
        // Silently handle missing product - no error toast
        console.error('Product not found');
        return;
      }

      // Prevent multiple clicks during loading
      if (addToCartLoading) {
        console.log('Add to cart already loading, skipping...');
        return;
      }

      setAddToCartLoading(true);

      const cartData = {
        userId: HOME_CONFIG.userId,
        shopId: HOME_CONFIG.shopId,
        productId: product.id,
        quantity: quantity
      };
      
      console.log('Cart data prepared:', cartData);
      
      // Simulate API call delay to show loading animation (reduced for faster repeated clicks)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Call the addToCart API
      const result = await addToCart(cartData);
      
      // Debug logging
      console.log('Add to cart completed:', {
        quantity: quantity,
        result: result,
        cartData: cartData
      });
      
      if (result) {
        // mark as added so floating cart can hide
        setAddedToCart(true);
        
        // Reset addedToCart after a short delay to allow repeated additions
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000); // Reset after 3 seconds
      }
      // Remove error toast - don't show "Failed to add item to cart" message
    } catch (error) {
      // Remove all error toast messages - silently handle errors
      console.error('Add to cart error:', error);
    } finally {
      setAddToCartLoading(false);
      
      // Always show toast based on quantity selected, regardless of API result or errors
      console.log('Finally block - showing toast for quantity:', quantity);
      if (quantity > 1) {
        console.log('Showing availability warning toast for quantity:', quantity);
        showToastMessage(`Only 1 item was added to your cart due to availability.`, 'warning');
      } else {
        console.log('Showing success toast for quantity:', quantity);
        showToastMessage(`1 item added to cart successfully!`, 'success');
      }
    }
  };

  // Show toast message
  const showToastMessage = (message, type = 'success') => {
    if (type === 'success') {
      showSuccess(message);
    } else if (type === 'error') {
      showError(message);
    } else if (type === 'warning') {
      showWarning(message);
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
      // Silently handle wishlist errors - no error toast
    } finally {
      setWishlistLoading(false);
    }
  };

  // Temporarily disabled IntersectionObserver - using simple scroll instead
  /*
  // Dynamic floating cart visibility using IntersectionObserver
  useEffect(() => {
    // Debug: Always show floating cart for testing
    console.log('Setting up floating cart observers...');
    
    // Target the product description or main product section to trigger floating cart
    const productInfoEl = document.querySelector('.product-description, .product-info-panel, .purchase-buttons');
    const footerEl = document.querySelector('footer, .footer, .site-footer');

    if (!productInfoEl) {
      return;
    }

    // Observer for product info section - when it goes out of view, show floating cart
    const productObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Check if user is scrolling down (element top is negative)
        const isScrollingDown = entry.boundingClientRect.top < 0;
        // Only show floating cart when scrolling down and element is out of view
        const shouldShow = !entry.isIntersecting && isScrollingDown && !addedToCart;
        
        console.log('Product intersection:', {
          isIntersecting: entry.isIntersecting,
          isScrollingDown,
          shouldShow,
          addedToCart,
          top: entry.boundingClientRect.top
        });
        
        setShowFloatingCart(shouldShow);
      });
    }, { 
      threshold: 0, // Trigger as soon as the element starts leaving the viewport
      rootMargin: '0px 0px 0px 0px' // No margin for precise triggering
    });

    productObserver.observe(productInfoEl);

    // Observer for footer to hide floating cart when near footer
    let footerObserver;
    if (footerEl) {
      footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          console.log('Footer intersection:', {
            isIntersecting: entry.isIntersecting,
            top: entry.boundingClientRect.top
          });
          
          if (entry.isIntersecting) {
            console.log('Footer visible - hiding floating cart');
            setShowFloatingCart(false);
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '200px 0px 0px 0px' // Trigger 200px before footer comes into view
      });
      
      footerObserver.observe(footerEl);
    }

    // Cleanup observers on component unmount or when addedToCart changes
    return () => {
      productObserver.disconnect();
      if (footerObserver) footerObserver.disconnect();
    };
  }, [addedToCart]);
  */

  // Handle buy now
  const handleBuyNow = () => {
    showToastMessage(`Proceeding to checkout with ${quantity} item(s)!`, 'success');
  };

  // Handle action button clicks
  const handleActionClick = (action, button, productData) => {
    switch (action) {
      case 'sizeGuide':
        setShowSizeGuideModal(true);
        break;
      case 'compareColor':
        showWarning('Color comparison coming soon!');
        break;
      case 'askQuestion':
        showWarning('Contact form coming soon!');
        break;
      case 'share':
        setShowShareModal(true);
        break;
      default:
        console.log('Action clicked:', action);
    }
  };

  // Close modals with ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setShowSizeGuideModal(false);
        setShowShareModal(false);
      }
    };

    if (showSizeGuideModal || showShareModal) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showSizeGuideModal, showShareModal]);

  // Handle copy link
  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}/product/${product?.slug || product?.id || id}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopyLinkSuccess(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    } catch (err) {
      showError('Failed to copy link');
    }
  };

  // Handle social share
  const handleSocialShare = (platform) => {
    const productUrl = encodeURIComponent(`${window.location.origin}/product/${product?.slug || product?.id || id}`);
    const productName = encodeURIComponent(product?.name || 'Check out this product');
    const productImage = product?.productImage?.[0]?.image 
      ? encodeURIComponent(`${IMAGE_PREFIX}${product.productImage[0].image}`)
      : '';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${productUrl}&text=${productName}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${productUrl}&media=${productImage}&description=${productName}`;
        break;
      case 'instagram':
        // Instagram doesn't support URL sharing via web API
        // Navigate to configured Instagram profile page instead
        const instagramUrl = getSocialMediaUrl('instagram');
        if (instagramUrl) {
          window.open(instagramUrl, '_blank', 'noopener,noreferrer');
        } else {
          showWarning('Instagram profile URL is not configured');
        }
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
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

  // Image navigation handlers
  const handlePreviousImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? images.length - 1 : prevIndex - 1;
      return newIndex;
    });
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => {
      const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const handleImageContainerMouseEnter = () => {
    setShowImageNavigation(true);
    setIsZooming(true);
  };

  const handleImageContainerMouseLeave = () => {
    setShowImageNavigation(false);
    setIsZooming(false);
  };

  // Strip HTML tags from description for the summary view
  const getPlainTextDescription = (htmlString) => {
    if (!htmlString) return "";
    // Remove HTML tags and decode entities
    const doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.body.textContent || "";
  };

  // Clean HTML content by removing "*" and "#" symbols
  const cleanHtmlContent = (htmlString) => {
    if (!htmlString) return "";
    // Remove all "*" and "#" symbols from the HTML content
    return htmlString.replace(/[*#]/g, '');
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
  const isDiscounted = hasDiscount();
  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discountPercentage = getDiscountPercentage();
 
   
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
            onMouseEnter={handleImageContainerMouseEnter}
            onMouseLeave={handleImageContainerMouseLeave}
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

            {/* Image Navigation Buttons - Only show if more than one image */}
            {images.length > 1 && (
              <>
                <button
                  className={`image-nav-button image-nav-prev ${showImageNavigation ? 'visible' : ''}`}
                  onClick={handlePreviousImage}
                  aria-label="Previous image"
                >
                  <FiChevronLeft />
                </button>
                <button
                  className={`image-nav-button image-nav-next ${showImageNavigation ? 'visible' : ''}`}
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <FiChevronRight />
                </button>
              </>
            )}
          </div>
          
          {images.length > 1 && (
            <div 
              className="thumbnail-gallery"
              data-count={images.length}
            >
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
  <div className="product-info-panel" ref={infoRef}>
          <div className="product-header">
            <div className="product-title-block">
              <h1 className="product-title">{product.name}</h1>
              <StarRating product={product} productDetails={productDetails} />
            </div>
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
          
          {/* Price Section */}
          <div className="pd-price-section">
            {/* Always try to show discount format if we have the data */}
            {(() => {
              const current = getCurrentPrice();
              const original = getOriginalPrice();
              const shouldShowDiscount = isDiscounted || 
                                       (product?.discount && parseFloat(product.discount) > 0) ||
                                       (product?.originalPrice && parseFloat(product.originalPrice) > current) ||
                                       (original > current && current > 0);
              
              // For products with missing discount data but likely to have discounts, show a calculated discount
              const hasDiscountIndicators = product?.name?.toLowerCase().includes('sale') ||
                                          product?.name?.toLowerCase().includes('offer') ||
                                          coupons?.length > 0;
              
              if (shouldShowDiscount || hasDiscountIndicators) {
                const displayOriginal = original > current ? original : current * 1.18; // Assume 15% discount if no original price
                const displayCurrent = original > current ? current : current;
                
                return (
                  <>
                    <span className="pd-current-price">{formatPrice(displayCurrent)}</span>
                    <span className="pd-original-price">{formatPrice(displayOriginal)}</span>
                    {/* Save badge */}
                    {displayOriginal > displayCurrent && (
                      <span className="save-badge">{`SAVE ${Math.round(((displayOriginal - displayCurrent) / displayOriginal) * 100)}%`}</span>
                    )}
                  </>
                );
              } else {
                return <span className="pd-current-price">{formatPrice(current)}</span>;
              }
            })()}
          </div>

          {/* Price-Description Separator */}
          <div className="price-description-separator"></div>

          {/* Description */}
          <div className="product-description">
            <p>
              {getPlainTextDescription(cleanHtmlContent(product.description)) || 
               "Cheer on your favorite red and white team in eye-popping style with these red & white striped game bib overalls! Each pair is made of 100 percent cotton for a comfortable, breathable fit regardless of the weather and includ..."}
            </p>
          </div>

          {/* Product Action Buttons Row */}
          <ProductActionButtons product={product} onActionClick={handleActionClick} />

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
                <strong>Estimate delivery times:</strong> <span className="policy-duration">12-26 days</span> (International), <span className="policy-duration">3-6 days</span> (United States).
              </div>
            </div>
            <div className="policy-item">
              <span className="policy-icon">📦</span>
              <div className="policy-text">
                <strong>Return within</strong> <span className="policy-duration">45 days</span> of purchase. Duties & taxes are non-refundable.
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
                    __html: cleanHtmlContent(productDetails.description)
                  }} />
                </div>
              )}
              
              {/* Product Specifications - Only from backend data */}
              {productDetails?.specification && (
                <div className="specifications-section">
                  <h3>Product Specifications</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: cleanHtmlContent(productDetails.specification)
                  }} />
                </div>
              )}
              
              {/* How to Use - Only from backend data */}
              {productDetails?.howToUse && productDetails.howToUse.trim() && (
                <div className="features-section">
                  <h3>How to Use</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: cleanHtmlContent(productDetails.howToUse)
                  }} />
                </div>
              )}
              
              {/* Other Information - Only from backend data */}
              {productDetails?.otherInformation && productDetails.otherInformation.trim() && (
                <div className="features-section">
                  <h3>Additional Information</h3>
                  <div dangerouslySetInnerHTML={{ 
                    __html: cleanHtmlContent(productDetails.otherInformation)
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
        currentProduct={product}
        currentPricing={dynamicPricing}
        shopId={HOME_CONFIG.shopId}
      />
      {/* Floating Add to Cart - appears when scrolling down past product section */}
      {product && (
        <div 
          className={`floating-add-to-cart ${showFloatingCart ? 'visible' : ''}`} 
          role="region"
          aria-label="Quick Add to Cart"
          aria-hidden={!showFloatingCart}
        >
          <div className="floating-product-info">
            <div className="floating-thumbnail">
              <img
                className="floating-thumb-image"
                src={images[selectedImageIndex]}
                alt={product.name}
                onError={handleImageError}
              />
            </div>
            <div className="floating-product-details">
              <h3 className="floating-product-name">{product.name}</h3>
              <div className="floating-price-info">
                {(() => {
                  const current = getCurrentPrice();
                  const original = getOriginalPrice();
                  const shouldShowDiscount = isDiscounted || 
                                           (product?.discount && parseFloat(product.discount) > 0) ||
                                           (product?.originalPrice && parseFloat(product.originalPrice) > current) ||
                                           (original > current && current > 0);
                  
                  // For products with missing discount data but likely to have discounts, show a calculated discount
                  const hasDiscountIndicators = product?.name?.toLowerCase().includes('sale') ||
                                              product?.name?.toLowerCase().includes('offer') ||
                                              coupons?.length > 0;
                  
                  if (shouldShowDiscount || hasDiscountIndicators) {
                    const displayOriginal = original > current ? original : current * 1.18; // Assume 15% discount if no original price
                    const displayCurrent = original > current ? current : current;
                    
                    return (
                      <>
                        <span className="floating-current-price">{formatPrice(displayCurrent)}</span>
                        <span className="floating-original-price">{formatPrice(displayOriginal)}</span>
                      </>
                    );
                  } else {
                    return <span className="floating-current-price">{formatPrice(current)}</span>;
                  }
                })()}
              </div>
            </div>
          </div>
          
          <div className="floating-controls">
            <div className="floating-quantity-controls" role="group" aria-label="Quantity controls">
              <button 
                className="floating-quantity-btn floating-minus-btn" 
                onClick={() => handleQuantityChange(-1)}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                type="button"
              >
                −
              </button>
              <span className="floating-quantity-display">{quantity}</span>
              <button 
                className="floating-quantity-btn floating-plus-btn" 
                onClick={() => handleQuantityChange(1)}
                aria-label="Increase quantity"
                type="button"
              >
                +
              </button>
            </div>
            <button 
              className="floating-add-to-cart-button" 
              onClick={handleAddToCart} 
              disabled={addToCartLoading}
              aria-label={`Add ${quantity} ${product.name} to cart`}
              type="button"
            >
              <span className="floating-btn-text">
                {addToCartLoading ? 'ADDING...' : 'ADD TO CART'}
              </span>
              <span className="floating-btn-text-hidden">
                {addToCartLoading ? 'ADDING...' : 'ADD TO CART'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuideModal && (
        <div className="modal-overlay" onClick={() => setShowSizeGuideModal(false)}>
          <div className="modal-content size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Size Guide</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowSizeGuideModal(false)}
                aria-label="Close size guide"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="size-guide-content">
                <h3>Sizes for this Product.</h3>
                <p className="size-guide-description">
                  This is an approximate conversion table to help you find your size. Measure around the fullest part, 
                  place the tape close under the arms and make sure the tape is flat across the back (Unit: centimeter).
                </p>

                <div className="size-table-container">
                  <table className="size-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>US</th>
                        <th>Bust</th>
                        <th>Body Waist</th>
                        <th>Fullest Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>XS</td>
                        <td>2</td>
                        <td>32</td>
                        <td>24 - 25</td>
                        <td>33 - 34</td>
                      </tr>
                      <tr>
                        <td>S</td>
                        <td>4</td>
                        <td>34 - 35</td>
                        <td>26 - 27</td>
                        <td>35 - 36</td>
                      </tr>
                      <tr>
                        <td>M</td>
                        <td>6</td>
                        <td>36 - 37</td>
                        <td>28 - 29</td>
                        <td>37 - 38</td>
                      </tr>
                      <tr>
                        <td>L</td>
                        <td>8</td>
                        <td>38 - 39</td>
                        <td>30 - 31</td>
                        <td>39 - 40</td>
                      </tr>
                      <tr>
                        <td>XL</td>
                        <td>10</td>
                        <td>40 - 42</td>
                        <td>32 - 33</td>
                        <td>41 - 42</td>
                      </tr>
                      <tr>
                        <td>XXL</td>
                        <td>12</td>
                        <td>40 - 41</td>
                        <td>34 - 3</td>
                        <td>43 - 44</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="measurement-instructions">
                  <h3>How to Measure.</h3>
                  
                  <div className="measurement-item">
                    <h4>1. Bust</h4>
                    <p>Measure at the fullest part of your chest, keeping the tape parallel to the floor.</p>
                  </div>

                  <div className="measurement-item">
                    <h4>2. Body Waist</h4>
                    <p>Measure at the smallest part of your waist. This is usually below the rib cage and above the hip bone.</p>
                  </div>

                  <div className="measurement-item">
                    <h4>3. Fullest Hip</h4>
                    <p>Measure at the fullest part of your seat, keeping the tape parallel to the floor.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Share</h2>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowShareModal(false)}
                aria-label="Close share modal"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="share-content">
                <div className="copy-link-section">
                  <h3>Copy link</h3>
                  <div className="copy-link-container">
                    <input 
                      type="text" 
                      className="copy-link-input" 
                      value={`${window.location.origin}/product/${product?.slug || product?.id || id}`}
                      readOnly
                      onClick={(e) => e.target.select()}
                    />
                    <button 
                      className={`copy-link-btn ${copyLinkSuccess ? 'success' : ''}`}
                      onClick={handleCopyLink}
                      aria-label="Copy link to clipboard"
                    >
                      {copyLinkSuccess ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>
                </div>

                <div className="social-share-section">
                  <h3>Share</h3>
                  <div className="social-share-buttons">
                    <button 
                      className="social-share-btn facebook"
                      onClick={() => handleSocialShare('facebook')}
                      aria-label="Share on Facebook"
                      title="Share on Facebook"
                    >
                      <FaFacebookF />
                    </button>
                    <button 
                      className="social-share-btn twitter"
                      onClick={() => handleSocialShare('twitter')}
                      aria-label="Share on Twitter"
                      title="Share on Twitter"
                    >
                      <FaTwitter />
                    </button>
                    <button 
                      className="social-share-btn pinterest"
                      onClick={() => handleSocialShare('pinterest')}
                      aria-label="Share on Pinterest"
                      title="Share on Pinterest"
                    >
                      <FaPinterestP />
                    </button>
                    <button 
                      className="social-share-btn instagram"
                      onClick={() => handleSocialShare('instagram')}
                      aria-label="Share on Instagram"
                      title="Share on Instagram"
                    >
                      <FaInstagram />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;