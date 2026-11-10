"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { uid } from "@/lib/utils";

export default function SmenePage() {
  const { shifts, upsertShift, deleteShift, isOwner } = useStore();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("14:00");
  const [color, setColor] = useState("#14b8a6");

  const sorted = [...shifts].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Smene</h1>
        <p className="text-sm text-slate-500">
          Definicije smen z barvami za urnik
        </p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Nova smena</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                upsertShift({
                  id: uid("s"),
                  name,
                  startTime,
                  endTime,
                  color,
                  sortOrder: shifts.length,
                  active: true,
                });
                setName("");
                toast.success("Smena dodana");
              }}
            >
              <div className="sm:col-span-2">
                <Label>Ime</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Začetek</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Konec</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Barva</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 p-1"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Dodaj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <span
                className="h-10 w-10 rounded-2xl"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-slate-500">
                  {s.startTime} – {s.endTime}
                </div>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteShift(s.id);
                    toast.message("Smena odstranjena");
                  }}
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
