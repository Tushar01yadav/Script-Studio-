import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success('Successfully logged in with Google!');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Google authentication failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1030247740963-hlb527q5tm8i4uium8mhkbvl5j0nmun2.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "filled_black", size: "large", width: "100%", text: "continue_with" }
        );
      }
    };

    const timer = setInterval(() => {
      if (window.google) {
        initializeGoogleSignIn();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    try {
      await login(trimmedEmail, trimmedPassword);
      if (rememberMe) {
        localStorage.setItem('remembered_email', trimmedEmail);
      } else {
        localStorage.removeItem('remembered_email');
      }
      toast.success('Successfully logged in!');
      navigate(from, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Invalid email or password';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      {/* Back to Landing */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back
      </button>

      <div className="w-full max-w-sm rounded-xl saas-card p-6 scale-95 transform-gpu origin-center">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* YouTube Logo — static gemstone variant */}
            <svg className="h-6 w-auto drop-shadow-md" viewBox="0 0 120 84" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="rubyStaticLogin" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ff8080" />
                  <stop offset="30%" stopColor="#ff1a1a" />
                  <stop offset="70%" stopColor="#d90000" />
                  <stop offset="100%" stopColor="#990000" />
                </radialGradient>
                <linearGradient id="bevelStaticLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="40%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
                </linearGradient>
              </defs>
              {/* Main faceted body */}
              <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" fill="url(#rubyStaticLogin)" />
              {/* Top specular sheen */}
              <path d="M12.727 2.492C22.058 0 59.5 0 59.5 0S96.942 0 106.273 2.492C111.41 3.861 115.522 7.974 116.892 13.111C115 18 100 24 59.5 26C19 24 4 18 2.108 13.111A12.012 12.012 0 0 1 12.727 2.492Z" fill="white" opacity="0.3" />
              {/* Sharp gemstone bevel rim */}
              <path d="M116.892 13.111C115.522 7.974 111.41 3.861 106.273 2.492C96.942 0 59.5 0 59.5 0S22.058 0 12.727 2.492A12.012 12.012 0 0 0 2.108 13.111C0 22.441 0 41.833 0 41.833S0 61.224 2.108 70.556A12.012 12.012 0 0 0 12.727 81.175C22.058 83.667 59.5 83.667 59.5 83.667S96.942 83.667 106.273 81.175a12.012 12.012 0 0 0 10.619-10.619C119 61.224 119 41.833 119 41.833S119 22.441 116.892 13.111Z" stroke="url(#bevelStaticLogin)" strokeWidth="1.5" fill="none" />
              {/* Play icon with depth shadow */}
              <path d="M47.6 59.762V23.904L78.54 41.833 47.6 59.762Z" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
            </svg>
            <h2 className="text-xl font-bold tracking-tight text-white">Script Studio</h2>
          </div>
          <p className="text-sm text-gray-400">Sign in to your creator dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-700/60 bg-gray-950/40 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-700/60 bg-gray-950/40 pl-3 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-700 bg-gray-950/40 text-indigo-500 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-450">
                Remember email
              </label>
            </div>
            
            <div className="text-xs">
              <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg btn-primary py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create an account
            </Link>
          </div>

          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800/60"></div>
            </div>
            <span className="relative bg-[#111113] px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Or
            </span>
          </div>

          <div className="relative w-full h-[44px] group">
            {/* Custom stylized Google Button — blends perfectly with SaaS theme */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-gray-700/60 bg-[#1A1A1D] group-hover:bg-[#222225] text-sm font-semibold text-white transition-colors cursor-pointer pointer-events-none">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </div>
            
            {/* Real GIS button, transparent overlay */}
            <div
              id="googleBtn"
              className="absolute inset-0 z-10 w-full h-full opacity-[0.01] [&>div]:!w-full [&_iframe]:!w-full [&_iframe]:!rounded-lg cursor-pointer"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
