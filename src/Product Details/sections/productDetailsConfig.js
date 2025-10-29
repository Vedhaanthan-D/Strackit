// Product Details Configuration
// This file contains all configuration specific to the Product Details page
// Including layout, spacing, typography, pricing, social media, and carousel settings

// Social Media Configuration
// Configure your social media profile URLs here
export const SOCIAL_MEDIA_CONFIG = {
  instagram: {
    profileUrl: 'https://www.instagram.com/your_instagram_handle/', // Replace with your Instagram profile URL
    enabled: true,
    openInNewTab: true
  },
  facebook: {
    profileUrl: 'https://www.facebook.com/your_facebook_page',
    enabled: true,
    openInNewTab: true
  },
  twitter: {
    profileUrl: 'https://twitter.com/your_twitter_handle',
    enabled: true,
    openInNewTab: true
  },
  pinterest: {
    profileUrl: 'https://www.pinterest.com/your_pinterest_profile',
    enabled: true,
    openInNewTab: true
  }
};

/**
 * Get social media profile URL
 * @param {string} platform - Social media platform ('instagram', 'facebook', 'twitter', 'pinterest')
 * @returns {string|null} - Profile URL or null if disabled
 */
export const getSocialMediaUrl = (platform) => {
  const config = SOCIAL_MEDIA_CONFIG[platform];
  if (!config || !config.enabled) {
    return null;
  }
  return config.profileUrl;
};

// Product Details Layout Spacing Configuration
// These values control spacing between sections and can be updated dynamically
export const PRODUCT_LAYOUT_SPACING = {
  // Spacing between product action menu and purchase buttons (in pixels)
  actionMenuToPurchaseGap: {
    mobile: 20,      // Small screens (< 768px)
    tablet: 24,      // Medium screens (768px - 1024px)
    desktop: 28      // Large screens (> 1024px)
  },
  // Can be extended for other spacing needs
  descriptionToActionsGap: {
    mobile: 16,
    tablet: 20,
    desktop: 24
  }
};

// Page Layout Configuration
// Controls horizontal spacing, content width, and responsive layout
export const PAGE_LAYOUT_CONFIG = {
  // Horizontal padding/margins on left and right edges (white space)
  horizontalSpacing: {
    mobile: 16,       // Small screens (< 768px) - 16px on each side
    tablet: 32,       // Medium screens (768px - 1024px) - 32px on each side
    desktop: 48,      // Large screens (1024px - 1440px) - 48px on each side
    largeDesktop: 80  // Extra large screens (> 1440px) - 80px on each side
  },
  
  // Gap between product image gallery and product details content
  contentGap: {
    mobile: 24,       // Small screens
    tablet: 32,       // Medium screens
    desktop: 48       // Large screens
  },
  
  // Product details layout grid ratios (image vs content area)
  gridRatio: {
    mobile: '1fr',           // Single column on mobile (stacked)
    tablet: '1fr 1fr',       // Equal split on tablet
    desktop: '55fr 45fr'     // 55% image, 45% content on desktop
  },
  
  // Maximum content width (prevents content from being too wide on very large screens)
  maxContentWidth: {
    enabled: true,
    maxWidth: 1920,    // Maximum width in pixels
    centerContent: true // Center content when max width is reached
  }
};

/**
 * Get responsive horizontal spacing value
 * @param {number} screenWidth - Current screen width in pixels
 * @returns {number} - Horizontal spacing value in pixels
 */
export const getHorizontalSpacing = (screenWidth) => {
  const spacing = PAGE_LAYOUT_CONFIG.horizontalSpacing;
  
  if (screenWidth < 768) {
    return spacing.mobile;
  } else if (screenWidth < 1024) {
    return spacing.tablet;
  } else if (screenWidth < 1440) {
    return spacing.desktop;
  } else {
    return spacing.largeDesktop;
  }
};

/**
 * Get responsive content gap value
 * @param {number} screenWidth - Current screen width in pixels
 * @returns {number} - Content gap value in pixels
 */
export const getContentGap = (screenWidth) => {
  const gap = PAGE_LAYOUT_CONFIG.contentGap;
  
  if (screenWidth < 768) {
    return gap.mobile;
  } else if (screenWidth < 1024) {
    return gap.tablet;
  } else {
    return gap.desktop;
  }
};

/**
 * Get responsive grid template columns
 * @param {number} screenWidth - Current screen width in pixels
 * @returns {string} - CSS grid-template-columns value
 */
export const getGridRatio = (screenWidth) => {
  const ratio = PAGE_LAYOUT_CONFIG.gridRatio;
  
  if (screenWidth < 768) {
    return ratio.mobile;
  } else if (screenWidth < 1024) {
    return ratio.tablet;
  } else {
    return ratio.desktop;
  }
};

// Button Typography Configuration
// Controls letter-spacing, font properties for purchase buttons
export const BUTTON_TYPOGRAPHY = {
  // Letter spacing for button text (modern, airy look)
  letterSpacing: '0.15em',  // 0.15em spacing between letters
  
  // Font properties
  fontSize: '13px',
  fontWeight: '400',
  fontFamily: 'Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  textTransform: 'uppercase',
  
  // Button-specific overrides
  addToCart: {
    letterSpacing: '0.15em',
    fontSize: '13px',
    fontWeight: '400'
  },
  buyNow: {
    letterSpacing: '0.15em',
    fontSize: '13px',
    fontWeight: '400'
  }
};

// Price Formatting Configuration
// Controls how prices are displayed throughout the application
export const PRICE_FORMAT_CONFIG = {
  // Currency symbol
  currencySymbol: '₹',
  
  // Number of decimal places (0 for round numbers, 2 for decimals)
  decimalPlaces: 2,  // Set to 2 for prices like ₹823.00
  
  // Thousand separator
  useThousandSeparator: false,
  thousandSeparator: ',',
  
  // Decimal separator
  decimalSeparator: '.',
  
  // Position of currency symbol
  symbolPosition: 'before', // 'before' or 'after'
  
  // Space between symbol and amount
  symbolSpace: '',  // '' for no space, ' ' for space
  
  // Rounding method: 'round', 'floor', 'ceil'
  roundingMethod: 'round'
};

/**
 * Format price according to configuration
 * @param {number|string} price - The price value to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  const numPrice = parseFloat(price || 0);
  
  // Handle zero or invalid prices
  if (isNaN(numPrice) || numPrice <= 0) {
    return 'Price not available';
  }
  
  // Apply rounding method
  let roundedPrice;
  switch (PRICE_FORMAT_CONFIG.roundingMethod) {
    case 'floor':
      roundedPrice = Math.floor(numPrice);
      break;
    case 'ceil':
      roundedPrice = Math.ceil(numPrice);
      break;
    case 'round':
    default:
      roundedPrice = Math.round(numPrice);
      break;
  }
  
  // Format with decimal places
  const formattedNumber = PRICE_FORMAT_CONFIG.decimalPlaces > 0
    ? roundedPrice.toFixed(PRICE_FORMAT_CONFIG.decimalPlaces)
    : roundedPrice.toString();
  
  // Add thousand separator if enabled
  const withSeparator = PRICE_FORMAT_CONFIG.useThousandSeparator
    ? formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, PRICE_FORMAT_CONFIG.thousandSeparator)
    : formattedNumber;
  
  // Build final price string
  const symbol = PRICE_FORMAT_CONFIG.currencySymbol;
  const space = PRICE_FORMAT_CONFIG.symbolSpace;
  
  if (PRICE_FORMAT_CONFIG.symbolPosition === 'after') {
    return `${withSeparator}${space}${symbol}`;
  } else {
    return `${symbol}${space}${withSeparator}`;
  }
};

/**
 * Get responsive spacing value based on screen width
 * @param {string} spacingKey - The spacing configuration key
 * @param {number} screenWidth - Current screen width in pixels
 * @returns {number} - Spacing value in pixels
 */
export const getResponsiveSpacing = (spacingKey, screenWidth) => {
  const spacing = PRODUCT_LAYOUT_SPACING[spacingKey];
  if (!spacing) return 24; // Default fallback
  
  if (screenWidth < 768) {
    return spacing.mobile;
  } else if (screenWidth < 1024) {
    return spacing.tablet;
  } else {
    return spacing.desktop;
  }
};

// Thumbnail Image Configuration
// Controls the size of product thumbnail images
export const THUMBNAIL_CONFIG = {
  // Thumbnail dimensions (width x height in pixels)
  dimensions: {
    width: 100,   // Width in pixels
    height: 90    // Height in pixels
  }
};

/**
 * Get thumbnail dimensions
 * @returns {object} - Object with width and height properties
 */
export const getThumbnailDimensions = () => {
  return {
    width: THUMBNAIL_CONFIG.dimensions.width,
    height: THUMBNAIL_CONFIG.dimensions.height
  };
};

// Product Supreme Quality Image Configuration
// Controls the size and display of images in the Supreme Quality section
export const SUPREME_QUALITY_IMAGE_CONFIG = {
  // Image dimensions (width x height in pixels)
  dimensions: {
    width: 433.34,    // Width in pixels (exact dimension)
    height: 285.21    // Height in pixels (exact dimension)
  },
  // Object-fit property to prevent stretching
  // Options: 'contain' (shows full image with padding), 'cover' (fills container, may crop)
  objectFit: 'contain',  // Use 'contain' to show full image without stretching
  // Background color for padding areas when using 'contain'
  backgroundColor: '#f5f5f5',
  // Show dimensions label on images
  showDimensions: false
};

/**
 * Get Supreme Quality image dimensions
 * @returns {object} - Object with width, height, objectFit, backgroundColor, and showDimensions properties
 */
export const getSupremeQualityImageConfig = () => {
  return {
    width: SUPREME_QUALITY_IMAGE_CONFIG.dimensions.width,
    height: SUPREME_QUALITY_IMAGE_CONFIG.dimensions.height,
    objectFit: SUPREME_QUALITY_IMAGE_CONFIG.objectFit,
    backgroundColor: SUPREME_QUALITY_IMAGE_CONFIG.backgroundColor,
    showDimensions: SUPREME_QUALITY_IMAGE_CONFIG.showDimensions
  };
};

// Carousel Navigation Configuration
// Controls the visibility and behavior of carousel navigation buttons
export const CAROUSEL_CONFIG = {
  // Enable/disable navigation arrows for "You Might Also Like" section
  showNavigationArrows: false,  // Set to true to show left/right arrow buttons
  
  // Arrow button styling (when enabled)
  arrowStyle: {
    size: 40,           // Button size in pixels
    iconSize: 24,       // Icon size in pixels
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    hoverBackgroundColor: '#f5f5f5',
    iconColor: '#000000'
  },
  
  // Auto-scroll configuration
  autoScroll: {
    enabled: false,     // Enable auto-scrolling through products
    interval: 5000,     // Time between scrolls (milliseconds)
    pauseOnHover: true  // Pause auto-scroll when hovering over carousel
  },
  
  // Scroll behavior
  scrollBehavior: {
    snapToCards: true,          // Snap to card positions when scrolling
    cardsPerScroll: 1,          // Number of cards to scroll at a time
    smoothScroll: true          // Use smooth scrolling animation
  }
};