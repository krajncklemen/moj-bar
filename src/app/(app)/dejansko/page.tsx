"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { formatDate, toISODate, uid } from "@/lib/utils";

export default function DejanskoPage() {
  const {
    members,
    shifts,
    actualShifts,
    upsertActual,
    deleteActual,
    isOwner,
  } = useStore();
  const employees = members.filter((m) => m.role === "employee" && m.active);
  const [memberId, setMemberId] = useState(employees[0]?.id || "");
  const [shiftId, setShiftId] = useState(shifts[0]?.id || "");
  const [workDate, setWorkDate] = useState(toISODate(new Date()));
  const [hours, setHours] = useState("8");

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));
  const shiftMap = Object.fromEntries(shifts.map((s) => [s.id, s]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dejansko</h1>
        <p className="text-sm text-slate-500">
          Evidentiranje oddelanih ur / smen
        </p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Vnesi oddelano smeno</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                upsertActual({
                  id: uid("act"),
                  memberId,
                  shiftId,
                  workDate,
                  hours: Number(hours) || 0,
                });
                toast.success("Shranjeno");
              }}
            >
              <div>
                <Label>Zaposleni</Label>
                <Select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  {employees.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.displayName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Smena</Label>
                <Select
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Ure</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Shrani
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {[...actualShifts]
          .sort((a, b) => b.workDate.localeCompare(a.workDate))
          .map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-medium">
                    {memberMap[row.memberId]?.displayName || "?"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDate(row.workDate)} ·{" "}
                    {row.shiftId ? shiftMap[row.shiftId]?.name : "—"} ·{" "}
                    {row.hours} h
                  </div>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteActual(row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
