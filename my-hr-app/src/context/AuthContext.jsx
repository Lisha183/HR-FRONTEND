import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie }  from '../utils/crsf'; 

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true); 
    const navigate = useNavigate();

    const fetchUserDetails = async () => {
        try {
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/user/me/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
            });

            if (response.ok) {
                const userData = await response.json();
                console.log(" AuthContext: User data fetched from session endpoint:", userData);
                
                const userId = userData.id;
                const username = userData.username;
                const userRole = userData.is_staff ? 'admin' : userData.role; 

                setUser({ id: userId, username: username, role: userRole });
                setIsAuthenticated(true);
                setRole(userRole);
                console.log("AuthContext: State updated from session check.");
                return userRole; 
            } else {
                console.log("AuthContext: Session check failed, not authenticated. Status:", response.status);
                setUser(null);
                setIsAuthenticated(false);
                setRole(null);
                return null;
            }
        } catch (error) {
            console.error('AuthContext: Network error during session check:', error);
            setUser(null);
            setIsAuthenticated(false);
            setRole(null);
            return null;
        } finally {
            setLoadingAuth(false); 
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Step 1: Fetch CSRF cookie first
                await fetch('https://hr-backend-xs34.onrender.com/api/csrf/', {
                    credentials: 'include',
                });
                console.log('CSRF cookie fetched successfully.');
    
                const userRole = await fetchUserDetails();
    
                const currentPath = window.location.pathname;
                if (userRole === 'admin' && (currentPath === '/login' || currentPath === '/')) {
                    navigate('/admin-dashboard');
                } else if (userRole === 'employee' && (currentPath === '/login' || currentPath === '/')) {
                    navigate('/employee-dashboard');
                }
            } catch (error) {
                console.error('Error during auth initialization:', error);
            }
        };
    
        initializeAuth();
    }, []);
    

    useEffect(() => {
        console.log("AuthContext state changed:");
        console.log("  user:", user);
        console.log("  isAuthenticated:", isAuthenticated);
        console.log("  role:", role);

        const currentPath = window.location.pathname;
        if (isAuthenticated && (role === 'admin' || role === 'employee') && currentPath === '/login') {
            if (role === 'admin') {
                console.log("AuthContext state change: Redirecting Admin from /login to /admin-dashboard.");
                navigate('/admin-dashboard');
            } else if (role === 'employee') {
                console.log("AuthContext state change: Redirecting Employee from /login to /employee-dashboard.");
                navigate('/employee-dashboard');
            }
        }
    }, [user, isAuthenticated, role, navigate]); 


    const loginUser = (userData) => {
        console.log("AuthContext: loginUser called with userData:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setRole(userData.role); 
        setLoadingAuth(false); 
        console.log("AuthContext: State updated after loginUser.");
    };

    const logout = async () => { 
        try {
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
                setIsAuthenticated(false);
                setRole(null);
                setLoadingAuth(false); 
                console.log('Successfully logged out.');
                navigate('/login');
            } else {
                const errorData = await response.json();
                console.error('Logout failed:', errorData.detail);
            }
        } catch (error) {
            console.error('Network error during logout:', error);
        }
    };


    return (
        <AuthContext.Provider value={{ user, isAuthenticated, role, loginUser, logout, loadingAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
