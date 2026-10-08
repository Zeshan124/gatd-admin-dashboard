"use client";

import LegalPage, { Address, Bullets, Mail, SiteLink } from "./LegalPage";

function SubHeading({ children }) {
  return <h3 className="text-base sm:text-lg font-bold text-[#414143] pt-3">{children}</h3>;
}

// Cookie inventory for section 5 — based on an audit of the site's code
// (frontend + backend). Update this list whenever a cookie, analytics tag,
// pixel or third-party embed is added or removed.
const cookieInventory = [
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
      "Measures website traffic and how visitors use the website (e.g. pages visited, time on site, traffic sources) by distinguishing between visitors and sessions.",
    type: "Analytics",
    duration: "Up to 2 years",
  },
  {
    name: "Google Maps embed (Contact page)",
    technology: "Third-party embedded map",
    provider: "Google LLC",
    purpose:
      "Displays the GATD office location map. Google may set its own cookies when the map loads.",
    type: "Functional",
    duration: "Set by Google, as described in Google’s privacy policy",
  },
  {
    name: "YouTube / Vimeo video player (programme pages)",
    technology: "Third-party embedded video player",
    provider: "Google LLC (YouTube) / Vimeo, Inc.",
    purpose:
      "Plays programme videos where a video has been added to a programme. The provider may set its own cookies when the video is played.",
    type: "Functional",
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
        <p>We may use cookies for purposes including:</p>
        <Bullets
          items={[
            "Operating essential website functions",
            "Improving website performance",
            "Remembering preferences",
            "Understanding how visitors use our website",
            "Measuring website traffic",
            "Improving our content and services",
            "Maintaining website security",
            "Supporting marketing or communications activities where applicable",
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
        <p>These cookies may be required for the website to function properly.</p>
        <p>They may support:</p>
        <Bullets
          items={[
            "Security",
            "Page navigation",
            "Form functionality",
            "Session management",
            "Basic website operation",
          ]}
        />
        <p>
          These cookies generally cannot be disabled through standard website cookie controls where they are essential to the operation of the website.
        </p>

        <SubHeading>3.2 Functional Cookies</SubHeading>
        <p>Functional cookies may allow the website to remember preferences and provide enhanced functionality.</p>

        <SubHeading>3.3 Analytics and Performance Cookies</SubHeading>
        <p>GATD may use analytics technologies to understand how visitors use the website.</p>
        <p>These technologies may collect information such as:</p>
        <Bullets
          items={[
            "Pages visited",
            "Time spent on pages",
            "General geographic information",
            "Device and browser information",
            "Traffic sources",
            "Website interactions",
          ]}
        />
        <p>GATD will only identify specific analytics providers actually implemented on the website.</p>

        <SubHeading>3.4 Marketing Cookies</SubHeading>
        <p>
          Where applicable, GATD may use marketing or advertising technologies to understand engagement with our digital communications or to provide relevant marketing.
        </p>
        <p>Such technologies will only be used where appropriately implemented and permitted.</p>
      </>
    ),
  },
  {
    id: "third-party-technologies",
    title: "4. Third-Party Technologies",
    body: (
      <>
        <p>Certain website functions may be provided by third-party services.</p>
        <p>Examples may include:</p>
        <Bullets
          items={[
            "Website analytics providers",
            "Video hosting platforms",
            "Social media platforms",
            "Registration platforms",
            "Payment providers",
            "Email marketing platforms",
            "Security providers",
          ]}
        />
        <p>Third-party providers may place their own cookies or similar technologies on your device.</p>
        <p>Their use of information is governed by their respective privacy policies and terms.</p>
      </>
    ),
  },
  {
    id: "cookies-currently-used",
    title: "5. Cookies Currently Used on the GATD Website",
    body: (
      <>
        <p>The website administrator should maintain an accurate cookie inventory.</p>
        <p>
          Before publication, the following table should be completed based on an actual scan of the live website:
        </p>
        <CookieTable />
        <p>
          Important: GATD should not list Google Analytics, Meta Pixel, LinkedIn Insight Tag, YouTube cookies or other technologies unless they are actually installed or activated on the website.
        </p>
      </>
    ),
  },
  {
    id: "managing-cookies",
    title: "6. Managing Cookies",
    body: (
      <>
        <p>Depending on the technology used, you may be able to:</p>
        <Bullets
          single
          items={[
            "Accept or reject optional cookies through the website’s cookie-consent mechanism",
            "Change cookie preferences",
            "Delete existing cookies through your browser",
            "Configure your browser to block certain cookies",
          ]}
        />
        <p>Disabling some cookies may affect website functionality.</p>
      </>
    ),
  },
  {
    id: "cookie-consent",
    title: "7. Cookie Consent",
    body: (
      <>
        <p>
          Where required, GATD will provide an appropriate mechanism for visitors to manage consent for non-essential cookies.
        </p>
        <p>
          The website should distinguish between cookies that are necessary for website operation and optional cookies where appropriate.
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
      dates={["Effective Date: [05.10.2026]", "Last Updated: [05.10.2026]"]}
      banner="/images/legal/cookie-policy-banner.jpg"
      tocLabel="Cookie Policy"
      contact={{ label: "Questions about cookies", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
