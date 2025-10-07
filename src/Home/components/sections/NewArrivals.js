import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import '../styles/NewArrivals.css';

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="product-skeleton">
    <div className="product-skeleton-image"></div>
    <div className="product-skeleton-title"></div>
    <div className="product-skeleton-price"></div>
  </div>
);

const NewArrivals = ({ 
  title = "NEW ARRIVALS", 
  subtitle = "",
  limit = 8,
  sortNewest = true
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const productsContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // S3 image prefix for product images
  const imagePrefix = "https://s3.ap-south-1.amazonaws.com/business.strackit.com/";
  
  // Shop ID for fetching products
  const shopId = 12; // Using the same shop ID as in other components

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        // Fetch products from the shop
        const productData = await getProductsController(shopId);
        
        if (productData && productData.length > 0) {
          // Filter published products
          let sortedProducts = [...productData]
            .filter(product => product && product.publish); // Only include published products
          
          // Sort by date if specified
          if (sortNewest) {
            sortedProducts = sortedProducts.sort((a, b) => {
              // Sort by newest first
              const dateA = a.addedon ? new Date(a.addedon) : new Date(0);
              const dateB = b.addedon ? new Date(b.addedon) : new Date(0);
              return dateB - dateA;
            });
          }
          
          // Apply limit
          sortedProducts = sortedProducts.slice(0, limit);
          
          setProducts(sortedProducts);
          setError(null);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [shopId]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNjQuMzc1IDEyNSAxMzggMTI1SDE1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTE5OCAxODYuMjVDMTk1LjE4OCAxODYuMjUgMTkzLjMxMiAxODUuODEyIDE5MS40MzggMTg0LjgxMkMxODcuMTg4IDE4My4zNzUgMTgyLjUgMTgzLjM3NSAxNzguMjUgMTg0LjgxMkMxNzYuMzc1IDE4NS4zNzUgMTc0LjUgMTg2LjI1IDE3MiAxODYuMjVDMTY5LjUgMTg2LjI1IDE2Ny42MjUgMTg1LjgxMiAxNjUuNzUgMTg0LjgxMkMxNjEuNSAxODMuMzc1IDE1Ni44MTIgMTgzLjM3NSAxNTIuNTYyIDE4NC44MTJDMTUwLjY4OCAxODUuMzc1IDE0OC44MTIgMTg2LjI1IDE0Ni4zMTIgMTg2LjI1QzE0My44MTIgMTg2LjI1IDE0MS45MzggMTg1LjgxMiAxNDAuMDYyIDE4NC44MTJDMTM1LjgxMiAxODMuMzc1IDEzMS4xMjUgMTgzLjM3NSAxMjYuODc1IDE4NC44MTJDMTMxLjU2MiAxOTUuNjI1IDE0NCAyMDEuNjg4IDE1OCAxOTkuMzEyQzE3MiAxOTYuOTM4IDE4My4zNzUgMTg3LjU2MiAxODggMTczLjI1QzE5MS4yNSAxNzcuMDYyIDE5NS4xODggMTc5Ljg3NSAyMDAgMTgxLjNDMTk5LjUgMTgyLjc1IDE5OSAxODQuNjI1IDE5OCAxODYuMjVaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo=';
  };

  // Show loading state with skeletons
  if (loading) {
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-slider">
          <button className="product-arrow left-arrow disabled" disabled>
            <FiChevronLeft />
          </button>
          <div className="products-row">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ProductSkeleton key={item} />
            ))}
          </div>
          <button className="product-arrow right-arrow disabled" disabled>
            <FiChevronRight />
          </button>
        </div>
      </div>
    );
  }

  // Scroll functions for horizontal navigation
  const scrollLeft = () => {
    if (productsContainerRef.current) {
      const container = productsContainerRef.current;
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft - scrollAmount);
    }
  };

  const scrollRight = () => {
    if (productsContainerRef.current) {
      const container = productsContainerRef.current;
      const scrollAmount = container.clientWidth / 2;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };
  
  // Show error state
  if (error || products.length === 0) {
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-slider">
          <div className="products-error">
            <p>Unable to load products. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-arrivals-container">
      <div className="new-arrivals-header">
        <h2 className="new-arrivals-title">{title}</h2>
        {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
      </div>
      
      <div className="products-slider">
        {/* Left Arrow */}
        <button 
          className="product-arrow left-arrow"
          onClick={scrollLeft}
          aria-label="Scroll products left"
        >
          <FiChevronLeft />
        </button>
        
        {/* Products Row */}
        <div className="products-row" ref={productsContainerRef}>
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={product.productImage && product.productImage.length > 0 
                    ? `${imagePrefix}${product.productImage[0].image}`
                    : product.featureImage 
                      ? `${imagePrefix}${product.featureImage}`
                      : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNjQuMzc1IDEyNSAxMzggMTI1SDE1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTE5OCAxODYuMjVDMTk1LjE4OCAxODYuMjUgMTkzLjMxMiAxODUuODEyIDE5MS40MzggMTg0LjgxMkMxODcuMTg4IDE4My4zNzUgMTgyLjUgMTgzLjM3NSAxNzguMjUgMTg0LjgxMkMxNzYuMzc1IDE4NS4zNzUgMTc0LjUgMTg2LjI1IDE3MiAxODYuMjVDMTY5LjUgMTg2LjI1IDE2Ny42MjUgMTg1LjgxMiAxNjUuNzUgMTg0LjgxMkMxNjEuNSAxODMuMzc1IDE1Ni44MTIgMTgzLjM3NSAxNTIuNTYyIDE4NC44MTJDMTUwLjY4OCAxODUuMzc1IDE0OC44MTIgMTg2LjI1IDE0Ni4zMTIgMTg2LjI1QzE0My44MTIgMTg2LjI1IDE0MS45MzggMTg1LjgxMiAxNDAuMDYyIDE4NC44MTJDMTM1LjgxMiAxODMuMzc1IDEzMS4xMjUgMTgzLjM3NSAxMjYuODc1IDE4NC44MTJDMTMxLjU2MiAxOTUuNjI1IDE0NCAyMDEuNjg4IDE1OCAxOTkuMzEyQzE3MiAxOTYuOTM4IDE4My4zNzUgMTg3LjU2MiAxODggMTczLjI1QzE5MS4yNSAxNzcuMDYyIDE5NS4xODggMTc5Ljg3NSAyMDAgMTgxLjNDMTk5LjUgMTgyLjc1IDE5OSAxODQuNjI1IDE5OCAxODYuMjVaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo='
                  }
                  alt={product.name}
                  className="product-image"
                  onError={handleImageError}
                />
                
                {/* Sold Out Badge */}
                {product.noStock && (
                  <div className="sold-out-badge">
                    <div className="sold-out-circle">
                      <span className="sold-out-text">SOLD</span>
                      <span className="sold-out-text">OUT</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">€{(parseFloat(product.prize) || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Arrow */}
        <button 
          className="product-arrow right-arrow"
          onClick={scrollRight}
          aria-label="Scroll products right"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default NewArrivals;