import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate} from 'react-router-dom';
import { getCookie } from '../utils/crsf';

const SELF_ASSESSMENT_QUESTIONS = [
    { id: 'q1', text: 'Ability to meet deadlines and complete tasks efficiently.' },
    { id: 'q2', text: 'Quality of work and attention to detail.' },
    { id: 'q3', text: 'Teamwork and collaboration skills.' },
    { id: 'q4', text: 'Problem-solving and critical thinking abilities.' },
    { id: 'q5', text: 'Communication skills (verbal and written).' },
    { id: 'q6', text: 'Adaptability and willingness to learn new skills.' },
    { id: 'q7', text: 'Initiative and proactiveness in your role.' },
    { id: 'q8', text: 'Overall contribution to team goals and company objectives.' },
];

const RATING_CHOICES = [
    { value: 1, label: '1 - Needs Improvement' },
    { value: 2, label: '2 - Developing' },
    { value: 3, label: '3 - Meets Expectations' },
    { value: 4, label: '4 - Exceeds Expectations' },
    { value: 5, label: '5 - Outstanding' },
];

export default function EmployeeSelfAssessmentForm({assessmentId, onUpdateSuccess }) {
   
    const effectiveId = assessmentId ||null;   
    const isEditMode = !!effectiveId;

    const { isAuthenticated, user,csrfToken } = useAuth();
    const navigate = useNavigate()
;
    const initialFormData = {
        quarter_number: '',
        year: new Date().getFullYear().toString(),
        employee_answers: SELF_ASSESSMENT_QUESTIONS.map(q => ({
            question_id: q.id,
            rating: '', 
        })),
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isSubmittedAndNotEditable, setIsSubmittedAndNotEditable] = useState(false); 

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'employee') {
            navigate('/login');
            return;
        }

        const fetchAssessment = async () => {
            if (!isEditMode) {
                setFormData(initialFormData);
                setLoading(false);
                return;
            }

            try {
                const csrftoken = csrfToken;
                const response = await fetch(`https://hr-backend-xs34.onrender.com/api/employee/self-assessments/${effectiveId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                    throw new Error(`Failed to fetch self-assessment: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                const updatedAnswers = SELF_ASSESSMENT_QUESTIONS.map(q => {
                    const existingAnswer = data.employee_answers.find(ans => ans.question_id === q.question_id);
                    return {
                        question_id: q.id,
                        rating: existingAnswer ? existingAnswer.rating.toString() : '', 
                    };
                });

                setFormData({
                    quarter_number: data.quarter_number.toString(), 
                    year: data.year.toString(), 
                    employee_answers: updatedAnswers,
                });
                if (data.status === 'Completed' || data.status === 'Pending HR Review') {
                    setIsSubmittedAndNotEditable(true);
                    setMessage(`This self-assessment for Q${data.quarter_number} ${data.year} is ${data.status}. It is now read-only for you.`);
                } else {
                    setIsSubmittedAndNotEditable(false);
                }

                setMessage(`Self-assessment for Q${data.quarter_number} ${data.year} loaded.`);
            } catch (err) {
                console.error("Error fetching self-assessment:", err);
                setError(err.message);
                setFormData(initialFormData); 
            } finally {
                setLoading(false);
            }
        };

        fetch('https://hr-backend-xs34.onrender.com/api/csrf/', { credentials: 'include' });

        fetchAssessment();
    }, [effectiveId, isEditMode, isAuthenticated, user, navigate]); 

    useEffect(() => {

        if (!isEditMode && formData.quarter_number && formData.year.length === 4 && user?.id) {
            const check = async () => {
                setLoading(true);
                setError(null);
                setMessage(null);
                try {
                const csrftoken = csrfToken;
                    const res = await fetch(`https://hr-backend-xs34.onrender.com/api/employee/self-assessments/?quarter_number=${formData.quarter_number}&year=${formData.year}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                        credentials: 'include',
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
                        throw new Error(`Failed to check existing assessment: ${errorData.detail || res.statusText}`);
                    }

                    const data = await res.json();
                    const existing = data.find(
                        item => item.quarter_number === parseInt(formData.quarter_number) && item.year === parseInt(formData.year) && item.employee === user.id
                    );

                    if (existing) {
                        setIsSubmittedAndNotEditable(true);
                        setMessage(`You have already submitted a self-assessment for Q${formData.quarter_number} ${formData.year}. It is now read-only.`);
                        const updatedAnswers = SELF_ASSESSMENT_QUESTIONS.map(q => {
                            const match = existing.employee_answers.find(ans => ans.question_id === q.question_id);
                            return match ? { ...q, rating: match.rating.toString() } : q;
                        });
                        setFormData(prev => ({
                            ...prev,
                            employee_answers: updatedAnswers,
                        }));
                    } else {
                        setIsSubmittedAndNotEditable(false);
                        setMessage(null);
                        setFormData(prev => ({
                            ...prev,
                            employee_answers: SELF_ASSESSMENT_QUESTIONS.map(q => ({
                                question_id: q.id,
                                rating: '',
                            })),
                        }));
                    }
                } catch (err) {
                    console.error('Error checking for existing assessments:', err);
                    setError('Could not check for existing assessments.');
                } finally {
                    setLoading(false);
                }
            };
            check();
        } else if (!isEditMode && (!formData.quarter_number || formData.year.length !== 4)) {
            setIsSubmittedAndNotEditable(false);
            setMessage(null);
        }
    }, [isEditMode, formData.quarter_number, formData.year, user]); 


    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'quarter_number' || name === 'year') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (name.startsWith('rating-')) {
            const index = parseInt(name.split('-')[1]);
            setFormData(prev => {
                const updated = [...prev.employee_answers];
                updated[index] = { ...updated[index], rating: value };
                return { ...prev, employee_answers: updated };
            });
        }
    };

    const handleYearBlur = () => {
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
          
        if (isSubmittedAndNotEditable) {
            setError('This self-assessment is read-only and cannot be updated.');
            return;
        }
        if (!formData.quarter_number || formData.year.length !== 4) {
            setError('Please enter a valid quarter and year.');
            return;
        }
        for (let answer of formData.employee_answers) {
            if (!answer.rating) {
                setError('Please complete all ratings.');
                return;
            }
        }

        try {
            setLoading(true);
            const csrftoken = csrfToken;
            let url = 'https://hr-backend-xs34.onrender.com/api/employee/self-assessments/';
            let method = 'POST';

            if (isEditMode) {
                url = `https://hr-backend-xs34.onrender.com/api/employee/self-assessments/${effectiveId}/`;
                method = 'PATCH';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify({
                    quarter_number: parseInt(formData.quarter_number),
                    year: parseInt(formData.year),
                    employee_answers: formData.employee_answers.map(ans => ({
                        question_id: ans.question_id,
                        rating: parseInt(ans.rating) 
                    }))
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(`Failed to ${isEditMode ? 'update' : 'submit'} self-assessment: ${errorData.detail || response.statusText}`);
            }

            const data = await response.json();
            setMessage(`Self-assessment ${isEditMode ? 'updated' : 'submitted'} successfully!`);
            if (onUpdateSuccess) onUpdateSuccess();
        } catch (err) {
            console.error("Error submitting/updating self-assessment:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || user?.role !== 'employee') {
        return <p className="error-message">Access Denied. Please login as an employee.</p>;
    }
    
    if (loading) return <p className="loading-message">Loading self-assessment form...</p>;

    return (
        <div className="self-assessment-page-wrapper">
            <div className="self-assessment-main-card">
                <h1 className="self-assessment-page-title">{isEditMode ? 'View/Edit Self-Assessment' : 'Submit Self-Assessment'}</h1>

                {message && (
                    <div className={`message-container ${error ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="self-assessment-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="form-group-self-assessment">
                            <label htmlFor="quarter_number" className="self-assessment-label">Quarter Number:</label>
                            <select
                                id="quarter_number"
                                name="quarter_number"
                                value={formData.quarter_number}
                                onChange={handleChange}
                                disabled={isSubmittedAndNotEditable || loading} 
                                required
                                className="self-assessment-input"
                            >
                                <option value="">Select Quarter</option>
                                <option value="1">Q1</option>
                                <option value="2">Q2</option>
                                <option value="3">Q3</option>
                                <option value="4">Q4</option>
                            </select>
                        </div>
                        <div className="form-group-self-assessment">
                            <label htmlFor="year" className="self-assessment-label">Year:</label>
                            <input
                                type="number"
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                onBlur={handleYearBlur}
                                disabled={isSubmittedAndNotEditable || loading} 
                                required
                                min="2020"
                                max={new Date().getFullYear() + 1}
                                className="self-assessment-input"
                            />
                        </div>
                    </div>

                    {SELF_ASSESSMENT_QUESTIONS.map((question, index) => (
                        <div className="form-group-self-assessment mb-6" key={question.id}>
                            <label htmlFor={`rating-${index}`} className="self-assessment-label">
                                {index + 1}. {question.text}
                            </label>
                            <select
                                id={`rating-${index}`}
                                name={`rating-${index}`}
                                value={formData.employee_answers[index]?.rating || ''}
                                onChange={handleChange}
                                required
                                disabled={isSubmittedAndNotEditable || loading} 
                                className="self-assessment-input"
                            >
                                <option value="">Select Rating</option>
                                {RATING_CHOICES.map(choice => (
                                    <option key={choice.value} value={choice.value}>
                                        {choice.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={isSubmittedAndNotEditable || loading}
                        className={`self-assessment-submit-button ${isSubmittedAndNotEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processing...' : (isEditMode ? (isSubmittedAndNotEditable ? 'View-Only' : 'Update Self-Assessment') : 'Submit Self-Assessment')}
                    </button>
                    {isSubmittedAndNotEditable && <p className="read-only-message">This assessment is read-only.</p>}
                </form>
            </div>
        </div>
    );
}
