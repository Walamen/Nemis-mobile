import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { Button } from '@/components/buttons/button';
import {
  ASSIGNMENT_STATUS_LABEL,
  ASSIGNMENT_STATUS_TONE,
} from '@/components/cards/assignment-card';
import { Badge } from '@/components/common/badge';
import type { IconProps } from '@/components/common/icon';
import { TextField } from '@/components/forms/text-field';
import { ThemedText } from '@/components/typography/themed-text';
import { useSubmitAssignmentForm } from '@/features/tasks/use-submit-assignment-form';
import { useTheme } from '@/hooks/use-theme';
import { openExternalUrl } from '@/services/external-link';
import type { Assignment } from '@/types/tasks';
import { Text, View } from '@/tw';
import { getSubmissionAvailability, getSubmissionStatus, isTurnedIn } from '@/utils/assignments';
import { formatDueLabel } from '@/utils/date';
import { formatFileSize, SUBMISSION_ACCEPTED_LABEL } from '@/utils/submission';

const ATTACHMENT_ICON: IconProps['name'] = {
  ios: 'paperclip',
  android: 'attach_file',
  web: 'attach_file',
};
const UPLOAD_ICON: IconProps['name'] = {
  ios: 'doc.badge.plus',
  android: 'upload_file',
  web: 'upload_file',
};

/** Opens a file URL (teacher attachment or the student's own upload). */
function FileLink({ url, label }: { url: string; label: string }) {
  const [openError, setOpenError] = useState<string | null>(null);

  async function handleOpen() {
    setOpenError(null);
    const opened = await openExternalUrl(url);
    if (!opened) setOpenError("Couldn't open the file. Please try again.");
  }

  return (
    <View className="gap-1">
      <Button variant="secondary" icon={ATTACHMENT_ICON} label={label} onPress={handleOpen} />
      {openError && <Text className="text-sm text-error">{openError}</Text>}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" className="mt-1 tracking-wide">
      {children}
    </ThemedText>
  );
}

function SubmissionForm({
  assignment,
  onSubmitted,
}: {
  assignment: Assignment;
  onSubmitted: () => void;
}) {
  const theme = useTheme();
  const {
    control,
    watch,
    stage,
    isSubmitting,
    fileError,
    pickFile,
    removeFile,
    review,
    editAgain,
    confirmSubmit,
    formState: { errors },
  } = useSubmitAssignmentForm(assignment, onSubmitted);
  const file = watch('file');
  const response = watch('response');
  const isResubmission = isTurnedIn(assignment);

  if (stage === 'reviewing') {
    return (
      <View className="gap-3">
        <SectionTitle>REVIEW BEFORE SUBMITTING</SectionTitle>
        <View className="gap-2 rounded-card p-3" style={{ backgroundColor: theme.card }}>
          <ThemedText type="smallBold">Your answer</ThemedText>
          <ThemedText
            type="small"
            themeColor={response.trim() ? 'text' : 'textSecondary'}
            selectable
          >
            {response.trim() || 'No written answer'}
          </ThemedText>
          <ThemedText type="smallBold" className="mt-1">
            Attached file
          </ThemedText>
          <ThemedText type="small" themeColor={file ? 'text' : 'textSecondary'}>
            {file
              ? `${file.name}${file.size != null ? ` · ${formatFileSize(file.size)}` : ''}`
              : 'No file'}
          </ThemedText>
        </View>
        <View className="flex-row gap-2">
          <Button
            variant="secondary"
            label="Edit"
            onPress={editAgain}
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button
            label={isResubmission ? 'Confirm update' : 'Confirm & submit'}
            onPress={() => void confirmSubmit()}
            isLoading={isSubmitting}
            className="flex-1"
          />
        </View>
        {isSubmitting && file && (
          <ThemedText type="small" themeColor="textSecondary" className="text-center">
            Uploading your file — this can take a minute on a slow connection.
          </ThemedText>
        )}
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Controller
        control={control}
        name="response"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Your answer"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Type or paste your answer…"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            error={errors.response?.message}
          />
        )}
      />

      <View className="gap-1">
        {file ? (
          <View
            className="flex-row items-center gap-3 rounded-card p-3"
            style={{ backgroundColor: theme.card }}
          >
            <View className="flex-1">
              <ThemedText type="smallBold" numberOfLines={1}>
                {file.name}
              </ThemedText>
              {file.size != null && (
                <ThemedText type="small" themeColor="textSecondary">
                  {formatFileSize(file.size)}
                </ThemedText>
              )}
            </View>
            <Button variant="text" label="Remove" onPress={removeFile} />
          </View>
        ) : (
          <Button
            variant="secondary"
            icon={UPLOAD_ICON}
            label="Attach a file"
            onPress={() => void pickFile()}
          />
        )}
        <ThemedText type="small" themeColor="textSecondary">
          One file, up to 20 MB: {SUBMISSION_ACCEPTED_LABEL}.
        </ThemedText>
        {fileError && <Text className="text-sm text-error">{fileError}</Text>}
      </View>

      {errors.root?.message && (
        <Text className="text-sm text-error" accessibilityLiveRegion="polite">
          {errors.root.message}
        </Text>
      )}
      <Button label="Review submission" onPress={review} />
    </View>
  );
}

const AVAILABILITY_NOTE = {
  closed: 'This assignment is closed. Submissions are no longer accepted.',
  locked:
    "The due date has passed or the assignment was closed, so your submission can't be changed.",
} as const;

/**
 * Assignment detail body for the Assignments screen's bottom sheet: the
 * teacher's instructions and attachment, the student's own submission, and
 * — when allowed (`getSubmissionAvailability`) — the submit/update form.
 */
export function AssignmentDetails({ assignment, now }: { assignment: Assignment; now: number }) {
  const theme = useTheme();
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const status = getSubmissionStatus(assignment);
  const availability = getSubmissionAvailability(assignment, now);
  const submission = assignment.mySubmission;

  function handleSubmitted() {
    setJustSubmitted(true);
    setIsUpdating(false);
  }

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-center gap-2">
        <Badge label={ASSIGNMENT_STATUS_LABEL[status]} tone={ASSIGNMENT_STATUS_TONE[status]} />
        <ThemedText type="small" themeColor="textSecondary">
          {assignment.subjectName ?? assignment.className} · {formatDueLabel(assignment.dueDate)}
        </ThemedText>
      </View>
      {assignment.instructions && (
        <ThemedText type="small" selectable>
          {assignment.instructions}
        </ThemedText>
      )}
      {assignment.attachmentUrl && (
        <>
          <SectionTitle>FROM YOUR TEACHER</SectionTitle>
          <FileLink
            url={assignment.attachmentUrl}
            label={
              assignment.attachmentName
                ? `Open attachment: ${assignment.attachmentName}`
                : 'Open attachment'
            }
          />
        </>
      )}

      {justSubmitted && (
        <View
          className="rounded-card border-l-4 border-success p-3"
          style={{ backgroundColor: theme.card }}
          accessibilityLiveRegion="polite"
        >
          <ThemedText type="smallBold">Submitted</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Your teacher can now see your work.
          </ThemedText>
        </View>
      )}

      {submission && isTurnedIn(assignment) && (
        <>
          <SectionTitle>YOUR SUBMISSION</SectionTitle>
          <View className="gap-2 rounded-card p-3" style={{ backgroundColor: theme.card }}>
            {submission.submittedAt && (
              <ThemedText type="small" themeColor="textSecondary">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </ThemedText>
            )}
            {status === 'GRADED' && submission.grade != null && (
              <ThemedText type="smallBold">
                Grade: {submission.grade}
                {assignment.totalMarks != null ? `/${assignment.totalMarks}` : ''}
              </ThemedText>
            )}
            {submission.feedback && (
              <ThemedText type="small">Feedback: {submission.feedback}</ThemedText>
            )}
            {submission.response && (
              <ThemedText type="small" selectable>
                {submission.response}
              </ThemedText>
            )}
          </View>
          {submission.fileUrl && (
            <FileLink
              url={submission.fileUrl}
              label={submission.fileName ? `Your file: ${submission.fileName}` : 'Open your file'}
            />
          )}
        </>
      )}

      {availability === 'open' && (
        <SubmissionForm assignment={assignment} onSubmitted={handleSubmitted} />
      )}
      {availability === 'resubmittable' &&
        (isUpdating ? (
          <SubmissionForm assignment={assignment} onSubmitted={handleSubmitted} />
        ) : (
          <Button
            variant="secondary"
            label="Update submission"
            onPress={() => {
              setJustSubmitted(false);
              setIsUpdating(true);
            }}
          />
        ))}
      {(availability === 'closed' || availability === 'locked') && (
        <ThemedText type="small" themeColor="textSecondary">
          {AVAILABILITY_NOTE[availability]}
        </ThemedText>
      )}
    </View>
  );
}
