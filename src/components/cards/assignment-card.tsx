import type { BadgeTone } from '@/components/common/badge';
import { Badge } from '@/components/common/badge';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/typography/themed-text';
import { formatDueLabel } from '@/utils/date';

export type AssignmentStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING';

/** Shared across student and parent assignment screens — both `Assignment`
 * and `ChildAssignment` use this same status union (see API_MAPPING.md). */
export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  PENDING: 'Not submitted',
  SUBMITTED: 'Submitted',
  GRADED: 'Graded',
  LATE: 'Submitted late',
  MISSING: 'Missing',
};

export const ASSIGNMENT_STATUS_TONE: Record<AssignmentStatus, BadgeTone> = {
  PENDING: 'warning',
  SUBMITTED: 'success',
  GRADED: 'success',
  LATE: 'warning',
  MISSING: 'error',
};

export type AssignmentCardProps = {
  title: string;
  /** Subject or class name — whichever the caller has (`subjectName ?? className`).
   * Omit on a screen that's already scoped to one subject (e.g. a subject
   * detail page), where repeating it on every card would be redundant. */
  subjectLabel?: string;
  dueDate: string;
  status: AssignmentStatus;
  onPress?: () => void;
  className?: string;
};

export function AssignmentCard({
  title,
  subjectLabel,
  dueDate,
  status,
  onPress,
  className,
}: AssignmentCardProps) {
  return (
    <Card onPress={onPress} className={className}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {subjectLabel ? `${subjectLabel} · ` : ''}
        {formatDueLabel(dueDate)}
      </ThemedText>
      <Badge label={ASSIGNMENT_STATUS_LABEL[status]} tone={ASSIGNMENT_STATUS_TONE[status]} />
    </Card>
  );
}
