import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminAttendanceReport from './AdminAttendanceReport';

function AdminDashboard() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    React.useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || (user && user.role !== 'admin')) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <AdminAttendanceReport />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Manage Employees</h2>
                    <p className="text-gray-600 mb-4">View, create, and manage employee profiles and their departments.</p>
                    <button
                        onClick={() => navigate('/admin/employee-profiles')} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                    >
                        Manage Profiles
                    </button>
                    <button
                        onClick={() => navigate('/admin/departments')} 
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        Manage Departments
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Leave Approvals</h2>
                    <p className="text-gray-600 mb-4">Review and approve employee leave requests.</p>
                    <button
                        onClick={() => navigate('/admin/leave-management')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Manage Leaves
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Payroll Management</h2>
                    <p className="text-gray-600 mb-4">Generate and manage payrolls.</p>
                    <button
                        onClick={() => navigate('/admin/payroll-management')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Manage Payrolls
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
