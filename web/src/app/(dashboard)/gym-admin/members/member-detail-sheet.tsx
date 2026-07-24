"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, RotateCcw, UserX, UserCheck, Pencil, Check, Trash2 } from "lucide-react";
import { renewMembership, updateMemberStatus, updateMemberProfile, getMemberPayments, removeMember } from "./actions";
import type { MemberRow, Plan } from "./members-client";

type PaymentRecord = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  paid_at: string | null;
  created_at: string;
};

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "pos", label: "POS Terminal" },
  { value: "transfer", label: "Bank Transfer" },
];

function daysBetween(a: string, b: string) {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function today() {
  return new Date().toISOString().split("T")[0];
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

const inputStyle: React.CSSProperties = {
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: "0.78rem",
        fontWeight: 500,
        color: "var(--foreground)",
        marginBottom: "0.3rem",
        display: "block",
      }}
    >
      {children}
    </span>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "0.62rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--muted-foreground)",
        marginBottom: "0.875rem",
      }}
    >
      {children}
    </p>
  );
}

function InlineError({ msg }: { msg: string }) {
  return (
    <div
      style={{
        background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
        color: "var(--destructive)",
        fontSize: "0.78rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "0.5rem",
        border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
      }}
    >
      {msg}
    </div>
  );
}

export function MemberDetailSheet({
  member,
  plans,
  gymId,
  onClose,
}: {
  member: MemberRow;
  plans: Plan[];
  gymId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [panel, setPanel] = useState<"view" | "renew" | "edit">("view");
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    setPaymentsLoading(true);
    getMemberPayments(member.id).then((data) => {
      setPayments(data as PaymentRecord[]);
      setPaymentsLoading(false);
    });
  }, [member.id]);

  // Renew form state
  const defaultPlanId = member.membership_plans?.id ?? (plans[0]?.id ?? "");
  const [renewPlanId, setRenewPlanId] = useState(defaultPlanId);
  const [renewMethod, setRenewMethod] = useState("cash");
  const [renewAmount, setRenewAmount] = useState(
    String(member.membership_plans?.price ?? "")
  );
  const renewDefaultStart =
    member.end_date && daysUntil(member.end_date) > 0
      ? member.end_date
      : today();
  const [renewStart, setRenewStart] = useState(renewDefaultStart);

  // Edit profile state
  const [editName, setEditName] = useState(member.profiles?.full_name ?? "");
  const [editPhone, setEditPhone] = useState(member.profiles?.phone ?? "");

  const p = member.profiles;
  const initials =
    p?.full_name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const plan = member.membership_plans;
  const daysLeft = member.end_date ? daysUntil(member.end_date) : null;
  const totalDays =
    member.start_date && member.end_date
      ? daysBetween(member.start_date, member.end_date)
      : plan?.duration_days ?? 0;
  const progressPct =
    daysLeft !== null && totalDays > 0
      ? Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100))
      : 0;

  function handleRenewPlanChange(planId: string) {
    setRenewPlanId(planId);
    const found = plans.find((p) => p.id === planId);
    if (found) setRenewAmount(String(found.price));
  }

  function submitRenew() {
    setError(null);
    const fd = new FormData();
    fd.set("gym_member_id", member.id);
    fd.set("gym_id", gymId);
    fd.set("plan_id", renewPlanId);
    fd.set("payment_method", renewMethod);
    fd.set("payment_amount", renewAmount);
    fd.set("start_date", renewStart);

    startTransition(async () => {
      const result = await renewMembership(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  function submitStatusToggle(newStatus: "active" | "suspended") {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberStatus(member.id, newStatus);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  function submitEdit() {
    setError(null);
    const fd = new FormData();
    fd.set("profile_id", p?.id ?? "");
    fd.set("full_name", editName);
    fd.set("phone", editPhone);

    startTransition(async () => {
      const result = await updateMemberProfile(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  function submitRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeMember(member.id, p?.id ?? "");
      if (result?.error) {
        setError(result.error);
        setConfirmRemove(false);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

  const canSuspend = member.status === "active";
  const canActivate = member.status === "suspended" || member.status === "pending";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 90,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "440px",
          maxWidth: "100vw",
          background: "var(--background)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.18)",
          zIndex: 91,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        {/* Sheet header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--card)",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "1rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
            }}
          >
            Member profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "0.375rem",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              padding: "0.375rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Avatar + identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "color-mix(in oklch, var(--primary) 14%, var(--muted))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--primary)",
                flexShrink: 0,
                border: "2px solid color-mix(in oklch, var(--primary) 25%, transparent)",
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                }}
              >
                {p?.full_name ?? "—"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.15rem" }}>
                {p?.email ?? "—"}
              </div>
              {p?.phone && (
                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
                  {p.phone}
                </div>
              )}
            </div>
            <button
              onClick={() => setPanel(panel === "edit" ? "view" : "edit")}
              title="Edit profile"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                padding: "0.375rem",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Pencil size={13} />
            </button>
          </div>

          {/* Edit profile form */}
          {panel === "edit" && (
            <div
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "0.625rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <SectionTitle>Edit profile</SectionTitle>
              {error && <InlineError msg={error} />}
              <Field>
                <Label>Full name</Label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field>
                <Label>Phone</Label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  style={inputStyle}
                />
              </Field>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPanel("view")}
                  style={{
                    flex: 1,
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitEdit}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "var(--foreground)",
                    color: "var(--background)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-jakarta)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Check size={13} />
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Membership card */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
            }}
          >
            <SectionTitle>Membership</SectionTitle>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.875rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  Plan
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>
                  {plan?.name ?? "No plan"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  Status
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color:
                      member.status === "active"
                        ? "var(--primary)"
                        : member.status === "pending"
                        ? "oklch(0.55 0.12 70)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {member.status}
                </span>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  Started
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                  {member.start_date
                    ? new Date(member.start_date).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  Expires
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: daysLeft !== null && daysLeft <= 7 ? 600 : 400,
                    color:
                      daysLeft === null
                        ? "var(--foreground)"
                        : daysLeft <= 0
                        ? "var(--destructive)"
                        : daysLeft <= 7
                        ? "oklch(0.65 0.15 55)"
                        : "var(--foreground)",
                  }}
                >
                  {member.end_date
                    ? new Date(member.end_date).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {member.start_date && member.end_date && (
              <div>
                <div
                  style={{
                    height: "5px",
                    borderRadius: "100px",
                    background: "var(--muted)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background:
                        daysLeft !== null && daysLeft <= 0
                          ? "var(--destructive)"
                          : daysLeft !== null && daysLeft <= 7
                          ? "oklch(0.65 0.15 55)"
                          : "var(--primary)",
                      borderRadius: "100px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "0.7rem",
                    color: "var(--muted-foreground)",
                    textAlign: "right",
                  }}
                >
                  {daysLeft !== null && daysLeft > 0
                    ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`
                    : daysLeft === 0
                    ? "Expires today"
                    : "Expired"}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {panel === "view" && (
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <button
                onClick={() => { setPanel("renew"); setError(null); }}
                style={{
                  flex: 1,
                  height: "2.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "var(--primary)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <RotateCcw size={14} />
                Renew
              </button>

              {canSuspend && (
                <button
                  onClick={() => submitStatusToggle("suspended")}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    height: "2.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--destructive)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-jakarta)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <UserX size={14} />
                  {isPending ? "…" : "Suspend"}
                </button>
              )}

              {canActivate && (
                <button
                  onClick={() => submitStatusToggle("active")}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    height: "2.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
                    background: "color-mix(in oklch, var(--primary) 8%, var(--background))",
                    color: "var(--primary)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-jakarta)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <UserCheck size={14} />
                  {isPending ? "…" : "Activate"}
                </button>
              )}
            </div>
          )}

          {/* Renewal form */}
          {panel === "renew" && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <SectionTitle>Renew membership</SectionTitle>

              {error && <InlineError msg={error} />}

              {plans.length > 0 ? (
                <>
                  <Field>
                    <Label>Plan</Label>
                    <select
                      value={renewPlanId}
                      onChange={(e) => handleRenewPlanChange(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select plan</option>
                      {plans.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.name} — ₦{pl.price.toLocaleString("en-NG")} / {pl.duration_days}d
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field>
                    <Label>Payment method</Label>
                    <select
                      value={renewMethod}
                      onChange={(e) => setRenewMethod(e.target.value)}
                      style={selectStyle}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field>
                    <Label>Amount paid (₦)</Label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={renewAmount}
                      onChange={(e) => setRenewAmount(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>

                  <Field>
                    <Label>Start date</Label>
                    <input
                      type="date"
                      value={renewStart}
                      onChange={(e) => setRenewStart(e.target.value)}
                      style={inputStyle}
                    />
                    {renewPlanId && (() => {
                      const pl = plans.find((p) => p.id === renewPlanId);
                      if (!pl || !renewStart) return null;
                      const end = new Date(renewStart);
                      end.setDate(end.getDate() + pl.duration_days);
                      return (
                        <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                          New expiry:{" "}
                          {end.toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      );
                    })()}
                  </Field>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => { setPanel("view"); setError(null); }}
                      style={{
                        flex: 1,
                        height: "2.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                        background: "var(--background)",
                        color: "var(--foreground)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontFamily: "var(--font-jakarta)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitRenew}
                      disabled={isPending || !renewPlanId}
                      style={{
                        flex: 1,
                        height: "2.5rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        background: "var(--primary)",
                        color: "#fff",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: isPending || !renewPlanId ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-jakarta)",
                        opacity: isPending || !renewPlanId ? 0.6 : 1,
                      }}
                    >
                      {isPending ? "Processing…" : "Confirm renewal"}
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                  No active plans. Create a membership plan first.
                </p>
              )}
            </div>
          )}

          {/* Payment history */}
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
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <SectionTitle>Payment history</SectionTitle>
            </div>

            {paymentsLoading ? (
              <div style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                  Loading…
                </span>
              </div>
            ) : !payments || payments.length === 0 ? (
              <div style={{ padding: "1.5rem 1.25rem", textAlign: "center" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                  No payments recorded yet.
                </span>
              </div>
            ) : (
              payments.map((pay, i) => {
                const statusColor =
                  pay.status === "paid" || pay.status === "completed"
                    ? "var(--primary)"
                    : pay.status === "pending"
                    ? "oklch(0.62 0.12 80)"
                    : "var(--destructive)";
                return (
                  <div
                    key={pay.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1.25rem",
                      borderBottom:
                        i < payments.length - 1 ? "1px solid var(--border)" : "none",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--foreground)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pay.description || "Payment"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                        {(pay.paid_at ?? pay.created_at)
                          ? new Date(pay.paid_at ?? pay.created_at).toLocaleDateString(
                              "en-NG",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--foreground)",
                          fontFamily: "var(--font-syne)",
                        }}
                      >
                        ₦{pay.amount.toLocaleString("en-NG")}
                      </div>
                      <div
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 600,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: statusColor,
                        }}
                      >
                        {pay.status}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Remove member */}
          {!confirmRemove ? (
            <button
              onClick={() => setConfirmRemove(true)}
              style={{
                alignSelf: "flex-start",
                background: "none",
                border: "none",
                color: "var(--destructive)",
                fontSize: "0.8rem",
                cursor: "pointer",
                fontFamily: "var(--font-jakarta)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0",
                opacity: 0.7,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <Trash2 size={13} />
              Remove member
            </button>
          ) : (
            <div
              style={{
                background: "color-mix(in oklch, var(--destructive) 8%, var(--background))",
                border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                borderRadius: "0.625rem",
                padding: "1rem 1.25rem",
              }}
            >
              {error && <InlineError msg={error} />}
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--foreground)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                This will remove <strong>{p?.full_name}</strong> from your gym. Their account will be de-linked but payment history is kept.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setConfirmRemove(false)}
                  style={{
                    flex: 1,
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitRemove}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    background: "var(--destructive)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: isPending ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {isPending ? "Removing…" : "Yes, remove"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
