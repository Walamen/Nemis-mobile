import { useState } from 'react';

import { Card } from '@/components/common/card';
import { Icon, type IconProps } from '@/components/common/icon';
import { ThemedText } from '@/components/typography/themed-text';
import { CardBackgroundColor, Palette } from '@/theme';
import { View } from '@/tw';

const CHEVRON_ICON: IconProps['name'] = {
  ios: 'chevron.right',
  android: 'chevron_right',
  web: 'chevron_right',
};

type ContactRow = {
  icon: IconProps['name'];
  label: string;
  value: string;
};

// PLACEHOLDER: the help desk phone number and email below are illustrative,
// not verified Ministry contact details — confirm the real ones before this
// ships. "Contact your school" is real: it's the signed-in student's own
// institution (student) or the parent's selected child's school (parent),
// passed in as `schoolName`.
const HELP_DESK_PHONE = '0770 000 111';
const HELP_DESK_EMAIL = 'support@nemis.gov.lr';

// PLACEHOLDER: illustrative FAQ copy, not reviewed Ministry content.
const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How do I add another child to my account?',
    answer:
      'Your school links children to your account using their NEMIS ID. Ask the school administrator to add the child; they will appear in your child switcher within one working day.',
  },
  {
    question: "Why is my child's mark different from the paper report?",
    answer:
      'Marks appear here as soon as a teacher enters them, so a subject may still be provisional. Once the term is closed the figures are final and match the printed report card.',
  },
  {
    question: 'How do I pay school fees with Mobile Money?',
    answer:
      'Open Fees, tap Pay with Mobile Money and confirm the prompt on your phone. Payments are credited to the school within minutes and a receipt appears under Payment history.',
  },
  {
    question: 'What do I do if a payment does not show up?',
    answer:
      'Keep the Mobile Money confirmation message and contact your school bursar with the transaction reference. If it is still missing after two working days, call the NEMIS help desk.',
  },
  {
    question: "How is my family's information protected?",
    answer:
      'Records are held by the Ministry of Education under the national data protection policy. Only your school, your County Education Office and the Ministry can see your record.',
  },
];

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Card backgroundColor={CardBackgroundColor} onPress={() => setOpen((prev) => !prev)}>
      <View className="flex-row items-start justify-between gap-3">
        <ThemedText type={open ? 'smallBold' : 'small'} className="flex-1">
          {question}
        </ThemedText>
        <Icon
          name={
            open
              ? { ios: 'chevron.up', android: 'expand_less', web: 'expand_less' }
              : { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }
          }
          size="sm"
          color={Palette.secondary}
        />
      </View>
      {open && (
        <ThemedText type="small" themeColor="textSecondary" className="pt-1">
          {answer}
        </ThemedText>
      )}
    </Card>
  );
}

/**
 * Help & Support body — shared by the student (`(student)/settings/help-support`)
 * and parent (`(parent)/profile/help-support`) screens. `schoolName` is the
 * one genuinely real piece of contact info here; see the `HELP_DESK_*`
 * comment above for what's still placeholder.
 */
export function HelpSupportContent({ schoolName }: { schoolName?: string }) {
  const contactRows: ContactRow[] = [
    {
      icon: { ios: 'phone', android: 'call', web: 'call' },
      label: 'Call the help desk',
      value: HELP_DESK_PHONE,
    },
    {
      icon: { ios: 'envelope', android: 'mail', web: 'mail' },
      label: 'Email support',
      value: HELP_DESK_EMAIL,
    },
    ...(schoolName
      ? [
          {
            icon: { ios: 'building.2', android: 'school', web: 'school' } as IconProps['name'],
            label: 'Contact your school',
            value: schoolName,
          },
        ]
      : []),
  ];

  return (
    <View className="gap-2 pb-6">
      <Card backgroundColor={Palette.primary} className="mb-4 gap-1">
        <ThemedText type="small" style={{ color: Palette.secondary100 }} className="tracking-wide">
          NEMIS HELP DESK
        </ThemedText>
        <ThemedText type="subtitle" style={{ color: '#FFFFFF' }}>
          We are here to help
        </ThemedText>
        <ThemedText type="small" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Monday to Friday, 08:00 to 17:00. Calls to the help desk are free on all networks.
        </ThemedText>
      </Card>

      <View className="gap-2 pb-2">
        {contactRows.map((row) => (
          <Card
            key={row.label}
            backgroundColor={CardBackgroundColor}
            className="flex-row items-center gap-3"
          >
            <Icon name={row.icon} color={Palette.secondary} />
            <View className="flex-1">
              <ThemedText type="smallBold">{row.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {row.value}
              </ThemedText>
            </View>
            <Icon name={CHEVRON_ICON} size="sm" color={Palette.secondary} />
          </Card>
        ))}
      </View>

      <ThemedText type="small" themeColor="textSecondary" className="mb-1 tracking-wide">
        COMMON QUESTIONS
      </ThemedText>
      <View className="gap-2 pb-2">
        {FAQS.map((faq) => (
          <FaqRow key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </View>

      <Card backgroundColor={CardBackgroundColor} className="gap-1 border-l-4 border-error">
        <ThemedText type="smallBold">Report a problem with your record</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Marks, attendance and enrollment details are entered by your school. Raise corrections
          with the school first; the help desk can escalate to the County Education Office.
        </ThemedText>
      </Card>
    </View>
  );
}
