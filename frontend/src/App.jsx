import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import TranscriptGenerator from './pages/TranscriptGenerator';
import SceneGenerator from './pages/SceneGenerator';
import Settings from './pages/Settings';
import MobileSimulator from './pages/MobileSimulator';

const queryClient = new QueryClient();

const AppContent = () => {
  const { loading, serverWaking } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-gray-200 flex flex-col items-center justify-center font-sans p-6 select-none">
        <div className="relative flex flex-col items-center justify-center max-w-sm w-full text-center space-y-6">
          {/* Glowing pulse rings */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_24px_rgba(99,102,241,0.5)] animate-pulse flex items-center justify-center">
              <svg className="h-8 w-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              {serverWaking ? "Waking Up Cloud Server" : "Initializing Session"}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              {serverWaking 
                ? "Our free-tier cloud host goes to sleep after inactivity. Waking up the server now (this can take up to 45 seconds)..." 
                : "Connecting to secure API services and restoring your session..."}
            </p>
          </div>
          
          {serverWaking && (
            <div className="w-full bg-gray-950/60 p-0.5 rounded-full border border-gray-800/80 overflow-hidden h-1.5 relative">
              <div className="h-full bg-indigo-600 rounded-full animate-loading-bar"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/mobile-simulator" element={<MobileSimulator />} />

        {/* Protected Workspace Routes wrapped in Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transcript"
          element={
            <ProtectedRoute>
              <Layout>
                <TranscriptGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenes"
          element={
            <ProtectedRoute>
              <Layout>
                <SceneGenerator />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#09090b',
              color: '#f4f4f5',
              border: '1px solid #27272a',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
