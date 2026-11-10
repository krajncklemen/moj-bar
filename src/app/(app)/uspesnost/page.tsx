"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { formatDate, toISODate, uid } from "@/lib/utils";

export default function UspesnostPage() {
  const {
    members,
    performance,
    upsertPerformance,
    deletePerformance,
    isOwner,
  } = useStore();
  const employees = members.filter((m) => m.role === "employee" && m.active);
  const [memberId, setMemberId] = useState(employees[0]?.id || "");
  const [entryDate, setEntryDate] = useState(toISODate(new Date()));
  const [score, setScore] = useState("4");
  const [sales, setSales] = useState("");

  const memberMap = Object.fromEntries(members.map((m) => [m.id, m]));

  const chartData = useMemo(() => {
    const byMember: Record<string, { name: string; ocena: number; n: number; prodaja: number }> =
      {};
    for (const p of performance) {
      const m = memberMap[p.memberId];
      if (!m) continue;
      if (!byMember[p.memberId]) {
        byMember[p.memberId] = { name: m.displayName, ocena: 0, n: 0, prodaja: 0 };
      }
      byMember[p.memberId].ocena += p.score;
      byMember[p.memberId].prodaja += p.sales;
      byMember[p.memberId].n += 1;
    }
    return Object.values(byMember).map((x) => ({
      name: x.name,
      ocena: Number((x.ocena / x.n).toFixed(1)),
      prodaja: x.prodaja,
    }));
  }, [performance, memberMap]);

  if (!isOwner) {
    return (
      <p className="text-sm text-slate-500">
        Uspešnost je na voljo samo lastniku.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Uspešnost</h1>
        <p className="text-sm text-slate-500">Ocene in prodaja zaposlenih</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pregled</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="ocena" fill="#0d9488" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nov vnos</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              upsertPerformance({
                id: uid("pf"),
                memberId,
                entryDate,
                score: Number(score) || 0,
                sales: Number(sales) || 0,
              });
              setSales("");
              toast.success("Vnos shranjen");
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
              <Label>Datum</Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Ocena (1–5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <div>
              <Label>Prodaja (€)</Label>
              <Input
                type="number"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
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

      <div className="space-y-2">
        {[...performance]
          .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
          .map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">
                    {memberMap[row.memberId]?.displayName}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDate(row.entryDate)} · ocena {row.score} ·{" "}
                    {row.sales.toLocaleString("sl-SI")} €
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePerformance(row.id)}
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
