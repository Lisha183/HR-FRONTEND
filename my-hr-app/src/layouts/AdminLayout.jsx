import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}
