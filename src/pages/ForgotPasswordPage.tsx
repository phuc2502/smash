import React, { useState, type FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  RotateCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppContext } from "../context/AppContext";

type ForgotStep = "submit" | "status" | "reset" | "success";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    submitForgotPasswordRequest,
    checkForgotPasswordRequestStatus,
    completeForgotPasswordReset
  } = useAppContext();

  // Form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<ForgotStep>("submit");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState<"pending" | "approved" | "rejected" | "none">("none");
  const [isChecking, setIsChecking] = useState(false);

  // Auto redirect timer for success screen
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleSubmitRequest = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const result = submitForgotPasswordRequest(email, name, note);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(result.message);
    setRequestStatus("pending");
    setStep("status");
  };

  const handleCheckStatus = () => {
    if (!email) {
      setErrorMessage("Vui lòng điền email để kiểm tra trạng thái.");
      return;
    }
    setIsChecking(true);
    setErrorMessage("");

    setTimeout(() => {
      const req = checkForgotPasswordRequestStatus(email);
      setIsChecking(false);
      if (req) {
        setRequestStatus(req.status);
        if (req.status === "approved") {
          setSuccessMessage("Yêu cầu của bạn đã được Admin phê duyệt! Hãy tiếp tục đặt mật khẩu mới.");
        }
      } else {
        setRequestStatus("none");
        setErrorMessage("Không tìm thấy yêu cầu đang xử lý cho email này. Vui lòng gửi yêu cầu mới.");
      }
    }, 800);
  };

  const handleResetPassword = (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (nextPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    const result = completeForgotPasswordReset(email, nextPassword);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(result.message);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-violet-200/20 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-mint-200/20 blur-[100px] mix-blend-multiply"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg z-10 space-y-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] p-10 lg:p-12 shadow-[0_40px_80px_rgba(0,101,145,0.08)] border border-white/50 relative">
          
          {/* Header Icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="pt-4 mb-8 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quên mật khẩu?</h1>
            <p className="text-slate-500 mt-3 font-medium leading-relaxed">
              {step === "submit" && "Gửi yêu cầu khôi phục lên Admin để xét duyệt cấp quyền thay đổi mật khẩu."}
              {step === "status" && "Theo dõi trạng thái xét duyệt yêu cầu khôi phục của bạn."}
              {step === "reset" && "Nhập mật khẩu mới cho tài khoản đã được phê duyệt."}
              {step === "success" && "Khôi phục tài khoản hoàn tất!"}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-rose-100 text-sm font-semibold text-rose-700 bg-rose-50/50">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {successMessage && step !== "success" && (
            <div className="mb-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-mint-100 text-sm font-semibold text-mint-700 bg-mint-50/50">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: SUBMIT REQUEST */}
            {step === "submit" && (
              <motion.form
                key="submit-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmitRequest}
                className="space-y-5"
              >
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email đăng ký của bạn</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@smashmath.edu.vn"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ và tên</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lý do khôi phục (Tùy chọn)</label>
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Tôi quên mật khẩu cũ / Trình duyệt không lưu..."
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-violet-600 text-white rounded-2xl py-4 font-bold text-base shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-3 group">
                  Gửi yêu cầu khôi phục
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setStep("status")}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700 underline"
                  >
                    Kiểm tra trạng thái yêu cầu có sẵn?
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: TRACK STATUS */}
            {step === "status" && (
              <motion.div
                key="status-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 text-center"
              >
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email cần kiểm tra</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@smashmath.edu.vn"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Status Indicator Card */}
                {requestStatus === "pending" && (
                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 text-left space-y-3 flex items-start gap-4">
                    <Clock className="w-8 h-8 text-amber-500 mt-1 shrink-0 animate-spin-slow" />
                    <div>
                      <p className="text-sm font-black text-amber-900">Yêu cầu đang chờ xét duyệt</p>
                      <p className="text-xs text-amber-700 font-semibold leading-relaxed mt-1">
                        Yêu cầu khôi phục mật khẩu của bạn đã được ghi nhận vào hệ thống. Vui lòng liên hệ Admin của trung tâm để duyệt cấp quyền đổi mật khẩu.
                      </p>
                    </div>
                  </div>
                )}

                {requestStatus === "approved" && (
                  <div className="p-6 bg-mint-50 rounded-3xl border border-mint-100 text-left space-y-3 flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-mint-500 mt-1 shrink-0 animate-bounce" />
                    <div>
                      <p className="text-sm font-black text-mint-900">Yêu cầu đã được phê duyệt!</p>
                      <p className="text-xs text-mint-700 font-semibold leading-relaxed mt-1">
                        Admin đã phê duyệt yêu cầu của bạn. Bây giờ bạn có toàn quyền đặt mật khẩu truy cập mới cho tài khoản.
                      </p>
                    </div>
                  </div>
                )}

                {requestStatus === "rejected" && (
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 text-left space-y-3 flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-rose-900">Yêu cầu bị từ chối</p>
                      <p className="text-xs text-rose-700 font-semibold leading-relaxed mt-1">
                        Admin đã từ chối yêu cầu quên mật khẩu của bạn. Vui lòng liên hệ trực tiếp văn phòng trung tâm để được hỗ trợ trực tiếp.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-2xl py-4 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                    {isChecking ? "Đang kiểm tra..." : "Cập nhật trạng thái"}
                  </button>

                  {requestStatus === "approved" && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        setStep("reset");
                      }}
                      className="flex-1 bg-violet-600 text-white rounded-2xl py-4 font-bold text-sm shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-2 group"
                    >
                      Đặt lại mật khẩu
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("submit");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-violet-600 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Gửi yêu cầu mới
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === "reset" && (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleResetPassword}
                className="space-y-5"
              >
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu mới</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="password"
                      value={nextPassword}
                      onChange={(e) => setNextPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Xác nhận mật khẩu mới</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-violet-600 text-white rounded-2xl py-4 font-bold text-base shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Cập nhật mật khẩu mới
                </button>
              </motion.form>
            )}

            {/* STEP 4: SUCCESS CONGRATULATIONS */}
            {step === "success" && (
              <motion.div
                key="success-screen"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-mint-50 text-mint-500 flex items-center justify-center mx-auto shadow-inner shadow-mint-100 border border-mint-200 animate-pulse">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">Thiết lập lại thành công!</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
                    Mật khẩu mới của bạn đã được hệ thống cập nhật thành công. Đang tự động chuyển hướng về trang Đăng nhập...
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-4 py-2 rounded-xl w-fit mx-auto">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Vui lòng chờ giây lát
                </div>

                <Link to="/login" className="block text-sm font-black text-slate-400 hover:text-violet-600 transition-colors uppercase tracking-widest underline pt-2">
                  Quay lại đăng nhập ngay
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== "success" && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">&copy; 2026 SMASH Math Center. All rights reserved.</p>
      </motion.div>
    </div>
  );
}
