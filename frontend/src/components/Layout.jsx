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
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Transcript Generator', path: '/transcript', icon: DocumentTextIcon },
    { name: 'Scene Generator', path: '/scenes', icon: FilmIcon },
    { name: 'Settings', path: '/settings', icon: Cog6ToothIcon },
  ];

  if (window.self === window.top) {
    navItems.push({ name: 'Mobile Simulator', path: '/mobile-simulator', icon: DevicePhoneMobileIcon });
  }

  const currentWidth = isCollapsed ? 64 : sidebarWidth;

  return (
    <div className="flex min-h-screen bg-[#070a13] text-gray-200 overflow-x-hidden">
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <aside 
          className={`fixed inset-y-0 left-0 flex flex-col border-r border-gray-800 bg-[#0d1222] select-none ${
            isDragging ? '' : 'transition-[width] duration-200 ease-out'
          } z-20`}
          style={{ width: `${currentWidth}px` }}
        >
          {/* Logo area */}
          <div className={`flex h-16 items-center justify-center border-b border-gray-800 ${isCollapsed ? 'px-2' : 'px-6'}`}>
            <Link to="/" className="flex items-center gap-2.5">
              <svg className="h-6 w-6 text-red-500 fill-current drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.018 0 12 0 12s0 3.982.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.553 9.388.553 9.388.553s7.53 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.982 24 12 24 12s0-3.982-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {!isCollapsed && (
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(99,102,241,0.25)] truncate">
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
                  className={`flex items-center gap-3 rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? 'justify-center px-1' : 'px-4'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/10 border border-indigo-500/10'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User profile & Logout bottom (integrated on hover) */}
          <div className={`border-t border-gray-800 ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {user && (
              <div 
                onClick={handleLogout}
                className={`group relative flex items-center rounded-lg bg-gray-900/50 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 cursor-pointer transition-all duration-200 ${
                  isCollapsed ? 'p-1.5 justify-center' : 'p-3 gap-3'
                }`}
                title="Click to Sign Out"
              >
                {/* Avatar / Hover Logout Icon */}
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-sm font-bold text-white uppercase shadow-[0_0_8px_rgba(99,102,241,0.3)] group-hover:from-red-600 group-hover:to-red-700 transition-all duration-200">
                  <span className="group-hover:hidden">{user.name.charAt(0)}</span>
                  <ArrowLeftStartOnRectangleIcon className="hidden group-hover:block h-5 w-5 text-white" />
                </div>
                
                {/* Profile details & Slide-in Logout text */}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 relative overflow-hidden h-9">
                    {/* Normal Details */}
                    <div className="absolute inset-0 flex flex-col justify-center transition-all duration-300 transform group-hover:-translate-y-full opacity-100 group-hover:opacity-0">
                      <p className="truncate text-sm font-semibold text-white leading-tight">{user.name}</p>
                      <p className="truncate text-xs text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                    {/* Logout Text (visible on hover) */}
                    <div className="absolute inset-0 flex items-center justify-start gap-2 text-sm font-bold text-red-400 transition-all duration-300 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <span>Sign Out</span>
                    </div>
                  </div>
                )}
              </div>
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-800/80 bg-[#070a13]/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Studio Dashboard'}
            </h1>
          </div>
          {user && !user.is_verified && (
            <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 md:px-4 py-1.5 text-[10px] md:text-xs text-yellow-400 truncate max-w-[120px] sm:max-w-none">
              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping shrink-0"></span>
              <span className="truncate">Verify email</span>
            </div>
          )}
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
