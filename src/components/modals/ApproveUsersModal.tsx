import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UserCheck, ShieldAlert, Check, Mail, Clock, MessageSquare, Trash2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

interface ApproveUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApproveUsersModal({ isOpen, onClose }: ApproveUsersModalProps) {
  const { userRequests, approveRequest, rejectRequest } = useAppContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-mint-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[20px] bg-mint-600 text-white flex items-center justify-center shadow-lg shadow-mint-100">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Duyệt Thành viên mới</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {userRequests.length} yêu cầu đang chờ xử lý
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {userRequests.length > 0 ? (
                userRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-slate-50 rounded-[32px] p-6 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden">
                            <img src={`https://picsum.photos/seed/${req.id}/100/100`} alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-black text-slate-900 tracking-tight">{req.name}</h4>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${req.role === 'Học sinh' ? 'bg-mint-50 text-mint-600' : 'bg-mint-50 text-mint-600'
                                }`}>
                                {req.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-slate-400">
                              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                <Mail className="w-3.5 h-3.5 italic" />
                                {req.email}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {req.requestedAt}
                              </div>
                            </div>
                          </div>
                        </div>

                        {req.note && (
                          <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-mint-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{req.note}"</p>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => approveRequest(req.id)}
                          className="flex-1 sm:w-12 sm:h-12 rounded-2xl bg-mint-500 text-white flex items-center justify-center gap-2 sm:gap-0 p-3 sm:p-0 shadow-lg shadow-mint-100 hover:bg-mint-600 transition-all group/btn"
                        >
                          <Check className="w-5 h-5" />
                          <span className="sm:hidden text-xs font-black uppercase tracking-widest">Duyệt</span>
                        </button>
                        <button
                          onClick={() => rejectRequest(req.id)}
                          className="flex-1 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 flex items-center justify-center gap-2 sm:gap-0 p-3 sm:p-0 hover:bg-rose-50 hover:text-rose-500 hover:border-transparent transition-all group/btn"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="sm:hidden text-xs font-black uppercase tracking-widest">Từ chối</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-[30px] flex items-center justify-center text-slate-200">
                    <UserCheck className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Tất cả đã hoàn tất!</h4>
                    <p className="text-sm text-slate-500 font-medium">Hiện không có yêu cầu đăng ký mới nào cần xử lý.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
                  >
                    Quay lại
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldAlert className="w-4 h-4" />
                <p className="text-[11px] font-medium italic">
                  Lưu ý: Sau khi duyệt, hệ thống sẽ tự động gửi email thông báo và mật khẩu tạm thời cho người dùng.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
