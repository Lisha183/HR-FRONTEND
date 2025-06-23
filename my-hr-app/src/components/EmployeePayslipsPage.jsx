import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; 

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(trimmed.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function EmployeePayslipsPage() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }

        async function fetchPayslips() {
            setLoading(true);
            setError(null);
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch('http://localhost:8000/api/employee/payslips/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
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
        if (isAuthenticated && user && user.role === 'employee') {
            fetchPayslips();
        }

    }, [isAuthenticated, user, navigate]); 

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading payslips...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-600">Error: {error}</div>;
    }

    return (
         <div className="payslips-container">
         <h1 className="payslips-title">My Payslips</h1>
         {payslips.length === 0 ? (
             <div className="no-payslips-message">
                 <p>No payslips found for your account.</p>
             </div>
         ) : (
             <div className="payslip-list">
                 {payslips.map(payslip => (
                     <div key={payslip.id} className="payslip-item">
                         <h2 className="payslip-item-title">Pay Period: {payslip.pay_period_start} to {payslip.pay_period_end}</h2>
                         <p className="payslip-item-detail">Gross Pay: <span className="payslip-value">${payslip.gross_pay}</span></p>
                         <p className="payslip-item-detail">Net Pay: <span className="payslip-value">${payslip.net_pay}</span></p>
                         <p className="payslip-item-detail">Payout Date: <span className="payslip-value">{payslip.payout_date}</span></p>
                         <Link to={`/employee/payslips/${payslip.id}`} className="view-details-button">
                             View Details
                         </Link>
                     </div>
                 ))}
             </div>
         )}
     </div>
 );
}