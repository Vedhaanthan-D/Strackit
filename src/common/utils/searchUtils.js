// searchUtils.js - Utility functions for search functionality

/**
 * Mock search function - Replace this with actual API calls
 * @param {string} query - Search query string
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Promise that resolves to search results
 */
export const searchProducts = async (query, limit = 10) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock product data - Replace with actual API call
  const mockProducts = [
    {
      id: 1,
      title: "Women's Summer Dress",
      category: "Women",
      price: 89.99,
      image: "/images/products/dress1.jpg",
      description: "Beautiful summer dress perfect for casual outings"
    },
    {
      id: 2,
      title: "Men's Cotton T-Shirt",
      category: "Men",
      price: 29.99,
      image: "/images/products/tshirt1.jpg",
      description: "Comfortable cotton t-shirt for everyday wear"
    },
    {
      id: 3,
      title: "Women's Denim Jacket",
      category: "Women",
      price: 79.99,
      image: "/images/products/jacket1.jpg",
      description: "Classic denim jacket with modern styling"
    },
    {
      id: 4,
      title: "Men's Sneakers",
      category: "Men",
      price: 149.99,
      image: "/images/products/sneakers1.jpg",
      description: "Stylish sneakers for sport and casual wear"
    },
    {
      id: 5,
      title: "Women's Handbag",
      category: "Women",
      price: 199.99,
      image: "/images/products/handbag1.jpg",
      description: "Elegant handbag for work and special occasions"
    },
    {
      id: 6,
      title: "Men's Formal Shirt",
      category: "Men",
      price: 59.99,
      image: "/images/products/shirt1.jpg",
      description: "Professional formal shirt for business wear"
    },
    {
      id: 7,
      title: "Women's Running Shoes",
      category: "Women",
      price: 129.99,
      image: "/images/products/running-shoes1.jpg",
      description: "High-performance running shoes for athletes"
    },
    {
      id: 8,
      title: "Men's Leather Belt",
      category: "Men",
      price: 39.99,
      image: "/images/products/belt1.jpg",
      description: "Premium leather belt for formal occasions"
    }
  ];

  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product => 
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );

  // Return limited results
  return filteredProducts.slice(0, limit);
};

/**
 * Get search suggestions based on query
 * @param {string} query - Search query string
 * @param {number} limit - Maximum number of suggestions to return
 * @returns {Promise<Array>} - Promise that resolves to search suggestions
 */
export const getSearchSuggestions = async (query, limit = 5) => {
  if (!query || query.length < 2) return [];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock suggestions - Replace with actual API call
  const mockSuggestions = [
    "women's dress",
    "men's t-shirt",
    "women's shoes",
    "men's jacket",
    "women's handbag",
    "men's sneakers",
    "women's blouse",
    "men's pants",
    "women's skirt",
    "men's shorts"
  ];

  // Filter suggestions based on query
  const filteredSuggestions = mockSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  );

  return filteredSuggestions.slice(0, limit);
};

/**
 * Format search query for URL
 * @param {string} query - Search query string
 * @returns {string} - Formatted query for URL
 */
export const formatSearchQuery = (query) => {
  return encodeURIComponent(query.trim().toLowerCase());
};

/**
 * Parse search query from URL
 * @param {string} urlQuery - Query parameter from URL
 * @returns {string} - Parsed search query
 */
export const parseSearchQuery = (urlQuery) => {
  return decodeURIComponent(urlQuery || '');
};

/**
 * Save search query to local storage for search history
 * @param {string} query - Search query to save
 */
export const saveSearchHistory = (query) => {
  if (!query || query.trim().length < 2) return;
  
  try {
    const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const cleanQuery = query.trim().toLowerCase();
    
    // Remove duplicate and add to beginning
    const updatedHistory = [
      cleanQuery,
      ...existingHistory.filter(item => item !== cleanQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
};

/**
 * Get search history from local storage
 * @param {number} limit - Maximum number of history items to return
 * @returns {Array} - Array of previous search queries
 */
export const getSearchHistory = (limit = 5) => {
  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    return history.slice(0, limit);
  } catch (error) {
    console.warn('Failed to get search history:', error);
    return [];
  }
};

/**
 * Clear search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory');
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
};