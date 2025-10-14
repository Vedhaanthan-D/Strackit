import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Navbar,
  BannerSlider,
  MasterCategory,
  NewArrivals,
  StaticTextSection,
  Static2Section,
  InstagramSection,
  BlogSection,
  Footer
} from './Home/components';
import BackToTop from './common/components/BackToTop';
import CartSidebar from './Home/components/sections/CartSidebar';
import ViewCart from './Home/components/sections/ViewCart';
import CategoryPage from './Product Listing/section/CategoryPage';
import ProductDetails from './Product Details/sections/ProductDetails';
import { ToastProvider } from './common/components/Toast';
import './App.css';

function App() {
  // Cart sidebar state
  const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Cart handlers
  const handleCartClick = () => {
    setIsCartSidebarOpen(true);
  };

  const handleCartClose = () => {
    setIsCartSidebarOpen(false);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Navbar 
            cartCount={cartItemCount}
            onCartClick={handleCartClick}
          />
          
          <Routes>
            {/* Home Page Route */}
            <Route path="/" element={
              <>
                <BannerSlider />
                <StaticTextSection />
                <MasterCategory />
                <NewArrivals 
                  title="NEW ARRIVALS" 
                  subtitle="Nemo enim ipsam voluptatem quia voluptas sit aspernatur"
                  limit={8}
                  sortNewest={true}
                />
                <Static2Section />
                <NewArrivals 
                  title="YOU MIGHT LIKE" 
                  subtitle="Nemo enim ipsam voluptatem quia voluptas sit aspernatur" 
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
