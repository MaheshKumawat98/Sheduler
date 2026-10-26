import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine page title based on current pathname
  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/accounts':
        return 'Connected Accounts';
      case '/scheduler':
        return 'Post Scheduler';
      case '/ai-composer':
        return 'AI Composer';
      default:
        return 'Social Media Platform';
    }
  };

  const title = getPageTitle(location.pathname);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & dynamic page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      {/* Right: User name & circle avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-100 leading-none">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-none">
            {user?.email || ''}
          </p>
        </div>

        {/* Colored Circle Avatar with first letter */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-900/30 ring-2 ring-purple-500/30">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
