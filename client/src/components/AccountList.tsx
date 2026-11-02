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
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'linkedin':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'facebook':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'instagram':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    default:
      return 'bg-purple-50 text-purple-700 border-purple-200';
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
      <div className="text-center py-16 px-4 bg-white border-2 border-dashed border-indigo-200/80 rounded-3xl shadow-sm">
        <div className="p-3 bg-orange-50 text-[#f97316] rounded-full w-fit mx-auto mb-3.5">
          <Share2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-indigo-950">No accounts connected yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
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
          className="bg-white border border-indigo-100/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-950/5 rounded-3xl p-6 shadow-sm transition-all duration-300 flex flex-col justify-between"
        >
          {/* Top row: Avatar & Handle & Platform Badge */}
          <div className="flex items-start gap-3.5">
            {acc.avatarUrl ? (
              <img
                src={acc.avatarUrl}
                alt={acc.handle}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100 shrink-0 shadow-xs"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#5c4ce9] to-[#7c3aed] flex items-center justify-center font-bold text-white text-base uppercase shrink-0 shadow-sm">
                {acc.platform.charAt(0)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getPlatformBadgeColor(
                    acc.platform
                  )}`}
                >
                  {acc.platform}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  Connected
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-indigo-950 truncate mt-1">
                @{acc.handle}
              </h4>
            </div>
          </div>

          {/* Bottom row: Disconnect button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => handleConfirmDisconnect(acc._id, acc.handle, acc.platform)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 transition active:scale-95 border border-red-100 cursor-pointer"
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
