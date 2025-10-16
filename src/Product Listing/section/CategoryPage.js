import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/CategoryPage.css';
import { getSecondaryCategories } from 'shops-query/src/modules/SecondaryCategories/queries/index.js';
import { fetchMasterCategories } from 'shops-query/src/modules/masterCategories/index.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import ProductGrid from './ProductGrid';
import FilterSidebar from './FilterSidebar';

const CategoryPage = () => {
  const { id, shopId } = useParams();
  const navigate = useNavigate();
  const [secondaries, setSecondaries] = useState([]);
  const [masterCategory, setMasterCategory] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reset selected secondary when navigating to different master category
        setSelectedSecondary(null);
        
        // Get dynamic shop ID - use from URL params or fallback to config
        const currentShopId = shopId || HOME_CONFIG.shopId;
        console.log('CategoryPage: Using shopId:', currentShopId, 'from URL:', shopId, 'fallback:', HOME_CONFIG.shopId);
        
        // Fetch master categories to get the current category details
        const masterData = await fetchMasterCategories(currentShopId);
        
        // Find the current master category (handle both string and number IDs)
        const currentMaster = masterData.find(cat => 
          String(cat.id) === String(id) || cat.id === parseInt(id)
        );
        setMasterCategory(currentMaster);
        
        // Fetch secondary categories
        const data = await getSecondaryCategories(currentShopId, id);
        const active = (data || []).filter(s => s.status === 'active' || s.status === 1);
        setSecondaries(active);
        
        // Automatically select the first subcategory if available
        if (active.length > 0) {
          setSelectedSecondary(active[0]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, shopId]);

  // Handle secondary category selection (no navigation)
  const handleSecondaryClick = (secondary) => {
    setSelectedSecondary(secondary);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleMaxPriceUpdate = useCallback((newMaxPrice) => {
    setMaxPrice(newMaxPrice);
  }, []);

  // Scroll functions for the banner thumbnails
  const scrollLeft = () => {
    const container = document.querySelector('.bannerThumbnailsRow');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.bannerThumbnailsRow');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="categoryPageContainer">
        <div className="loading-state">
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoryPageContainer">
        <div className="error-state">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categoryPageContainer">
      {/* Hero Banner with Master Category Background */}
      <div className="categoryHeroBanner" style={{
        backgroundImage: masterCategory && masterCategory.image 
          ? `url(${IMAGE_PREFIX}${masterCategory.image})` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundColor: '#667eea'
      }}>
        <div className="category-bannerOverlay">
          {/* Title and Breadcrumb */}
          <div className="categoryBannerContent">
            <div className="categoryBreadcrumb">
              <span onClick={() => navigate('/')} className="categoryBreadcrumbLink">Home</span>
              <span className="categoryBreadcrumbSeparator">›</span>
              <span className="categoryBreadcrumbCurrent">{masterCategory?.category}</span>
            </div>
            <h1 className="categoryBannerTitle">{masterCategory?.category}</h1>
          </div>

          {/* Secondary Categories Thumbnails Row */}
          {secondaries.length > 0 && (
            <div className="categoryBannerThumbnailsSection">
              <button className="categoryThumbnailArrow categoryLeftArrow" onClick={scrollLeft}>
                <FiChevronLeft />
              </button>
              
              <div className="categoryBannerThumbnailsRow">
                {secondaries.map((s) => (
                  <div 
                    key={s.id} 
                    className={`categoryBannerThumbnail ${selectedSecondary?.id === s.id ? 'selected' : ''}`}
                    onClick={() => handleSecondaryClick(s)}
                  >
                    <div className="categoryThumbnailImage">
                      <img
                        src={`${IMAGE_PREFIX}${s.image}`}
                        alt={s.category}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="categoryThumbnailName">{s.category}</div>
                  </div>
                ))}
              </div>

              <button className="categoryThumbnailArrow categoryRightArrow" onClick={scrollRight}>
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="categoryProductsSection">
        {/* Products with Filters Layout */}
        <div className="categoryProducts-with-filters">
          <FilterSidebar 
            onFiltersChange={handleFiltersChange}
            masterCategoryId={id}
            shopId={shopId || HOME_CONFIG.shopId}
            maxPrice={maxPrice}
          />
          <ProductGrid 
            masterCategory={id}
            secondaryCategory={selectedSecondary?.id}
            filters={filters}
            shopId={shopId || HOME_CONFIG.shopId}
            key={`${id}-${selectedSecondary?.id || 'all'}`}
            onMaxPriceUpdate={handleMaxPriceUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;