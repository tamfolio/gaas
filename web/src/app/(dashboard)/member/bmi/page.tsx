"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordBmi } from "./actions";
import type { BMIRecord } from "@/types";

const CATEGORY_STYLES: Record<
  BMIRecord["category"],
  { color: string; bg: string; border: string; label: string }
> = {
  underweight: {
    color: "oklch(0.45 0.12 220)",
    bg: "oklch(0.96 0.03 220)",
    border: "oklch(0.85 0.06 220)",
    label: "Underweight",
  },
  normal: {
    color: "oklch(0.35 0.12 155)",
    bg: "oklch(0.96 0.04 155)",
    border: "oklch(0.85 0.07 155)",
    label: "Normal",
  },
  overweight: {
    color: "oklch(0.50 0.14 70)",
    bg: "oklch(0.97 0.04 70)",
    border: "oklch(0.87 0.07 70)",
    label: "Overweight",
  },
  obese: {
    color: "var(--destructive)",
    bg: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
    border: "color-mix(in oklch, var(--destructive) 25%, transparent)",
    label: "Obese",
  },
};

export default function BmiPage() {
  // This page needs to be a client component for the form state,
  // but data is passed from the server via a wrapper — see note below.
  // For now we keep it simple: always show a form + note that history will appear after recording.
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("weight_kg", weight);
    fd.set("height_cm", height);
    startTransition(async () => {
      const result = await recordBmi(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setWeight("");
        setHeight("");
        router.refresh();
      }
    });
  }

  const weightNum = parseFloat(weight);
  const heightNum = parseFloat(height);
  const previewBmi =
    !isNaN(weightNum) && !isNaN(heightNum) && weightNum > 0 && heightNum > 0
      ? Math.round((weightNum / Math.pow(heightNum / 100, 2)) * 10) / 10
      : null;

  const previewCategory: BMIRecord["category"] | null =
    previewBmi === null
      ? null
      : previewBmi < 18.5
      ? "underweight"
      : previewBmi < 25
      ? "normal"
      : previewBmi < 30
      ? "overweight"
      : "obese";

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
          BMI Tracker
        </h1>
      </div>

      {/* Log entry form */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
            marginBottom: "1.125rem",
          }}
        >
          Log today&rsquo;s measurements
        </h2>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "color-mix(in oklch, var(--destructive) 10%, var(--background))",
                color: "var(--destructive)",
                fontSize: "0.8rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.125rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                htmlFor="weight"
                style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
              >
                Weight (kg) <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="20"
                max="300"
                placeholder="e.g. 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                style={{
                  height: "2.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  padding: "0 0.75rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <label
                htmlFor="height"
                style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--foreground)" }}
              >
                Height (cm) <span style={{ color: "var(--destructive)" }}>*</span>
              </label>
              <input
                id="height"
                type="number"
                step="0.1"
                min="100"
                max="250"
                placeholder="e.g. 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
                style={{
                  height: "2.5rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  color: "var(--foreground)",
                  padding: "0 0.75rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Live BMI preview */}
          {previewBmi !== null && previewCategory !== null && (
            <div
              style={{
                background: CATEGORY_STYLES[previewCategory].bg,
                border: `1px solid ${CATEGORY_STYLES[previewCategory].border}`,
                borderRadius: "0.5rem",
                padding: "0.875rem 1.125rem",
                marginBottom: "1.125rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--muted-foreground)",
                    marginBottom: "0.125rem",
                  }}
                >
                  Calculated BMI
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: CATEGORY_STYLES[previewCategory].color,
                    lineHeight: 1,
                  }}
                >
                  {previewBmi}
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: CATEGORY_STYLES[previewCategory].color,
                  background: CATEGORY_STYLES[previewCategory].bg,
                  border: `1px solid ${CATEGORY_STYLES[previewCategory].border}`,
                  padding: "0.25rem 0.75rem",
                  borderRadius: "100px",
                }}
              >
                {CATEGORY_STYLES[previewCategory].label}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0 1.25rem",
              height: "2.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "var(--font-jakarta)",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "Saving…" : "Save measurement"}
          </button>
        </form>
      </div>

      {/* Reference ranges */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.75rem",
          padding: "1.25rem 1.5rem",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--foreground)",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          BMI Reference Ranges
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(Object.entries(CATEGORY_STYLES) as [BMIRecord["category"], typeof CATEGORY_STYLES[BMIRecord["category"]]][]).map(
            ([key, s]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.82rem",
                  color: "var(--muted-foreground)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    fontWeight: 500,
                    color: s.color,
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: s.color,
                      display: "inline-block",
                    }}
                  />
                  {s.label}
                </span>
                <span>
                  {key === "underweight" && "< 18.5"}
                  {key === "normal" && "18.5 – 24.9"}
                  {key === "overweight" && "25 – 29.9"}
                  {key === "obese" && "≥ 30"}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
