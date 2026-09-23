import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPush(
  subscriptions: PushSubscriptionRecord[],
  payload: PushPayload,
): Promise<void> {
  if (!subscriptions.length) return;

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify(payload),
      )
    )
  );
}

// Fetch all push subscriptions for a profile and send — convenience wrapper for crons / actions
export async function sendPushToProfile(
  adminClient: ReturnType<typeof import("@/lib/supabase/server").createAdminClient>,
  profileId: string,
  payload: PushPayload,
): Promise<void> {
  const { data: subs } = await adminClient
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("profile_id", profileId);

  if (subs?.length) await sendPush(subs, payload);
}
