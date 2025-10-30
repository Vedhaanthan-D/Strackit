/**
 * Cart Utilities - Centralized cart management functions
 * 
 * This file provides consistent cart operations across the application
 * ensuring proper data integrity and user/shop consistency.
 */

import { addToCart as addToCartAPI, fetchCart as fetchCartAPI } from 'shops-query/src/modules/cart/index';
import { HOME_CONFIG, CART_CONFIG } from '../../config/appIds';

/**
 * Determines the correct shopId and userId for cart operations
 * based on the current page context
 */
export const getCartContext = (pageContext = 'home') => {
  switch (pageContext.toLowerCase()) {
    case 'cart':
    case 'checkout':
      return {
        shopId: CART_CONFIG.shopId,
        userId: CART_CONFIG.userId
      };
    case 'home':
    case 'products':
    case 'newarrivals':
    default:
      return {
        shopId: HOME_CONFIG.shopId,
        userId: HOME_CONFIG.userId
      };
  }
};

/**
 * Validates cart data consistency
 */
export const validateCartData = (productData, cartContext) => {
  if (!productData) {
    throw new Error('Product data is required');
  }

  // Check if we have either a numeric id or a numeric productId
  const numericId = productData.id;
  const productIdValue = productData.productId;
  
  if (!numericId && (!productIdValue || isNaN(Number(productIdValue)))) {
    throw new Error(`Product must have a valid numeric ID. Found: id="${numericId}", productId="${productIdValue}"`);
  }

  if (!cartContext.shopId || !cartContext.userId) {
    throw new Error('Valid shopId and userId are required');
  }

  return true;
};

/**
 * Normalizes product data for cart operations
 */
export const normalizeProductForCart = (product) => {
  // The product API returns:
  // - id: numeric database ID (use this for cart operations)
  // - productId: string SKU/code (like "WO9681")
  // For cart operations, we need the numeric ID, not the string productId
  
  let numericId = product.id; // Use the numeric ID field first
  
  // If id is not available, try productId but only if it's numeric
  if (!numericId) {
    const productIdValue = product.productId;
    const asNumber = Number(productIdValue);
    
    if (!isNaN(asNumber) && asNumber > 0) {
      numericId = asNumber;
    }
  }
  
  // Handle cases where ID might be nested
  if (!numericId && product.product) {
    numericId = product.product.id || product.product.productId;
  }
  
  // Convert to number if it's a string
  const finalId = Number(numericId);
  
  if (!numericId || isNaN(finalId) || finalId <= 0) {
    throw new Error(`Product missing valid numeric ID. Found: id="${product.id}", productId="${product.productId}". Cart operations require a numeric database ID.`);
  }

  return {
    productId: finalId, // This is the numeric database ID for cart operations
    name: product.name || '',
    image: product.productImage?.[0]?.image || product.featureImage || '',
    price: product.prize || product.originalPrice || 0,
    discount: product.discount || product.Discount || 0,
    sku: product.productId || '', // Keep the string SKU for reference
  };
};

/**
 * Adds a product to cart with proper validation and error handling
 * If product already exists in cart, increases quantity instead of adding duplicate
 */
export const addProductToCart = async (product, pageContext = 'home', quantity = 1) => {
  try {
    const cartContext = getCartContext(pageContext);
    
    validateCartData(product, cartContext);
    
    const normalizedProduct = normalizeProductForCart(product);

    // First, check if the product is already in the cart
    const currentCartResult = await getCartData(pageContext);
    if (!currentCartResult.success) {
      // Silently proceed if cart fetch fails
    }

    const currentCartItems = currentCartResult.data || [];
    const existingItem = currentCartItems.find(item => 
      Number(item.productId) === Number(normalizedProduct.productId)
    );

    if (existingItem) {
      // Product exists, update quantity instead of adding new
      const { updateCartQuantity } = await import('shops-query/src/modules/cart/index');
      
      const newQuantity = existingItem.quantity + quantity;
      
      const updateResult = await updateCartQuantity({
        userId: Number(cartContext.userId),
        productId: Number(normalizedProduct.productId),
        shopId: Number(cartContext.shopId),
        quantity: newQuantity
      });

      if (updateResult) {
        // Dispatch cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { 
            action: 'update_quantity',
            productId: normalizedProduct.productId,
            shopId: cartContext.shopId,
            userId: cartContext.userId,
            oldQuantity: existingItem.quantity,
            newQuantity: newQuantity,
            pageContext
          }
        }));
        
        return {
          success: true,
          data: updateResult,
          product: normalizedProduct,
          action: 'quantity_updated',
          oldQuantity: existingItem.quantity,
          newQuantity: newQuantity
        };
      } else {
        throw new Error('Failed to update cart quantity');
      }
    } else {
      // Product doesn't exist, add new item
      const cartData = {
        productId: normalizedProduct.productId,
        shopId: Number(cartContext.shopId),
        userId: Number(cartContext.userId),
        quantity: Number(quantity)
      };
      
      // Ensure all values are valid integers
      if (isNaN(cartData.productId) || cartData.productId <= 0) {
        throw new Error(`Invalid productId: ${cartData.productId}`);
      }
      if (isNaN(cartData.shopId) || cartData.shopId <= 0) {
        throw new Error(`Invalid shopId: ${cartData.shopId}`);
      }
      if (isNaN(cartData.userId) || cartData.userId <= 0) {
        throw new Error(`Invalid userId: ${cartData.userId}`);
      }
      if (isNaN(cartData.quantity) || cartData.quantity <= 0) {
        throw new Error(`Invalid quantity: ${cartData.quantity}`);
      }
      
      const result = await addToCartAPI(cartData);
      
      if (result) {
        // Dispatch cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { 
            action: 'add',
            productId: normalizedProduct.productId,
            shopId: cartContext.shopId,
            userId: cartContext.userId,
            quantity: quantity,
            pageContext
          }
        }));
        
        return {
          success: true,
          data: result,
          product: normalizedProduct,
          action: 'item_added',
          quantity: quantity
        };
      } else {
        throw new Error('No result returned from add to cart operation');
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      product: product ? normalizeProductForCart(product) : null
    };
  }
};

/**
 * Fetches cart data with proper context
 */
export const getCartData = async (pageContext = 'home') => {
  try {
    const cartContext = getCartContext(pageContext);
    const cartData = await fetchCartAPI(cartContext.shopId, cartContext.userId);
    
    return {
      success: true,
      data: cartData || [],
      context: cartContext
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Checks if a product is already in the cart and returns current quantity
 */
export const getProductCartStatus = async (product, pageContext = 'home') => {
  try {
    const cartResult = await getCartData(pageContext);
    if (!cartResult.success) {
      return { inCart: false, quantity: 0 };
    }

    const normalizedProduct = normalizeProductForCart(product);
    const existingItem = cartResult.data.find(item => 
      Number(item.productId) === Number(normalizedProduct.productId)
    );

    return {
      inCart: !!existingItem,
      quantity: existingItem ? existingItem.quantity : 0,
      cartItem: existingItem || null
    };
  } catch (error) {
    return { inCart: false, quantity: 0 };
  }
};

/**
 * Gets the quantity of a specific product in the cart
 */
export const getProductCartQuantity = (productId, cartItems) => {
  const cartItem = cartItems.find(item => 
    Number(item.productId) === Number(productId)
  );
  return cartItem ? cartItem.quantity : 0;
};

/**
 * Calculates cart totals
 */
export const calculateCartTotals = (cartItems) => {
  const subtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.prize || 0);
    const discount = parseFloat(item.Discount || 0);
    const finalPrice = price - discount;
    return total + (finalPrice * item.quantity);
  }, 0);
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalItems,
    averageItemPrice: totalItems > 0 ? parseFloat((subtotal / totalItems).toFixed(2)) : 0
  };
};

/**
 * Event handlers for cart updates
 */
export class CartEventManager {
  static listeners = new Set();
  
  static addListener(callback) {
    this.listeners.add(callback);
    
    const handleCartUpdate = (event) => {
      callback(event.detail);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      this.listeners.delete(callback);
    };
  }
  
  static dispatchUpdate(detail) {
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail }));
  }
  
  static clearListeners() {
    this.listeners.clear();
  }
}

export default {
  getCartContext,
  validateCartData,
  normalizeProductForCart,
  addProductToCart,
  getCartData,
  getProductCartStatus,
  getProductCartQuantity,
  calculateCartTotals,
  CartEventManager
};