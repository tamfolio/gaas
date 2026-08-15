import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Dev-only endpoint — blocked in production
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { secret } = await request.json().catch(() => ({}));
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const admin = createAdminClient();
  const results: Record<string, string> = {};

  // 1. Create test gym (already approved as trial)
  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .upsert(
      { name: "Test Gym", email: "test-gym@engineroom.test", subscription_status: "trial" },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (gymError) return NextResponse.json({ error: gymError.message }, { status: 500 });
  results.gym_id = gym.id;

  // Helper: create or reset a user
  async function upsertUser(
    email: string,
    password: string,
    fullName: string,
    role: string,
    gymId: string | null
  ) {
    // Check if user already exists
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing.users.find((u) => u.email === email);

    let userId: string;
    if (found) {
      await admin.auth.admin.updateUserById(found.id, { password });
      userId = found.id;
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role },
      });
      if (error) throw new Error(`${email}: ${error.message}`);
      userId = data.user.id;
    }

    await admin
      .from("profiles")
      .update({ full_name: fullName, role, gym_id: gymId })
      .eq("id", userId);

    return userId;
  }

  try {
    // 2. Gym owner
    await upsertUser(
      process.env.TEST_GYM_OWNER_EMAIL!,
      process.env.TEST_GYM_OWNER_PASSWORD!,
      "Test Owner",
      "gym_admin",
      gym.id
    );
    results.gym_owner = "ok";

    // 3. Front desk
    await upsertUser(
      process.env.TEST_FRONT_DESK_EMAIL!,
      process.env.TEST_FRONT_DESK_PASSWORD!,
      "Test Front Desk",
      "front_desk",
      gym.id
    );
    results.front_desk = "ok";

    // 4. Platform admin (no gym)
    await upsertUser(
      process.env.TEST_PLATFORM_ADMIN_EMAIL!,
      process.env.TEST_PLATFORM_ADMIN_PASSWORD!,
      "Test Platform Admin",
      "platform_admin",
      null
    );
    results.platform_admin = "ok";
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...results });
}
