import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf';


export default function AdminLeaveManagement() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const { isAuthenticated, user, csrfToken,  fetchCsrfToken  } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchLeaveRequests();
    }, [isAuthenticated, user, navigate]);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            let token = csrfToken || await fetchCsrfToken();
            if (!token) throw new Error("No CSRF token available.");

            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/leave-requests/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch all leave requests: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            setLeaveRequests(data);
        } catch (err) {
            console.error("Error fetching admin leave requests:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus, comments = '') => {
        setMessage(null);
        setError(null);
        try {
            let token = csrfToken || await fetchCsrfToken();
            if (!token) throw new Error("No CSRF token available.");

            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/leave-requests/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ status: newStatus, comments: comments }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to update leave request status: ${errorData.detail || response.statusText}`);
            }

            setMessage(`Leave request status updated to ${newStatus} successfully!`);
            fetchLeaveRequests();
        } catch (err) {
            console.error("Error updating leave request status:", err);
            setError(err.message);
        }
    };

    const handleDeleteRequest = async (id) => {
        setMessage(null);
        setError(null);
        try {
            let token = csrfToken || await fetchCsrfToken();
            if (!token) throw new Error("No CSRF token available.");

            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/leave-requests/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to delete leave request: ${errorData.detail || response.statusText}`);
            }

            setMessage('Leave request deleted successfully!');
            setPendingDeleteId(null);
            setShowConfirm(false);
            fetchLeaveRequests();
        } catch (err) {
            console.error("Error deleting leave request:", err);
            setError(err.message);
        }
    };

    if (loading) return <p className="loading-message">Loading all leave requests...</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="leave-page-wrapper">
            <div className="leave-main-card">
                <h1 className="leave-page-title">Manage Leave Requests (Admin)</h1>
                {showConfirm && (
                    <div className="custom-confirm-box">
                        <p>Are you sure you want to delete this leave request? This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button onClick={() => handleDeleteRequest(pendingDeleteId)} className="confirm-button danger">Yes, Delete</button>
                            <button onClick={() => { setPendingDeleteId(null); setShowConfirm(false); }} className="cancel-button">Cancel</button>
                        </div>
                    </div>
                )}

                {(message || error) && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>{message || error}</div>
                )}

                {leaveRequests.length === 0 ? (
                    <p className="no-records-message">No leave requests found.</p>
                ) : (
                    <div className="leave-table-container">
                        <table className="leave-data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Period</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Requested</th>
                                    <th>Approved By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.map(request => (
                                    <tr key={request.id}>
                                        <td>{request.id}</td>
                                        <td>{request.employee_username}</td>
                                        <td>{request.leave_type}</td>
                                        <td>{request.start_date} to {request.end_date}</td>
                                        <td>{request.reason}</td>
                                        <td>
                                            <span className={`status-badge status-${request.status.toLowerCase().replace(/\s/g, '-')}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td>{new Date(request.requested_at).toLocaleDateString()}</td>
                                        <td>{request.approved_by_username || 'N/A'}</td>
                                        <td>
                                            {request.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(request.id, 'Approved')} className="action-button approve-action">
                                                        Approve
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(request.id, 'Rejected')} className="action-button reject-action">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {(request.status === 'Approved' || request.status === 'Rejected' || request.status === 'Cancelled') && (
                                                <button
                                                    onClick={() => {
                                                        setPendingDeleteId(request.id);
                                                        setShowConfirm(true);
                                                    }}
                                                    className="action-button delete-action"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
