import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 

export default function EmployeeSelfAssessmentForm() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        quarter_number: '',
        year: new Date().getFullYear(), 
        employee_rating: '',
        employee_comments: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [hasSubmittedForQuarter, setHasSubmittedForQuarter] = useState(false); 
    const RATING_CHOICES = [
        { value: 1, label: '1 - Needs Improvement' },
        { value: 2, label: '2 - Developing' },
        { value: 3, label: '3 - Meets Expectations' },
        { value: 4, label: '4 - Exceeds Expectations' },
        { value: 5, label: '5 - Outstanding' },
    ];

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }
        
        fetch("http://localhost:8000/api/csrf/", {
            credentials: "include",
        });

        const checkExistingAssessment = async () => {
            if (!user || !user.id) return;
            setLoading(true);
            setError(null);
            setMessage(null);
            try {
                const csrftoken = getCookie('csrftoken');
                const response = await fetch('http://localhost:8000/api/employee/self-assessments/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(`Failed to fetch existing assessments: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                const existingAssessment = data.find(
                    (assessment) =>
                        assessment.quarter_number === parseInt(formData.quarter_number) &&
                        assessment.year === parseInt(formData.year)
                );

                if (existingAssessment) {
                    setHasSubmittedForQuarter(true);
                    setMessage(`You have already submitted a self-assessment for Q${formData.quarter_number} ${formData.year}.`);
                    setFormData({
                        quarter_number: existingAssessment.quarter_number,
                        year: existingAssessment.year,
                        employee_rating: existingAssessment.employee_rating,
                        employee_comments: existingAssessment.employee_comments,
                    });
                } else {
                    setHasSubmittedForQuarter(false);
                    setMessage(null);
                }

            } catch (err) {
                console.error("Error checking existing assessment:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (formData.quarter_number && formData.year && isAuthenticated && user && user.role === 'employee') {
            checkExistingAssessment();
        } else if (isAuthenticated && user && user.role === 'employee') {
            setHasSubmittedForQuarter(false);
            setMessage(null);
        }

    }, [isAuthenticated, user, navigate, formData.quarter_number, formData.year]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (hasSubmittedForQuarter) {
            setError('You have already submitted a self-assessment for this quarter and year.');
            setLoading(false);
            return;
        }

        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/employee/self-assessments/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    ...formData,
                    quarter_number: parseInt(formData.quarter_number), 
                    year: parseInt(formData.year), 
                    employee_rating: parseInt(formData.employee_rating), 
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to submit self-assessment: ${JSON.stringify(errorData.detail || errorData)}`);
            }

            const data = await response.json();
            setMessage('Self-assessment submitted successfully!');
            setHasSubmittedForQuarter(true); 
         
        } catch (err) {
            console.error("Error submitting self-assessment:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !message && !error) { 
        return <p className="loading-message">Loading form...</p>;
    }
    if (error && !loading) {
        return <p className="error-message">Error: {error}</p>;
    }
    if (!isAuthenticated || (user && user.role !== 'employee')) return null; 

    return (
        <div className="dashboard-container">
            <h1 className="page-title">Submit Self-Assessment</h1>

            {message && (
                <div className={`message-container ${error ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="form-section"> 
                <form onSubmit={handleSubmit} className="payroll-form"> 
                    <div className="form-group">
                        <label htmlFor="quarter_number">Quarter:</label>
                        <select
                            id="quarter_number"
                            name="quarter_number"
                            value={formData.quarter_number}
                            onChange={handleChange}
                            required
                            disabled={hasSubmittedForQuarter} 
                        >
                            <option value="">Select Quarter</option>
                            <option value="1">Q1</option>
                            <option value="2">Q2</option>
                            <option value="3">Q3</option>
                            <option value="4">Q4</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="year">Year:</label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min="2020" 
                            max={new Date().getFullYear() + 1}
                            disabled={hasSubmittedForQuarter} 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="employee_rating">Your Rating:</label>
                        <select
                            id="employee_rating"
                            name="employee_rating"
                            value={formData.employee_rating}
                            onChange={handleChange}
                            required
                            disabled={hasSubmittedForQuarter}
                        >
                            <option value="">Select Rating</option>
                            {RATING_CHOICES.map(choice => (
                                <option key={choice.value} value={choice.value}>
                                    {choice.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="employee_comments">Your Comments:</label>
                        <textarea
                            id="employee_comments"
                            name="employee_comments"
                            value={formData.employee_comments}
                            onChange={handleChange}
                            rows="5"
                            required
                            disabled={hasSubmittedForQuarter}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="approve-button"
                        disabled={loading || hasSubmittedForQuarter}
                    >
                        {loading ? 'Submitting...' : (hasSubmittedForQuarter ? 'Submitted' : 'Submit Self-Assessment')}
                    </button>
                    {hasSubmittedForQuarter && (
                        <p className="text-center mt-4 text-gray-600">You can view your submitted assessment on the "My Self-Assessments" page.</p>
                    )}
                </form>
            </div>
        </div>
    );
}
