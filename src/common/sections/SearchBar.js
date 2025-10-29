import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiShoppingBag, 
  FiX,
  FiSearch
} from 'react-icons/fi';
import '../styles/SearchBar.css';
import aoneLogo from '../../Home/assets/aone-logo.jpg';
import { 
  searchProducts, 
  getSearchSuggestions, 
  saveSearchHistory,
  formatSearchQuery
} from '../utils/searchUtils';

const SearchBar = ({
  isSearchOpen = false,
  onClose = () => {},
  onUserClick = () => {},
  onCartClick = () => {},
  cartCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Focus search input when search bar opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      // Small delay to ensure animation starts smoothly
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 300);
    }
  }, [isSearchOpen]);

  // Handle search input changes
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      setIsSearching(true);
      try {
        const results = await searchProducts(query, 6); // Limit to 6 results for dropdown
        setSearchResults(results);
      } catch (error) {
        console.warn('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Save search to history
      saveSearchHistory(searchQuery);
      
      // Navigate to search results page
      const formattedQuery = formatSearchQuery(searchQuery);
      navigate(`/search?q=${formattedQuery}`);
      
      // Close search bar
      handleClose();
    }
  };

  // Handle close search
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    onClose();
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        handleClose();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  return (
    <>
      {/* Search Bar Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'search-overlay--active' : ''}`}>
        <div className="search-bar">
          <div className="search-bar__container">
            {/* Left Section - Logo */}
            <div className="search-bar__logo">
              <Link to="/" onClick={handleClose}>
                <img src={aoneLogo} alt="AONE Logo" className="search-bar__logo-image" />
              </Link>
            </div>

            {/* Center Section - Search Input */}
            <div className="search-bar__input-container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-wrapper">
                  <FiSearch className="search-input-icon" size={24} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <div className="search-loading">
                      <div className="search-spinner"></div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Section - Action Icons */}
            <div className="search-bar__actions">
              <div className="search-bar__icon-wrapper">
                <Link
                  to="/login-success"
                  className="search-bar__icon-button"
                  aria-label="User account"
                  onClick={handleClose}
                >
                  <FiUser size={22} />
                </Link>
              </div>

              <div className="search-bar__icon-wrapper">
                <button 
                  className="search-bar__icon-button"
                  onClick={() => {
                    onCartClick();
                    handleClose();
                  }}
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <FiShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="search-bar__cart-badge">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="search-bar__icon-wrapper">
                <button 
                  className="search-bar__close-button"
                  onClick={handleClose}
                  aria-label="Close search"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {(searchQuery.trim() && (searchResults.length > 0 || isSearching)) && (
            <div className="search-results">
              <div className="search-results__container">
                {isSearching ? (
                  <div className="search-results__loading">
                    <div className="search-spinner"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <>
                    {searchResults.length > 0 ? (
                      <>
                        <div className="search-results__header">
                          <span>Search Results ({searchResults.length})</span>
                        </div>
                        <div className="search-results__list">
                          {searchResults.map((result) => (
                            <Link 
                              key={result.id} 
                              to={`/product/${result.id}`}
                              className="search-result-item"
                              onClick={handleClose}
                            >
                              <div className="search-result-item__image">
                                {result.image ? (
                                  <img src={result.image} alt={result.title} />
                                ) : (
                                  <div className="search-result-item__placeholder">
                                    <FiSearch size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="search-result-item__content">
                                <h4 className="search-result-item__title">{result.title}</h4>
                                <span className="search-result-item__category">{result.category}</span>
                                {result.price && (
                                  <span className="search-result-item__price">${result.price}</span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="search-results__footer">
                          <button 
                            className="search-results__view-all"
                            onClick={handleSearchSubmit}
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="search-results__no-results">
                        <span>No results found for "{searchQuery}"</span>
                        <p>Try searching with different keywords</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background Overlay */}
      <div 
        className={`search-backdrop ${isSearchOpen ? 'search-backdrop--active' : ''}`}
        onClick={handleClose}
      />
    </>
  );
};

export default SearchBar;
