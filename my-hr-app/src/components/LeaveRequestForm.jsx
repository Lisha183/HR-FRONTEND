import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCookie } from '../utils/crsf'; 

const LeaveRequestForm = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        leave_type: 'Annual Leave',
        start_date: '',
        end_date: '',
        reason: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false); 

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }
        fetch("http://localhost:8000/api/csrf/", {
            credentials: "include",
        });
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true); 

        if (!formData.start_date || !formData.end_date || !formData.reason) {
            setMessage('Please fill in all required fields.');
            setIsError(true);
            setLoading(false);
            return;
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setMessage('Start date cannot be after end date.');
            setIsError(true);
            setLoading(false);
            return;
        }

        if (!user || !user.id) {
            setMessage('Error: User information not available. Please log in again.');
            setIsError(true);
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData, 
            employee: user.id, 
        };

        const csrftoken = getCookie('csrftoken');

        try {
            const response = await fetch('http://localhost:8000/api/employee/leave-requests/', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(dataToSend), 
                credentials: 'include',
            });

            if (response.ok) {
                setMessage('Leave request submitted successfully!');
                setIsError(false);
                setFormData({
                    leave_type: 'Annual Leave',
                    start_date: '',
                    end_date: '',
                    reason: '',
                });

            } else {
                const errorData = await response.json();
                setMessage(`Failed to submit leave request: ${JSON.stringify(errorData)}`);
                setIsError(true);
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            setMessage('Network error or unable to connect to server.');
            setIsError(true);
        } finally {
            setLoading(false); 
        }
    };

    if (!isAuthenticated || (user && user.role !== 'employee')) {
        return <p className="loading-message">Redirecting to login or unauthorized...</p>;
    }

    return (
        <div className="leave-request-page-wrapper">
            <div className="leave-request-main-card">
                <h1 className="leave-request-page-title">Request Leave</h1>
                
                {message && (
                    <div className={`message-container ${isError ? "error" : "success"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="leave-request-form">
                    <div className="form-group-leave-request">
                        <label htmlFor="leave_type" className="leave-request-label">Leave Type:</label>
                        <select
                            name="leave_type"
                            id="leave_type"
                            value={formData.leave_type}
                            onChange={handleChange}
                            className="leave-request-input"
                        >
                            <option value="Annual Leave">Annual Leave</option>
                            <option value="Sick Leave">Sick Leave</option>
                            <option value="Maternity Leave">Maternity Leave</option>
                            <option value="Paternity Leave">Paternity Leave</option>
                            <option value="Unpaid Leave">Unpaid Leave</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group-leave-request">
                        <label htmlFor="start_date" className="leave-request-label">Start Date:</label>
                        <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            required
                            className="leave-request-input"
                        />
                    </div>

                    <div className="form-group-leave-request">
                        <label htmlFor="end_date" className="leave-request-label">End Date:</label>
                        <input
                            type="date"
                            name="end_date"
                            id="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            required
                            className="leave-request-input"
                        />
                    </div>

                    <div className="form-group-leave-request">
                        <label htmlFor="reason" className="leave-request-label">Reason:</label>
                        <textarea
                            name="reason"
                            id="reason"
                            placeholder="Reason for leave..."
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="leave-request-textarea"
                        ></textarea>
                    </div>

                    <button type="submit" className="leave-request-submit-button" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestForm;
