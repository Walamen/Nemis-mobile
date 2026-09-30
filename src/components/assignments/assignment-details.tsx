import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { Button } from '@/components/buttons/button';
import type { IconProps } from '@/components/common/icon';
import { TextField } from '@/components/forms/text-field';
import { ThemedText } from '@/components/typography/themed-text';
import { useSubmitAssignmentForm } from '@/features/tasks/use-submit-assignment-form';
import { openExternalUrl } from '@/services/external-link';
import type { Assignment } from '@/types/tasks';
import { Text, View } from '@/tw';
import { canSubmit } from '@/utils/assignments';
import { formatDueLabel } from '@/utils/date';

const ATTACHMENT_ICON: IconProps['name'] = {
  ios: 'paperclip',
  android: 'attach_file',
  web: 'attach_file',
};

function AttachmentButton({ url, name }: { url: string; name?: string }) {
  const [openError, setOpenError] = useState<string | null>(null);

  async function handleOpen() {
    setOpenError(null);
    const opened = await openExternalUrl(url);
    if (!opened) setOpenError("Couldn't open the attachment. Please try again.");
  }

  return (
    <View className="gap-1">
      <Button
        variant="secondary"
        icon={ATTACHMENT_ICON}
        label={name ? `View attachment: ${name}` : 'View attachment'}
        onPress={handleOpen}
      />
      {openError && <Text className="text-sm text-error">{openError}</Text>}
    </View>
  );
}

function SubmitAssignmentForm({
  assignment,
  onSubmitted,
}: {
  assignment: Assignment;
  onSubmitted: () => void;
}) {
  const {
    control,
    onSubmit,
    isSubmitting,
    formState: { errors },
  } = useSubmitAssignmentForm(assignment, onSubmitted);
  const hasSubmitted = assignment.mySubmission != null;

  return (
    <View className="gap-3">
      <Controller
        control={control}
        name="response"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Your response"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Type your answer…"
            multiline
            numberOfLines={4}
            editable={!isSubmitting}
            error={errors.response?.message}
            helperText={
              hasSubmitted ? 'You can update your submission until it is graded.' : undefined
            }
          />
        )}
      />
      {errors.root?.message && <Text className="text-sm text-error">{errors.root.message}</Text>}
      <Button
        label={hasSubmitted ? 'Update submission' : 'Submit'}
        onPress={onSubmit}
        isLoading={isSubmitting}
      />
    </View>
  );
}

/**
 * Assignment detail body for the Assignments screen's bottom sheet —
 * instructions, the teacher's attachment (a public Cloudinary URL from the
 * API's `attachmentUrl`), and either the submission form or, once graded,
 * the read-only result.
 */
export function AssignmentDetails({
  assignment,
  onSubmitted,
}: {
  assignment: Assignment;
  onSubmitted: () => void;
}) {
  const submission = assignment.mySubmission;

  return (
    <View className="gap-3">
      <ThemedText type="small" themeColor="textSecondary">
        {assignment.subjectName ?? assignment.className} · {formatDueLabel(assignment.dueDate)}
      </ThemedText>
      {assignment.instructions && <ThemedText type="small">{assignment.instructions}</ThemedText>}
      {assignment.attachmentUrl && (
        <AttachmentButton url={assignment.attachmentUrl} name={assignment.attachmentName} />
      )}

      {canSubmit(assignment) ? (
        <SubmitAssignmentForm assignment={assignment} onSubmitted={onSubmitted} />
      ) : (
        <View className="gap-1">
          <ThemedText type="smallBold">
            Graded
            {submission?.grade != null
              ? `: ${submission.grade}${assignment.totalMarks != null ? `/${assignment.totalMarks}` : ''}`
              : ''}
          </ThemedText>
          {submission?.feedback && (
            <ThemedText type="small" themeColor="textSecondary">
              Feedback: {submission.feedback}
            </ThemedText>
          )}
          {submission?.response && (
            <ThemedText type="small" themeColor="textSecondary">
              Your response: {submission.response}
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
}
