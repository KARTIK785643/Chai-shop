import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AddShopPage from './pages/AddShopPage';
import ShopDetailsPage from './pages/ShopDetailsPage';
import RewardsPage from './pages/RewardsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          
          <div className="app-content-wrapper">
            <Routes>
              {}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/shop/:id" element={<ShopDetailsPage />} />

              {}
              <Route 
                path="/add-shop" 
                element={
                  <ProtectedRoute>
                    <AddShopPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rewards" 
                element={
                  <ProtectedRoute>
                    <RewardsPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>

          <footer className="app-footer">
            <div className="container footer-container">
              <p className="footer-copyright">
                © {new Date().getFullYear()} <strong>ChaiSpot</strong>. Handcrafted with ☕ for tea lovers.
              </p>
              <div className="footer-links">
                <a href="#privacy">Privacy Policy</a>
                <span>•</span>
                <a href="#terms">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
