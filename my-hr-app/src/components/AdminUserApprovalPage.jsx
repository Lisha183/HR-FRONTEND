import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/crsf'; 

export default function AdminUserApprovalPage() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPendingUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const csrfToken = getCookie('csrftoken');
            const response = await fetch('http://localhost:8000/api/admin/users/pending-approval/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setPendingUsers(data);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to fetch pending users.');
                console.error('Failed to fetch pending users:', errorData);
            }
        } catch (err) {
            setError('Network error while fetching pending users.');
            console.error('Network error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApproveUser = async (userId) => {
        try {
            const csrfToken = getCookie('csrftoken');
            const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/approve/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ is_approved: true }),
                credentials: 'include',
            });

            if (response.ok) {
                setPendingUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                console.log(`User ${userId} approved successfully.`);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to approve user.');
                console.error('Failed to approve user:', errorData);
            }
        } catch (err) {
            setError('Network error while approving user.');
            console.error('Network error:', err);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading pending users...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Pending User Approvals</h2>
            {pendingUsers.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-gray-600">No users currently awaiting approval.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingUsers.map(user => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div>
                                <p className="text-lg font-semibold">{user.username}</p>
                                <p className="text-gray-600 text-sm">{user.email} - {user.role}</p>
                            </div>
                            <button
                                onClick={() => handleApproveUser(user.id)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
                            >
                                Approve
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}