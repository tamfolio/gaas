import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScanLine } from "lucide-react";
import { CheckInCalendar } from "./checkin-calendar";

export default async function CheckInsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user.id)
    .single();
  if (!profile?.gym_id) redirect("/login");

  const { data: member } = await supabase
    .from("gym_members")
    .select("id")
    .eq("profile_id", user.id)
    .eq("gym_id", profile.gym_id)
    .single();

  // Separate queries: calendar needs all successful timestamps; table needs recent 100 with status
  const [{ data: checkIns, count }, { data: calendarRows }] = await Promise.all([
    member
      ? supabase
          .from("check_ins")
          .select("id, checked_in_at, status", { count: "exact" })
          .eq("gym_member_id", member.id)
          .order("checked_in_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], count: 0 }),
    member
      ? supabase
          .from("check_ins")
          .select("checked_in_at")
          .eq("gym_member_id", member.id)
          .eq("status", "success")
      : Promise.resolve({ data: [] }),
  ]);

  const calendarTimestamps = (calendarRows ?? []).map((r) => r.checked_in_at as string);
  const successCount = checkIns?.filter((c) => c.status === "success").length ?? 0;

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "720px" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <p
          style={{
            fontSize: "0.68rem",
            color: "var(--muted-foreground)",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.2rem",
          }}
        >
          Member
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
            lineHeight: 1.1,
          }}
        >
          Check-in History
        </h1>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          { label: "Total Visits", value: count ?? 0 },
          { label: "Successful", value: successCount },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
                marginBottom: "0.375rem",
              }}
            >
              {stat.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "2rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--foreground)",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <CheckInCalendar timestamps={calendarTimestamps} />

      {/* Table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px",
            padding: "0.7rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--muted)",
          }}
        >
          {["Date & Time", "Status"].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {!checkIns || checkIns.length === 0 ? (
          <div style={{ padding: "4rem 1.25rem", textAlign: "center" }}>
            <ScanLine
              size={32}
              style={{
                margin: "0 auto 0.75rem",
                color: "var(--muted-foreground)",
                opacity: 0.3,
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--foreground)",
                marginBottom: "0.375rem",
              }}
            >
              No check-ins yet
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
              Scan the QR code at the gym entrance to log a visit.
            </p>
          </div>
        ) : (
          checkIns.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px",
                padding: "0.875rem 1.25rem",
                borderBottom: i < checkIns.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
              }}
            >
              <div>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>
                  {new Date(c.checked_in_at).toLocaleDateString("en-NG", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span
                  style={{
                    marginLeft: "0.625rem",
                    fontSize: "0.78rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {new Date(c.checked_in_at).toLocaleTimeString("en-NG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.625rem",
                  borderRadius: "100px",
                  width: "fit-content",
                  background:
                    c.status === "success"
                      ? "color-mix(in oklch, var(--primary) 12%, transparent)"
                      : "color-mix(in oklch, var(--destructive) 10%, transparent)",
                  color:
                    c.status === "success" ? "var(--primary)" : "var(--destructive)",
                  border: `1px solid ${
                    c.status === "success"
                      ? "color-mix(in oklch, var(--primary) 25%, transparent)"
                      : "color-mix(in oklch, var(--destructive) 25%, transparent)"
                  }`,
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background:
                      c.status === "success" ? "var(--primary)" : "var(--destructive)",
                    display: "inline-block",
                  }}
                />
                {c.status}
              </span>
            </div>
          ))
        )}
      </div>

      {count !== null && count > 100 && (
        <p style={{ marginTop: "0.875rem", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
          Showing 100 most recent check-ins
        </p>
      )}
    </div>
  );
}
