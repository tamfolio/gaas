"use client";

import { useState, useRef, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Pencil, X } from "lucide-react";
import { createBranch, updateBranch, toggleBranchStatus } from "./actions";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

function BranchSheet({
  branch,
  onClose,
}: {
  branch?: Branch;
  onClose: () => void;
}) {
  const isEdit = !!branch;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = isEdit ? await updateBranch(branch.id, fd) : await createBranch(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 90, backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: "400px", maxWidth: "100vw",
          background: "var(--background)", borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.18)", zIndex: 91,
          overflowY: "auto", display: "flex", flexDirection: "column",
          fontFamily: "var(--font-jakarta)",
        }}
      >
        <div
          style={{
            padding: "1.375rem 1.5rem", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--card)", flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--foreground)", lineHeight: 1 }}>
              {isEdit ? "Edit branch" : "Add branch"}
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>
              {isEdit ? "Update branch details" : "Add a new location to your gym"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "0.375rem", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.375rem", display: "flex", alignItems: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.125rem" }}
        >
          {error && (
            <div style={{ background: "color-mix(in oklch, var(--destructive) 10%, var(--background))", color: "var(--destructive)", fontSize: "0.8rem", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <Label htmlFor="b_name" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Branch name <span style={{ color: "var(--destructive)" }}>*</span>
            </Label>
            <Input id="b_name" name="name" placeholder="e.g. Lekki Phase 1" required defaultValue={branch?.name ?? ""} className="h-10" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <Label htmlFor="b_address" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Address</Label>
            <Input id="b_address" name="address" placeholder="e.g. 14 Admiralty Way, Lekki" defaultValue={branch?.address ?? ""} className="h-10" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <Label htmlFor="b_phone" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Phone</Label>
            <Input id="b_phone" name="phone" type="tel" placeholder="+234 800 000 0000" defaultValue={branch?.phone ?? ""} className="h-10" />
          </div>

          <div style={{ marginTop: "auto", paddingTop: "1.25rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, height: "2.5rem", fontSize: "0.875rem", border: "1px solid var(--border)", borderRadius: "0.5rem", background: "var(--background)", color: "var(--foreground)", cursor: "pointer", fontFamily: "var(--font-jakarta)", fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, height: "2.5rem", fontSize: "0.875rem", border: "none", borderRadius: "0.5rem", background: "var(--primary)", color: "white", cursor: loading ? "default" : "pointer", fontFamily: "var(--font-jakarta)", fontWeight: 600, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add branch")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function BranchesClient({
  branches,
  showAddOnly = false,
}: {
  branches: Branch[];
  showAddOnly?: boolean;
}) {
  const [sheet, setSheet] = useState<"add" | Branch | null>(null);
  const [, startTransition] = useTransition();

  function handleToggle(branch: Branch) {
    startTransition(() => toggleBranchStatus(branch.id, branch.is_active));
  }

  if (showAddOnly) {
    return (
      <>
        <button
          onClick={() => setSheet("add")}
          style={{ background: "var(--primary)", color: "white", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-jakarta)", display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}
        >
          + Add branch
        </button>
        {sheet && (
          <BranchSheet
            branch={sheet === "add" ? undefined : sheet}
            onClose={() => setSheet(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {branches.map((branch) => (
          <div
            key={branch.id}
            style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "0.75rem", padding: "1.25rem",
              opacity: branch.is_active ? 1 : 0.6,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: "0.95rem", color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                  {branch.name}
                </div>
                <span
                  style={{
                    display: "inline-block", marginTop: "0.25rem",
                    fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase",
                    color: branch.is_active ? "var(--primary)" : "var(--muted-foreground)",
                    background: branch.is_active ? "color-mix(in oklch, var(--primary) 10%, transparent)" : "var(--muted)",
                    border: `1px solid ${branch.is_active ? "color-mix(in oklch, var(--primary) 22%, transparent)" : "var(--border)"}`,
                    padding: "0.1rem 0.45rem", borderRadius: "100px",
                  }}
                >
                  {branch.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={() => setSheet(branch)}
                style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "0.375rem", padding: "0.3rem 0.625rem", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", color: "var(--foreground)", fontFamily: "var(--font-jakarta)", display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}
              >
                <Pencil size={11} /> Edit
              </button>
            </div>

            {branch.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <MapPin size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0, marginTop: "0.1rem" }} />
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", lineHeight: 1.4 }}>{branch.address}</span>
              </div>
            )}

            {branch.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: branch.address || branch.phone ? "0.875rem" : 0 }}>
                <Phone size={12} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{branch.phone}</span>
              </div>
            )}

            <div style={{ marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => handleToggle(branch)}
                style={{
                  width: "100%", background: "transparent", border: "1px solid var(--border)",
                  borderRadius: "0.375rem", padding: "0.45rem", fontSize: "0.75rem",
                  fontWeight: branch.is_active ? 400 : 600,
                  cursor: "pointer",
                  color: branch.is_active ? "var(--muted-foreground)" : "var(--primary)",
                  fontFamily: "var(--font-jakarta)",
                  ...(branch.is_active ? {} : { background: "color-mix(in oklch, var(--primary) 10%, transparent)", borderColor: "color-mix(in oklch, var(--primary) 25%, transparent)" }),
                }}
              >
                {branch.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {sheet && (
        <BranchSheet
          branch={sheet === "add" ? undefined : sheet}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  );
}
