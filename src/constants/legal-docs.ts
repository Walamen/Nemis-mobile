/**
 * Content for the About NEMIS → legal document screens (Privacy notice,
 * Terms of use, Data protection policy, Open source licences).
 *
 * PLACEHOLDER CONTENT: this copy has not been reviewed or approved by
 * Ministry of Education counsel — it exists so the screens are fully built
 * and navigable, not as text ready to ship. Replace every field here with
 * the Ministry's actual approved copy before this reaches production.
 */

export type LegalDocId = 'privacy' | 'terms' | 'dataProtection' | 'licenses';

export type LegalDocSection = {
  heading: string;
  body: string;
};

export type LegalDoc = {
  title: string;
  version: string;
  updated: string;
  intro: string;
  sections: LegalDocSection[];
  contactTitle: string;
  contactBody: string;
};

export const LEGAL_DOC_ORDER: LegalDocId[] = ['privacy', 'terms', 'dataProtection', 'licenses'];

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: 'Privacy notice',
    version: 'Version 2.1',
    updated: 'Updated 12 June 2026',
    intro:
      'This notice explains what information NEMIS holds about you and your child, why the Ministry of Education holds it, and what you can ask us to do with it.',
    sections: [
      {
        heading: 'What we hold',
        body: 'Your name, contact details and relationship to the child. For each child: NEMIS ID, date of birth, school, class, attendance, marks, assignment records and fee payments. We do not hold biometric data or health records in this app.',
      },
      {
        heading: 'Why we hold it',
        body: "To maintain the national school register, to plan teacher deployment and school funding, and to give you a direct view of your child's education. Enrollment and attendance figures are also reported in aggregate to national education statistics.",
      },
      {
        heading: 'Who can see it',
        body: "Your child's school, your County Education Office and authorised Ministry staff. Individual records are never sold, published or shared with third parties for advertising.",
      },
      {
        heading: 'How long we keep it',
        body: 'A student record is retained for the duration of enrollment and for seven years after the student leaves school, as required by the national records schedule. Message history is kept for two school years.',
      },
      {
        heading: 'Your rights',
        body: 'You may ask to see the record we hold, ask for factual corrections, and ask why a decision was made. Requests are made through your school or the NEMIS help desk and are answered within 30 days.',
      },
    ],
    contactTitle: 'Questions about your record',
    contactBody:
      'Contact your school first for corrections, or write to privacy@nemis.gov.lr for anything this notice does not answer.',
  },
  terms: {
    title: 'Terms of use',
    version: 'Version 1.4',
    updated: 'Updated 3 March 2026',
    intro:
      'By using the NEMIS mobile app you agree to these terms. They apply to parents, guardians and students given access by a registered school.',
    sections: [
      {
        heading: 'Your account',
        body: 'Accounts are issued by your school, not created by you. Keep your password private. Tell your school immediately if you think someone else has used your account.',
      },
      {
        heading: 'Acceptable use',
        body: "Use the app only for matters concerning your own child's education. Messages to teachers must remain respectful. Do not share screenshots of another family's information.",
      },
      {
        heading: 'Accuracy of information',
        body: "Marks, attendance and fee balances are entered by schools. The Ministry publishes them in good faith but the school's own records remain the authoritative source in a dispute.",
      },
      {
        heading: 'Payments',
        body: 'Fee payments are made to your school through the payment provider shown at checkout. The Ministry does not hold your funds and does not charge a service fee for payments made in the app.',
      },
      {
        heading: 'Availability',
        body: 'The service may be unavailable during maintenance or where network coverage is limited. The Ministry is not liable for losses arising from an inability to access the app.',
      },
      {
        heading: 'Changes to these terms',
        body: 'Material changes are announced in the app at least 14 days before they take effect. Continuing to use the app after that date means you accept the revised terms.',
      },
    ],
    contactTitle: 'Suspended or restricted access',
    contactBody:
      'Schools may suspend an account that is misused. Appeals are heard by the County Education Office.',
  },
  dataProtection: {
    title: 'Data protection policy',
    version: 'Version 3.0',
    updated: 'Updated 28 January 2026',
    intro:
      'This policy sets out how the Ministry of Education protects education data across NEMIS, and the obligations it places on every school and officer who uses the system.',
    sections: [
      {
        heading: 'Lawful basis',
        body: "Education records are processed in the exercise of the Ministry's statutory functions under the Education Reform Act. Consent is not the basis for holding a school record, so records cannot be deleted on request while a student is enrolled.",
      },
      {
        heading: 'Data minimisation',
        body: 'Schools collect only what is needed to enroll, teach and report on a student. Officers see only the counties and schools within their mandate; the app shows a parent only their own linked children.',
      },
      {
        heading: 'Security measures',
        body: 'All traffic is encrypted in transit. Records are held in the national data centre with access logged against a named officer. Devices used by school staff must be passcode protected.',
      },
      {
        heading: 'Breach response',
        body: 'A suspected breach must be reported to the Ministry within 24 hours. Affected families are notified where there is a risk to them, together with what has been done in response.',
      },
      {
        heading: 'Accountability',
        body: 'Each County Education Office names a data protection focal person. The Ministry publishes an annual compliance report to the Legislature.',
      },
      {
        heading: 'Third parties',
        body: "Payment providers and messaging carriers process data strictly on the Ministry's instruction under written agreement. No third party may reuse education data for its own purposes.",
      },
    ],
    contactTitle: 'Report a data protection concern',
    contactBody: 'Write to dpo@nemis.gov.lr or call the NEMIS help desk on 0770 000 111.',
  },
  licenses: {
    title: 'Open source licences',
    version: 'Build 2026.08',
    updated: 'App version 1.4.0',
    intro:
      'The NEMIS mobile app is built with open source software. The Ministry gratefully acknowledges the following projects and their licence terms.',
    sections: [
      {
        heading: 'React and React Native',
        body: 'MIT Licence. Copyright Meta Platforms, Inc. and affiliates. The user interface framework behind every screen in this app.',
      },
      {
        heading: 'Expo',
        body: 'MIT Licence. Copyright 650 Industries, Inc. Application runtime, build tooling and over-the-air updates.',
      },
      {
        heading: 'Lucide',
        body: 'ISC Licence. Copyright Lucide Contributors. The icon set used throughout the app.',
      },
      {
        heading: 'Lato and Crete Round',
        body: 'SIL Open Font Licence 1.1. Lato by Łukasz Dziedzic; Crete Round by Type Together. The typefaces used for body text and headings.',
      },
      {
        heading: 'NestJS',
        body: 'MIT Licence. Copyright Kamil Myśliwiec. The framework behind the NEMIS server that this app connects to.',
      },
      {
        heading: 'Full licence texts',
        body: 'Complete texts for every dependency, including transitive packages, are published at nemis.gov.lr/licences and shipped with each release.',
      },
    ],
    contactTitle: 'Source code and attribution',
    contactBody: 'Corrections to this list may be sent to opensource@nemis.gov.lr.',
  },
};
