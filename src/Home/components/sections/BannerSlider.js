import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import banner from 'shops-query/src/modules/banner/index.js';
import banner1 from '../../assets/Banner 1.webp';
import banner2 from '../../assets/Banner 2.webp';
import '../styles/slidingbanner.css';

// Loading Skeleton Component
const BannerSkeleton = () => (
  <div className="slider">
    <div className="imageContainer">
      <div className="bannerSkeleton">
        <div className="skeletonImage"></div>
        <div className="bannerOverlay">
          <div className="bannerContent banner1Content">
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
  
  // S3 image prefix for dynamic banner images
  const imagePrefix = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";

  // Static fallback banners
  // const fallbackBanners = [
  //   {
  //     id: 'fallback-1',
  //     title: 'Explore the Latest Collection',
  //     image: banner1,
  //     link: '/collection',
  //     priority: 1
  //   },
  //   {
  //     id: 'fallback-2',
  //     title: 'Dress For Important Parties',
  //     image: banner2,
  //     link: '/parties',
  //     priority: 2
  //   }
  // ];

  // Static fallback content
  // const fallbackContent = [
  //   {
  //     label: "WOMEN'S FASHION",
  //     title: "Explore the Latest Collection",
  //     description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur",
  //     buttonText: "SHOP NOW",
  //     link: "/collection"
  //   },
  //   {
  //     label: "WOMEN'S FASHION", 
  //     title: "Dress For Important Parties",
  //     description: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur",
  //     buttonText: "SHOP NOW",
  //     link: "/parties"
  //   }
  // ];

  // Fetch banner data on component mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        console.log('🚀 Starting banner fetch process...');
        console.log('📋 API Requirements Check:');
        console.log('   - Shop ID: 512 (required for shop context)');
        console.log('   - User ID: 198 (may be required for personalization)');
        console.log('   - API might need authentication headers or tokens');
        console.log('   - GraphQL schema might require specific field names');
        
        // Inline test function for development
        const testFilters = async () => {
          console.log('🧪 Testing different banner filter formats...');
          
          // First, test basic connectivity
          try {
            console.log('🌐 Testing API connectivity...');
            const response = await fetch('https://api.shop.strackit.com/graphql', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-shop-id': '512',
                'x-user-id': '198',
              },
              body: JSON.stringify({
                query: `query { __schema { types { name } } }`
              })
            });
            const result = await response.json();
            console.log('✅ API connectivity test:', response.status, result);
          } catch (connectError) {
            console.warn('❌ API connectivity failed:', connectError);
          }
          
          const testCases = [
            { name: 'Empty filter', filter: {} },
            { name: 'Null filter', filter: null },
            { name: 'Shop ID filter', filter: { shopId: 512 } },
            { name: 'Shop ID filter (string)', filter: { shopId: '512' } },
            { name: 'Shop and User ID', filter: { shopId: 512, userId: 198 } },
            { name: 'Shop context', filter: { shop: { id: 512 } } },
            { name: 'ID as number', filter: { id: 198 } },
            { name: 'ID as string', filter: { id: '198' } },
            { name: 'ID with eq operator', filter: { id: { eq: 198 } } },
            { name: 'Shop specific banner', filter: { shopId: 512, id: 198 } },
          ];
          
          for (const testCase of testCases) {
            try {
              console.log(`🧪 Testing: ${testCase.name}`, testCase.filter);
              const result = await banner.fetchBanner(testCase.filter);
              console.log(`✅ ${testCase.name} succeeded:`, result?.length || 0, 'banners found');
              if (result && result.length > 0) {
                console.log('Sample banner:', {
                  id: result[0].id,
                  title: result[0].title,
                  image: result[0].image?.substring(0, 50) + '...'
                });
              }
            } catch (error) {
              console.warn(`❌ ${testCase.name} failed:`, error.message);
            }
          }
        };
        
        // Run tests in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 API Configuration Check:');
          console.log('- Shop ID: 512');
          console.log('- User ID: 198'); 
          console.log('- API Endpoint: https://api.shop.strackit.com/graphql');
          console.log('- Testing different authentication approaches...');
          await testFilters();
        }
        
        // First try to fetch banners for specific shop (ID: 12)
        let bannerData = null;
        try {
          console.log('🏪 Attempting to fetch banners for shop ID 512...');
          const shopFilter = {
            shopId: 512 // Use shop ID 512
          };
          bannerData = await banner.fetchBanner(shopFilter);
          console.log('✅ Shop banners fetched (Shop ID 512):', bannerData);
        } catch (shopError) {
          console.warn('❌ Failed to fetch shop banners:', shopError);
        }
        
        // If shop-specific banners not found, try with shop and user context
        if (!bannerData || bannerData.length === 0) {
          try {
            console.log('🎯 Attempting to fetch banners with shop ID 512 and user ID 198...');
            const contextFilter = { 
              shopId: 512,
              userId: 198
            };
            bannerData = await banner.fetchBanner(contextFilter);
            console.log('✅ Context banners fetched:', bannerData);
          } catch (contextError) {
            console.warn('❌ Failed to fetch context banners:', contextError);
          }
        }
        
        // Try specific banner ID 198 with shop context
        if (!bannerData || bannerData.length === 0) {
          try {
            console.log('🎯 Attempting to fetch specific banner ID 198 with shop context...');
            const specificFilter = { 
              shopId: 512,
              id: 198
            };
            bannerData = await banner.fetchBanner(specificFilter);
            console.log('✅ Specific banner with context fetched:', bannerData);
          } catch (specificError) {
            console.warn('❌ Failed to fetch specific banner with context:', specificError);
            
            // Try alternative formats
            try {
              console.log('🔄 Trying alternative context format...');
              const altFilter = { 
                shop: { id: 512 },
                banner: { id: 198 }
              };
              bannerData = await banner.fetchBanner(altFilter);
              console.log('✅ Alternative context format worked:', bannerData);
            } catch (altError) {
              console.warn('❌ Alternative context format failed:', altError);
            }
          }
        }
        
        // Fallback to basic ID search
        if (!bannerData || bannerData.length === 0) {
          try {
            console.log('🎯 Attempting to fetch specific banner with ID 198...');
            const specificFilter = { 
              id: 198 // Try direct ID instead of { eq: 198 }
            };
            bannerData = await banner.fetchBanner(specificFilter);
            console.log('✅ Specific banner data fetched (ID 198):', bannerData);
          } catch (specificError) {
            console.warn('❌ Failed to fetch specific banner ID 198:', specificError);
            
            // Try alternative ID filter format
            try {
              console.log('🔄 Trying alternative ID filter format...');
              const altFilter = { 
                id: { eq: 198 }
              };
              bannerData = await banner.fetchBanner(altFilter);
              console.log('✅ Alternative ID filter worked:', bannerData);
            } catch (altError) {
              console.warn('❌ Alternative ID filter also failed:', altError);
            }
          }
        }
        
        // If specific banner not found, try fetching all banners
        if (!bannerData || bannerData.length === 0) {
          console.log('🌐 Trying to fetch all banners without any filter...');
          try {
            // Try with empty filter
            bannerData = await banner.fetchBanner({});
            console.log('📊 All banners fetched:', bannerData);
            
            // Filter for ID 198 client-side if we got multiple banners
            if (bannerData && bannerData.length > 0) {
              const banner198 = bannerData.find(bannerItem => bannerItem.id === 198 || bannerItem.id === '198');
              if (banner198) {
                console.log('🎯 Found banner 198 in results:', banner198);
                bannerData = [banner198]; // Use only the specific banner
              } else {
                console.log('📋 Available banner IDs:', bannerData.map(b => b.id));
                // Keep first few banners if 198 not found
                bannerData = bannerData.slice(0, 2);
              }
            }
          } catch (allError) {
            console.warn('❌ Failed to fetch all banners:', allError);
            
            // Try with null filter as last resort
            try {
              console.log('🔄 Trying with null filter...');
              bannerData = await banner.fetchBanner(null);
              console.log('✅ Null filter worked:', bannerData);
            } catch (nullError) {
              console.warn('❌ Null filter also failed:', nullError);
            }
          }
        }
        
        if (bannerData && bannerData.length > 0) {
          // Use dynamic banners from API
          console.log('✨ Using dynamic banners from API:', bannerData);
          const sortedBanners = [...bannerData].sort((a, b) => (a.priority || 0) - (b.priority || 0));
          
          // Process banners with S3 image prefix and maintain fallback structure
          const processedBanners = sortedBanners.map((banner, index) => ({
            id: banner.id || `dynamic-${index}`,
            title: banner.title || `Banner ${index + 1}`,
            image: banner.image ? `${imagePrefix}${banner.image}` : (index === 0 ? banner1 : banner2),
            link: banner.link || '/',
            priority: banner.priority || index + 1,
            apiData: banner // Store full API data for debugging
          }));
          
          setBanners(processedBanners);
          
          // Create dynamic content maintaining the same structure as fallback
          const dynamicContent = processedBanners.map((banner, index) => ({
            label: banner.apiData.label || "WOMEN'S FASHION",
            title: banner.title,
            description: banner.apiData.description || "Nemo enim ipsam voluptatem quia voluptas sit aspernatur",
            buttonText: banner.apiData.buttonText || "SHOP NOW",
            link: banner.link,
            apiData: banner.apiData // Store full API data for debugging
          }));
          setBannerContent(dynamicContent);
          setError(null);
          
          console.log('🎨 Dynamic content created with S3 prefix:', dynamicContent);
          console.log('🏷️ Banner URLs with S3 prefix:', processedBanners.map(b => ({ id: b.id, title: b.title, image: b.image })));
        } else {
          // Use fallback banners if API returns empty
          console.warn('⚠️ No banners found from API');
          // setBanners(fallbackBanners);
          // setBannerContent(fallbackContent);
          setBanners([]);
          setBannerContent([]);
        }
      } catch (err) {
        // Use fallback banners if API fails
        console.error('💥 API error occurred:', err);
        setError(err);
        // setBanners(fallbackBanners);
        // setBannerContent(fallbackContent);
        setBanners([]);
        setBannerContent([]);
      } finally {
        setLoading(false);
        console.log('🏁 Banner fetch process completed');
      }
    };

    fetchBanners();
  }, []);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
  };
  
  const goToNext = () => {
    setCurrentIndex(currentIndex === banners.length - 1 ? 0 : currentIndex + 1);
  };
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
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
    // Emergency fallback - use static banners
    // setBanners(fallbackBanners);
    // setBannerContent(fallbackContent);
    return null; // Don't render if no banners
  }

  return (
    <div className="slider">
      <div className="imageContainer">
        <img 
          src={banners[currentIndex]?.image || banners[currentIndex]} 
          alt={banners[currentIndex]?.title || `Banner ${currentIndex + 1}`}
          className="bannerImage"
          onClick={handleBannerClick}
          style={{ cursor: bannerContent[currentIndex]?.link ? 'pointer' : 'default' }}
          onError={(e) => {
            // Fallback to local image if API image fails to load
            console.warn('Failed to load banner image, using fallback');
            if (currentIndex === 0) {
              e.target.src = banner1;
            } else {
              e.target.src = banner2;
            }
          }}
        />
        
        {/* Banner Overlay Content */}
        <div className="bannerOverlay">
          <div className={`bannerContent ${currentIndex === 0 ? 'banner1Content' : 'banner2Content'}`}>
            <span className="bannerLabel">{bannerContent[currentIndex]?.label}</span>
            <h1 className="bannerTitle">
              {bannerContent[currentIndex]?.title}
            </h1>
            <p className="bannerDescription">
              {bannerContent[currentIndex]?.description}
            </p>
            <button 
              className="bannerButton"
              onClick={handleBannerClick}
            >
              {bannerContent[currentIndex]?.buttonText}
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
      
      {/* Dot Indicators removed as requested */}
    </div>
  );
};

export default BannerSlider;
