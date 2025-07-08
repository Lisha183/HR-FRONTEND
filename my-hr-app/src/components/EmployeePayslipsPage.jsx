import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCookie } from '../utils/crsf';

export default function EmployeePayslipsPage({ onViewDetails }) {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();
    useEffect(() => {
        

        async function fetchPayslips() {
            setLoading(true);
            setError(null);
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch('http://hr-backend-xs34.onrender.com/api/employee/payslips/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(errorData.detail || `Failed to fetch payslips: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setPayslips(data);
            } catch (err) {
                console.error("Error fetching payslips:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

            fetchPayslips();
        }, []);


    if (loading) {
        return <p className="loading-message">Loading payslips...</p>;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

    return (
         <div className="payslips-page-wrapper">
            <div className="payslips-main-card">
                <h1 className="payslips-page-title">My Payslips</h1>
                {payslips.length === 0 ? (
                    <div className="no-records-message">
                        <p>No payslips found for your account.</p>
                    </div>
                ) : (
                    <div className="payslip-list-grid"> 
                        {payslips.map(payslip => (
                            <div key={payslip.id} className="payslip-item-card">
                                <h2 className="payslip-item-title">Pay Period: {payslip.pay_period_start} to {payslip.pay_period_end}</h2>
                                <p className="payslip-item-detail">Gross Pay: <span className="payslip-value">${parseFloat(payslip.gross_pay).toFixed(2)}</span></p>
                                <p className="payslip-item-detail">Net Pay: <span className="payslip-value">${parseFloat(payslip.net_pay).toFixed(2)}</span></p>
                                <p className="payslip-item-detail">Payout Date: <span className="payslip-value">{payslip.payout_date}</span></p>
                                <button
                                    onClick={() => onViewDetails(payslip.id)}
                                    className="payslip-view-details-button"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         </div>
    );
}
