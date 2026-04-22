import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, EyeOff, ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vw] rounded-full bg-mint-200/20 blur-[120px] mix-blend-multiply opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-slate-200/20 blur-[100px] mix-blend-multiply opacity-50"></div>
      </div>

      <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side - Welcome */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md px-5 py-2 rounded-2xl border border-white/50 shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-mint-500 flex items-center justify-center text-white">
              <Zap className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-sm font-bold text-mint-700 uppercase tracking-widest">SMASH Math Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            Đột phá <span className="text-mint-600 italic">Tư duy</span> <br /> Chinh phục Toán học.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-xl leading-relaxed"
          >
            Chào mừng đến với SMASH Math Center. Nền tảng quản lý chuyên sâu giúp tối ưu hóa việc dạy và học Toán học với phương pháp hiện đại và trực quan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6 pt-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/64/64`}
                  className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                  alt="Avatar"
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Hơn <span className="text-slate-900">10,000</span> học giả <br /> đang sử dụng
            </p>
          </motion.div>
        </div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-[480px]"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-10 lg:p-12 shadow-[0_40px_80px_rgba(47,82,61,0.08)] border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mint-400 via-mint-500 to-mint-400 animate-gradient-x"></div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Đăng nhập</h2>
              <p className="text-slate-500 mt-2 font-medium">Truy cập vào hệ thống của bạn</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email học thuật</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-mint-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="ten.ho@vien.edu.vn"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-mint-500/20 transition-all outline-none font-medium placeholder:text-slate-400 italic"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Mật khẩu</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-mint-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 focus:ring-2 focus:ring-mint-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                    required
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    <EyeOff className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-mint-500 focus:ring-mint-500/20" />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900">Ghi nhớ</span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-mint-600 hover:text-mint-700 transition-colors">Quên mật khẩu?</Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-mint-200 hover:shadow-2xl hover:shadow-mint-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group"
              >
                Tiếp tục
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-slate-500">
                Gặp khó khăn? <Link to="#" className="text-mint-600 border-b-2 border-mint-600/20 hover:border-mint-600 pb-0.5 transition-all">Liên hệ Quản trị viên</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
