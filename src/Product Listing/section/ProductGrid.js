import React, { useState, useEffect } from 'react';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import '../styles/ProductGrid.css';

const ProductGrid = ({ masterCategory, secondaryCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic imports
        const { getMasterCategories } = await import('shops-query/src/modules/masterCategories/queries/get.js');
        const { fetchProductsByCategory } = await import('shops-query/src/modules/productByCategory/queries/get.js');
        const { getSecondaryCategories } = await import('shops-query/src/modules/SecondaryCategories/queries/index.js');

        // Step 1: Fetch master categories
        const masterCategories = await getMasterCategories(HOME_CONFIG.shopId);

        // Step 2: Find the correct master category
        let selectedMaster = null;
        
        if (!isNaN(masterCategory)) {
          // If masterCategory is numeric, find by ID
          selectedMaster = masterCategories.find(cat => cat.id === parseInt(masterCategory));
        }
        
        if (!selectedMaster) {
          // Try to find by name, slug, or category field
          selectedMaster = masterCategories.find(cat => 
            cat.name === masterCategory || 
            cat.slug === masterCategory ||
            cat.category === masterCategory
          );
        }

        if (!selectedMaster) {
          throw new Error(`Master category not found: ${masterCategory}`);
        }

        // Step 3: Use string identifier (prefer slug > name > category > stringified ID)
        const masterCategoryIdentifier = selectedMaster.slug || 
                                       selectedMaster.name || 
                                       selectedMaster.category || 
                                       String(selectedMaster.id);



        // Step 4: Resolve secondary category to string identifier if provided
        let secondaryCategoryIdentifier = null;
        if (secondaryCategory) {
          try {
            // Fetch secondary categories for this master category
            const secondaryCategories = await getSecondaryCategories(HOME_CONFIG.shopId, selectedMaster.id);
            
            // Find the secondary category
            let selectedSecondary = null;
            
            if (!isNaN(secondaryCategory)) {
              // If secondaryCategory is numeric, find by ID
              selectedSecondary = secondaryCategories.find(cat => cat.id === parseInt(secondaryCategory));
            }
            
            if (!selectedSecondary) {
              // Try to find by name, slug, or category field
              selectedSecondary = secondaryCategories.find(cat => 
                cat.name === secondaryCategory || 
                cat.slug === secondaryCategory ||
                cat.category === secondaryCategory
              );
            }

            if (selectedSecondary) {
              // Use string identifier (prefer slug > name > category > stringified ID)
              secondaryCategoryIdentifier = selectedSecondary.slug || 
                                          selectedSecondary.name || 
                                          selectedSecondary.category || 
                                          String(selectedSecondary.id);
            }
          } catch (err) {
            // Secondary category fetch failed, continue without it
          }
        }

        // Step 5: Fetch products
        const fetchedProducts = await fetchProductsByCategory(
          masterCategoryIdentifier, 
          HOME_CONFIG.shopId, 
          secondaryCategoryIdentifier
        );

        setProducts(fetchedProducts || []);

      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (masterCategory) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [masterCategory, secondaryCategory]);

  // Helper functions
  const formatPrice = (price) => {
    if (!price) return '';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const hasDiscount = (product) => {
    if (!product) return false;
    return product.originalPrice && 
           product.discountedPrice && 
           parseFloat(product.originalPrice) > parseFloat(product.discountedPrice);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="loading-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="product-card-skeleton">
              <div className="product-image-skeleton"></div>
              <div className="product-info-skeleton">
                <div className="product-title-skeleton"></div>
                <div className="product-price-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-grid-container">
        <div className="error-state">
          <p>Unable to load products: {error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="product-grid-container">
        <div className="empty-state">
          <p>No products found</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="product-grid-container">
      {/* Main Content Area */}
      <div className="products-main">
        {/* Products Grid */}
        <div className="products-grid">
          {products
            .filter(product => product && product.id)
            .map((product) => {
            const isDiscounted = hasDiscount(product);
            const imageUrl = product.featureImage ? 
              `${IMAGE_PREFIX}${product.featureImage}` : 
              (product.image ? `${IMAGE_PREFIX}${product.image}` : '');

            return (
              <div key={product.id} className="product-item">
                <div className="product-image-wrapper">
                  {isDiscounted && (
                    <div className="sale-tag">Sale</div>
                  )}
                  <img
                    src={imageUrl}
                    alt={product.name || 'Product'}
                    className="product-img"
                    onError={handleImageError}
                  />
                  
                  {/* Action Buttons - Show on Hover */}
                  <div className="product-actions">
                    <button className="action-btn cart-btn" title="Add to Cart">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h2l.4 2m0 0h13.2a1 1 0 0 1 .98 1.2l-1.6 8a1 1 0 0 1-.98.8H6.4m0 0L5 7H3m3.4 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm10 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                      </svg>
                    </button>
                    <button className="action-btn quick-view-btn" title="Quick View">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h6v6m-11 5l8-8m-13 4v8a2 2 0 0 0 2 2h8"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="product-details">
                  <h4 className="product-title">{product.name}</h4>
                  
                  <div className="product-price">
                    {isDiscounted ? (
                      <>
                        <span className="current-price">
                          {formatPrice(product.discountedPrice)}
                        </span>
                        <span className="old-price">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">
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

export default ProductGrid;