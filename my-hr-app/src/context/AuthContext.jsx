import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [csrfToken, setCsrfToken] = useState(null); 
    const navigate = useNavigate();

    const API_BASE_URL = "https://hr-backend-xs34.onrender.com";

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/csrf/`, {
                method: 'GET',
                credentials: 'include', 
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched CSRF token:", data.csrfToken);
                setCsrfToken(data.csrfToken); 
                return data.csrfToken; 
            } else {
                console.error("Failed to fetch CSRF token:", response.status);
                setCsrfToken(null);
                return null;
            }
        } catch (error) {
            console.error("Network error fetching CSRF token:", error);
            setCsrfToken(null);
            return null;
        }
    };

    const fetchUserDetails = async () => {
        let currentCsrfToken = csrfToken;
        if (!currentCsrfToken) {
            currentCsrfToken = await fetchCsrfToken(); 
            if (!currentCsrfToken) {
                console.warn("AuthContext: Could not get CSRF token for session check. Aborting user details fetch.");
                setLoadingAuth(false);
                return null;
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/me/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': currentCsrfToken, 
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
        console.log("AuthContext: Initializing/Checking auth state from useEffect (once on mount).");
        fetchCsrfToken().then(fetchedToken => { 
            if (fetchedToken) {
                fetchUserDetails().then(userRole => { 
                    const currentPath = window.location.pathname;

                    if (userRole === 'admin' && (currentPath === '/login' || currentPath === '/')) {
                        console.log("AuthContext: Initial session - redirecting Admin to /admin-dashboard.");
                        navigate('/admin-dashboard');
                    } else if (userRole === 'employee' && (currentPath === '/login' || currentPath === '/')) {
                        console.log("AuthContext: Initial session - redirecting Employee to /employee-dashboard.");
                        navigate('/employee-dashboard');
                    }
                });
            } else {
                setLoadingAuth(false);
                setUser(null);
                setIsAuthenticated(false);
                setRole(null);
                console.warn("AuthContext: Initial CSRF token fetch failed. Not attempting user details fetch.");
            }
        });
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
        let currentCsrfToken = csrfToken;
        if (!currentCsrfToken) {
            currentCsrfToken = await fetchCsrfToken(); 
            if (!currentCsrfToken) {
                console.error("AuthContext: Could not get CSRF token for logout. Aborting logout.");
                return; 
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': currentCsrfToken,
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