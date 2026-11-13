import { Users } from "lucide-react";
import { useAppContext, ROLE_LABELS } from "../../context/AppContext";

export default function ParentLinkedStudents() {
  const { currentAccount, users, parentChildMap } = useAppContext();

  if (currentAccount?.role !== ROLE_LABELS.parent) return null;

  const linkedStudentIds = parentChildMap[currentAccount.id] ?? [];
  if (linkedStudentIds.length === 0) return null;

  const linkedStudents = linkedStudentIds
    .map(studentId => users.find(user => user.id === studentId))
    .filter((student): student is NonNullable<typeof student> => Boolean(student));

  if (linkedStudents.length === 0) return null;

  return (
    <section
      aria-labelledby="linked-students-heading"
      className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-mint-50 text-mint-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 id="linked-students-heading" className="text-lg font-black text-slate-900">
            Học viên được liên kết
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Các tài khoản học viên đang được liên kết với tài khoản phụ huynh của bạn.
          </p>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {linkedStudents.map(student => (
              <li
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <img
                  src={`https://picsum.photos/seed/${student.id}/80/80`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                  <p className="text-xs font-medium text-slate-400 truncate">Mã học viên: {student.id}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
