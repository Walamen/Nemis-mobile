import { describe, expect, it } from '@jest/globals';

import { messagingRoleLabel } from '@/utils/messaging-role';

describe('messagingRoleLabel', () => {
  it('names the staff roles students and parents message', () => {
    expect(messagingRoleLabel('TEACHER')).toBe('Teacher');
    expect(messagingRoleLabel('INSTITUTION_ADMIN')).toBe('School administrator');
  });

  it('title-cases any other role instead of showing it raw', () => {
    expect(messagingRoleLabel('COUNTY_ADMIN')).toBe('County admin');
    expect(messagingRoleLabel('DEO')).toBe('Deo');
  });
});
