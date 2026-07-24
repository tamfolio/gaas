"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(true); // SSR default = desktop

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Brand panel — desktop only */}
      {isDesktop && (
        <div
          style={{
            background: "var(--brand-dark)",
            width: "58%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "3rem 3.5rem",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.04em", color: "#fff" }}>
              Engine<span style={{ color: "var(--primary)" }}>Room</span>
            </span>
          </Link>

          <div>
            <h1
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(2.5rem, 3.2vw, 4.25rem)",
                fontWeight: 800,
                lineHeight: 1.0,
                color: "var(--brand-dark-fg)",
                letterSpacing: "-0.04em",
                marginBottom: "1.5rem",
              }}
            >
              One platform.
              <br />
              Every member.
              <br />
              <span style={{ color: "var(--primary)" }}>All the gains.</span>
            </h1>
            <p
              style={{
                color: "var(--brand-dark-muted)",
                fontSize: "1rem",
                lineHeight: 1.65,
                maxWidth: "36ch",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Manage members, automate billing, and track every rep — built for
              Nigerian gym owners who mean business.
            </p>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: "2rem",
              display: "flex",
              gap: "2.5rem",
            }}
          >
            {[
              { value: "500+", label: "Gyms" },
              { value: "20k+", label: "Members" },
              { value: "₦2B+", label: "Processed" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "var(--brand-dark-fg)",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--brand-dark-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: "0.35rem",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form panel */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem 2rem",
          background: "var(--background)",
          position: "relative",
        }}
      >
        {/* Mobile: logo + theme toggle */}
        {!isDesktop && (
          <div
            style={{
              width: "100%",
              maxWidth: "22rem",
              marginBottom: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.04em", color: "var(--foreground)" }}>
              Engine<span style={{ color: "var(--primary)" }}>Room</span>
            </span>
            <ThemeToggle />
          </div>
        )}

        {/* Desktop: theme toggle pinned top-right */}
        {isDesktop && (
          <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem" }}>
            <ThemeToggle />
          </div>
        )}

        <div
          style={{
            width: "100%",
            maxWidth: "22rem",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
