import { describe, expect, it } from '@jest/globals';

import type { StudentProfile } from '@/types/profile';
import {
  buildStudentRecord,
  formatDateOfBirth,
  getCurrentClassName,
  getGuardianContact,
  getGuardianName,
} from '@/utils/student-record';

function profile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: 'stu-1',
    nemisId: 'LR-MTS-0042917',
    firstName: 'Amara',
    lastName: 'Konneh',
    middleName: null,
    dateOfBirth: '2015-03-14T00:00:00.000Z',
    gender: 'FEMALE',
    institution: { id: 'inst-1', name: 'J.J. Roberts Elementary' },
    enrollments: [
      {
        id: 'enr-old',
        class: { id: 'c-4', name: 'Grade 4B', gradeLevel: 4 },
        academicYear: null,
        term: null,
        status: 'COMPLETED',
      },
      {
        id: 'enr-now',
        class: { id: 'c-5', name: 'Grade 5B', gradeLevel: 5 },
        academicYear: null,
        term: null,
        status: 'ACTIVE',
      },
    ],
    guardians: [
      {
        guardian: {
          id: 'g-2',
          firstName: 'Joseph',
          lastName: 'Konneh',
          relationship: 'FATHER',
          phoneNumber: null,
        },
        isPrimary: false,
      },
      {
        guardian: {
          id: 'g-1',
          firstName: 'Musu',
          lastName: 'Konneh',
          relationship: 'MOTHER',
          phoneNumber: '0770 214 885',
        },
        isPrimary: true,
      },
    ],
    ...overrides,
  };
}

describe('getCurrentClassName', () => {
  it('uses the ACTIVE enrollment, not an older one', () => {
    expect(getCurrentClassName(profile())).toBe('Grade 5B');
  });

  it('is undefined with no active enrollment', () => {
    expect(getCurrentClassName(profile({ enrollments: [] }))).toBeUndefined();
  });
});

describe('getGuardianName', () => {
  it('prefers the primary guardian', () => {
    expect(getGuardianName(profile())).toBe('Musu Konneh');
  });

  it('falls back to the first guardian, or none', () => {
    const [first] = profile().guardians;
    expect(getGuardianName(profile({ guardians: [{ ...first!, isPrimary: false }] }))).toBe(
      'Joseph Konneh',
    );
    expect(getGuardianName(profile({ guardians: [] }))).toBeUndefined();
  });
});

describe('getGuardianContact', () => {
  it('shows the primary guardian as "phone · name"', () => {
    expect(getGuardianContact(profile())).toBe('0770 214 885 · Musu Konneh');
  });

  it('shows just the name when there is no phone, and nothing with no guardian', () => {
    const [father] = profile().guardians;
    expect(getGuardianContact(profile({ guardians: [father!] }))).toBe('Joseph Konneh');
    expect(getGuardianContact(profile({ guardians: [] }))).toBeUndefined();
  });
});

describe('formatDateOfBirth', () => {
  it('formats the UTC calendar date (no off-by-one west of UTC)', () => {
    expect(formatDateOfBirth('2015-03-14T00:00:00.000Z')).toBe('14 March 2015');
  });

  it('is undefined for an invalid date', () => {
    expect(formatDateOfBirth('not-a-date')).toBeUndefined();
  });
});

describe('buildStudentRecord', () => {
  it('lists the real fields in design order', () => {
    expect(buildStudentRecord(profile(), {})).toEqual([
      { label: 'NEMIS ID', value: 'LR-MTS-0042917' },
      { label: 'Date of birth', value: '14 March 2015' },
      { label: 'Grade / class', value: 'Grade 5B' },
      { label: 'School', value: 'J.J. Roberts Elementary' },
      { label: 'Guardian', value: 'Musu Konneh' },
    ]);
  });

  it('never invents County, Enrolled since or Position rows', () => {
    const labels = buildStudentRecord(profile(), {}).map((row) => row.label);
    expect(labels).not.toContain('County');
    expect(labels).not.toContain('Enrolled since');
  });

  it('drops missing values and uses fallbacks before the profile loads', () => {
    expect(
      buildStudentRecord(undefined, { className: 'Grade 5B', schoolName: 'J.J. Roberts' }),
    ).toEqual([
      { label: 'Grade / class', value: 'Grade 5B' },
      { label: 'School', value: 'J.J. Roberts' },
    ]);
    expect(buildStudentRecord(profile({ guardians: [] }), {}).map((r) => r.label)).not.toContain(
      'Guardian',
    );
  });
});
