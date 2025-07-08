import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import LeaveRequestForm from './components/LeaveRequestForm';
import EmployeeLeaveHistory from './components/EmployeeLeaveHistory';
import AdminLeaveManagement from './components/AdminLeaveManagement';
import AdminPayrollManagement from './components/AdminPayrollManagement';
import EmployeePayslipsPage from './components/EmployeePayslipsPage';
import EmployeePayslipDetailPage from './components/EmployeePayslipDetailPage';
import ClockInOutButton from './components/ClockInOutButton';
import AdminAttendanceReport from './components/AdminAttendanceReport';
import AdminUserApprovalPage from './components/AdminUserApprovalPage';
import AdminDepartmentsPage from './components/AdminDepartmentsPage';
import AdminEmployeeProfilesPage from './components/AdminEmployeeProfilesPage';
import EmployeeSelfAssessmentForm from './components/EmployeeSelfAssessmentForm';
import EmployeeSelfAssessmentHistory from './components/EmployeeSelfAssessmentHistory';
import AdminSelfAssessmentManagement from './components/AdminSelfAssessmentManagement';
import AdminSelfAssessmentReviewForm from './components/AdminSelfAssessmentReviewForm';
import AdminMeetingSlotManagement from './components/AdminMeetingSlotManagement';
import EmployeeMeetingBooking from './components/EmployeeMeetingBooking';
import AdminEmployeeProfileDetailPage from './components/AdminEmployeeProfileDetailPage'; 
import Footer from './components/Footer'; 
import ContactUs from './components/ContactUs';
import AdminLayout from './layouts/AdminLayout';
import AboutUs from './components/AboutUs';
import HomePage from './components/HomePage'; 


const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loadingAuth } = useAuth();
    const userRole = user ? user.role : null;

    if (loadingAuth) {
        return <div className="loading-message">Checking authentication...</div>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
        if (userRole === 'employee') return <Navigate to="/employee-dashboard" replace />;
        return <Navigate to="/login" replace />; 
    }

    return children;
};

function HomeRedirect() {
    const { isAuthenticated, user, loadingAuth } = useAuth();
    const userRole = user ? user.role : null;
    if (loadingAuth) {
        return <div className="loading-message">Loading application...</div>;
    }
    if (isAuthenticated) {
        if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />; 
        if (userRole === 'employee') return <Navigate to="/employee-dashboard" replace />;
        return <Navigate to="/login" replace />; 
    }
  return <HomePage />;
}

function AppContent() {
    const { loadingAuth } = useAuth();
    if (loadingAuth) {
        return <div className="loading-message">Initializing HR System...</div>;
    }

    return (
        <div className="app-container">
            <Navbar />
            <div className="main-content">

            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<Navigate to="/" replace />} />

                <Route
                    path="/employee-dashboard"
                    element={
                        <PrivateRoute allowedRoles={['employee']}>
                            <EmployeeDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/employee/payslips" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeePayslipsPage />
                    </PrivateRoute>
                } />
                <Route path="/employee/payslips/:id" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeePayslipDetailPage />
                    </PrivateRoute>
                } />
                <Route path="/employee/attendance" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <div className="dashboard-container">
                            <ClockInOutButton />
                        </div>
                    </PrivateRoute>
                } />
                <Route path="/employee/meeting-booking" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeeMeetingBooking />
                    </PrivateRoute>
                } />
                <Route path="/request-leave" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <LeaveRequestForm />
                    </PrivateRoute>
                } />
                <Route path="/my-leave-history" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeeLeaveHistory />
                    </PrivateRoute>
                } />
                <Route path="/submit-self-assessment" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeeSelfAssessmentForm />
                    </PrivateRoute>
                } />
                <Route path="/my-self-assessments" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeeSelfAssessmentHistory />
                    </PrivateRoute>
                } />
                <Route path="/employee/self-assessments/:id" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <EmployeeSelfAssessmentForm />
                    </PrivateRoute>
                } />
                <Route path="/contact" element={<ContactUs />} />

                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/admin/attendance-report" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminAttendanceReport />
                    </PrivateRoute>
                } />
                <Route path="/admin/user-approvals" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminUserApprovalPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/employee-profiles" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminEmployeeProfilesPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/employee-profiles/:username" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminEmployeeProfileDetailPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/payroll-management" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminPayrollManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/leave-management" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminLeaveManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/departments" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminDepartmentsPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/self-assessments" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminSelfAssessmentManagement />
                    </PrivateRoute>
                } />
                <Route path="/admin/self-assessments/:id/review" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminSelfAssessmentReviewForm />
                    </PrivateRoute>
                } />
                <Route path="/admin/meeting-slots" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminMeetingSlotManagement />
                    </PrivateRoute>
                } />
                <Route path="/about" element={<AboutUs />} />
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
            </div>

            <Footer />
            </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;

