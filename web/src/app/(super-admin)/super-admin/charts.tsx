"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DayCount = { date: string; count: number };
type StatusCount = { label: string; count: number; color: string };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "0.875rem",
        padding: "1.5rem 1.5rem 1rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "var(--foreground)",
          letterSpacing: "-0.02em",
          marginBottom: "1.25rem",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "0.78rem",
  fontFamily: "var(--font-jakarta)",
  color: "var(--foreground)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export function GymSignupsChart({ data }: { data: DayCount[] }) {
  return (
    <ChartCard title="Gym signups — last 30 days">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="gymGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8460A" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#E8460A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: "0.25rem" }}
            formatter={(v) => [v, "Gyms"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#E8460A"
            strokeWidth={2}
            fill="url(#gymGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#E8460A" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MemberGrowthChart({ data }: { data: DayCount[] }) {
  return (
    <ChartCard title="New members — last 30 days">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.50 0.16 260)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="oklch(0.50 0.16 260)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: "0.25rem" }}
            formatter={(v) => [v, "Members"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="oklch(0.50 0.16 260)"
            strokeWidth={2}
            fill="url(#memberGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "oklch(0.50 0.16 260)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GymStatusChart({ data }: { data: StatusCount[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  return (
    <ChartCard title="Gym status breakdown">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            formatter={(v) => [v, "Gyms"]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
