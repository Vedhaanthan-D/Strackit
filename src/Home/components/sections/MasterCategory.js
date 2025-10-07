import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchMasterCategories } from 'shops-query/src/modules/masterCategories/index.js';
import '../styles/MasterCategory.css';

// Loading Skeleton for categories
const CategorySkeleton = () => (
  <div className="masterCategoryContainer">
    <div className="categoryRow">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="categoryBox skeleton">
          <div className="categoryImageSkeleton"></div>
          <div className="categoryOverlay">
            <div className="categoryNameSkeleton"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MasterCategory = () => {
  const [masterCategories, setMasterCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // S3 image prefix for master category images
  const imagePrefix = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";
  
  // Shop ID for fetching categories
  const shopId = 12; // Using the same shop ID as in BannerSlider

  // Fallback categories for error handling or empty response
  // const fallbackCategories = [
  //   {
  //     id: 'fallback-1',
  //     category: 'Accessory',
  //     image: 'accessories.jpg',
  //     status: 'active'
  //   },
  //   {
  //     id: 'fallback-2',
  //     category: 'Clothing',
  //     image: 'clothing.jpg',
  //     status: 'active'
  //   },
  //   {
  //     id: 'fallback-3',
  //     category: 'Shoes',
  //     image: 'shoes.jpg',
  //     status: 'active'
  //   }
  // ];

  // Fetch master categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const categoryData = await fetchMasterCategories(shopId);
        
        if (categoryData && categoryData.length > 0) {
          // Filter active categories and sort by position
          const activeCategories = categoryData
            .filter(cat => cat.status === 'active' || cat.status === 1)
            .sort((a, b) => (a.position || 0) - (b.position || 0));
          
          setMasterCategories(activeCategories);
          setError(null);
        } else {
          // setMasterCategories(fallbackCategories);
          setMasterCategories([]);
        }
      } catch (err) {
        setError(err);
        // Use fallback categories on error
        // setMasterCategories(fallbackCategories);
        setMasterCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [shopId]);

  // Scroll functions for horizontal navigation
  const scrollLeft = () => {
    const container = document.querySelector('.categoryRow');
    const scrollAmount = 300;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    setScrollPosition(container.scrollLeft - scrollAmount);
  };

  const scrollRight = () => {
    const container = document.querySelector('.categoryRow');
    const scrollAmount = 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setScrollPosition(container.scrollLeft + scrollAmount);
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    // Navigate to category page
    // You can implement routing here, e.g.:
    // window.location.href = `/category/${category.id}`;
    // or use React Router: navigate(`/category/${category.id}`);
  };

  // Handle image error
  const handleImageError = (e, categoryName) => {
    // Set a placeholder or default image
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzE2NS4xNTUgMjAwIDE3Ny41IDE4Ny42NTUgMTc3LjUgMTcyLjVDMTc3LjUgMTU3LjM0NSAxNjUuMTU1IDE0NSAxNTAgMTQ1QzEzNC44NDUgMTQ1IDEyMi41IDE1Ny4zNDUgMTIyLjUgMTcyLjVDMTIyLjUgMTg3LjY1NSAxMzQuODQ1IDIwMCAxNTAgMjAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTg1IDIyNUgxMTVDMTA3LjI2OCAyMjUgMTAxIDIzMS4yNjggMTAxIDIzOVYyNTVDMTAxIDI2Mi43MzIgMTA3LjI2OCAyNjkgMTE1IDI2OUgxODVDMTkyLjczMiAyNjkgMTk5IDI2Mi43MzIgMTk5IDI1NVYyMzlDMTk5IDIzMS4yNjggMTkyLjczMiAyMjUgMTg1IDIyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
  };

  // Show loading skeleton
  if (loading) {
    return <CategorySkeleton />;
  }

  // Show error message if no categories and error occurred
  if (masterCategories.length === 0 && error) {
    return (
      <div className="masterCategoryContainer">
        <div className="errorMessage">
          <p>Unable to load categories. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="masterCategoryContainer">
      <div className="categorySlider">
        {/* Left Arrow */}
        <button 
          className="categoryArrow leftArrow"
          onClick={scrollLeft}
          aria-label="Scroll categories left"
        >
          <FiChevronLeft />
        </button>

        {/* Categories Row */}
        <div className="categoryRow">
          {masterCategories.map((category) => (
            <div 
              key={category.id}
              className="categoryBox"
              onClick={() => handleCategoryClick(category)}
            >
              <img
                src={`${imagePrefix}${category.image}`}
                alt={category.category}
                className="categoryImage"
                onError={(e) => handleImageError(e, category.category)}
              />
              <div className="categoryOverlay">
                <span className="categoryName">{category.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          className="categoryArrow rightArrow"
          onClick={scrollRight}
          aria-label="Scroll categories right"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default MasterCategory;