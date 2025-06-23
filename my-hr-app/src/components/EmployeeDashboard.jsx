import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClockInOutButton from './ClockInOutButton';
import { getCookie } from '../utils/crsf'; 

function EmployeeDashboard() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [employeeProfile, setEmployeeProfile] = useState(null); 
    const [loadingProfile, setLoadingProfile] = useState(true); 
    const [profileError, setProfileError] = useState(null); 

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);
    useEffect(() => {
        const fetchEmployeeProfile = async () => {
            if (!user || !user.id) { 
                setLoadingProfile(false);
                return;
            }

            setLoadingProfile(true);
            setProfileError(null);
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch(`http://localhost:8000/api/employee-profiles/${user.id}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    if (response.status === 404) {
                        setEmployeeProfile(null); 
                        console.log("No employee profile found for this user (404).");
                    } else {
                        throw new Error(`Failed to fetch profile: ${errorData.detail || response.statusText}`);
                    }
                } else {
                    const data = await response.json();
                    setEmployeeProfile(data);
                }
            } catch (err) {
                console.error("Error fetching employee profile:", err);
                setProfileError(err.message);
            } finally {
                setLoadingProfile(false);
            }
        };

        if (isAuthenticated && user && user.role === 'employee') {
            fetchEmployeeProfile();
        }
    }, [isAuthenticated, user]);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated || (user && user.role !== 'employee')) {
        return null;
    }
    return (
        <div className="dashboard-container">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Employee Dashboard</h1>

            {loadingProfile ? (
                <p>Loading employee profile...</p>
            ) : profileError ? (
                <p className="error-message">Error loading profile: {profileError}</p>
            ) : employeeProfile ? (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Your Profile</h2>
                    <div className="profile-details">
                        <p><strong>Username:</strong> {employeeProfile.user_username || 'N/A'}</p> 
                        <p><strong>Full Name:</strong> {employeeProfile.full_name || 'N/A'}</p>
                        <p><strong>Department:</strong> {employeeProfile.department_name || 'N/A'}</p>
                        <p><strong>Job Title:</strong> {employeeProfile.job_title || 'N/A'}</p>
                        <p><strong>Hire Date:</strong> {employeeProfile.hire_date || 'N/A'}</p>
                        <p><strong>Phone Number:</strong> {employeeProfile.phone_number || 'N/A'}</p>
                        <p><strong>Address:</strong> {employeeProfile.address || 'N/A'}</p>
                        <p><strong>Date of Birth:</strong> {employeeProfile.date_of_birth || 'N/A'}</p>
                        <p><strong>Salary:</strong> {employeeProfile.salary ? `$${parseFloat(employeeProfile.salary).toFixed(2)}` : 'N/A'}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p className="font-bold">No Employee Profile Found</p>
                    <p>Please contact your administrator to set up your employee profile.</p>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Attendance</h2>
                    <p className="text-gray-600 mb-4">Clock in or out to record your work hours.</p>
                    <ClockInOutButton />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Leave Management</h2>
                    <p className="text-gray-600 mb-4">Request new leaves or view your leave history.</p>
                    <button
                        onClick={() => navigate('/request-leave')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                    >
                        Request Leave
                    </button>
                    <button
                        onClick={() => navigate('/my-leave-history')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        My Leave History
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Payslips</h2>
                    <p className="text-gray-600 mb-4">View your historical payslips.</p>
                    <button
                        onClick={() => navigate('/employee/payslips')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        View Payslips
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
