import { describe, expect, it } from '@jest/globals';

import {
  formatFileSize,
  getSubmissionFormParts,
  isResponseFieldRejected,
  resolveSubmissionMimeType,
  SUBMISSION_MAX_BYTES,
  validateSubmissionFile,
} from '@/utils/submission';

const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

describe('resolveSubmissionMimeType', () => {
  it("keeps the picker's type when the server accepts it", () => {
    expect(resolveSubmissionMimeType('slides.pptx', PPTX)).toBe(PPTX);
    expect(resolveSubmissionMimeType('notes.pdf', 'application/pdf')).toBe('application/pdf');
  });

  it('falls back to the extension when the picker reports a generic or missing type', () => {
    expect(resolveSubmissionMimeType('slides.PPTX', 'application/octet-stream')).toBe(PPTX);
    expect(resolveSubmissionMimeType('photo.jpg')).toBe('image/jpeg');
  });

  it('rejects types the server does not accept (legacy .ppt, archives, unknown)', () => {
    expect(resolveSubmissionMimeType('old.ppt', 'application/vnd.ms-powerpoint')).toBeUndefined();
    expect(resolveSubmissionMimeType('work.zip', 'application/zip')).toBeUndefined();
    expect(resolveSubmissionMimeType('README')).toBeUndefined();
  });
});

describe('validateSubmissionFile', () => {
  const asset = { uri: 'file:///cache/slides.pptx', name: 'slides.pptx', mimeType: PPTX };

  it('accepts a supported file up to exactly 20 MB', () => {
    const result = validateSubmissionFile({ ...asset, size: SUBMISSION_MAX_BYTES });
    expect(result).toEqual({
      ok: true,
      file: { uri: asset.uri, name: asset.name, size: SUBMISSION_MAX_BYTES, mimeType: PPTX },
    });
  });

  it('rejects files over 20 MB with the size in the message', () => {
    const result = validateSubmissionFile({ ...asset, size: SUBMISSION_MAX_BYTES + 1 });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/20 MB/);
  });

  it('rejects unsupported types', () => {
    const result = validateSubmissionFile({ uri: 'file:///x.ppt', name: 'x.ppt' });
    expect(result.ok).toBe(false);
  });

  it('accepts a supported file when the picker reports no size', () => {
    expect(validateSubmissionFile(asset).ok).toBe(true);
  });
});

describe('formatFileSize', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(5.5 * 1024 * 1024)).toBe('5.5 MB');
  });
});

describe('getSubmissionFormParts (multipart request)', () => {
  const file = { uri: 'file:///cache/slides.pptx', name: 'slides.pptx', type: PPTX };

  it('sends text only', () => {
    expect(getSubmissionFormParts({ response: 'Line 1\nLine 2' })).toEqual([
      ['response', 'Line 1\nLine 2'],
    ]);
  });

  it('sends a file only, under the server field name "file"', () => {
    expect(getSubmissionFormParts({ file })).toEqual([['file', file]]);
  });

  it('sends both', () => {
    expect(getSubmissionFormParts({ response: 'See slides', file })).toEqual([
      ['response', 'See slides'],
      ['file', file],
    ]);
  });

  it('omits an empty answer', () => {
    expect(getSubmissionFormParts({ response: '' })).toEqual([]);
  });
});

describe('isResponseFieldRejected', () => {
  it("recognises the server's whitelist rejection of the `response` field", () => {
    const error = {
      status: 400,
      data: { success: false, message: ['property response should not exist'] },
    };
    expect(isResponseFieldRejected(error)).toBe(true);
  });

  it('also matches a string message', () => {
    expect(
      isResponseFieldRejected({
        status: 400,
        data: { message: 'property response should not exist' },
      }),
    ).toBe(true);
  });

  it('ignores other errors', () => {
    expect(isResponseFieldRejected({ status: 400, data: { message: 'File too large' } })).toBe(
      false,
    );
    expect(
      isResponseFieldRejected({ status: 'FETCH_ERROR', error: 'Network request failed' }),
    ).toBe(false);
    expect(isResponseFieldRejected(undefined)).toBe(false);
  });
});
