import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  BellOff,
  Globe,
  Mail,
  Shield,
  KeyRound,
  User,
  Palette,
  Monitor,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function SettingsPage() {
  const {
    currentAccount,
    accountPreferences,
    updateAccountPreferences,
    updateAccountProfile,
    changePassword,
  } = useAppContext();

  const [profileForm, setProfileForm] = useState({
    name: currentAccount?.name ?? "",
    email: currentAccount?.email ?? "",
    phone: currentAccount?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
    section: string;
  } | null>(null);

  const handleSaveProfile = () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setFeedback({ tone: "error", message: "Vui lòng nhập đầy đủ họ tên và email.", section: "profile" });
      return;
    }
    updateAccountProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });
    setFeedback({ tone: "success", message: "Đã cập nhật hồ sơ thành công.", section: "profile" });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSavePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.nextPassword) {
      setFeedback({ tone: "error", message: "Vui lòng nhập đầy đủ mật khẩu.", section: "password" });
      return;
    }
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      setFeedback({ tone: "error", message: "Mật khẩu xác nhận không khớp.", section: "password" });
      return;
    }
    const result = changePassword(passwordForm.currentPassword, passwordForm.nextPassword);
    setFeedback({ tone: result.success ? "success" : "error", message: result.message, section: "password" });
    if (result.success) {
      setPasswordForm({ currentPassword: "", nextPassword: "", confirmPassword: "" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (!currentAccount) return null;

  const settingsSections = [
    {
      id: "display",
      title: "Giao diện hiển thị",
      subtitle: "Tùy chỉnh giao diện hệ thống",
      icon: Monitor,
      items: [
        {
          label: "Chế độ tối",
          detail: "Giao diện Dark mode cho mắt",
          icon: accountPreferences.darkMode ? Moon : Sun,
          value: accountPreferences.darkMode,
          onChange: () => updateAccountPreferences({ darkMode: !accountPreferences.darkMode }),
        },
      ],
    },
    {
      id: "notifications",
      title: "Thông báo",
      subtitle: "Quản lý cách nhận thông báo",
      icon: Bell,
      items: [
        {
          label: "Báo cáo qua email",
          detail: "Nhận tóm tắt công việc hàng ngày",
          icon: Mail,
          value: accountPreferences.emailReports,
          onChange: () => updateAccountPreferences({ emailReports: !accountPreferences.emailReports }),
        },
        {
          label: "Âm thanh thông báo",
          detail: "Nhắc nhở khi có bài tập mới",
          icon: accountPreferences.soundNotifications ? Bell : BellOff,
          value: accountPreferences.soundNotifications,
          onChange: () => updateAccountPreferences({ soundNotifications: !accountPreferences.soundNotifications }),
        },
      ],
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-600 to-mint-400 flex items-center justify-center text-white shadow-lg shadow-mint-200">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Quản lý tài khoản, bảo mật và tùy chọn hiển thị</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile + Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[14px] bg-mint-50 text-mint-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Thông tin cá nhân</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Chỉnh sửa hồ sơ của bạn</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                <div className="relative group cursor-pointer">
                  <div className="w-20 h-20 rounded-[24px] overflow-hidden ring-4 ring-slate-50 shadow-inner">
                    <img src={currentAccount.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-mint-600/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-black text-slate-900">{currentAccount.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{currentAccount.email}</p>
                  <p className="text-[10px] font-black text-mint-500 uppercase tracking-widest mt-1">{currentAccount.roleTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {feedback?.section === "profile" && (
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold ${
                  feedback.tone === "success"
                    ? "text-mint-700 bg-mint-50 border-mint-100"
                    : "text-rose-700 bg-rose-50 border-rose-100"
                }`}>
                  {feedback.tone === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {feedback.message}
                </div>
              )}

              <button
                onClick={handleSaveProfile}
                className="w-full py-4 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-mint-100 hover:shadow-2xl hover:shadow-mint-200 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Lưu thông tin
              </button>
            </div>
          </motion.div>

          {/* Password Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[14px] bg-rose-50 text-rose-500 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Bảo mật tài khoản</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Đổi mật khẩu đăng nhập</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-11 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrentPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={passwordForm.nextPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, nextPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNewPw ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              {feedback?.section === "password" && (
                <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-semibold ${
                  feedback.tone === "success"
                    ? "text-mint-700 bg-mint-50 border-mint-100"
                    : "text-rose-700 bg-rose-50 border-rose-100"
                }`}>
                  {feedback.tone === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {feedback.message}
                </div>
              )}

              <button
                onClick={handleSavePassword}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Cập nhật mật khẩu
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Quick Settings */}
        <div className="space-y-8">
          {settingsSections.map((section, sIdx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + sIdx * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mint-50 text-mint-500 flex items-center justify-center">
                  <section.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{section.title}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{section.subtitle}</p>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between p-4 rounded-[20px] hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-[10px] font-medium text-slate-400">{item.detail}</p>
                      </div>
                    </div>
                    <button
                      onClick={item.onChange}
                      className={`w-11 h-6 rounded-full relative transition-all shadow-inner ${
                        item.value ? "bg-mint-600" : "bg-slate-200"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                          item.value ? "translate-x-5" : ""
                        }`}
                      ></div>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Language Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-mint-50 text-mint-500 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Ngôn ngữ</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Chọn ngôn ngữ hệ thống</p>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateAccountPreferences({ language: "vi" })}
                  className={`py-4 rounded-2xl text-xs font-black tracking-widest uppercase border-2 transition-all ${
                    accountPreferences.language === "vi"
                      ? "bg-mint-50 border-mint-600 text-mint-600 shadow-lg shadow-mint-100"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  onClick={() => updateAccountPreferences({ language: "en" })}
                  className={`py-4 rounded-2xl text-xs font-black tracking-widest uppercase border-2 transition-all ${
                    accountPreferences.language === "en"
                      ? "bg-mint-50 border-mint-600 text-mint-600 shadow-lg shadow-mint-100"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
