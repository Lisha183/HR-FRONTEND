import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf';

export default function AdminPayrollManagement() {
    const [payrolls, setPayrolls] = useState([]);
    const [users, setUsers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [editingPayroll, setEditingPayroll] = useState(null);
    const [payrollFormData, setPayrollFormData] = useState({
        employee: '', 
        pay_period_start: '',
        pay_period_end: '',
        gross_pay: '',
        deductions: '',
        net_pay: '', 
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
            const response = await fetch('http://localhost:8000/api/admin/payroll/', {
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
            const response = await fetch('http://localhost:8000/api/admin/users/', {
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
            payout_date: payroll.payout_date
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
            payout_date: ''
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
            ? `http://localhost:8000/api/admin/payroll/${editingPayroll.id}/`
            : 'http://localhost:8000/api/admin/payroll/';

        const dataToSend = { ...payrollFormData };
        dataToSend.gross_pay = parseFloat(dataToSend.gross_pay);
        dataToSend.deductions = parseFloat(dataToSend.deductions);
        dataToSend.net_pay = parseFloat(dataToSend.net_pay);
        dataToSend.employee = parseInt(dataToSend.employee, 10);

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
                throw new Error(`Failed to ${editingPayroll ? 'update' : 'create'} payroll: ${JSON.stringify(errorData.detail || errorData)}`);
            }

            setMessage(`Payroll ${editingPayroll ? 'updated' : 'created'} successfully!`);
            handleCancelEdit(); 
            fetchPayrolls(); 
        } catch (err) {
            console.error("Error saving payroll:", err);
            setError(err.message);
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this payroll record? This action cannot be undone.')) {
            return;
        }
        setMessage(null);
        setError(null);
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/admin/payroll/${id}/`, {
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
        } catch (err) {
            console.error("Error deleting payroll:", err);
            setError(err.message);
        }
    };

    if (loading) return <p className="loading-message">Loading payrolls...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!isAuthenticated || (user && user.role !== 'admin')) return null;

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Manage Payrolls</h1>

            {message && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="payroll-form-section">
                <h2 className="text-xl font-semibold mb-4">{editingPayroll ? 'Edit Payroll Record' : 'Create New Payroll Record'}</h2>
                <form onSubmit={handleFormSubmit} className="payroll-form">
                    <div className="form-group">
                        <label htmlFor="employee">Employee:</label>
                        <select
                            id="employee"
                            name="employee"
                            value={payrollFormData.employee}
                            onChange={handleFormChange}
                            required
                            disabled={!!editingPayroll} 
                        >
                            <option value="">-- Select Employee --</option>
                            {users.map(u => ( 
                                <option key={u.id} value={u.id}>{u.username}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pay_period_start">Pay Period Start:</label>
                        <input
                            type="date"
                            id="pay_period_start"
                            name="pay_period_start"
                            value={payrollFormData.pay_period_start}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pay_period_end">Pay Period End:</label>
                        <input
                            type="date"
                            id="pay_period_end"
                            name="pay_period_end"
                            value={payrollFormData.pay_period_end}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gross_pay">Gross Pay:</label>
                        <input
                            type="number"
                            id="gross_pay"
                            name="gross_pay"
                            value={payrollFormData.gross_pay}
                            onChange={handleFormChange}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="deductions">Deductions:</label>
                        <input
                            type="number"
                            id="deductions"
                            name="deductions"
                            value={payrollFormData.deductions}
                            onChange={handleFormChange}
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="net_pay">Net Pay (Calculated):</label>
                        <input
                            type="number"
                            id="net_pay"
                            name="net_pay"
                            value={payrollFormData.net_pay}
                            readOnly 
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="payout_date">Payout Date:</label>
                        <input
                            type="date"
                            id="payout_date"
                            name="payout_date"
                            value={payrollFormData.payout_date}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <button type="submit" className="approve-button">
                        {editingPayroll ? 'Update Payroll' : 'Create Payroll'}
                    </button>
                    {editingPayroll && (
                        <button type="button" onClick={handleCancelEdit} className="cancel-button mt-2">
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>

            <div className="payroll-list-section">
                <h2 className="text-xl font-semibold mb-4">Existing Payroll Records ({payrolls.length})</h2>
                {payrolls.length === 0 ? (
                    <p className="no-records-message">No payroll records found.</p>
                ) : (
                    <table className="payroll-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Employee</th>
                                <th>Pay Period</th>
                                <th>Gross Pay</th>
                                <th>Deductions</th>
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
                                    <td>${parseFloat(payroll.net_pay).toFixed(2)}</td>
                                    <td>{payroll.payout_date}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEditClick(payroll)}
                                            className="approve-button mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePayroll(payroll.id)}
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
