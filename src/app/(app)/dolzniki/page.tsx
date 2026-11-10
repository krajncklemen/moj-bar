"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { uid } from "@/lib/utils";

export default function DolznikiPage() {
  const { debtors, upsertDebtor, deleteDebtor, isOwner } = useStore();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!isOwner) {
    return (
      <p className="text-sm text-slate-500">
        Dolžniki so na voljo samo lastniku.
      </p>
    );
  }

  const open = debtors.filter((d) => !d.settled);
  const totalOpen = open.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dolžniki</h1>
        <p className="text-sm text-slate-500">
          Odprto: {totalOpen.toLocaleString("sl-SI")} €
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nov dolžnik</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              upsertDebtor({
                id: uid("db"),
                name,
                amount: Number(amount) || 0,
                note,
                settled: false,
              });
              setName("");
              setAmount("");
              setNote("");
              toast.success("Dodano");
            }}
          >
            <div>
              <Label>Ime</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Znesek (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Opomba</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button type="submit">
              <Plus className="h-4 w-4" />
              Dodaj
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {debtors.map((d) => (
          <Card key={d.id}>
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{d.name}</span>
                  <Badge
                    className={
                      d.settled
                        ? "bg-teal-100 text-teal-800"
                        : "bg-amber-100 text-amber-800"
                    }
                  >
                    {d.settled ? "Poravnano" : "Odprto"}
                  </Badge>
                </div>
                <div className="text-sm text-slate-500">
                  {d.amount.toLocaleString("sl-SI")} €
                  {d.note ? ` · ${d.note}` : ""}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => upsertDebtor({ ...d, settled: !d.settled })}
                >
                  {d.settled ? "Označi odprto" : "Označi poravnano"}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteDebtor(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
