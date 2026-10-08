"use client";

import LegalPage, { Address, Bullets, Mail, SiteLink } from "./LegalPage";

const sections = [
  {
    id: "ownership",
    title: "1. Ownership",
    body: (
      <>
        <p>
          Unless otherwise stated, the content and materials published on <SiteLink /> are owned by, licensed to, or used with permission by GATD Pte. Ltd. / Global Association for Training and Development (“GATD”).
        </p>
        <p>GATD reserves all rights in its intellectual property to the fullest extent permitted by applicable law.</p>
      </>
    ),
  },
  {
    id: "protected-materials",
    title: "2. Protected Materials",
    body: (
      <>
        <p>GATD intellectual property may include:</p>
        <Bullets
          items={[
            "GATD name and brand",
            "Logos and visual identity",
            "Website content",
            "Articles and publications",
            "Reports and research",
            "Programme descriptions",
            "Course structures",
            "Executive education frameworks",
            "Leadership models",
            "Assessment tools",
            "Learning methodologies",
            "Training materials",
            "Presentations",
            "Participant materials",
            "Workbooks",
            "Videos",
            "Audio materials",
            "Graphics and illustrations",
            "Photographs owned or licensed by GATD",
            "Templates",
            "Digital resources",
            "Software or digital tools",
            "Databases",
            "Original concepts and methodologies",
            "Other proprietary materials",
          ]}
        />
      </>
    ),
  },
  {
    id: "copyright",
    title: "3. Copyright",
    body: (
      <>
        <p>Copyright in original GATD materials is protected by applicable copyright laws.</p>
        <p>
          Unless expressly permitted, you may not reproduce, copy, modify, distribute, publish, transmit, display, sell, license or commercially exploit GATD copyrighted material.
        </p>
      </>
    ),
  },
  {
    id: "permitted-personal-or-internal-use",
    title: "4. Permitted Personal or Internal Use",
    body: (
      <>
        <p>
          Visitors may access and view website materials for legitimate personal, educational or internal business purposes.
        </p>
        <p>
          Any copying should be limited to what is reasonably necessary for that purpose and must not remove copyright or ownership notices.
        </p>
        <p>Commercial reproduction or redistribution requires prior written permission from GATD.</p>
      </>
    ),
  },
  {
    id: "training-and-programme-materials",
    title: "5. Training and Programme Materials",
    body: (
      <>
        <p>
          GATD programme materials provided to participants are generally supplied for the participant’s own educational use.
        </p>
        <p>Unless expressly agreed otherwise, participants may not:</p>
        <Bullets
          items={[
            "Reproduce programme materials for commercial distribution",
            "Upload materials to public websites",
            "Share paid course materials outside the authorised participant group",
            "Resell course materials",
            "Record training sessions without permission",
            "Create derivative commercial training products from GATD materials",
            "Represent GATD materials as their own",
          ]}
        />
      </>
    ),
  },
  {
    id: "gatd-methodologies-and-frameworks",
    title: "6. GATD Methodologies and Frameworks",
    body: (
      <>
        <p>
          GATD may develop proprietary methodologies, frameworks, models, tools and approaches for executive education, leadership development, organisational development and strategic advisory.
        </p>
        <p>
          Participation in a GATD programme does not automatically transfer ownership of these methodologies or underlying intellectual property to the participant or sponsoring organisation.
        </p>
        <p>Any transfer or licence of intellectual property must be expressly agreed in writing.</p>
      </>
    ),
  },
  {
    id: "third-party-intellectual-property",
    title: "7. Third-Party Intellectual Property",
    body: (
      <>
        <p>The GATD website may contain content owned by third parties, including:</p>
        <Bullets
          items={[
            "University partners",
            "Academic institutions",
            "Accreditation bodies",
            "Faculty members",
            "Trainers",
            "Consultants",
            "Photographers",
            "Event partners",
            "Technology providers",
            "Other licensors",
          ]}
        />
        <p>
          Such content remains the property of its respective owner and may be subject to separate licensing conditions.
        </p>
      </>
    ),
  },
  {
    id: "use-of-names-logos-and-trademarks",
    title: "8. Use of Names, Logos and Trademarks",
    body: (
      <>
        <p>
          GATD’s name, logo, trademarks, programme names and branding may not be used without prior written permission.
        </p>
        <p>
          The names and logos of universities, business schools, accreditation bodies, corporate partners and other third parties belong to their respective owners.
        </p>
        <p>
          No third-party name or logo displayed on the GATD website should be interpreted as granting a licence to use that trademark.
        </p>
      </>
    ),
  },
  {
    id: "website-content",
    title: "9. Website Content",
    body: (
      <>
        <p>
          The GATD website and its content may not be copied or reproduced substantially for the purpose of creating another commercial website, training service, publication or competing business.
        </p>
        <p>
          Automated scraping, systematic extraction or commercial reproduction of GATD website content is prohibited unless expressly authorised.
        </p>
      </>
    ),
  },
  {
    id: "permission-requests",
    title: "10. Permission Requests",
    body: (
      <>
        <p>
          Requests to reproduce, republish, license or otherwise use GATD intellectual property should be sent to:
        </p>
        <p>
          <Mail address="info@globalatd.com" />
        </p>
        <p>Requests should clearly identify:</p>
        <Bullets
          items={[
            "The material requested",
            "Intended use",
            "Distribution method",
            "Geographic territory",
            "Duration of intended use",
            "Whether the use is commercial or non-commercial",
          ]}
        />
        <p>Permission must be obtained in writing before use.</p>
      </>
    ),
  },
  {
    id: "copyright-complaints",
    title: "11. Copyright Complaints",
    body: (
      <>
        <p>
          If you believe material published on the GATD website infringes your intellectual property rights, please contact:
        </p>
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
        <p>Please provide sufficient information to enable GATD to investigate the concern.</p>
      </>
    ),
  },
  {
    id: "no-implied-licence",
    title: "12. No Implied Licence",
    body: (
      <>
        <p>
          Nothing on the GATD website grants an implied licence or other right to use GATD intellectual property beyond what is expressly permitted by these terms.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "13. Changes",
    body: (
      <>
        <p>GATD may update this Intellectual Property Notice from time to time.</p>
        <p>The latest version will be published on this page.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "14. Contact",
    body: (
      <>
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

export default function CopyrightContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="COPYRIGHT & INTELLECTUAL PROPERTY NOTICE"
      company="GATD Pte. Ltd."
      dates={["Effective Date: 05.10.2026", "Last Updated: 05.10.2026"]}
      banner="/images/legal/copyright-and-intellectual-property-banner.jpg"
      tocLabel="Copyright & IP Notice"
      contact={{ label: "Permission Requests", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
