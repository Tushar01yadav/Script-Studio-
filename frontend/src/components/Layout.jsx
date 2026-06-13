import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  FilmIcon, 
  Cog6ToothIcon, 
  ArrowLeftStartOnRectangleIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar resizable & collapsible states
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar_width');
    return saved ? parseInt(saved, 10) : 256;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const startResizing = (e) => {
    e.preventDefault();
    setIsDragging(true);
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = Math.max(180, Math.min(450, e.clientX));
    setSidebarWidth(newWidth);
    localStorage.setItem('sidebar_width', newWidth.toString());
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', next.toString());
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Transcript Generator', path: '/transcript', icon: DocumentTextIcon },
    { name: 'Scene Generator', path: '/scenes', icon: FilmIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  if (!isMobile && window.self === window.top) {
    navItems.push({ name: 'Mobile Simulator', path: '/mobile-simulator', icon: DevicePhoneMobileIcon });
  }

  const currentWidth = isCollapsed ? 64 : sidebarWidth;

  return (
    <div className="flex min-h-screen bg-[#09090b] text-gray-200 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <aside 
          className={`fixed inset-y-0 left-0 flex flex-col saas-panel select-none ${
            isDragging ? '' : 'transition-[width] duration-200 ease-out'
          } z-20`}
          style={{ width: `${currentWidth}px` }}
        >
          {/* Logo area */}
          <div className={`flex h-16 items-center justify-center border-b border-gray-800/40 ${isCollapsed ? 'px-2' : 'px-6'}`}>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <svg className="h-6 w-6 text-red-500 fill-current drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.018 0 12 0 12s0 3.982.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.553 9.388.553 9.388.553s7.53 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.982 24 12 24 12s0-3.982-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {!isCollapsed && (
                <span className="text-xl font-extrabold tracking-wider text-white truncate">
                  SCRIPT STUDIO
                </span>
              )}
            </Link>
          </div>

          {/* Navigation list */}
          <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const searchParams = new URLSearchParams(location.search);
              const projectId = searchParams.get('project');
              const linkTarget = projectId && item.path !== '/'
                ? `${item.path}?project=${projectId}`
                : item.path;

              return (
                <Link
                  key={item.name}
                  to={linkTarget}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-150 ${
                    isCollapsed ? 'justify-center px-1' : 'px-4'
                  } ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User profile with Dropdown Popup Menu */}
          <div className="relative group/profile">
            {user && (
              <>
                <button
                  type="button"
                  className={`flex items-center rounded-lg bg-gray-900/30 hover:bg-white/5 border border-white/5 p-2 gap-3 cursor-pointer transition-all duration-200 w-full ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-sm font-bold text-white uppercase shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                    <span>{user.name.charAt(0)}</span>
                  </div>
                  
                  {/* Profile details */}
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-semibold text-white leading-tight">{user.name}</p>
                      <p className="truncate text-[10px] text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu - opens on hover */}
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-gray-800 bg-[#111113] p-1.5 shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-150 z-50">
                  <div className="px-2.5 py-1.5 border-b border-gray-800/60 mb-1">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Account</p>
                    <p className="text-xs text-white font-bold truncate mt-0.5">{user.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      toast.success("Upgrade Modal Opening... (mock)");
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-xs text-indigo-400 hover:bg-white/5 font-semibold transition-colors cursor-pointer"
                  >
                    <span className="text-sm">💎</span> Upgrade Plan
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-xs text-red-400 hover:bg-red-950/20 font-semibold transition-colors cursor-pointer"
                  >
                    <span className="text-sm">🚪</span> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Resizing border handle */}
          {!isCollapsed && (
            <div
              onMouseDown={startResizing}
              className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors z-30"
              title="Drag to resize sidebar"
            />
          )}
        </aside>
      )}

      {/* Main Content Space */}
      <div 
        className={`flex-1 flex flex-col ${isDragging ? '' : 'transition-[padding-left] duration-200 ease-out'} ${isMobile ? 'pb-20' : ''}`}
        style={{ paddingLeft: isMobile ? '0px' : `${currentWidth}px` }}
      >
        {/* Header bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-[#09090b]/95 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-gray-500 font-normal">Dashboard</span>
              <span className="text-gray-700">/</span>
              <span>Workspace</span>
            </h1>
          </div>
          {/* Topbar Action Portal Mount point */}
          <div id="topbar-actions" className="flex items-center gap-3"></div>
        </header>

        {/* Body content wrapper */}
        <main key={location.pathname} className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0d1222] border-t border-gray-800 flex items-center justify-around z-40 px-2 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const searchParams = new URLSearchParams(location.search);
            const projectId = searchParams.get('project');
            const linkTarget = projectId && item.path !== '/'
              ? `${item.path}?project=${projectId}`
              : item.path;

            return (
              <Link
                key={item.name}
                to={linkTarget}
                className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-indigo-400 font-bold scale-105'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-5.5 w-5.5 mb-0.5" />
                <span className="truncate max-w-[70px]">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
          {user && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-gray-400 hover:text-red-400 cursor-pointer"
              title="Sign Out"
            >
              <ArrowLeftStartOnRectangleIcon className="h-5.5 w-5.5 mb-0.5" />
              <span>Logout</span>
            </button>
          )}
        </nav>
      )}
    </div>
  );
};

export default Layout;
