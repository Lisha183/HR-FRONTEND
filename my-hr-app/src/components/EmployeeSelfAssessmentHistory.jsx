import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/crsf'; 
import EmployeeSelfAssessmentForm from './EmployeeSelfAssessmentForm';

export default function EmployeeSelfAssessmentHistory() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [selfAssessments, setSelfAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

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

    useEffect(() => {
        if (!isAuthenticated || (user && user.role !== 'employee')) {
            navigate('/login');
            return;
        }

        const fetchSelfAssessments = async () => {
            setLoading(true);
            setError(null);
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
                    throw new Error(`Failed to fetch self-assessments: ${errorData.detail || response.statusText}`);
                }

                const data = await response.json();
                setSelfAssessments(data);
            } catch (err) {
                console.error("Error fetching self-assessments:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user && user.role === 'employee') {
            fetchSelfAssessments();
        }
    }, [isAuthenticated, user, navigate]);

    const getRatingLabel = (value) => {
        const RATING_CHOICES = [
            { value: 1, label: '1 - Needs Improvement' },
            { value: 2, label: '2 - Developing' },
            { value: 3, label: '3 - Meets Expectations' },
            { value: 4, label: '4 - Exceeds Expectations' },
            { value: 5, label: '5 - Outstanding' },
        ];
        const choice = RATING_CHOICES.find(c => c.value === value);
        return choice ? choice.label : 'N/A';
    };

    if (loading) {
        return <p className="loading-message">Loading self-assessments...</p>;
    }

    if (error) {
        return <p className="error-message">Error: {error}</p>;
    }

    if (!isAuthenticated || (user && user.role !== 'employee')) {
        return null;
    }

    return (
        <div className="dashboard-container">
            <h1 className="page-title">My Self-Assessments</h1>

            {selfAssessments.length === 0 ? (
                <p className="no-records-message">No self-assessments found. <a href="/submit-self-assessment" className="text-blue-600 hover:underline">Submit one now!</a></p>
            ) : (
                <div className="table-container">
                    <div className="self-assessment-cards">
                            
                        {selfAssessments.map(assessment => (
                            
                            
                            <div key={assessment.id} className="self-assessment-card">
                                <h2 className="card-title">Q{assessment.quarter_number} {assessment.year} - Status: {assessment.status}</h2>
                                <p className="card-detail"><strong>Submitted:</strong> {new Date(assessment.submitted_at).toLocaleDateString()}</p>

                                <div className="employee-answers-section">
                                    <h3 className="section-title">Your Self-Assessment:</h3>
                                    {assessment.employee_answers && assessment.employee_answers.length > 0 ? (
                                        assessment.employee_answers.map((answer, ansIndex) => {
                                            const question = SELF_ASSESSMENT_QUESTIONS.find(q => q.id === answer.question_id);
                                            return (
                                                <div key={ansIndex} className="question-answer-item">
                                                    <p className="question-text"><strong>{ansIndex + 1}. {question ? question.text : `Question ID: ${answer.question_id}`}</strong></p>
                                                    <p className="answer-rating">Rating: {getRatingLabel(answer.rating)}</p>
                                                    <p className="answer-comments">Comments: {answer.comments}</p>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>No detailed employee answers available.</p>
                                        
                                    )}
                                </div>

                                {assessment.status === 'Completed' && (
                                    <div className="hr-review-section">
                                        <h3 className="section-title">HR Review:</h3>
                                        <p className="hr-rating"><strong>HR Rating:</strong> {assessment.hr_rating ? getRatingLabel(assessment.hr_rating) : 'N/A'}</p>
                                        <p className="hr-feedback"><strong>HR Feedback:</strong> {assessment.hr_feedback || 'N/A'}</p>
                                        <p className="hr-reviewed-by"><strong>Reviewed By:</strong> {assessment.reviewed_by_username || 'N/A'}</p>
                                        <p className="hr-reviewed-at"><strong>Reviewed At:</strong> {assessment.reviewed_at ? new Date(assessment.reviewed_at).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                )}
                                {assessment.status === 'Pending HR Review' && (
                                     <div className="hr-review-section text-gray-500">
                                        <p>HR review is pending for this assessment.</p>
                          

                                    </div>
                                    
                                )}
                            </div>
                        ))}
                        
                    </div>
                </div>
            )}
        </div>
    );
}
