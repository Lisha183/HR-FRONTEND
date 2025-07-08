import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getCookie } from '../utils/crsf';

export default function EmployeeMeetingBooking() {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [hrReviewerOptions, setHrReviewerOptions] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalMessage, setConfirmModalMessage] = useState('');
    const [confirmModalAction, setConfirmModalAction] = useState(null); 
    const [confirmModalSlotId, setConfirmModalSlotId] = useState(null);
    const [confirmModalSlotDetails, setConfirmModalSlotDetails] = useState(null); 
    const [filterHrUsername, setFilterHrUsername] = useState('');
    const [filterSelfAssessmentId, setFilterSelfAssessmentId] = useState('');
    const [tempHrUsername, setTempHrUsername] = useState('');
    const [tempSelfAssessmentId, setTempSelfAssessmentId] = useState('');
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }
        fetchAvailableMeetingSlots(); 
    }, [filterHrUsername, filterSelfAssessmentId, isAuthenticated, user, navigate]); 

    useEffect(() => {
        if (isAuthenticated && user?.role === 'employee') {
            fetchMyBookings();
        }
    }, [isAuthenticated, user]); 

    useEffect(() => {
        const fetchHrReviewers = async () => {
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch('http://hr-backend-xs34.onrender.com/api/hr-users/', { 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(`Failed to fetch HR reviewers: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                setHrReviewerOptions(data);
            } catch (err) {
                console.error("Error fetching HR reviewer options:", err);
            }
        };

        if (isAuthenticated) { 
            fetchHrReviewers();
        }
    }, [isAuthenticated]); 

    const fetchAvailableMeetingSlots = async () => { 
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            let url = 'http://hr-backend-xs34.onrender.com/api/employee/meeting-slots/';
            const queryParams = new URLSearchParams();

            if (filterHrUsername) queryParams.append('hr_username', filterHrUsername);
            if (filterSelfAssessmentId) queryParams.append('self_assessment_id', filterSelfAssessmentId);

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch available meeting slots: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            const trulyAvailable = data.filter(slot => !slot.is_booked);
            setAvailableSlots(trulyAvailable);
        } catch (err) {
            console.error("Error fetching available meeting slots:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        setLoading(true); 
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://hr-backend-xs34.onrender.com/api/employee/my-booked-slots/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch my bookings: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            console.log('Raw data from /api/employee/my-booked-slots/:', data); 
            setBookedSlots(data.filter(slot => slot.is_booked && String(slot.booked_by_employee) === String(user.id)));
            console.log('Filtered booked slots (from new endpoint):', bookedSlots);

        } catch (err) {
            console.error("Error fetching my bookings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const showConfirmation = (action, slotId, slotDetails) => {
        setConfirmModalMessage(`Are you sure you want to ${action} this meeting slot?`);
        setConfirmModalAction(action);
        setConfirmModalSlotId(slotId);
        setConfirmModalSlotDetails(slotDetails);
        setShowConfirmModal(true);
        setMessage(null);
        setError(null);  
    };

    const handleConfirmAction = async (confirmed) => {
        setShowConfirmModal(false); 
        if (confirmed) {
            if (confirmModalAction === 'book') {
                await executeBookSlot(confirmModalSlotId, confirmModalSlotDetails);
            } else if (confirmModalAction === 'unbook') {
                await executeUnbookSlot(confirmModalSlotId, confirmModalSlotDetails);
            }
        }
        setConfirmModalMessage('');
        setConfirmModalAction(null);
        setConfirmModalSlotId(null);
        setConfirmModalSlotDetails(null);
    };

    const executeBookSlot = async (slotId, slotToBook) => {
        try {
            const csrftoken = getCookie('csrftoken');
            const requestBody = {
                is_booked: true,
                booked_by_employee: user.id,
            };

            if (slotToBook.self_assessment !== null) {
                requestBody.self_assessment = slotToBook.self_assessment;
            }

            const response = await fetch(`http://hr-backend-xs34.onrender.com/api/employee/meeting-slots/${slotId}/book/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                if (errorData.type === 'info' && errorData.detail) {
                    setMessage(errorData.detail);
                } else {
                    throw new Error(`Failed to book slot: ${errorData.detail || response.statusText}`);
                }
            } else {
                setMessage('Meeting slot booked successfully!');
            }
setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId)); 
setBookedSlots(prev => [...prev, { ...slotToBook, is_booked: true, booked_by_employee: user.id }]);
        } catch (err) {
            console.error("Error booking slot:", err);
            setError(err.message);
        }
    };
    const executeUnbookSlot = async (slotId , slotToUnbook) => {
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://hr-backend-xs34.onrender.com/api/employee/meeting-slots/${slotId}/unbook/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({}),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to unbook slot: ${errorData.detail || response.statusText}`);
            }

            setMessage('Meeting slot unbooked successfully!');
            setBookedSlots(prev => prev.filter(slot => slot.id !== slotId));
setAvailableSlots(prev => [...prev, { ...slotToUnbook, is_booked: false }]);



        } catch (err) {
            console.error("Error unbooking slot:", err);
            setError(err.message);
        }
    };
    const handleBookSlot = (slotId) => {
        const slotToBook = availableSlots.find(s => s.id === slotId);
        if (!slotToBook) {
            setError("Error: Slot not found in available list.");
            return;
        }
        showConfirmation('book', slotId, slotToBook);
    };
    const handleUnbookSlot = (slotId) => {
        const slotToUnbook = bookedSlots.find(s => s.id === slotId); 
        if (!slotToUnbook) {
            setError("Error: Slot not found in your booked list.");
            return;
        }
        showConfirmation('unbook', slotId, slotToUnbook);
    };

    if (!isAuthenticated || user?.role !== 'employee') return null;
    if (loading) return <p className="loading-message">Loading meeting slots...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;

    return (
        <div className="meeting-booking-page-wrapper">
            <div className="meeting-booking-main-card">
                <h1 className="meeting-booking-page-title">Book a Meeting with HR</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="meeting-booking-filter-section">
                    <h2 className="meeting-booking-filter-title">Filter Available Slots</h2>
                    <div className="meeting-booking-filter-grid">
                        <div className="form-group-meeting-booking">
                            <label htmlFor="tempHrUsername" className="meeting-booking-label">HR Reviewer Username:</label>
                            <select
                                id="tempHrUsername"
                                value={tempHrUsername}
                                onChange={(e) => setTempHrUsername(e.target.value)}
                                className="meeting-booking-input"
                            >
                                <option value=""> Select HR Reviewer </option>
                                {hrReviewerOptions.map(hr => (
                                    <option key={hr.id} value={hr.username}>
                                        {hr.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group-meeting-booking">
                            <label htmlFor="tempSelfAssessmentId" className="meeting-booking-label">Self-Assessment ID:</label>
                            <input
                                type="number"
                                id="tempSelfAssessmentId"
                                value={tempSelfAssessmentId}
                                onChange={(e) => setTempSelfAssessmentId(e.target.value)}
                                className="meeting-booking-input"
                                placeholder="e.g., 123"
                            />
                        </div>
                        <div className="meeting-booking-filter-actions">
                            <button
                                onClick={() => {
                                    setFilterHrUsername(tempHrUsername);
                                    setFilterSelfAssessmentId(tempSelfAssessmentId);
                                }}
                                className="meeting-booking-filter-button"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
                <div className="meeting-booking-list-section">
                    <h2 className="meeting-booking-list-title">Your Booked Meeting Slots ({bookedSlots.length})</h2>
                    {bookedSlots.length === 0 ? (
                        <p className="no-records-message">You currently have no booked meeting slots.</p>
                    ) : (
                        <div className="meeting-booking-table-container">
                            <table className="meeting-booking-data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>HR Reviewer</th>
                                        <th>Date</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Self-Assessment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookedSlots.map(slot => (
                                        <tr key={slot.id}>
                                            <td data-label="ID">{slot.id}</td>
                                            <td data-label="HR Reviewer">{slot.hr_reviewer_username}</td>
                                            <td data-label="Date">{slot.date}</td>
                                            <td data-label="Start Time">{slot.start_time}</td>
                                            <td data-label="End Time">{slot.end_time}</td>
                                            <td data-label="Self-Assessment">{slot.self_assessment_id }
                                            </td>
                                            <td data-label="Actions">
                                                <button onClick={() => handleUnbookSlot(slot.id)} className="meeting-booking-cancel-button">
                                                    Unbook
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="meeting-booking-list-section">
                    <h2 className="meeting-booking-list-title">Available Meeting Slots ({availableSlots.length})</h2>
                    {availableSlots.length === 0 ? (
                        <p className="no-records-message">No available meeting slots found matching your criteria.</p>
                    ) : (
                        <div className="meeting-booking-table-container">
                            <table className="meeting-booking-data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>HR Reviewer</th>
                                        <th>Date</th>
                                        <th>Start Time</th>
                                        <th>End Time</th>
                                        <th>Self-Assessment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableSlots.map(slot => (
                                        <tr key={slot.id}>
                                            <td data-label="ID">{slot.id}</td>
                                            <td data-label="HR Reviewer">{slot.hr_reviewer_username}</td>
                                            <td data-label="Date">{slot.date}</td>
                                            <td data-label="Start Time">{slot.start_time}</td>
                                            <td data-label="End Time">{slot.end_time}</td>
                                            <td data-label="Self-Assessment">
                                                {slot.self_assessment_id ? (
                                                    <span>ID: {slot.self_assessment_id}</span>

                                                ) : 'N/A'}
                                            </td>
                                            <td data-label="Actions">
                                                {!bookedSlots.some(bs => bs.id === slot.id) ? (
                                                    <button
                                                        onClick={() => handleBookSlot(slot.id)}
                                                        className="meeting-booking-book-button"
                                                    >
                                                        Book
                                                    </button>
                                                ) : (
                                                    <span className="meeting-booking-status-text">Already Booked</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                {showConfirmModal && (
                    <div className="meeting-booking-modal-overlay">
                        <div className="meeting-booking-modal-content">
                            <h3 className="meeting-booking-modal-title">Confirm Action</h3>
                            <p className="meeting-booking-modal-message">{confirmModalMessage}</p>
                            {confirmModalSlotDetails && (
                                <div className="meeting-booking-modal-details">
                                    <p><strong>Slot:</strong> {confirmModalSlotDetails.date} from {confirmModalSlotDetails.start_time} to {confirmModalSlotDetails.end_time}</p>
                                    <p><strong>HR:</strong> {confirmModalSlotDetails.hr_reviewer_username}</p>
                                    {confirmModalSlotDetails.self_assessment_id && (
                                        <p><strong>Self-Assessment ID:</strong> {confirmModalSlotDetails.self_assessment_id}</p>
                                    )}
                                </div>
                            )}
                            <div className="meeting-booking-modal-actions">
                                <button
                                    onClick={() => handleConfirmAction(false)}
                                    className="meeting-booking-modal-button meeting-booking-modal-cancel-button"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleConfirmAction(true)}
                                    className="meeting-booking-modal-button meeting-booking-modal-confirm-button"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
