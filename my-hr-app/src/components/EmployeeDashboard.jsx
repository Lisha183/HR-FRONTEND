import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClockInOutButton from './ClockInOutButton';
import { getCookie } from '../utils/crsf';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeLeaveHistory from './EmployeeLeaveHistory';
import EmployeeSelfAssessmentForm from './EmployeeSelfAssessmentForm';
import EmployeeMeetingBooking from './EmployeeMeetingBooking';
import LeaveRequestForm from './LeaveRequestForm';
import EmployeePayslipsPage from './EmployeePayslipsPage';
import EmployeeSelfAssessmentHistory from './EmployeeSelfAssessmentHistory';
import EmployeePayslipDetailPage from './EmployeePayslipDetailPage';

export default function EmployeeDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'employee')) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user || !user.id) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setProfileError(null);
      try {
        const csrftoken = getCookie('csrftoken');
        const response = await fetch(`https://hr-backend-xs34.onrender.com/api/employee-profiles/?user=${user.id}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          if (response.status === 404) {
            setEmployeeProfile(null);
          } else {
            throw new Error(`Failed to fetch profile: ${errorData.detail || response.statusText}`);
          }
        } else {
          const data = await response.json();
          setEmployeeProfile(data.length > 0 ? data[0] : null);
        }

      } catch (err) {
        setProfileError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (isAuthenticated && user && user.role === 'employee') {
      fetchEmployeeProfile();
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await fetch("https://hr-backend-xs34.onrender.com/api/csrf/", {
        credentials: "include",
      });
  
      const csrfToken = getCookie("csrftoken");
  
      if (!csrfToken || csrfToken.length < 10) {
        throw new Error("Invalid or missing CSRF token.");
      }
  
      const response = await fetch("https://hr-backend-xs34.onrender.com/api/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Logout failed.");
      }
  
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Logout failed. Please try again.");
    }
  };
  

  

  if (!isAuthenticated || (user && user.role !== 'employee')) {
    return null;
  }

  const renderTabContent = () => {
    if (activeTab.startsWith('payslip-')) {
      const payslipId = activeTab.split('-')[1];
      return (
        <EmployeePayslipDetailPage
          payslipId={payslipId}
          onBack={() => setActiveTab('payslips')}
        />
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {loadingProfile ? (
              <p>Loading employee profile...</p>
            ) : profileError ? (
              <p style={{ color: 'red' }}>Error loading profile: {profileError}</p>
            ) : employeeProfile ? (
              <div style={cardStyle}>
                <h2 style={{ ...cardLabelStyle, marginBottom: '1rem' }}>Your Profile</h2>
                <div>
                  <p><strong>Username:</strong> {employeeProfile.user_username || 'N/A'}</p>
                  <p><strong>Full Name:</strong> {employeeProfile.full_name || 'N/A'}</p>
                  <p><strong>Department:</strong> {employeeProfile.department_name || 'N/A'}</p>
                  <p><strong>Job Title:</strong> {employeeProfile.job_title || 'N/A'}</p>
                  <p><strong>Hire Date:</strong> {employeeProfile.hire_date || 'N/A'}</p>
                  <p><strong>Phone Number:</strong> {employeeProfile.phone_number || 'N/A'}</p>
                  <p><strong>Address:</strong> {employeeProfile.address || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {employeeProfile.date_of_birth || 'N/A'}</p>
                  <p><strong>Salary:</strong> {employeeProfile.salary ? `$${parseFloat(employeeProfile.salary).toFixed(2)}` : 'N/A'}</p>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #fbbf24', color: '#b45309', padding: '1rem', marginBottom: '1rem' }} role="alert">
                <p style={{ fontWeight: '700' }}>No Employee Profile Found</p>
                <p>Please contact your administrator to set up your employee profile.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <div style={cardStyle}>
                <h2 style={cardLabelStyle}>Attendance</h2>
                <p>Clock in or out to record your work hours.</p>
                <div style={{ marginTop: '1rem' }}>
                  <ClockInOutButton />
                </div>
              </div>
            </div>
          </>
        );
      case 'requestLeave':
        return <LeaveRequestForm />;
        case 'assessmentForm':
          return (
            <EmployeeSelfAssessmentForm
              assessmentId={null}
              onUpdateSuccess={() => setActiveTab('assessment-history')}
            />
          );
      case 'bookMeeting':
        return <EmployeeMeetingBooking />;
      case 'payslips':
        return <EmployeePayslipsPage onViewDetails={(id) => setActiveTab(`payslip-${id}`)} />;
        
      case 'leave-history':
        return <EmployeeLeaveHistory />;
      case 'assessment-history':
        return <EmployeeSelfAssessmentHistory />;
       
          
          
      default:
        return <p>Unknown tab.</p>;
    }
  };

  return (
    <div className="dashboard-layout"style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif',    flexDirection: 'column',
    
    }}>
      <button
  className="sidebar-toggle"
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
>
  ☰
</button>
<div style={{ display: 'flex', flex: 1 }}>
<EmployeeSidebar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  onLogout={handleLogout}
  isCollapsed={isSidebarOpen}
  setIsCollapsed={setIsSidebarOpen}
/>

     


      <main className="employee-main"style={{ marginLeft: '50px', padding: '2rem', flex: 1, background: '#f5f5f5'}}>
        {renderTabContent()}
      </main>
    </div>
        </div>

       

  );
}

function SidebarButton({ children, onClick, active }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem', color: active ? '#7c3aed' : 'white', backgroundColor: active ? 'white' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.3s, color 0.3s' }}>
      {children}
    </button>
  );
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem 2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(124, 58, 173, 0.3)',
  color: '#1f2937',
};

const cardLabelStyle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#7c3aed',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};
