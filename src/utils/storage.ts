import { SchoolProfile, ClassRoom, Subject, Student, StudentSubjectScore, StudentReportMetadata } from '../types';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_SCORES,
  INITIAL_METADATA,
  SAMPLE_SCHOOL_PROFILE,
  SAMPLE_CLASSES,
  SAMPLE_SUBJECTS,
  SAMPLE_STUDENTS,
  SAMPLE_SCORES,
  SAMPLE_METADATA,
} from './initialData';

const KEYS = {
  SCHOOL: 'exam_portal_school_profile_v2',
  CLASSES: 'exam_portal_classes_v2',
  SUBJECTS: 'exam_portal_subjects_v2',
  STUDENTS: 'exam_portal_students_v2',
  SCORES: 'exam_portal_scores_v2',
  METADATA: 'exam_portal_metadata_v2',
};

// Legacy keys cleanup if needed
const LEGACY_KEYS = [
  'exam_portal_school_profile_v1',
  'exam_portal_classes_v1',
  'exam_portal_subjects_v1',
  'exam_portal_students_v1',
  'exam_portal_scores_v1',
  'exam_portal_metadata_v1',
];

export function purgeLegacyStorage(): void {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.error('Failed to purge legacy keys', e);
  }
}

export function loadSchoolProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(KEYS.SCHOOL);
    if (raw) {
      const parsed: SchoolProfile = JSON.parse(raw);
      if (parsed.assessmentConfig && parsed.assessmentConfig.maxExam === 40) {
        parsed.assessmentConfig.maxExam = 60;
        parsed.assessmentConfig.totalMax =
          (parsed.assessmentConfig.maxCa1 || 10) +
          (parsed.assessmentConfig.maxCa2 || 10) +
          (parsed.assessmentConfig.maxMidterm || 20) +
          60;
        saveSchoolProfile(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse school profile from storage', e);
  }
  return INITIAL_SCHOOL_PROFILE;
}

export function saveSchoolProfile(data: SchoolProfile): void {
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(data));
}

export function loadClasses(): ClassRoom[] {
  try {
    const raw = localStorage.getItem(KEYS.CLASSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse classes', e);
  }
  return INITIAL_CLASSES;
}

export function saveClasses(data: ClassRoom[]): void {
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(data));
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse subjects', e);
  }
  return INITIAL_SUBJECTS;
}

export function saveSubjects(data: Subject[]): void {
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(data));
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse students', e);
  }
  return INITIAL_STUDENTS;
}

export function saveStudents(data: Student[]): void {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data));
}

export function loadScores(): StudentSubjectScore[] {
  try {
    const raw = localStorage.getItem(KEYS.SCORES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse scores', e);
  }
  return INITIAL_SCORES;
}

export function saveScores(data: StudentSubjectScore[]): void {
  localStorage.setItem(KEYS.SCORES, JSON.stringify(data));
}

export function loadMetadata(): StudentReportMetadata[] {
  try {
    const raw = localStorage.getItem(KEYS.METADATA);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse metadata', e);
  }
  return INITIAL_METADATA;
}

export function saveMetadata(data: StudentReportMetadata[]): void {
  localStorage.setItem(KEYS.METADATA, JSON.stringify(data));
}

export function clearAllData(): {
  school: SchoolProfile;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadata: StudentReportMetadata[];
} {
  purgeLegacyStorage();
  saveSchoolProfile(INITIAL_SCHOOL_PROFILE);
  saveClasses([]);
  saveSubjects([]);
  saveStudents([]);
  saveScores([]);
  saveMetadata([]);

  return {
    school: INITIAL_SCHOOL_PROFILE,
    classes: [],
    subjects: [],
    students: [],
    scores: [],
    metadata: [],
  };
}

export function resetAllToDefault(): {
  school: SchoolProfile;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadata: StudentReportMetadata[];
} {
  return clearAllData();
}

export function loadSampleDemoData(): {
  school: SchoolProfile;
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadata: StudentReportMetadata[];
} {
  saveSchoolProfile(SAMPLE_SCHOOL_PROFILE);
  saveClasses(SAMPLE_CLASSES);
  saveSubjects(SAMPLE_SUBJECTS);
  saveStudents(SAMPLE_STUDENTS);
  saveScores(SAMPLE_SCORES);
  saveMetadata(SAMPLE_METADATA);

  return {
    school: SAMPLE_SCHOOL_PROFILE,
    classes: SAMPLE_CLASSES,
    subjects: SAMPLE_SUBJECTS,
    students: SAMPLE_STUDENTS,
    scores: SAMPLE_SCORES,
    metadata: SAMPLE_METADATA,
  };
}

export function exportBackupData(): string {
  const backup = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    school: loadSchoolProfile(),
    classes: loadClasses(),
    subjects: loadSubjects(),
    students: loadStudents(),
    scores: loadScores(),
    metadata: loadMetadata(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.school) saveSchoolProfile(parsed.school);
    if (Array.isArray(parsed.classes)) saveClasses(parsed.classes);
    if (Array.isArray(parsed.subjects)) saveSubjects(parsed.subjects);
    if (Array.isArray(parsed.students)) saveStudents(parsed.students);
    if (Array.isArray(parsed.scores)) saveScores(parsed.scores);
    if (Array.isArray(parsed.metadata)) saveMetadata(parsed.metadata);
    return true;
  } catch (e) {
    console.error('Failed to import backup JSON', e);
    return false;
  }
}
