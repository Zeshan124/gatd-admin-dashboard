"use client";

import LegalPage, { Address, Bullets, Mail } from "./LegalPage";

const sections = [
  {
    id: "purpose",
    title: "1. Purpose",
    body: (
      <>
        <p>
          This Cancellation &amp; Refund Policy applies to registrations and purchases for GATD programmes, executive education activities, events, conferences, retreats and other paid services unless separate programme-specific terms expressly apply.
        </p>
      </>
    ),
  },
  {
    id: "programme-specific-terms",
    title: "2. Programme-Specific Terms",
    body: (
      <>
        <p>Certain programmes may have their own cancellation, transfer and refund conditions.</p>
        <p>
          Where programme-specific terms are provided to a participant or organisation at the time of registration, those terms will apply to that programme.
        </p>
      </>
    ),
  },
  {
    id: "participant-cancellation",
    title: "3. Participant Cancellation",
    body: (
      <>
        <p>
          Unless otherwise stated in the applicable programme terms, cancellation requests should be submitted in writing to:
        </p>
        <p>
          <Mail address="info@globalatd.com" />
        </p>
        <p>
          The date on which GATD receives the written cancellation request will normally be used to determine the applicable cancellation conditions.
        </p>
      </>
    ),
  },
  {
    id: "suggested-standard-cancellation-schedule",
    title: "4. Suggested Standard Cancellation Schedule",
    body: (
      <>
        <p>
          Unless otherwise stated in the applicable programme-specific terms; the following cancellation and refund schedule applies:
        </p>
        <Bullets
          single
          items={[
            "15 Calendar days or more before the programme: 75% refund of the progrmme fees paid, with 25% retained as a cancellation, non-refundable administrative charges.",
            "10–14 Calendar days before the programme: 50% refund of programme fees.",
            "Less than 10 calendar days before the programme: generally non-refundable.",
          ]}
        />
        <p>
          Where applicable, GATD may allow a participant to transfer their registration to another eligible person from the same organisation, subject to programme requirements and prior written approval.
        </p>
      </>
    ),
  },
  {
    id: "non-refundable-costs",
    title: "5. Non-Refundable Costs",
    body: (
      <>
        <p>Certain costs may be non-refundable where GATD has already incurred commitments, including:</p>
        <Bullets
          items={[
            "Third-party venue charges",
            "Accommodation charges",
            "Visa-related costs",
            "Travel arrangements",
            "External platform charges",
            "Payment processing charges",
            "Faculty or trainer commitments",
            "Custom programme development costs",
            "Other non-recoverable third-party expenses",
          ]}
        />
        <p>Any such non-refundable charges should be communicated to the customer where reasonably practicable.</p>
      </>
    ),
  },
  {
    id: "corporate-and-customised-programmes",
    title: "6. Corporate and Customised Programmes",
    body: (
      <>
        <p>
          For customised corporate programmes, consulting engagements, executive retreats and other bespoke services, cancellation terms may be governed by the applicable proposal, quotation, purchase order, statement of work or service agreement.
        </p>
        <p>
          GATD may require a non-refundable deposit or advance payment before commencing programme design, faculty allocation, venue booking or other preparatory work.
        </p>
      </>
    ),
  },
  {
    id: "programme-cancellation-by-gatd",
    title: "7. Programme Cancellation by GATD",
    body: (
      <>
        <p>
          GATD reserves the right to postpone, reschedule or cancel a programme where reasonably necessary, including due to:
        </p>
        <Bullets
          items={[
            "Insufficient enrolment",
            "Faculty or speaker availability",
            "Venue issues",
            "Travel restrictions",
            "Government requirements",
            "Force majeure events",
            "Health or safety concerns",
            "Operational or logistical circumstances",
            "Other circumstances beyond GATD’s reasonable control",
          ]}
        />
        <p>Where GATD cancels a programme, GATD will communicate the available options to affected participants.</p>
        <p>Depending on the circumstances, these may include:</p>
        <Bullets
          items={[
            "Transfer to a rescheduled programme",
            "Transfer to another comparable programme",
            "Credit toward a future GATD programme",
            "Refund of eligible programme fees",
          ]}
        />
        <p>
          Third-party expenses such as flights, accommodation, visa fees or other personal expenses are generally the participant’s responsibility unless expressly agreed otherwise.
        </p>
      </>
    ),
  },
  {
    id: "programme-changes",
    title: "8. Programme Changes",
    body: (
      <>
        <p>GATD may make reasonable changes to:</p>
        <Bullets
          items={[
            "Programme dates",
            "Venue",
            "Faculty",
            "Speakers",
            "Session sequence",
            "Programme content",
            "Delivery format",
          ]}
        />
        <p>
          Such changes do not automatically create a right to a refund where the programme remains substantially consistent with its advertised purpose.
        </p>
      </>
    ),
  },
  {
    id: "no-show",
    title: "9. No-Show",
    body: (
      <>
        <p>
          Failure to attend a programme or event without prior written cancellation will generally be treated as a no-show and will not normally qualify for a refund.
        </p>
      </>
    ),
  },
  {
    id: "late-arrival-or-early-departure",
    title: "10. Late Arrival or Early Departure",
    body: (
      <>
        <p>Late arrival or early departure generally does not entitle a participant to a refund or fee reduction.</p>
      </>
    ),
  },
  {
    id: "transfers-and-substitutions",
    title: "11. Transfers and Substitutions",
    body: (
      <>
        <p>
          Where permitted, a registered participant may request to transfer their place to another person from the same organisation.
        </p>
        <p>Any substitute participant must satisfy applicable eligibility and programme requirements.</p>
        <p>GATD reserves the right to approve or decline substitution requests where reasonably necessary.</p>
      </>
    ),
  },
  {
    id: "refund-processing",
    title: "12. Refund Processing",
    body: (
      <>
        <p>Approved refunds will normally be processed using the original payment method where reasonably practicable.</p>
        <p>
          The time required for funds to appear in the customer’s account may depend on the payment provider or financial institution.
        </p>
      </>
    ),
  },
  {
    id: "taxes-and-charges",
    title: "13. Taxes and Charges",
    body: (
      <>
        <p>
          Refunds may be processed net of any applicable bank charges, taxes, payment-processing, currency-conversion charges or other non-recoverable costs where permitted.
        </p>
      </>
    ),
  },
  {
    id: "exceptional-circumstances",
    title: "14. Exceptional Circumstances",
    body: (
      <>
        <p>GATD may consider exceptional circumstances on a case-by-case basis.</p>
        <p>Supporting documentation may be requested.</p>
        <p>
          Any discretionary refund, transfer or credit does not create an obligation to provide the same treatment in another case.
        </p>
      </>
    ),
  },
  {
    id: "disputes",
    title: "15. Disputes",
    body: (
      <>
        <p>Questions concerning cancellations or refunds should first be addressed to:</p>
        <p>
          <Mail address="info@globalatd.com" />
        </p>
        <p>GATD will seek to resolve legitimate concerns fairly and reasonably.</p>
      </>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "16. Changes to this Policy",
    body: (
      <>
        <p>GATD may update this Policy from time to time.</p>
        <p>The latest version will be published on the GATD website.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "17. Contact",
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

export default function CancellationRefundContent() {
  return (
    <LegalPage
      eyebrow="Global Association for Training and Development (GATD)"
      title="CANCELLATION & REFUND POLICY"
      company="GATD Pte. Ltd."
      dates={["Effective Date: 05.10.2026", "Last Updated: 05.10.2026"]}
      banner="/images/legal/cancellation-and-refund-policy-banner.jpg"
      tocLabel="Cancellation & Refund Policy"
      contact={{ label: "Cancellations & Refunds", email: "info@globalatd.com" }}
      sections={sections}
    />
  );
}
