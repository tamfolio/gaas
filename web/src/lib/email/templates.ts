export function buildWelcomeMemberEmail({
  gymName,
  memberName,
  email,
  tempPassword,
  loginUrl,
}: {
  gymName: string;
  memberName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Welcome to ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Welcome, ${memberName}!
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Your membership at <strong>${gymName}</strong> has been set up on EngineRoom.
                Use the details below to log in for the first time.
              </p>
              <div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;padding:20px;margin-bottom:24px;">
                <div style="margin-bottom:16px;">
                  <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;margin-bottom:4px;">Email</div>
                  <div style="font-size:15px;font-weight:600;color:#111;word-break:break-all;">${email}</div>
                </div>
                <div>
                  <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;margin-bottom:4px;">Temporary Password</div>
                  <div style="font-size:15px;font-weight:600;color:#111;font-family:'Courier New',monospace;background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px 14px;letter-spacing:0.05em;">${tempPassword}</div>
                </div>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${loginUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Log in to EngineRoom →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                Please change your password after your first login.
                If you weren&rsquo;t expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildMemberExpiryEmail({
  memberName,
  gymName,
  expiryDate,
  daysLeft,
  loginUrl,
}: {
  memberName: string;
  gymName: string;
  expiryDate: string;
  daysLeft: 7 | 3;
  loginUrl: string;
}): string {
  const urgencyColor = daysLeft === 3 ? "#B91C1C" : "#b45309";
  const urgencyBg    = daysLeft === 3 ? "#fef2f2" : "#fff8f0";
  const urgencyBorder = daysLeft === 3 ? "#fecaca" : "#fde8cc";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Membership expiring soon — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Your membership expires in ${daysLeft} days
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Hi ${memberName}, your membership at <strong>${gymName}</strong> expires on <strong>${expiryDate}</strong>.
                Renew now to keep your access uninterrupted.
              </p>
              <div style="background:${urgencyBg};border:1px solid ${urgencyBorder};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:${urgencyColor};line-height:1.6;">
                  ${daysLeft === 3
                    ? "Your membership is expiring very soon — renew today to avoid losing access."
                    : "Renew early and stay on track with your fitness goals without any break."}
                </p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${loginUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Renew membership →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                Log in to your EngineRoom dashboard to renew. If you have already renewed, ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildGymSubscriptionExpiryEmail({
  gymName,
  ownerName,
  expiryDate,
  daysLeft,
  renewUrl,
}: {
  gymName: string;
  ownerName: string;
  expiryDate: string;
  daysLeft: 7 | 3;
  renewUrl: string;
}): string {
  const urgencyColor  = daysLeft === 3 ? "#B91C1C" : "#b45309";
  const urgencyBg     = daysLeft === 3 ? "#fef2f2" : "#fff8f0";
  const urgencyBorder = daysLeft === 3 ? "#fecaca" : "#fde8cc";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>EngineRoom subscription expiring — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">Platform Subscription</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Your subscription expires in ${daysLeft} days
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Hi ${ownerName}, your EngineRoom subscription for <strong>${gymName}</strong> expires on
                <strong>${expiryDate}</strong>. Renew now to keep your dashboard and all member services running.
              </p>
              <div style="background:${urgencyBg};border:1px solid ${urgencyBorder};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:${urgencyColor};line-height:1.6;">
                  ${daysLeft === 3
                    ? "After expiry there is a 7-day grace period — then your gym will be suspended and members will lose access."
                    : "Renew now to avoid disruption. A 7-day grace period applies after expiry before suspension."}
                </p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${renewUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Renew subscription →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                If you have already renewed, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildGymSuspendedEmail({
  gymName,
  ownerName,
  renewUrl,
}: {
  gymName: string;
  ownerName: string;
  renewUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Your gym has been suspended — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Your gym has been suspended
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Hi ${ownerName}, access to <strong>${gymName}</strong> on EngineRoom has been suspended because
                your subscription lapsed and the 7-day grace period has ended.
              </p>
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#B91C1C;line-height:1.6;">
                  Your gym admin dashboard and all member-facing features are currently unavailable.
                  Renew your subscription to restore access immediately.
                </p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${renewUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Renew now to restore access →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                Need help? Reply to this email or contact EngineRoom support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildMissedYouEmail({
  memberName,
  gymName,
  loginUrl,
}: {
  memberName: string;
  gymName: string;
  loginUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>We missed you at ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                We missed you, ${memberName}!
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                It's been 5 days since your last visit to <strong>${gymName}</strong>.
                Your fitness goals are still waiting — come back and keep the momentum going.
              </p>
              <div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;padding:20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#555;line-height:1.7;">
                  💪 Consistency is everything. Even a short session today is better than waiting for the perfect moment.
                </p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${loginUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Check in today →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                You're receiving this because you're an active member at ${gymName}.
                If you've already been in, your check-in may not have been recorded — speak to the front desk.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildStaffApprovalRequestEmail({
  gymName,
  ownerName,
  inviterName,
  inviteeName,
  inviteeEmail,
  teamUrl,
}: {
  gymName: string;
  ownerName: string;
  inviterName: string;
  inviteeName: string;
  inviteeEmail: string;
  teamUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Staff Approval Required — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              <div style="font-size:12px;color:#8A8D91;margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Approval required, ${ownerName}
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                <strong>${inviterName}</strong> has invited <strong>${inviteeName}</strong> (${inviteeEmail})
                as a <strong>Second Admin</strong> at <strong>${gymName}</strong>.
              </p>
              <div style="background:#fff8f0;border:1px solid #fde8cc;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#b45309;line-height:1.6;">
                  Second Admin access grants near-full control of your gym's management panel,
                  including members, staff, payments and settings. Only approve if you recognise this person.
                </p>
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${teamUrl}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">Review invitation →</a></td></tr></table>
              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                Log in to your EngineRoom dashboard to approve or decline.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// Shared layout for the auth + receipt templates below
// ─────────────────────────────────────────────────────────────

/** Escape user-supplied text before interpolating it into email HTML. */
export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNaira(amount: number): string {
  return `&#8358;${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

function emailLayout({
  title,
  subtitle,
  body,
}: {
  title: string;
  /** Shown under the logo — usually the gym name. Already escaped by caller. */
  subtitle?: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!--[if mso]><table role="presentation" width="560" align="center" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0C0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#CCFF00;">Room</span>
              </div>
              ${subtitle ? `<div style="font-size:12px;color:#8A8D91;margin-top:4px;">${subtitle}</div>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;word-break:break-word;overflow-wrap:anywhere;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f8f8f8;border-top:1px solid #eee;padding:16px 32px;">
              <p style="margin:0;font-size:11px;color:#bbb;text-align:center;">
                Powered by EngineRoom &mdash; Gym Management Platform
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailButton(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#CCFF00" style="border-radius:8px;background:#CCFF00;"><a href="${escapeHtml(href)}" target="_blank" style="display:block;padding:14px 24px;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;font-size:14px;line-height:20px;color:#0B0C0E;text-decoration:none;text-align:center;">${label}</a></td></tr></table>`;
}

function linkFallback(href: string): string {
  return `<p style="margin:20px 0 0;font-size:12px;color:#999;line-height:1.6;word-break:break-all;">
    Button not working? Paste this link into your browser:<br />
    <a href="${escapeHtml(href)}" style="color:#4D7C0F;">${escapeHtml(href)}</a>
  </p>`;
}

/** Invitation to join EngineRoom (trainers, gym staff, platform staff). */
export function buildInviteEmail({
  inviteeName,
  roleLabel,
  gymName,
  inviterName,
  acceptUrl,
}: {
  inviteeName: string;
  /** e.g. "Trainer", "Front Desk", "Platform Staff" */
  roleLabel: string;
  /** Omit for platform-level invites */
  gymName?: string;
  inviterName?: string;
  acceptUrl: string;
}): string {
  const where = gymName ? ` at <strong>${escapeHtml(gymName)}</strong>` : " on EngineRoom";
  const who = inviterName ? `<strong>${escapeHtml(inviterName)}</strong> has invited you` : "You've been invited";
  return emailLayout({
    title: `You're invited to ${gymName ? escapeHtml(gymName) : "EngineRoom"}`,
    subtitle: gymName ? escapeHtml(gymName) : undefined,
    body: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
        You&rsquo;re invited, ${escapeHtml(inviteeName)}
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
        ${who} to join as <strong>${escapeHtml(roleLabel)}</strong>${where}.
        Accept the invite to set up your account.
      </p>
      ${emailButton(acceptUrl, "Accept invitation &rarr;")}
      <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
        This link can only be used once and expires in 24 hours.
        If you weren&rsquo;t expecting this invitation, you can ignore this email.
      </p>
      ${linkFallback(acceptUrl)}`,
  });
}

/** Password reset link. */
export function buildPasswordResetEmail({
  name,
  resetUrl,
}: {
  name?: string | null;
  resetUrl: string;
}): string {
  return emailLayout({
    title: "Reset your EngineRoom password",
    body: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
        Reset your password${name ? `, ${escapeHtml(name)}` : ""}
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
        We received a request to reset the password for your EngineRoom account.
        Click below to choose a new one.
      </p>
      ${emailButton(resetUrl, "Choose a new password &rarr;")}
      <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
        This link can only be used once and expires in 1 hour.
        If you didn&rsquo;t request a reset, ignore this email &mdash; your password won&rsquo;t change.
      </p>
      ${linkFallback(resetUrl)}`,
  });
}

function receiptRows(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;margin-bottom:24px;">
    ${rows
      .map(
        ([label, value], i) => `<tr>
        <td style="padding:12px 16px;font-size:12px;color:#888;${i ? "border-top:1px solid #eee;" : ""}">${label}</td>
        <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111;text-align:right;${i ? "border-top:1px solid #eee;" : ""}">${value}</td>
      </tr>`,
      )
      .join("")}
  </table>`;
}

/** Receipt sent to a member after a successful online membership payment. */
export function buildPaymentReceiptEmail({
  gymName,
  memberName,
  planName,
  amount,
  reference,
  paidAt,
  validUntil,
  dashboardUrl,
}: {
  gymName: string;
  memberName: string;
  planName: string | null;
  /** Naira */
  amount: number;
  reference: string;
  paidAt: string;
  validUntil: string | null;
  dashboardUrl: string;
}): string {
  const rows: [string, string][] = [
    ["Amount paid", formatNaira(amount)],
    ["Plan", escapeHtml(planName ?? "Membership")],
    ["Date", formatDate(paidAt)],
  ];
  if (validUntil) rows.push(["Active until", formatDate(validUntil)]);
  rows.push(["Reference", `<span style="font-family:'Courier New',monospace;font-size:12px;">${escapeHtml(reference)}</span>`]);

  return emailLayout({
    title: `Payment receipt — ${escapeHtml(gymName)}`,
    subtitle: escapeHtml(gymName),
    body: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
        Payment received &mdash; thank you, ${escapeHtml(memberName)}!
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
        Your membership at <strong>${escapeHtml(gymName)}</strong> is active. Here&rsquo;s your receipt.
      </p>
      ${receiptRows(rows)}
      ${emailButton(dashboardUrl, "View my membership &rarr;")}
      <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
        Payment processed securely by Paystack. Keep this email for your records.
      </p>`,
  });
}

/** Receipt sent to a gym owner after paying for their EngineRoom subscription. */
export function buildGymSubscriptionReceiptEmail({
  gymName,
  ownerName,
  planName,
  period,
  amount,
  reference,
  paidAt,
  validUntil,
  billingUrl,
}: {
  gymName: string;
  ownerName: string;
  planName: string;
  period: string;
  /** Naira */
  amount: number;
  reference: string;
  paidAt: string;
  validUntil: string;
  billingUrl: string;
}): string {
  const periodLabel = period === "annual" ? "Annual" : period === "halfyear" ? "6 months" : escapeHtml(period);
  return emailLayout({
    title: `EngineRoom subscription receipt — ${escapeHtml(gymName)}`,
    subtitle: escapeHtml(gymName),
    body: `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
        Subscription renewed, ${escapeHtml(ownerName)}
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
        Thanks for your payment. <strong>${escapeHtml(gymName)}</strong>&rsquo;s EngineRoom subscription is active.
      </p>
      ${receiptRows([
        ["Amount paid", formatNaira(amount)],
        ["Plan", `${escapeHtml(planName)} &middot; ${periodLabel}`],
        ["Date", formatDate(paidAt)],
        ["Active until", formatDate(validUntil)],
        ["Reference", `<span style="font-family:'Courier New',monospace;font-size:12px;">${escapeHtml(reference)}</span>`],
      ])}
      ${emailButton(billingUrl, "View billing &rarr;")}
      <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
        Payment processed securely by Paystack. Keep this email for your records.
      </p>`,
  });
}
