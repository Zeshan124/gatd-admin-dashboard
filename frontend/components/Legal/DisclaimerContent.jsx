"use client";

import LegalPage, { Address, Bullets, Mail, SiteLink } from "./LegalPage";

const sections = [
  {
    id: "general-information",
    title: "1. General Information",
    body: (
      <>
        <p>
          The information provided on the GATD website, <SiteLink />, is provided for general informational, educational and business purposes.
        </p>
        <p>
          While GATD makes reasonable efforts to maintain accurate and useful information, we do not warrant that all information is complete, accurate, current or error-free.
        </p>
      </>
    ),
  },
  {
    id: "no-professional-advice",
    title: "2. No Professional Advice",
    body: (
      <>
        <p>
          Information published on the website, including articles, reports, leadership insights, educational content and other materials, should not be regarded as legal, financial, investment, medical, accounting or other professional advice.
        </p>
        <p>You should seek appropriately qualified professional advice where necessary.</p>
      </>
    ),
  },
  {
    id: "executive-education-and-training-outcomes",
    title: "3. Executive Education and Training Outcomes",
    body: (
      <>
        <p>
          GATD programmes are designed to support learning, leadership development, professional development and organisational improvement.
        </p>
        <p>However, participation in a GATD programme does not guarantee:</p>
        <Bullets
          items={[
            "Promotion",
            "Employment",
            "Salary increases",
            "Business growth",
            "Financial returns",
            "Organisational transformation",
            "Improved performance",
            "Specific leadership outcomes",
            "Any particular professional or commercial result",
          ]}
        />
        <p>
          Outcomes depend on individual and organisational circumstances, implementation and numerous factors outside GATD’s control.
        </p>
      </>
    ),
  },
  {
    id: "programme-information",
    title: "4. Programme Information",
    body: (
      <>
        <p>
          Programme dates, locations, faculty, speakers, schedules, content, fees and other information may change.
        </p>
        <p>GATD reserves the right to modify programme arrangements where reasonably necessary.</p>
      </>
    ),
  },
  {
    id: "accreditation-and-recognition",
    title: "5. Accreditation and Recognition",
    body: (
      <>
        <p>
          References to accreditation, certification, rankings, memberships, affiliations, partnerships or recognition apply only to the relevant programme, institution or service for which such recognition has been expressly stated.
        </p>
        <p>
          A reference to an organisation or accreditation body does not automatically mean that all GATD programmes are accredited, endorsed or certified by that organisation.
        </p>
        <p>
          Participants should refer to the specific programme documentation for the applicable certification or accreditation information.
        </p>
      </>
    ),
  },
  {
    id: "third-party-information",
    title: "6. Third-Party Information",
    body: (
      <>
        <p>
          The GATD website may contain information, links, references, logos or materials relating to third-party organisations.
        </p>
        <p>GATD does not guarantee the accuracy, availability or reliability of third-party information.</p>
        <p>Third-party names and logos remain the property of their respective owners.</p>
      </>
    ),
  },
  {
    id: "testimonials-and-case-studies",
    title: "7. Testimonials and Case Studies",
    body: (
      <>
        <p>
          Testimonials, case studies and examples published by GATD represent the experiences of the individuals or organisations concerned.
        </p>
        <p>They are not guarantees of future results.</p>
      </>
    ),
  },
  {
    id: "external-links",
    title: "8. External Links",
    body: (
      <>
        <p>GATD may provide links to external websites for convenience.</p>
        <p>
          We do not control external websites and are not responsible for their content, security, availability, privacy practices or terms.
        </p>
      </>
    ),
  },
  {
    id: "website-availability",
    title: "9. Website Availability",
    body: (
      <>
        <p>
          Although GATD takes reasonable steps to maintain the website, we do not guarantee that the website will be continuously available, uninterrupted or free from errors, viruses or other harmful components.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "10. Intellectual Property",
    body: (
      <>
        <p>
          Unless otherwise stated, content published on the GATD website is protected by applicable intellectual-property laws.
        </p>
        <p>Unauthorised copying, reproduction, distribution or commercial use may be prohibited.</p>
        <p>
          Please refer to our{" "}
          <a
            href="/copyright-and-intellectual-property"
            className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
          >
            Copyright &amp; Intellectual Property Notice
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-responsibility",
    title: "11. Limitation of Responsibility",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, GATD disclaims responsibility for loss or damage arising from reliance on information published on the website.
        </p>
        <p>Nothing in this Disclaimer excludes liability that cannot lawfully be excluded or limited.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "12. Changes",
    body: (
      <>
        <p>GATD may update this Disclaimer from time to time.</p>
        <p>The latest version will be published on this page.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "13. Contact",
    body: (
      <>
        <p>For questions concerning this Disclaimer, please contact:</p>
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

export default function DisclaimerContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="DISCLAIMER"
      company="GATD Pte. Ltd."
      dates={["Effective Date: 05.10.2026", "Last Updated: 05.10.2026"]}
      banner="/images/legal/disclaimer-banner.jpg"
      tocLabel="Disclaimer"
      contact={{ label: "Questions about this Disclaimer", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
