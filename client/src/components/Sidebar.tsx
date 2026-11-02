import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AutoPostLogo } from './AutoPostLogo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Users },
    { name: 'Scheduler', path: '/scheduler', icon: Calendar },
    { name: 'AI Composer', path: '/ai-composer', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-indigo-100/80 flex flex-col justify-between shadow-xl shadow-indigo-950/5 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & Brand */}
        <div>
          <div className="h-20 px-6 flex items-center border-b border-indigo-100/70">
            <AutoPostLogo variant="dark" size="sm" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#5c4ce9] to-[#5143e2] text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-600 hover:text-indigo-950 hover:bg-indigo-50/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-[#5c4ce9]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Logout */}
        <div className="p-4 border-t border-indigo-100/70">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50/80 transition group cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-red-500 transition" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
