import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Activity,
  KeyRound,
  X,
  Edit3,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../../context/AppContext";

type AccountPanel = "profile" | "activity" | "password" | "settings";

export default function TopNavbar() {
  const navigate = useNavigate();
  const {
    currentAccount,
    accountActivities,
    accountPreferences,
    updateAccountPreferences,
    updateAccountProfile,
    changePassword,
    logout,
  } = useAppContext();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<AccountPanel | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: currentAccount?.name ?? "",
    email: currentAccount?.email ?? "",
    phone: currentAccount?.phone ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", nextPassword: "" });
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!activeModal || !currentAccount) return;
    setFeedback(null);

    if (activeModal === "profile") {
      setProfileForm({ name: currentAccount.name, email: currentAccount.email, phone: currentAccount.phone });
    }

    if (activeModal === "password") {
      setPasswordForm({ currentPassword: "", nextPassword: "" });
    }
  }, [activeModal, currentAccount]);

  const menuItems = [
    { id: "profile" as const, icon: User, label: "Thông tin cá nhân", detail: "Xem và cập nhật hồ sơ" },
    { id: "activity" as const, icon: Activity, label: "Hoạt động của tôi", detail: "Lịch sử tương tác hệ thống" },
    { id: "password" as const, icon: KeyRound, label: "Đổi mật khẩu", detail: "Bảo mật tài khoản SMASH" },
    { id: "settings" as const, icon: Settings, label: "Cài đặt hệ thống", detail: "Cấu hình tùy chọn hiển thị" },
  ];

  const panelTitle = useMemo(() => {
    if (activeModal === "profile") return "Chỉnh sửa hồ sơ";
    if (activeModal === "activity") return "Nhật ký hoạt động";
    if (activeModal === "password") return "Thiết lập bảo mật";
    if (activeModal === "settings") return "Cấu hình hệ thống";
    return "";
  }, [activeModal]);

  const handleMenuClick = (panel: AccountPanel) => {
    setActiveModal(panel);
    setIsAccountOpen(false);
  };

  const handleLogout = () => {
    setIsAccountOpen(false);
    setActiveModal(null);
    logout();
    navigate("/login", { replace: true });
  };

  const handleSaveProfile = () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setFeedback({ tone: "error", message: "Vui lòng nhập đầy đủ họ tên và email." });
      return;
    }

    updateAccountProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });

    setFeedback({ tone: "success", message: "Đã cập nhật hồ sơ thành công." });
  };

  const handleSavePassword = () => {
    const result = changePassword(passwordForm.currentPassword, passwordForm.nextPassword);
    setFeedback({ tone: result.success ? "success" : "error", message: result.message });
    if (result.success) setPasswordForm({ currentPassword: "", nextPassword: "" });
  };

  if (!currentAccount) return null;

  return (
    <motion.header
      initial={false}
      animate={{
        height: isScrolled ? "64px" : "80px",
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.7)",
      }}
      className="fixed top-0 right-0 z-30 backdrop-blur-xl border-b border-slate-200/50 w-full md:w-[calc(100%-16rem)] px-8 flex items-center justify-between shadow-sm transition-colors duration-300"
    >
      <div className="flex-1 max-w-xl">
        <motion.div animate={{ scale: isScrolled ? 0.98 : 1 }} className="relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-mint-600 transition-colors z-10" />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu, học viên, Toán lớp 6,7,8,9..."
            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm placeholder:text-slate-400 font-medium text-slate-800 focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 focus:bg-white transition-all outline-none shadow-sm group-hover:border-slate-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 group-focus-within:opacity-0 transition-opacity">
            <span className="text-[10px] font-black text-slate-400">Ctrl</span>
            <span className="text-[10px] font-black text-slate-400">K</span>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors hidden sm:flex">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsAccountOpen(value => !value)}
            className={`flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group px-2 py-1.5 rounded-2xl transition-all ${isAccountOpen ? "bg-mint-50" : "hover:bg-slate-50"}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none group-hover:text-mint-600 transition-colors">{currentAccount.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{currentAccount.roleTitle}</p>
            </div>
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-all shadow-sm ${isAccountOpen ? "ring-mint-400" : "ring-mint-50 group-hover:ring-mint-100"}`}>
                <img src={currentAccount.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-mint-500 border-2 border-white rounded-full"></div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 lg:block hidden transition-transform duration-300 ${isAccountOpen ? "rotate-180 text-mint-600" : "group-hover:text-slate-600"}`} />
          </div>

          <AnimatePresence>
            {isAccountOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 p-2"
              >
                <div className="p-4 bg-mint-50/50 rounded-[24px] mb-2 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white shadow-sm">
                    <img src={currentAccount.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{currentAccount.name}</h4>
                    <div className="flex items-center gap-1 text-[10px] font-black text-mint-600 uppercase tracking-widest mt-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Role {currentAccount.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button key={item.id} onClick={() => handleMenuClick(item.id)} className="w-full flex items-center gap-4 p-3.5 rounded-[20px] hover:bg-slate-50 transition-all group/item text-left">
                      <div className="w-10 h-10 rounded-[14px] bg-mint-50 text-mint-500 flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:rotate-3">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 group-hover/item:text-mint-600 transition-colors uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.detail}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3.5 rounded-[20px] hover:bg-rose-50 transition-all group/logout text-left">
                    <div className="w-10 h-10 rounded-[14px] bg-rose-50 text-rose-500 flex items-center justify-center transition-all group-hover/logout:scale-110 group-hover/logout:-rotate-3">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-rose-600 uppercase tracking-tight">Đăng xuất</p>
                      <p className="text-[10px] font-medium text-rose-400 mt-0.5">Kết thúc phiên làm việc</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></motion.div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[20px] bg-mint-500 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                    {activeModal === "profile" && <User className="w-6 h-6" />}
                    {activeModal === "activity" && <Activity className="w-6 h-6" />}
                    {activeModal === "password" && <KeyRound className="w-6 h-6" />}
                    {activeModal === "settings" && <Settings className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{panelTitle}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Tài khoản SMASH</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                {activeModal === "profile" && (
                  <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4 pb-4">
                      <div className="relative group cursor-pointer">
                        <div className="w-28 h-28 rounded-[36px] overflow-hidden ring-4 ring-slate-50 shadow-inner">
                          <img src={currentAccount.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-mint-600/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[36px] flex items-center justify-center">
                          <Edit3 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Họ và tên</label>
                        <input type="text" value={profileForm.name} onChange={(event) => setProfileForm(prev => ({ ...prev, name: event.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Email</label>
                        <input type="email" value={profileForm.email} onChange={(event) => setProfileForm(prev => ({ ...prev, email: event.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Số điện thoại</label>
                        <input type="text" value={profileForm.phone} onChange={(event) => setProfileForm(prev => ({ ...prev, phone: event.target.value }))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === "activity" && (
                  <div className="space-y-6">
                    {accountActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 p-5 rounded-[24px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group relative overflow-hidden">
                        <div className={`shrink-0 w-12 h-12 rounded-[18px] ${activity.tone === "mint" ? "bg-mint-50 text-mint-500" : "bg-slate-50 text-slate-500"} flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all`}>
                          <Clock className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-900">{activity.title}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-1">{activity.description}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-3">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === "password" && (
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Mật khẩu cũ</label>
                        <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm(prev => ({ ...prev, currentPassword: event.target.value }))} placeholder="********" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-mint-500 uppercase tracking-[0.2em] ml-1">Mật khẩu mới</label>
                        <input type="password" value={passwordForm.nextPassword} onChange={(event) => setPasswordForm(prev => ({ ...prev, nextPassword: event.target.value }))} placeholder="********" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === "settings" && (
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                        <div>
                          <p className="text-sm font-black text-slate-900">Dark mode</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Chế độ tối</p>
                        </div>
                        <button onClick={() => updateAccountPreferences({ darkMode: !accountPreferences.darkMode })} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${accountPreferences.darkMode ? "bg-mint-600" : "bg-slate-200"}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${accountPreferences.darkMode ? "translate-x-6" : ""}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                        <div>
                          <p className="text-sm font-black text-slate-900">Email report</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Nhận tóm tắt công việc</p>
                        </div>
                        <button onClick={() => updateAccountPreferences({ emailReports: !accountPreferences.emailReports })} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${accountPreferences.emailReports ? "bg-mint-600" : "bg-slate-200"}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${accountPreferences.emailReports ? "translate-x-6" : ""}`}></div>
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all">
                        <div>
                          <p className="text-sm font-black text-slate-900">Sound notification</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Nhắc nhở khi có bài tập mới</p>
                        </div>
                        <button onClick={() => updateAccountPreferences({ soundNotifications: !accountPreferences.soundNotifications })} className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${accountPreferences.soundNotifications ? "bg-mint-600" : "bg-slate-200"}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${accountPreferences.soundNotifications ? "translate-x-6" : ""}`}></div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => updateAccountPreferences({ language: "vi" })} className={`py-4 rounded-2xl text-xs font-black tracking-widest uppercase border-2 ${accountPreferences.language === "vi" ? "bg-mint-50 border-mint-600 text-mint-600" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                        Tiếng Việt
                      </button>
                      <button onClick={() => updateAccountPreferences({ language: "en" })} className={`py-4 rounded-2xl text-xs font-black tracking-widest uppercase border-2 ${accountPreferences.language === "en" ? "bg-mint-50 border-mint-600 text-mint-600" : "bg-slate-50 border-slate-100 text-slate-400"}`}>
                        English
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col gap-3">
                {feedback && (
                  <p className={`text-xs px-4 py-3 rounded-2xl border font-semibold ${feedback.tone === "success" ? "text-mint-700 bg-mint-50 border-mint-100" : "text-rose-700 bg-rose-50 border-rose-100"}`}>
                    {feedback.message}
                  </p>
                )}

                {activeModal === "profile" || activeModal === "password" ? (
                  <div className="flex gap-4">
                    <button onClick={() => setActiveModal(null)} className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                      Hủy bỏ
                    </button>
                    <button onClick={activeModal === "profile" ? handleSaveProfile : handleSavePassword} className="flex-[2] py-4 bg-mint-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-mint-100 hover:bg-mint-700 transition-all">
                      Lưu thông tin
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setActiveModal(null)} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                    Đóng cửa sổ
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
