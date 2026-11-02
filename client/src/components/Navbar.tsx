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
        return 'Dashboard Overview';
      case '/accounts':
        return 'Connected Accounts';
      case '/scheduler':
        return 'Post Scheduler';
      case '/ai-composer':
        return 'AI Post Composer';
      default:
        return 'Social Media Platform';
    }
  };

  const title = getPageTitle(location.pathname);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 w-full bg-white/80 backdrop-blur-md border-b border-indigo-100/70 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & dynamic page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-indigo-950 hover:bg-indigo-50/70 transition focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: User name & circle avatar */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-indigo-950 leading-tight">
            {user?.name || 'User'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-tight font-medium">
            {user?.email || ''}
          </p>
        </div>

        {/* Vibrant Orange Circle Avatar with user initial */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#fb923c] to-[#f97316] text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/25 ring-2 ring-white shrink-0 select-none">
          {userInitial}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
