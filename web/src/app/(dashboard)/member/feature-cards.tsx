"use client";

import Link from "next/link";

type Card = { icon: string; title: string; description: string; href: string };

export function FeatureCards({ cards }: { cards: Card[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
      {cards.map((item) => (
        <Link key={item.title} href={item.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "color-mix(in oklch, var(--primary) 40%, var(--border))")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
            }
          >
            <div style={{ fontSize: "1.25rem", color: "var(--primary)", marginBottom: "0.75rem", lineHeight: 1 }}>
              {item.icon}
            </div>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
              {item.title}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
