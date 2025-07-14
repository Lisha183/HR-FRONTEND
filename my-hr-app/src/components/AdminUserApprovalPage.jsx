import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminUserApprovalPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); 
    const { csrfToken, fetchCsrfToken, isAuthenticated, role } = useAuth(); 

    const getCsrfHeader = async () => {
        let currentToken = csrfToken;
        if (!currentToken) {
            console.log("AdminUserApprovalPage: CSRF token missing, attempting to fetch.");
            currentToken = await fetchCsrfToken();
        }
        if (!currentToken) {
            setError("CSRF token not available. Cannot perform action.");
            console.error("AdminUserApprovalPage: Failed to get CSRF token.");
            return null;
        }
        return currentToken;
    };

    const fetchPendingUsers = async () => {
        setLoading(true);
        setError(null);
        setMessage(null); 
        try {
            const token = await getCsrfHeader();
            if (!token) return;
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/users/pending-approval/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setPendingUsers(data);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch pending users.');
                console.error('Failed to fetch pending users:', errorData);
            }
        } catch (err) {
            setError('Network error while fetching pending users.');
            console.error('Network error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && csrfToken) { 
            fetchPendingUsers();
        } else if (!isAuthenticated && !loading) {

            setError("You must be logged in to view this page.");
            setLoading(false);
        }
    }, [isAuthenticated, csrfToken]); 



    const handleApproveUser = async (userId) => {
        setMessage(null); 
        setError(null);  
        try {
            const token = await getCsrfHeader();
            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/users/${userId}/approve/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': token,
                },
                body: JSON.stringify({ is_approved: true }),
                credentials: 'include',
            });

            if (response.ok) {
                setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                setMessage(`User approved successfully!`);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to approve user.');
                console.error('Failed to approve user:', errorData);
            }
        } catch (err) {
            setError('Network error while approving user.');
            console.error('Network error:', err);
        }
    };

    if (loading) {
        return <p className="loading-message">Loading pending users...</p>;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

    return (
        <div className="user-approval-page-wrapper">
            <div className="user-approval-main-card">
                <h1 className="user-approval-page-title">Pending User Approvals</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                {pendingUsers.length === 0 ? (
                    <div className="no-users-message-card">
                        <p className="no-records-message">No users currently awaiting approval.</p>
                    </div>
                ) : (
                    <div className="user-list-section">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="user-list-item">
                                <div className="user-details">
                                    <p className="user-username">{user.username}</p>
                                    <p className="user-info">{user.email} - <span className="user-role">{user.role}</span></p>
                                </div>
                                <button
                                    onClick={() => handleApproveUser(user.id)}
                                    className="approve-user-button"
                                >
                                    Approve
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
