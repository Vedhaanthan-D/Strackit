import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import '../styles/BackToTop.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`back-to-top ${isVisible ? 'visible' : ''}`}>
      <button 
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="back-to-top-button"
      >
        <FiArrowUp />
      </button>
    </div>
  );
};

export default BackToTop;