import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); 
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
    const [editingDepartment, setEditingDepartment] = useState(null); 
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchDepartments();
    }, [isAuthenticated, user, navigate]);

    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
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
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch departments: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/admin/departments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ name: newDepartmentName, description: newDepartmentDescription }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to create department: ${errorData.detail || response.statusText}`);
            }

            setMessage('Department created successfully!');
            setNewDepartmentName('');
            setNewDepartmentDescription('');
            fetchDepartments(); 
        } catch (err) {
            console.error("Error creating department:", err);
            setError(err.message);
        }
    };

    const handleUpdateDepartment = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        if (!editingDepartment) return;

        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/admin/departments/${editingDepartment.id}/`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({ name: editingDepartment.name, description: editingDepartment.description }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to update department: ${errorData.detail || response.statusText}`);
            }

            setMessage('Department updated successfully!');
            setEditingDepartment(null); 
            fetchDepartments(); 
        } catch (err) {
            console.error("Error updating department:", err);
            setError(err.message);
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) {
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/admin/departments/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to delete department: ${errorData.detail || response.statusText}`);
            }

            setMessage('Department deleted successfully!');
            fetchDepartments(); 
        } catch (err) {
            console.error("Error deleting department:", err);
            setError(err.message);
        }
    };

    if (loading) return <p className="loading-message">Loading departments...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Manage Departments</h1>

            {message && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="payroll-form-section mb-6">
                <h2 className="text-xl font-semibold mb-4">{editingDepartment ? 'Edit Department' : 'Create New Department'}</h2>
                <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="payroll-form">
                    <div className="form-group">
                        <label htmlFor="deptName">Department Name:</label>
                        <input
                            type="text"
                            id="deptName"
                            value={editingDepartment ? editingDepartment.name : newDepartmentName}
                            onChange={(e) => editingDepartment ? setEditingDepartment({...editingDepartment, name: e.target.value}) : setNewDepartmentName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deptDesc">Description:</label>
                        <textarea
                            id="deptDesc"
                            value={editingDepartment ? editingDepartment.description : newDepartmentDescription}
                            onChange={(e) => editingDepartment ? setEditingDepartment({...editingDepartment, description: e.target.value}) : setNewDepartmentDescription(e.target.value)}
                            rows="3"
                        ></textarea>
                    </div>
                    <button type="submit" className="approve-button">
                        {editingDepartment ? 'Update Department' : 'Create Department'}
                    </button>
                    {editingDepartment && (
                        <button type="button" onClick={() => setEditingDepartment(null)} className="cancel-button mt-2">
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <div className="payroll-list-section">
                <h2 className="text-xl font-semibold mb-4">Existing Departments ({departments.length})</h2>
                {departments.length === 0 ? (
                    <p className="no-records-message">No departments found.</p>
                ) : (
                    <table className="payroll-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map(dept => (
                                <tr key={dept.id}>
                                    <td>{dept.id}</td>
                                    <td>{dept.name}</td>
                                    <td>{dept.description}</td>
                                    <td>
                                        <button
                                            onClick={() => setEditingDepartment({...dept})}
                                            className="approve-button mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDepartment(dept.id)}
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
