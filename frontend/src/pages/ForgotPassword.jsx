import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Password reset email sent if account exists.');
    } catch (err) {
      toast.error('Failed to trigger reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md rounded-2xl saas-card p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-400">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {success ? (
          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
              If the account exists, we have sent a reset password link to your inbox.
            </p>
            <Link to="/login" className="inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-2.5 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg btn-primary py-2.5 text-sm font-semibold focus:outline-none disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <Link to="/login" className="font-semibold text-gray-400 hover:text-white">
                Cancel and back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
