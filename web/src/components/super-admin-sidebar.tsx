"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, Building2, LogOut, Menu, X, ShieldCheck, Users2 } from "lucide-react";
import { canAccessPlatformNav, ROLE_LABELS } from "@/lib/permissions";
import type { UserRole } from "@/types";

const ALL_NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", href: "/super-admin" },
  { icon: Building2,       label: "Gyms",     href: "/super-admin/gyms" },
  { icon: Users2,          label: "Team",     href: "/super-admin/team" },
];

function NavItem({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
  const pathname = usePathname();
  const isActive = href === "/super-admin" ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.55rem 0.75rem",
        borderRadius: "0.5rem",
        textDecoration: "none",
        fontSize: "0.82rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
        background: isActive ? "var(--muted)" : "transparent",
        transition: "all 0.12s",
      }}
    >
      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

function SidebarInner({ adminName, userRole }: { adminName: string; userRole: UserRole }) {
  const navItems = ALL_NAV_ITEMS.filter((item) => canAccessPlatformNav(userRole, item.href));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "1.25rem 0.875rem",
        gap: "0",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 0.375rem", marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              fontSize: "1rem",
              letterSpacing: "-0.04em",
              color: "var(--foreground)",
            }}
          >
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </span>
          <span
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--primary)",
              background: "color-mix(in oklch, var(--primary) 10%, transparent)",
              border: "1px solid color-mix(in oklch, var(--primary) 22%, transparent)",
              padding: "0.1rem 0.4rem",
              borderRadius: "100px",
            }}
          >
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.125rem" }}>
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0 0.375rem", marginBottom: "0.25rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "color-mix(in oklch, var(--primary) 15%, transparent)",
              border: "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {adminName}
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--muted-foreground)" }}>{ROLE_LABELS[userRole] ?? "Platform Staff"}</p>
          </div>
        </div>

        <ThemeToggle />

        <form action={logout}>
          <button
            type="submit"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              width: "100%",
              padding: "0.55rem 0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 500,
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            <LogOut size={15} strokeWidth={1.8} />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function SuperAdminSidebar({ adminName, userRole }: { adminName: string; userRole: UserRole }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SIDEBAR_W = "220px";

  return (
    <>
      {/* Mobile top bar */}
      <div
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3.25rem",
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
          zIndex: 40,
        }}
        className="mobile-topbar"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.04em", color: "var(--foreground)" }}>
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </span>
          <span style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--primary)", background: "color-mix(in oklch, var(--primary) 10%, transparent)", border: "1px solid color-mix(in oklch, var(--primary) 22%, transparent)", padding: "0.1rem 0.35rem", borderRadius: "100px" }}>
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground)", padding: "0.25rem" }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 49 }}
        />
      )}

      {/* Mobile drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: mobileOpen ? 0 : `-${SIDEBAR_W}`,
          width: SIDEBAR_W,
          height: "100vh",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          zIndex: 50,
          transition: "left 0.22s ease",
          display: "none",
        }}
        className="mobile-drawer"
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{ position: "absolute", top: "1rem", right: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: "0.25rem" }}
        >
          <X size={18} />
        </button>
        <SidebarInner adminName={adminName} userRole={userRole} />
      </div>

      {/* Desktop sidebar */}
      <aside
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
        }}
        className="desktop-sidebar"
      >
        <SidebarInner adminName={adminName} userRole={userRole} />
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-drawer { display: block !important; }
        }
      `}</style>
    </>
  );
}
