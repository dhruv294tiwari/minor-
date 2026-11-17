import React, { useState } from 'react';
import { KeyRound, User, CheckCircle2, AlertCircle, Lock, Mail } from 'lucide-react';
import { Modal } from './Modal';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminSettingsModal = ({ isOpen, onClose }) => {
  const { admin, updateAdminState } = useAuth();
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'profile'

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Profile State
  const [username, setUsername] = useState(admin?.username || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [profLoading, setProfLoading] = useState(false);
  const [profSuccess, setProfSuccess] = useState('');
  const [profError, setProfError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccess('');
    setPwdError('');

    if (!currentPassword) {
      setPwdError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwdSuccess('Password changed successfully! Keep it safe.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setPwdError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfSuccess('');
    setProfError('');

    if (!username.trim() || !email.trim()) {
      setProfError('Username and email cannot be empty.');
      return;
    }

    setProfLoading(true);
    try {
      const res = await authApi.updateProfile({
        username: username.trim(),
        email: email.trim(),
      });
      updateAdminState(res.data);
      setProfSuccess('Profile credentials updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setProfError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setProfLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Account Settings" maxWidth="max-w-lg">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 -mt-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('password');
            setPwdError('');
            setPwdSuccess('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'password'
              ? 'border-mait-navy-800 text-mait-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            setProfError('');
            setProfSuccess('');
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-mait-navy-800 text-mait-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwdSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{pwdError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-4 py-2 bg-mait-navy-800 text-white rounded-lg text-xs font-semibold hover:bg-mait-navy-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pwdLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {profSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profSuccess}</span>
            </div>
          )}

          {profError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{profError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mait-navy-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={profLoading}
              className="px-4 py-2 bg-mait-navy-800 text-white rounded-lg text-xs font-semibold hover:bg-mait-navy-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {profLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
