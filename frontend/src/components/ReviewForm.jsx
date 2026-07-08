import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ shopId, existingReview }) => {
  const { user, submitReview } = useContext(AuthContext);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setText(existingReview.text);
    } else {
      setRating(5);
      setText('');
    }
    setError('');
    setSuccess('');
  }, [existingReview, shopId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    if (!text.trim()) {
      setError('Review description cannot be empty.');
      return;
    }

    try {
      const successResult = await submitReview(shopId, rating, text);
      if (successResult) {
        setSuccess(existingReview ? 'Your review has been updated successfully!' : 'Thank you! Your review has been posted.');
        
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Something went wrong. Please check if you are logged in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  
  if (!user) {
    return (
      <div className="review-form-logged-out card">
        <h4>Share Your Experience</h4>
        <p>Have you visited this chai spot? Log in to rate their chai and leave a review.</p>
        <Link to="/login" className="btn btn-primary login-cta-btn">
          Log In to Review
        </Link>
      </div>
    );
  }

  return (
    <div className="review-form-container card fade-in">
      <h4>{existingReview ? 'Update Your Review' : 'Write a Review'}</h4>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Rating</label>
          <div className="interactive-stars-container">
            {[1, 2, 3, 4, 5].map((index) => (
              <button
                type="button"
                key={index}
                className={`interactive-star-btn ${
                  index <= (hoveredRating || rating) ? 'active' : ''
                }`}
                onClick={() => setRating(index)}
                onMouseEnter={() => setHoveredRating(index)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${index} Stars`}
              >
                ★
              </button>
            ))}
            <span className="rating-label-text">
              {hoveredRating || rating} Star{ (hoveredRating || rating) === 1 ? '' : 's' }
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="review-text-input">Your Review</label>
          <textarea
            id="review-text-input"
            rows="4"
            className="form-control review-textarea"
            placeholder="Describe the aroma, spice level, sweetness, and overall experience..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary submit-review-btn">
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
