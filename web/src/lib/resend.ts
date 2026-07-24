import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Update this to match your verified Resend domain before going to production.
// For local testing with a real key, use 'onboarding@resend.dev' (sends to verified addresses only).
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "EngineRoom <onboarding@resend.dev>";

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

          <!-- Header -->
          <tr>
            <td style="background:#100F0E;padding:28px 32px;">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;line-height:1;">
                Engine<span style="color:#E8460A;">Room</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:4px;">${gymName}</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;letter-spacing:-0.5px;">
                Welcome, ${memberName}!
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.7;">
                Your membership at <strong>${gymName}</strong> has been set up on EngineRoom.
                Use the details below to log in for the first time.
              </p>

              <!-- Credentials box -->
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

              <!-- CTA -->
              <a href="${loginUrl}" style="display:block;background:#E8460A;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:14px;text-align:center;letter-spacing:-0.2px;">
                Log in to EngineRoom →
              </a>

              <p style="margin:20px 0 0;font-size:12px;color:#aaa;line-height:1.7;">
                Please change your password after your first login.
                If you weren&rsquo;t expecting this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
