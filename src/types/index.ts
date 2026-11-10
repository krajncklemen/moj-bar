export type MemberRole = "owner" | "employee";
export type LeaveType = "leave" | "sick";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
}

export interface WorkingHours {
  pon?: string;
  tor?: string;
  sre?: string;
  čet?: string;
  pet?: string;
  sob?: string;
  ned?: string;
}

export interface Location {
  id: string;
  ownerId: string;
  name: string;
  logoUrl?: string;
  facebookUrl?: string;
  address?: string;
  workingHours: WorkingHours;
}

export interface LocationMember {
  id: string;
  locationId: string;
  userId?: string;
  role: MemberRole;
  displayName: string;
  email?: string;
  color: string;
  active: boolean;
}

export interface Shift {
  id: string;
  locationId: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  sortOrder: number;
  active: boolean;
}

export interface ScheduleAssignment {
  id: string;
  locationId: string;
  memberId: string;
  shiftId: string;
  workDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface ActualShift {
  id: string;
  locationId: string;
  memberId: string;
  shiftId?: string;
  workDate: string;
  hours: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  locationId: string;
  memberId: string;
  leaveType: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface TrafficEntry {
  id: string;
  locationId: string;
  entryDate: string;
  amount: number;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  locationId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  sortOrder: number;
}

export interface Debtor {
  id: string;
  locationId: string;
  name: string;
  amount: number;
  note?: string;
  settled: boolean;
}

export interface PerformanceEntry {
  id: string;
  locationId: string;
  memberId: string;
  entryDate: string;
  score: number;
  sales: number;
  notes?: string;
}

export interface AppSession {
  profile: Profile;
  role: MemberRole;
  locationId: string;
}

export interface AppState {
  session: AppSession | null;
  location: Location | null;
  members: LocationMember[];
  shifts: Shift[];
  assignments: ScheduleAssignment[];
  actualShifts: ActualShift[];
  leaves: LeaveRequest[];
  traffic: TrafficEntry[];
  checklists: ChecklistItem[];
  debtors: Debtor[];
  performance: PerformanceEntry[];
}
