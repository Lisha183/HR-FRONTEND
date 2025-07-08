import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCookie } from '../utils/crsf';


export default function AdminEmployeeProfileDetailPage() {
    const { username } = useParams(); 
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        if (!isNaN(username) && !isNaN(parseFloat(username))) {
            setError(`Invalid profile identifier: '${username}'. Expected a username, but received a numeric ID. Please check the link or routing configuration.`);
            setLoading(false);
            return; 
        }

        const fetchEmployeeProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch(`http://hr-backend-xs34.onrender.com/api/admin/employee-profiles/by-username/${username}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(`Failed to fetch employee profile: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                console.error("Error fetching employee profile:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeProfile();
    }, [username, isAuthenticated, user, navigate]); 

    if (loading) return <p className="loading-message">Loading employee profile...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null; 
    if (!profile) return <p className="no-records-message">Employee profile not found.</p>;

    return (
        <div className="profile-detail-page-wrapper">
            <div className="profile-detail-main-card">
                <h1 className="profile-detail-page-title">Employee Profile: {profile.full_name} ({profile.user_username})</h1>

                <div className="profile-details-section">
                    <h2 className="profile-details-title">Details</h2>
                    <div className="profile-details-grid">
                        <p><strong>User ID:</strong> {profile.user}</p> 
                        <p><strong>Username:</strong> {profile.user_username}</p>
                        <p><strong>Email:</strong> {profile.user_email}</p>
                        <p><strong>Full Name:</strong> {profile.full_name}</p>
                        <p><strong>Department:</strong> {profile.department_name || 'N/A'}</p>
                        <p><strong>Position:</strong> {profile.position || 'N/A'}</p> 
                        <p><strong>Phone Number:</strong> {profile.phone_number || 'N/A'}</p>
                        <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> {profile.date_of_birth || 'N/A'}</p>
                        <p><strong>Hire Date:</strong> {profile.hire_date || 'N/A'}</p>
                        <p><strong>Salary:</strong> ${parseFloat(profile.salary || 0).toFixed(2)}</p>
                    </div>
                </div>

                <div className="profile-actions-section">
                    <Link to="/admin/employee-profiles" className="profile-back-button">
                        Back to All Profiles
                    </Link>
                </div>
            </div>
        </div>
    );
}
