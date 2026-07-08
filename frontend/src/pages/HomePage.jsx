import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MapView from '../components/MapView';
import ShopList from '../components/ShopList';
import './HomePage.css';

const HomePage = () => {
  const { shops } = useContext(AuthContext);

  return (
    <div className="home-page fade-in">
      {}
      <header className="hero-section">
        <div className="hero-container container">
          <div className="hero-content">
            <h1 className="hero-title">Discover the Best Chai Near You</h1>
            <p className="hero-subtitle">
              Explore authentic local street-style teas, spiced masala brews, and hidden chai lounges. 
              Review spots, share your discoveries, and redeem points for free cups!
            </p>
            <div className="hero-search-meta">
              <span className="meta-badge">☕ {shops.length} Chai Spots Mapped</span>
            </div>
          </div>
        </div>
      </header>

      {}
      <main className="home-main-section container">
        <div className="homepage-layout">
          <div className="homepage-listings-panel">
            <div className="section-header-meta">
              <h2>Nearby Chai Discoveries</h2>
              <p>Click cards to view detailed spices, authentic reviews, and user points.</p>
            </div>
            <ShopList shops={shops} />
          </div>

          <div className="homepage-map-panel">
            <div className="map-sticky-wrapper">
              <div className="section-header-meta">
                <h2>Interactive Map Tracker</h2>
                <p>Click coffee markers to get directions or view details.</p>
              </div>
              <MapView shops={shops} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
