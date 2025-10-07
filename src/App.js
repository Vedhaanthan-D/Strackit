import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  Navbar,
  BannerSlider,
  MasterCategory,
  NewArrivals,
  StaticTextSection,
  Static2Section,
  Footer
} from './Home/components';
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
