import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addDays,
  format,
  parseISO,
  startOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  differenceInCalendarDays,
} from "date-fns";
import { sl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = ""): string {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return prefix ? `${prefix}_${id}` : id;
}

export function formatDate(date: Date | string, pattern = "d. M. yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: sl });
}

export function toISODate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

export function weekLabel(anchor: Date) {
  const days = weekDays(anchor);
  return `${formatDate(days[0], "d. M.")} – ${formatDate(days[6], "d. M. yyyy")}`;
}

export function isDateInRange(date: string, start: string, end: string) {
  const d = parseISO(date);
  return isWithinInterval(d, { start: parseISO(start), end: parseISO(end) });
}

export function clampPlanHorizon(date: Date, from = new Date()) {
  const max = addDays(startOfWeek(from, { weekStartsOn: 1 }), 62);
  return date > max ? max : date;
}

export function daysUntil(date: string) {
  return differenceInCalendarDays(parseISO(date), new Date());
}

export const DAY_NAMES = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"] as const;

export const EMPLOYEE_COLORS = [
  "#0d9488",
  "#059669",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#4f46e5",
];
