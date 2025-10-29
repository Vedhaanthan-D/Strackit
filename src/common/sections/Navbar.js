import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiSearch, 
  FiUser, 
  FiShoppingBag, 
  FiMenu, 
  FiX,
  FiHeart
} from 'react-icons/fi';
import '../styles/header.css';
import aoneLogo from '../../Home/assets/aone-logo.jpg';
import { HOME_CONFIG } from '../../config/appIds';
import { fetchMasterCategories } from 'shops-query/src/modules/masterCategories/index';

const Navbar = ({
  navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shops', path: '/shops' },
    { name: 'Products', path: '/products' },
    { name: 'Blog', path: '/blog' },
    { name: 'Pages', path: '/pages' }
  ],
  cartCount = 0,
  onSearchClick = () => {},
  onUserClick = () => {},
  onCartClick = () => {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scrolling to section when navigating from other pages
  useEffect(() => {
    // Check if there's a pending scroll target from navigation
    const pendingScrollTarget = sessionStorage.getItem('pendingScrollTarget');
    
    if (pendingScrollTarget && location.pathname === '/') {
      // Clear the pending target
      sessionStorage.removeItem('pendingScrollTarget');
      
      // Scroll to the target section with retry logic
      const scrollToSection = (retries = 3) => {
        setTimeout(() => {
          const section = document.getElementById(pendingScrollTarget);
          if (section) {
            section.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          } else if (retries > 0) {
            // Retry if section not found yet (DOM still loading)
            scrollToSection(retries - 1);
          }
        }, 500);
      };
      
      scrollToSection();
    }
    
    // Also handle hash in URL (direct navigation)
    if (location.hash && location.pathname === '/') {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 500);
    }
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to find women's category ID dynamically
  const findWomensCategoryId = async () => {
    try {
      const categoryData = await fetchMasterCategories(HOME_CONFIG.shopId);
      if (categoryData && categoryData.length > 0) {
        const womensCategory = categoryData.find(cat => 
          cat.category && (
            cat.category.toLowerCase().includes('women') ||
            cat.category.toLowerCase().includes('woman') ||
            cat.category.toLowerCase() === 'women'
          )
        );
        return womensCategory ? womensCategory.id : null;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left Section - Navigation Links */}
        <nav className={`navigation ${isMobileMenuOpen ? 'mobileMenuOpen' : ''}`}>
          <ul className="navList">
            {navigationLinks.map((link, index) => (
              <li key={index} className="navItem">
                <Link 
                  to={link.path} 
                  className="navLink"
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    
                    // If it's the Home link and already on home page, force page reload
                    if (link.name === 'Home' && window.location.pathname === '/') {
                      e.preventDefault();
                      window.location.reload();
                    }
                    
                    // If it's the Shops link, scroll to MasterCategory section
                    if (link.name === 'Shops') {
                      e.preventDefault();
                      
                      // If not on home page, navigate to home first then scroll
                      if (window.location.pathname !== '/') {
                        // Store the target section for after navigation
                        sessionStorage.setItem('pendingScrollTarget', 'master-category-section');
                        navigate('/');
                      } else {
                        // If on home page, scroll to the section with a small delay
                        setTimeout(() => {
                          const masterCategorySection = document.getElementById('master-category-section');
                          if (masterCategorySection) {
                            masterCategorySection.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }, 100);
                      }
                    }
                    
                    // If it's the Blog link, scroll to BlogSection
                    if (link.name === 'Blog') {
                      e.preventDefault();
                      
                      // If not on home page, navigate to home first then scroll
                      if (window.location.pathname !== '/') {
                        // Store the target section for after navigation
                        sessionStorage.setItem('pendingScrollTarget', 'blog-section');
                        navigate('/');
                      } else {
                        // If on home page, scroll to the section with a small delay to ensure DOM is ready
                        setTimeout(() => {
                          const blogSection = document.getElementById('blog-section');
                          if (blogSection) {
                            blogSection.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          } else {
                            // Fallback: try to find by class name
                            const blogElement = document.querySelector('.blog-section');
                            if (blogElement) {
                              blogElement.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }
                        }, 100);
                      }
                    }
                    
                    // If it's the Products link, navigate to women's category page or reload if already on category page
                    if (link.name === 'Products') {
                      e.preventDefault();
                      
                      // Check if already on a category page
                      const currentPath = window.location.pathname;
                      const isCategoryPage = currentPath.startsWith('/category/');
                      
                      if (isCategoryPage) {
                        window.location.reload();
                      } else {
                        const handleProductsNavigation = async () => {
                          const womensCategoryId = await findWomensCategoryId();
                          if (womensCategoryId) {
                            navigate(`/category/${womensCategoryId}`);
                          } else {
                            try {
                              const categoryData = await fetchMasterCategories(HOME_CONFIG.shopId);
                              if (categoryData && categoryData.length > 0) {
                                const firstCategory = categoryData.find(cat => 
                                  cat.status === 'active' || cat.status === 1 || cat.status === true || 
                                  (cat.status === undefined || cat.status === null)
                                );
                                if (firstCategory) {
                                  navigate(`/category/${firstCategory.id}`);
                                }
                              }
                            } catch (error) {
                              // Silently handle error
                            }
                          }
                        };
                        handleProductsNavigation();
                      }
                    }
                    
                    // If it's the Pages link, scroll to InstagramSection
                    if (link.name === 'Pages') {
                      e.preventDefault();
                      
                      // If not on home page, navigate to home first then scroll
                      if (window.location.pathname !== '/') {
                        // Store the target section for after navigation
                        sessionStorage.setItem('pendingScrollTarget', 'instagram-section');
                        navigate('/');
                      } else {
                        // If on home page, scroll to the section with a small delay
                        setTimeout(() => {
                          const instagramSection = document.getElementById('instagram-section');
                          if (instagramSection) {
                            instagramSection.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }
                        }, 100);
                      }
                    }
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="mobileMenuButton"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        {/* Center Section - Logo */}
        <div className="logoContainer">
          <Link 
            to="/" 
            className="logoLink"
            onClick={(e) => {
              // If already on home page, force reload
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            <img src={aoneLogo} alt="AONE Logo" className="logoImage" />
          </Link>
        </div>

        {/* Right Section - Action Icons */}
        <div className="rightActions">

          {/* Action Icons */}
          <div className="actionIcons">
            <div className="iconWrapper">
              <button 
                className="iconButton"
                onClick={onSearchClick}
                aria-label="Search"
              >
                <FiSearch size={22} />
              </button>
              <div className="tooltip">
                <span className="tooltipText">Search</span>
                <div className="tooltipArrow"></div>
              </div>
            </div>

            <div className="iconWrapper">
              <Link 
                to="/wishlist"
                className="iconButton"
                aria-label="Wishlist"
              >
                <FiHeart size={22} />
              </Link>
              <div className="tooltip">
                <span className="tooltipText">Wishlist</span>
                <div className="tooltipArrow"></div>
              </div>
            </div>

            <div className="iconWrapper">
              <Link
                to="/login-success"
                className="iconButton"
                aria-label="User account"
              >
                <FiUser size={22} />
              </Link>
              <div className="tooltip">
                <span className="tooltipText">Login</span>
                <div className="tooltipArrow"></div>
              </div>
            </div>

            <div className="iconWrapper">
              <button 
                className="iconButton"
                onClick={onCartClick}
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <FiShoppingBag size={22} />
              </button>
              <span className="cartBadge">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
              <div className="tooltip">
                <span className="tooltipText">Cart</span>
                <div className="tooltipArrow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobileOverlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
