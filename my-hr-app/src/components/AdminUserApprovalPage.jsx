import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminUserApprovalPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); 
    const { fetchCsrfToken, isAuthenticated } = useAuth(); 
    const hasFetchedRef = useRef(false);

    const fetchPendingUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const token = await fetchCsrfToken(); 
            if (!token) {
                setError("CSRF token unavailable. Cannot fetch pending users.");
                setLoading(false);
                return;
            }

            const response = await fetch(
                'https://hr-backend-xs34.onrender.com/api/admin/users/pending-approval/',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token,
                    },
                    credentials: 'include',
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPendingUsers(data);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch pending users.');
            }
        } catch (err) {
            setError('Network error while fetching pending users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [fetchCsrfToken]);

    useEffect(() => {
        if (isAuthenticated && !hasFetchedRef.current) {
            fetchPendingUsers();
            hasFetchedRef.current = true;
        }
    }, [isAuthenticated, fetchPendingUsers]);

    const handleApproveUser = async (userId) => {
        setMessage(null);
        setError(null);

        try {
            const token = await fetchCsrfToken();
            if (!token) {
                setError("CSRF token not available. Cannot approve user.");
                return;
            }

            const response = await fetch(
                `https://hr-backend-xs34.onrender.com/api/admin/users/${userId}/approve/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token,
                    },
                    body: JSON.stringify({ is_approved: true }),
                    credentials: 'include',
                }
            );

            if (response.ok) {
                setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                setMessage("User approved successfully!");
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to approve user.');
            }
        } catch (err) {
            setError('Network error while approving user.');
            console.error(err);
        }
    };

    if (loading) return <p className="loading-message">Loading pending users...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

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
