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


const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const userRole = user ? user.role : null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        if (userRole === 'employee') return <Navigate to="/employee-dashboard" replace />;
        if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

function HomeRedirect() {
    const { isAuthenticated, user } = useAuth();
    const userRole = user ? user.role : null;

    console.log("HomeRedirect rendering:");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  user:", user);
    console.log("  userRole:", userRole);

    if (isAuthenticated) {
        if (userRole === 'admin') return <Navigate to="/admin-dashboard" />;
        if (userRole === 'employee') return <Navigate to="/employee-dashboard" />;
    }

    return <Login />;
}

function AppContent() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<HomeRedirect />} />

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
                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/admin/payroll-management" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminPayrollManagement />
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
                <Route path="/admin/leave-management" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminLeaveManagement />
                    </PrivateRoute>
                } />

                <Route path="/employee/attendance" element={
                    <PrivateRoute allowedRoles={['employee']}>
                        <div className="dashboard-container">
                            <ClockInOutButton />
                        </div>
                    </PrivateRoute>
                } />
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

                <Route path="/admin/departments" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminDepartmentsPage />
                    </PrivateRoute>
                } />
                <Route path="/admin/employee-profiles" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminEmployeeProfilesPage />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
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
