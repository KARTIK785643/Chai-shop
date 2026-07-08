import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './RewardsPage.css';

const RewardsPage = () => {
  const { user, points, redeemPoints, claimedCoupons } = useContext(AuthContext);
  const [coupon, setCoupon] = useState('');

  const handleRedeem = async () => {
    try {
      const code = await redeemPoints();
      if (code) {
        setCoupon(code);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to redeem points.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Coupon code ${text} copied to clipboard!`);
  };

  
  const progressPercent = Math.min((points / 50) * 100, 100);

  return (
    <div className="rewards-page container fade-in">
      <div className="rewards-layout">
        
        {}
        <div className="rewards-left-column">
          <div className="rewards-wallet-card card">
            <div className="wallet-header">
              <h3>Chai Rewards Wallet</h3>
              <p className="wallet-user-email">Account: {user?.email}</p>
            </div>
            
            <div className="wallet-points-display">
              <div className="points-circle-outer">
                <svg className="points-svg-circle" viewBox="0 0 100 100">
                  <circle className="circle-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="circle-progress" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    style={{
                      strokeDasharray: 251.2,
                      strokeDashoffset: 251.2 - (251.2 * progressPercent) / 100
                    }}
                  />
                </svg>
                <div className="points-value-container">
                  <span className="points-large">{points}</span>
                  <span className="points-label">Total Points</span>
                </div>
              </div>
            </div>

            <div className="points-status-desc">
              {points >= 50 ? (
                <p className="status-success-message">🎉 You have enough points for a free Chai!</p>
              ) : (
                <p className="status-info-message">
                  Earn <strong>{50 - points} more points</strong> to unlock your next reward.
                </p>
              )}
              <small>Unlock a coupon for 1 free Traditional Masala Chai for every 50 points earned.</small>
            </div>

            <button
              onClick={handleRedeem}
              className="btn btn-primary redeem-btn"
              disabled={points < 50}
            >
              Redeem 50 Points
            </button>
          </div>

          {}
          {coupon && (
            <div className="coupon-generated-card card fade-in">
              <div className="coupon-success-header">
                <span className="coupon-gift-icon">🎁</span>
                <h4>Reward Claimed Successfully!</h4>
              </div>
              <p>Show this coupon code at the counter to redeem your free Chai.</p>
              <div className="coupon-code-box" onClick={() => copyToClipboard(coupon)}>
                <span className="coupon-code-text">{coupon}</span>
                <span className="copy-hint" title="Copy to clipboard">📋</span>
              </div>
              <small className="copy-instruction-text">Click the coupon code to copy it.</small>
            </div>
          )}
        </div>

        {}
        <div className="rewards-right-column">
          {}
          <div className="rewards-earn-rules-card card">
            <h3>How to Earn Points</h3>
            <ul className="earn-rules-list">
              <li>
                <span className="rule-icon">🗺️</span>
                <div>
                  <strong>Discover a Chai Shop (+15 Points)</strong>
                  <p>Add a new verified chai spot to the platform.</p>
                </div>
              </li>
              <li>
                <span className="rule-icon">📝</span>
                <div>
                  <strong>Review a Shop (+10 Points)</strong>
                  <p>Leave a review on any shop details page to help others.</p>
                </div>
              </li>
              <li>
                <span className="rule-icon">✨</span>
                <div>
                  <strong>Sign Up (+65 Points)</strong>
                  <p>Initial welcome points to kickstart your journey!</p>
                </div>
              </li>
            </ul>
          </div>

          {}
          <div className="rewards-history-card card">
            <h3>Claimed Coupons History</h3>
            {claimedCoupons.length === 0 ? (
              <p className="history-empty">No rewards claimed yet. Accumulate points and redeem them above!</p>
            ) : (
              <div className="rewards-history-list">
                {claimedCoupons.map((reward, i) => (
                  <div key={i} className="history-item">
                    <div className="history-item-details">
                      <strong>{reward.description}</strong>
                      <p>{new Date(reward.claimedAt).toLocaleDateString()}</p>
                    </div>
                    <span 
                      className="history-item-code" 
                      onClick={() => copyToClipboard(reward.code)}
                      title="Copy Coupon"
                    >
                      {reward.code} 📋
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RewardsPage;
