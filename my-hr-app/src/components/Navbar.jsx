import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
                <Link to="/">HR System</Link>
            </div>

            <button className="hamburger-menu" onClick={toggleMobileMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </button>


            <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
                <ul className="nav-list">
                    {isAuthenticated && role === 'employee' && (
                        <>
                            <li><Link to="/employee-dashboard" onClick={toggleMobileMenu}>Employee Dashboard</Link></li>
                            <li><Link to="/employee/payslips" onClick={toggleMobileMenu}>My Payslips</Link></li>
                            <li><Link to="/request-leave" onClick={toggleMobileMenu}>Request Leave</Link></li>
                            <li><Link to="/my-leave-history" onClick={toggleMobileMenu}>My Leave History</Link></li>
                        </>
                    )}
                    {isAuthenticated && role === 'admin' && (
                        <>
                            <li><Link to="/admin-dashboard" onClick={toggleMobileMenu}>Admin Dashboard</Link></li>
                            <li><Link to="/admin/employee-profiles" onClick={toggleMobileMenu}>Manage Employees</Link></li> 
                            <li><Link to="/admin/departments" onClick={toggleMobileMenu}>Manage Departments</Link></li> 
                            <li><Link to="/admin/leave-management" onClick={toggleMobileMenu}>Manage Leaves</Link></li>
                            <li><Link to="/admin/payroll-management" onClick={toggleMobileMenu}>Manage Payroll</Link></li>
                            <li><Link to="/admin/attendance-report" onClick={toggleMobileMenu}>Attendance Report</Link></li>
                            <li><Link to="/admin/user-approvals" onClick={toggleMobileMenu}>Approve Users</Link></li>
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
