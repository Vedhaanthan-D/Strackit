import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  Navbar,
  BannerSlider,
  MasterCategory,
  NewArrivals,
  StaticTextSection,
  Static2Section,
  Footer
} from './Home/components';
import CartSidebar from './Home/components/sections/CartSidebar';
import ViewCart from './Home/components/sections/ViewCart';
import CategoryPage from './Product Listing/section/CategoryPage';
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
            </>
          } />
          
          {/* Category Page Route */}
          <Route path="/category/:id" element={<CategoryPage />} />
          
          {/* Cart Page Route */}
          <Route path="/cart" element={
            <ViewCart />
          } />
        </Routes>
        
        <Footer />
        
        {/* Cart Sidebar */}
        <CartSidebar 
          isOpen={isCartSidebarOpen}
          onClose={handleCartClose}
          cartItemCount={cartItemCount}
          setCartItemCount={setCartItemCount}
        />
      </div>
    </Router>
  );
}

export default App;
