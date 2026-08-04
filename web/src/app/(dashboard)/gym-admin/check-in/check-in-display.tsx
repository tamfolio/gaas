"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { List, X } from "lucide-react";

type CheckInEntry = {
  id: string;
  checked_in_at: string;
  status: string;
  memberName: string;
};

type Branch = { id: string; name: string };

export function CheckInDisplay({
  checkInUrl,
  isLocalhost,
  entries,
  branches = [],
  siteUrl = "",
  gymId = "",
}: {
  checkInUrl: string;
  isLocalhost: boolean;
  entries: CheckInEntry[];
  branches?: Branch[];
  siteUrl?: string;
  gymId?: string;
}) {
  const [showLog, setShowLog] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(
    branches.length > 0 ? branches[0].id : null
  );

  const activeUrl = selectedBranchId
    ? `${siteUrl}/checkin/${gymId}?branch=${selectedBranchId}`
    : checkInUrl;

  const activeBranchName = branches.find((b) => b.id === selectedBranchId)?.name ?? "All members";

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh - 3.25rem)" }}>
      {/* QR fills the space */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          minHeight: "calc(100vh - 3.25rem)",
          gap: "1.75rem",
        }}
      >
        {branches.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBranchId(b.id)}
                style={{
                  padding: "0.4rem 0.875rem",
                  borderRadius: "100px",
                  border: `1px solid ${selectedBranchId === b.id ? "var(--primary)" : "var(--border)"}`,
                  background: selectedBranchId === b.id ? "var(--primary)" : "var(--card)",
                  color: selectedBranchId === b.id ? "#fff" : "var(--foreground)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-jakarta)",
                  transition: "all 0.15s",
                }}
              >
                {b.name}
              </button>
            ))}
          </div>
        )}

        <div>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.03em",
              color: "var(--foreground)",
              textAlign: "center",
              marginBottom: "0.25rem",
            }}
          >
            {branches.length > 0 ? activeBranchName : "Scan to Check In"}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", textAlign: "center" }}>
            Point your phone camera at this code
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "1.5rem",
            borderRadius: "1rem",
            border: "1px solid rgba(0,0,0,0.06)",
            lineHeight: 0,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <QRCode value={activeUrl} size={280} level="M" style={{ display: "block" }} />
        </div>

        {isLocalhost && (
          <p
            style={{
              fontSize: "0.72rem",
              color: "oklch(0.52 0.18 40)",
              background: "oklch(0.97 0.04 40)",
              border: "1px solid oklch(0.88 0.07 40)",
              borderRadius: "0.375rem",
              padding: "0.35rem 0.75rem",
              textAlign: "center",
              maxWidth: "360px",
            }}
          >
            Running on localhost — use your Vercel URL for real device scanning
          </p>
        )}
      </div>

      {/* Toggle button — bottom right */}
      <button
        onClick={() => setShowLog((v) => !v)}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "100px",
          fontFamily: "var(--font-jakarta)",
          fontWeight: 600,
          fontSize: "0.8rem",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(232,70,10,0.35)",
          zIndex: 10,
        }}
      >
        {showLog ? <X size={14} /> : <List size={14} />}
        {showLog ? "Hide log" : `Today's check-ins${entries.length ? ` (${entries.length})` : ""}`}
      </button>

      {/* Slide-up log panel */}
      {showLog && (
        <div
          style={{
            position: "fixed",
            bottom: "4.5rem",
            right: "1.75rem",
            width: "320px",
            maxHeight: "60vh",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              padding: "0.875rem 1.1rem",
              borderBottom: "1px solid var(--border)",
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "var(--foreground)",
              flexShrink: 0,
            }}
          >
            Today&apos;s Check-ins
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {entries.length === 0 ? (
              <div style={{ padding: "2rem 1.1rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                  No check-ins yet today.
                </p>
              </div>
            ) : (
              entries.map((entry, i) => {
                const time = new Date(entry.checked_in_at).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const granted = entry.status === "success";
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: "0.75rem 1.1rem",
                      borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: granted ? "oklch(0.52 0.16 155)" : "oklch(0.55 0.18 25)",
                      }}
                    />
                    <p
                      style={{
                        flex: 1,
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        color: "var(--foreground)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.memberName}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", flexShrink: 0 }}>
                      {time}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
