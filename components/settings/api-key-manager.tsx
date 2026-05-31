"use client";

import { useEffect, useState } from "react";
import { BarChart3, Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";

type ApiKeyRow = {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt?: string | null;
};

type UsageRow = {
  day: string;
  count: number;
  keyName: string;
  keyPrefix?: string | null;
};

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("Production API key");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ total: number; days: UsageRow[] }>({ total: 0, days: [] });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadKeys = async () => {
    setLoading(true);
    const [keysResponse, usageResponse] = await Promise.all([fetch("/api/api-keys"), fetch("/api/api-keys/usage")]);
    const data = await keysResponse.json();
    const usageData = await usageResponse.json().catch(() => ({ total: 0, days: [] }));
    if (keysResponse.ok) setKeys(data.keys);
    if (usageResponse.ok) setUsage(usageData);
    setLoading(false);
  };

  useEffect(() => {
    loadKeys().catch(() => {
      toast.error("Could not load API keys");
      setLoading(false);
    });
  }, []);

  const createKey = async () => {
    setCreating(true);
    const response = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    setCreating(false);
    if (!response.ok) {
      toast.error(data.error || "Could not create key");
      return;
    }
    setRawKey(data.rawKey);
    setKeys((current) => [data.key, ...current]);
    toast.success("API key created. Copy it now.");
  };

  const revokeKey = async (id: string) => {
    const response = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Could not revoke key");
      return;
    }
    setKeys((current) => current.filter((key) => key.id !== id));
    toast.success("API key revoked");
  };

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Business API keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Create keys for server-to-server scam checks. Keys work only for Business plan users or admins.</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input id="key-name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <Button onClick={createKey} disabled={creating} className="w-full sm:w-auto">
              {creating ? <><Loader2 className="mr-2 size-4 animate-spin" /> Creating</> : "Create key"}
            </Button>
          </div>
          {rawKey ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <p className="font-semibold">Copy this key now. It will not be shown again.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-xl bg-background p-3 text-xs text-foreground">{rawKey}</code>
                <Button variant="outline" onClick={() => copy(rawKey)}><Copy className="mr-2 size-4" /> Copy</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="size-5" /> API usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-muted-foreground">Last 14 days</p>
            <p className="mt-2 text-3xl font-bold">{usage.total}</p>
          </div>
          {usage.days.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Business API calls recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {usage.days.slice(-7).map((row) => (
                <div key={`${row.day}-${row.keyPrefix || row.keyName}`} className="flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm min-[440px]:flex-row min-[440px]:items-center min-[440px]:justify-between">
                  <span className="break-anywhere">{row.day} · {row.keyName}</span>
                  <span className="font-semibold">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active keys</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-muted-foreground">Loading keys...</p> : keys.length === 0 ? <EmptyState title="No API keys" description="Create a key when you are ready to connect the Business API." /> : keys.map((key) => (
            <div key={key.id} className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="break-anywhere font-medium">{key.name}</p>
                <p className="mt-1 break-anywhere font-mono text-xs text-muted-foreground">{key.maskedKey}</p>
                <p className="mt-1 text-xs text-muted-foreground">Created {new Date(key.createdAt).toLocaleString()} {key.lastUsedAt ? `• Last used ${new Date(key.lastUsedAt).toLocaleString()}` : ""}</p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => revokeKey(key.id)}><Trash2 className="mr-2 size-4" /> Revoke</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
