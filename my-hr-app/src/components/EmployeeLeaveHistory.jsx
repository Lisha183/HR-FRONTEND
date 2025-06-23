import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf';
export default function EmployeeLeaveHistory() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); 
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }
        fetchLeaveRequests();
    }, [isAuthenticated, user, navigate]);

    const fetchLeaveRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/employee/leave-requests/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch leave requests: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            setLeaveRequests(data);
        } catch (err) {
            console.error("Error fetching leave requests:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this leave request?')) {
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/employee/leave-requests/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ status: 'Cancelled' }), 
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to cancel request: ${errorData.detail || response.statusText}`);
            }

            setMessage('Leave request cancelled successfully!');
            fetchLeaveRequests(); 
        } catch (err) {
            console.error("Error cancelling leave request:", err);
            setError(err.message);
        }
    };

    if (loading) return <p className="loading-message">Loading leave history...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'employee')) return null; 

    return (
        <div className="dashboard-container">
            <h1 className="page-title">My Leave History</h1>

            {message && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {leaveRequests.length === 0 ? (
                <p className="no-records-message">No leave requests found.</p>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Leave Type</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Requested At</th>
                                <th>Approved By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map(request => (
                                <tr key={request.id}>
                                    <td data-label="ID">{request.id}</td>
                                    <td data-label="Leave Type">{request.leave_type}</td>
                                    <td data-label="Start Date">{request.start_date}</td>
                                    <td data-label="End Date">{request.end_date}</td>
                                    <td data-label="Reason">{request.reason}</td>
                                    <td data-label="Status">{request.status}</td>
                                    <td data-label="Requested At">{new Date(request.requested_at).toLocaleDateString()}</td>
                                    <td data-label="Approved By">{request.approved_by_username || 'N/A'}</td>
                                    <td data-label="Actions">
                                        {request.status === 'Pending' && (
                                            <button
                                                onClick={() => handleCancelRequest(request.id)}
                                                className="cancel-button"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {request.status === 'Approved' && (
                                            <button
                                                onClick={() => handleCancelRequest(request.id)}
                                                className="cancel-button"
                                            >
                                                Cancel Approved
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
    );
}


