import { addDays, format, startOfWeek } from "date-fns";
import type { AppState } from "@/types";
import { uid } from "@/lib/utils";

/** Vzorčni (sample) podatki – ni produkcijski račun / geslo. */
export const SAMPLE_OWNER_EMAIL = "owner@example.com";

export function createDemoState(): AppState {
  const ownerId = "sample-owner";
  const locationId = "sample-location";

  const members = [
    {
      id: "m-owner",
      locationId,
      userId: ownerId,
      role: "owner" as const,
      displayName: "Vzorčni lastnik",
      email: SAMPLE_OWNER_EMAIL,
      color: "#0d9488",
      active: true,
    },
    {
      id: "m-1",
      locationId,
      userId: "sample-emp-1",
      role: "employee" as const,
      displayName: "Marko Primer",
      email: "marko@example.com",
      color: "#0284c7",
      active: true,
    },
    {
      id: "m-2",
      locationId,
      userId: "sample-emp-2",
      role: "employee" as const,
      displayName: "Sara Primer",
      email: "sara@example.com",
      color: "#7c3aed",
      active: true,
    },
    {
      id: "m-3",
      locationId,
      userId: "sample-emp-3",
      role: "employee" as const,
      displayName: "Luka Primer",
      email: "luka@example.com",
      color: "#db2777",
      active: true,
    },
    {
      id: "m-4",
      locationId,
      userId: "sample-emp-4",
      role: "employee" as const,
      displayName: "Eva Primer",
      email: "eva@example.com",
      color: "#ea580c",
      active: true,
    },
  ];

  const shifts = [
    {
      id: "s-jutranja",
      locationId,
      name: "Jutranja",
      startTime: "08:00",
      endTime: "14:00",
      color: "#14b8a6",
      sortOrder: 0,
      active: true,
    },
    {
      id: "s-popoldanska",
      locationId,
      name: "Popoldanska",
      startTime: "14:00",
      endTime: "20:00",
      color: "#0ea5e9",
      sortOrder: 1,
      active: true,
    },
    {
      id: "s-vecerna",
      locationId,
      name: "Večerna",
      startTime: "20:00",
      endTime: "02:00",
      color: "#8b5cf6",
      sortOrder: 2,
      active: true,
    },
  ];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const empIds = ["m-1", "m-2", "m-3", "m-4"];
  const shiftIds = shifts.map((s) => s.id);
  const assignments = [];

  for (let d = 0; d < 7; d++) {
    const date = format(addDays(weekStart, d), "yyyy-MM-dd");
    for (let s = 0; s < shiftIds.length; s++) {
      const memberId = empIds[(d + s) % empIds.length];
      assignments.push({
        id: uid("asg"),
        locationId,
        memberId,
        shiftId: shiftIds[s],
        workDate: date,
      });
      // vikend: dodaj še eno osebo na večerno
      if (d >= 5 && s === 2) {
        assignments.push({
          id: uid("asg"),
          locationId,
          memberId: empIds[(d + s + 1) % empIds.length],
          shiftId: shiftIds[s],
          workDate: date,
        });
      }
    }
  }

  return {
    session: {
      profile: {
        id: ownerId,
        email: SAMPLE_OWNER_EMAIL,
        fullName: "Vzorčni lastnik",
      },
      role: "owner",
      locationId,
    },
    location: {
      id: locationId,
      ownerId,
      name: "Vzorčni bar",
      logoUrl: "",
      facebookUrl: "",
      address: "Primerjeva 1, 1000 Ljubljana",
      workingHours: {
        pon: "08:00–24:00",
        tor: "08:00–24:00",
        sre: "08:00–24:00",
        čet: "08:00–24:00",
        pet: "08:00–02:00",
        sob: "10:00–02:00",
        ned: "10:00–22:00",
      },
    },
    members,
    shifts,
    assignments,
    actualShifts: [
      {
        id: uid("act"),
        locationId,
        memberId: "m-1",
        shiftId: "s-jutranja",
        workDate: format(addDays(weekStart, -1), "yyyy-MM-dd"),
        hours: 6,
        notes: "Miren dan",
      },
    ],
    leaves: [
      {
        id: uid("lv"),
        locationId,
        memberId: "m-2",
        leaveType: "leave",
        status: "approved",
        startDate: format(addDays(weekStart, 3), "yyyy-MM-dd"),
        endDate: format(addDays(weekStart, 3), "yyyy-MM-dd"),
        notes: "Osebni opravki",
      },
    ],
    traffic: Array.from({ length: 14 }).map((_, i) => ({
      id: uid("tr"),
      locationId,
      entryDate: format(addDays(weekStart, i - 7), "yyyy-MM-dd"),
      amount: 800 + Math.round(Math.random() * 900),
      notes: "",
    })),
    checklists: [
      {
        id: uid("cl"),
        locationId,
        title: "Preveri zalogo piva",
        description: "Pred vikendom",
        dueDate: format(addDays(weekStart, 4), "yyyy-MM-dd"),
        completed: false,
        sortOrder: 0,
      },
      {
        id: uid("cl"),
        locationId,
        title: "Čiščenje točilnega pulta",
        completed: true,
        sortOrder: 1,
      },
    ],
    debtors: [
      {
        id: uid("db"),
        locationId,
        name: "Nogometni klub",
        amount: 120,
        note: "Račun za dogodek",
        settled: false,
      },
    ],
    performance: [
      {
        id: uid("pf"),
        locationId,
        memberId: "m-1",
        entryDate: format(addDays(weekStart, -1), "yyyy-MM-dd"),
        score: 4.5,
        sales: 620,
      },
      {
        id: uid("pf"),
        locationId,
        memberId: "m-3",
        entryDate: format(addDays(weekStart, -1), "yyyy-MM-dd"),
        score: 4.2,
        sales: 540,
      },
    ],
  };
}
