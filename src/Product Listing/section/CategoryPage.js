import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/CategoryPage.css';
import { getSecondaryCategories } from 'shops-query/src/modules/SecondaryCategories/queries/index.js';
import { fetchMasterCategories } from 'shops-query/src/modules/masterCategories/index.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds.js';
import ProductGrid from './ProductGrid';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [secondaries, setSecondaries] = useState([]);
  const [masterCategory, setMasterCategory] = useState(null);
  const [selectedSecondary, setSelectedSecondary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch master categories to get the current category details
        const masterData = await fetchMasterCategories(HOME_CONFIG.shopId);
        
        // Find the current master category (handle both string and number IDs)
        const currentMaster = masterData.find(cat => 
          String(cat.id) === String(id) || cat.id === parseInt(id)
        );
        setMasterCategory(currentMaster);
        
        // Fetch secondary categories
        const data = await getSecondaryCategories(HOME_CONFIG.shopId, id);
        const active = (data || []).filter(s => s.status === 'active' || s.status === 1);
        setSecondaries(active);
      } catch (err) {
        setError(err.message || 'Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle secondary category selection (no navigation)
  const handleSecondaryClick = (secondary) => {
    setSelectedSecondary(secondary);
  };

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
      <div className="heroBanner" style={{
        backgroundImage: masterCategory && masterCategory.image 
          ? `url(${IMAGE_PREFIX}${masterCategory.image})` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundColor: '#667eea'
      }}>
        <div className="bannerOverlay">
          {/* Title and Breadcrumb */}
          <div className="bannerContent">
            <div className="breadcrumb">
              <span onClick={() => navigate('/')} className="breadcrumbLink">Home</span>
              <span className="breadcrumbSeparator">›</span>
              <span className="breadcrumbCurrent">{masterCategory?.category}</span>
            </div>
            <h1 className="bannerTitle">{masterCategory?.category}</h1>
          </div>

          {/* Secondary Categories Thumbnails Row */}
          {secondaries.length > 0 && (
            <div className="bannerThumbnailsSection">
              <button className="thumbnailArrow leftArrow" onClick={scrollLeft}>
                <FiChevronLeft />
              </button>
              
              <div className="bannerThumbnailsRow">
                {secondaries.map((s) => (
                  <div 
                    key={s.id} 
                    className={`bannerThumbnail ${selectedSecondary?.id === s.id ? 'selected' : ''}`}
                    onClick={() => handleSecondaryClick(s)}
                  >
                    <div className="thumbnailImage">
                      <img
                        src={`${IMAGE_PREFIX}${s.image}`}
                        alt={s.category}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="thumbnailName">{s.category}</div>
                  </div>
                ))}
              </div>

              <button className="thumbnailArrow rightArrow" onClick={scrollRight}>
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="productsSection">
        <div className="categoryInfo">
          <h2>
            {selectedSecondary 
              ? `${masterCategory?.category} - ${selectedSecondary.category}` 
              : masterCategory?.category
            }
          </h2>
          {selectedSecondary && (
            <p className="categoryDescription">
              Showing products from {selectedSecondary.category}
            </p>
          )}
        </div>
        
        <ProductGrid 
          masterCategory={id}
          secondaryCategory={selectedSecondary?.id}
        />
      </div>
    </div>
  );
};

export default CategoryPage;