import { ThemedText } from '@/components/typography/themed-text';

/** Small uppercase group label above a settings/profile card ("ACCOUNT",
 * "YOUR DETAILS", …). Pass the text already uppercased. */
export function SectionCaption({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <ThemedText
      type="small"
      themeColor="textSecondary"
      className={`mb-1 font-bold tracking-wide ${className}`}
      accessibilityRole="header"
    >
      {children}
    </ThemedText>
  );
}
