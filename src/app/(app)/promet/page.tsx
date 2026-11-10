"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";
import { formatDate, toISODate, uid } from "@/lib/utils";

export default function PrometPage() {
  const { traffic, upsertTraffic, deleteTraffic, isOwner } = useStore();
  const [entryDate, setEntryDate] = useState(toISODate(new Date()));
  const [amount, setAmount] = useState("");

  const chartData = useMemo(
    () =>
      [...traffic]
        .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
        .map((t) => ({
          date: formatDate(t.entryDate, "d. M."),
          znesek: t.amount,
        })),
    [traffic]
  );

  const total = traffic.reduce((sum, t) => sum + t.amount, 0);
  const avg = traffic.length ? Math.round(total / traffic.length) : 0;

  if (!isOwner) {
    return (
      <p className="text-sm text-slate-500">
        Analiza prometa je na voljo samo lastniku.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analiza prometa</h1>
        <p className="text-sm text-slate-500">Dnevni promet in trend</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Skupaj (vnosi)</div>
            <div className="mt-1 text-2xl font-semibold">
              {total.toLocaleString("sl-SI")} €
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Povprečje / dan</div>
            <div className="mt-1 text-2xl font-semibold">
              {avg.toLocaleString("sl-SI")} €
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="promet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="znesek"
                stroke="#0d9488"
                fill="url(#promet)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nov vnos</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              upsertTraffic({
                id: uid("tr"),
                entryDate,
                amount: Number(amount) || 0,
              });
              setAmount("");
              toast.success("Promet shranjen");
            }}
          >
            <div className="flex-1">
              <Label>Datum</Label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Znesek (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
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

      <div className="space-y-2">
        {[...traffic]
          .sort((a, b) => b.entryDate.localeCompare(a.entryDate))
          .map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{formatDate(row.entryDate)}</div>
                  <div className="text-sm text-slate-500">
                    {row.amount.toLocaleString("sl-SI")} €
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTraffic(row.id)}
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
