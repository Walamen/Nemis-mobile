import { describe, expect, it } from '@jest/globals';

import { getNotificationHref } from '@/utils/notification-route';

describe('getNotificationHref — student', () => {
  it('maps the student links the server sends', () => {
    expect(getNotificationHref('/student/fees')).toBe('/fees/balance');
    expect(getNotificationHref('/student/results')).toBe('/learning/grades');
    expect(getNotificationHref('/student/assignments')).toBe('/tasks/assignments');
    expect(getNotificationHref('/messages/abc123')).toEqual({
      pathname: '/communication/conversation/[id]',
      params: { id: 'abc123' },
    });
  });

  it('ignores parent links', () => {
    expect(getNotificationHref('/parent/result')).toBeNull();
  });
});

describe('getNotificationHref — parent', () => {
  it('maps the parent links the server sends', () => {
    expect(getNotificationHref('/student/fees', 'parent')).toBe('/finance');
    expect(getNotificationHref('/parent/result', 'parent')).toBe('/academics/results');
    expect(getNotificationHref('/parent/resources', 'parent')).toBe('/tasks/resources');
  });

  it('opens nothing for links with no parent screen', () => {
    // Exam timetable updates point at the notification list itself.
    expect(getNotificationHref('/parent/notification', 'parent')).toBeNull();
    // Student-only screens and message threads have no parent equivalent.
    expect(getNotificationHref('/student/assignments', 'parent')).toBeNull();
    expect(getNotificationHref('/messages/abc123', 'parent')).toBeNull();
    expect(getNotificationHref(null, 'parent')).toBeNull();
  });
});
