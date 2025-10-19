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

  // Handle price range change
  const handlePriceChange = (type, value) => {
    const newValue = parseInt(value) || 0;
    
    setFilters(prev => {
      const newPriceRange = { ...prev.priceRange };
      
      if (type === 'min') {
        // Ensure min doesn't exceed max
        newPriceRange.min = Math.min(newValue, newPriceRange.max);
      } else {
        // Ensure max doesn't go below min
        newPriceRange.max = Math.max(newValue, newPriceRange.min);
      }
      
      return {
        ...prev,
        priceRange: newPriceRange
      };
    });
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

  // Remove individual filter
  const removeFilter = (filterType, value = null) => {
    setFilters(prev => {
      if (filterType === 'priceRange') {
        return {
          ...prev,
          priceRange: { min: 0, max: maxPrice }
        };
      } else if (value) {
        // Remove specific value from array filter
        return {
          ...prev,
          [filterType]: (prev[filterType] || []).filter(item => item !== value)
        };
      } else {
        // Clear entire filter category
        return {
          ...prev,
          [filterType]: []
        };
      }
    });
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];
    
    // Price range filter
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < maxPrice)) {
      active.push({
        type: 'priceRange',
        label: `₹${filters.priceRange.min} - ₹${filters.priceRange.max}`,
        value: null
      });
    }
    
    // Array filters
    ['categories', 'brands', 'colors', 'sizes', 'fabrics', 'patterns'].forEach(filterType => {
      if (filters[filterType] && filters[filterType].length > 0) {
        filters[filterType].forEach(value => {
          active.push({
            type: filterType,
            label: value,
            value: value
          });
        });
      }
    });
    
    return active;
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

  return (
    <div className="filter-sidebar">
      {/* Active Filters Display */}
      {getActiveFilters().length > 0 && (
        <div className="active-filters">
          <div className="active-filters-content">
            {getActiveFilters().map((filter, index) => (
              <div key={index} className="filter-chip">
                <button 
                  className="filter-chip-remove"
                  onClick={() => removeFilter(filter.type, filter.value)}
                  aria-label={`Remove ${filter.label} filter`}
                >
                  ×
                  <span className="filter-chip-label">{filter.label}</span>
                </button>
              </div>
            ))}
            <button className="clear-all-link" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Categories Filter - Clean Style */}
      <div className="filter-section">
        <h4 className="filter-title clean-style">CATEGORIES</h4>
        <div className="filter-options">
          {getCategories().slice(0, 10).map((category) => (
            <label key={category} className="filter-option-link">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCheckboxFilter('categories', category)}
                className="hidden-checkbox"
              />
              <span className="filter-text">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="filter-section">
        <h4 className="filter-title clean-style">PRICE</h4>
        <div className="filter-options">
          <div className="price-range">
            <div className="price-slider-container">
              <div 
                className="price-track"
                style={{
                  left: `${(filters.priceRange.min / maxPrice) * 100}%`,
                  width: `${((filters.priceRange.max - filters.priceRange.min) / maxPrice) * 100}%`
                }}
              ></div>
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
              <div className="price-label">Price:</div>
              <div className="price-input">₹{filters.priceRange.min}</div>
              <span className="price-separator">-</span>
              <div className="price-input">₹{filters.priceRange.max}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Filter */}
      {colors.length > 0 && (
        <div className="filter-section">
          <h4 className="filter-title clean-style">COLOR</h4>
          <div className="filter-options">
            <div className="color-grid">
              {colors.slice(0, 6).map((color) => (
                <div 
                  key={color}
                  className={`color-dot ${filters.colors.includes(color) ? 'selected' : ''}`}
                  style={{ backgroundColor: color.toLowerCase() === 'black' ? '#000' : 
                          color.toLowerCase() === 'white' ? '#fff' :
                          color.toLowerCase() === 'blue' ? '#0066cc' :
                          color.toLowerCase() === 'red' ? '#cc0000' :
                          color.toLowerCase() === 'green' ? '#00cc00' :
                          color.toLowerCase() === 'pink' ? '#ff99cc' :
                          color.toLowerCase() === 'gray' || color.toLowerCase() === 'grey' ? '#888' :
                          color.toLowerCase() }}
                  onClick={() => handleCheckboxFilter('colors', color)}
                  title={color}
                >
                  {filters.colors.includes(color) && <span className="color-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tag/Size Filter */}
      {sizes.length > 0 && (
        <div className="filter-section">
          <h4 className="filter-title clean-style">TAG</h4>
          <div className="filter-options">
            <div className="tag-grid">
              {sizes.slice(0, 8).map((size) => (
                <button
                  key={size}
                  className={`tag-button ${filters.sizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => handleCheckboxFilter('sizes', size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="filter-section">
          <h4 className="filter-title clean-style">BRAND</h4>
          <div className="filter-options">
            {brands.slice(0, 8).map((brand) => (
              <label key={brand} className="filter-option-link">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => handleCheckboxFilter('brands', brand)}
                  className="hidden-checkbox"
                />
                <span className="filter-text">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FilterSidebar;