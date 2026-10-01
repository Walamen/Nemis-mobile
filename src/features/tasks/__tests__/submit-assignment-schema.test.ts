import { describe, expect, it } from '@jest/globals';

import { submitAssignmentSchema } from '@/features/tasks/submit-assignment-schema';

const file = {
  uri: 'file:///cache/slides.pptx',
  name: 'slides.pptx',
  size: 1024,
  mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

describe('submitAssignmentSchema', () => {
  it('rejects an empty submission', () => {
    const result = submitAssignmentSchema.safeParse({ response: '', file: null });
    expect(result.success).toBe(false);
  });

  it('rejects a whitespace-only answer with no file', () => {
    expect(submitAssignmentSchema.safeParse({ response: '  \n\t ', file: null }).success).toBe(
      false,
    );
  });

  it('accepts a written answer and keeps its line breaks', () => {
    const result = submitAssignmentSchema.safeParse({ response: 'Point 1\nPoint 2', file: null });
    expect(result.success && result.data.response).toBe('Point 1\nPoint 2');
  });

  it('accepts a file with no written answer', () => {
    expect(submitAssignmentSchema.safeParse({ response: '', file }).success).toBe(true);
  });

  it('accepts both', () => {
    expect(submitAssignmentSchema.safeParse({ response: 'See attached', file }).success).toBe(true);
  });
});
