import { createClient } from "@/lib/supabase/server";
import { PlanFormSheet } from "@/components/plan-form-sheet";
import { togglePlanStatus } from "./actions";

function formatDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days === 7) return "1 week";
  if (days === 14) return "2 weeks";
  if (days === 30) return "1 month";
  if (days === 60) return "2 months";
  if (days === 90) return "3 months";
  if (days === 180) return "6 months";
  if (days === 365) return "1 year";
  if (days % 30 === 0) return `${days / 30} months`;
  if (days % 7 === 0) return `${days / 7} weeks`;
  return `${days} days`;
}

export default async function PlansPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("gym_id")
    .eq("id", user!.id)
    .single();

  const gymId = profile!.gym_id!;

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("id, name, description, price, duration_days, is_active")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false });

  const activePlans = plans?.filter((p) => p.is_active) ?? [];
  const inactivePlans = plans?.filter((p) => !p.is_active) ?? [];

  return (
    <div style={{ padding: "2rem 1.75rem", maxWidth: "1024px" }}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
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
            Manage
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
            Plans
            {plans && plans.length > 0 && (
              <span
                style={{
                  marginLeft: "0.625rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 500,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0",
                }}
              >
                {plans.length}
              </span>
            )}
          </h1>
        </div>
        <PlanFormSheet />
      </div>

      {/* Empty state */}
      {(!plans || plans.length === 0) && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "4rem 1.25rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.3 }}>◈</div>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--foreground)",
              marginBottom: "0.375rem",
            }}
          >
            No plans yet
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--muted-foreground)",
              marginBottom: "1.5rem",
            }}
          >
            Create a plan so members can be enrolled on one when you add them.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <PlanFormSheet />
          </div>
        </div>
      )}

      {/* Active plans */}
      {activePlans.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: "0.875rem",
            }}
          >
            Active — {activePlans.length}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))",
              gap: "1rem",
            }}
          >
            {activePlans.map((plan) => {
              const toggleAction = togglePlanStatus.bind(null, plan.id, plan.is_active);
              return (
                <div
                  key={plan.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ height: "3px", background: "var(--primary)" }} />
                  <div style={{ padding: "1.25rem" }}>
                    {/* Name + edit */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontSize: "1rem",
                            fontWeight: 800,
                            color: "var(--foreground)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                          }}
                        >
                          {plan.name}
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "0.3rem",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            color: "var(--primary)",
                            background:
                              "color-mix(in oklch, var(--primary) 10%, transparent)",
                            border:
                              "1px solid color-mix(in oklch, var(--primary) 22%, transparent)",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "100px",
                          }}
                        >
                          Active
                        </span>
                      </div>
                      <PlanFormSheet plan={plan} />
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "1.875rem",
                        fontWeight: 800,
                        color: "var(--foreground)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        marginBottom: "0.3rem",
                      }}
                    >
                      ₦{plan.price.toLocaleString("en-NG")}
                    </div>

                    {/* Duration */}
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        marginBottom: plan.description ? "0.875rem" : "1.25rem",
                      }}
                    >
                      {formatDuration(plan.duration_days)}
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted-foreground)",
                          lineHeight: 1.5,
                          marginBottom: "1.25rem",
                          maxHeight: "3.6em",
                          overflow: "hidden",
                        }}
                      >
                        {plan.description}
                      </p>
                    )}

                    {/* Deactivate */}
                    <form action={toggleAction}>
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: "0.375rem",
                          padding: "0.45rem",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          color: "var(--muted-foreground)",
                          fontFamily: "var(--font-jakarta)",
                        }}
                      >
                        Deactivate
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive plans */}
      {inactivePlans.length > 0 && (
        <div>
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted-foreground)",
              marginBottom: "0.875rem",
            }}
          >
            Inactive — {inactivePlans.length}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))",
              gap: "1rem",
            }}
          >
            {inactivePlans.map((plan) => {
              const toggleAction = togglePlanStatus.bind(null, plan.id, plan.is_active);
              return (
                <div
                  key={plan.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    opacity: 0.65,
                  }}
                >
                  <div style={{ height: "3px", background: "var(--border)" }} />
                  <div style={{ padding: "1.25rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-syne)",
                            fontSize: "1rem",
                            fontWeight: 800,
                            color: "var(--muted-foreground)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                          }}
                        >
                          {plan.name}
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "0.3rem",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            color: "var(--muted-foreground)",
                            background: "var(--muted)",
                            border: "1px solid var(--border)",
                            padding: "0.1rem 0.45rem",
                            borderRadius: "100px",
                          }}
                        >
                          Inactive
                        </span>
                      </div>
                      <PlanFormSheet plan={plan} />
                    </div>

                    <div
                      style={{
                        fontFamily: "var(--font-syne)",
                        fontSize: "1.875rem",
                        fontWeight: 800,
                        color: "var(--muted-foreground)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                        marginBottom: "0.3rem",
                      }}
                    >
                      ₦{plan.price.toLocaleString("en-NG")}
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        marginBottom: plan.description ? "0.875rem" : "1.25rem",
                      }}
                    >
                      {formatDuration(plan.duration_days)}
                    </div>

                    {plan.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted-foreground)",
                          lineHeight: 1.5,
                          marginBottom: "1.25rem",
                          maxHeight: "3.6em",
                          overflow: "hidden",
                        }}
                      >
                        {plan.description}
                      </p>
                    )}

                    <form action={toggleAction}>
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          background:
                            "color-mix(in oklch, var(--primary) 10%, transparent)",
                          border:
                            "1px solid color-mix(in oklch, var(--primary) 25%, transparent)",
                          borderRadius: "0.375rem",
                          padding: "0.45rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "var(--primary)",
                          fontFamily: "var(--font-jakarta)",
                        }}
                      >
                        Activate
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
