import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MemberCheckInPage({
  params,
}: {
  params: Promise<{ gymId: string }>;
}) {
  const { gymId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/checkin/${gymId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  // Non-members shouldn't use this scan flow
  if (profile?.role !== "member") {
    return (
      <CheckInLayout>
        <StatusCard
          icon="⚠"
          iconColor="oklch(0.55 0.14 55)"
          title="Wrong account type"
          detail="This check-in link is for gym members. Please log in with your member account."
          memberName={profile?.full_name}
        />
      </CheckInLayout>
    );
  }

  // Find their membership at this gym
  const { data: member } = await supabase
    .from("gym_members")
    .select("id, status")
    .eq("profile_id", user.id)
    .eq("gym_id", gymId)
    .single();

  if (!member) {
    return (
      <CheckInLayout>
        <StatusCard
          icon="✕"
          iconColor="oklch(0.55 0.18 25)"
          title="No membership found"
          detail="You don't have a membership at this gym. Please contact the gym admin."
          memberName={profile?.full_name}
        />
      </CheckInLayout>
    );
  }

  if (member.status !== "active") {
    return (
      <CheckInLayout>
        <StatusCard
          icon="✕"
          iconColor="oklch(0.55 0.18 25)"
          title="Membership inactive"
          detail={`Your membership is currently ${member.status}. Please renew to check in.`}
          memberName={profile?.full_name}
        />
      </CheckInLayout>
    );
  }

  // Dedup: check for a check-in within the last 6 hours
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("check_ins")
    .select("checked_in_at")
    .eq("gym_member_id", member.id)
    .gte("checked_in_at", sixHoursAgo)
    .order("checked_in_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const checkedInAt = new Date(recent.checked_in_at).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <CheckInLayout>
        <StatusCard
          icon="✓"
          iconColor="oklch(0.52 0.16 155)"
          title="Already checked in"
          detail={`You checked in at ${checkedInAt} today.`}
          memberName={profile?.full_name}
          showDashboard
        />
      </CheckInLayout>
    );
  }

  // Log the check-in
  const now = new Date().toISOString();
  const { error } = await supabase.from("check_ins").insert({
    gym_member_id: member.id,
    checked_in_at: now,
    status: "success",
  });

  if (error) {
    return (
      <CheckInLayout>
        <StatusCard
          icon="!"
          iconColor="oklch(0.55 0.14 55)"
          title="Something went wrong"
          detail="We couldn't log your check-in. Please try again or ask the gym staff."
          memberName={profile?.full_name}
        />
      </CheckInLayout>
    );
  }

  const checkedInAt = new Date(now).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <CheckInLayout>
      <StatusCard
        icon="✓"
        iconColor="oklch(0.52 0.16 155)"
        title="Checked in!"
        detail={`Welcome back. Logged at ${checkedInAt}.`}
        memberName={profile?.full_name}
        showDashboard
        success
      />
    </CheckInLayout>
  );
}

function CheckInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "var(--font-jakarta)",
      }}
    >
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "-0.04em",
            color: "var(--foreground)",
          }}
        >
          Engine<span style={{ color: "var(--primary)" }}>Room</span>
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusCard({
  icon,
  iconColor,
  title,
  detail,
  memberName,
  showDashboard = false,
  success = false,
}: {
  icon: string;
  iconColor: string;
  title: string;
  detail: string;
  memberName?: string | null;
  showDashboard?: boolean;
  success?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: `2px solid ${success ? "oklch(0.82 0.12 155)" : "var(--border)"}`,
        borderRadius: "1.25rem",
        padding: "2.5rem 2rem",
        maxWidth: "360px",
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: `color-mix(in oklch, ${iconColor} 12%, transparent)`,
          border: `2px solid color-mix(in oklch, ${iconColor} 30%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          color: iconColor,
          fontWeight: 700,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "1.3rem",
            letterSpacing: "-0.03em",
            color: "var(--foreground)",
            marginBottom: "0.35rem",
          }}
        >
          {title}
        </p>
        {memberName && (
          <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)", marginBottom: "0.25rem" }}>
            {memberName}
          </p>
        )}
        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.55 }}>
          {detail}
        </p>
      </div>

      {showDashboard && (
        <Link
          href="/member"
          style={{
            marginTop: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          Go to dashboard →
        </Link>
      )}
    </div>
  );
}
