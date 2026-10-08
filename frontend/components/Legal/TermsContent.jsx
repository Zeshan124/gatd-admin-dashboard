"use client";

import LegalPage, { Address, Bullets, Mail, SiteLink } from "./LegalPage";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: (
      <>
        <p>
          These Terms &amp; Conditions (“Terms”) govern your access to and use of the GATD website, <SiteLink />, and the information, content and services made available through it.
        </p>
        <p>
          The website is operated by GATD Pte. Ltd., trading as Global Association for Training and Development (“GATD”, “we”, “us” or “our”).
        </p>
        <p>
          By accessing or using the website, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the website.
        </p>
      </>
    ),
  },
  {
    id: "about-gatd",
    title: "2. About GATD",
    body: (
      <>
        <p>
          GATD provides executive education, leadership development, professional development, strategic advisory, consulting, customised programmes, executive retreats, conferences, events and related services.
        </p>
        <p>
          Information about specific programmes, services or partnerships published on the website may be subject to separate agreements, registration terms, programme terms or contractual arrangements.
        </p>
        <p>
          Where a separate agreement applies, that agreement will govern the relevant transaction or service to the extent of any inconsistency.
        </p>
      </>
    ),
  },
  {
    id: "website-use",
    title: "3. Website Use",
    body: (
      <>
        <p>You may use the website for lawful purposes only.</p>
        <p>You must not:</p>
        <Bullets
          items={[
            "Use the website for unlawful or fraudulent purposes",
            "Attempt to gain unauthorised access to the website or its systems",
            "Interfere with website security or functionality",
            "Introduce malicious software or harmful code",
            "Copy or reproduce substantial portions of the website without permission",
            "Scrape, harvest or systematically extract website information without permission",
            "Misrepresent your identity or affiliation",
            "Use GATD content to create a competing commercial service without permission",
            "Use GATD’s trademarks, logos or branding without written permission",
          ]}
        />
      </>
    ),
  },
  {
    id: "website-content",
    title: "4. Website Content",
    body: (
      <>
        <p>
          GATD seeks to provide accurate and useful information but does not guarantee that all website information is complete, current or error-free.
        </p>
        <p>
          Programme dates, locations, faculty, speakers, content, fees, schedules and other details may change without notice where reasonably necessary.
        </p>
        <p>GATD reserves the right to correct errors and update website content at any time.</p>
      </>
    ),
  },
  {
    id: "programmes-and-services",
    title: "5. Programmes and Services",
    body: (
      <>
        <p>
          Descriptions of programmes and services published on the website are for general information unless expressly stated otherwise.
        </p>
        <p>Participation in a programme may be subject to:</p>
        <Bullets
          items={[
            "Application requirements",
            "Eligibility criteria",
            "Availability",
            "Payment of applicable fees",
            "Registration requirements",
            "Programme-specific terms",
            "Confirmation by GATD or an authorised partner",
          ]}
        />
        <p>
          GATD reserves the right to modify, postpone or cancel a programme where circumstances reasonably require it.
        </p>
      </>
    ),
  },
  {
    id: "registration-and-payment",
    title: "6. Registration and Payment",
    body: (
      <>
        <p>
          Where online registration or payment is available, the relevant programme page or registration platform may contain additional terms.
        </p>
        <p>
          A registration is not necessarily confirmed until GATD or its authorised registration / payment provider confirms acceptance.
        </p>
        <p>
          All applicable fees, taxes and payment terms will be communicated at the time of registration or purchase.
        </p>
      </>
    ),
  },
  {
    id: "cancellation-and-refunds",
    title: "7. Cancellation and Refunds",
    body: (
      <>
        <p>
          Cancellations and refunds are subject to GATD’s applicable{" "}
          <a
            href="/cancellation-and-refund-policy"
            className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
          >
            Cancellation &amp; Refund Policy
          </a>{" "}
          and any programme-specific terms communicated at registration.
        </p>
        <p>
          Where a programme is delivered jointly with a partner institution or third-party provider, additional cancellation conditions may apply.
        </p>
      </>
    ),
  },
  {
    id: "certificates-and-programme-recognition",
    title: "8. Certificates and Programme Recognition",
    body: (
      <>
        <p>
          GATD may issue certificates, completion documentation or other recognition for qualifying participants.
        </p>
        <p>
          The requirements for receiving such documentation may include attendance, assessment, project completion, participation or other programme-specific requirements.
        </p>
        <p>
          References to accreditation, certification, rankings, institutional affiliations or recognition on the website should not be interpreted as suggesting that every GATD programme carries every stated accreditation or recognition.
        </p>
        <p>
          Where a programme is jointly delivered with another institution or organisation, the relevant programme documentation will specify the applicable recognition or certification.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    body: (
      <>
        <p>Unless otherwise stated, the website and its content are owned by or licensed to GATD.</p>
        <p>This includes, where applicable:</p>
        <Bullets
          items={[
            "Text",
            "Articles",
            "Reports",
            "Programme descriptions",
            "Frameworks",
            "Models",
            "Graphics",
            "Photographs",
            "Videos",
            "Presentations",
            "Logos",
            "Trademarks",
            "Course materials",
            "Learning resources",
            "Downloadable documents",
            "Original methodologies and intellectual property",
          ]}
        />
        <p>
          You may view and use website content for personal or internal business purposes only, unless GATD gives written permission for another use.
        </p>
        <p>
          You may not reproduce, distribute, modify, publish, sell, license or commercially exploit GATD intellectual property without prior written permission.
        </p>
      </>
    ),
  },
  {
    id: "third-party-content-and-partners",
    title: "10. Third-Party Content and Partners",
    body: (
      <>
        <p>
          GATD may reference or work with universities, business schools, professional organisations, faculty members, consultants, trainers, technology providers and other partners.
        </p>
        <p>Third-party names, logos, trademarks and materials remain the property of their respective owners.</p>
        <p>
          The inclusion of a third-party reference does not necessarily constitute an endorsement, ownership relationship, accreditation or permanent partnership unless expressly stated.
        </p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "11. External Links",
    body: (
      <>
        <p>The website may contain links to external websites.</p>
        <p>
          GATD provides such links for convenience and does not control or guarantee the content, security, availability or privacy practices of external websites.
        </p>
        <p>Your use of third-party websites is subject to their own terms and policies.</p>
      </>
    ),
  },
  {
    id: "user-submissions",
    title: "12. User Submissions",
    body: (
      <>
        <p>
          If you submit information, feedback, testimonials, comments, photographs or other materials to GATD, you confirm that you have the necessary rights and permissions to provide that material.
        </p>
        <p>
          You must not submit material that infringes another person’s intellectual property, privacy or other legal rights.
        </p>
      </>
    ),
  },
  {
    id: "testimonials-and-results",
    title: "13. Testimonials and Results",
    body: (
      <>
        <p>
          Testimonials, case studies and examples presented on the website reflect individual or organisational experiences.
        </p>
        <p>They do not guarantee that another participant or organisation will achieve the same results.</p>
        <p>
          Professional development, leadership performance, organisational performance and business outcomes depend on many factors outside GATD’s control.
        </p>
      </>
    ),
  },
  {
    id: "availability-of-the-website",
    title: "14. Availability of the Website",
    body: (
      <>
        <p>
          GATD does not guarantee that the website will always be available, uninterrupted, secure or free from errors.
        </p>
        <p>
          We may suspend, modify or discontinue parts of the website for maintenance, security, technical or business reasons.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "15. Limitation of Liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by applicable law, GATD shall not be liable for indirect, incidental, consequential or special loss arising from your use of the website or reliance on information published on it.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by law.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "16. Indemnity",
    body: (
      <>
        <p>
          To the extent permitted by applicable law, you agree to indemnify GATD against claims, losses, liabilities, costs or expenses arising from your unlawful use of the website, violation of these Terms or infringement of third-party rights.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "17. Privacy",
    body: (
      <>
        <p>
          Your use of the website is also subject to GATD’s{" "}
          <a
            href="/privacy-policy"
            className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/cookie-policy"
            className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
          >
            Cookie Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "18. Changes to these Terms",
    body: (
      <>
        <p>GATD may amend these Terms from time to time.</p>
        <p>The updated Terms will be published on this page with the revised effective or updated date.</p>
        <p>
          Your continued use of the website after changes are published constitutes acceptance of the revised Terms, to the extent permitted by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "19. Governing Law",
    body: (
      <>
        <p>These Terms are governed by the laws of Singapore.</p>
        <p>
          Any dispute arising from these Terms or your use of the website shall be subject to the jurisdiction of the courts of Singapore, unless otherwise required by applicable law or agreed in a separate written agreement.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "20. Contact",
    body: (
      <>
        <p>For questions regarding these Terms, please contact:</p>
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

export default function TermsContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="TERMS & CONDITIONS"
      company="GATD Pte. Ltd."
      dates={["Effective Date: [05.10.2026]", "Last Updated: [05.10.2026]"]}
      banner="/images/legal/terms-and-conditions-banner.jpg"
      tocLabel="Terms & Conditions"
      contact={{ label: "Questions about these Terms", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
