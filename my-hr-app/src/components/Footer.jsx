import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';


export default function Footer() {
  const { isAuthenticated, user } = useAuth(); 

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-section">
        <img src={logo} alt="HRPlatform Logo" className="footer-logo" />

          <h2 className="footer-title">Looma</h2>
          <p className="footer-description">
            Empowering businesses to manage payroll, performance, and attendance with ease.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-subtitle">Quick Links</h3>
          <ul>
  <li><Link to="/">Home</Link></li>
  <li><Link to="/register">Register</Link></li>
  {!isAuthenticated && <li><Link to="/login">Login</Link></li>}
  {isAuthenticated && user?.role === 'admin' && (
    <li><Link to="/admin-dashboard">Dashboard</Link></li>
  )}
  {isAuthenticated && user?.role === 'employee' && (
    <li><Link to="/employee-dashboard">Dashboard</Link></li>
  )}
</ul>

        </div>
        <div className="footer-section">
          <h3 className="footer-subtitle">Contact</h3>
          <p>Email: support@loomahrplatform.com</p>
          <p>Phone: +254 712 345 678</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Looma. All rights reserved.</p>
      </div>
    </footer>
  );
}
