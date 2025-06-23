import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

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

        if (!formData.start_date || !formData.end_date || !formData.reason) {
            setMessage('Please fill in all required fields.');
            setIsError(true);
            return;
        }
        if (new Date(formData.start_date) > new Date(formData.end_date)) {
            setMessage('Start date cannot be after end date.');
            setIsError(true);
            return;
        }

        if (!user || !user.id) {
            setMessage('Error: User information not available. Please log in again.');
            setIsError(true);
            return;
        }

        const dataToSend = {
            ...formData, 
            employee: user.id, 
        };

        const csrftoken = getCookie('csrftoken');

        try {
            const response = await fetch('http://localhost:8000/leave-requests/', { 
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
        }
    };



    if (!isAuthenticated || (user && user.role !== 'employee')) {
        return <p className="loading-message">Redirecting to login or unauthorized...</p>;
    }


    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Request Leave</h2>
                {message && (
                    <p className={isError ? "error-message" : "success-message"}>
                        {message}
                    </p>
                )}

                <label htmlFor="leave_type" style={{textAlign: 'left', display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: '#555'}}>Leave Type:</label>
                <select
                    name="leave_type"
                    id="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    style={{
                        width: 'calc(100% - 24px)',
                        padding: '14px 12px',
                        marginBottom: '25px',
                        border: '1px solid #dcdcdc',
                        borderRadius: '6px',
                        fontSize: '17px',
                        boxSizing: 'border-box',
                    }}
                >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                    <option value="Other">Other</option>
                </select>

                <label htmlFor="start_date" style={{textAlign: 'left', display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: '#555'}}>Start Date:</label>
                <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="end_date" style={{textAlign: 'left', display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: '#555'}}>End Date:</label>
                <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                />

                <label htmlFor="reason" style={{textAlign: 'left', display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em', color: '#555'}}>Reason:</label>
                <textarea
                    name="reason"
                    id="reason"
                    placeholder="Reason for leave..."
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows="4"
                    style={{
                        width: 'calc(100% - 24px)',
                        padding: '14px 12px',
                        marginBottom: '25px',
                        border: '1px solid #dcdcdc',
                        borderRadius: '6px',
                        fontSize: '17px',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                    }}
                ></textarea>

                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
};

export default LeaveRequestForm;