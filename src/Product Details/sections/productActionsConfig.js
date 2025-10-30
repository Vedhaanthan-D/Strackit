// Product Actions Configuration
// This file contains the configuration for product action buttons
// Icons and labels are fetched from this config to ensure dynamic rendering

import { TbRulerMeasure, TbPalette, TbMessageQuestion, TbShare3 } from 'react-icons/tb';

/**
 * Product Action Buttons Configuration
 * Each action can be enabled/disabled, have custom icons, labels, and handlers
 * Update this configuration to automatically update the UI without touching markup
 */
export const PRODUCT_ACTIONS_CONFIG = [
  {
    id: 'size-guide',
    label: 'Size Guide',
    icon: TbRulerMeasure,
    action: 'sizeGuide',
    enabled: true,
    ariaLabel: 'Open size guide',
    order: 1,
    // Optional: Can add additional metadata
    tooltip: 'View sizing information',
    // Optional: Category-specific visibility
    visibleForCategories: ['apparel', 'footwear', 'accessories']
  },
  {
    id: 'compare-color',
    label: 'Compare Color',
    icon: TbPalette,
    action: 'compareColor',
    enabled: true,
    ariaLabel: 'Compare product colors',
    order: 2,
    tooltip: 'Compare available colors',
    visibleForCategories: ['apparel', 'home-decor', 'accessories']
  },
  {
    id: 'ask-question',
    label: 'Ask a Question',
    icon: TbMessageQuestion,
    action: 'askQuestion',
    enabled: true,
    ariaLabel: 'Ask a question about this product',
    order: 3,
    tooltip: 'Contact us with questions',
    visibleForCategories: [] // Empty means visible for all categories
  },
  {
    id: 'share',
    label: 'Share',
    icon: TbShare3,
    action: 'share',
    enabled: true,
    ariaLabel: 'Share this product',
    order: 4,
    tooltip: 'Share with friends',
    visibleForCategories: []
  }
];

/**
 * Get enabled product actions sorted by order
 * @param {string} categorySlug - Optional category slug to filter actions
 * @returns {Array} - Filtered and sorted action configurations
 */
export const getProductActions = (categorySlug = null) => {
  return PRODUCT_ACTIONS_CONFIG
    .filter(action => {
      // Filter by enabled status
      if (!action.enabled) return false;
      
      // Filter by category if specified
      if (categorySlug && action.visibleForCategories && action.visibleForCategories.length > 0) {
        return action.visibleForCategories.includes(categorySlug);
      }
      
      return true;
    })
    .sort((a, b) => a.order - b.order);
};

/**
 * Get a specific product action by ID
 * @param {string} actionId - The action ID
 * @returns {Object|null} - Action configuration or null
 */
export const getProductActionById = (actionId) => {
  return PRODUCT_ACTIONS_CONFIG.find(action => action.id === actionId) || null;
};

/**
 * Example: Fetch actions from API (for future implementation)
 * This function can be used to fetch dynamic action configurations from a backend
 */
export const fetchProductActionsFromAPI = async (shopId, productId) => {
  try {
    // Placeholder for API call
    // const response = await fetch(`/api/shops/${shopId}/products/${productId}/actions`);
    // const data = await response.json();
    // return data;
    
    // For now, return the static config
    return PRODUCT_ACTIONS_CONFIG;
  } catch (error) {
    console.error('Error fetching product actions:', error);
    return PRODUCT_ACTIONS_CONFIG; // Fallback to static config
  }
};