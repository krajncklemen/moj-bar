"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/demo/store";
import { EMPLOYEE_COLORS } from "@/lib/utils";

export default function ZaposleniPage() {
  const { members, createEmployeeAccess, deleteMember, isOwner } = useStore();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(EMPLOYEE_COLORS[1]);
  const [saving, setSaving] = useState(false);

  const employees = members.filter((m) => m.role === "employee");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Zaposleni</h1>
        <p className="text-sm text-slate-500">
          Ob dodajanju se ustvari lokalni employee dostop; geslo se prikaže
          enkrat.
        </p>
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Dodaj zaposlenega</CardTitle>
            <CardDescription>
              Geslo se generira naključno in shrani lokalno (demo način).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  const { password } = await createEmployeeAccess({
                    displayName,
                    email,
                    color,
                  });
                  toast.success(
                    `Dostop ustvarjen za ${email.toLowerCase()}. Geslo (shrani zdaj): ${password}`
                  );
                  setDisplayName("");
                  setEmail("");
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div>
                <Label>Ime</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>E-pošta</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Barva na urniku</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-11 p-1"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={saving}>
                  <Plus className="h-4 w-4" />
                  Dodaj + ustvari dostop
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <span
                className="h-10 w-10 rounded-2xl"
                style={{ backgroundColor: m.color }}
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{m.displayName}</span>
                  <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {m.role === "owner" ? "Lastnik" : "Zaposleni"}
                  </Badge>
                </div>
                <div className="text-sm text-slate-500">{m.email}</div>
              </div>
              {isOwner && m.role === "employee" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    deleteMember(m.id);
                    toast.message("Zaposleni odstranjen");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {employees.length === 0 && (
          <p className="text-sm text-slate-500">Še ni zaposlenih.</p>
        )}
      </div>
    </div>
  );
}
