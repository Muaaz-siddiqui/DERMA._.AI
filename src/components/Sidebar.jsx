import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Camera, Clock, Stethoscope, MessageSquare, LogOut } from 'lucide-react';
import authService from '../services/authService';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Upload Scan', icon: Camera, path: '/upload' },
  { label: 'My History', icon: Clock, path: '/history' },
  { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
  { label: 'Chatbot', icon: MessageSquare, path: '/chat' }
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="w-[240px] h-screen bg-[#0D9488] flex flex-col fixed left-0 top-0 overflow-y-auto z-10">
      {/* Brand Section */}
      <div className="px-6 pt-8 pb-8">
        <h1 className="text-white text-2xl font-bold">Derma AI</h1>
        <p className="text-white/80 text-[10px] uppercase tracking-wider mt-1">
          Clinical Precision
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#0F766E] text-white'
                  : 'text-white/90 hover:bg-[#0F766E]/50 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 mb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/90 hover:bg-[#0F766E]/50 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
