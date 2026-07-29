"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Pencil, Check, Trash2 } from "lucide-react";
import { updateTrainerProfile, removeTrainer } from "./actions";
import type { TrainerRow } from "./trainers-client";

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

const textareaStyle: React.CSSProperties = {
  borderRadius: "0.375rem",
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--foreground)",
  padding: "0.625rem 0.75rem",
  fontSize: "0.875rem",
  fontFamily: "var(--font-jakarta)",
  outline: "none",
  width: "100%",
  resize: "vertical",
  minHeight: "80px",
  lineHeight: 1.5,
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
  return <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>{children}</div>;
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

export function TrainerDetailSheet({
  trainer,
  onClose,
}: {
  trainer: TrainerRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [panel, setPanel] = useState<"view" | "edit">("view");
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const p = trainer.profiles;
  const initials =
    p?.full_name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const [editName, setEditName] = useState(p?.full_name ?? "");
  const [editPhone, setEditPhone] = useState(p?.phone ?? "");
  const [editSpecialization, setEditSpecialization] = useState(trainer.specialization ?? "");
  const [editBio, setEditBio] = useState(trainer.bio ?? "");

  function submitEdit() {
    setError(null);
    const fd = new FormData();
    fd.set("gym_trainer_id", trainer.id);
    fd.set("profile_id", trainer.profile_id);
    fd.set("full_name", editName);
    fd.set("phone", editPhone);
    fd.set("specialization", editSpecialization);
    fd.set("bio", editBio);

    startTransition(async () => {
      const result = await updateTrainerProfile(fd);
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
      const result = await removeTrainer(trainer.id, trainer.profile_id);
      if (result?.error) {
        setError(result.error);
        setConfirmRemove(false);
      } else {
        router.refresh();
        onClose();
      }
    });
  }

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
            Trainer profile
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
                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{p.phone}</div>
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

          {/* Edit form */}
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
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={inputStyle} />
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
              <Field>
                <Label>Specialization</Label>
                <input
                  value={editSpecialization}
                  onChange={(e) => setEditSpecialization(e.target.value)}
                  placeholder="e.g. Strength & Conditioning"
                  style={inputStyle}
                />
              </Field>
              <Field>
                <Label>Bio</Label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Short bio…"
                  style={textareaStyle}
                />
              </Field>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => { setPanel("view"); setError(null); }}
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

          {/* Info card */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.25rem",
            }}
          >
            <SectionTitle>Details</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {trainer.specialization && (
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                    Specialization
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--primary)",
                      background: "color-mix(in oklch, var(--primary) 10%, transparent)",
                      border: "1px solid color-mix(in oklch, var(--primary) 20%, transparent)",
                      padding: "0.2rem 0.625rem",
                      borderRadius: "100px",
                    }}
                  >
                    {trainer.specialization}
                  </span>
                </div>
              )}
              {trainer.bio && (
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                    Bio
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--foreground)", lineHeight: 1.6 }}>
                    {trainer.bio}
                  </p>
                </div>
              )}
              <div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                  Joined
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--foreground)" }}>
                  {new Date(trainer.created_at).toLocaleDateString("en-NG", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Remove trainer */}
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
              Remove trainer
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
                This will remove <strong>{p?.full_name}</strong> from your gym. Their account will be de-linked.
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
