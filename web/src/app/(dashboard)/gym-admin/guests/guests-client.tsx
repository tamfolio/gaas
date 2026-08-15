"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { logGuestVisit } from "./actions";

type Visit = {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  visited_at: string;
  member: { id: string; profile: { full_name: string } | null } | null;
};

type EligibleMember = {
  id: string;
  profile: { full_name: string } | null;
  membership_plan: { guest_passes_per_month: number } | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GuestVisitsClient({
  visits,
  eligibleMembers,
}: {
  visits: Visit[];
  eligibleMembers: EligibleMember[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await logGuestVisit(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      formRef.current?.reset();
      setShowForm(false);
      setLoading(false);
    }
  }

  const selectStyle: React.CSSProperties = {
    height: "2.5rem",
    borderRadius: "0.375rem",
    border: "1px solid var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
    padding: "0 0.75rem",
    fontSize: "0.875rem",
    fontFamily: "var(--font-jakarta)",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
            Manage
          </p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--foreground)", lineHeight: 1.1 }}>
            Guest Visits
            {visits.length > 0 && (
              <span style={{ marginLeft: "0.625rem", fontSize: "0.875rem", fontFamily: "var(--font-jakarta)", fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0" }}>
                {visits.length}
              </span>
            )}
          </h1>
        </div>
        {eligibleMembers.length > 0 && (
          <button
            onClick={() => setShowForm((v) => !v)}
            style={{
              background: "var(--primary)", color: "white", border: "none",
              borderRadius: "0.5rem", padding: "0.6rem 1.25rem",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-jakarta)", flexShrink: 0,
            }}
          >
            + Log guest visit
          </button>
        )}
      </div>

      {/* Log form */}
      {showForm && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", padding: "1.5rem", marginBottom: "1.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}>
            Log a guest visit
          </h2>
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ background: "color-mix(in oklch, var(--destructive) 10%, var(--background))", color: "var(--destructive)", fontSize: "0.8rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Member <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <select name="member_id" required style={selectStyle}>
                  <option value="">Select member</option>
                  {eligibleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.profile?.full_name ?? "Unknown"} — {m.membership_plan?.guest_passes_per_month ?? 0} pass/mo
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Visit date
                </Label>
                <Input
                  name="visited_at"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="h-10"
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                Guest name <span style={{ color: "var(--destructive)" }}>*</span>
              </Label>
              <Input name="guest_name" placeholder="e.g. Chidi Nwosu" required className="h-10" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Guest phone</Label>
                <Input name="guest_phone" type="tel" placeholder="+234 800 000 0000" className="h-10" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Guest email</Label>
                <Input name="guest_email" type="email" placeholder="guest@example.com" className="h-10" />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} style={{ height: "2.5rem", fontSize: "0.875rem" }}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} style={{ height: "2.5rem", fontSize: "0.875rem", background: "var(--primary)", color: "white", border: "none" }}>
                {loading ? "Saving…" : "Log visit"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* No eligible members warning */}
      {eligibleMembers.length === 0 && (
        <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem 1.5rem", marginBottom: "1.75rem", fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
          No active members have a plan with guest passes. Enable guest passes on a plan in <strong style={{ color: "var(--foreground)" }}>Plans</strong> to allow members to bring guests.
        </div>
      )}

      {/* Visits table */}
      {visits.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "4rem 1.25rem", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◈</div>
          <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "1rem", color: "var(--foreground)", marginBottom: "0.375rem" }}>No guest visits yet</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Guest visit records will appear here once logged.</p>
        </div>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.875rem", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-jakarta)", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Guest", "Contact", "Member", "Date"].map((h) => (
                    <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visits.map((v, i) => (
                  <tr key={v.id} style={{ borderBottom: i < visits.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "var(--foreground)" }}>
                      {v.guest_name}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--muted-foreground)" }}>
                      <div>{v.guest_phone ?? "—"}</div>
                      {v.guest_email && <div style={{ fontSize: "0.78rem" }}>{v.guest_email}</div>}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--foreground)" }}>
                      {(v.member as { profile: { full_name: string } | null } | null)?.profile?.full_name ?? "—"}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                      {formatDate(v.visited_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
