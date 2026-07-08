import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import './ShopDetailsPage.css';

const ShopDetailsPage = () => {
  const { id } = useParams();
  const { shops, reviews, user } = useContext(AuthContext);

  
  const shop = shops.find((s) => s.id === id);

  
  if (!shop) {
    return (
      <div className="shop-details-not-found container text-center fade-in">
        <span className="not-found-icon">🕵️‍♂️</span>
        <h2>Shop Not Found</h2>
        <p>The chai shop you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  
  const shopReviews = reviews.filter((r) => r.shopId === shop.id);

  
  const userReview = user ? shopReviews.find((r) => r.userEmail === user.email) : null;

  
  const renderStars = (rating) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;

  return (
    <div className="shop-details-page fade-in">
      {}
      <div className="shop-details-hero" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.75)), url(${shop.photoUrl})` }}>
        <div className="shop-details-hero-container container">
          <Link to="/" className="back-to-home-link">
            ← Back to Map
          </Link>
          <div className="shop-details-title-block">
            <h1 className="shop-details-name">{shop.name}</h1>
            <p className="shop-details-hero-address">📍 {shop.address}</p>
            <div className="shop-details-hero-rating">
              <div className="rating-stars">{renderStars(shop.averageRating || 0)}</div>
              <span className="hero-rating-score">{shop.averageRating || '0.0'}</span>
              <span className="hero-review-count">
                ({shopReviews.length} {shopReviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {}
      <main className="shop-details-main container">
        <div className="shop-details-layout">
          {}
          <div className="shop-details-left-panel">
            <div className="shop-info-card card">
              <h3>About the Spot</h3>
              <p className="shop-full-description">{shop.description}</p>
              
              <div className="shop-meta-list">
                <div className="meta-item">
                  <span className="meta-icon">🗺️</span>
                  <div>
                    <strong>Location Coords</strong>
                    <p>{shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}</p>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🚚</span>
                  <div>
                    <strong>Fulfillment</strong>
                    <p>Dine-in, Takeaway available</p>
                  </div>
                </div>
              </div>

              <a 
                href={directionsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary shop-details-directions-btn"
              >
                🗺️ Get Directions in Maps
              </a>
            </div>

            {}
            <ReviewForm shopId={shop.id} existingReview={userReview} />
          </div>

          {}
          <div className="shop-details-right-panel">
            <div className="reviews-section-header">
              <h3>Community Reviews</h3>
              <p>Ratings and insights provided by chai enthusiasts.</p>
            </div>
            
            <ReviewList reviews={shopReviews} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopDetailsPage;
