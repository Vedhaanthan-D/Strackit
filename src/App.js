import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Navbar,
  BannerSlider,
  MasterCategory,
  NewArrivals,
  StaticTextSection,
  Static2Section,
  BlogSection,
  InstagramSection,
  Footer
} from './Home/components';
import BackToTop from './common/sections/BackToTop';
import SearchBar from './common/sections/SearchBar';
import CartSidebar from './Home/components/sections/CartSidebar';
import ViewCart from './Home/components/sections/ViewCart';
import CategoryPage from './Product Listing/section/CategoryPage';
import ProductDetails from './Product Details/sections/ProductDetails';
import Wishlist from './Product Details/sections/Wishlist';
import LoginSuccess from './common/sections/LoginSuccess';
import { ToastProvider } from './common/sections/Toast';
import { fetchCart } from 'shops-query/src/modules/cart/index';
import { CART_CONFIG } from './config/appIds';
import './App.css';

function App() {
  // Cart sidebar state
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Search bar state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchInitialCartCount = async () => {
      try {
        const { shopId, userId } = CART_CONFIG;
        const cartData = await fetchCart(shopId, userId);
        const totalCount = cartData?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemCount(totalCount);
      } catch (error) {
        setCartItemCount(0);
      }
    };

    fetchInitialCartCount();
  }, []);

  useEffect(() => {
    const handleCartUpdate = async (event) => {
      try {
        const { shopId, userId } = CART_CONFIG;
        const cartData = await fetchCart(shopId, userId);
        const totalCount = cartData?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemCount(totalCount);
      } catch (error) {
        // Silently handle error
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Cart handlers
  const handleCartClick = () => {
    setIsCartSidebarOpen(true);
  };

  const handleCartClose = () => {
    setIsCartSidebarOpen(false);
  };

  // Search handlers
  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
  };

  // User account handler
  const handleUserClick = () => {
    // Handle user account click - can navigate to account page
  };

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Navbar 
            cartCount={cartItemCount}
            onCartClick={handleCartClick}
            onSearchClick={handleSearchClick}
            onUserClick={handleUserClick}
          />
          
          {/* Search Bar */}
          <SearchBar 
            isSearchOpen={isSearchOpen}
            onClose={handleSearchClose}
            onUserClick={handleUserClick}
            onCartClick={handleCartClick}
            cartCount={cartItemCount}
          />
          
          <Routes>
            {/* Home Page Route */}
            <Route path="/" element={
              <>
                <BannerSlider />
                <StaticTextSection />
                <MasterCategory />
                <div className="section-gap"></div>
                <NewArrivals 
                  title="NEW ARRIVALS" 
                  subtitle=""
                  limit={8}
                  sortNewest={true}
                />
                <div className="section-gap"></div>
                <Static2Section />
                <div className="section-gap"></div>
                <NewArrivals 
                  title="YOU MIGHT LIKE" 
                  subtitle="" 
                  limit={8}
                  sortNewest={false}
                />
                <BlogSection />
                <InstagramSection />
                <Footer />
              </>
            } />
            
            {/* Category Page Route */}
            <Route path="/category/:id" element={
              <>
                <CategoryPage />
                <Footer />
              </>
            } />
            
            {/* Product Details Route */}
            <Route path="/product/:id" element={
              <>
                <ProductDetails />
                <Footer />
              </>
            } />
            
            {/* Cart Page Route */}
            <Route path="/cart" element={
              <>
                <ViewCart />
                <Footer />
              </>
            } />
            
            {/* Wishlist Page Route */}
            <Route path="/wishlist" element={
              <>
                <Wishlist />
                <Footer />
              </>
            } />
            
            {/* Login Success Page Route */}
            <Route path="/login-success" element={
              <>
                <LoginSuccess />
                <Footer />
              </>
            } />
          </Routes>
          
          {/* Cart Sidebar */}
          <CartSidebar 
            isOpen={isCartSidebarOpen}
            onClose={handleCartClose}
            cartItemCount={cartItemCount}
            setCartItemCount={setCartItemCount}
          />
          
          {/* Back to Top Button */}
          <BackToTop />
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
