import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return toast.error('Name and email are required');
    }
    setUpdatingProfile(true);
    try {
      await updateProfile(name, email);
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile details');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error('All password fields are required');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long');
    }
    setUpdatingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "WARNING: Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone."
    );
    if (!confirmation) return;
    
    try {
      await deleteAccount();
      toast.success('Account permanently deleted.');
    } catch (err) {
      toast.error('Failed to delete account.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-1">Manage your account credentials and settings.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info block */}
        <div className="rounded-xl border border-gray-800 bg-[#0d1222]/80 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={updatingProfile}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 cursor-pointer transition-all"
            >
              {updatingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password block */}
        <div className="rounded-xl border border-gray-800 bg-[#0d1222]/80 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Update Password</h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:outline-none"
                  placeholder="Min 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:outline-none"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 cursor-pointer transition-all"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div className="rounded-xl border border-red-900/30 bg-red-950/5 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          <p className="text-sm text-gray-400">
            Deleting your account will permanently delete all projects, scripts, storyboards, and audio voiceovers from our system.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="rounded-lg bg-red-600/10 border border-red-600/30 px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-600 hover:text-white transition-all"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
