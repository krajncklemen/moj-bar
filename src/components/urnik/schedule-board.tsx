"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { addWeeks, isSameDay, startOfWeek } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Filter,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useStore } from "@/lib/demo/store";
import {
  DAY_NAMES,
  clampPlanHorizon,
  cn,
  formatDate,
  isDateInRange,
  toISODate,
  weekDays,
  weekLabel,
} from "@/lib/utils";

function slotId(date: string, shiftId: string) {
  return `slot:${date}:${shiftId}`;
}

function parseSlotId(id: string) {
  const [, date, shiftId] = id.split(":");
  return { date, shiftId };
}

function AssignmentChip({
  id,
  name,
  color,
  muted,
  onRemove,
  dragDisabled,
}: {
  id: string;
  name: string;
  color: string;
  muted?: boolean;
  onRemove?: () => void;
  dragDisabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id, disabled: dragDisabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        backgroundColor: muted ? "#94a3b8" : color,
        opacity: isDragging ? 0.4 : muted ? 0.7 : 1,
      }}
      className={cn(
        "group flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-medium text-white shadow-sm",
        !dragDisabled && "cursor-grab active:cursor-grabbing"
      )}
      {...listeners}
      {...attributes}
    >
      <span className="truncate">{name}</span>
      {onRemove && (
        <button
          type="button"
          className="ml-auto rounded-md p-0.5 opacity-80 hovering:opacity-100 hover:bg-black/15"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Odstrani"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function SlotCell({
  date,
  shiftId,
  children,
  onAdd,
  canEdit,
}: {
  date: string;
  shiftId: string;
  children: React.ReactNode;
  onAdd: () => void;
  canEdit: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: slotId(date, shiftId),
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[88px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-2 transition dark:border-slate-700 dark:bg-slate-900/40",
        isOver && "border-teal-400 bg-teal-50/80 dark:bg-teal-950/40"
      )}
    >
      <div className="mb-1.5 flex items-center justify-end">
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-500 shadow-sm hover:bg-white hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label="Dodaj zaposlenega"
            data-testid="add-to-slot"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

export function ScheduleBoard() {
  const {
    shifts,
    members,
    assignments,
    leaves,
    isOwner,
    addAssignment,
    moveAssignment,
    removeAssignment,
    copyWeek,
  } = useStore();

  const [anchor, setAnchor] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [filterMember, setFilterMember] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [picker, setPicker] = useState<{
    date: string;
    shiftId: string;
  } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    })
  );

  const days = useMemo(() => weekDays(anchor), [anchor]);
  const activeShifts = useMemo(
    () =>
      [...shifts].filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [shifts]
  );
  const employees = useMemo(
    () => members.filter((m) => m.active && m.role === "employee"),
    [members]
  );
  const memberMap = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m])),
    [members]
  );

  const approvedLeaves = useMemo(
    () => leaves.filter((l) => l.status === "approved"),
    [leaves]
  );

  const activeAssignment = activeId
    ? assignments.find((a) => a.id === activeId)
    : null;

  const maxDate = clampPlanHorizon(addWeeks(new Date(), 9));

  function goWeek(delta: number) {
    setAnchor((prev) => {
      const next = addWeeks(prev, delta);
      if (next > maxDate) {
        toast.message("Urnik lahko načrtuješ največ 2 meseca naprej.");
        return prev;
      }
      return next;
    });
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!isOwner) return;
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId?.startsWith("slot:")) return;
    const { date, shiftId } = parseSlotId(overId);
    moveAssignment(String(e.active.id), { workDate: date, shiftId });
  }

  function handleCopyWeek() {
    if (!isOwner) return;
    const from = toISODate(anchor);
    const to = toISODate(addWeeks(anchor, 1));
    if (addWeeks(anchor, 1) > maxDate) {
      toast.error("Ciljni teden presega 2-mesečni horizont.");
      return;
    }
    copyWeek(from, to);
    toast.success("Teden kopiran v naslednji teden.");
    setAnchor(addWeeks(anchor, 1));
  }

  function isOnLeave(memberId: string, date: string) {
    return approvedLeaves.some(
      (l) =>
        l.memberId === memberId && isDateInRange(date, l.startDate, l.endDate)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Urnik</h1>
          <p className="text-sm text-slate-500">
            Povleci zaposlene med smenami · načrt do 2 meseca
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => goWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[160px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium dark:border-slate-700 dark:bg-slate-900">
            {weekLabel(anchor)}
          </div>
          <Button variant="outline" size="icon" onClick={() => goWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setAnchor(startOfWeek(new Date(), { weekStartsOn: 1 }))
            }
          >
            Danes
          </Button>
          {isOwner && (
            <Button variant="outline" onClick={handleCopyWeek}>
              <Copy className="h-4 w-4" />
              Kopiraj teden
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select
          className="max-w-xs"
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
        >
          <option value="all">Vsi zaposleni</option>
          {employees.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName}
            </option>
          ))}
        </Select>
        <div className="flex flex-wrap gap-2">
          {activeShifts.map((s) => (
            <Badge
              key={s.id}
              className="text-white"
              style={{ backgroundColor: s.color }}
            >
              {s.name} {s.startTime}–{s.endTime}
            </Badge>
          ))}
        </div>
      </div>

      <div
        className="overflow-x-auto pb-2"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(dx) > 60) goWeek(dx < 0 ? 1 : -1);
          touchStartX.current = null;
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="min-w-[720px] space-y-3">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `120px repeat(${days.length}, minmax(100px, 1fr))`,
              }}
            >
              <div />
              {days.map((day, i) => {
                const today = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "rounded-2xl px-2 py-2 text-center",
                      today && "bg-teal-50 dark:bg-teal-950/40"
                    )}
                  >
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {DAY_NAMES[i]}
                    </div>
                    <div className="text-sm font-semibold">
                      {formatDate(day, "d. M.")}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeShifts.map((shift) => (
              <div key={shift.id} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: shift.color }}
                  />
                  <span className="text-sm font-semibold">{shift.name}</span>
                  <span className="text-xs text-slate-400">
                    {shift.startTime}–{shift.endTime}
                  </span>
                </div>
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `120px repeat(${days.length}, minmax(100px, 1fr))`,
                  }}
                >
                  <div
                    className="flex items-center rounded-2xl px-3 text-sm font-medium text-white"
                    style={{ backgroundColor: shift.color }}
                  >
                    {shift.name}
                  </div>
                  {days.map((day) => {
                    const date = toISODate(day);
                    const cellAssignments = assignments.filter(
                      (a) =>
                        a.shiftId === shift.id &&
                        a.workDate === date &&
                        (filterMember === "all" || a.memberId === filterMember)
                    );
                    return (
                      <SlotCell
                        key={`${date}-${shift.id}`}
                        date={date}
                        shiftId={shift.id}
                        canEdit={isOwner}
                        onAdd={() => setPicker({ date, shiftId: shift.id })}
                      >
                        {cellAssignments.map((a) => {
                          const member = memberMap[a.memberId];
                          if (!member) return null;
                          const muted = isOnLeave(a.memberId, date);
                          return (
                            <AssignmentChip
                              key={a.id}
                              id={a.id}
                              name={
                                muted
                                  ? `${member.displayName} (odsoten)`
                                  : member.displayName
                              }
                              color={member.color}
                              muted={muted}
                              dragDisabled={!isOwner}
                              onRemove={
                                isOwner
                                  ? () => {
                                      removeAssignment(a.id);
                                      toast.message("Odstranjeno z urnika");
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </SlotCell>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeAssignment && memberMap[activeAssignment.memberId] ? (
              <div
                className="rounded-xl px-3 py-2 text-xs font-medium text-white shadow-lg"
                style={{
                  backgroundColor:
                    memberMap[activeAssignment.memberId].color,
                }}
              >
                {memberMap[activeAssignment.memberId].displayName}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Dodaj na smeno</h2>
                <p className="text-sm text-slate-500">
                  {formatDate(picker.date)} ·{" "}
                  {activeShifts.find((s) => s.id === picker.shiftId)?.name}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPicker(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-2">
              {employees.map((m) => {
                const already = assignments.some(
                  (a) =>
                    a.memberId === m.id &&
                    a.shiftId === picker.shiftId &&
                    a.workDate === picker.date
                );
                const onLeave = isOnLeave(m.id, picker.date);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      addAssignment({
                        memberId: m.id,
                        shiftId: picker.shiftId,
                        workDate: picker.date,
                      });
                      setPicker(null);
                      toast.success(`${m.displayName} dodan/a`);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 text-left transition hover:border-teal-300 hover:bg-teal-50/50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-teal-950/30",
                      onLeave && "bg-slate-100 dark:bg-slate-800"
                    )}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: onLeave ? "#94a3b8" : m.color }}
                    />
                    <span className="text-sm font-medium">
                      {m.displayName}
                      {onLeave ? " · dopust/bolniška" : ""}
                    </span>
                  </button>
                );
              })}
              {employees.length === 0 && (
                <p className="text-sm text-slate-500">
                  Najprej dodaj zaposlene v meniju Zaposleni.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isOwner && (
        <p className="text-xs text-slate-400">
          Ogledovalni način: urejanje urnika je na voljo lastniku.
        </p>
      )}
    </div>
  );
}
