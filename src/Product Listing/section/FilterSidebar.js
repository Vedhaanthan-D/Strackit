import React, { useState, useEffect } from 'react';
import { getSpecificationsByShop } from 'shops-query/src/modules/Specifications/queries/index.js';
import { HOME_CONFIG } from '../../config/appIds.js';
import '../styles/FilterSidebar.css';

const FilterSidebar = ({ onFiltersChange, masterCategoryId, shopId, maxPrice = 5000 }) => {
  const [specifications, setSpecifications] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: maxPrice },
    categories: [],
    brands: [],
    colors: [],
    sizes: [],
    fabrics: [],
    patterns: [],
    customSpecs: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    color: true,
    size: true,
    brand: true,
    fabric: true,
    pattern: true
  });

  // Fetch specifications from the module
  useEffect(() => {
    const fetchSpecifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentShopId = shopId || HOME_CONFIG.shopId;
        console.log('FilterSidebar: Fetching specs for shopId:', currentShopId);
        
        const specs = await getSpecificationsByShop(currentShopId);
        
        // Ensure specs is an array
        const safeSpecs = Array.isArray(specs) ? specs : [];
        console.log('FilterSidebar: Fetched specifications:', safeSpecs.length, 'items for shop:', currentShopId);
        
        // For now, show all specifications regardless of master category to see all available filters
        // Later we can filter by category if needed
        const filteredSpecs = safeSpecs;
        
        setSpecifications(filteredSpecs);
      } catch (err) {
        console.error('Error fetching specifications:', err);
        setError(err.message || 'Failed to load filter options');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecifications();
  }, [masterCategoryId, shopId]);

  // Update price range when maxPrice changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: { 
        ...prev.priceRange,
        max: maxPrice
      }
    }));
  }, [maxPrice]);

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle price range change
  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: parseInt(value) || 0
      }
    }));
  };

  // Handle checkbox filters (categories, brands, colors, sizes)
  const handleCheckboxFilter = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const isSelected = currentValues.includes(value);
      
      return {
        ...prev,
        [filterType]: isSelected
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value]
      };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: 0, max: maxPrice },
      categories: [],
      brands: [],
      colors: [],
      sizes: [],
      fabrics: [],
      patterns: [],
      customSpecs: {}
    });
  };

  // Get unique values from specifications for common filters
  const getUniqueSpecValues = (specName) => {
    if (!specifications || !Array.isArray(specifications)) return [];
    
    const values = new Set();
    specifications.forEach(spec => {
      if (spec && spec.SpecificationsMaster && Array.isArray(spec.SpecificationsMaster)) {
        spec.SpecificationsMaster.forEach(master => {
          if (master && master.name && master.name.toLowerCase().includes(specName.toLowerCase()) && 
              master.Specification && Array.isArray(master.Specification)) {
            master.Specification.forEach(specValue => {
              if (specValue && specValue.value && specValue.value.trim() !== '') {
                values.add(specValue.value.trim());
              }
            });
          }
        });
      }
    });

    return Array.from(values);
  };

  // Get predefined categories from specifications
  const getCategories = () => {
    if (!specifications || !Array.isArray(specifications)) return [];
    
    const categories = new Set();
    specifications.forEach(spec => {
      if (spec && spec.category && spec.category.trim() !== '') {
        categories.add(spec.category.trim());
      }
    });
    return Array.from(categories);
  };

  if (loading) {
    return (
      <div className="filter-sidebar">
        <div className="filter-loading">
          <p>Loading filters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="filter-sidebar">
        <div className="filter-error">
          <p>Error loading filters: {error}</p>
        </div>
      </div>
    );
  }

  const colors = getUniqueSpecValues('color');
  const sizes = getUniqueSpecValues('size');
  const brands = getUniqueSpecValues('brand');
  const fabrics = getUniqueSpecValues('fabric');
  const patterns = getUniqueSpecValues('pattern');


  
  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.fabrics && filters.fabrics.length > 0) count += filters.fabrics.length;
    if (filters.patterns && filters.patterns.length > 0) count += filters.patterns.length;
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < maxPrice)) count += 1;
    return count;
  };

  return (
    <div className="filter-sidebar">
      {/* Filter Header */}
      <div className="filter-header">
        <h3>CATEGORIES</h3>
        <button className="clear-filters" onClick={clearAllFilters}>
          Clear All {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </button>
      </div>

      {/* Categories Filter */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('categories')}
        >
          <span>All Categories {filters.categories.length > 0 && `(${filters.categories.length})`}</span>
          <span className={`arrow ${expandedSections.categories ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {expandedSections.categories && (
          <div className="filter-options">
            {getCategories().map((category) => (
              <label key={category} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCheckboxFilter('categories', category)}
                />
                <span className="checkmark"></span>
                <span className="filter-label">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <div 
          className="filter-section-header"
          onClick={() => toggleSection('price')}
        >
          <span>PRICE</span>
          <span className={`arrow ${expandedSections.price ? 'expanded' : ''}`}>
            ▼
          </span>
        </div>
        {expandedSections.price && (
          <div className="filter-options">
            <div className="price-range">
              <div className="price-slider-container">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="price-slider min-slider"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-slider max-slider"
                />
              </div>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Color Filter */}
      {colors.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('color')}
          >
            <span>COLOUR {filters.colors.length > 0 && `(${filters.colors.length})`}</span>
            <span className={`arrow ${expandedSections.color ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.color && (
            <div className="filter-options">
              <div className="color-options">
                {colors.map((color) => (
                  <div 
                    key={color}
                    className={`color-circle ${filters.colors.includes(color) ? 'selected' : ''}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => handleCheckboxFilter('colors', color)}
                    title={color}
                  >
                    {filters.colors.includes(color) && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Size Filter */}
      {sizes.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('size')}
          >
            <span>SIZE {filters.sizes.length > 0 && `(${filters.sizes.length})`}</span>
            <span className={`arrow ${expandedSections.size ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.size && (
            <div className="filter-options">
              <div className="size-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-button ${filters.sizes.includes(size) ? 'selected' : ''}`}
                    onClick={() => handleCheckboxFilter('sizes', size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('brand')}
          >
            <span>BRAND {filters.brands.length > 0 && `(${filters.brands.length})`}</span>
            <span className={`arrow ${expandedSections.brand ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.brand && (
            <div className="filter-options">
              {brands.map((brand) => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleCheckboxFilter('brands', brand)}
                  />
                  <span className="checkmark"></span>
                  <span className="filter-label">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fabric Filter */}
      {fabrics.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('fabric')}
          >
            <span>FABRIC</span>
            <span className={`arrow ${expandedSections.fabric ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.fabric && (
            <div className="filter-options">
              {fabrics.map((fabric) => (
                <label key={fabric} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.fabrics?.includes(fabric) || false}
                    onChange={() => handleCheckboxFilter('fabrics', fabric)}
                  />
                  <span className="checkmark"></span>
                  <span className="filter-label">{fabric}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pattern Filter */}
      {patterns.length > 0 && (
        <div className="filter-section">
          <div 
            className="filter-section-header"
            onClick={() => toggleSection('pattern')}
          >
            <span>PATTERN</span>
            <span className={`arrow ${expandedSections.pattern ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>
          {expandedSections.pattern && (
            <div className="filter-options">
              {patterns.map((pattern) => (
                <label key={pattern} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.patterns?.includes(pattern) || false}
                    onChange={() => handleCheckboxFilter('patterns', pattern)}
                  />
                  <span className="checkmark"></span>
                  <span className="filter-label">{pattern}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}



      {/* Shopify Trial Banner */}
      {/* <div className="shopify-banner">
        <div className="shopify-content">
          <h4>Enjoy a free 3-day trial.</h4>
          <p>Then start selling for ₹75/month for your first 3 months.</p>
          <button className="shopify-button">Start free trial</button>
        </div>
      </div> */}
    </div>
  );
};

export default FilterSidebar;