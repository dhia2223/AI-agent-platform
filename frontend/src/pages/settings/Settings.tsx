// frontend/src/pages/settings/Settings.tsx
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/auth';
import { useToast } from '../../hooks/useToast';
import { useState } from 'react';

export function Settings() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showToast } = useToast();

  const updateEmailMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authService.updateEmail(data.email, data.password),
    onSuccess: () => {
      showToast('Email updated successfully', 'success');
      logout();
    },
    onError: (error: Error) => {
      showToast(`Email update failed: ${error.message}`, 'error');
    }
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: Error) => {
      showToast(`Password update failed: ${error.message}`, 'error');
    }
  });

  const handleEmailUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password', 'warning');
      return;
    }
    updateEmailMutation.mutate({ email, password: currentPassword });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'warning');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleEmailUpdate} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Update Email</h3>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updateEmailMutation.isLoading}
            >
              Update Email
            </Button>
          </div>
        </form>

        <form onSubmit={handlePasswordUpdate} className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Update Password</h3>
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Must be at least 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updatePasswordMutation.isLoading}
            >
              Update Password
            </Button>
          </div>
        </form>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  logout();
                  // Add account deletion API call here
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsWithBoundary() {
  return (
    <ErrorBoundary>
      <Settings />
    </ErrorBoundary>
  );
}