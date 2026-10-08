"use client";

import LegalPage, { Address, Bullets, Mail } from "./LegalPage";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    body: (
      <>
        <p>
          GATD Pte. Ltd., operating under the name Global Association for Training and Development (“GATD”, “we”, “us” or “our”), respects the privacy of individuals and is committed to protecting personal data entrusted to us.
        </p>
        <p>
          This Privacy Policy explains how GATD collects, uses, discloses, stores, protects and otherwise processes personal data through our website, programmes, events, executive education activities, consulting services, communications and other business activities.
        </p>
        <p>
          GATD is a Singapore-incorporated company and this Privacy Policy is intended to comply with applicable Singapore data-protection requirements, including the Personal Data Protection Act 2012 (“PDPA”), as applicable.
        </p>
        <p>
          By using our website or voluntarily providing personal data to us, you acknowledge that you have read and understood this Privacy Policy.
        </p>
      </>
    ),
  },
  {
    id: "who-we-are",
    title: "2. Who We Are",
    body: (
      <>
        <Address>
          <span className="font-semibold">GATD Pte. Ltd.</span>
          <br />
          Global Association for Training and Development
          <br />
          100 Jalan Sultan, #09-06
          <br />
          Sultan Plaza
          <br />
          Singapore 199001
          <br />
          Website:{" "}
          <a
            href="https://www.globalatd.com"
            className="font-medium text-[#D52029] hover:text-red-700 underline-offset-4 hover:underline"
          >
            www.globalatd.com
          </a>
          <br />
          Email: <Mail address="info@globalatd.com" />
        </Address>
        <p>
          GATD provides executive education, leadership development, professional development, strategic advisory, consulting, customised corporate programmes, executive retreats, conferences, events and related services.
        </p>
      </>
    ),
  },
  {
    id: "personal-data-we-may-collect",
    title: "3. Personal Data We May Collect",
    body: (
      <>
        <p>Depending on your interaction with GATD, we may collect personal data including:</p>
        <Bullets
          items={[
            "Full name",
            "Email address",
            "Telephone or mobile number",
            "Job title and professional designation",
            "Organisation/company name",
            "Country and business location",
            "Professional biography and areas of expertise",
            "Programme or event registration information",
            "Information submitted through enquiry, contact or application forms",
            "Payment and billing information where applicable",
            "Dietary, accessibility or logistical information voluntarily provided for an event or programme",
            "Feedback, evaluations and testimonials",
            "Information contained in correspondence with GATD",
            "Photographs, video recordings or event-related media where applicable",
            "Information relating to your participation in GATD programmes or events",
            "Website usage information",
            "IP address, browser type, device information and similar technical information",
            "Information collected through cookies and similar technologies",
          ]}
        />
        <p>We seek to collect only information that is reasonably appropriate for the relevant purpose.</p>
      </>
    ),
  },
  {
    id: "how-we-collect-personal-data",
    title: "4. How We Collect Personal Data",
    body: (
      <>
        <p>We may collect personal data when you:</p>
        <Bullets
          items={[
            "Visit or use our website",
            "Submit a contact or enquiry form",
            "Register for a programme, event or conference",
            "Apply for or participate in an executive education programme",
            "Request information about our services",
            "Subscribe to newsletters or other communications",
            "Communicate with our team by email, telephone or other channels",
            "Participate in surveys or provide programme feedback",
            "Attend a GATD event or programme",
            "Engage with our social media or digital communications",
            "Enter into a business or partnership relationship with GATD",
            "Provide information through a third-party platform or service used by GATD",
          ]}
        />
      </>
    ),
  },
  {
    id: "purposes",
    title: "5. Purposes for Collection, Use and Disclosure",
    body: (
      <>
        <p>GATD may collect, use and disclose personal data for purposes including:</p>
        <Bullets
          items={[
            "Responding to enquiries and requests",
            "Providing information about our programmes and services",
            "Processing registrations and applications",
            "Managing programme and event participation",
            "Delivering executive education and professional development programmes",
            "Managing payments, invoices and administrative matters",
            "Communicating programme schedules, changes and logistics",
            "Providing certificates or other programme documentation",
            "Conducting programme evaluations and quality improvement",
            "Managing customer and participant relationships",
            "Developing and improving our services",
            "Conducting research, analysis and business planning",
            "Managing partnerships and institutional collaborations",
            "Sending newsletters, announcements and relevant business communications",
            "Sending marketing communications where permitted and appropriate",
            "Managing website functionality and security",
            "Preventing fraud, misuse or security incidents",
            "Complying with applicable laws, regulations and legal obligations",
            "Establishing, exercising or defending legal rights",
            "Any other purpose that is reasonably necessary and permitted under applicable law",
          ]}
        />
        <p>
          Where required, GATD will obtain appropriate consent or rely on another lawful basis permitted under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "marketing-communications",
    title: "6. Marketing Communications",
    body: (
      <>
        <p>
          Where appropriate, GATD may send information about programmes, conferences, executive education opportunities, publications, events, partnerships and other services that may be relevant to you.
        </p>
        <p>
          You may unsubscribe from marketing communications at any time by using the unsubscribe mechanism provided in the communication or by contacting us at:
        </p>
        <p>
          <Mail address="info@globalatd.com" />
        </p>
        <p>Withdrawal of consent will not affect the lawfulness of processing carried out before withdrawal.</p>
      </>
    ),
  },
  {
    id: "disclosure-to-third-parties",
    title: "7. Disclosure to Third Parties",
    body: (
      <>
        <p>
          GATD may disclose personal data to third parties where reasonably necessary for the purposes described in this Policy or where permitted or required by law.
        </p>
        <p>These parties may include:</p>
        <Bullets
          items={[
            "Programme faculty and trainers",
            "Academic and institutional partners",
            "Universities, business schools and professional organisations",
            "Programme delivery partners",
            "Event venues and event-management providers",
            "Technology and website service providers",
            "IT and cloud-service providers",
            "Payment and financial service providers",
            "Marketing and communication service providers",
            "Professional advisers, including legal, accounting and consulting advisers",
            "Government authorities, regulators or law-enforcement agencies where required",
            "Other service providers acting on behalf of GATD",
          ]}
        />
        <p>
          Where appropriate, GATD will take reasonable steps to ensure that third parties handling personal data on our behalf provide an appropriate level of protection.
        </p>
      </>
    ),
  },
  {
    id: "international-data-transfers",
    title: "8. International Data Transfers",
    body: (
      <>
        <p>
          GATD operates internationally and may work with participants, partners, faculty, service providers and organisations located in different countries.
        </p>
        <p>As a result, personal data may be transferred to or accessed from jurisdictions outside Singapore.</p>
        <p>
          Where personal data is transferred outside Singapore, GATD will take reasonable steps to ensure that the transferred personal data receives a standard of protection comparable to that required under applicable Singapore data-protection requirements.
        </p>
      </>
    ),
  },
  {
    id: "data-protection-and-security",
    title: "9. Data Protection and Security",
    body: (
      <>
        <p>
          GATD takes reasonable measures to protect personal data against unauthorised access, collection, use, disclosure, copying, modification, disposal or similar risks.
        </p>
        <p>
          Security measures may include access controls, secure systems, password protection, technical safeguards, confidentiality obligations and appropriate administrative procedures.
        </p>
        <p>However, no method of transmission or electronic storage can be guaranteed to be completely secure.</p>
      </>
    ),
  },
  {
    id: "retention-of-personal-data",
    title: "10. Retention of Personal Data",
    body: (
      <>
        <p>
          GATD will retain personal data only for as long as reasonably necessary to fulfil the purposes for which it was collected or where retention is required for legal, regulatory, accounting, contractual or legitimate business purposes.
        </p>
        <p>
          When personal data is no longer required, GATD will take reasonable steps to dispose of, delete or anonymise it securely.
        </p>
      </>
    ),
  },
  {
    id: "access-and-correction-requests",
    title: "11. Access and Correction Requests",
    body: (
      <>
        <p>
          Subject to applicable law, you may request access to personal data held by GATD and information about how that personal data has been used or disclosed, where applicable.
        </p>
        <p>You may also request correction of inaccurate or incomplete personal data.</p>
        <p>Requests should be sent to:</p>
        <Address>
          <span className="font-semibold">Data Protection Officer</span>
          <br />
          GATD Pte. Ltd.
          <br />
          100 Jalan Sultan, #09-06
          <br />
          Sultan Plaza
          <br />
          Singapore 199001
          <br />
          Email: <Mail address="ceo@globalatd.com" />
        </Address>
        <p>GATD may need to verify your identity before processing a request.</p>
      </>
    ),
  },
  {
    id: "withdrawal-of-consent",
    title: "12. Withdrawal of Consent",
    body: (
      <>
        <p>
          Where GATD relies on your consent to collect, use or disclose personal data, you may withdraw your consent by contacting us.
        </p>
        <p>
          Withdrawal of consent may affect our ability to provide certain services, programmes or communications. We will explain the likely consequences where appropriate.
        </p>
      </>
    ),
  },
  {
    id: "accuracy-of-personal-data",
    title: "13. Accuracy of Personal Data",
    body: (
      <>
        <p>
          GATD seeks to maintain accurate and complete personal data where such information is likely to affect decisions concerning an individual or where it is disclosed to another organisation.
        </p>
        <p>You are encouraged to inform us if your personal information changes.</p>
      </>
    ),
  },
  {
    id: "cookies-and-similar-technologies",
    title: "14. Cookies and Similar Technologies",
    body: (
      <>
        <p>GATD may use cookies and similar technologies to operate, secure, analyse and improve our website.</p>
        <p>
          Further information is provided in our separate{" "}
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
    id: "third-party-websites",
    title: "15. Third-Party Websites",
    body: (
      <>
        <p>
          Our website may contain links to websites operated by third parties, including partner institutions, universities, event platforms and other organisations.
        </p>
        <p>GATD is not responsible for the privacy practices or content of third-party websites.</p>
        <p>We encourage you to review the privacy policies of any third-party website you visit.</p>
      </>
    ),
  },
  {
    id: "photographs-videos-and-events",
    title: "16. Photographs, Videos and Events",
    body: (
      <>
        <p>
          GATD may photograph or record events, conferences, workshops or programmes for documentation, educational, promotional, marketing or communication purposes.
        </p>
        <p>Where appropriate, GATD will provide notices or seek consent in accordance with applicable requirements.</p>
        <p>If you have concerns about the use of an identifiable photograph or recording of you, please contact us.</p>
      </>
    ),
  },
  {
    id: "childrens-personal-data",
    title: "17. Children’s Personal Data",
    body: (
      <>
        <p>
          GATD’s services are primarily intended for professionals, executives, organisations and adult learners.
        </p>
        <p>
          We do not knowingly seek to collect personal data from children except where such collection is necessary for a legitimate and appropriately managed programme or activity.
        </p>
        <p>
          If you believe that a child has provided personal data to us without appropriate authorisation, please contact us.
        </p>
      </>
    ),
  },
  {
    id: "complaints",
    title: "18. Complaints",
    body: (
      <>
        <p>If you have a concern or complaint about how GATD handles your personal data, please contact us at:</p>
        <p>
          <Mail address="info@globalatd.com" />
        </p>
        <p>
          GATD will review and respond to complaints in accordance with its internal procedures and applicable requirements.
        </p>
      </>
    ),
  },
  {
    id: "changes-to-this-privacy-policy",
    title: "19. Changes to this Privacy Policy",
    body: (
      <>
        <p>
          GATD may update this Privacy Policy from time to time to reflect changes in our practices, services, technology or applicable requirements.
        </p>
        <p>The updated version will be published on this page with the revised “Last Updated” date.</p>
      </>
    ),
  },
  {
    id: "contact-us",
    title: "20. Contact Us",
    body: (
      <>
        <p>For privacy or data-protection matters, please contact:</p>
        <Address>
          <span className="font-semibold">Data Protection Officer:</span>
          <br />
          Khazi Mohammed Zafar
          <br />
          Managing Director,
          <br />
          GATD Pte. Ltd.
          <br />
          100 Jalan Sultan, #09-06
          <br />
          Sultan Plaza
          <br />
          Singapore 199001
          <br />
          Email: <Mail address="ceo@globalatd.com" />
          <br />
          General inquiries : <Mail address="info@globalatd.com" />
        </Address>
      </>
    ),
  },
];

export default function PrivacyPolicyContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="PRIVACY POLICY"
      company="GATD Pte. Ltd."
      meta={["Singapore"]}
      dates={["Effective Date: 05.10.2026", "Last Updated: 05.10.2026"]}
      banner="/images/legal/privacy-policy-banner.jpg"
      tocLabel="Privacy Policy"
      contact={{ label: "Data Protection Officer", email: "ceo@globalatd.com" }}
      sections={sections}
    />
  );
}
