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
import CartSidebar from './Home/components/sections/CartSidebar';
import ViewCart from './Home/components/sections/ViewCart';
import CategoryPage from './Product Listing/section/CategoryPage';
import ProductDetails from './Product Details/sections/ProductDetails';
import Wishlist from './Product Details/sections/Wishlist';
import SearchBar from './common/sections/SearchBar';
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

  // Load cart count on initial mount
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const { shopId, userId } = CART_CONFIG;
        const cartData = await fetchCart(shopId, userId);
        const totalItems = cartData?.reduce((total, item) => total + item.quantity, 0) || 0;
        setCartItemCount(totalItems);
      } catch (error) {
        console.error('Failed to load cart count:', error);
        setCartItemCount(0);
      }
    };

    loadCartCount();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Navbar 
            cartCount={cartItemCount}
            onCartClick={handleCartClick}
            onSearchClick={handleSearchClick}
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
          
          {/* Search Bar Overlay */}
          <SearchBar 
            isSearchOpen={isSearchOpen}
            onClose={handleSearchClose}
            onCartClick={handleCartClick}
            cartCount={cartItemCount}
          />
          
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
