import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Edit3, Mail, Phone, ShieldCheck, UserCircle, Briefcase, CheckCircle2 } from "lucide-react";
import { User } from "../../context/AppContext";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (id: string, updatedFields: Partial<User>) => { success: boolean; message: string } | any;
}

export default function EditUserModal({ isOpen, onClose, user, onSubmit }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Học sinh" as User['role'],
    status: "Đang học" as User['status']
  });
  const [error, setError] = useState<string | null>(null);

  // Pre-fill data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const roles: { value: User['role']; color: string; icon: any }[] = [
    { value: "Học sinh", color: "mint", icon: UserCircle },
    { value: "Giáo viên", color: "mint", icon: Briefcase },
    { value: "Phụ huynh", color: "mint", icon: ShieldCheck },
    { value: "Quản trị", color: "rose", icon: CheckCircle2 },
  ];

  const statuses: User['status'][] = ["Đang học", "Đang làm việc", "Khóa", "Nghỉ học"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);

    // Map colors
    const roleColors: Record<User['role'], string> = {
      "Học sinh": "mint",
      "Giáo viên": "mint",
      "Phụ huynh": "mint",
      "Quản trị": "rose"
    };

    const statusColors: Record<User['status'], string> = {
      "Đang học": "mint",
      "Đang làm việc": "mint",
      "Khóa": "rose",
      "Nghỉ học": "slate"
    };

    const result = onSubmit(user.id, {
      ...formData,
      roleColor: roleColors[formData.role],
      statusColor: statusColors[formData.status],
      activity: "Vừa cập nhật thông tin"
    });

    if (result && !result.success) {
      setError(result.message);
      return;
    }

    onClose();
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Chỉnh sửa Thành viên</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Cập nhật thông tin ID: {user.id}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-600 font-bold leading-relaxed flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-mint-500 transition-colors" />
                    <input
                      required
                      type="text"
                      placeholder="VD: Nguyễn Văn A"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contact Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email liên hệ</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-mint-500 transition-colors" />
                      <input
                        required
                        type="email"
                        placeholder="example@edu.vn"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-11 pr-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-mint-500 transition-colors" />
                      <input
                        required
                        type="tel"
                        placeholder="09xx xxx xxx"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-11 pr-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái tài khoản</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as User['status'] })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Role Selection */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
                  <div className="grid grid-cols-4 gap-3">
                    {roles.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          const status: User['status'] = role.value === 'Giáo viên' || role.value === 'Quản trị' ? 'Đang làm việc' : 'Đang học';
                          setFormData({ ...formData, role: role.value, status });
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${formData.role === role.value
                            ? `${role.color === 'rose' ? 'bg-rose-50 border-rose-500 text-rose-600' : 'bg-mint-50 border-mint-500 text-mint-600'} scale-105 shadow-lg ${role.color === 'rose' ? 'shadow-rose-100' : 'shadow-mint-100'}`
                            : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                          }`}
                      >
                        <role.icon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{role.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all flex items-center justify-center gap-3"
                >
                  <Edit3 className="w-5 h-5 text-mint-200" />
                  Cập nhật Thông tin
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
