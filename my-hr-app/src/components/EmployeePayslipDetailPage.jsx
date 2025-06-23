import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getCookie } from '../utils/crsf';

function EmployeePayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPayslipDetail() {

      
      try {
        setLoading(true);
        setError(null);
        const csrftoken = getCookie('csrftoken');
        const response = await fetch(`http://localhost:8000/api/employee/payslips/${id}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Payslip not found for this ID or you do not have access.');
          }
          if (response.status === 403) { 
            throw new Error('You do not have permission to view this payslip.');
          }
          const errorData = await response.json().catch(() => ({ detail: `Server responded with status ${response.status}.` }));
          throw new Error(errorData.detail || `Failed to fetch payslip: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPayslip(data);
      } catch (err) {
        console.error("Error fetching payslip detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user && id) { 
      fetchPayslipDetail();
    } else if (!user) { 
        setError("You must be logged in to view payslip details.");
        setLoading(false);
    } else if (!id) { 
        setError("No payslip ID provided in the URL.");
        setLoading(false);
    }
  }, [user, id, navigate]); 

  if (loading) {
    return <div className="payslip-detail-container">Loading payslip details...</div>;
  }

  if (error) {
    return (
      <div className="payslip-detail-container error">
        <p>Error: {error}</p>
        <button onClick={() => navigate('/employee/payslips')} className="back-button">Back to Payslips</button>
      </div>
    );
  }

  if (!payslip) {
    return <div className="payslip-detail-container no-data">No payslip data available.</div>;
  }

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return `$0.00`; 
    }
    return `$${numAmount.toFixed(2)}`;
  };
  const totalDeductionsCalculated = 
    (parseFloat(payslip.tax_deduction) || 0) + 
    (parseFloat(payslip.social_security_deduction) || 0) + 
    (parseFloat(payslip.other_deductions) || 0);


  return (
    <div className="payslip-detail-container">
      <h2>Payslip for {payslip.employee_details?.username || 'N/A'}</h2> 
      <div className="payslip-info-section">
        <h3>Pay Period</h3>
        <p><span>From:</span> <span>{payslip.pay_period_start}</span></p>
        <p><span>To:</span> <span>{payslip.pay_period_end}</span></p>
        <p><span>Payout Date:</span> <span>{payslip.payout_date}</span></p> 
      </div>

      <div className="payslip-info-section">
        <h3>Earnings</h3>
        <p><span>Basic Salary:</span> <span>{formatCurrency(payslip.basic_salary)}</span></p>
        {payslip.allowances > 0 && <p><span>Allowances:</span> <span>{formatCurrency(payslip.allowances)}</span></p>}
        {payslip.bonuses > 0 && <p><span>Bonuses:</span> <span>{formatCurrency(payslip.bonuses)}</span></p>}
      </div>

      <div className="payslip-info-section">
        <h3>Deductions</h3>
        <p><span>Tax Deduction:</span> <span>{formatCurrency(payslip.tax_deduction)}</span></p>
        <p><span>Social Security Deduction:</span> <span>{formatCurrency(payslip.social_security_deduction)}</span></p>
        <p><span>Other Deductions:</span> <span>{formatCurrency(payslip.other_deductions)}</span></p>
      </div>

      <div className="payslip-summary-section">
        <h3>Summary</h3>
        <p><span>Gross Pay:</span> <span>{formatCurrency(payslip.gross_pay)}</span></p>
        <p><span>Total Deductions:</span> <span>{formatCurrency(payslip.total_deductions || totalDeductionsCalculated)}</span></p>
        <p className="net-pay"><span>Net Pay:</span> <span>{formatCurrency(payslip.net_pay)}</span></p>
      </div>

      <button onClick={() => navigate('/employee/payslips')} className="back-button">Back to All Payslips</button>
    </div>
  );
}

export default EmployeePayslipDetailPage;