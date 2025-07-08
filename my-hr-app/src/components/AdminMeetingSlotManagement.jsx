import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getCookie } from '../utils/crsf';
import { parseErrorResponse } from '../utils/parseErrorResponse';

export default function AdminMeetingSlotManagement() {
    const [meetingSlots, setMeetingSlots] = useState([]);
    const [selfAssessments, setSelfAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const [newSlotFormData, setNewSlotFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        self_assessment: '',
    });
    const [editingSlot, setEditingSlot] = useState(null);

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchMeetingSlots();
    }, [isAuthenticated, user, navigate]);
    useEffect(() => {
        if (meetingSlots.length > 0) {
            fetchSelfAssessmentsForDropdown();
        }
    }, [meetingSlots]);

    const fetchMeetingSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://hr-backend-xs34.onrender.com/api/admin/meeting-slots/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await parseErrorResponse(response);
                throw new Error(errorText);
              }
            
              const data = await response.json();
            
            setMeetingSlots(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSelfAssessmentsForDropdown = async () => {
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://hr-backend-xs34.onrender.com/api/admin/self-assessments/?status=Pending HR Review', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch self-assessments for dropdown.');
            }
            const data = await response.json();
            const unlinkedAssessments = data.filter(assessment =>
                !meetingSlots.some(slot => slot.self_assessment === assessment.id)
            );
            setSelfAssessments(unlinkedAssessments);
        } catch (err) {
            setMessage(`Error loading self-assessments: ${err.message}`);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (editingSlot) {
            setEditingSlot(prev => ({ ...prev, [name]: value }));
        } else {
            setNewSlotFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCreateUpdateSlot = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const method = editingSlot ? 'PUT' : 'POST';
        const url = editingSlot
            ? `http://hr-backend-xs34.onrender.com/api/admin/meeting-slots/${editingSlot.id}/`
            : 'http://hr-backend-xs34.onrender.com/api/admin/meeting-slots/';

        let dataToSend = editingSlot ? { ...editingSlot } : { ...newSlotFormData };

        if (dataToSend.self_assessment === '') {
            dataToSend.self_assessment = null;
        } else if (dataToSend.self_assessment) {
            dataToSend.self_assessment = parseInt(dataToSend.self_assessment, 10);
        }

        const readOnlyFields = [
            'hr_reviewer', 'hr_reviewer_username', 'booked_by_employee_username',
            'self_assessment_id', 'created_at', 'updated_at', 'booked_employee_profile_id'
        ];
        readOnlyFields.forEach(field => delete dataToSend[field]);

        if (editingSlot) {
            delete dataToSend.booked_by_employee;
            delete dataToSend.is_booked;
        }

        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(dataToSend),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await parseErrorResponse(response);
                throw new Error(errorText || 'Error saving slot');
            }

            setMessage(`Meeting slot ${editingSlot ? 'updated' : 'created'} successfully!`);
            handleCancelEdit();
            fetchMeetingSlots();
            fetchSelfAssessmentsForDropdown();
        } catch (err) {
            setError(err.message);
        }
    };

    const confirmActualDelete = async () => {
        if (!confirmDeleteId) return;

        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://hr-backend-xs34.onrender.com//api/admin/meeting-slots/${confirmDeleteId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await parseErrorResponse(response);
throw new Error(errorText || 'Unable to delete slot');

            }

            setMessage('Meeting slot deleted successfully!');
            setConfirmDeleteId(null);
            fetchMeetingSlots();
            fetchSelfAssessmentsForDropdown();
        } catch (err) {
            setError("Unable to delete the meeting slot at this time.");
            setConfirmDeleteId(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingSlot(null);
        setNewSlotFormData({ date: '', start_time: '', end_time: '', self_assessment: '' });
        setMessage(null);
        setError(null);
    };

    if (loading) return <p className="loading-message">Loading meeting slots...</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    const currentFormData = editingSlot || newSlotFormData;

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Manage Meeting Slots</h1>

            {(message || error) && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message || error}
                </div>
            )}

            {confirmDeleteId && (
                <div className="confirmation-modal">
                    <p>Are you sure you want to delete this meeting slot?</p>
                    <div className="modal-actions">
                        <button onClick={confirmActualDelete} className="confirm-button">Yes, Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="cancel-button">Cancel</button>
                    </div>
                </div>
            )}

            <div className="payroll-form-section mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {editingSlot ? `Edit Slot (ID: ${editingSlot.id})` : 'Create New Meeting Slot'}
                </h2>
                <form onSubmit={handleCreateUpdateSlot} className="payroll-form">
                    <div className="form-group">
                        <label>Date:</label>
                        <input type="date" name="date" value={currentFormData.date} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Start Time:</label>
                        <input type="time" name="start_time" value={currentFormData.start_time} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>End Time:</label>
                        <input type="time" name="end_time" value={currentFormData.end_time} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label>Self-Assessment:</label>
                        <select name="self_assessment" value={currentFormData.self_assessment || ''} onChange={handleFormChange}>
                            <option value="">Select Self-Assessment </option>
                            {selfAssessments.map(sa => (
                                <option key={sa.id} value={sa.id}>
                                    {sa.employee_username}'s Q{sa.quarter_number} {sa.year} (ID: {sa.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="approve-button">
                        {editingSlot ? 'Update Slot' : 'Create Slot'}
                    </button>
                    {editingSlot && (
                        <button type="button" onClick={handleCancelEdit} className="cancel-button mt-2">
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <div className="payroll-list-section">
                <h2 className="text-xl font-semibold mb-4">Existing Meeting Slots ({meetingSlots.length})</h2>
                {meetingSlots.length === 0 ? (
                    <p className="no-records-message">No meeting slots found.</p>
                ) : (
                    <table className="payroll-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>HR Reviewer</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Booked?</th>
                                <th>Booked By</th>
                                <th>Self-Assessment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
  {[...meetingSlots]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(slot => (
      <tr key={slot.id}>
        <td>{slot.id}</td>
        <td>{slot.hr_reviewer_username}</td>
        <td>{slot.date}</td>
        <td>{slot.start_time}</td>
        <td>{slot.end_time}</td>
        <td>{slot.is_booked ? 'Yes' : 'No'}</td>
        <td>
          {slot.booked_by_employee_username ? (
            <>
              {slot.booked_by_employee_username}{' '}
            
            </>
          ) : 'N/A'}
        </td>
        <td>
          {slot.self_assessment_id ? (
            <span>ID: {slot.self_assessment_id}</span>

          ) : 'N/A'}
        </td>
        <td>
          <button onClick={() => setEditingSlot({ ...slot })} className="approve-button mr-2">
            Edit
          </button>
          <button onClick={() => setConfirmDeleteId(slot.id)} className="cancel-button">
            Delete
          </button>
        </td>
      </tr>
    ))}
</tbody>

                    </table>
                )}
            </div>
        </div>
    );
}

