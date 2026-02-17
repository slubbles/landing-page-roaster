'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogOut, User, Crown, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function UserNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (status === 'loading') {
    return <div className="w-7 h-7 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
        className="px-4 py-2 rounded-xl border border-zinc-700 text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer"
      >
        {session.user?.image ? (
          <img src={session.user.image} alt="" className="w-7 h-7 rounded-full border border-zinc-700" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-sm font-medium text-zinc-200 truncate">{session.user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{session.user?.email}</p>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </a>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
