import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf';

export default function AdminEmployeeProfilesPage() {
    const [employeeProfiles, setEmployeeProfiles] = useState([]);
    const [departments, setDepartments] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [editingProfile, setEditingProfile] = useState(null); 
    const [profileFormData, setProfileFormData] = useState({
        user: '', 
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
    }, [isAuthenticated, user, navigate]);

    const fetchEmployeeProfiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/employee-profiles/', {
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
            const response = await fetch('http://localhost:8000/api/admin/departments/', {
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

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleEditClick = (profile) => {
        setEditingProfile(profile);
        setProfileFormData({
            user: profile.user.id, 
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
            user: '', full_name: '', phone_number: '', address: '', date_of_birth: '',
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
            ? `http://localhost:8000/api/employee-profiles/${editingProfile.id}/`
            : 'http://localhost:8000/api/employee-profiles/';

        const dataToSend = { ...profileFormData };
        if (dataToSend.department === '') {
            dataToSend.department = null;
        }
        if (editingProfile) {
            delete dataToSend.user;
        } else {
            dataToSend.user = parseInt(dataToSend.user, 10);
            if (isNaN(dataToSend.user)) {
                setError("User ID must be a valid number for new profiles.");
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
        if (!window.confirm('Are you sure you want to delete this employee profile? This action cannot be undone.')) {
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/employee-profiles/${id}/`, {
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
            fetchEmployeeProfiles(); 
        } catch (err) {
            console.error("Error deleting profile:", err);
            setError(err.message);
        }
    };

    if (loading) return <p className="loading-message">Loading employee profiles...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Manage Employee Profiles</h1>

            {message && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="payroll-form-section mb-6">
                <h2 className="text-xl font-semibold mb-4">
                    {editingProfile ? `Edit Profile for ${editingProfile.user_username}` : 'Create New Employee Profile'}
                </h2>
                <form onSubmit={handleFormSubmit} className="payroll-form">
                    {!editingProfile && ( 
                        <div className="form-group">
                            <label htmlFor="userId">User ID (for existing user):</label>
                            <input
                                type="text"
                                id="userId"
                                name="user"
                                value={profileFormData.user}
                                onChange={handleFormChange}
                                required
                                placeholder="e.g., 123 (ID of an existing CustomUser)"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name:</label>
                        <input
                            type="text"
                            id="fullName"
                            name="full_name"
                            value={profileFormData.full_name}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number:</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phone_number"
                            value={profileFormData.phone_number}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address:</label>
                        <textarea
                            id="address"
                            name="address"
                            value={profileFormData.address}
                            onChange={handleFormChange}
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dob">Date of Birth:</label>
                        <input
                            type="date"
                            id="dob"
                            name="date_of_birth"
                            value={profileFormData.date_of_birth}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="hireDate">Hire Date:</label>
                        <input
                            type="date"
                            id="hireDate"
                            name="hire_date"
                            value={profileFormData.hire_date}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="jobTitle">Job Title:</label>
                        <input
                            type="text"
                            id="jobTitle"
                            name="job_title"
                            value={profileFormData.job_title}
                            onChange={handleFormChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="salary">Salary:</label>
                        <input
                            type="number"
                            id="salary"
                            name="salary"
                            value={profileFormData.salary}
                            onChange={handleFormChange}
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Department:</label>
                        <select
                            id="department"
                            name="department"
                            value={profileFormData.department}
                            onChange={handleFormChange}
                        >
                            <option value="">-- Select Department --</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="approve-button">
                        {editingProfile ? 'Update Profile' : 'Create Profile'}
                    </button>
                    {editingProfile && (
                        <button type="button" onClick={handleCancelEdit} className="cancel-button mt-2">
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <div className="payroll-list-section">
                <h2 className="text-xl font-semibold mb-4">Existing Employee Profiles ({employeeProfiles.length})</h2>
                {employeeProfiles.length === 0 ? (
                    <p className="no-records-message">No employee profiles found.</p>
                ) : (
                    <table className="payroll-table">
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
                                            className="approve-button mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProfile(profile.id)}
                                            className="cancel-button"
                                        >
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
