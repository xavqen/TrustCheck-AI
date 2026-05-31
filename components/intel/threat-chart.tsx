"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DailyBucket = { day: string; safe: number; suspicious: number; dangerous: number };

export function ThreatChart({ data }: { data: DailyBucket[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>30-day risk trend</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="dangerous" stackId="1" stroke="currentColor" fill="currentColor" fillOpacity={0.25} />
            <Area type="monotone" dataKey="suspicious" stackId="1" stroke="currentColor" fill="currentColor" fillOpacity={0.15} />
            <Area type="monotone" dataKey="safe" stackId="1" stroke="currentColor" fill="currentColor" fillOpacity={0.08} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
