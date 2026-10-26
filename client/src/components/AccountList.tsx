import React from 'react';
import { Trash2, Share2 } from 'lucide-react';

export interface Account {
  _id: string;
  platform: string;
  handle: string;
  status: string;
  avatarUrl?: string;
}

interface AccountListProps {
  accounts: Account[];
  onDisconnect: (id: string) => void;
}

const getPlatformBadgeColor = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'linkedin':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'facebook':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'instagram':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    default:
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
};

const AccountList: React.FC<AccountListProps> = ({ accounts, onDisconnect }) => {
  const handleConfirmDisconnect = (id: string, handle: string, platform: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect @${handle} (${platform})? You will no longer be able to schedule posts to this account.`
    );
    if (confirmed) {
      onDisconnect(id);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
        <div className="p-3 bg-slate-900 rounded-full w-fit mx-auto text-slate-500 mb-3.5">
          <Share2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No accounts connected yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Connect your Twitter, LinkedIn, Facebook, or Instagram accounts to start scheduling and automating content.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {accounts.map((acc) => (
        <div
          key={acc._id}
          className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between"
        >
          {/* Top row: Avatar & Handle & Platform Badge */}
          <div className="flex items-start gap-3.5">
            {acc.avatarUrl ? (
              <img
                src={acc.avatarUrl}
                alt={acc.handle}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500/30 shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-white text-base uppercase shrink-0 shadow-inner">
                {acc.platform.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPlatformBadgeColor(
                    acc.platform
                  )}`}
                >
                  {acc.platform}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Connected
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate mt-1">
                @{acc.handle}
              </h4>
            </div>
          </div>

          {/* Bottom row: Disconnect button */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-end">
            <button
              onClick={() => handleConfirmDisconnect(acc._id, acc.handle, acc.platform)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-500/20 transition active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountList;
