import React, { useState, useEffect } from 'react';
import { GET_BLOG } from 'shops-query/src/modules/blog/queries/get';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../../config/appIds';
import '../styles/BlogSection.css';

const BlogSkeleton = () => (
  <div className="blog-card-skeleton">
    <div className="blog-skeleton-image"></div>
    <div className="blog-skeleton-content">
      <div className="blog-skeleton-category"></div>
      <div className="blog-skeleton-title"></div>
      <div className="blog-skeleton-description"></div>
      <div className="blog-skeleton-button"></div>
    </div>
  </div>
);

const BlogSection = ({ title = "OUR BLOG", limit = 3 }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const blogData = await GET_BLOG({ 
          shopId: HOME_CONFIG.shopId
        });

        console.log('Blog data received:', blogData);

        if (blogData && blogData.length > 0) {
          setBlogs(blogData);
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [limit]);

  const formatDate = (timestamp) => {
    if (!timestamp) return { day: '01', month: 'JAN' };
    
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    
    return { day, month };
  };

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const handleBlogClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjwvc3ZnPg==';
  };

  if (loading) {
    return (
      <section className="blog-section">
        <div className="blog-container">
          <div className="blog-header">
            <h2 className="blog-title">{title}</h2>
            <div className="blog-title-underline"></div>
          </div>
          <div className="blog-grid">
            {[1, 2, 3].map((i) => (
              <BlogSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Blog section error:', error);
  }

  if (blogs.length === 0) {
    console.log('No blogs found, but rendering section anyway for debugging');
    return (
      <section className="blog-section">
        <div className="blog-container">
          <div className="blog-header">
            <h2 className="blog-title">{title}</h2>
            <div className="blog-title-underline"></div>
          </div>
          <div className="blog-grid">
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
              No blog posts available at the moment.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section">
      <div className="blog-container">
        <div className="blog-header">
          <h2 className="blog-title">{title}</h2>
          <div className="blog-title-underline"></div>
        </div>
        
        <div className="blog-grid">
          {blogs.map((blog) => {
            const { day, month } = formatDate(blog.timestamp);
            const blogImage = blog.image ? `${IMAGE_PREFIX}${blog.image}` : null;
            
            return (
              <article 
                key={blog.id} 
                className="blog-card"
                onClick={() => handleBlogClick(blog.url)}
              >
                <div className="blog-image-wrapper">
                  {blogImage && (
                    <img 
                      src={blogImage} 
                      alt={blog.title}
                      className="blog-image"
                      onError={handleImageError}
                    />
                  )}
                  <div className="blog-date-badge">
                    <div className="blog-date-day">{day}</div>
                    <div className="blog-date-month">{month}</div>
                  </div>
                </div>
                
                <div className="blog-content">
                  {blog.type && (
                    <div className="blog-category">{blog.type.toUpperCase()}</div>
                  )}
                  
                  <h3 className="blog-card-title">{blog.title}</h3>
                  
                  {blog.description && (
                    <p className="blog-description">
                      {truncateDescription(blog.description)}
                    </p>
                  )}
                  
                  <button 
                    className="blog-read-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBlogClick(blog.url);
                    }}
                    aria-label={`Read more about ${blog.title}`}
                  >
                    Read more →
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
