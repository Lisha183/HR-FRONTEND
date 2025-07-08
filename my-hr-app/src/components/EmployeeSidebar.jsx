import React from 'react';
import { LogOut, Home, FileText, Calendar, Clipboard, CheckSquare, List } from 'lucide-react'; 

export default function EmployeeSidebar({ activeTab, setActiveTab, onLogout, isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'requestLeave', label: 'Request Leave', icon: <Calendar size={20} /> },
    { id: 'assessmentForm', label: 'Assessment Form', icon: <Clipboard size={20} /> },
    { id: 'bookMeeting', label: 'Book Meeting', icon: <Calendar size={20} /> },
    { id: 'leave-history', label: 'Leave History', icon: <List size={20} /> },
    { id: 'payslips', label: 'Payslips', icon: <FileText size={20} /> },
    { id: 'assessment-history', label: 'Assessment History', icon: <CheckSquare size={20} /> },
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
        >
          ☰
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
          }}
        >
          <LogOut size={20} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
