import { X, MessageSquare, AlertCircle, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useAppContext, AttendanceStatus } from "../../context/AppContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
  isCorrection?: boolean;
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Có mặt",
  absent: "Vắng không phép",
  late: "Đi muộn",
  excused: "Vắng có phép",
};

export default function SMSNotificationPopup({
  isOpen,
  onClose,
  studentId,
  studentName,
  classId,
  className,
  date,
  status,
  reason,
  isCorrection = false,
}: Props) {
  const { users, parentChildMap, appendActivity } = useAppContext();

  const [parentName, setParentName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // VN Phone format regex: 03, 05, 07, 08, 09 followed by 8 digits
  const VN_PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

  // Find linked parent information
  useEffect(() => {
    if (isOpen) {
      const parentId = Object.keys(parentChildMap).find(pId =>
        parentChildMap[pId]?.includes(studentId)
      );
      const parent = parentId ? users.find(u => u.id === parentId) : null;

      if (parent) {
        setParentName(parent.name);
        setPhoneNumber(parent.phone.replace(/\s+/g, ""));
      } else {
        setParentName("");
        setPhoneNumber("");
      }
      setIsSent(false);
      setIsSending(false);
    }
  }, [isOpen, studentId, users, parentChildMap]);

  // Generate template message
  useEffect(() => {
    if (isOpen) {
      const dateFormatted = new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      let template = "";
      if (isCorrection) {
        template = `Đính chính điểm danh lớp ${className} (${classId}) ngày ${dateFormatted}: Học sinh ${studentName} được ghi nhận lại trạng thái: ${STATUS_LABELS[status]}${
          status === "excused" && reason ? ` (Lý do: ${reason})` : ""
        }. Trân trọng!`;
      } else {
        if (status === "absent") {
          template = `Kính gửi phụ huynh, học sinh ${studentName} lớp ${className} (${classId}) đã vắng mặt không phép ca học ngày ${dateFormatted}. Kính mong phụ huynh phản hồi lý do.`;
        } else if (status === "excused") {
          template = `Kính gửi phụ huynh, học sinh ${studentName} lớp ${className} (${classId}) đã vắng mặt có phép ca học ngày ${dateFormatted}.${
            reason ? ` Lý do: ${reason}.` : ""
          } Trân trọng!`;
        } else if (status === "late") {
          template = `Kính gửi phụ huynh, học sinh ${studentName} lớp ${className} (${classId}) đã đi muộn ca học ngày ${dateFormatted}. Kính mong phụ huynh nhắc nhở con đi học đúng giờ.`;
        } else {
          template = `Kính gửi phụ huynh, học sinh ${studentName} lớp ${className} (${classId}) đã tham gia đầy đủ ca học ngày ${dateFormatted}. Trân trọng!`;
        }
      }
      setMessage(template);
    }
  }, [isOpen, studentName, classId, className, date, status, reason, isCorrection]);

  const cleanPhone = phoneNumber.replace(/\s+/g, "");
  const isPhoneValid = VN_PHONE_REGEX.test(cleanPhone);
  const showWarning = phoneNumber.length > 0 && !isPhoneValid;

  const handleSend = () => {
    if (!isPhoneValid) return;
    setIsSending(true);

    // Simulate sending SMS
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);

      // Log activity
      appendActivity(
        `Đã gửi SMS cho PH học sinh ${studentName}`,
        `SĐT: ${phoneNumber} - Trạng thái: ${STATUS_LABELS[status]} - Nội dung: "${message.substring(0, 40)}..."`,
        "mint"
      );

      // Automatically close after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[32px] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative"
          >
            {isSent ? (
              // Success overlay
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[350px]">
                <div className="w-20 h-20 bg-mint-50 rounded-full flex items-center justify-center text-mint-600 shadow-lg shadow-mint-100/50">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gửi SMS thành công!</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm">
                  Hệ thống đã gửi thông báo đến số điện thoại phụ huynh <span className="font-bold text-slate-800">{phoneNumber}</span>.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-mint-50 rounded-2xl flex items-center justify-center text-mint-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Gửi thông báo SMS</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {isCorrection ? "Tin nhắn đính chính" : "Thông báo chuyên cần"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Student & Class Summary badge */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center text-xs font-bold">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Học sinh</p>
                      <p className="text-slate-800">{studentName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Lớp học</p>
                      <p className="text-slate-800">{className}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Trạng thái</p>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] ${
                          status === "absent"
                            ? "bg-rose-100 text-rose-600"
                            : status === "excused"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  </div>

                  {/* Warning if no parent linked */}
                  {!parentName && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 text-xs text-amber-800 font-medium">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        Chưa liên kết phụ huynh cho học sinh này! Bạn vui lòng nhập thủ công Tên và Số điện thoại bên dưới.
                      </div>
                    </div>
                  )}

                  {/* Parent Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Tên phụ huynh
                      </label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={e => setParentName(e.target.value)}
                        placeholder="Nhập tên phụ huynh"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="Ví dụ: 0988123456"
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl font-bold text-sm focus:ring-4 outline-none transition-all ${
                          showWarning
                            ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-500"
                            : isPhoneValid
                            ? "border-mint-300 focus:ring-mint-500/10 focus:border-mint-500"
                            : "border-slate-200 focus:ring-mint-500/10 focus:border-mint-500/50"
                        }`}
                      />
                      {showWarning && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1">
                          Số điện thoại Việt Nam không hợp lệ!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message content */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Nội dung tin nhắn
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-xs focus:ring-4 focus:ring-mint-500/10 focus:border-mint-500/50 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                  <button
                    onClick={onClose}
                    className="px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!isPhoneValid || !parentName.trim() || isSending}
                    className="px-6 py-3 bg-gradient-to-r from-mint-600 to-mint-400 text-white rounded-full font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-mint-200 transition-all shadow-lg shadow-mint-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi tin SMS"
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
