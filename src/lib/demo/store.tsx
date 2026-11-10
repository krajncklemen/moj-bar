"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addDays, format, parseISO } from "date-fns";
import type {
  AppState,
  ActualShift,
  ChecklistItem,
  Debtor,
  LeaveRequest,
  Location,
  LocationMember,
  MemberRole,
  PerformanceEntry,
  ScheduleAssignment,
  Shift,
  TrafficEntry,
  WorkingHours,
} from "@/types";
import { createDemoState } from "./seed";
import {
  clearCredentials,
  generateLocalPassword,
  setCredential,
  verifyCredential,
} from "./credentials";
import { EMPLOYEE_COLORS, uid } from "@/lib/utils";

const STORAGE_KEY = "moj-bar-demo-v1";

type StoreContextValue = AppState & {
  ready: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerOwner: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  loadSampleData: () => void;
  logout: () => void;
  completeOnboarding: (input: {
    locationName: string;
    address?: string;
  }) => void;
  createEmployeeAccess: (input: {
    displayName: string;
    email: string;
    color: string;
  }) => Promise<{ password: string }>;
  updateLocation: (patch: Partial<Location>) => void;
  upsertShift: (shift: Omit<Shift, "locationId"> & { locationId?: string }) => void;
  deleteShift: (id: string) => void;
  upsertMember: (
    member: Omit<LocationMember, "locationId"> & { locationId?: string }
  ) => void;
  deleteMember: (id: string) => void;
  addAssignment: (input: {
    memberId: string;
    shiftId: string;
    workDate: string;
  }) => void;
  moveAssignment: (
    id: string,
    target: { shiftId: string; workDate: string }
  ) => void;
  removeAssignment: (id: string) => void;
  copyWeek: (fromMonday: string, toMonday: string) => void;
  upsertActual: (row: Omit<ActualShift, "id" | "locationId"> & { id?: string }) => void;
  deleteActual: (id: string) => void;
  upsertLeave: (row: Omit<LeaveRequest, "id" | "locationId"> & { id?: string }) => void;
  deleteLeave: (id: string) => void;
  upsertTraffic: (row: Omit<TrafficEntry, "id" | "locationId"> & { id?: string }) => void;
  deleteTraffic: (id: string) => void;
  upsertChecklist: (
    row: Omit<ChecklistItem, "id" | "locationId"> & { id?: string }
  ) => void;
  deleteChecklist: (id: string) => void;
  upsertDebtor: (row: Omit<Debtor, "id" | "locationId"> & { id?: string }) => void;
  deleteDebtor: (id: string) => void;
  upsertPerformance: (
    row: Omit<PerformanceEntry, "id" | "locationId"> & { id?: string }
  ) => void;
  deletePerformance: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return JSON.parse(raw) as AppState;
  } catch {
    return emptyState();
  }
}

function emptyState(): AppState {
  return {
    session: null,
    location: null,
    members: [],
    shifts: [],
    assignments: [],
    actualShifts: [],
    leaves: [],
    traffic: [],
    checklists: [],
    debtors: [],
    performance: [],
  };
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const persist = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (password.length < 6) {
      return { ok: false, error: "Geslo mora imeti vsaj 6 znakov." };
    }

    const okCred = await verifyCredential(normalized, password);
    if (!okCred) {
      return {
        ok: false,
        error: "Napačna e-pošta ali geslo. Registrirajte se ali naložite vzorčne podatke.",
      };
    }

    const prev = typeof window !== "undefined" ? loadState() : state;
    const member = prev.members.find(
      (m) => m.email?.toLowerCase() === normalized && m.active
    );

    if (member && prev.location) {
      setState({
        ...prev,
        session: {
          profile: {
            id: member.userId || member.id,
            email: member.email || normalized,
            fullName: member.displayName,
          },
          role: member.role,
          locationId: prev.location.id,
        },
      });
      return { ok: true };
    }

    // Lastnik po registraciji, pred/med onboardingom
    if (prev.session?.profile.email === normalized || !prev.location) {
      setState({
        ...prev,
        session: {
          profile: {
            id: prev.session?.profile.id || uid("owner"),
            email: normalized,
            fullName: prev.session?.profile.fullName || normalized,
          },
          role: "owner",
          locationId: prev.location?.id || "",
        },
      });
      return { ok: true };
    }

    return { ok: false, error: "Račun nima dostopa do lokacije." };
  }, [state]);

  const registerOwner = useCallback(
    async (input: { fullName: string; email: string; password: string }) => {
      if (input.password.length < 6) {
        return { ok: false, error: "Geslo mora imeti vsaj 6 znakov." };
      }
      const email = input.email.trim().toLowerCase();
      await setCredential(email, input.password);
      const ownerId = uid("owner");
      setState({
        session: {
          profile: {
            id: ownerId,
            email,
            fullName: input.fullName.trim(),
          },
          role: "owner",
          locationId: "",
        },
        location: null,
        members: [],
        shifts: [],
        assignments: [],
        actualShifts: [],
        leaves: [],
        traffic: [],
        checklists: [],
        debtors: [],
        performance: [],
      });
      return { ok: true };
    },
    []
  );

  const loadSampleData = useCallback(() => {
    clearCredentials();
    setState(createDemoState());
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, session: null }));
  }, []);

  const createEmployeeAccess = useCallback(
    async (input: { displayName: string; email: string; color: string }) => {
      const email = input.email.trim().toLowerCase();
      const password = generateLocalPassword();
      await setCredential(email, password);
      setState((prev) => {
        if (!prev.location) return prev;
        const member = {
          id: uid("m"),
          locationId: prev.location.id,
          userId: uid("emp"),
          role: "employee" as const,
          displayName: input.displayName,
          email,
          color: input.color,
          active: true,
        };
        return { ...prev, members: [...prev.members, member] };
      });
      return { password };
    },
    []
  );

  const completeOnboarding = useCallback(
    (input: { locationName: string; address?: string }) => {
      setState((prev) => {
        if (!prev.session) return prev;
        const locationId = uid("loc");
        const ownerMember: LocationMember = {
          id: uid("m"),
          locationId,
          userId: prev.session.profile.id,
          role: "owner",
          displayName: prev.session.profile.fullName,
          email: prev.session.profile.email,
          color: EMPLOYEE_COLORS[0],
          active: true,
        };
        const defaultShifts: Shift[] = [
          {
            id: uid("s"),
            locationId,
            name: "Jutranja",
            startTime: "08:00",
            endTime: "14:00",
            color: "#14b8a6",
            sortOrder: 0,
            active: true,
          },
          {
            id: uid("s"),
            locationId,
            name: "Popoldanska",
            startTime: "14:00",
            endTime: "20:00",
            color: "#0ea5e9",
            sortOrder: 1,
            active: true,
          },
          {
            id: uid("s"),
            locationId,
            name: "Večerna",
            startTime: "20:00",
            endTime: "02:00",
            color: "#8b5cf6",
            sortOrder: 2,
            active: true,
          },
        ];
        const location: Location = {
          id: locationId,
          ownerId: prev.session.profile.id,
          name: input.locationName.trim(),
          address: input.address?.trim(),
          workingHours: {
            pon: "08:00–24:00",
            tor: "08:00–24:00",
            sre: "08:00–24:00",
            čet: "08:00–24:00",
            pet: "08:00–02:00",
            sob: "10:00–02:00",
            ned: "10:00–22:00",
          },
        };
        return {
          ...prev,
          session: { ...prev.session, locationId, role: "owner" },
          location,
          members: [ownerMember],
          shifts: defaultShifts,
        };
      });
    },
    []
  );

  const updateLocation = useCallback((patch: Partial<Location>) => {
    persist((prev) =>
      prev.location ? { ...prev, location: { ...prev.location, ...patch } } : prev
    );
  }, [persist]);

  const upsertShift = useCallback(
    (shift: Omit<Shift, "locationId"> & { locationId?: string }) => {
      persist((prev) => {
        if (!prev.location) return prev;
        const locationId = prev.location.id;
        const existing = prev.shifts.find((s) => s.id === shift.id);
        if (existing) {
          return {
            ...prev,
            shifts: prev.shifts.map((s) =>
              s.id === shift.id ? { ...existing, ...shift, locationId } : s
            ),
          };
        }
        return {
          ...prev,
          shifts: [
            ...prev.shifts,
            {
              ...shift,
              id: shift.id || uid("s"),
              locationId,
            } as Shift,
          ],
        };
      });
    },
    [persist]
  );

  const deleteShift = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        shifts: prev.shifts.filter((s) => s.id !== id),
        assignments: prev.assignments.filter((a) => a.shiftId !== id),
      }));
    },
    [persist]
  );

  const upsertMember = useCallback(
    (member: Omit<LocationMember, "locationId"> & { locationId?: string }) => {
      persist((prev) => {
        if (!prev.location) return prev;
        const locationId = prev.location.id;
        const existing = prev.members.find((m) => m.id === member.id);
        if (existing) {
          return {
            ...prev,
            members: prev.members.map((m) =>
              m.id === member.id ? { ...existing, ...member, locationId } : m
            ),
          };
        }
        const color =
          member.color ||
          EMPLOYEE_COLORS[prev.members.length % EMPLOYEE_COLORS.length];
        return {
          ...prev,
          members: [
            ...prev.members,
            {
              ...member,
              id: member.id || uid("m"),
              locationId,
              color,
              role: member.role || "employee",
              active: member.active ?? true,
              userId: member.userId || uid("emp"),
            } as LocationMember,
          ],
        };
      });
    },
    [persist]
  );

  const deleteMember = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        assignments: prev.assignments.filter((a) => a.memberId !== id),
      }));
    },
    [persist]
  );

  const addAssignment = useCallback(
    (input: { memberId: string; shiftId: string; workDate: string }) => {
      persist((prev) => {
        if (!prev.location) return prev;
        const dup = prev.assignments.find(
          (a) =>
            a.memberId === input.memberId &&
            a.shiftId === input.shiftId &&
            a.workDate === input.workDate
        );
        if (dup) return prev;
        const row: ScheduleAssignment = {
          id: uid("asg"),
          locationId: prev.location.id,
          ...input,
        };
        return { ...prev, assignments: [...prev.assignments, row] };
      });
    },
    [persist]
  );

  const moveAssignment = useCallback(
    (id: string, target: { shiftId: string; workDate: string }) => {
      persist((prev) => {
        const current = prev.assignments.find((a) => a.id === id);
        if (!current) return prev;
        const conflict = prev.assignments.find(
          (a) =>
            a.id !== id &&
            a.memberId === current.memberId &&
            a.shiftId === target.shiftId &&
            a.workDate === target.workDate
        );
        if (conflict) {
          // zamenjaj: odstrani konflikt, premakni trenutnega
          return {
            ...prev,
            assignments: prev.assignments
              .filter((a) => a.id !== conflict.id)
              .map((a) =>
                a.id === id
                  ? { ...a, shiftId: target.shiftId, workDate: target.workDate }
                  : a
              ),
          };
        }
        return {
          ...prev,
          assignments: prev.assignments.map((a) =>
            a.id === id
              ? { ...a, shiftId: target.shiftId, workDate: target.workDate }
              : a
          ),
        };
      });
    },
    [persist]
  );

  const removeAssignment = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((a) => a.id !== id),
      }));
    },
    [persist]
  );

  const copyWeek = useCallback(
    (fromMonday: string, toMonday: string) => {
      persist((prev) => {
        if (!prev.location) return prev;
        const from = parseISO(fromMonday);
        const to = parseISO(toMonday);
        const source = prev.assignments.filter((a) => {
          const d = parseISO(a.workDate);
          return d >= from && d < addDays(from, 7);
        });
        // odstrani ciljni teden
        const withoutTarget = prev.assignments.filter((a) => {
          const d = parseISO(a.workDate);
          return !(d >= to && d < addDays(to, 7));
        });
        const copied = source.map((a) => {
          const offset = Math.round(
            (parseISO(a.workDate).getTime() - from.getTime()) / 86400000
          );
          return {
            ...a,
            id: uid("asg"),
            workDate: format(addDays(to, offset), "yyyy-MM-dd"),
          };
        });
        return { ...prev, assignments: [...withoutTarget, ...copied] };
      });
    },
    [persist]
  );

  const upsertInList = useCallback(
    <T extends { id: string; locationId?: string }>(
      key:
        | "actualShifts"
        | "leaves"
        | "traffic"
        | "checklists"
        | "debtors"
        | "performance",
      row: Omit<T, "id" | "locationId"> & { id?: string; locationId?: string }
    ) => {
      persist((prev) => {
        if (!prev.location) return prev;
        const list = [...(prev[key] as unknown as T[])];
        const id = row.id || uid(String(key).slice(0, 2));
        const idx = list.findIndex((x) => x.id === id);
        const next = {
          ...(row as object),
          id,
          locationId: prev.location.id,
        } as T;
        if (idx >= 0) list[idx] = { ...list[idx], ...next };
        else list.push(next);
        return { ...prev, [key]: list };
      });
    },
    [persist]
  );

  const removeFromList = useCallback(
    (
      key:
        | "actualShifts"
        | "leaves"
        | "traffic"
        | "checklists"
        | "debtors"
        | "performance",
      id: string
    ) => {
      persist((prev) => ({
        ...prev,
        [key]: (prev[key] as { id: string }[]).filter((x) => x.id !== id),
      }));
    },
    [persist]
  );

  const resetDemo = useCallback(() => {
    clearCredentials();
    setState(createDemoState());
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      ready,
      isOwner: state.session?.role === "owner",
      login,
      registerOwner,
      loadSampleData,
      logout,
      createEmployeeAccess,
      completeOnboarding,
      updateLocation,
      upsertShift,
      deleteShift,
      upsertMember,
      deleteMember,
      addAssignment,
      moveAssignment,
      removeAssignment,
      copyWeek,
      upsertActual: (row) => upsertInList("actualShifts", row),
      deleteActual: (id) => removeFromList("actualShifts", id),
      upsertLeave: (row) => upsertInList("leaves", row),
      deleteLeave: (id) => removeFromList("leaves", id),
      upsertTraffic: (row) => upsertInList("traffic", row),
      deleteTraffic: (id) => removeFromList("traffic", id),
      upsertChecklist: (row) => upsertInList("checklists", row),
      deleteChecklist: (id) => removeFromList("checklists", id),
      upsertDebtor: (row) => upsertInList("debtors", row),
      deleteDebtor: (id) => removeFromList("debtors", id),
      upsertPerformance: (row) => upsertInList("performance", row),
      deletePerformance: (id) => removeFromList("performance", id),
      resetDemo,
    }),
    [
      state,
      ready,
      login,
      registerOwner,
      loadSampleData,
      logout,
      createEmployeeAccess,
      completeOnboarding,
      updateLocation,
      upsertShift,
      deleteShift,
      upsertMember,
      deleteMember,
      addAssignment,
      moveAssignment,
      removeAssignment,
      copyWeek,
      upsertInList,
      removeFromList,
      resetDemo,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore mora biti znotraj DemoStoreProvider");
  return ctx;
}

export type { WorkingHours, MemberRole };
