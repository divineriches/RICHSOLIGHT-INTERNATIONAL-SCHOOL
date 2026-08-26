import { SchoolProfile, ClassRoom, Subject, Student, StudentSubjectScore, StudentReportMetadata } from '../types';
import { DEFAULT_ASSESSMENT_CONFIG, DEFAULT_GRADE_SCALES } from './grading';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Your School Name',
  schoolMotto: '',
  schoolAddress: '',
  schoolPhone: '',
  schoolEmail: '',
  schoolLogoText: 'SCH',
  currentSession: '2025/2026',
  currentTerm: '1st Term',
  nextTermBegins: '',
  principalName: '',
  assessmentConfig: DEFAULT_ASSESSMENT_CONFIG,
  gradeScales: DEFAULT_GRADE_SCALES,
};

export const INITIAL_CLASSES: ClassRoom[] = [];

export const INITIAL_SUBJECTS: Subject[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_SCORES: StudentSubjectScore[] = [];

export const INITIAL_METADATA: StudentReportMetadata[] = [];

// Sample demo dataset for optional preview/restore
export const SAMPLE_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'ST. AUGUSTINE INTERNATIONAL COLLEGE',
  schoolMotto: 'Knowledge, Integrity & Excellence',
  schoolAddress: '15 Academic Boulevard, Victoria Island, Lagos, Nigeria',
  schoolPhone: '+234 802 345 6789 / +234 813 987 6543',
  schoolEmail: 'info@staugustinecollege.edu.ng',
  schoolLogoText: 'SAC',
  currentSession: '2025/2026',
  currentTerm: '1st Term',
  nextTermBegins: '12th January, 2026',
  principalName: 'Dr. (Mrs.) Victoria Adeleke, Ph.D',
  assessmentConfig: DEFAULT_ASSESSMENT_CONFIG,
  gradeScales: DEFAULT_GRADE_SCALES,
};

export const SAMPLE_CLASSES: ClassRoom[] = [
  { id: 'class-1', name: 'Primary 5 Emerald', section: 'Primary School', classTeacher: 'Mr. Emmanuel Okon' },
  { id: 'class-2', name: 'JSS 1 Diamond', section: 'Junior Secondary', classTeacher: 'Mrs. Folashade Adebayo' },
  { id: 'class-3', name: 'SSS 2 Sapphire', section: 'Senior Secondary', classTeacher: 'Mr. Chukwuma Obi' },
];

export const SAMPLE_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', code: 'MTH', classIds: [] },
  { id: 'sub-2', name: 'English Language', code: 'ENG', classIds: [] },
  { id: 'sub-3', name: 'Basic Science & Technology', code: 'BST', classIds: ['class-1', 'class-2'] },
  { id: 'sub-4', name: 'Social Studies', code: 'SOS', classIds: ['class-1', 'class-2'] },
  { id: 'sub-5', name: 'Civic Education', code: 'CVE', classIds: [] },
  { id: 'sub-6', name: 'Computer Studies (ICT)', code: 'ICT', classIds: [] },
  { id: 'sub-7', name: 'Agricultural Science', code: 'AGR', classIds: ['class-1', 'class-2'] },
  { id: 'sub-8', name: 'Creative & Cultural Arts', code: 'CCA', classIds: ['class-1', 'class-2'] },
  { id: 'sub-9', name: 'Physics', code: 'PHY', classIds: ['class-3'] },
  { id: 'sub-10', name: 'Chemistry', code: 'CHM', classIds: ['class-3'] },
];

export const SAMPLE_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    admissionNo: 'SAC/2025/001',
    fullName: 'Chisom David Eze',
    gender: 'Male',
    classId: 'class-1',
    parentPhone: '08031122334',
    dateOfBirth: '2014-04-15',
  },
  {
    id: 'stu-2',
    admissionNo: 'SAC/2025/002',
    fullName: 'Amina Fatima Bello',
    gender: 'Female',
    classId: 'class-1',
    parentPhone: '08029988776',
    dateOfBirth: '2014-09-22',
  },
  {
    id: 'stu-3',
    admissionNo: 'SAC/2025/003',
    fullName: 'Oluwaseun Michael Adeyemi',
    gender: 'Male',
    classId: 'class-1',
    parentPhone: '08054433221',
    dateOfBirth: '2014-02-10',
  },
  {
    id: 'stu-4',
    admissionNo: 'SAC/2025/004',
    fullName: 'Zainab Halima Mohammed',
    gender: 'Female',
    classId: 'class-1',
    parentPhone: '08167788990',
    dateOfBirth: '2014-11-05',
  },
  {
    id: 'stu-5',
    admissionNo: 'SAC/2025/005',
    fullName: 'Kenechukwu Samuel Nwosu',
    gender: 'Male',
    classId: 'class-1',
    parentPhone: '07032211445',
    dateOfBirth: '2014-07-19',
  },
  {
    id: 'stu-6',
    admissionNo: 'SAC/2025/006',
    fullName: 'Blessing Grace Danjuma',
    gender: 'Female',
    classId: 'class-2',
    parentPhone: '08091122445',
    dateOfBirth: '2013-05-14',
  },
  {
    id: 'stu-7',
    admissionNo: 'SAC/2025/007',
    fullName: 'Tunde Joseph Bakare',
    gender: 'Male',
    classId: 'class-2',
    parentPhone: '08145566778',
    dateOfBirth: '2013-08-30',
  },
  {
    id: 'stu-8',
    admissionNo: 'SAC/2025/008',
    fullName: 'Ngozi Vivian Okafor',
    gender: 'Female',
    classId: 'class-2',
    parentPhone: '07089900112',
    dateOfBirth: '2013-03-12',
  },
];

export const SAMPLE_SCORES: StudentSubjectScore[] = [
  { id: 'sc-1-1', studentId: 'stu-1', subjectId: 'sub-1', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 8, midterm: 18, exam: 55 },
  { id: 'sc-1-2', studentId: 'stu-1', subjectId: 'sub-2', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 8, ca2: 9, midterm: 17, exam: 53 },
  { id: 'sc-1-3', studentId: 'stu-1', subjectId: 'sub-3', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 9, midterm: 19, exam: 57 },
  { id: 'sc-1-4', studentId: 'stu-1', subjectId: 'sub-4', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 8, ca2: 8, midterm: 16, exam: 48 },
  { id: 'sc-1-5', studentId: 'stu-1', subjectId: 'sub-5', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 10, midterm: 18, exam: 54 },
  { id: 'sc-1-6', studentId: 'stu-1', subjectId: 'sub-6', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 10, midterm: 20, exam: 59 },
  { id: 'sc-1-7', studentId: 'stu-1', subjectId: 'sub-7', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 8, midterm: 17, exam: 51 },
  { id: 'sc-1-8', studentId: 'stu-1', subjectId: 'sub-8', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 9, midterm: 19, exam: 56 },
  { id: 'sc-2-1', studentId: 'stu-2', subjectId: 'sub-1', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 10, midterm: 19, exam: 58 },
  { id: 'sc-2-2', studentId: 'stu-2', subjectId: 'sub-2', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 10, midterm: 19, exam: 57 },
  { id: 'sc-2-3', studentId: 'stu-2', subjectId: 'sub-3', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 9, midterm: 18, exam: 56 },
  { id: 'sc-2-4', studentId: 'stu-2', subjectId: 'sub-4', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 9, midterm: 18, exam: 54 },
  { id: 'sc-2-5', studentId: 'stu-2', subjectId: 'sub-5', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 10, midterm: 20, exam: 60 },
  { id: 'sc-2-6', studentId: 'stu-2', subjectId: 'sub-6', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 9, ca2: 9, midterm: 18, exam: 55 },
  { id: 'sc-2-7', studentId: 'stu-2', subjectId: 'sub-7', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 8, ca2: 9, midterm: 17, exam: 52 },
  { id: 'sc-2-8', studentId: 'stu-2', subjectId: 'sub-8', classId: 'class-1', term: '1st Term', session: '2025/2026', ca1: 10, ca2: 10, midterm: 19, exam: 59 },
];

export const SAMPLE_METADATA: StudentReportMetadata[] = [
  {
    studentId: 'stu-1',
    term: '1st Term',
    session: '2025/2026',
    timesSchoolOpened: 110,
    timesPresent: 108,
    timesAbsent: 2,
    classTeacherComment: 'A very brilliant, calm and hardworking pupil with exceptional reasoning abilities. Keep up the high standard!',
    principalComment: 'Outstanding academic performance. Commended for exemplary conduct.',
    affectiveTraits: { punctuality: 5, neatness: 5, politeness: 5, honesty: 5, attentiveness: 4, leadership: 4, teamwork: 5 },
    psychomotorSkills: { handwriting: 4, sports: 5, crafts: 4, drawing: 4, verbalFluency: 5 },
  },
  {
    studentId: 'stu-2',
    term: '1st Term',
    session: '2025/2026',
    timesSchoolOpened: 110,
    timesPresent: 110,
    timesAbsent: 0,
    classTeacherComment: 'An exceptionally gifted and consistent learner who demonstrates immense enthusiasm across all subjects.',
    principalComment: 'A stellar result. Continue to maintain this top rank in future terms.',
    affectiveTraits: { punctuality: 5, neatness: 5, politeness: 5, honesty: 5, attentiveness: 5, leadership: 5, teamwork: 5 },
    psychomotorSkills: { handwriting: 5, sports: 4, crafts: 5, drawing: 5, verbalFluency: 5 },
  },
];
