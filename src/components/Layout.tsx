import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';
import bgImage from '../assets/background.jpg';

const Layout: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-cover  bg-no-repeat flex"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col bg-white/70 backdrop-blur-sm">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
