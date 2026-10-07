// Renders the program-registration emails with sample data so they can be
// viewed in a browser without sending anything.
//
// Usage:  node scripts/preview-registration-email.js
// Output: email-previews/registration-user.html   (what the registrant receives)
//         email-previews/registration-admin.html  (internal notification)

const fs = require("fs");
const path = require("path");
const { buildRegistrationEmails } = require("../src/utils/registrationEmails");

const { user, admin } = buildRegistrationEmails({
  value: {
    firstName: "Sarah",
    lastName: "Tan",
    email: "sarah.tan@example.com",
    phoneNumber: "9123 4567",
    country: "Singapore",
    designation: "HR Director",
    organization: "Example Pte Ltd",
    hearAboutUs: "LinkedIn",
    sourcePage: "/solutions/strategic-hr/",
  },
  dialCode: "+65",
  referenceNo: "GATD-2026-000123",
  programs: [
    { title: "Certified Strategic HR Business Partner", price_cents: 450000 },
    { title: "Certified HR Analytics Professional", price_cents: 320000 },
  ],
  currency: "SGD",
  totalAmountCents: 770000,
});

const outDir = path.join(__dirname, "..", "email-previews");
fs.mkdirSync(outDir, { recursive: true });

const page = (email) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${email.subject}</title></head>` +
  `<body style="margin:0;background:#f4f4f5;padding:24px">` +
  `<div style="max-width:680px;margin:0 auto;font-family:Arial,sans-serif;font-size:13px;color:#555;margin-bottom:8px">` +
  `<strong>Subject:</strong> ${email.subject}</div>` +
  `<div style="max-width:680px;margin:0 auto;background:#fff;padding:24px;border-radius:8px">${email.html}</div>` +
  `</body></html>`;

for (const [name, email] of [["registration-user", user], ["registration-admin", admin]]) {
  fs.writeFileSync(path.join(outDir, `${name}.html`), page(email));
  fs.writeFileSync(path.join(outDir, `${name}.txt`), `Subject: ${email.subject}\n\n${email.text}\n`);
}

console.log(`Previews written to ${outDir}`);
