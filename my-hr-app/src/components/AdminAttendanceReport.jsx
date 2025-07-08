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
    }, [isAuthenticated, user, navigate]); 

    const handleSearchClick = () => {
        fetchAttendanceRecords();
      };
      

    const fetchAttendanceRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            let url = 'http://hr-backend-xs34.onrender.com/api/admin/attendance/';
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

    if (loading) return <p className="loading-message">Loading attendance report...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="attendance-page-wrapper">
            <div className="attendance-main-card">
                <h1 className="attendance-page-title">Attendance Report</h1>

                <div className="attendance-filter-form-section">
                    <div className="form-group-attendance">
                        <label htmlFor="employeeUsername">Employee Username:</label>
                        <input
                            type="text"
                            id="employeeUsername"
                            name="employeeUsername"
                            value={filterEmployeeUsername}
                            onChange={handleFilterChange}
                            placeholder="Filter by username"
                            className="attendance-input"
                        />
                    </div>
                    <div className="form-group-attendance">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filterStartDate}
                            onChange={handleFilterChange}
                            className="attendance-input"
                        />
                    </div>
                    <div className="form-group-attendance">
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filterEndDate}
                            onChange={handleFilterChange}
                            className="attendance-input"
                        />
                    </div>
                    <button type="button" className="attendance-search-button" onClick={handleSearchClick} disabled={loading}>
  Search
</button>

                </div>

                {attendanceRecords.length > 0 ? (
                    <div className="attendance-table-container" >
                        <table className="attendance-table" >
                            <thead>
                                <tr >
                                    <th>ID</th>
                                    <th>Employee</th>
                                    <th>Timestamp</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td>{record.id}</td>
                                        <td>{record.employee_username}</td>
                                        <td>
                                            {new Date(record.timestamp).toLocaleString()}
                                        </td>
                                        <td>
                                            <span className={`attendance-status-badge ${record.record_type.replace('_', '-')}`}>
                                                {record.record_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-records-message">No attendance records found for the selected filters.</p>
                )}
            </div>
        </div>
    );
};

export default AdminAttendanceReport;
