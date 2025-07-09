import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
          await fetch("https://hr-backend-xs34.onrender.com/api/csrf/", {
            credentials: "include",
          });
      
          const csrfToken = getCookie("csrftoken");
      
          if (!csrfToken || csrfToken.length < 10) {
            throw new Error("Invalid or missing CSRF token.");
          }
      
          const response = await fetch("https://hr-backend-xs34.onrender.com/api/logout/", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
          });
      
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Logout failed.");
          }
      
          navigate("/login");
        } catch (error) {
          console.error("Logout failed:", error.message);
          alert("Logout failed. Please try again.");
        }
      };
      

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const role = user ? user.role : null;

    return (
        <nav className="navbar">
       <div className="navbar-brand"> 
  <img src={logo} alt="HRPlatform Logo" className="footer-logo " />
  <Link to="/" onClick={toggleMobileMenu} className="navbar-title">LOOMA</Link>
</div>

            <button className="hamburger-menu" onClick={toggleMobileMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>

            <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                <ul className="nav-list">
                   
                    <li><Link to="/home" onClick={toggleMobileMenu}>Home</Link></li>
                    <li><Link to="/about" onClick={toggleMobileMenu}>About Us</Link></li>
                    <li><Link to="/contact" onClick={toggleMobileMenu}>Contact Us</Link></li>
                    {isAuthenticated && user?.role === 'admin' && (
                        <li><Link to="/admin-dashboard">Dashboard</Link></li>
                      )}
                      {isAuthenticated && user?.role === 'employee' && (
                        <li><Link to="/employee-dashboard">Dashboard</Link></li>
                      )}


                    {isAuthenticated && role === 'employee' && (
                        <>

                        </>
                    )}

                    {isAuthenticated && role === 'admin' && (
                        <>

                        </>
                    )}

                    {isAuthenticated ? (
                        <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
                    ) : (
                        <li><Link to="/login" onClick={toggleMobileMenu}>Login</Link></li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
