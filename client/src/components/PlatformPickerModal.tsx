import React from 'react';
import { X } from 'lucide-react';

interface PlatformPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (platform: string) => void;
}

// Brand SVG Icons
const TwitterIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.92 0 1.67-.75 1.67-1.67a1.67 1.67 0 1 0-3.34 0c0 .92.75 1.67 1.67 1.67m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const platforms = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    color: 'hover:border-sky-500 hover:text-sky-400 hover:bg-sky-500/10',
    iconColor: 'text-sky-400',
    icon: TwitterIcon,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: 'hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10',
    iconColor: 'text-blue-400',
    icon: LinkedInIcon,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: 'hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    icon: FacebookIcon,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: 'hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/10',
    iconColor: 'text-pink-400',
    icon: InstagramIcon,
  },
];

const PlatformPickerModal: React.FC<PlatformPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Connect a Social Account</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select a network to authorize via OAuth</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 gap-3.5 my-6">
          {platforms.map((plat) => {
            const Icon = plat.icon;
            return (
              <button
                key={plat.id}
                onClick={() => {
                  onSelect(plat.id);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-200 transition-all duration-200 group active:scale-95 ${plat.color}`}
              >
                <div className={`p-2.5 rounded-xl bg-slate-900 group-hover:scale-110 transition ${plat.iconColor}`}>
                  <Icon />
                </div>
                <span className="text-xs font-bold tracking-wide">{plat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500">
          You will be redirected to the provider to authorize access securely.
        </p>
      </div>
    </div>
  );
};

export default PlatformPickerModal;
