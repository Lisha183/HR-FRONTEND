import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getCookie } from '../utils/crsf';

export default function AdminSelfAssessmentManagement({ onViewAssessment }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selfAssessments, setSelfAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formEmployeeUsername, setFormEmployeeUsername] = useState('');
  const [formQuarter, setFormQuarter] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formStatus, setFormStatus] = useState('');

  const [filters, setFilters] = useState({});

  const RATING_CHOICES = [
    { value: 1, label: '1 - Needs Improvement' },
    { value: 2, label: '2 - Developing' },
    { value: 3, label: '3 - Meets Expectations' },
    { value: 4, label: '4 - Exceeds Expectations' },
    { value: 5, label: '5 - Outstanding' },
  ];

  const fetchSelfAssessments = useCallback(async (customFilters = filters) => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    setLoading(true);
    setError(null);

    try {
      const csrftoken = getCookie('csrftoken');
      let url = 'https://hr-backend-xs34.onrender.com/api/admin/self-assessments/';
      const queryParams = new URLSearchParams();

      if (customFilters.employeeUsername) queryParams.append('employee_username', customFilters.employeeUsername);
      if (customFilters.quarter) queryParams.append('quarter_number', customFilters.quarter);
      if (customFilters.year) queryParams.append('year', customFilters.year);
      if (customFilters.status) queryParams.append('status', customFilters.status);

      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        credentials: 'include',
      });

      const data = await response.json();
      setSelfAssessments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin') {
      if (location.state?.refresh) {
        fetchSelfAssessments();
        navigate(location.pathname, { replace: true }); 
      } else {
        fetchSelfAssessments();
      }
    }
  }, [fetchSelfAssessments, isAuthenticated, user, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newFilters = {
      employeeUsername: formEmployeeUsername.trim(),
      quarter: formQuarter,
      year: formYear.trim(),
      status: formStatus,
    };
    setFilters(newFilters);
    fetchSelfAssessments(newFilters);
  };

  const getRatingLabel = (value) => {
    const choice = RATING_CHOICES.find((c) => c.value === value);
    return choice ? choice.label : 'N/A';
  };

  return (
    <div className="form-container">
  <h1>Manage Self-Assessments</h1>

  <form onSubmit={handleSubmit} className="filter-form">
    <input
      name="employeeUsername"
      placeholder="Employee Username"
      value={formEmployeeUsername}
      onChange={(e) => setFormEmployeeUsername(e.target.value)}
    />
    <select name="quarter" value={formQuarter} onChange={(e) => setFormQuarter(e.target.value)}>
      <option value="">All Quarters</option>
      <option value="1">Q1</option>
      <option value="2">Q2</option>
      <option value="3">Q3</option>
      <option value="4">Q4</option>
    </select>
    <input
      type="number"
      name="year"
      placeholder="Year"
      value={formYear}
      onChange={(e) => setFormYear(e.target.value)}
    />
    <select name="status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
      <option value="">All Statuses</option>
      <option value="Pending HR Review">Pending HR Review</option>
      <option value="Completed">Completed</option>
    </select>
    <button type="submit" style={{backgroundColor:'blue'}}>Submit</button>
  </form>
  
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : selfAssessments.length === 0 ? (
        <p>No self-assessments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Quarter</th>
              <th>Year</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Reviewer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selfAssessments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.employee_username}</td>
                <td>Q{a.quarter_number}</td>
                <td>{a.year}</td>
                <td>{a.status}</td>
                <td>{a.hr_rating ? getRatingLabel(a.hr_rating) : 'N/A'}</td>
                <td>{a.hr_feedback || 'N/A'}</td>
                <td>{a.reviewed_by_username || 'N/A'}</td>
                <td>
                <button
  onClick={() => onViewAssessment(a.id)}
  style={{
    background: 'none',
    border: 'none',
    color: 'blue',
    cursor: 'pointer',
    textDecoration: 'underline',
  }}
>
  {a.status === 'Pending HR Review' ? 'Review' : 'View'}
</button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
