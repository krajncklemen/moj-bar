"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { formatDate, toISODate, uid } from "@/lib/utils";
import type { LeaveStatus, LeaveType } from "@/types";

export default function DopustiPage() {
  const { members, leaves, upsertLeave, deleteLeave, isOwner, session } =
    useStore();
  const employees = members.filter((m) => m.role === "employee" && m.active);
  const myMember = members.find((m) => m.userId === session?.profile.id);
  const [memberId, setMemberId] = useState(
    isOwner ? employees[0]?.id || "" : myMember?.id || ""
  );
  const [leaveType, setLeaveType] = useState<LeaveType>("leave");
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [endDate, setEndDate] = useState(toISODate(new Date()));
  const [notes, setNotes] = useState("");

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dopusti / bolniške</h1>
        <p className="text-sm text-slate-500">
          Odobreni vnosi se na urniku prikažejo sivo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nov vnos</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              upsertLeave({
                id: uid("lv"),
                memberId,
                leaveType,
                status: (isOwner ? "approved" : "pending") as LeaveStatus,
                startDate,
                endDate,
                notes,
              });
              toast.success(isOwner ? "Shranjeno in odobreno" : "Poslano v odobritev");
              setNotes("");
            }}
          >
            {isOwner && (
              <div className="sm:col-span-2">
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
            )}
            <div>
              <Label>Vrsta</Label>
              <Select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              >
                <option value="leave">Dopust</option>
                <option value="sick">Bolniška</option>
              </Select>
            </div>
            <div>
              <Label>Od</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Do</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Opomba</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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

      <div className="space-y-3">
        {[...leaves]
          .sort((a, b) => b.startDate.localeCompare(a.startDate))
          .map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {memberMap[row.memberId]?.displayName}
                    </span>
                    <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800">
                      {row.leaveType === "leave" ? "Dopust" : "Bolniška"}
                    </Badge>
                    <Badge
                      className={
                        row.status === "approved"
                          ? "bg-teal-100 text-teal-800"
                          : row.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                      }
                    >
                      {row.status === "approved"
                        ? "Odobreno"
                        : row.status === "rejected"
                          ? "Zavrnjeno"
                          : "V čakanju"}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {formatDate(row.startDate)} – {formatDate(row.endDate)}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </div>
                  {isOwner && row.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          upsertLeave({ ...row, status: "approved" })
                        }
                      >
                        Odobri
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          upsertLeave({ ...row, status: "rejected" })
                        }
                      >
                        Zavrni
                      </Button>
                    </div>
                  )}
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLeave(row.id)}
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
