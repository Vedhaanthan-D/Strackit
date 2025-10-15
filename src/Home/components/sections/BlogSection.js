import React, { useState, useEffect } from 'react';
import { GET_BLOG } from '../../../common/utils/blogUtils.js';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../../config/appIds.js';
import '../styles/BlogSection.css';

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleCards = 3; // Number of cards visible at once

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const blogFilter = {
          shopId: HOME_CONFIG.shopId
        };
        
        const blogData = await GET_BLOG(blogFilter);
        setBlogs(blogData || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return { day: '', month: '' };
    
    const date = new Date(parseInt(timestamp));
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    
    return { day, month };
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : Math.max(0, blogs.length - visibleCards));
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < blogs.length - visibleCards ? prev + 1 : 0);
  };

  const getVisibleBlogs = () => {
    return blogs.slice(currentIndex, currentIndex + visibleCards);
  };

  if (loading) {
    return (
      <section className="blog-section">
        <div className="container">
          <div className="blog-header">
            <h2 className="blog-title">OUR BLOG</h2>
            <div className="blog-title-underline"></div>
          </div>
          <div className="blog-loading">Loading blogs...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="blog-section">
        <div className="container">
          <div className="blog-header">
            <h2 className="blog-title">OUR BLOG</h2>
            <div className="blog-title-underline"></div>
          </div>
          <div className="blog-error">Error loading blogs: {error}</div>
        </div>
      </section>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <section className="blog-section">
        <div className="container">
          <div className="blog-header">
            <h2 className="blog-title">OUR BLOG</h2>
            <div className="blog-title-underline"></div>
            <p className="blog-empty">No blogs available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section">
      <div className="container">
        <div className="blog-header">
          <h2 className="blog-title">OUR BLOG</h2>
          <div className="blog-title-underline"></div>
          <div className="blog-title-underline"></div>
        </div>
        
        <div className="blog-carousel-container">
          {blogs.length > visibleCards && (
            <button 
              className="carousel-btn carousel-btn-prev"
              onClick={handlePrevious}
              aria-label="Previous blogs"
            >
              &#8249;
            </button>
          )}
          
          <div className="blog-grid">
            {getVisibleBlogs().map((blog) => {
              const { day, month } = formatDate(blog.timestamp);
              const imageUrl = blog.image ? `${IMAGE_PREFIX}${blog.image}` : null;
              
              return (
                <div key={blog.id} className="blog-card">
                  <div className="blog-image-container">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={blog.title || 'Blog post'}
                        className="blog-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="blog-image-placeholder">No Image</div>
                    )}
                    <div className="blog-date-badge">
                      <span className="blog-date-day">{day}</span>
                      <span className="blog-date-month">{month}</span>
                    </div>
                  </div>
                  
                  <div className="blog-content">
                    <div className="blog-meta">
                      <span className="blog-category">
                        {blog.type ? blog.type.toUpperCase() : 'GENERAL'}
                      </span>
                    </div>
                    
                    <h3 className="blog-title-card">
                      {blog.title || 'Untitled Blog Post'}
                    </h3>
                    
                    <p className="blog-description">
                      {blog.description || 'No description available.'}
                    </p>
                    
                    <a 
                      href={blog.url || '#'} 
                      className="blog-read-more"
                      target={blog.url ? "_blank" : "_self"}
                      rel={blog.url ? "noopener noreferrer" : ""}
                    >
                      Read more →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          
          {blogs.length > visibleCards && (
            <button 
              className="carousel-btn carousel-btn-next"
              onClick={handleNext}
              aria-label="Next blogs"
            >
              &#8250;
            </button>
          )}
        </div>

        {blogs.length > visibleCards && (
          <div className="blog-pagination">
            {Array.from({ length: Math.ceil(blogs.length / visibleCards) }).map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${Math.floor(currentIndex / visibleCards) === index ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index * visibleCards)}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
