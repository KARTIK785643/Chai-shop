import React from 'react';
import './ReviewList.css';

const ReviewList = ({ reviews }) => {
  
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`review-star ${i < rating ? 'filled' : 'empty'}`}>
        ★
      </span>
    ));
  };

  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sortedReviews.length === 0) {
    return (
      <div className="reviews-empty text-center">
        <p>No reviews yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {sortedReviews.map((review) => {
        const userInitial = review.userEmail ? review.userEmail.charAt(0).toUpperCase() : 'U';
        
        return (
          <div key={review.id} className="review-item card fade-in">
            <div className="review-header">
              <div className="review-user-avatar">
                {userInitial}
              </div>
              <div className="review-meta">
                <span className="review-user-email">{review.userEmail}</span>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>
            <div className="review-body">
              <p className="review-text">{review.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
