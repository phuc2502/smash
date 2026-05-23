import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext, type Class } from "../../context/AppContext";
import {
  WEEKDAY_HEADERS,
  EVENT_TONE_STYLES,
  buildClassEventsForMonth,
  dateKey,
  formatDayLabel,
  formatMonthTitle,
  getCalendarCells,
  type CalendarEvent,
} from "../../utils/scheduleCalendar";

const MAX_VISIBLE_EVENTS = 3;

type ScheduleMonthCalendarProps = {
  classes: Class[];
  onSelectClass?: (cls: Class) => void;
};

export default function ScheduleMonthCalendar({ classes, onSelectClass }: ScheduleMonthCalendarProps) {
  const { classScheduleSlots } = useAppContext();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const cells = useMemo(() => getCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const eventsByDay = useMemo(
    () => buildClassEventsForMonth(classes, viewYear, viewMonth, classScheduleSlots),
    [classes, viewYear, viewMonth, classScheduleSlots],
  );

  const classById = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleEventClick = (event: CalendarEvent) => {
    const cls = classById.get(event.classId);
    if (cls && onSelectClass) onSelectClass(cls);
  };

  return (
    <section className="bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-5 md:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Lịch theo tháng</h2>
          <p className="text-sm text-slate-600 mt-0.5 font-medium">
            Buổi học lặp theo lịch từng lớp · bấm mục để mở thiết lập lịch
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-bold text-slate-800 capitalize">
            {formatMonthTitle(viewYear, viewMonth)}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Tháng sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="ml-1 px-3 py-2 rounded-xl text-xs font-bold text-mint-700 bg-mint-50 border border-mint-200/60 hover:bg-mint-100 transition-colors"
          >
            Hôm nay
          </button>
        </div>
      </motion.div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90">
            {WEEKDAY_HEADERS.map((label) => (
              <div
                key={label}
                className="py-2.5 text-center text-[11px] font-bold text-slate-600 uppercase tracking-wide border-r border-slate-100 last:border-r-0"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map(({ date, inMonth }) => {
              const key = dateKey(date);
              const events = eventsByDay.get(key) ?? [];
              const visible = events.slice(0, MAX_VISIBLE_EVENTS);
              const hiddenCount = events.length - visible.length;
              const isToday = dateKey(date) === dateKey(today);

              return (
                <div
                  key={key}
                  className={`min-h-[108px] border-r border-b border-slate-100 last:border-r-0 p-1.5 flex flex-col ${
                    inMonth ? "bg-white" : "bg-slate-50/60"
                  } ${isToday ? "ring-1 ring-inset ring-mint-400/50 bg-mint-50/20" : ""}`}
                >
                  <div className="flex justify-end mb-1">
                    <span
                      className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? "bg-mint-500 text-white"
                          : inMonth
                            ? "text-slate-700"
                            : "text-slate-400"
                      }`}
                    >
                      {formatDayLabel(date, inMonth)}
                    </span>
                  </div>

                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {visible.map((ev) => {
                      const style = EVENT_TONE_STYLES[ev.tone];
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => handleEventClick(ev)}
                          className={`w-full text-left rounded-md px-1 py-0.5 flex items-start gap-1 transition-colors ${style.bg}`}
                          title={`${ev.title} · ${ev.timeLabel}${ev.room ? ` · ${ev.room}` : ""}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${style.dot}`} />
                          <span className={`min-w-0 text-[10px] leading-tight font-medium ${style.text}`}>
                            <span className="font-bold text-slate-600">{ev.timeLabel.split(" – ")[0]}</span>
                            <span className="mx-0.5">·</span>
                            <span className="line-clamp-2">{ev.title}</span>
                          </span>
                        </button>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <p className="text-[10px] font-semibold text-slate-500 pl-1 pt-0.5">
                        {hiddenCount} buổi khác
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-mint-500" />
          Lớp đang / sắp mở
        </span>
        <span className="flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          Tự động từ lịch tuần (Thứ 2,4…)
        </span>
      </div>
    </section>
  );
}
