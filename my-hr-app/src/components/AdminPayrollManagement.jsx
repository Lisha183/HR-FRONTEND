import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

async function parseErrorResponse(response) {
    let errorMessage = 'Unknown error';
    try {
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
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
      } else if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const titleText = titleMatch[1];
          if (titleText.includes('IntegrityError')) {
            errorMessage = 'A payroll record for this employee and pay period already exists.';
          } else {
            errorMessage = titleText;
          }
        } else {
          errorMessage = 'Server returned an HTML error page.';
        }
      } else {
        errorMessage = await response.text();
      }
    } catch (err) {
      console.error('Error parsing response:', err);
    }
    return errorMessage;
  }
  
  
  
export default function AdminPayrollManagement() {
    const [payrolls, setPayrolls] = useState([]);
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [pendingDeleteUsername, setPendingDeleteUsername] = useState('');

    const [editingPayroll, setEditingPayroll] = useState(null);
    const [payrollFormData, setPayrollFormData] = useState({
        employee: '', 
        pay_period_start: '',
        pay_period_end: '',
        gross_pay: '',
        deductions: '',
        net_pay: '', 
        basic_salary: '',     
        payout_date: ''
    });

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'admin')) {
            navigate('/login');
            return;
        }
        fetchPayrolls();
        fetchUsers(); 
    }, [isAuthenticated, user, navigate]);

    const fetchPayrolls = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://hr-backend-xs34.onrender.com/api/admin/payroll/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to fetch payrolls: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            setPayrolls(data);
        } catch (err) {
            console.error("Error fetching payrolls:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchUsers = async () => {
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://hr-backend-xs34.onrender.com/api/admin/users/', {
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
            setMessage(`Error loading users for dropdown: ${err.message}`);
        }
    };


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setPayrollFormData(prevData => {
            const updatedData = { ...prevData, [name]: value };
            if (name === 'gross_pay' || name === 'deductions') {
                const gross = parseFloat(updatedData.gross_pay) || 0;
                const deduct = parseFloat(updatedData.deductions) || 0;
                updatedData.net_pay = (gross - deduct).toFixed(2);
            }
            return updatedData;
        });
    };

    const handleEditClick = (payroll) => {
        setEditingPayroll(payroll);
        setPayrollFormData({
            employee: payroll.employee, 
            pay_period_start: payroll.pay_period_start,
            pay_period_end: payroll.pay_period_end,
            gross_pay: payroll.gross_pay,
            deductions: payroll.deductions,
            net_pay: payroll.net_pay,
            payout_date: payroll.payout_date,
            basic_salary: payroll.basic_salary,

        });
    };

    const handleCancelEdit = () => {
        setEditingPayroll(null);
        setPayrollFormData({
            employee: '',
            pay_period_start: '',
            pay_period_end: '',
            gross_pay: '',
            deductions: '',
            net_pay: '',
            payout_date: '',
            basic_salary: '', 
        });
        setMessage(null);
        setError(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        const method = editingPayroll ? 'PUT' : 'POST';
        const url = editingPayroll
            ? `http://hr-backend-xs34.onrender.com/api/admin/payroll/${editingPayroll.id}/`
            : 'http://hr-backend-xs34.onrender.com/api/admin/payroll/';

            const dataToSend = {
                employee: parseInt(payrollFormData.employee, 10),
                pay_period_start: payrollFormData.pay_period_start,
                pay_period_end: payrollFormData.pay_period_end,
                basic_salary: parseFloat(payrollFormData.basic_salary || '0'),
                gross_pay: parseFloat(payrollFormData.gross_pay || '0'),
                deductions: parseFloat(payrollFormData.deductions || '0'),
                net_pay: parseFloat(payrollFormData.net_pay || '0'),
                payout_date: payrollFormData.payout_date,
              };
              

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
                const errorMessage = await parseErrorResponse(response);
                throw new Error(`Failed to ${editingPayroll ? 'update' : 'create'} payroll: ${errorMessage}`);
              }
              
            

            setMessage(`Payroll ${editingPayroll ? 'updated' : 'created'} successfully!`);
            handleCancelEdit(); 
            fetchPayrolls(); 
        } catch (err) {
            console.error("Error saving payroll:", err);
            console.log('Submitting payroll data:', dataToSend);

            setError(err.message);
        }
    };
    const confirmDeletePayroll = async (id) => {
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://hr-backend-xs34.onrender.com/api/admin/payroll/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                },
                credentials: 'include',
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to delete payroll: ${errorData.detail || response.statusText}`);
            }
    
            setMessage('Payroll record deleted successfully!');
            fetchPayrolls(); 
            setPendingDeleteId(null);  
        } catch (err) {
            console.error("Error deleting payroll:", err);
            setError(err.message);
        }
    };
    if (loading) return <p className="loading-message">Loading payrolls...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="payroll-page-wrapper">
            <div className="payroll-main-card">
            {pendingDeleteId && (
  <div className="delete-confirm-banner">
    <p>
      Are you sure you want to delete the payroll record for <strong>{pendingDeleteUsername}</strong>? This action cannot be undone.
    </p>
    <div className="delete-banner-buttons">
      <button className="confirm-delete" onClick={() => confirmDeletePayroll(pendingDeleteId)}>Yes, Delete</button>
      <button className="cancel-delete" onClick={() => {
        setPendingDeleteId(null);
        setPendingDeleteUsername('');
      }}>Cancel</button>
    </div>
  </div>
)}

                <h1 className="payroll-page-title">Manage Payrolls</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                    
                )}

                <div className="payroll-form-section">
                    <h2 className="payroll-form-title">{editingPayroll ? 'Edit Payroll Record' : 'Create New Payroll Record'}</h2>
                    <form onSubmit={handleFormSubmit} className="payroll-form">
                        <div className="form-group-payroll">
                            <label htmlFor="employee">Employee:</label>
                            <select
                                id="employee"
                                name="employee"
                                value={payrollFormData.employee}
                                onChange={handleFormChange}
                                required
                                disabled={!!editingPayroll} 
                                className="payroll-input"
                            >
                                <option value="">-- Select Employee --</option>
                                {users.map(u => ( 
                                    <option key={u.id} value={u.id}>{u.username}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="pay_period_start">Pay Period Start:</label>
                            <input
                                type="date"
                                id="pay_period_start"
                                name="pay_period_start"
                                value={payrollFormData.pay_period_start}
                                onChange={handleFormChange}
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="pay_period_end">Pay Period End:</label>
                            <input
                                type="date"
                                id="pay_period_end"
                                name="pay_period_end"
                                value={payrollFormData.pay_period_end}
                                onChange={handleFormChange}
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="basic_salary">Basic Salary:</label>
                            <input
                                type="number"
                                id="basic_salary"
                                name="basic_salary"
                                value={payrollFormData.basic_salary}
                                onChange={handleFormChange}
                                step="0.01"
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="gross_pay">Gross Pay:</label>
                            <input
                                type="number"
                                id="gross_pay"
                                name="gross_pay"
                                value={payrollFormData.gross_pay}
                                onChange={handleFormChange}
                                step="0.01"
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="deductions">Deductions:</label>
                            <input
                                type="number"
                                id="deductions"
                                name="deductions"
                                value={payrollFormData.deductions}
                                onChange={handleFormChange}
                                step="0.01"
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="net_pay">Net Pay (Calculated):</label>
                            <input
                                type="number"
                                id="net_pay"
                                name="net_pay"
                                value={payrollFormData.net_pay}
                                readOnly 
                                step="0.01"
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-group-payroll">
                            <label htmlFor="payout_date">Payout Date:</label>
                            <input
                                type="date"
                                id="payout_date"
                                name="payout_date"
                                value={payrollFormData.payout_date}
                                onChange={handleFormChange}
                                required
                                className="payroll-input"
                            />
                        </div>
                        <div className="form-actions-payroll">
                            <button type="submit" className="payroll-action-button" disabled={loading}>
                                {loading ? 'Saving...' : (editingPayroll ? 'Update Payroll' : 'Create Payroll')}
                            </button>
                            {editingPayroll && (
                                <button type="button" onClick={handleCancelEdit} className="payroll-cancel-button">
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="payroll-list-section">
                    <h2 className="payroll-list-title">Existing Payroll Records ({payrolls.length})</h2>
                    {payrolls.length === 0 ? (
                        <p className="no-records-message">No payroll records found.</p>
                    ) : (
                        <div className="payroll-table-container">
                            <table className="payroll-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Employee</th>
                                        <th>Pay Period</th>
                                        <th>Gross Pay</th>
                                        <th>Deductions</th>
                                        <th>Basic Salary</th>
                                        <th>Net Pay</th>
                                        <th>Payout Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map(payroll => (
                                        <tr key={payroll.id}>
                                            <td>{payroll.id}</td>
                                            <td>{payroll.employee_username}</td>
                                            <td>{payroll.pay_period_start} to {payroll.pay_period_end}</td>
                                            <td>${parseFloat(payroll.gross_pay).toFixed(2)}</td>
                                            <td>${parseFloat(payroll.deductions).toFixed(2)}</td>
                                            <td>${parseFloat(payroll.basic_salary).toFixed(2)}</td>
                                            <td>${parseFloat(payroll.net_pay).toFixed(2)}</td>
                                            <td>{payroll.payout_date}</td>
                                            <td>
                                            <div className="button-group">

                                                <button
                                                    onClick={() => handleEditClick(payroll)}
                                                    className="payroll-edit-button"
                                                >
                                                    Edit
                                                </button>
                                                <button
  onClick={() => {
    setPendingDeleteId(payroll.id);
    setPendingDeleteUsername(payroll.employee_username);
  }}
  className="payroll-delete-button"
>
  Delete
</button>



                                                </div>
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
