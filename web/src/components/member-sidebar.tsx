"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  ScanLine,
  Dumbbell,
  BarChart2,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/member" },
  { icon: ScanLine, label: "Check-in History", href: "/member/checkins" },
  { icon: Dumbbell, label: "Workout Plan", href: "/member/workout" },
  { icon: BarChart2, label: "BMI Tracker", href: "/member/bmi" },
  { icon: Bell, label: "Notifications", href: "/member/notifications" },
  { icon: UserCircle, label: "My Profile", href: "/member/profile" },
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
  unreadCount,
  pathname,
  onClose,
}: {
  userName: string;
  gymName: string;
  unreadCount: number;
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
      {/* Logo */}
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
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.04em", color: "#fff" }}>
            Engine<span style={{ color: "var(--primary)" }}>Room</span>
          </span>
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

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "1rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/member"
              ? pathname === "/member"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.href} style={{ position: "relative" }}>
              <NavItem
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={active}
                onClick={onClose}
              />
              {item.href === "/member/notifications" && unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    right: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    minWidth: "16px",
                    height: "16px",
                    borderRadius: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    pointerEvents: "none",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
          );
        })}
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
            Member
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

export function MemberSidebar({
  userName,
  gymName,
  unreadCount,
}: {
  userName: string;
  gymName: string;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");

    const update = (matches: boolean) => {
      setIsMobile(matches);
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

  if (!isMobile) {
    return (
      <div style={{ flexShrink: 0 }}>
        <SidebarInner
          userName={userName}
          gymName={gymName}
          unreadCount={unreadCount}
          pathname={pathname}
        />
      </div>
    );
  }

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

        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.04em", color: "#fff" }}>
          Engine<span style={{ color: "var(--primary)" }}>Room</span>
        </span>

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
              unreadCount={unreadCount}
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
