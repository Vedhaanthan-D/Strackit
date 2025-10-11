import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../../config/appIds.js';
import '../styles/NewArrivals.css';

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="new-arrivals-product-skeleton">
    <div className="new-arrivals-product-skeleton-image"></div>
    <div className="new-arrivals-product-info">
      <div className="new-arrivals-product-skeleton-title"></div>
      <div className="new-arrivals-product-skeleton-price"></div>
    </div>
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
  const scrollContainerRef = useRef(null);

  // Helper function to check if product has discount
  const hasDiscount = (product) => {
    return product.originalPrice && product.discountedPrice && 
           parseFloat(product.originalPrice) > parseFloat(product.discountedPrice);
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNzEuODc1IDEyNSAxNTAgMTI1WiIgZmlsbD0iI0QxRDFEMSIvPgo8cGF0aCBkPSJNMTk4IDE4Ni4yNUMxOTUuMTg4IDE4Ni4yNSAxOTMuMzEyIDE4NS44MTIgMTkxLjQzOCAxODQuODEyQzE4Ny4xODggMTgzLjM3NSAxODIuNSAxODMuMzc1IDE3OC4yNSAxODQuODEyQzE3Ni4zNzUgMTg1LjM3NSAxNzQuNSAxODYuMjUgMTcyIDE4Ni4yNUMxNjkuNSAxODYuMjUgMTY3LjYyNSAxODUuODEyIDE2NS43NSAxODQuODEyQzE2MS41IDE4My4zNzUgMTU2LjgxMiAxODMuMzc1IDE1Mi41NjIgMTg0LjgxMkMxNTAuNjg4IDE4NS4zNzUgMTQ4LjgxMiAxODYuMjUgMTQ2LjMxMiAxODYuMjVDMTQzLjgxMiAxODYuMjUgMTQxLjkzOCAxODUuODEyIDE0MC4wNjIgMTg0LjgxMkMxMzUuODEyIDE4My4zNzUgMTMxLjEyNSAxODMuMzc1IDEyNi44NzUgMTg0LjgxMkMxMzEuNTYyIDE5NS42MjUgMTQ0IDIwMS42ODggMTU4IDE5OS4zMTJDMTcyIDE5Ni45MzggMTgzLjM3NSAxODcuNTYyIDE4OCAxNzMuMjVDMTkxLjI1IDE3Ny4wNjIgMTk1LjE4OCAxNzkuODc1IDIwMCAxODEuM0MxOTkuNSAxODIuNzUgMTk5IDE4NC42MjUgMTk4IDE4Ni4yNVoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+Cg==';
  };

  // Navigation functions for arrows
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };



  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        
        const productData = await getProductsController(HOME_CONFIG.shopId);
        
        if (productData && productData.length > 0) {
          let sortedProducts = [...productData]
            .filter(product => product && product.publish);
          
          if (sortNewest) {
            sortedProducts = sortedProducts.sort((a, b) => {
              const dateA = a.addedon ? new Date(a.addedon) : new Date(0);
              const dateB = b.addedon ? new Date(b.addedon) : new Date(0);
              return dateB - dateA;
            });
          }
          
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
  }, []);



  // Show loading state with skeletons
  if (loading) {
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-container">

          <button 
            className="new-arrivals-nav-arrow new-arrivals-left-arrow disabled"
            disabled
            aria-label="Previous products"
          >
            <FiChevronLeft />
          </button>
          
          <button 
            className="new-arrivals-nav-arrow new-arrivals-right-arrow disabled"
            disabled
            aria-label="Next products"
          >
            <FiChevronRight />
          </button>
          
          <div className="products-grid" ref={scrollContainerRef}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <ProductSkeleton key={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || products.length === 0) {
    return (
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2 className="new-arrivals-title">{title}</h2>
          {subtitle && <p className="new-arrivals-subtitle">{subtitle}</p>}
        </div>
        <div className="products-container">
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
      
      <div className="products-container">

        <button 
          className="new-arrivals-nav-arrow new-arrivals-left-arrow"
          onClick={scrollLeft}
          aria-label="Previous products"
        >
          <FiChevronLeft />
        </button>
        
        <button 
          className="new-arrivals-nav-arrow new-arrivals-right-arrow"
          onClick={scrollRight}
          aria-label="Next products"
        >
          <FiChevronRight />
        </button>
        
        <div className="products-grid" ref={scrollContainerRef}>
          {products.map((product) => {
            const isDiscounted = hasDiscount(product);
            
            return (
              <div key={product.id} className="new-arrivals-product-card">
                <div className="new-arrivals-product-image-container">
                  {isDiscounted && (
                    <div className="new-arrivals-sale-badge">Sale</div>
                  )}
                  <img
                    src={product.productImage && product.productImage.length > 0 
                      ? `${IMAGE_PREFIX}${product.productImage[0].image}`
                      : product.featureImage 
                        ? `${IMAGE_PREFIX}${product.featureImage}`
                        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTI1QzEyMy4xMjUgMTI1IDEwMi4xODggMTQ2LjM3NSAxMDIuMTg4IDE3Mi44MTJDMTA2Ljg3NSAxNjguNTYyIDExMy4xMjUgMTY2LjI1IDEyMCAxNjYuMjVDMTI2Ljg3NSAxNjYuMjUgMTMzLjEyNSAxNjguMTI1IDEzNy44MTIgMTcyLjgxMkMxNDAuNjI1IDE3NS42MjUgMTQ2LjI1IDE3NS42MjUgMTQ5LjA2MiAxNzIuODEyQzE1My43NSAxNjguMTI1IDE2MCAxNjUuODEyIDE2Ni44NzUgMTY1LjgxMkMxNzMuNzUgMTY1LjgxMiAxODAuNjI1IDE2OC41NjIgMTg0Ljg3NSAxNzIuODEyQzE4NC44NzUgMTQ2LjM3NSAxNjQuMzc1IDEyNSAxMzggMTI1SDE1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPHBhdGggZD0iTTE5OCAxODYuMjVDMTk1LjE4OCAxODYuMjUgMTkzLjMxMiAxODUuODEyIDE5MS40MzggMTg0LjgxMkMxODcuMTg4IDE4My4zNzUgMTgyLjUgMTgzLjM3NSAxNzguMjUgMTg0LjgxMkMxNzYuMzc1IDE4NS4zNzUgMTc0LjUgMTg2LjI1IDE3MiAxODYuMjVDMTY5LjUgMTg2LjI1IDE2Ny42MjUgMTg1LjgxMiAxNjUuNzUgMTg0LjgxMkMxNjEuNSAxODMuMzc1IDE1Ni44MTIgMTgzLjM3NSAxNTIuNTYyIDE4NC44MTJDMTUwLjY4OCAxODUuMzc1IDE0OC44MTIgMTg2LjI1IDE0Ni4zMTIgMTg2LjI1QzE0My44MTIgMTg2LjI1IDE0MS45MzggMTg1LjgxMiAxNDAuMDYyIDE4NC44MTJDMTM1LjgxMiAxODMuMzc1IDEzMS4xMjUgMTgzLjM3NSAxMjYuODc1IDE4NC44MTJDMTMxLjU2MiAxOTUuNjI1IDE0NCAyMDEuNjg4IDE1OCAxOTkuMzEyQzE3MiAxOTYuOTM4IDE4My4zNzUgMTg3LjU2MiAxODggMTczLjI1QzE5MS4yNSAxNzcuMDYyIDE5NS4xODggMTc5Ljg3NSAyMDAgMTgxLjNDMTk5LjUgMTgyLjc1IDE5OSAxODQuNjI1IDE5OCAxODYuMjVaIiBmaWxsPSIjRDFEMUQxIi8+Cjwvc3ZnPgo='
                    }
                    alt={product.name}
                    className="new-arrivals-product-image"
                    onError={handleImageError}
                  />
                </div>
                
                <div className="new-arrivals-product-info">
                  <h3 className="new-arrivals-product-name">{product.name}</h3>
                  <div className="new-arrivals-product-price">
                    {isDiscounted ? (
                      <>
                        <span className="new-arrivals-current-price">
                          {formatPrice(product.discountedPrice)}
                        </span>
                        <span className="new-arrivals-old-price">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="new-arrivals-current-price">
                        {formatPrice(product.prize || product.originalPrice || product.discountedPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;