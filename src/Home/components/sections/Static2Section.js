import React from 'react';
import '../styles/Static2Section.css';
import leftImage from '../../assets/leftimage.webp';

const Static2Section = () => {
  return (
    <section className="static2-section">
      <div className="static2-container">
        <div className="static2-image-column">
          <img 
            src={leftImage} 
            alt="Fashion model wearing cream-colored outfit with sunglasses" 
            className="static2-image"
          />
        </div>
        <div className="static2-content-column">
          <div className="static2-content">
            <span className="static2-label">COAT & JACKETS</span>
            
            <h2 className="static2-heading">
              The New Fashion<br/>
              Collection
            </h2>
            
            <p className="static2-paragraph">
              We have long admired our graceful companions and their earnest loyalty,
              wishing to show them the same admiration we reserve for those closest to us.
            </p>
            
            <button 
              className="static2-button" 
              aria-label="Shop our new fashion collection"
            >
              SHOP NOW
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Static2Section;