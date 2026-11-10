"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { cn, formatDate, uid } from "@/lib/utils";

export default function OpomnikiPage() {
  const { checklists, upsertChecklist, deleteChecklist, isOwner } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const sorted = [...checklists].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Opomniki</h1>
        <p className="text-sm text-slate-500">Checkliste za ekipo</p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Nov opomnik</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                upsertChecklist({
                  id: uid("cl"),
                  title,
                  description,
                  dueDate: dueDate || undefined,
                  completed: false,
                  sortOrder: checklists.length,
                });
                setTitle("");
                setDescription("");
                setDueDate("");
                toast.success("Opomnik dodan");
              }}
            >
              <div>
                <Label>Naslov</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Rok</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Dodaj
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sorted.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-start gap-3 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={item.completed}
                onChange={(e) =>
                  upsertChecklist({ ...item, completed: e.target.checked })
                }
              />
              <div className="flex-1">
                <div
                  className={cn(
                    "font-medium",
                    item.completed && "text-slate-400 line-through"
                  )}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-sm text-slate-500">{item.description}</div>
                )}
                {item.dueDate && (
                  <div className="mt-1 text-xs text-slate-400">
                    Rok: {formatDate(item.dueDate)}
                  </div>
                )}
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteChecklist(item.id)}
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
