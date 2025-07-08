import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../components/EmployeeSidebar'; 
import '../styles/EmployeeLayout.css'; 

export default function EmployeeLayout() {
  return (
    <div className="employee-layout">
      <EmployeeSidebar />
      <main className="employee-content">
        <Outlet />
      </main>
    </div>
  );
}
