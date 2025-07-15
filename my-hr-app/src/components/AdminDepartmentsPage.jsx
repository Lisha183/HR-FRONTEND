import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

async function parseErrorResponse(response) {
    let errorMessage = 'Unknown error';
    try {
      const errorData = await response.json();
      if (typeof errorData === 'object') {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else {
          errorMessage = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
        }
      } else {
        errorMessage = String(errorData);
      }
    } catch (err) {
      console.error('Error parsing JSON from error response:', err);
    }
    return errorMessage;
  }
  

  
export default function AdminDepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); 
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
    const [editingDepartment, setEditingDepartment] = useState(null); 
    const { isAuthenticated, user, csrfToken  } = useAuth();
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    

    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        if (csrfToken) {
            fetchDepartments();
          }
        
       
    }, [isAuthenticated, user,csrfToken, navigate]);

    const fetchDepartments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/departments/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMessage = await parseErrorResponse(response);
                console.error("Detailed error from backend:", errorMessage);
                throw new Error(`Failed to fetch departments: ${errorMessage}`);
              }
              

            const data = await response.json();
            setDepartments(data);
        } catch (err) {
            console.error(`Error creating departments: ${err.message}`, err);

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
            const response = await fetch('https://hr-backend-xs34.onrender.com/api/admin/departments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ name: newDepartmentName, description: newDepartmentDescription }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMessage = await parseErrorResponse(response);
                throw new Error(`Failed to create department: ${errorMessage}`);
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
            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/departments/${editingDepartment.id}/`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ name: editingDepartment.name, description: editingDepartment.description }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMessage = await parseErrorResponse(response);
                throw new Error(`Failed to update department: ${errorMessage}`);
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
        if (pendingDeleteId !== id) {
            setPendingDeleteId(id);
            setMessage('Click delete again to confirm department removal.');
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/departments/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorMessage = await parseErrorResponse(response);
                throw new Error(`Failed to delete department: ${errorMessage}`);
              }
              
              

            setMessage('Department deleted successfully!');
            setPendingDeleteId(null);
            fetchDepartments(); 
        } catch (err) {
            console.error("Error deleting department:", err);
            setError(err.message);
            setPendingDeleteId(null);

        }
    };

    if (loading) return <p className="loading-message">Loading departments...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="department-page-wrapper">
            <div className="department-main-card">
                <h1 className="department-page-title">Manage Departments</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <div className="department-form-section">
                    <h2 className="department-form-title">{editingDepartment ? 'Edit Department' : 'Create New Department'}</h2>
                    <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="department-form">
                        <div className="form-group-department">
                            <label htmlFor="deptName">Department Name:</label>
                            <input
                                type="text"
                                id="deptName"
                                value={editingDepartment ? editingDepartment.name : newDepartmentName}
                                onChange={(e) => editingDepartment ? setEditingDepartment({...editingDepartment, name: e.target.value}) : setNewDepartmentName(e.target.value)}
                                required
                                className="department-input"
                            />
                        </div>
                        <div className="form-group-department">
                            <label htmlFor="deptDesc">Description:</label>
                            <textarea
                                id="deptDesc"
                                value={editingDepartment ? editingDepartment.description : newDepartmentDescription}
                                onChange={(e) => editingDepartment ? setEditingDepartment({...editingDepartment, description: e.target.value}) : setNewDepartmentDescription(e.target.value)}
                                rows="3"
                                className="department-textarea"
                            ></textarea>
                        </div>
                        <div className="form-actions-department">
                            <button type="submit" className="department-action-button" disabled={loading}>
                                {loading ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Create Department')}
                            </button>
                            {editingDepartment && (
                                <button type="button" onClick={() => setEditingDepartment(null)} className="department-cancel-button">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="department-list-section">
                    <h2 className="department-list-title">Existing Departments ({departments.length})</h2>
                    {departments.length === 0 ? (
                        <p className="no-records-message">No departments found.</p>
                    ) : (
                        <div className="department-table-container">
                            <table className="department-data-table">
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
                                                    className="department-edit-button"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDepartment(dept.id)}
                                                    className="department-delete-button"
                                                >
                                                    {pendingDeleteId === dept.id ? 'Confirm Delete' : 'Delete'}

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
