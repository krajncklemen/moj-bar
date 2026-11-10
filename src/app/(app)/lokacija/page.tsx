"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/demo/store";

export default function LokacijaPage() {
  const { location, updateLocation, isOwner } = useStore();
  const [name, setName] = useState(location?.name || "");
  const [address, setAddress] = useState(location?.address || "");
  const [logoUrl, setLogoUrl] = useState(location?.logoUrl || "");
  const [hours, setHours] = useState(location?.workingHours || {});

  if (!location) return null;

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isOwner) return;
    updateLocation({
      name,
      address,
      logoUrl,
      workingHours: hours,
    });
    toast.success("Lokacija shranjena");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lokacija</h1>
        <p className="text-sm text-slate-500">
          Profil bara, logo in delovni čas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Osnovni podatki</CardTitle>
          <CardDescription>
            Logo lahko nastavite z URL-jem ali lokalnim nalaganjem datoteke.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <Label>Ime</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                required
              />
            </div>
            <div>
              <Label>Naslov</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isOwner}
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={!isOwner}
                  placeholder="https://…"
                />
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-11 w-11 rounded-2xl object-cover"
                  />
                )}
              </div>
              <div className="mt-2">
                <Label>Ali naloži datoteko</Label>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={!isOwner}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setLogoUrl(String(reader.result || ""));
                      toast.success("Logo pripravljen (lokalno)");
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Delovni čas</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["pon", "Ponedeljek"],
                    ["tor", "Torek"],
                    ["sre", "Sreda"],
                    ["čet", "Četrtek"],
                    ["pet", "Petek"],
                    ["sob", "Sobota"],
                    ["ned", "Nedelja"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-24 text-sm text-slate-500">{label}</span>
                    <Input
                      value={hours[key] || ""}
                      disabled={!isOwner}
                      onChange={(e) =>
                        setHours((h) => ({ ...h, [key]: e.target.value }))
                      }
                      placeholder="08:00–24:00"
                    />
                  </div>
                ))}
              </div>
            </div>

            {isOwner && (
              <Button type="submit" size="lg">
                Shrani
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
