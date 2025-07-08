import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf';

export default function AdminSelfAssessmentReviewForm({ assessmentId, onBack }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [formData, setFormData] = useState({
    hr_rating: '',
    hr_feedback: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const RATING_CHOICES = [
    { value: 1, label: '1 - Needs Improvement' },
    { value: 2, label: '2 - Developing' },
    { value: 3, label: '3 - Meets Expectations' },
    { value: 4, label: '4 - Exceeds Expectations' },
    { value: 5, label: '5 - Outstanding' },
  ];

  const STATUS_CHOICES = [
    { value: 'Pending HR Review', label: 'Pending HR Review' },
    { value: 'Completed', label: 'Completed' },
  ];

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    const fetchAssessmentDetails = async () => {
      try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/self-assessments/${assessmentId}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          credentials: 'include',
        });

        const data = await response.json();
        setAssessment(data);
        setFormData({
          hr_rating: data.hr_rating || '',
          hr_feedback: data.hr_feedback || '',
          status: data.status,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) fetchAssessmentDetails();
  }, [isAuthenticated, user, navigate, assessmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
  
    try {
      const csrftoken = getCookie('csrftoken');
  
      const payload = {
        hr_rating: formData.hr_rating ? parseInt(formData.hr_rating) : null,
        hr_feedback: formData.hr_feedback,
        status: formData.status,
      };
      console.log('PATCH payload:', payload);
  
      const response = await fetch(`https://hr-backend-xs34.onrender.com/api/admin/self-assessments/${assessmentId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
  
      const responseData = await response.json();
      console.log('PATCH response:', responseData);
  
      if (!response.ok) {
        let errorMessage = responseData.detail || response.statusText || 'Unknown error';
        throw new Error(errorMessage);
      }
  
      // On successful update, navigate back to management page and trigger refresh
      onBack();
  
    } catch (err) {
      console.error("Error updating self-assessment:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.formContainer}>
        <div style={styles.progressWrapper}>
          <div style={{...styles.step, ...styles.activeStep}}><br /><small>Self Assessment Review</small></div>

        </div>

        <h2 style={styles.heading}>Review Self-Assessment - {assessment.employee_username}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>HR Rating:</label>
          <select
            name="hr_rating"
            value={formData.hr_rating}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">Select</option>
            <option value="1">1 - Needs Improvement</option>
            <option value="2">2 - Developing</option>
            <option value="3">3 - Meets Expectations</option>
            <option value="4">4 - Exceeds Expectations</option>
            <option value="5">5 - Outstanding</option>
          </select>

          <label style={styles.label}>HR Feedback:</label>
          <textarea
            name="hr_feedback"
            rows="4"
            value={formData.hr_feedback}
            onChange={handleChange}
            required
            style={{ ...styles.input, height: 100, resize: 'none' }}
          />

          <label style={styles.label}>Status:</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="Pending HR Review">Pending HR Review</option>
            <option value="Completed">Completed</option>
          </select>

          <div style={styles.buttonGroup}>
            <button type="submit" disabled={submitting} style={styles.primaryButton}>
              {submitting ? 'Updating...' : 'Update Review'}
            </button>
            <button
              type="button"
              onClick={onBack}

              style={styles.secondaryButton}
            >
              Cancel / Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: 'border-box',
  },
  formContainer: {
    background: '#fff',
    borderRadius: 20,
    padding: '2rem 2.5rem',
    boxShadow: '0 10px 25px rgba(177, 166, 159, 0.25)',
    width: '100%',
    maxWidth: 600,
    boxSizing: 'border-box',
  },
  progressWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  step: {
    flex: 1,
    textAlign: 'center',
    padding: '0.5rem',
    color: '#999',
    fontWeight: '600',
    fontSize: 12,
    cursor: 'default',
  },
  activeStep: {
    color: 'blue',
    borderBottom: '3px solid blue',
  },
  heading: {
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  label: {
    fontWeight: '600',
    color: '#444',
    fontSize: '0.95rem',
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s',
    width: '100%',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginTop: '2rem',
  },
  primaryButton: {
    background: 'blue',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: 15,
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: 16,
    flex: 1,
    minWidth: '140px',
  },
  secondaryButton: {
    background: '#f0f0f0',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: 15,
    color: '#333',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: 16,
    flex: 1,
    minWidth: '140px',
  },
};
