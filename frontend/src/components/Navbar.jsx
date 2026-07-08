import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, points, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <span className="logo-emoji">☕</span>
          <span className="logo-text">ChaiSpot</span>
        </Link>

        <button 
          className={`navbar-toggle ${isOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              end
            >
              Home
            </NavLink>
          </li>

          {user ? (
            <>
              <li className="navbar-item">
                <NavLink 
                  to="/add-shop" 
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Add Shop
                </NavLink>
              </li>
              <li className="navbar-item">
                <NavLink 
                  to="/rewards" 
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Rewards
                </NavLink>
              </li>
              <li className="navbar-item navbar-points-badge">
                <span className="points-icon">🌟</span>
                <span className="points-count">{points} pts</span>
              </li>
              <li className="navbar-item user-email-display">
                {user.email.split('@')[0]}
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </NavLink>
              </li>
              <li className="navbar-item">
                <NavLink 
                  to="/signup" 
                  className="navbar-signup-btn"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
