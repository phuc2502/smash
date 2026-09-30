import { useNavigate } from "react-router-dom";
import { LogOut, Zap } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import NavMenu from "./NavMenu";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAppContext();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white/95 shadow-[4px_0_18px_rgba(148,163,184,0.12)] backdrop-blur-xl flex flex-col py-8 z-40 hidden md:flex">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-mint-600 to-mint-500 flex items-center justify-center text-white shadow-lg shadow-mint-200/70">
          <Zap className="w-6 h-6" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-lg font-black text-mint-800 tracking-tight leading-none">SMASH Math</h1>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-1 px-0.5">Education Center</p>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto">
        <NavMenu />
      </div>

      <div className="px-4 mt-auto">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
