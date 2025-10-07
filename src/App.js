import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './Home/components/Navbar';
import BannerSlider from './Home/components/BannerSlider';
import MasterCategory from './Home/components/MasterCategory';
import NewArrivals from './Home/components/NewArrivals';
import StaticTextSection from './Home/components/StaticTextSection';
import Static2Section from './Home/components/Static2Section';
import Footer from './Home/components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <ErrorBoundary>
          <BannerSlider />
        </ErrorBoundary>
        <StaticTextSection />
        <ErrorBoundary>
          <MasterCategory />
        </ErrorBoundary>
        <ErrorBoundary>
          <NewArrivals 
            title="NEW ARRIVALS" 
            subtitle="Nemo enim ipsam voluptatem quia voluptas sit aspernatur"
            limit={8}
            sortNewest={true}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <Static2Section />
        </ErrorBoundary>
        <ErrorBoundary>
          <NewArrivals 
            title="YOU MIGHT LIKE" 
            subtitle="Nemo enim ipsam voluptatem quia voluptas sit aspernatur" 
            limit={8}
            sortNewest={false}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
