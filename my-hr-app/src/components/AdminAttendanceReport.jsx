import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

const AdminAttendanceReport = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterEmployeeUsername, setFilterEmployeeUsername] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchAttendanceRecords();
    }, [isAuthenticated, user, navigate, filterEmployeeUsername, filterStartDate, filterEndDate]); 

    const fetchAttendanceRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            let url = 'http://localhost:8000/api/admin/attendance/';
            const queryParams = new URLSearchParams();

            if (filterEmployeeUsername) {
                queryParams.append('employee_username', filterEmployeeUsername);
            }
            if (filterStartDate) {
                queryParams.append('start_date', filterStartDate);
            }
            if (filterEndDate) {
                queryParams.append('end_date', filterEndDate);
            }

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
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(`Failed to fetch attendance records: ${errorData.detail || response.status}`);
            }

            const data = await response.json();
            setAttendanceRecords(data);
        } catch (err) {
            console.error("Error fetching attendance records:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'employeeUsername') setFilterEmployeeUsername(value);
        if (name === 'startDate') setFilterStartDate(value);
        if (name === 'endDate') setFilterEndDate(value);
    };

    if (loading) return <p className="text-center text-gray-600">Loading attendance report...</p>;
    if (error) return <p className="error-message text-red-600">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="dashboard-container">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Report</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex flex-col">
                    <label htmlFor="employeeUsername" className="text-sm font-medium text-gray-700 mb-1">Employee Username:</label>
                    <input
                        type="text"
                        id="employeeUsername"
                        name="employeeUsername"
                        value={filterEmployeeUsername}
                        onChange={handleFilterChange}
                        placeholder="Filter by username"
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={filterStartDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={filterEndDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
               
            </div>

            {attendanceRecords.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Employee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceRecords.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.employee_username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(record.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            record.record_type === 'clock_in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {record.record_type.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-600">No attendance records found for the selected filters.</p>
            )}
        </div>
    );
};

export default AdminAttendanceReport;
