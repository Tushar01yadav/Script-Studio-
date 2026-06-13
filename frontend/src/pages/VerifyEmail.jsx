import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const triggerVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Failed to verify email.');
      }
    };
    
    triggerVerification();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md text-center rounded-2xl saas-card p-8">
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <h2 className="text-xl font-semibold text-white">Verifying Email...</h2>
            <p className="text-gray-400 text-sm">Please wait while we confirm your account token.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
            <p className="text-gray-400 text-sm">Your email address has been successfully verified. You can now use all functions of YouTube Script Studio.</p>
            <Link
              to="/login"
              className="inline-block rounded-lg btn-primary px-6 py-2.5 text-sm font-semibold"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-gray-400 text-sm">{message}</p>
            <Link
              to="/login"
              className="inline-block rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
