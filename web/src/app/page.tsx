import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    switch (profile?.role) {
      case "gym_admin":
        redirect("/gym-admin");
      case "trainer":
        redirect("/trainer");
      case "member":
        redirect("/member");
      default:
        redirect("/login");
    }
  }

  return (
    <main style={{ fontFamily: "var(--font-jakarta)" }}>
      {/* Nav — always dark */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(16, 15, 14, 0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.04em", color: "#fff" }}>
          Engine<span style={{ color: "var(--primary)" }}>Room</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ThemeToggle onDark />
          <Link
            href="/login"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--brand-dark-muted)",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--brand-dark-fg)",
              textDecoration: "none",
              padding: "0.5rem 1.25rem",
              background: "var(--primary)",
              borderRadius: "0.4rem",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — always dark */}
      <section
        style={{
          minHeight: "100vh",
          background: "var(--brand-dark)",
          display: "flex",
          alignItems: "center",
          padding: "7rem 2rem 5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Layer 1: subtle dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(232, 70, 10, 0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Layer 2: warm left sweep — brand color illuminates the text side */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, rgba(232, 70, 10, 0.13) 0%, rgba(232, 70, 10, 0.04) 38%, transparent 62%)",
            pointerEvents: "none",
          }}
        />
        {/* Layer 3: concentrated glow behind headline */}
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "-2%",
            width: "55%",
            height: "70%",
            background:
              "radial-gradient(ellipse at 35% 45%, rgba(232, 70, 10, 0.09) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Layer 4: bottom ground vignette */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "180px",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Two-column grid */}
        <div
          style={{
            position: "relative",
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "3.5rem",
            alignItems: "center",
          }}
        >
          {/* LEFT: text */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(232, 70, 10, 0.1)",
                border: "1px solid rgba(232, 70, 10, 0.22)",
                borderRadius: "100px",
                padding: "0.35rem 1rem",
                marginBottom: "2rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--primary)",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Built for Nigerian gyms
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(2.75rem, 4.5vw, 5rem)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                color: "var(--brand-dark-fg)",
                marginBottom: "1.5rem",
              }}
            >
              Nigerian gyms
              <br />
              run on{" "}
              <span style={{ color: "var(--primary)" }}>EngineRoom.</span>
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                color: "var(--brand-dark-muted)",
                lineHeight: 1.7,
                maxWidth: "40ch",
                marginBottom: "2.5rem",
              }}
            >
              Manage members, automate billing, schedule trainers — the complete
              operating system for your gym business.
            </p>

            <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
              <Link
                href="/register"
                style={{
                  background: "var(--primary)",
                  color: "var(--brand-dark-fg)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  padding: "0.9rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                Register your gym →
              </Link>
              <Link
                href="/login"
                style={{
                  background: "transparent",
                  color: "var(--brand-dark-fg)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  padding: "0.9rem 2rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* RIGHT: dashboard mock */}
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "1rem",
              padding: "1.25rem",
              boxShadow:
                "0 0 0 1px rgba(232, 70, 10, 0.07), 0 32px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* App chrome bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.35rem" }}>
                {[
                  "rgba(255,95,87,0.45)",
                  "rgba(255,188,46,0.45)",
                  "rgba(40,200,64,0.45)",
                ].map((c, i) => (
                  <span
                    key={i}
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: c,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.08em",
                }}
              >
                ENGINEROOM
              </span>
              <div style={{ width: "46px" }} />
            </div>

            {/* Stat tiles 2×2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.625rem",
                marginBottom: "0.75rem",
              }}
            >
              {[
                {
                  label: "Active Members",
                  value: "247",
                  delta: "+12 this month",
                  up: true,
                },
                {
                  label: "Monthly Revenue",
                  value: "₦1.8M",
                  delta: "+8.3% vs last",
                  up: true,
                },
                {
                  label: "Check-ins Today",
                  value: "43",
                  delta: "↑ above avg",
                  up: true,
                },
                {
                  label: "Renewals Due",
                  value: "14",
                  delta: "this week",
                  up: false,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 0.875rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.6rem",
                      color: "rgba(255,255,255,0.3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-syne)",
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "var(--brand-dark-fg)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      marginTop: "0.3rem",
                      color: stat.up
                        ? "rgba(74, 222, 128, 0.85)"
                        : "rgba(232, 70, 10, 0.9)",
                    }}
                  >
                    {stat.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* Member list */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "0.5rem",
                padding: "0.75rem 0.875rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.625rem",
                }}
              >
                Recent Members
              </div>
              {[
                { name: "Amaka Okonkwo", plan: "Premium", active: true },
                { name: "Chidi Balogun", plan: "Basic", active: true },
                { name: "Funke Adeyemi", plan: "Premium", active: false },
              ].map((m, i) => (
                <div
                  key={m.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.45rem 0",
                    borderBottom:
                      i < 2 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "rgba(232, 70, 10, 0.18)",
                        border: "1px solid rgba(232, 70, 10, 0.28)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        flexShrink: 0,
                      }}
                    >
                      {m.name[0]}
                    </div>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--brand-dark-fg)",
                        fontWeight: 500,
                      }}
                    >
                      {m.name}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)" }}
                    >
                      {m.plan}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "100px",
                        color: m.active
                          ? "rgba(74, 222, 128, 1)"
                          : "var(--primary)",
                        background: m.active
                          ? "rgba(74, 222, 128, 0.12)"
                          : "rgba(232, 70, 10, 0.12)",
                      }}
                    >
                      {m.active ? "active" : "due"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip — always orange */}
      <section style={{ background: "var(--primary)", padding: "0" }}>
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {[
            { value: "500+", label: "Gyms managed" },
            { value: "20,000+", label: "Active members" },
            { value: "₦2B+", label: "Revenue processed" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                textAlign: "center",
                padding: "2.25rem 1.5rem",
                borderRight:
                  i < 3 ? "1px solid rgba(255,255,255,0.18)" : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)",
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
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                  marginTop: "0.3rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features — respects theme */}
      <section style={{ background: "var(--background)", padding: "5.5rem 2rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--foreground)",
                marginBottom: "0.75rem",
              }}
            >
              Everything your gym needs
            </h2>
            <p
              style={{
                color: "var(--muted-foreground)",
                fontSize: "1rem",
                maxWidth: "44ch",
                margin: "0 auto",
                lineHeight: 1.65,
              }}
            >
              No spreadsheets. No scattered WhatsApp groups. One dashboard,
              every tool.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[
              {
                icon: "◉",
                title: "Member Management",
                desc: "Track memberships, check-ins, renewals, and BMI records for every member — with full history.",
              },
              {
                icon: "◈",
                title: "Trainer Scheduling",
                desc: "Assign trainers, manage workout plans, and monitor every trainer-member relationship.",
              },
              {
                icon: "◆",
                title: "Paystack Billing",
                desc: "Automate monthly dues, send payment reminders, and see real-time revenue dashboards.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  padding: "1.75rem",
                }}
              >
                <div
                  style={{
                    fontSize: "1.4rem",
                    color: "var(--primary)",
                    marginBottom: "1rem",
                    lineHeight: 1,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    letterSpacing: "-0.025em",
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--muted-foreground)",
                    lineHeight: 1.65,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — always dark */}
      <section
        style={{
          background: "var(--brand-dark)",
          padding: "6rem 2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(232, 70, 10, 0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />
        {/* Orange glow rising from the bottom — energy building toward the CTA */}
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "420px",
            background:
              "radial-gradient(ellipse, rgba(232, 70, 10, 0.13) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        {/* Thin orange rule at the top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(to right, transparent 0%, rgba(232, 70, 10, 0.5) 40%, rgba(232, 70, 10, 0.5) 60%, transparent 100%)",
          }}
        />

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Large left-anchored headline */}
          <h2
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(2.5rem, 5.5vw, 5rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--brand-dark-fg)",
              lineHeight: 0.97,
              marginBottom: "2.75rem",
              maxWidth: "16ch",
            }}
          >
            Your gym is a real business.{" "}
            <span style={{ color: "var(--primary)" }}>Run it like one.</span>
          </h2>

          {/* CTA row — button + inline social proof */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2.25rem",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/register"
              style={{
                background: "var(--primary)",
                color: "var(--brand-dark-fg)",
                fontWeight: 600,
                fontSize: "0.95rem",
                padding: "1rem 2.25rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                flexShrink: 0,
              }}
            >
              Set up your gym — it&apos;s free →
            </Link>

            <div
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.1)",
                paddingLeft: "2.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--brand-dark-fg)",
                  fontWeight: 600,
                }}
              >
                500+ Nigerian gyms registered
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--brand-dark-muted)",
                }}
              >
                No credit card required. Set up in minutes.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — always dark */}
      <footer
        style={{
          background: "oklch(0.09 0.004 60)",
          padding: "1.5rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span style={{ fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.04em", color: "#fff" }}>
          Engine<span style={{ color: "var(--primary)" }}>Room</span>
        </span>
        <p style={{ fontSize: "0.75rem", color: "oklch(0.30 0.005 60)" }}>
          © 2026 EngineRoom. Gym management for Nigerian gym businesses.
        </p>
      </footer>
    </main>
  );
}
