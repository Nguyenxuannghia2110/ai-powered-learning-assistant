import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-canvas text-ink overflow-hidden">
      {/* Sidebar - Cố định */}
      <AdminSidebar />

      {/* Vùng nội dung chính - Cuộn độc lập */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
