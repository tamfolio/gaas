"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addMember } from "@/app/(dashboard)/gym-admin/members/actions";
import { X } from "lucide-react";

type Plan = { id: string; name: string; price: number; duration_days: number };

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "pos", label: "POS Terminal" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "none", label: "Not yet paid" },
];

export function AddMemberSheet({
  gymId,
  plans,
}: {
  gymId: string;
  plans: Plan[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentAmount, setPaymentAmount] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;
  const notPaid = paymentMethod === "none";

  function handlePlanChange(planId: string) {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) setPaymentAmount(String(plan.price));
    else setPaymentAmount("");
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setSelectedPlanId("");
    setPaymentMethod("cash");
    setPaymentAmount("");
    formRef.current?.reset();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("gym_id", gymId);
    const result = await addMember(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      handleClose();
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
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          padding: "0.6rem 1.25rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "var(--font-jakarta)",
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          flexShrink: 0,
        }}
      >
        + Add member
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
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
            {/* Header */}
            <div
              style={{
                padding: "1.375rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--card)",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "var(--foreground)",
                    lineHeight: 1,
                  }}
                >
                  Add member
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--muted-foreground)",
                    marginTop: "0.2rem",
                  }}
                >
                  Create a new gym member account
                </p>
              </div>
              <button
                onClick={handleClose}
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

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              style={{
                flex: 1,
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.125rem",
              }}
            >
              {error && (
                <div
                  style={{
                    background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
                    color: "var(--destructive)",
                    fontSize: "0.8rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                  }}
                >
                  {error}
                </div>
              )}

              {/* ── Member details ── */}
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.875rem" }}>
                  Member details
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <Label htmlFor="full_name" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Full name <span style={{ color: "var(--destructive)" }}>*</span>
                    </Label>
                    <Input id="full_name" name="full_name" placeholder="e.g. Amaka Okafor" required className="h-10" />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <Label htmlFor="email" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Email <span style={{ color: "var(--destructive)" }}>*</span>
                    </Label>
                    <Input id="email" name="email" type="email" placeholder="member@example.com" required className="h-10" />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <Label htmlFor="phone" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Phone</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+234 800 000 0000" className="h-10" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* ── Membership ── */}
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.875rem" }}>
                  Membership
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {plans.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                      <Label htmlFor="plan" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        Plan <span style={{ color: "var(--destructive)" }}>*</span>
                      </Label>
                      <select
                        id="plan"
                        name="membership_plan_id"
                        required
                        value={selectedPlanId}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Select a plan</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₦{p.price.toLocaleString("en-NG")} / {p.duration_days}d
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* ── Payment ── */}
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: "0.875rem" }}>
                  Payment
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <Label htmlFor="payment_method" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      Payment method <span style={{ color: "var(--destructive)" }}>*</span>
                    </Label>
                    <select
                      id="payment_method"
                      name="payment_method"
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={selectStyle}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  {!notPaid && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                        <Label htmlFor="payment_amount" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                          Amount paid (₦) <span style={{ color: "var(--destructive)" }}>*</span>
                        </Label>
                        <Input
                          id="payment_amount"
                          name="payment_amount"
                          type="number"
                          min="0"
                          step="100"
                          placeholder={selectedPlan ? String(selectedPlan.price) : "0"}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          required={!notPaid}
                          className="h-10"
                        />
                      </div>

                      {paymentMethod === "transfer" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          <Label htmlFor="payment_reference" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                            Transfer reference
                          </Label>
                          <Input
                            id="payment_reference"
                            name="payment_reference"
                            placeholder="e.g. TRF2024001"
                            className="h-10"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {notPaid && (
                    <div
                      style={{
                        background: "color-mix(in oklch, oklch(0.50 0.12 70) 8%, var(--muted))",
                        border: "1px solid color-mix(in oklch, oklch(0.50 0.12 70) 20%, transparent)",
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.78rem",
                        color: "var(--foreground)",
                        lineHeight: 1.6,
                      }}
                    >
                      Member will be added with <strong>pending</strong> status. Membership duration starts when payment is recorded.
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    <Label htmlFor="start_date" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {notPaid ? "Registration date" : "Payment date"}
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="h-10"
                    />
                    {!notPaid && selectedPlan && (
                      <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                        Membership runs for {selectedPlan.duration_days} days from this date.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* Email notice */}
              <div
                style={{
                  background: "color-mix(in oklch, var(--primary) 8%, var(--muted))",
                  border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  fontSize: "0.78rem",
                  color: "var(--foreground)",
                  lineHeight: 1.6,
                }}
              >
                A temporary password will be auto-generated and emailed to the member. They will be prompted to change it on first login.
              </div>

              {/* Actions */}
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "0.5rem",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  style={{ flex: 1, height: "2.5rem", fontSize: "0.875rem" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: "2.5rem",
                    fontSize: "0.875rem",
                    background: "var(--primary)",
                    color: "white",
                    border: "none",
                  }}
                >
                  {loading ? "Adding…" : "Add member"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
