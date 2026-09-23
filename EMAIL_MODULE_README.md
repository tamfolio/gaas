# Email Module — Integration Guide

A self-contained Node.js email module extracted from the Pennytree Messaging Service. Drop the `email/` folder into your project and call `sendTemplatedEmail()` from anywhere in your app — no HTTP layer, no separate service.

---

## Folder Structure

```
email/
├── index.js                  # sendTemplatedEmail({ type, data }) — main entry
├── transporter.js            # nodemailer Gmail SMTP configuration
├── sendMail.js               # low-level sendMail({ to, subject, html })
└── templates/
    ├── otpEmail.js
    ├── welcomeEmail.js
    ├── passwordResetEmail.js
    ├── creditEmail.js
    ├── debitEmail.js
    └── genericEmail.js
```

---

## 1. Install Dependency

```bash
npm install nodemailer
```

---

## 2. Environment Variables

Add to your `.env` file:

```env
SENDER_MAIL=your-gmail@gmail.com
SENDER_PASS=your-gmail-app-password
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App passwords → generate one for "Mail". Use that value — not your regular Gmail password.

Your app's entry point must load `.env` before this module runs:

```js
require('dotenv').config();
```

---

## 3. File Contents

### `email/transporter.js`

```js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.SENDER_PASS,
  },
});

module.exports = transporter;
```

### `email/sendMail.js`

```js
const transporter = require('./transporter');

const sendMail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"Your App" <${process.env.SENDER_MAIL}>`,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
```

> Change `"Your App"` to your application's display name.

### `email/index.js`

```js
const { sendMail }                 = require('./sendMail');
const { renderOtpEmail }           = require('./templates/otpEmail');
const { renderWelcomeEmail }       = require('./templates/welcomeEmail');
const { renderPasswordResetEmail } = require('./templates/passwordResetEmail');
const { renderCreditEmail }        = require('./templates/creditEmail');
const { renderDebitEmail }         = require('./templates/debitEmail');
const { renderGenericEmail }       = require('./templates/genericEmail');

const templates = {
  OTP:           { render: renderOtpEmail,           subject: 'Your verification code' },
  Welcome:       { render: renderWelcomeEmail,       subject: 'Welcome aboard!' },
  PasswordReset: { render: renderPasswordResetEmail, subject: 'Reset your password' },
  Credit:        { render: renderCreditEmail,        subject: 'Credit alert' },
  Debit:         { render: renderDebitEmail,         subject: 'Debit alert' },
  Generic:       { render: renderGenericEmail,       subject: (data) => data.subject },
};

const sendTemplatedEmail = async ({ type, data }) => {
  const template = templates[type];
  if (!template) throw new Error(`Unknown email type: "${type}"`);

  const html    = template.render(data);
  const subject = typeof template.subject === 'function'
    ? template.subject(data)
    : template.subject;

  return sendMail({ to: data.receiver, subject, html });
};

module.exports = { sendTemplatedEmail, sendMail };
```

---

## 4. Usage

```js
const { sendTemplatedEmail } = require('./email');

// OTP
await sendTemplatedEmail({
  type: 'OTP',
  data: {
    receiver:  'user@example.com',
    firstname: 'Jane',
    otp:       '847291',
  },
});

// Welcome
await sendTemplatedEmail({
  type: 'Welcome',
  data: {
    receiver:  'user@example.com',
    firstname: 'Jane',
  },
});

// Password reset
await sendTemplatedEmail({
  type: 'PasswordReset',
  data: {
    receiver:   'user@example.com',
    firstname:  'Jane',
    reset_link: 'https://yourapp.com/reset?token=abc123',
  },
});

// Generic (subject comes from data)
await sendTemplatedEmail({
  type: 'Generic',
  data: {
    receiver:  'user@example.com',
    firstname: 'Jane',
    subject:   'Action required on your account',
    body:      'Please log in to review a recent change.',
  },
});
```

Always wrap calls in `try/catch` — `sendTemplatedEmail` throws on SMTP failure or an unknown type string.

---

## 5. Email Types & Required Fields

| Type            | Required fields                                        |
|-----------------|--------------------------------------------------------|
| `OTP`           | `receiver`, `firstname`, `otp`                         |
| `Welcome`       | `receiver`, `firstname`                                |
| `PasswordReset` | `receiver`, `firstname`, `reset_link`                  |
| `Credit`        | `receiver`, `firstname`, `amount`, `balance`           |
| `Debit`         | `receiver`, `firstname`, `amount`, `balance`           |
| `Generic`       | `receiver`, `firstname`, `subject`, `body`             |

`receiver` is always the recipient email address across all types.

---

## 6. Adding a New Template

**Step 1 — Create the template file**

```js
// email/templates/myEmail.js

const renderMyEmail = ({ firstname, some_data }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    /* Always use inline CSS — email clients strip external stylesheets */
    body { font-family: 'Poppins', sans-serif; background: #f4f4f4; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 32px; }
    h1 { color: #14B8A6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hi ${firstname},</h1>
    <p>${some_data}</p>
  </div>
</body>
</html>
`;

module.exports = { renderMyEmail };
```

**Step 2 — Register it in `email/index.js`**

```js
const { renderMyEmail } = require('./templates/myEmail');

// Add to the templates object:
MyType: { render: renderMyEmail, subject: 'My subject line' },
```

**Step 3 — Call it**

```js
await sendTemplatedEmail({
  type: 'MyType',
  data: { receiver: '...', firstname: '...', some_data: '...' },
});
```

---

## Notes

- **Inline CSS only** inside templates — email clients strip external and embedded stylesheets.
- **SMTP port:** configured for `465` with `secure: true`. Switch to `587` + `secure: false` for STARTTLS.
- **From name:** change `"Your App"` in `sendMail.js` to your app's display name.
- **Error handling:** `sendTemplatedEmail` is `async` and throws — always `await` inside a `try/catch`.
- **Testing:** use [Ethereal Email](https://ethereal.email) as a fake SMTP server during development — swap the transporter config and no real emails are sent.
