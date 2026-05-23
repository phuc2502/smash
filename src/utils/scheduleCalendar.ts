import type { Class } from "../context/AppContext";

export interface CalendarEvent {
  id: string;
  classId: string;
  title: string;
  timeLabel: string;
  instructor: string;
  room?: string;
  tone: "mint" | "sky" | "violet" | "rose";
}

const TONE_BY_COLOR: Record<string, CalendarEvent["tone"]> = {
  mint: "mint",
  rose: "rose",
  slate: "violet",
};

const WEEKDAY_HEADERS = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

/** Thứ 2 → 1 (Mon), … Thứ 7 → 6; CN → 0 */
export function parseScheduleWeekdays(schedule: string): number[] {
  const beforeParen = (schedule.split("(")[0] ?? schedule).toLowerCase();
  const days = new Set<number>();

  if (/\bcn\b|chủ nhật/.test(beforeParen)) days.add(0);

  const first = beforeParen.match(/thứ\s*(\d)/i);
  if (first) {
    const n = parseInt(first[1], 10);
    if (n >= 2 && n <= 7) days.add(n - 1);
  }

  for (const m of beforeParen.matchAll(/,\s*(\d)/g)) {
    const n = parseInt(m[1], 10);
    if (n >= 2 && n <= 7) days.add(n - 1);
  }

  return [...days];
}

export function parseScheduleTimeRange(schedule: string): { start: string; end: string } | null {
  const m = schedule.match(/\((\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\)/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

function toneForClass(cls: Class): CalendarEvent["tone"] {
  return TONE_BY_COLOR[cls.color] ?? "mint";
}

export function buildClassEventsForMonth(
  classes: Class[],
  year: number,
  month: number,
  classScheduleSlots?: Record<string, { dayOfWeek: number; startTime: string; endTime: string }[]>
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();

  for (const cls of classes) {
    if (cls.status === "Đã kết thúc" || cls.status === "Đã lưu trữ") continue;
    
    const customSlots = classScheduleSlots?.[cls.id];
    
    if (customSlots && customSlots.length > 0) {
      for (const slot of customSlots) {
        // ScheduleSlot has dayOfWeek: 1 (Mon) -> 7 (Sun)
        // JS Date has dayOfWeek: 0 (Sun) -> 6 (Sat)
        const slotDay = slot.dayOfWeek === 7 ? 0 : slot.dayOfWeek;
        const timeLabel = `${slot.startTime} – ${slot.endTime}`;
        
        for (const { date } of getCalendarCells(year, month)) {
          if (date.getDay() !== slotDay) continue;
          const key = dateKey(date);
          const event: CalendarEvent = {
            id: `${cls.id}-${key}-${slot.startTime}`,
            classId: cls.id,
            title: cls.title,
            timeLabel,
            instructor: cls.instructor,
            room: cls.location,
            tone: toneForClass(cls),
          };
          const list = map.get(key) ?? [];
          list.push(event);
          map.set(key, list);
        }
      }
    } else {
      const weekdays = parseScheduleWeekdays(cls.schedule);
      const time = parseScheduleTimeRange(cls.schedule);
      if (weekdays.length === 0) continue;

      const timeLabel = time ? `${time.start} – ${time.end}` : cls.schedule;

      for (const { date } of getCalendarCells(year, month)) {
        if (!weekdays.includes(date.getDay())) continue;
        const key = dateKey(date);
        const event: CalendarEvent = {
          id: `${cls.id}-${key}`,
          classId: cls.id,
          title: cls.title,
          timeLabel,
          instructor: cls.instructor,
          room: cls.location,
          tone: toneForClass(cls),
        };
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
    }
  }

  for (const [key, list] of map) {
    list.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel, "vi"));
    map.set(key, list);
  }

  return map;
}

export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getCalendarCells(year: number, month: number): { date: Date; inMonth: boolean }[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(start.getDate() - start.getDay());

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    cells.push({ date, inMonth: date.getMonth() === month });
  }
  return cells;
}

export function formatMonthTitle(year: number, month: number): string {
  return new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
}

export function formatDayLabel(date: Date, inMonth: boolean): string {
  if (!inMonth) {
    return new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short" }).format(date);
  }
  return String(date.getDate());
}

export { WEEKDAY_HEADERS };

export const EVENT_TONE_STYLES: Record<
  CalendarEvent["tone"],
  { dot: string; text: string; bg: string }
> = {
  mint: { dot: "bg-mint-500", text: "text-slate-800", bg: "hover:bg-mint-50/80" },
  sky: { dot: "bg-sky-500", text: "text-slate-800", bg: "hover:bg-sky-50/80" },
  violet: { dot: "bg-violet-500", text: "text-slate-800", bg: "hover:bg-violet-50/80" },
  rose: { dot: "bg-rose-500", text: "text-slate-800", bg: "hover:bg-rose-50/80" },
};
