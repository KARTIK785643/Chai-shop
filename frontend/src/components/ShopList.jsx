import React from 'react';
import ShopCard from './ShopCard';
import './ShopList.css';

const ShopList = ({ shops }) => {
  if (!shops || shops.length === 0) {
    return (
      <div className="shop-list-empty text-center card">
        <span className="empty-icon">☕</span>
        <h3>No Chai Shops Found</h3>
        <p>Be the first to add an amazing chai spot to our map!</p>
      </div>
    );
  }

  return (
    <div className="shop-list-grid">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
};

export default ShopList;
