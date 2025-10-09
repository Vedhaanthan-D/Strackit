import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiUser, 
  FiShoppingBag, 
  FiMenu, 
  FiX,
  FiChevronDown 
} from 'react-icons/fi';
import logoImage from '../../Home/assets/aone-logo.webp';
import '../styles/header.css';

const Navbar = ({
  navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shops', path: '/shops' },
    { name: 'Products', path: '/products' },
    { name: 'Blog', path: '/blog' },
    { name: 'Pages', path: '/pages' }
  ],
  languageOptions = ['English', 'French'],
  currencyOptions = ['USD', 'INR'],
  cartCount = 0,
  onSearchClick = () => {},
  onUserClick = () => {},
  onCartClick = () => {},
  onLanguageChange = () => {},
  onCurrencyChange = () => {}
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  
  // Refs for dropdown containers
  const languageDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    
    // Add event listener when dropdowns are open
    if (isLanguageDropdownOpen || isCurrencyDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageDropdownOpen, isCurrencyDropdownOpen]);
  
  // Handle escape key to close dropdowns
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsLanguageDropdownOpen(false);
        setIsCurrencyDropdownOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close both dropdowns when toggling mobile menu
    setIsLanguageDropdownOpen(false);
    setIsCurrencyDropdownOpen(false);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
    onLanguageChange(language);
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setIsCurrencyDropdownOpen(false);
    onCurrencyChange(currency);
  };

  return (
    <header className="header">
      <div className="container">
        {/* Left Section - Navigation Links */}
        <nav className={`navigation ${isMobileMenuOpen ? 'mobileMenuOpen' : ''}`}>
          <ul className="navList">
            {navigationLinks.map((link, index) => (
              <li key={index} className="navItem">
                <Link 
                  to={link.path} 
                  className="navLink"
                  onClick={() => setIsMobileMenuOpen(false)}
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
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Center Section - Logo */}
        <div className="logoContainer">
          <Link to="/" className="logoLink">
            <img 
              src={logoImage} 
              alt="AONE Logo" 
              className="logoImage"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="logoText" style={{ display: 'none' }}>
              AONE
            </div>
          </Link>
        </div>

        {/* Right Section - Dropdowns and Action Icons */}
        <div className="rightActions">
          {/* Language Dropdown */}
          <div className="dropdown" ref={languageDropdownRef}>
            <button 
              className="dropdownButton"
              onClick={() => {
                const newState = !isLanguageDropdownOpen;
                setIsLanguageDropdownOpen(newState);
                // Close currency dropdown when opening language dropdown
                if (newState) setIsCurrencyDropdownOpen(false);
              }}
              aria-label="Select language"
              aria-expanded={isLanguageDropdownOpen}
              aria-haspopup="true"
            >
              {selectedLanguage}
              <FiChevronDown className="dropdownIcon" />
            </button>
            {isLanguageDropdownOpen && (
              <div className="dropdownMenu">
                {languageOptions.map((language, index) => (
                  <button
                    key={index}
                    className={`dropdownItem ${selectedLanguage === language ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(language)}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Dropdown */}
          <div className="dropdown" ref={currencyDropdownRef}>
            <button 
              className="dropdownButton"
              onClick={() => {
                const newState = !isCurrencyDropdownOpen;
                setIsCurrencyDropdownOpen(newState);
                // Close language dropdown when opening currency dropdown
                if (newState) setIsLanguageDropdownOpen(false);
              }}
              aria-label="Select currency"
              aria-expanded={isCurrencyDropdownOpen}
              aria-haspopup="true"
            >
              {selectedCurrency}
              <FiChevronDown className="dropdownIcon" />
            </button>
            {isCurrencyDropdownOpen && (
              <div className="dropdownMenu">
                {currencyOptions.map((currency, index) => (
                  <button
                    key={index}
                    className={`dropdownItem ${selectedCurrency === currency ? 'active' : ''}`}
                    onClick={() => handleCurrencySelect(currency)}
                  >
                    {currency}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="actionIcons">
            <div className="iconWrapper">
              <button 
                className="iconButton"
                onClick={onSearchClick}
                aria-label="Search"
              >
                <FiSearch />
              </button>
              <div className="tooltip">
                <span className="tooltipText">Search</span>
                <div className="tooltipArrow"></div>
              </div>
            </div>

            <div className="iconWrapper">
              <button 
                className="iconButton"
                onClick={onUserClick}
                aria-label="User account"
              >
                <FiUser />
              </button>
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
                <FiShoppingBag />
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
