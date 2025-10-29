import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import '../styles/InstagramSection.css';

// Sample image URLs - replace with your actual images
const instagramImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=400&fit=crop&crop=center'
];

const InstagramSection = () => {
  const handleImageClick = () => {
    window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
  };

  const handleFollowClick = () => {
    // Open Instagram in new tab
    window.open('https://instagram.com', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="instagram-section" className="instagram-section">
      <div className="instagram-container">
        {/* Edge-to-edge Image Grid */}
        <div className="instagram-grid">
          {instagramImages.map((image, index) => (
            <div 
              key={index} 
              className="instagram-image-box"
              onClick={handleImageClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleImageClick();
                }
              }}
            >
              <img 
                src={image} 
                alt={`Instagram post ${index + 1}`}
                className="instagram-image"
                loading="lazy"
              />
              <div className="instagram-overlay">
                <svg 
                  className="instagram-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" 
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Overlaid Follow Button */}
        <div className="instagram-follow-overlay">
          <button 
            className="instagram-follow-button"
            onClick={handleFollowClick}
            type="button"
          >
            <FaInstagram className="instagram-follow-icon" />
            <span>Follow us on Instagram</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;