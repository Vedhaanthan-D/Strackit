import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_CONFIG } from '../../config/appIds.js';
import '../styles/ProductGrid.css';

const ProductGrid = ({ masterCategory, secondaryCategory, filters = {}, shopId, onMaxPriceUpdate }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [productsPerRow, setProductsPerRow] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
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

        // Get dynamic shop ID
        const currentShopId = shopId || HOME_CONFIG.shopId;
        
        // Step 1: Fetch master categories
        const masterCategories = await getMasterCategories(currentShopId);

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
            const secondaryCategories = await getSecondaryCategories(currentShopId, selectedMaster.id);
            
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
          currentShopId, 
          secondaryCategoryIdentifier
        );

        setProducts(fetchedProducts || []);

        // Calculate maximum price from products
        if (fetchedProducts && fetchedProducts.length > 0 && onMaxPriceUpdate) {
          const validProducts = fetchedProducts.filter(product => product && product.id);
          if (validProducts.length > 0) {
            const maxPrice = Math.max(...validProducts.map(product => {
              const price = parseFloat(
                product.discountedPrice || 
                product.originalPrice || 
                product.prize || 
                product.price || 
                0
              );
              return price;
            }));
            
            // Round up to nearest 1000 for cleaner filter range, minimum 1000
            const roundedMax = Math.max(1000, Math.ceil(maxPrice / 1000) * 1000);
            onMaxPriceUpdate(roundedMax);
          }
        }

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
  }, [masterCategory, secondaryCategory, shopId, onMaxPriceUpdate]);

  // Enhanced product filtering logic
  useEffect(() => {
    if (!products || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products].filter(product => product && product.id);

    // Calculate max price from current products for filter comparison
    const validProducts = products.filter(product => product && product.id);
    const currentMaxPrice = validProducts.length > 0 ? Math.max(...validProducts.map(product => {
      const price = parseFloat(
        product.discountedPrice || 
        product.originalPrice || 
        product.prize || 
        product.price || 
        0
      );
      return price;
    })) : 5000;

    // Apply filters only if any filter is actually selected
    const hasActiveFilters = 
      (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < currentMaxPrice)) ||
      (filters.categories && filters.categories.length > 0) ||
      (filters.brands && filters.brands.length > 0) ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      (filters.fabrics && filters.fabrics.length > 0) ||
      (filters.patterns && filters.patterns.length > 0);

    if (!hasActiveFilters) {
      setFilteredProducts(filtered);
      return;
    }

    // Price range filter
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < currentMaxPrice)) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        const price = parseFloat(
          product.discountedPrice || 
          product.originalPrice || 
          product.prize || 
          product.price || 
          0
        );
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Category filter - match against product category names and IDs
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        // Check various category-related fields
        const categoryMatches = filters.categories.some(filterCategory => {
          return (
            product.categoryId === filterCategory ||
            String(product.categoryId) === String(filterCategory) ||
            product.category === filterCategory ||
            product.categoryName === filterCategory ||
            product.masterCategory === filterCategory ||
            product.secondaryCategory === filterCategory ||
            (product.name && product.name.toLowerCase().includes(filterCategory.toLowerCase()))
          );
        });
        
        return categoryMatches;
      });
    }

    // Brand filter - enhanced matching
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return filters.brands.some(brand => {
          const brandLower = brand.toLowerCase();
          return (
            product.brand?.toLowerCase().includes(brandLower) ||
            product.brandName?.toLowerCase().includes(brandLower) ||
            product.manufacturer?.toLowerCase().includes(brandLower) ||
            product.name?.toLowerCase().includes(brandLower) ||
            product.description?.toLowerCase().includes(brandLower) ||
            product.shortDescription?.toLowerCase().includes(brandLower) ||
            // Check in specifications if available
            (product.specifications && Array.isArray(product.specifications) && 
             product.specifications.some(spec => 
               spec.name?.toLowerCase().includes('brand') && 
               spec.value?.toLowerCase().includes(brandLower)
             ))
          );
        });
      });
    }

    // Color filter - enhanced matching
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return filters.colors.some(color => {
          const colorLower = color.toLowerCase();
          return (
            product.color?.toLowerCase().includes(colorLower) ||
            product.primaryColor?.toLowerCase().includes(colorLower) ||
            product.name?.toLowerCase().includes(colorLower) ||
            product.description?.toLowerCase().includes(colorLower) ||
            product.shortDescription?.toLowerCase().includes(colorLower) ||
            // Check in variants if available
            (product.variants && Array.isArray(product.variants) && 
             product.variants.some(variant => 
               variant.color?.toLowerCase().includes(colorLower)
             )) ||
            // Check in specifications if available
            (product.specifications && Array.isArray(product.specifications) && 
             product.specifications.some(spec => 
               spec.name?.toLowerCase().includes('color') && 
               spec.value?.toLowerCase().includes(colorLower)
             ))
          );
        });
      });
    }

    // Size filter - enhanced matching
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return filters.sizes.some(size => {
          const sizeLower = size.toLowerCase();
          return (
            product.size?.toLowerCase().includes(sizeLower) ||
            product.sizes?.toLowerCase().includes(sizeLower) ||
            product.name?.toLowerCase().includes(sizeLower) ||
            product.description?.toLowerCase().includes(sizeLower) ||
            // Check in variants if available
            (product.variants && Array.isArray(product.variants) && 
             product.variants.some(variant => 
               variant.size?.toLowerCase().includes(sizeLower)
             )) ||
            // Check in specifications if available
            (product.specifications && Array.isArray(product.specifications) && 
             product.specifications.some(spec => 
               spec.name?.toLowerCase().includes('size') && 
               spec.value?.toLowerCase().includes(sizeLower)
             ))
          );
        });
      });
    }

    // Fabric filter - enhanced matching
    if (filters.fabrics && filters.fabrics.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return filters.fabrics.some(fabric => {
          const fabricLower = fabric.toLowerCase();
          return (
            product.fabric?.toLowerCase().includes(fabricLower) ||
            product.material?.toLowerCase().includes(fabricLower) ||
            product.name?.toLowerCase().includes(fabricLower) ||
            product.description?.toLowerCase().includes(fabricLower) ||
            product.shortDescription?.toLowerCase().includes(fabricLower) ||
            // Check in specifications if available
            (product.specifications && Array.isArray(product.specifications) && 
             product.specifications.some(spec => 
               spec.name?.toLowerCase().includes('fabric') && 
               spec.value?.toLowerCase().includes(fabricLower)
             ))
          );
        });
      });
    }

    // Pattern filter - enhanced matching
    if (filters.patterns && filters.patterns.length > 0) {
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        return filters.patterns.some(pattern => {
          const patternLower = pattern.toLowerCase();
          return (
            product.pattern?.toLowerCase().includes(patternLower) ||
            product.style?.toLowerCase().includes(patternLower) ||
            product.design?.toLowerCase().includes(patternLower) ||
            product.name?.toLowerCase().includes(patternLower) ||
            product.description?.toLowerCase().includes(patternLower) ||
            product.shortDescription?.toLowerCase().includes(patternLower) ||
            // Check in specifications if available
            (product.specifications && Array.isArray(product.specifications) && 
             product.specifications.some(spec => 
               spec.name?.toLowerCase().includes('pattern') && 
               spec.value?.toLowerCase().includes(patternLower)
             ))
          );
        });
      });
    }

    if (hasActiveFilters) {
      console.log('Applied filters:', filters, 'Results:', filtered.length, 'out of', products.length);
    }
    setFilteredProducts(filtered);
  }, [products, filters]);

  // Sort products based on selected sort option
  useEffect(() => {
    if (!filteredProducts || filteredProducts.length === 0) {
      setSortedProducts([]);
      return;
    }

    const sorted = [...filteredProducts];

    switch (sortOption) {
      case 'featured':
        // Keep original order or sort by featured flag
        setSortedProducts(sorted);
        break;
      
      case 'best-selling':
        // Sort by sales count or popularity (assuming there's a field for this)
        sorted.sort((a, b) => {
          const salesA = a.salesCount || a.popularity || 0;
          const salesB = b.salesCount || b.popularity || 0;
          return salesB - salesA;
        });
        break;
      
      case 'alphabetically-az':
        sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;
      
      case 'alphabetically-za':
        sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
        break;
      
      case 'price-low-high':
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.discountedPrice || a.originalPrice || a.prize || a.price || 0);
          const priceB = parseFloat(b.discountedPrice || b.originalPrice || b.prize || b.price || 0);
          return priceA - priceB;
        });
        break;
      
      case 'price-high-low':
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.discountedPrice || a.originalPrice || a.prize || a.price || 0);
          const priceB = parseFloat(b.discountedPrice || b.originalPrice || b.prize || b.price || 0);
          return priceB - priceA;
        });
        break;
      
      case 'date-old-new':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.dateAdded || 0);
          const dateB = new Date(b.createdAt || b.dateAdded || 0);
          return dateA - dateB;
        });
        break;
      
      case 'date-new-old':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.dateAdded || 0);
          const dateB = new Date(b.createdAt || b.dateAdded || 0);
          return dateB - dateA;
        });
        break;
      
      default:
        setSortedProducts(sorted);
        return;
    }

    setSortedProducts(sorted);
  }, [filteredProducts, sortOption]);

  // Reset to first page when filters or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOption, masterCategory, secondaryCategory]);

  // Pagination logic
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(sortedProducts.length / productsPerPage);
  };

  const getPageNumbers = () => {
    const totalPages = getTotalPages();
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Grid layout options
  const gridOptions = [2, 3, 4, 5, 6];

  // Sort options configuration
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'best-selling', label: 'Best selling' },
    { value: 'alphabetically-az', label: 'Alphabetically, A-Z' },
    { value: 'alphabetically-za', label: 'Alphabetically, Z-A' },
    { value: 'price-low-high', label: 'Price, low to high' },
    { value: 'price-high-low', label: 'Price, high to low' },
    { value: 'date-old-new', label: 'Date, old to new' },
    { value: 'date-new-old', label: 'Date, new to old' }
  ];

  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  // Handle grid layout change
  const handleGridChange = (columns) => {
    setProductsPerRow(columns);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current sort label
  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(opt => opt.value === sortOption);
    return currentOption ? currentOption.label : 'Featured';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortDropdown]);

  // Helper functions
  const formatPrice = (price, taxPercentage = 0) => {
    if (!price) return '';
    // Add dynamic tax percentage and round up
    const tax = parseFloat(taxPercentage) || 0;
    const priceWithTax = parseFloat(price) * (1 + tax / 100);
    const roundedPrice = Math.ceil(priceWithTax);
    return `₹${roundedPrice.toFixed(2)}`;
  };

  // Calculate discounted price from original price and discount percentage
  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    if (!originalPrice || !discountPercentage || discountPercentage <= 0) {
      return originalPrice;
    }
    // Formula: discountedPrice = originalPrice - (originalPrice * discount/100)
    const discount = parseFloat(originalPrice) * (parseFloat(discountPercentage) / 100);
    const discounted = parseFloat(originalPrice) - discount;
    return Math.round(discounted); // Round up to nearest integer
  };  
  
  // Handle navigation to product details page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const hasDiscount = (product) => {
    if (!product) return false;
    
    // Check for original vs discounted price
    if (product.originalPrice && product.discountedPrice) {
      return parseFloat(product.originalPrice) > parseFloat(product.discountedPrice);
    }
    
    // Check for sale price vs regular price
    if (product.regularPrice && product.salePrice) {
      return parseFloat(product.regularPrice) > parseFloat(product.salePrice);
    }
    
    // Check if product has a discount percentage
    if (product.discount && parseFloat(product.discount) > 0) {
      return true;
    }
    
    // Check if product is marked as on sale
    if (product.onSale || product.isOnSale || product.sale) {
      return true;
    }
    
    return false;
  };

  const handleImageError = (e) => {
    console.log('Image loading error:', e.target.src);
    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
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
  if (sortedProducts.length === 0 && !loading) {
    return (
      <div className="product-grid-container">
        <div className="empty-state">
          <p>{products.length === 0 ? 'No products found' : 'No products match the selected filters'}</p>
          {products.length > 0 && sortedProducts.length === 0 && (
            <p>Try adjusting your filters to see more results.</p>
          )}
        </div>
      </div>
    );
  }

  const paginatedProducts = getPaginatedProducts();

  // Main render
  return (
    <div className="product-grid-container">
      {/* Results Count and Controls */}
      <div className="product-grid-header">        
        <div className="grid-controls">
          {/* Grid View Options */}
          <div className="grid-view-container">
            <div className="grid-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              
              {/* Hover Options */}
              <div className="grid-hover-options">
                {gridOptions.map((columns) => (
                  <button
                    key={columns}
                    className={`grid-option-btn ${productsPerRow === columns ? 'active' : ''}`}
                    onClick={() => handleGridChange(columns)}
                  >
                    {columns}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="sort-container">
            <div className="sort-dropdown">
              <div 
                className="sort-selected"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                }}
              >
                <span>{getCurrentSortLabel()}</span>
                <span className={`arrow ${showSortDropdown ? 'up' : 'down'}`}>▼</span>
              </div>
              
              {showSortDropdown && (
                <div className="sort-options">
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`sort-option ${sortOption === option.value ? 'active' : ''}`}
                      data-value={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortChange(option.value);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="products-main">
        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="no-products">No products found matching your filters.</div>
        ) : (
          <div className={`product-grid-products-grid grid-${productsPerRow}`}>
            {paginatedProducts.map((product) => {
            const isDiscounted = hasDiscount(product);
            
            // Use the S3 image prefix
            const imagePrefix = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";
            
            // Primary image logic
            const primaryImageUrl = product.featureImage ? 
              `${imagePrefix}${product.featureImage}` : 
              (product.image ? `${imagePrefix}${product.image}` : 
              (product.images && product.images.length > 0 ? 
                `${imagePrefix}${product.images[0]}` : 
                'https://via.placeholder.com/300x300?text=No+Image'));
            
            // Hover image logic - try multiple sources
            let hoverImageUrl = null;
            
            if (product.hoverImage) {
              hoverImageUrl = `${imagePrefix}${product.hoverImage}`;
            } else if (product.productImage && product.productImage.length > 1) {
              hoverImageUrl = `${imagePrefix}${product.productImage[1].image}`;
            } else if (product.images && product.images.length > 1) {
              hoverImageUrl = `${imagePrefix}${product.images[1]}`;
            } else if (product.secondaryImage) {
              hoverImageUrl = `${imagePrefix}${product.secondaryImage}`;
            } else if (product.alternateImage) {
              hoverImageUrl = `${imagePrefix}${product.alternateImage}`;
            } else if (product.gallery && product.gallery.length > 1) {
              hoverImageUrl = `${imagePrefix}${product.gallery[1]}`;
            }
            
            // Only use hover image if it's different from primary
            const shouldShowHoverImage = hoverImageUrl && hoverImageUrl !== primaryImageUrl;

            return (
              <div 
                key={product.id} 
                className="product-grid-item" 
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              > 
                <div className="product-grid-image-wrapper">
                  { <div className="product-grid-sale-badge">Sale</div>}
                  
                  
                  {/* Primary Image */}
                  <img
                    src={primaryImageUrl}
                    alt={product.name || 'Product'}
                    className="product-grid-img primary-image"
                    onError={handleImageError}
                  />
                  
                  {/* Hover Image - Only render if different from primary */}
                  {shouldShowHoverImage && (
                    <img
                      src={hoverImageUrl}
                      alt={`${product.name || 'Product'} - Alternate View`}
                      className="product-grid-img hover-image"
                      onError={handleImageError}
                    />
                  )}
                  
                  {/* Action Buttons - Show on Hover */}
                  <div className="product-grid-actions">
                    <button 
                      className="product-grid-action-btn product-grid-cart-btn" 
                      title="Add to Cart"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking the cart button
                        // Add your cart logic here
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="m16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </button>
                    <button 
                      className="product-grid-action-btn product-grid-quick-view-btn" 
                      title="Quick View"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent navigation when clicking the quick view button
                        // Add your quick view logic here
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="product-grid-details">
                  <h4 
                    className="product-grid-title"
                    onClick={(e) => {
                      // Allow click event to propagate for navigation
                      // This is redundant since the parent div already has onClick, 
                      // but I'm adding it for clarity
                      handleProductClick(product.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </h4>
                  
                  <div className="product-grid-price">
                    {isDiscounted ? (
                      <>
                        <span className="product-grid-current-price">
                          {formatPrice(
                            calculateDiscountedPrice(product.prize, product.discount),
                            product.tax || product.taxPercentage || product.gst
                          )}
                        </span>
                        <span className="product-grid-old-price">
                          {formatPrice(product.prize, product.tax || product.taxPercentage || product.gst)}
                        </span>
                      </>
                    ) : (
                      <span className="product-grid-current-price">
                        {formatPrice(product.prize || product.originalPrice || product.discountedPrice, product.tax || product.taxPercentage || product.gst)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {/* Pagination Controls */}
        {sortedProducts.length > productsPerPage && (
          <div className="pagination-container">
            <div className="pagination-controls">
              {/* Previous Button */}
              <button
                className={`pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  className={`pagination-btn page-number ${currentPage === pageNum ? 'active' : ''} ${typeof pageNum !== 'number' ? 'dots' : ''}`}
                  onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                  disabled={typeof pageNum !== 'number'}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                className={`pagination-btn next ${currentPage === getTotalPages() ? 'disabled' : ''}`}
                onClick={() => currentPage < getTotalPages() && handlePageChange(currentPage + 1)}
                disabled={currentPage === getTotalPages()}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;