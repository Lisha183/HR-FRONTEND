import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { getCookie } from '../utils/crsf';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
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
