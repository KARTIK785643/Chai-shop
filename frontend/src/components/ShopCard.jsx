import React from 'react';
import { Link } from 'react-router-dom';
import './ShopCard.css';

const ShopCard = ({ shop }) => {
  
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
    <div className="shop-card card fade-in">
      <div className="shop-card-image-container">
        <img 
          src={shop.photoUrl} 
          alt={shop.name} 
          className="shop-card-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {shop.averageRating > 0 && (
          <div className="shop-card-rating-floating">
            ★ {shop.averageRating}
          </div>
        )}
      </div>

      <div className="shop-card-content">
        <h3 className="shop-card-name">{shop.name}</h3>
        <p className="shop-card-address">
          <span className="location-icon">📍</span> {shop.address}
        </p>
        <p className="shop-card-description">{shop.description}</p>
        
        <div className="shop-card-review-stats">
          <div className="rating-stars">
            {renderStars(shop.averageRating || 0)}
          </div>
          <span className="shop-card-review-count">
            ({shop.reviewCount || 0} {shop.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        <div className="shop-card-actions">
          <Link to={`/shop/${shop.id}`} className="btn btn-primary shop-card-btn">
            View Details
          </Link>
          <a 
            href={directionsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary shop-card-btn directions-btn"
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
