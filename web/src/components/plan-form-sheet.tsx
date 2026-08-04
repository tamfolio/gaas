"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Pencil } from "lucide-react";
import { createPlan, updatePlan } from "@/app/(dashboard)/gym-admin/plans/actions";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  branch_access: string;
};

type Branch = { id: string; name: string };

const DURATION_PRESETS = [
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "1 year", days: 365 },
  { label: "Custom", days: 0 },
];

export function PlanFormSheet({
  plan,
  branches = [],
  planBranchIds = [],
}: {
  plan?: Plan;
  branches?: Branch[];
  planBranchIds?: string[];
}) {
  const isEdit = !!plan;

  const matchedPreset = DURATION_PRESETS.find(
    (p) => p.days !== 0 && p.days === plan?.duration_days
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(
    matchedPreset?.days ?? (plan ? 0 : 30)
  );
  const [isCustom, setIsCustom] = useState<boolean>(!matchedPreset && !!plan);
  const [branchAccess, setBranchAccess] = useState<string>(plan?.branch_access ?? "all");
  const formRef = useRef<HTMLFormElement>(null);

  function handlePresetChange(days: number) {
    if (days === 0) {
      setIsCustom(true);
      setSelectedPreset(0);
    } else {
      setIsCustom(false);
      setSelectedPreset(days);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = isEdit ? await updatePlan(plan.id, fd) : await createPlan(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (!isEdit) formRef.current?.reset();
      setOpen(false);
      setLoading(false);
    }
  }

  const isPresetActive = (days: number) =>
    days === 0 ? isCustom : selectedPreset === days;

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
            padding: "0.3rem 0.625rem",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            color: "var(--foreground)",
            fontFamily: "var(--font-jakarta)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            flexShrink: 0,
          }}
        >
          <Pencil size={11} />
          Edit
        </button>
      ) : (
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
          + Create plan
        </button>
      )}

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 90,
              backdropFilter: "blur(2px)",
            }}
          />

          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "420px",
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
                  {isEdit ? "Edit plan" : "Create plan"}
                </h2>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--muted-foreground)",
                    marginTop: "0.2rem",
                  }}
                >
                  {isEdit
                    ? "Update this membership plan"
                    : "Add a new membership plan for your gym"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
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
                gap: "1.25rem",
              }}
            >
              {error && (
                <div
                  style={{
                    background:
                      "color-mix(in oklch, var(--destructive) 10%, var(--background))",
                    color: "var(--destructive)",
                    fontSize: "0.8rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border:
                      "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="name" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Plan name <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Monthly Premium"
                  required
                  defaultValue={plan?.name ?? ""}
                  className="h-10"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="price" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Price <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.875rem",
                      color: "var(--muted-foreground)",
                      pointerEvents: "none",
                      fontWeight: 500,
                      zIndex: 1,
                    }}
                  >
                    ₦
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="15000"
                    required
                    defaultValue={plan?.price ?? ""}
                    className="h-10"
                    style={{ paddingLeft: "1.875rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Duration <span style={{ color: "var(--destructive)" }}>*</span>
                </Label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.375rem",
                  }}
                >
                  {DURATION_PRESETS.slice(0, 4).map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handlePresetChange(preset.days)}
                      style={{
                        padding: "0.5rem 0.25rem",
                        borderRadius: "0.375rem",
                        border: `1px solid ${isPresetActive(preset.days) ? "var(--primary)" : "var(--border)"}`,
                        background: isPresetActive(preset.days)
                          ? "color-mix(in oklch, var(--primary) 10%, var(--background))"
                          : "var(--background)",
                        color: isPresetActive(preset.days)
                          ? "var(--primary)"
                          : "var(--foreground)",
                        fontSize: "0.75rem",
                        fontWeight: isPresetActive(preset.days) ? 600 : 400,
                        cursor: "pointer",
                        fontFamily: "var(--font-jakarta)",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.375rem",
                  }}
                >
                  {DURATION_PRESETS.slice(4).map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => handlePresetChange(preset.days)}
                      style={{
                        padding: "0.5rem 0.25rem",
                        borderRadius: "0.375rem",
                        border: `1px solid ${isPresetActive(preset.days) ? "var(--primary)" : "var(--border)"}`,
                        background: isPresetActive(preset.days)
                          ? "color-mix(in oklch, var(--primary) 10%, var(--background))"
                          : "var(--background)",
                        color: isPresetActive(preset.days)
                          ? "var(--primary)"
                          : "var(--foreground)",
                        fontSize: "0.75rem",
                        fontWeight: isPresetActive(preset.days) ? 600 : 400,
                        cursor: "pointer",
                        fontFamily: "var(--font-jakarta)",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {isCustom ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Input
                      name="duration_days"
                      type="number"
                      min="1"
                      placeholder="e.g. 45"
                      required
                      defaultValue={
                        plan && !matchedPreset ? plan.duration_days : undefined
                      }
                      className="h-10"
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--muted-foreground)",
                        flexShrink: 0,
                      }}
                    >
                      days
                    </span>
                  </div>
                ) : (
                  <input type="hidden" name="duration_days" value={selectedPreset} />
                )}
              </div>

              {branches.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Label style={{ fontSize: "0.8rem", fontWeight: 500 }}>Branch access</Label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(["all", "specific"] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBranchAccess(val)}
                        style={{
                          flex: 1,
                          padding: "0.5rem",
                          borderRadius: "0.375rem",
                          border: `1px solid ${branchAccess === val ? "var(--primary)" : "var(--border)"}`,
                          background: branchAccess === val ? "color-mix(in oklch, var(--primary) 10%, var(--background))" : "var(--background)",
                          color: branchAccess === val ? "var(--primary)" : "var(--foreground)",
                          fontSize: "0.78rem",
                          fontWeight: branchAccess === val ? 600 : 400,
                          cursor: "pointer",
                          fontFamily: "var(--font-jakarta)",
                        }}
                      >
                        {val === "all" ? "All branches" : "Specific branches"}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="branch_access" value={branchAccess} />
                  {branchAccess === "specific" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", padding: "0.75rem", background: "var(--muted)", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", marginBottom: "0.25rem" }}>Select which branches this plan grants access to:</p>
                      {branches.map((b) => (
                        <label key={b.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            name="branch_ids"
                            value={b.id}
                            defaultChecked={planBranchIds.includes(b.id)}
                            style={{ width: "14px", height: "14px", accentColor: "var(--primary)", cursor: "pointer" }}
                          />
                          <span style={{ fontSize: "0.82rem", color: "var(--foreground)", fontWeight: 500 }}>{b.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                <Label htmlFor="description" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="What's included in this plan?"
                  defaultValue={plan?.description ?? ""}
                  rows={3}
                  style={{
                    borderRadius: "0.375rem",
                    border: "1px solid var(--input)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    padding: "0.625rem 0.75rem",
                    fontSize: "0.875rem",
                    fontFamily: "var(--font-jakarta)",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
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
                  {loading
                    ? isEdit
                      ? "Saving…"
                      : "Creating…"
                    : isEdit
                    ? "Save changes"
                    : "Create plan"}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
