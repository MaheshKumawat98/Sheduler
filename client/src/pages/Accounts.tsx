import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';
import API from '../api/axios';
import AccountList from '../components/AccountList';
import type { Account } from '../components/AccountList';
import PlatformPickerModal from '../components/PlatformPickerModal';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch accounts from backend
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await API.get('/accounts');
      setAccounts(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    }
  }, []);

  // Sync accounts from Zerno
  const syncAccounts = useCallback(async () => {
    try {
      setSyncing(true);
      await API.get('/oauth/sync');
      await fetchAccounts();
      toast.success('Accounts synced successfully!');
    } catch (error: any) {
      console.error('Error syncing accounts:', error);
      toast.error('Failed to sync accounts from provider');
    } finally {
      setSyncing(false);
    }
  }, [fetchAccounts]);

  // Initial load & OAuth callback detection
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // Check if URL search params contain OAuth callback flags
      const search = window.location.search;
      if (search) {
        try {
          await API.get('/oauth/sync');
          toast.success('Social account connected and synced!');
        } catch (syncErr) {
          console.warn('OAuth sync attempt failed or already processed:', syncErr);
        } finally {
          // Clean URL params cleanly without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

      await fetchAccounts();
      setLoading(false);
    };

    init();
  }, [fetchAccounts]);

  // Handle platform selection from modal -> redirect to OAuth
  const handleConnectPlatform = async (platform: string) => {
    try {
      toast.loading(`Redirecting to ${platform.toUpperCase()}...`, { id: 'oauth-redirect' });
      const response = await API.get(`/oauth/${platform.toLowerCase()}/url`);
      const url = response.data?.url;

      if (url) {
        toast.dismiss('oauth-redirect');
        window.location.href = url;
      } else {
        toast.error('Failed to obtain authorization URL', { id: 'oauth-redirect' });
      }
    } catch (error: any) {
      console.error('Error initiating OAuth:', error);
      toast.error(
        error.response?.data?.message || `Failed to initiate ${platform} connection`,
        { id: 'oauth-redirect' }
      );
    }
  };

  // Disconnect an account
  const handleDisconnect = async (id: string) => {
    try {
      await API.delete(`/accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Account disconnected successfully');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      toast.error(error.response?.data?.message || 'Failed to disconnect account');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-500/20 border-t-purple-500" />
        <p className="mt-4 text-sm font-medium text-slate-400">Loading social accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Social Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {accounts.length} {accounts.length === 1 ? 'Connected' : 'Connected'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Connect and manage social media profiles for automated cross-platform posting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={syncAccounts}
            disabled={syncing}
            title="Sync accounts from provider"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition shadow-lg shadow-purple-900/30 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Connect Account</span>
          </button>
        </div>
      </div>

      {/* Account List */}
      <AccountList accounts={accounts} onDisconnect={handleDisconnect} />

      {/* Platform Picker Modal */}
      <PlatformPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleConnectPlatform}
      />
    </div>
  );
};

export default Accounts;
