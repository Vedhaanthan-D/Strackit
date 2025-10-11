import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { GET_BANNER_DATA } from 'shops-query/src/modules/banner/queries/get.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../../config/appIds.js';
import '../styles/slidingbanner.css';

// Loading Skeleton Component
const BannerSkeleton = () => (
  <div className="slider">
    <div className="imageContainer">
      <div className="bannerSkeleton">
        <div className="skeletonImage"></div>
        <div className="homeBannerOverlay">
          <div className="homeBannerContent banner1Content">
            <div className="skeletonText skeletonLabel"></div>
            <div className="skeletonText skeletonTitle"></div>
            <div className="skeletonText skeletonDescription"></div>
            <div className="skeletonButton"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [bannerContent, setBannerContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Fetch banner data on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        
        // Fetch banners using the GET_BANNER_DATA function
        const bannerData = await GET_BANNER_DATA({ shopId: HOME_CONFIG.shopId });
        
        if (bannerData && bannerData.length > 0) {
          // Sort banners by priority
          const sortedBanners = [...bannerData].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          
          // Process banners with S3 image prefix
          const processedBanners = sortedBanners.map((bannerItem, index) => ({
            id: bannerItem.id,
            title: bannerItem.title,
            image: bannerItem.image ? `${IMAGE_PREFIX}${bannerItem.image}` : '',
            link: bannerItem.link,
            priority: bannerItem.priority
          }));
          
          setBanners(processedBanners);
          
          // Create banner content
          const dynamicContent = processedBanners.map((bannerItem, index) => {
            // Get the corresponding raw data item
            const rawItem = bannerData[index] || {};
            
            return {
              label: rawItem.label,
              title: bannerItem.title,
              description: rawItem.description,
              buttonText: rawItem.buttonText,
              link: bannerItem.link
            };
          });
          setBannerContent(dynamicContent);
          setError(null);
          
        } else {
          setBanners([]);
          setBannerContent([]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError(err);
        setBanners([]);
        setBannerContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Start animation when component mounts and image is loaded
  useEffect(() => {
    if (imageLoaded && !animationStarted && !loading && banners.length > 0) {
      // Start animations after a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setAnimationStarted(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, animationStarted, loading, banners]);

  // Handle image load events with animation
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageLoaded(true);
  };

  const handleImageError = (e) => {
    setImageLoading(false);
    setImageLoaded(false);
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };
  
  const goToNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };
  
  // Handle banner click
  const handleBannerClick = () => {
    if (bannerContent[currentIndex]?.link) {
      window.location.href = bannerContent[currentIndex].link;
    }
  };

  // Show loading skeleton while loading
  if (loading && banners.length === 0) {
    return <BannerSkeleton />;
  }

  // Don't render anything if no banners available
  if (banners.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="slider">
      <div className="imageContainer">        
        <img 
          src={banners[currentIndex]?.image} 
          alt={banners[currentIndex]?.title}
          className={`bannerImage ${animationStarted ? 'animate-in' : 'pre-animate'}`}
          onClick={handleBannerClick}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ cursor: bannerContent[currentIndex]?.link ? 'pointer' : 'default' }}
        />
        
        {/* Banner Overlay Content */}
        <div className="homeBannerOverlay">
          <div className={`homeBannerContent ${currentIndex === 0 ? 'homeBanner1Content' : 'homeBanner2Content'}`}>
            <span className={`bannerLabel ${animationStarted ? 'animate-in' : 'pre-animate'}`}>
              {bannerContent[currentIndex]?.label}
            </span>
            <h1 className={`bannerTitle ${animationStarted ? 'animate-in' : 'pre-animate'}`}>
              {bannerContent[currentIndex]?.title}
            </h1>
            <p className={`bannerDescription ${animationStarted ? 'animate-in' : 'pre-animate'}`}>
              {bannerContent[currentIndex]?.description || 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur'}
            </p>
            <button 
              className={`bannerButton ${animationStarted ? 'animate-in' : 'pre-animate'}`}
              onClick={handleBannerClick}
            >
              <span className="buttonTextWrapper">
                <span className="buttonTextTop">{bannerContent[currentIndex]?.buttonText || 'SHOP NOW'}</span>
                <span className="buttonTextBottom">{bannerContent[currentIndex]?.buttonText || 'SHOP NOW'}</span>
              </span>
            </button>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          className="arrow leftArrow"
          onClick={goToPrevious}
          aria-label="Previous banner"
        >
          <FiChevronLeft className="arrow-icon" />
        </button>
        
        <button 
          className="arrow rightArrow"
          onClick={goToNext}
          aria-label="Next banner"
        >
          <FiChevronRight className="arrow-icon" />
        </button>
      </div>
    </div>
  );
};

export default BannerSlider;
