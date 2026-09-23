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
  <title>Welcome to ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
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
                  <div style="font-size:15px;font-weight:600;color:#111;">${email}</div>
                </div>
                <div>
                  <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;margin-bottom:4px;">Temporary Password</div>
                  <div style="font-size:15px;font-weight:600;color:#111;font-family:'Courier New',monospace;background:#fff;border:1px solid #ddd;border-radius:6px;padding:10px 14px;letter-spacing:0.05em;">${tempPassword}</div>
                </div>
              </div>
              <a href="${loginUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Log in to EngineRoom →
              </a>
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
  const urgencyColor = daysLeft === 3 ? "#E8460A" : "#b45309";
  const urgencyBg    = daysLeft === 3 ? "#fff5f0" : "#fff8f0";
  const urgencyBorder = daysLeft === 3 ? "#fdd0b8" : "#fde8cc";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Membership expiring soon — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
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
              <a href="${loginUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Renew membership →
              </a>
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
  const urgencyColor  = daysLeft === 3 ? "#E8460A" : "#b45309";
  const urgencyBg     = daysLeft === 3 ? "#fff5f0" : "#fff8f0";
  const urgencyBorder = daysLeft === 3 ? "#fdd0b8" : "#fde8cc";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>EngineRoom subscription expiring — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">Platform Subscription</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
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
              <a href="${renewUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Renew subscription →
              </a>
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
  <title>Your gym has been suspended — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Your gym has been suspended
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Hi ${ownerName}, access to <strong>${gymName}</strong> on EngineRoom has been suspended because
                your subscription lapsed and the 7-day grace period has ended.
              </p>
              <div style="background:#fff5f0;border:1px solid #fdd0b8;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#E8460A;line-height:1.6;">
                  Your gym admin dashboard and all member-facing features are currently unavailable.
                  Renew your subscription to restore access immediately.
                </p>
              </div>
              <a href="${renewUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Renew now to restore access →
              </a>
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
  <title>We missed you at ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
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
              <a href="${loginUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Check in today →
              </a>
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
  <title>Staff Approval Required — ${gymName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
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
              <a href="${teamUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Review invitation →
              </a>
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
      </td>
    </tr>
  </table>
</body>
</html>`;
}
