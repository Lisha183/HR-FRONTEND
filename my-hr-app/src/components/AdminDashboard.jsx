
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AdminSelfAssessmentManagement from './AdminSelfAssessmentManagement';
import AdminAttendanceReport from './AdminAttendanceReport';
import AdminEmployeeProfilesPage from './AdminEmployeeProfilesPage';
import AdminDepartmentsPage from './AdminDepartmentsPage';
import AdminLeaveManagement from './AdminLeaveManagement';
import AdminPayrollManagement from './AdminPayrollManagement';
import AdminUserApprovalPage from './AdminUserApprovalPage';
import AdminMeetingSlotManagement from './AdminMeetingSlotManagement';
import AdminSidebar from './AdminSidebar';
import AdminSelfAssessmentReviewForm from './AdminSelfAssessmentReviewForm'; 



function getCookie(name) {
  const cookieValue = document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="));
  return cookieValue ? decodeURIComponent(cookieValue.split("=")[1]) : null;
}

export default function AdminDashboard() {
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ employees: 0, departments: 0, leaves: 0 });
  const [date, setDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchCounts();
  }, [isAuthenticated, user, navigate]);

  const fetchCounts = async () => {
    try {
      const csrfToken = getCookie("csrftoken");
      console.log('CSRF token:', csrfToken, 'Length:', csrfToken?.length);

      const [employeesRes, departmentsRes, leavesRes] = await Promise.all([
        fetch("https://hr-backend-xs34.onrender.com/api/employee-profiles/", {
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }),
        fetch("https://hr-backend-xs34.onrender.com/api/departments/", {
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }),
        fetch("https://hr-backend-xs34.onrender.com/api/leave-requests/", {
          credentials: "include",
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }),
      ]);

      if (!employeesRes.ok || !departmentsRes.ok || !leavesRes.ok) {
        throw new Error("Failed to fetch counts");
      }

      const employees = await employeesRes.json();
      const departments = await departmentsRes.json();
      const leaves = await leavesRes.json();

      setStats({
        employees: employees.length,
        departments: departments.length,
        leaves: leaves.length,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const renderContent = () => {
    if (activeTab.startsWith('assessment-review-')) {
      const assessmentId = activeTab.split('-')[2];
      return (
        <AdminSelfAssessmentReviewForm
          assessmentId={assessmentId}
          onBack={() => setActiveTab('self-assessment')}
        />
      );
    }
  
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <h1>Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ ...cardStyle, flex: '1 1 250px' }}>Employees: {stats.employees}</div>
              <div style={{ ...cardStyle, flex: '1 1 250px' }}>Departments: {stats.departments}</div>
              <div style={{ ...cardStyle, flex: '1 1 250px' }}>Leave Requests: {stats.leaves}</div>
            </div>

            <div style={{ padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', maxWidth: '400px' }}>
              <h3>Calendar</h3>
              <Calendar onChange={setDate} value={date} />
            </div>

            <div style={{ marginTop: '2rem' }}>
              <AdminUserApprovalPage />
            </div>
          </>
        );
      case 'profiles':
        return <AdminEmployeeProfilesPage search={searchQuery} />;
      case 'departments':
        return <AdminDepartmentsPage search={searchQuery} />;
      case 'leave':
        return <AdminLeaveManagement search={searchQuery} />;
      case 'payroll':
        return <AdminPayrollManagement />;
        case 'self-assessment':
          return (
            <AdminSelfAssessmentManagement
              onViewAssessment={(id) => setActiveTab(`assessment-review-${id}`)}
            />
          );
        
      case 'attendance-report':
        return <AdminAttendanceReport />;
      case 'meetingSlots':
        return <AdminMeetingSlotManagement />;
      default:
        return <h2>Unknown section</h2>;
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.4)',
              zIndex: 1000,
            }}
          />
        )}
        <main
          style={{
            flex: 1,
            padding: '2rem',
            background: '#f5f5f5',
            minHeight: '100vh',
            marginLeft: '70px',
            transition: 'margin-left 0.3s ease',
            overflowX: 'auto',
          }}
        >        

          {renderContent()}
        </main>
      </div>

      <style>
        {`
          @media (max-width: 768px) {
            main {
              margin-left: 0 !important;
              padding: 1rem !important;
            }
            .mobile-top-bar {
              display: flex !important;
            }
          }
        `}
      </style>
    </>
  );
}

const cardStyle = {
  backgroundColor: 'white',
  padding: '1.5rem 2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(124, 58, 173, 0.3)',
  flex: '1',
  textAlign: 'center',
  fontWeight: '700',
  fontSize: '1.25rem',
  color: '#7c3aed',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '0.5rem',
};
