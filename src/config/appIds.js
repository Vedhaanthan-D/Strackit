// Application Configuration
// This file contains all centralized IDs and constants used across the application

// Shared constants
export const IMAGE_PREFIX = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";

// Cart component configuration
export const CART_CONFIG = {
  userId: 1968,
  shopId: 488
};

// Home component configuration
export const HOME_CONFIG = {
  userId: 198,
  shopId: 512
};

// Other configuration constants
export const FREE_SHIPPING_THRESHOLD = 530;

// Export individual constants for convenience
export const { userId: CART_USER_ID, shopId: CART_SHOP_ID } = CART_CONFIG;
export const { userId: HOME_USER_ID, shopId: HOME_SHOP_ID } = HOME_CONFIG;