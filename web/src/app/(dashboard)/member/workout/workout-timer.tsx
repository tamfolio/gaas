"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, X, Play, Pause, RotateCcw } from "lucide-react";

const PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
];

function fmt(s: number) {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.abs(s) % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function WorkoutTimer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // stopwatch: counts up
  const [countdown, setCountdown] = useState(60); // countdown: counts down
  const [countdownFrom, setCountdownFrom] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const tick = useCallback(() => {
    if (mode === "stopwatch") {
      setElapsed((s) => s + 1);
    } else {
      setCountdown((s) => {
        if (s <= 1) {
          stop();
          return 0;
        }
        return s - 1;
      });
    }
  }, [mode, stop]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, tick]);

  const handleStartPause = () => setRunning((r) => !r);

  const handleReset = () => {
    stop();
    if (mode === "stopwatch") setElapsed(0);
    else setCountdown(countdownFrom);
  };

  const handlePreset = (seconds: number) => {
    stop();
    setCountdownFrom(seconds);
    setCountdown(seconds);
  };

  const handleModeChange = (m: "stopwatch" | "countdown") => {
    stop();
    setMode(m);
    setElapsed(0);
    setCountdown(countdownFrom);
  };

  const display = mode === "stopwatch" ? fmt(elapsed) : fmt(countdown);
  const isDone = mode === "countdown" && countdown === 0 && !running;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Workout timer"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.75rem",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--primary)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(232,70,10,0.4)",
            zIndex: 20,
            color: "#fff",
          }}
        >
          <Timer size={20} />
        </button>
      )}

      {/* Timer panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.75rem",
            width: "260px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {(["stopwatch", "countdown"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  style={{
                    padding: "0.25rem 0.625rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    background: mode === m ? "var(--primary)" : "var(--muted)",
                    color: mode === m ? "#fff" : "var(--muted-foreground)",
                  }}
                >
                  {m === "stopwatch" ? "Stopwatch" : "Rest Timer"}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setOpen(false); stop(); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "flex", padding: "0.25rem" }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Time display */}
          <div style={{ padding: "1.25rem 1rem 0.75rem", textAlign: "center" }}>
            <p
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "3rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: isDone ? "var(--primary)" : "var(--foreground)",
              }}
            >
              {display}
            </p>
            {isDone && (
              <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, marginTop: "0.375rem" }}>
                Rest complete!
              </p>
            )}
          </div>

          {/* Presets (countdown only) */}
          {mode === "countdown" && (
            <div style={{ display: "flex", gap: "0.375rem", padding: "0 1rem 0.75rem", flexWrap: "wrap" }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.seconds)}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid var(--border)",
                    background: countdownFrom === p.seconds ? "color-mix(in oklch, var(--primary) 12%, transparent)" : "var(--muted)",
                    color: countdownFrom === p.seconds ? "var(--primary)" : "var(--muted-foreground)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0 1rem 1rem",
            }}
          >
            <button
              onClick={handleStartPause}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.375rem",
                padding: "0.6rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.82rem",
              }}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? "Pause" : "Start"}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "0.6rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--muted)",
                cursor: "pointer",
                color: "var(--muted-foreground)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
