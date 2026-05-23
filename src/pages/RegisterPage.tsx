import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";

export default function RegisterPage() {
  const { registerAccountRequest } = useAppContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Nhân viên hành chính",
    accountType: "personal" as "personal" | "group",
    note: "",
  });
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = registerAccountRequest(formData);
    setFeedback({ tone: result.success ? "success" : "error", message: result.message });
    if (result.success) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Nhân viên hành chính",
        accountType: "personal",
        note: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 md:p-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Đăng ký tài khoản</h1>
            <p className="text-sm text-slate-500">Yêu cầu sẽ được chủ trung tâm hoặc quản lý xét duyệt trước khi kích hoạt.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Họ và tên" value={formData.name} onChange={(event) => setFormData(prev => ({ ...prev, name: event.target.value }))} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-mint-500/20" />
            <input required type="email" placeholder="Email nội bộ" value={formData.email} onChange={(event) => setFormData(prev => ({ ...prev, email: event.target.value }))} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-mint-500/20" />
            <input required placeholder="Số điện thoại" value={formData.phone} onChange={(event) => setFormData(prev => ({ ...prev, phone: event.target.value }))} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-mint-500/20" />
            <select required value={formData.role} onChange={(event) => setFormData(prev => ({ ...prev, role: event.target.value }))} className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-mint-500/20">
              <option>Nhân viên hành chính</option>
              <option>Admin</option>
              <option>Giáo viên</option>
              <option>Học viên</option>
              <option>Phụ huynh</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <input type="radio" checked={formData.accountType === "personal"} onChange={() => setFormData(prev => ({ ...prev, accountType: "personal" }))} />
              <div>
                <p className="font-semibold text-slate-900">Tài khoản cá nhân</p>
                <p className="text-xs text-slate-500">Dành cho thao tác cần truy vết.</p>
              </div>
            </label>
            <label className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
              <input type="radio" checked={formData.accountType === "group"} onChange={() => setFormData(prev => ({ ...prev, accountType: "group" }))} />
              <div>
                <p className="font-semibold text-slate-900">Tài khoản nhóm</p>
                <p className="text-xs text-slate-500">Dùng cho thiết bị chung tại quầy/lớp học.</p>
              </div>
            </label>
          </div>

          <textarea rows={3} placeholder="Ghi chú thêm (tùy chọn)" value={formData.note} onChange={(event) => setFormData(prev => ({ ...prev, note: event.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-mint-500/20" />

          {feedback && (
            <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${feedback.tone === "success" ? "bg-mint-50 text-mint-700 border border-mint-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {feedback.message}
            </p>
          )}

          <button type="submit" className="w-full py-3.5 rounded-2xl bg-mint-600 hover:bg-mint-700 text-white font-bold flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Gửi yêu cầu đăng ký
          </button>
        </form>

        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-mint-600">
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>
      </motion.div>
    </div>
  );
}
