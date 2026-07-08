import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('chaispot_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('chaispot_points');
    return savedPoints !== null ? parseInt(savedPoints, 10) : 0;
  });

  
  const [shops, setShops] = useState([]);

  
  const [reviews, setReviews] = useState([]);

  
  const [claimedCoupons, setClaimedCoupons] = useState([]);

  
  useEffect(() => {
    if (user) {
      localStorage.setItem('chaispot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('chaispot_user');
    }
  }, [user]);

  
  useEffect(() => {
    localStorage.setItem('chaispot_points', points.toString());
  }, [points]);

  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [shopsRes, reviewsRes] = await Promise.all([
          api.get('/shops'),
          api.get('/reviews')
        ]);
        setShops(shopsRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error("Error loading initial database data:", err);
      }
    };
    fetchInitialData();
  }, []);

  
  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.token) {
        try {
          const res = await api.get('/users/me');
          setPoints(res.data.points);
          setClaimedCoupons(res.data.claimedCoupons || []);
        } catch (err) {
          console.error("Error loading user profile:", err);
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      } else {
        setClaimedCoupons([]);
      }
    };
    loadProfile();
  }, [user]);

  
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      const loggedUser = { email: userData.email, token };
      
      setUser(loggedUser);
      setPoints(userData.points);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const signup = async (email, password) => {
    try {
      await api.post('/auth/register', { email, password });
      return true;
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setPoints(0);
    setClaimedCoupons([]);
    localStorage.removeItem('chaispot_user');
    localStorage.removeItem('chaispot_points');
  };

  
  const addShop = async (newShopData) => {
    try {
      const res = await api.post('/shops', {
        name: newShopData.name,
        address: newShopData.address,
        description: newShopData.description,
        photoUrl: newShopData.photoUrl,
        latitude: newShopData.latitude,
        longitude: newShopData.longitude
      });
      const { shop, points: newPoints } = res.data;

      setShops((prevShops) => [shop, ...prevShops]);
      setPoints(newPoints);
      return shop;
    } catch (err) {
      console.error("Add shop API call failed:", err);
      throw err;
    }
  };

  
  const submitReview = async (shopId, rating, text) => {
    if (!user) return false;
    try {
      const res = await api.post('/reviews', { shopId, rating, text });
      const { review, shop, points: newPoints } = res.data;

      
      setReviews((prevReviews) => {
        const index = prevReviews.findIndex(
          (r) => r.shopId === shopId && r.userEmail === user.email
        );
        const updated = [...prevReviews];
        if (index > -1) {
          updated[index] = review;
        } else {
          updated.unshift(review);
        }
        return updated;
      });

      
      setShops((prevShops) =>
        prevShops.map((s) => (s.id === shopId ? shop : s))
      );

      setPoints(newPoints);
      return true;
    } catch (err) {
      console.error("Submit review API call failed:", err);
      throw err;
    }
  };

  
  const redeemPoints = async () => {
    try {
      const res = await api.post('/rewards/redeem');
      const { code, points: newPoints, coupon } = res.data;
      
      setPoints(newPoints);
      setClaimedCoupons((prev) => [coupon, ...prev]);

      return code;
    } catch (err) {
      console.error("Redeem points API call failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        points,
        shops,
        reviews,
        claimedCoupons,
        login,
        signup,
        logout,
        addShop,
        submitReview,
        redeemPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
