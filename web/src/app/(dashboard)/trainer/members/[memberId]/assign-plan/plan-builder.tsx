"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Trash2, Plus, Dumbbell } from "lucide-react";
import { assignWorkoutPlan } from "./actions";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Exercise = {
  id: string;
  name: string;
  category: string | null;
  muscles: string[];
  equipment: string[];
  image_url: string | null;
};

type ExerciseEntry = {
  key: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
};

type DayState = {
  day: string;
  exercises: ExerciseEntry[];
};

function ExerciseSearch({
  dayName,
  onAdd,
}: {
  dayName: string;
  onAdd: (exercise: Exercise) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/exercises?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (ex: Exercise) => {
    onAdd(ex);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: "0.875rem" }}>
      <div style={{ position: "relative" }}>
        <Search
          size={13}
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted-foreground)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder={`Search exercises to add to ${dayName}…`}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{
            width: "100%",
            padding: "0.55rem 0.875rem 0.55rem 2.25rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            fontSize: "0.82rem",
            color: "var(--foreground)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {loading && (
          <span
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.65rem",
              color: "var(--muted-foreground)",
            }}
          >
            …
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.625rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {results.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => handleSelect(ex)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.875rem",
                background: "none",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--muted)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "none")
              }
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.375rem",
                  background: "var(--muted)",
                  flexShrink: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ex.image_url ? (
                  <img
                    src={ex.image_url}
                    alt={ex.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Dumbbell size={14} style={{ color: "var(--muted-foreground)" }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ex.name}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--muted-foreground)" }}>
                  {[ex.category, ex.muscles?.[0]].filter(Boolean).join(" · ")}
                </p>
              </div>

              <Plus size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query.trim() && !loading && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.625rem",
            padding: "0.875rem",
            fontSize: "0.8rem",
            color: "var(--muted-foreground)",
            zIndex: 50,
          }}
        >
          No exercises found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onRemoveDay,
}: {
  day: DayState;
  onAddExercise: (dayName: string, exercise: Exercise) => void;
  onRemoveExercise: (dayName: string, key: string) => void;
  onUpdateExercise: (
    dayName: string,
    key: string,
    field: "sets" | "reps" | "rest_seconds" | "notes",
    value: string | number
  ) => void;
  onRemoveDay: (dayName: string) => void;
}) {
  const numStyle = {
    width: "52px",
    padding: "0.3rem 0.4rem",
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "0.375rem",
    fontSize: "0.8rem",
    color: "var(--foreground)",
    textAlign: "center" as const,
    outline: "none",
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "0.875rem",
        overflow: "hidden",
        marginBottom: "1rem",
      }}
    >
      {/* Day header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--muted)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "var(--foreground)",
          }}
        >
          {day.day}
          {day.exercises.length > 0 && (
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.68rem",
                fontWeight: 500,
                color: "var(--muted-foreground)",
              }}
            >
              {day.exercises.length} exercise{day.exercises.length !== 1 ? "s" : ""}
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => onRemoveDay(day.day)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            padding: "0.2rem",
            display: "flex",
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "1rem 1.1rem" }}>
        {/* Search */}
        <ExerciseSearch
          dayName={day.day}
          onAdd={(ex) => onAddExercise(day.day, ex)}
        />

        {/* Exercise list */}
        {day.exercises.length === 0 ? (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--muted-foreground)",
              textAlign: "center",
              padding: "0.875rem 0",
            }}
          >
            Search and add exercises above
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {day.exercises.map((entry) => (
              <div
                key={entry.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.75rem",
                  background: "var(--muted)",
                  borderRadius: "0.5rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {entry.name}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <label style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
                        Sets
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={entry.sets}
                        onChange={(e) =>
                          onUpdateExercise(day.day, entry.key, "sets", parseInt(e.target.value) || 1)
                        }
                        style={numStyle}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <label style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
                        Reps
                      </label>
                      <input
                        type="text"
                        value={entry.reps}
                        placeholder="10"
                        onChange={(e) =>
                          onUpdateExercise(day.day, entry.key, "reps", e.target.value)
                        }
                        style={{ ...numStyle, width: "60px" }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <label style={{ fontSize: "0.65rem", color: "var(--muted-foreground)", fontWeight: 500 }}>
                        Rest (s)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={15}
                        value={entry.rest_seconds}
                        onChange={(e) =>
                          onUpdateExercise(day.day, entry.key, "rest_seconds", parseInt(e.target.value) || 0)
                        }
                        style={{ ...numStyle, width: "60px" }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveExercise(day.day, entry.key)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                    padding: "0.25rem",
                    display: "flex",
                    alignSelf: "flex-start",
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanBuilder({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [days, setDays] = useState<DayState[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
        setDays((d) => d.filter((x) => x.day !== day));
      } else {
        next.add(day);
        setDays((d) => {
          if (d.find((x) => x.day === day)) return d;
          const updated = [...d, { day, exercises: [] }];
          updated.sort(
            (a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day)
          );
          return updated;
        });
      }
      return next;
    });
  };

  const addExercise = (dayName: string, exercise: Exercise) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  key: `${exercise.id}-${Math.random().toString(36).slice(2)}`,
                  exerciseId: exercise.id,
                  name: exercise.name,
                  sets: 3,
                  reps: "10",
                  rest_seconds: 60,
                  notes: "",
                },
              ],
            }
          : d
      )
    );
  };

  const removeExercise = (dayName: string, key: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? { ...d, exercises: d.exercises.filter((e) => e.key !== key) }
          : d
      )
    );
  };

  const updateExercise = (
    dayName: string,
    key: string,
    field: "sets" | "reps" | "rest_seconds" | "notes",
    value: string | number
  ) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayName
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.key === key ? { ...e, [field]: value } : e
              ),
            }
          : d
      )
    );
  };

  const removeDay = (dayName: string) => {
    setActiveDays((prev) => {
      const next = new Set(prev);
      next.delete(dayName);
      return next;
    });
    setDays((prev) => prev.filter((d) => d.day !== dayName));
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError("Plan title is required"); return; }
    if (days.length === 0) { setError("Select at least one training day"); return; }
    if (days.some((d) => d.exercises.length === 0)) {
      setError("Each selected day needs at least one exercise");
      return;
    }

    setSaving(true);
    const planData = {
      goal: goal.trim() || undefined,
      weeks: [
        {
          week: 1,
          days: days.map((d) => ({
            day: d.day,
            exercises: d.exercises.map((e) => ({
              name: e.name,
              sets: e.sets,
              reps: e.reps,
              rest_seconds: e.rest_seconds,
              ...(e.notes ? { notes: e.notes } : {}),
            })),
          })),
        },
      ],
    };

    const result = await assignWorkoutPlan({ memberId, title: title.trim(), planData });
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    } else {
      router.push(`/trainer/members/${memberId}`);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    color: "var(--foreground)",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  return (
    <div>
      {/* Plan info */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "0.875rem",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              letterSpacing: "0.04em",
              marginBottom: "0.375rem",
            }}
          >
            Plan title *
          </label>
          <input
            type="text"
            placeholder="e.g. 3-Day Strength Programme"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--muted-foreground)",
              letterSpacing: "0.04em",
              marginBottom: "0.375rem",
            }}
          >
            Goal (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Build muscle, Lose weight, Improve endurance"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Day picker */}
      <div style={{ marginBottom: "1.5rem" }}>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "var(--foreground)",
            marginBottom: "0.75rem",
          }}
        >
          Training days
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {WEEKDAYS.map((day) => {
            const abbr = day.slice(0, 3);
            const active = activeDays.has(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "100px",
                  border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  background: active
                    ? "color-mix(in oklch, var(--primary) 12%, transparent)"
                    : "var(--card)",
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  fontSize: "0.75rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {abbr}
              </button>
            );
          })}
        </div>
        {activeDays.size === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--muted-foreground)",
              marginTop: "0.5rem",
            }}
          >
            Select the days {memberName.split(" ")[0]} will train
          </p>
        )}
      </div>

      {/* Day cards */}
      {days.map((day) => (
        <DayCard
          key={day.day}
          day={day}
          onAddExercise={addExercise}
          onRemoveExercise={removeExercise}
          onUpdateExercise={updateExercise}
          onRemoveDay={removeDay}
        />
      ))}

      {/* Error + Save */}
      {error && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--destructive)",
            marginBottom: "0.875rem",
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: "0.7rem 1.75rem",
          background: saving ? "var(--muted)" : "var(--primary)",
          color: saving ? "var(--muted-foreground)" : "#fff",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          letterSpacing: "-0.01em",
        }}
      >
        {saving ? "Saving…" : "Save workout plan"}
      </button>
    </div>
  );
}
