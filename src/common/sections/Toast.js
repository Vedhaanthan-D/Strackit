import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import '../styles/Toast.css';

// Toast Context
const ToastContext = createContext();

// Individual Toast Component
const ToastItem = ({ message, type = 'success', duration = 3000, onClose, show, topOffset }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show && !isVisible) return null;

  const containerStyle = {};
  const isProductDetailPage = window.location.pathname.includes('/product/') || 
                              document.querySelector('.product-details') ||
                              document.querySelector('.pd-price-section') ||
                              document.querySelector('.product-title-block');
  
  if (typeof topOffset === 'number' && topOffset > 0) {
    containerStyle.top = `${topOffset}px`;
    containerStyle.position = 'fixed';
    containerStyle.left = '50%';
    containerStyle.transform = 'translateX(-50%)';
    containerStyle.zIndex = '99999';
    // Override any potential CSS variable conflicts
    containerStyle.setProperty && containerStyle.setProperty('--toast-top', `${topOffset}px`);
  }

  const containerClass = `toast-container ${isVisible ? 'toast-show' : 'toast-hide'} ${isProductDetailPage ? 'product-detail-toast' : ''}`;
  
  return (
    <div className={containerClass} style={containerStyle}>
      <div className={`toast toast-${type}`}>
        <div className="toast-icon">
          {type === 'success' && <FiCheck />}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <FiX />
        </button>
      </div>
    </div>
  );
};

// Toast Provider Component
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [topOffset, setTopOffset] = useState(null);

  // Compute top offset - for product detail page, position over logo as requested
  useEffect(() => {
    const computeTopOffset = () => {
      try {
        // Check if we're on a product detail page
        const isProductDetailPage = window.location.pathname.includes('/product/') || 
                                   document.querySelector('.product-details') ||
                                   document.querySelector('.pd-price-section') ||
                                   document.querySelector('.product-title-block');

        // Try multiple common logo/header selectors (expanded list)
        const logoSelectors = [
          '.logoContainer', 
          '.logoImage', 
          '.logoLink', 
          '.logo', 
          '.header-logo',
          '.navbar-brand',
          '.site-logo',
          '.brand-logo',
          '.main-logo',
          'img[alt*="logo" i]',
          'img[src*="logo" i]',
          '.navbar-brand img',
          '.logo img',
          '.header img',
          'nav img',
          '.brand img'
        ];
        
        const headerSelectors = [
          '.header', 
          '.header-container', 
          '.navbar', 
          '.main-header',
          '.site-header',
          '.app-header'
        ];

        let logoTop = 0;
        let headerHeight = 0;

        // Check logo elements with detailed logging
        for (const selector of logoSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            logoTop = rect.top;
            console.log('Found logo element:', selector, 'at position:', {
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              width: rect.width,
              height: rect.height
            });
            break; // Use first found logo element
          }
        }
        
        if (logoTop === 0) {
          console.log('No logo element found, trying alternative detection methods');
          // Try to find any image in the header/nav area
          const navImages = document.querySelectorAll('nav img, header img, .header img, .navbar img');
          if (navImages.length > 0) {
            const rect = navImages[0].getBoundingClientRect();
            logoTop = rect.top;
            console.log('Found header image as logo alternative:', rect);
          }
        }

        // Check header elements  
        for (const selector of headerSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const rect = el.getBoundingClientRect();
            headerHeight = Math.max(headerHeight, rect.bottom);
            break; // Use first found header element
          }
        }

        let computed;
        
        if (isProductDetailPage) {
          // For product detail page: position directly on top of logo area
          if (logoTop > 0) {
            // Position toast at the logo's vertical center
            computed = Math.max(10, Math.round(logoTop) + 5);
          } else {
            // Fallback: position at very top if logo not found
            computed = 10;
          }
          console.log('Product detail page detected - positioning toast over logo at:', computed, 'logoTop:', logoTop);
        } else {
          // For other pages: position below header/logo to avoid overlap
          computed = Math.max(80, Math.round(headerHeight) + 16);
        }

        setTopOffset(computed);
        
        // Also set CSS variable as backup
        document.documentElement.style.setProperty('--toast-top', `${computed}px`);
        
        console.log('Toast offset computed:', computed, 'logoTop:', logoTop, 'headerHeight:', headerHeight, 'isProductPage:', isProductDetailPage);
      } catch (err) {
        console.warn('Toast offset computation failed:', err);
        // Fallback to safe distance from top
        setTopOffset(80);
        document.documentElement.style.setProperty('--toast-top', '80px');
      }
    };

    // Initial computation
    computeTopOffset();
    
    // Recompute after DOM is fully loaded
    if (document.readyState !== 'complete') {
      window.addEventListener('load', computeTopOffset);
    }
    
    // Recompute on resize and orientation change
    window.addEventListener('resize', computeTopOffset);
    window.addEventListener('orientationchange', computeTopOffset);

    // Recompute periodically in case header changes dynamically
    const intervalTimer = setInterval(computeTopOffset, 2000);
    
    // Recompute after a short delay to allow layout to stabilize
    const delayTimer = setTimeout(computeTopOffset, 1000);

    return () => {
      window.removeEventListener('load', computeTopOffset);
      window.removeEventListener('resize', computeTopOffset);
      window.removeEventListener('orientationchange', computeTopOffset);
      clearInterval(intervalTimer);
      clearTimeout(delayTimer);
    };
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 300); // Add extra time for animation
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          show={true}
          topOffset={topOffset}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

// Hook to use toast
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Export everything
export { ToastProvider, useToast };