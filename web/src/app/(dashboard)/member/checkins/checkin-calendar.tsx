"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CheckInCalendar({ timestamps }: { timestamps: string[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Convert timestamps to local-date strings once
  const checkInDates = useMemo(() => {
    const s = new Set<string>();
    timestamps.forEach((ts) => {
      const d = new Date(ts);
      s.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    });
    return s;
  }, [timestamps]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const isFuture = (day: number) => new Date(year, month, day) > today;

  const canGoNext =
    !(year === today.getFullYear() && month === today.getMonth());

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "0.875rem",
        padding: "1.25rem",
        marginBottom: "1.75rem",
      }}
    >
      {/* Month nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={goPrev}
          style={{
            background: "none", border: "1px solid var(--border)", borderRadius: "0.375rem",
            padding: "0.3rem 0.5rem", cursor: "pointer", color: "var(--foreground)",
            display: "flex", alignItems: "center",
          }}
        >
          <ChevronLeft size={15} />
        </button>

        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
          }}
        >
          {MONTHS[month]} {year}
        </p>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          style={{
            background: "none", border: "1px solid var(--border)", borderRadius: "0.375rem",
            padding: "0.3rem 0.5rem", cursor: canGoNext ? "pointer" : "not-allowed",
            color: canGoNext ? "var(--foreground)" : "var(--muted-foreground)",
            opacity: canGoNext ? 1 : 0.4, display: "flex", alignItems: "center",
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Day labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.25rem",
          marginBottom: "0.375rem",
        }}
      >
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "var(--muted-foreground)",
              padding: "0.25rem 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const attended = checkInDates.has(dateStr(day));
          const todayCell = isToday(day);
          const future = isFuture(day);

          return (
            <div
              key={day}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.78rem",
                  fontWeight: attended ? 700 : todayCell ? 600 : 400,
                  background: attended
                    ? "var(--primary)"
                    : todayCell
                    ? "var(--muted)"
                    : "transparent",
                  color: attended
                    ? "#fff"
                    : future
                    ? "var(--muted-foreground)"
                    : "var(--foreground)",
                  border: todayCell && !attended ? "1px solid var(--border)" : "none",
                  opacity: future ? 0.35 : 1,
                }}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      <p
        style={{
          marginTop: "0.875rem",
          fontSize: "0.7rem",
          color: "var(--muted-foreground)",
          textAlign: "center",
        }}
      >
        Orange = days you checked in
      </p>
    </div>
  );
}
