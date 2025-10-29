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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reset selected secondary when navigating to different master category
        setSelectedSecondary(null);
        
        // Validate that we have a master category ID
        if (!id) {
          throw new Error('Master category ID is required');
        }
        
        // Get dynamic shop ID - use from URL params or fallback to config
        const currentShopId = shopId || HOME_CONFIG.shopId;
        console.log('CategoryPage: Using shopId:', currentShopId, 'from URL:', shopId, 'fallback:', HOME_CONFIG.shopId);
        console.log('CategoryPage: Master category ID from URL:', id);
        
        // Fetch master categories to get the current category details
        const masterData = await fetchMasterCategories(currentShopId);
        
        // Find the current master category (handle both string and number IDs)
        const currentMaster = masterData.find(cat => 
          String(cat.id) === String(id) || cat.id === parseInt(id)
        );
        setMasterCategory(currentMaster);
        
        // Fetch secondary categories only if we have a valid master category ID
        if (id && currentMaster) {
          // Ensure the master category ID is passed as a string
          const masterCategoryId = String(currentMaster.id || id);
          console.log('Fetching secondary categories for masterCategoryId:', masterCategoryId);
          
          const data = await getSecondaryCategories(currentShopId, masterCategoryId);
          const active = (data || []).filter(s => 
            s.status === 'active' || 
            s.status === 1 || 
            s.status === true || 
            (s.status === undefined || s.status === null)  // Include items without status (treat as active by default)
          );
          setSecondaries(active);
          
          // Automatically select the first subcategory if available
          if (active.length > 0) {
            setSelectedSecondary(active[0]);
          }
        } else {
          console.warn('No valid master category ID found:', { id, currentMaster });
          setSecondaries([]);
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

  // Create looped categories array with clones (like the reference carousel)
  const getLoopedCategories = () => {
    if (secondaries.length === 0) return [];
    // Clone items at beginning and end for seamless infinite loop
    return [...secondaries, ...secondaries, ...secondaries,...secondaries,...secondaries,...secondaries,...secondaries];
  };

  // Initialize to middle set for seamless looping (start at beginning of middle set)
  useEffect(() => {
    if (secondaries.length > 0) {
      // Start at the beginning of the middle set (first item of second copy)
      setCurrentSlide(secondaries.length);
    }
  }, [secondaries]);

  // Handle arrow navigation with transform-based sliding
  const scrollLeft = () => {
    if (secondaries.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(prev => prev - 1);
    
    // After transition, check if we need to reset to middle set
    setTimeout(() => {
      setCurrentSlide(prev => {
        if (prev < secondaries.length) {
          // We're in the first cloned set, jump to equivalent in middle set
          setIsTransitioning(false); // Disable transition before jumping
          return prev + secondaries.length;
        }
        return prev;
      });
      setIsTransitioning(false);
    }, 200);
  };

  const scrollRight = () => {
    if (secondaries.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(prev => prev + 1);
    
    // After transition, check if we need to reset to middle set
    setTimeout(() => {
      setCurrentSlide(prev => {
        if (prev >= secondaries.length * 2) {
          // We're in the last cloned set, jump to equivalent in middle set
          setIsTransitioning(false); // Disable transition before jumping
          return prev - secondaries.length;
        }
        return prev;
      });
      setIsTransitioning(false);
    }, 200);
  };

  // Calculate transform value based on current slide
  const getTransformValue = () => {
    const itemWidth = 140; // 120px + 20px gap (matching reference)
    // Adjust the starting position to show items from the beginning
    const offset = currentSlide * itemWidth;
    return `translate3d(-${offset}px, 0px, 0px)`;
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
            <h1 className="categoryBannerTitle">{masterCategory?.category}</h1> 
            <div className="categoryBreadcrumb">
              <span onClick={() => navigate('/')} className="categoryBreadcrumbLink">Home</span>
              <span className="categoryBreadcrumbSeparator">›</span>
              <span className="categoryBreadcrumbCurrent">{masterCategory?.category}</span>
            </div>
          </div>

          {/* Secondary Categories Thumbnails Row */}
          {secondaries.length > 0 && (
            <div className="categoryBannerThumbnailsSection">
              <button className="categoryThumbnailArrow categoryLeftArrow" onClick={scrollLeft}>
                <FiChevronLeft />
              </button>
              
              <div className="categoryBannerThumbnailsRow" style={{ overflow: 'hidden', width: '100%' }}>
                <div 
                  className="categoryBannerThumbnailsList"
                  style={{  
                    display: 'flex',
                    gap: '60px',
                    transform: getTransformValue(),
                    transition: isTransitioning ? 'transform 200ms ease' : 'none',
                    padding: '10px 0px',
                    width: '100%'
                  }}
                >
                  {getLoopedCategories().map((s, index) => (
                    <div 
                      key={`${s.id}-${index}`} 
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