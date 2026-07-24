"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Tag,
  CreditCard,
  Bell,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Manage",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/gym-admin" },
      { icon: Users, label: "Members", href: "/gym-admin/members" },
      { icon: Dumbbell, label: "Trainers", href: "/gym-admin/trainers" },
      { icon: Tag, label: "Plans", href: "/gym-admin/plans" },
      { icon: CreditCard, label: "Payments", href: "/gym-admin/payments" },
      { icon: Bell, label: "Notifications", href: "/gym-admin/notifications" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: UserCircle, label: "Profile", href: "/gym-admin/profile" },
      { icon: Settings, label: "Settings", href: "/gym-admin/settings" },
    ],
  },
];

function NavItem({
  icon: Icon,
  label,
  href,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  href: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        padding: "0.6rem 0.875rem",
        borderRadius: "0.5rem",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: active ? 600 : 400,
        color: active ? "var(--brand-dark-fg)" : "rgba(255,255,255,0.45)",
        background: active ? "rgba(232, 70, 10, 0.13)" : "transparent",
        borderLeft: `2px solid ${active ? "var(--primary)" : "transparent"}`,
        letterSpacing: "-0.01em",
      }}
    >
      <Icon
        size={15}
        style={{
          color: active ? "var(--primary)" : "rgba(255,255,255,0.3)",
          flexShrink: 0,
        }}
      />
      {label}
    </Link>
  );
}

function SidebarInner({
  userName,
  gymName,
  pathname,
  onClose,
}: {
  userName: string;
  gymName: string;
  pathname: string;
  onClose?: () => void;
}) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: "252px",
        height: "100vh",
        background: "var(--brand-dark)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      {/* Logo + gym name */}
      <div
        style={{
          padding: "1.375rem 1.25rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
          <img
            src="https://res.cloudinary.com/dnovlrekd/image/upload/v1784930105/engineroom-logo-dark_o9gbqy.svg"
            alt="EngineRoom"
            style={{ display: "block", height: "22px", width: "auto" }}
          />
          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.35)",
              marginTop: "0.3rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            {gymName}
          </div>
        </Link>
        <ThemeToggle onDark />
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              style={{
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)",
                padding: "0 0.875rem",
                marginBottom: "0.375rem",
              }}
            >
              {section.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
              {section.items.map((item) => {
                const active =
                  item.href === "/gym-admin"
                    ? pathname === "/gym-admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <NavItem
                    key={item.href}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={active}
                    onClick={onClose}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(232, 70, 10, 0.18)",
            border: "1px solid rgba(232, 70, 10, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--primary)",
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          {initials || "?"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--brand-dark-fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "-0.01em",
            }}
          >
            {userName}
          </div>
          <div style={{ fontSize: "0.62rem", color: "var(--primary)", fontWeight: 500 }}>
            Gym Admin
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
              color: "rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

export function GymAdminSidebar({
  userName,
  gymName,
}: {
  userName: string;
  gymName: string;
}) {
  const pathname = usePathname();
  // Default false so SSR renders desktop sidebar (no flash on desktop)
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");

    const update = (matches: boolean) => {
      setIsMobile(matches);
      // Directly drive the main content offset — no CSS class dependency
      const main = document.getElementById("dash-main");
      if (main) {
        main.style.paddingTop = matches ? "3.25rem" : "0";
      }
    };

    update(mq.matches);
    const handler = (e: MediaQueryListEvent) => update(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Desktop: sidebar in the flex flow
  if (!isMobile) {
    return (
      <div style={{ flexShrink: 0 }}>
        <SidebarInner userName={userName} gymName={gymName} pathname={pathname} />
      </div>
    );
  }

  // Mobile: fixed top bar + overlay
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: "3.25rem",
          background: "var(--brand-dark)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem",
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--brand-dark-fg)",
            display: "flex",
            alignItems: "center",
            padding: "0.25rem",
          }}
        >
          <Menu size={20} />
        </button>

        <img
          src="https://res.cloudinary.com/dnovlrekd/image/upload/v1784930105/engineroom-logo-dark_o9gbqy.svg"
          alt="EngineRoom"
          style={{ display: "block", height: "22px", width: "auto" }}
        />

        <ThemeToggle onDark />
      </div>

      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 45,
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 50,
            }}
          >
            <SidebarInner
              userName={userName}
              gymName={gymName}
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
            />
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "-2.75rem",
                background: "var(--brand-dark)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderLeft: "none",
                borderRadius: "0 0.5rem 0.5rem 0",
                padding: "0.5rem 0.625rem",
                cursor: "pointer",
                color: "var(--brand-dark-fg)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </>
  );
}
