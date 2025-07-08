import React from 'react';
import { FaBars, FaTachometerAlt, FaUsers, FaBuilding, FaCalendarAlt, FaFileInvoiceDollar, FaClipboardList, FaUserCheck, FaCalendarDay, FaSignOutAlt } from 'react-icons/fa';

export default function AdminSidebar({ activeTab, setActiveTab, onLogout, isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt size={20} /> },
    { id: 'profiles', label: 'Employee Profiles', icon: <FaUsers size={20} /> },
    { id: 'departments', label: 'Departments', icon: <FaBuilding size={20} /> },
    { id: 'leave', label: 'Leave Requests', icon: <FaCalendarAlt size={20} /> },
    { id: 'payroll', label: 'Payrolls', icon: <FaFileInvoiceDollar size={20} /> },
    { id: 'self-assessment', label: 'Assessment Management', icon: <FaClipboardList size={20} /> },
    { id: 'attendance-report', label: 'Attendance Report', icon: <FaUserCheck size={20} /> },
    { id: 'meetingSlots', label: 'Manage Meeting Slots', icon: <FaCalendarDay size={20} /> },
  ];

  return (
    <aside
      className="sidebar-container"
      style={{
        width: isCollapsed ? '70px' : '220px',
        transition: 'width 0.3s',
        background: ' #0f0c29',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            margin: '1rem auto',
            display: 'block',
        marginLeft: isCollapsed ? 'auto' : 0,
        marginRight: isCollapsed ? 'auto' : 0,
        zIndex: 1000,
          }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  width: '100%',
                  background: activeTab === item.id ? 'white' : 'transparent',
                  color: activeTab === item.id ? '#4338ca' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.3s, color 0.3s',
                }}
              >
                {item.icon}
                {!isCollapsed && item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: '1rem', textAlign: isCollapsed ? 'center' : 'left' }}>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 'bold',
          }}
        >
          <FaSignOutAlt size={20} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
