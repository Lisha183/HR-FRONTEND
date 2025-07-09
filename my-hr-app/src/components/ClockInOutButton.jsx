import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCookie } from '../utils/crsf';

const ClockInOutButton = () => {
    const { isAuthenticated, user } = useAuth();
    const [status, setStatus] = useState('unknown'); 
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user && user.role === 'employee') {
            fetchCurrentAttendanceStatus();
        } else if (!isAuthenticated || user.role !== 'employee') {
            setStatus('Not Applicable');
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const fetchCurrentAttendanceStatus = async () => {
        setLoading(true);
        setMessage('');
        setIsError(false);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/attendance/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch status: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            if (data && data.length > 0) {
                setStatus(data[0].record_type);
            } else {
                setStatus('clock_out');
            }
        } catch (err) {
            console.error("Error fetching attendance status:", err);
            setMessage(`Error fetching status: ${err.message}`);
            setIsError(true);
            setStatus('unknown');
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = async (actionType) => {
        setMessage('');
        setIsError(false);
        setLoading(true);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/attendance/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ record_type: actionType }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                if (errorData && errorData.detail) {
                    throw new Error(errorData.detail);
                }
                throw new Error(`Failed to ${actionType}: ${response.statusText}`);
            }

            setMessage(`Successfully ${actionType.replace('_', ' ')}!`);
            setIsError(false);
            setStatus(actionType);

        } catch (err) {
            console.error(`Error during ${actionType}:`, err);
            setMessage(`Failed to ${actionType.replace('_', ' ')}: ${err.message}`);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="clock-button-loading-message">Loading attendance status...</p>;
    }

    if (status === 'Not Applicable') {
        return null;
    }

    return (
        <div className="clock-button-container">
            <h2 className="clock-button-title">Attendance Tracker</h2>
            {message && (
                <p className={`clock-button-message ${isError ? 'clock-button-error' : 'clock-button-success'}`}>
                    {message}
                </p>
            )}

            <p className="clock-button-status-display">
                Current Status:
                <span className={`clock-button-status-pill ${
                    status === 'clock_in' ? 'status-in' :
                    status === 'clock_out' ? 'status-out' : 'status-unknown'
                }`}>
                    {status === 'clock_in' ? 'Clocked In' :
                     status === 'clock_out' ? 'Clocked Out' : 'Unknown'}
                </span>
            </p>

            <div className="clock-button-actions">
                {status === 'clock_out' ? (
                    <button
                        onClick={() => handleClockAction('clock_in')}
                        className="clock-button clock-in"
                        disabled={loading}
                    >
                        Clock In
                    </button>
                ) : (
                    <button
                        onClick={() => handleClockAction('clock_out')}
                        className="clock-button clock-out"
                        disabled={loading}
                    >
                        Clock Out
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClockInOutButton;