import { useState } from 'react';
import { ChevronUp, UserCog } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@smashmath.edu.vn', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'Giáo viên', email: 'teacher@smashmath.edu.vn', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { label: 'Học viên', email: 'student@smashmath.edu.vn', color: 'bg-mint-100 text-mint-700 border-mint-200' },
  { label: 'Phụ huynh', email: 'parent@smashmath.edu.vn', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

export default function DemoRoleSwitcher() {
  const { currentAccount, switchDemoAccount } = useAppContext();
  const [open, setOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((import.meta as any).env?.VITE_DEMO_MODE !== 'true') return null;

  const current = DEMO_ACCOUNTS.find(a => a.email === currentAccount?.email);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-52">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyển vai trò demo</p>
          </div>
          {DEMO_ACCOUNTS.map(account => (
            <button
              key={account.email}
              onClick={() => { switchDemoAccount(account.email); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left ${currentAccount?.email === account.email ? 'bg-slate-50' : ''}`}
            >
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${account.color}`}>
                {account.label}
              </span>
              {currentAccount?.email === account.email && (
                <span className="ml-auto text-mint-500 text-xs font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-full px-4 py-2.5 hover:shadow-xl transition-all"
      >
        <UserCog className="w-4 h-4 text-slate-500" />
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${current?.color ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {current?.label ?? 'Demo'}
        </span>
        <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
}
