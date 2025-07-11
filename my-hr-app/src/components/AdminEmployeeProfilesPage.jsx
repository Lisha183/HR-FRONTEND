import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

export default function AdminEmployeeProfilesPage() {
    const [employeeProfiles, setEmployeeProfiles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const validIds = employeeProfiles.map(profile => profile.id);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [editingProfile, setEditingProfile] = useState(null);
    const [profileFormData, setProfileFormData] = useState({
        username: '',
        full_name: '',
        phone_number: '',
        address: '',
        date_of_birth: '',
        hire_date: '',
        job_title: '',
        salary: '',
        department: '',
    });

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchEmployeeProfiles();
        fetchDepartmentsForDropdown();
        fetchUsersForDropdown();
    }, [isAuthenticated, user, navigate]);

    const fetchEmployeeProfiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/employee-profiles/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch employee profiles: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched employee profiles after create:", data);

            setEmployeeProfiles(data);
        } catch (err) {
            console.error("Error fetching employee profiles:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentsForDropdown = async () => {
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/departments/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch departments for dropdown.');
            }
            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments for dropdown:", err);
            setMessage(`Error loading departments: ${err.message}`);
        }
    };

    const fetchUsersForDropdown = async () => {
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/users/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users for dropdown.');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users for dropdown:", err);
            setMessage(`Error loading users: ${err.message}`);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleEditClick = (profile) => {
        setEditingProfile(profile);
        setProfileFormData({
            username: profile.user_username,
            full_name: profile.full_name,
            phone_number: profile.phone_number || '',
            address: profile.address || '',
            date_of_birth: profile.date_of_birth || '',
            hire_date: profile.hire_date || '',
            job_title: profile.job_title || '',
            salary: profile.salary || '',
            department: profile.department || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingProfile(null);
        setProfileFormData({
            username: '', full_name: '', phone_number: '', address: '', date_of_birth: '',
            hire_date: '', job_title: '', salary: '', department: ''
        });
        setMessage(null);
        setError(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const method = editingProfile ? 'PUT' : 'POST';
        const url = editingProfile
            ? `https://hr-backend-xs34.onrender.com/api/employee-profiles/${editingProfile.id}/`
            : 'https://hr-backend-xs34.onrender.com/api/employee-profiles/';

        const dataToSend = { ...profileFormData };
        if (dataToSend.department === '') {
            dataToSend.department = null;
        }
        if (editingProfile) {
            delete dataToSend.username;
        } else {
            if(!dataToSend.username){
                setError("User must be selected.")
                return;
            }
            
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
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to ${editingProfile ? 'update' : 'create'} profile: ${JSON.stringify(errorData.detail || errorData)}`);
            }

            setMessage(`Profile ${editingProfile ? 'updated' : 'created'} successfully!`);
            handleCancelEdit();
            fetchEmployeeProfiles();
        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err.message);
        }
    };

    const handleDeleteProfile = async (id) => {
        const validIds = employeeProfiles.map(profile => profile.id);
        
        if (!validIds.includes(id)) {
            setError("Profile ID not found.");
            return;
          }
        if (pendingDeleteId !== id) {
            setPendingDeleteId(id);
        setMessage('Clicking delete will permanently remove this profile.');
        return;
    }

        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/employee-profiles/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to delete profile: ${errorData.detail || response.statusText}`);
            }

            setMessage('Employee profile deleted successfully!');
            setPendingDeleteId(null);
            fetchEmployeeProfiles();
        } catch (err) {
            console.error("Error deleting profile:", err);
            setError(err.message);
            setPendingDeleteId(null);

        }
    };

    if (loading) return <p className="loading-message">Loading employee profiles...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="employee-profile-page-wrapper">
            <div className="employee-profile-main-card">
                <h1 className="employee-profile-page-title">Manage Employee Profiles</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="employee-profile-form-section">
                    <h2 className="employee-profile-form-title">
                        {editingProfile ? `Edit Profile for ${editingProfile.user_username}` : 'Create New Employee Profile'}
                    </h2>
                    <form onSubmit={handleFormSubmit} className="employee-profile-form">
                        {!editingProfile && (
                            <div className="form-group-employee-profile">
                                <label htmlFor="user">Select User:</label>
                                <select
                                    id="username"
                                    name="username"
                                    value={profileFormData.username}
                                    onChange={handleFormChange}
                                    required
                                    className="employee-profile-input"
                                >
                                    <option value="">-- Select a User --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.username}>{u.username}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="form-group-employee-profile">
                            <label htmlFor="fullName">Full Name:</label>
                            <input
                                type="text"
                                id="fullName"
                                name="full_name"
                                value={profileFormData.full_name}
                                onChange={handleFormChange}
                                required
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="phoneNumber">Phone Number:</label>
                            <input
                                type="text"
                                id="phoneNumber"
                                name="phone_number"
                                value={profileFormData.phone_number}
                                onChange={handleFormChange}
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="address">Address:</label>
                            <textarea
                                id="address"
                                name="address"
                                value={profileFormData.address}
                                onChange={handleFormChange}
                                rows="2"
                                className="employee-profile-textarea"
                            ></textarea>
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="dob">Date of Birth:</label>
                            <input
                                type="date"
                                id="dob"
                                name="date_of_birth"
                                value={profileFormData.date_of_birth}
                                onChange={handleFormChange}
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="hireDate">Hire Date:</label>
                            <input
                                type="date"
                                id="hireDate"
                                name="hire_date"
                                value={profileFormData.hire_date}
                                onChange={handleFormChange}
                                required
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="jobTitle">Job Title:</label>
                            <input
                                type="text"
                                id="jobTitle"
                                name="job_title"
                                value={profileFormData.job_title}
                                onChange={handleFormChange}
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="salary">Salary:</label>
                            <input
                                type="number"
                                id="salary"
                                name="salary"
                                value={profileFormData.salary}
                                onChange={handleFormChange}
                                step="0.01"
                                className="employee-profile-input"
                            />
                        </div>
                        <div className="form-group-employee-profile">
                            <label htmlFor="department">Department:</label>
                            <select
                                id="department"
                                name="department"
                                value={profileFormData.department}
                                onChange={handleFormChange}
                                className="employee-profile-input"
                            >
                                <option value="">-- Select Department --</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-actions-employee-profile">
                            <button type="submit" className="employee-profile-action-button" disabled={loading}>
                                {loading ? 'Saving...' : (editingProfile ? 'Update Profile' : 'Create Profile')}
                            </button>
                            {editingProfile && (
                                <button type="button" onClick={handleCancelEdit} className="employee-profile-cancel-button">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="employee-profile-list-section">
                    <h2 className="employee-profile-list-title">Existing Employee Profiles ({employeeProfiles.length})</h2>
                    {employeeProfiles.length === 0 ? (
                        <p className="no-records-message">No employee profiles found.</p>
                    ) : (
                        <div className="employee-profile-table-container">
                            <table className="employee-profile-data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Full Name</th>
                                        <th>Department</th>
                                        <th>Job Title</th>
                                        <th>Hire Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeProfiles.map(profile => (
                                        <tr key={profile.id}>
                                            <td>{profile.id}</td>
                                            <td>{profile.user_username}</td>
                                            <td>{profile.full_name}</td>
                                            <td>{profile.department_name || 'N/A'}</td>
                                            <td>{profile.job_title}</td>
                                            <td>{profile.hire_date}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleEditClick(profile)}
                                                    className="employee-profile-edit-button"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProfile(profile.id)}
                                                    className="employee-profile-delete-button"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
