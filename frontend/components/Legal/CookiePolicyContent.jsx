"use client";

import LegalPage, { Address, Bullets, Mail, SiteLink } from "./LegalPage";
import { openCookieSettings } from "@/lib/consent";

function SubHeading({ children }) {
  return <h3 className="text-base sm:text-lg font-bold text-[#414143] pt-3">{children}</h3>;
}

// Cookie inventory for section 5 — based on an audit of the site's code
// (frontend + backend). Update this list whenever a cookie, analytics tag,
// pixel or third-party embed is added or removed. If a new optional tool is
// added, also bump CONSENT_VERSION in lib/consent.js so visitors are asked again.
const cookieInventory = [
  {
    name: "gatd_cookie_consent",
    technology: "Browser local storage",
    provider: "GATD (first-party)",
    purpose:
      "Remembers your cookie choices (which optional categories you accepted or rejected) so we don’t ask you on every visit.",
    type: "Essential",
    duration: "12 months, or until you change your choice or clear your browser data",
  },
  {
    name: "gatd_site_popup_seen",
    technology: "Browser session storage / local storage",
    provider: "GATD (first-party)",
    purpose:
      "Remembers that a visitor has already seen the website announcement pop-up, so it is not shown again repeatedly.",
    type: "Functional",
    duration:
      "Until the browser tab is closed, or until the next day when the pop-up is set to appear once daily",
  },
  {
    name: "gatd_admin_token, gatd_admin_user",
    technology: "Browser local storage",
    provider: "GATD (first-party)",
    purpose:
      "Keeps authorised GATD staff signed in to the website administration area. Not set for public visitors.",
    type: "Essential",
    duration: "Until sign-out; the sign-in expires after 12 hours",
  },
  {
    name: "_ga, _ga_4BRHJHFY7N",
    technology: "Google Analytics 4 (gtag.js) cookies",
    provider: "Google LLC",
    purpose:
      "Measures website traffic and how visitors use the website (e.g. pages visited, time on site, traffic sources) by distinguishing between visitors and sessions. Only set if you accept Analytics cookies.",
    type: "Analytics",
    duration: "Up to 2 years",
  },
  {
    name: "Google Maps embed (Contact page)",
    technology: "Third-party embedded map",
    provider: "Google LLC",
    purpose:
      "Displays the GATD office location map. The map only loads if you allow External media cookies or click “Load map”; Google may then set its own cookies.",
    type: "External media",
    duration: "Set by Google, as described in Google’s privacy policy",
  },
  {
    name: "YouTube / Vimeo video player (programme pages)",
    technology: "Third-party embedded video player",
    provider: "Google LLC (YouTube) / Vimeo, Inc.",
    purpose:
      "Plays a programme video only when you choose to watch it. YouTube videos use YouTube’s privacy-enhanced mode, and Vimeo is asked not to track viewers. The provider may still set its own cookies once the video plays.",
    type: "External media",
    duration: "Set by the video provider, as described in its privacy policy",
  },
];

function CookieTable() {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#414143] text-white">
          <tr>
            {["Cookie / Technology", "Provider", "Purpose", "Type", "Duration"].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {cookieInventory.map((c) => (
            <tr key={c.name} className="align-top odd:bg-white even:bg-slate-50">
              <td className="px-4 py-3">
                <span className="font-semibold text-[#414143] break-words">{c.name}</span>
                <span className="block text-xs text-slate-500 mt-1">{c.technology}</span>
              </td>
              <td className="px-4 py-3">{c.provider}</td>
              <td className="px-4 py-3">{c.purpose}</td>
              <td className="px-4 py-3">
                <span className="inline-flex rounded-full bg-[#D52029]/10 text-[#D52029] px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                  {c.type}
                </span>
              </td>
              <td className="px-4 py-3">{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const linkClass = "font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline";

// Opens the cookie preferences panel (same as the footer "Cookie Settings" link).
function CookieSettingsLink() {
  return (
    <button type="button" onClick={openCookieSettings} className={linkClass}>
      Cookie Settings
    </button>
  );
}

const sections = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies?",
    body: (
      <>
        <p>Cookies are small text files that may be stored on your device when you visit a website.</p>
        <p>
          They allow websites to recognise your device, remember preferences, understand website usage and provide certain functionality.
        </p>
        <p>
          GATD may use cookies and similar technologies on <SiteLink />.
        </p>
      </>
    ),
  },
  {
    id: "why-gatd-uses-cookies",
    title: "2. Why GATD Uses Cookies",
    body: (
      <>
        <p>We use cookies and similar technologies to:</p>
        <Bullets
          items={[
            "Operate essential website functions",
            "Remember your cookie choices and simple preferences",
            "Measure website traffic and understand how visitors use our website (only with your consent)",
            "Show embedded content such as our location map (only with your consent)",
            "Improve our content and services",
          ]}
        />
      </>
    ),
  },
  {
    id: "types-of-cookies",
    title: "3. Types of Cookies",
    body: (
      <>
        <SubHeading>3.1 Strictly Necessary Cookies</SubHeading>
        <p>These are needed for the website to work and cannot be switched off. They are used to:</p>
        <Bullets
          items={[
            "Remember your cookie choices",
            "Keep authorised GATD staff signed in to the website administration area",
          ]}
        />

        <SubHeading>3.2 Functional Storage</SubHeading>
        <p>
          We store a small note in your browser so the website announcement pop-up is not shown to you repeatedly.
        </p>

        <SubHeading>3.3 Analytics Cookies</SubHeading>
        <p>
          With your consent, we use Google Analytics 4 to understand how visitors use the website. Google Analytics may collect information such as:
        </p>
        <Bullets
          items={[
            "Pages visited and time spent on pages",
            "General geographic location (city or country level)",
            "Device and browser information",
            "How you arrived at our website (traffic sources)",
          ]}
        />
        <p>
          Google Analytics does not load, and sets no cookies, unless you accept Analytics cookies.
        </p>

        <SubHeading>3.4 External Media</SubHeading>
        <p>
          Some pages show content from other websites, such as the Google Maps location map on our Contact page and programme videos hosted on YouTube or Vimeo. These providers may set their own cookies. The map only loads if you allow External media or choose to load it, and a video only loads when you choose to play it.
        </p>

        <SubHeading>3.5 Marketing Cookies</SubHeading>
        <p>We do not currently use marketing or advertising cookies.</p>
      </>
    ),
  },
  {
    id: "third-party-technologies",
    title: "4. Third-Party Technologies",
    body: (
      <>
        <p>The following third-party services are used on our website:</p>
        <Bullets
          items={[
            "Google Analytics (Google LLC) — website analytics, only with your consent",
            "Google Maps (Google LLC) — the location map on our Contact page",
            "YouTube (Google LLC) and Vimeo, Inc. — programme videos, when you choose to play them",
          ]}
        />
        <p>
          These providers may place their own cookies or similar technologies on your device. Their use of information is governed by their respective privacy policies and terms.
        </p>
        <p>
          Our social media share buttons and links are plain links: they do not load anything from those platforms until you click them.
        </p>
        <p>
          Some images and icons are loaded from content delivery networks (flagcdn.com and cdnjs.cloudflare.com). These do not set cookies, but, as with any web request, they receive your IP address.
        </p>
      </>
    ),
  },
  {
    id: "cookies-currently-used",
    title: "5. Cookies Currently Used on the GATD Website",
    body: (
      <>
        <p>The table below lists the cookies and similar technologies currently used on our website:</p>
        <CookieTable />
      </>
    ),
  },
  {
    id: "managing-cookies",
    title: "6. Managing Cookies",
    body: (
      <>
        <p>You can manage cookies in the following ways:</p>
        <Bullets
          single
          items={[
            "Accept or reject optional cookies using the cookie banner shown on your first visit",
            "Change your choices at any time using the “Cookie Settings” link in the website footer",
            "Delete existing cookies through your browser settings",
            "Configure your browser to block certain cookies",
          ]}
        />
        <p>
          You can open your cookie preferences now: <CookieSettingsLink />.
        </p>
        <p>
          Rejecting optional cookies does not stop the website from working. Some embedded content, such as the location map, will not load until you allow it.
        </p>
      </>
    ),
  },
  {
    id: "cookie-consent",
    title: "7. Cookie Consent",
    body: (
      <>
        <p>
          When you first visit our website, a cookie banner asks whether you accept optional cookies. You can choose “Accept all”, “Reject all” or “Manage preferences”.
        </p>
        <p>
          Analytics and External media cookies are switched off until you agree to them. Strictly necessary storage is always active because the website needs it to work.
        </p>
        <p>
          Your choice is remembered for 12 months, after which we ask again. We will also ask again if we add new types of optional cookies.
        </p>
        <p>
          You can withdraw or change your consent at any time using <CookieSettingsLink /> in the footer. If you withdraw consent for Analytics, Google Analytics stops and its cookies are deleted from your browser.
        </p>
      </>
    ),
  },
  {
    id: "relationship-with-the-privacy-policy",
    title: "8. Relationship with the Privacy Policy",
    body: (
      <>
        <p>Cookies and similar technologies may collect information that constitutes personal data.</p>
        <p>
          Our processing of personal data is also governed by the GATD{" "}
          <a href="/privacy-policy" className={linkClass}>
            Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes-to-this-cookie-policy",
    title: "9. Changes to this Cookie Policy",
    body: (
      <>
        <p>
          GATD may update this Cookie Policy when our website, technologies, service providers or applicable requirements change.
        </p>
        <p>The latest version will be published on this page.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "10. Contact",
    body: (
      <>
        <p>If you have questions about our use of cookies, please contact:</p>
        <Address>
          <span className="font-semibold">GATD Pte. Ltd.</span>
          <br />
          100 Jalan Sultan, #09-06
          <br />
          Sultan Plaza
          <br />
          Singapore 199001
          <br />
          Email: <Mail address="info@globalatd.com" />
        </Address>
      </>
    ),
  },
];

export default function CookiePolicyContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="COOKIE POLICY"
      company="GATD Pte. Ltd."
      dates={["Effective Date: 05.10.2026", "Last Updated: 08.10.2026"]}
      banner="/images/legal/cookie-policy-banner.jpg"
      tocLabel="Cookie Policy"
      contact={{ label: "Questions about cookies", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
