// src/components/Layout.tsx — Design Clinical Precision
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';

const Layout: React.FC = () => {
  return (
    <div className="h-screen bg-[#f2fbff] flex overflow-hidden">
      {/* Sidebar fixe */}
      <Sidebar />

      {/* Zone principale : header + contenu */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f2fbff]">
          <div className="p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
