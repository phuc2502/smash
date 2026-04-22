import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setMessage(`Da gui ma xac nhan toi ${email}. Vui long kiem tra hop thu.`);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-mint-200/20 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-mint-200/20 blur-[100px] mix-blend-multiply"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10 space-y-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-10 lg:p-12 shadow-[0_40px_80px_rgba(0,101,145,0.08)] border border-white/50 text-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-mint-500 flex items-center justify-center text-white shadow-lg shadow-mint-200">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="pt-4 mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quen mat khau?</h1>
            <p className="text-slate-500 mt-3 font-medium leading-relaxed">
              Vui long nhap email da dang ky de nhan ma khoi phuc tai khoan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email cua ban</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-mint-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@smashmath.edu.vn"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-mint-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            {message && (
              <p className="text-sm text-mint-700 bg-mint-50 border border-mint-100 rounded-xl px-4 py-3 font-semibold text-left">
                {message}
              </p>
            )}

            <button type="submit" className="w-full bg-mint-600 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-mint-200 hover:bg-mint-700 transition-all flex items-center justify-center gap-3 group">
              Gui ma xac nhan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-mint-600 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quay lai dang nhap
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">&copy; 2024 SMASH Math Center. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
