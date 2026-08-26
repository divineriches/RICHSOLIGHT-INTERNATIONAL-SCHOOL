export interface ClassRoom {
  id: string;
  name: string; // e.g. "Primary 5 Alpha", "JSS 1", "Grade 4"
  section?: string; // e.g. "Primary", "Junior Secondary"
  classTeacher?: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Mathematics", "English Language", "Basic Science"
  code: string; // e.g. "MTH", "ENG", "SCI"
  classIds: string[]; // Classes where this subject is taught (empty means all classes)
}

export interface Student {
  id: string;
  admissionNo: string; // e.g. "REP/2026/012"
  fullName: string;
  gender: 'Male' | 'Female';
  classId: string;
  dateOfBirth?: string;
  parentPhone?: string;
  photoUrl?: string;
}

export interface StudentSubjectScore {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  term: string; // "1st Term", "2nd Term", "3rd Term"
  session: string; // "2025/2026"
  ca1: number; // Max 10
  ca2: number; // Max 10
  midterm: number; // Max 20
  exam: number; // Max 60
  teacherRemark?: string;
}

export interface AffectiveTraits {
  punctuality: number; // 1 to 5
  neatness: number;
  politeness: number;
  honesty: number;
  attentiveness: number;
  leadership: number;
  teamwork: number;
}

export interface PsychomotorSkills {
  handwriting: number; // 1 to 5
  sports: number;
  crafts: number;
  drawing: number;
  verbalFluency: number;
}

export interface StudentReportMetadata {
  studentId: string;
  term: string;
  session: string;
  timesSchoolOpened: number;
  timesPresent: number;
  timesAbsent: number;
  classTeacherComment?: string;
  principalComment?: string;
  affectiveTraits?: AffectiveTraits;
  psychomotorSkills?: PsychomotorSkills;
}

export interface GradeScale {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  remark: string;
  colorClass: string;
}

export interface AssessmentConfig {
  maxCa1: number; // default 10
  maxCa2: number; // default 10
  maxMidterm: number; // default 20
  maxExam: number; // default 60
  totalMax: number; // default 100
}

export interface SchoolProfile {
  schoolName: string;
  schoolMotto: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolLogoText?: string;
  currentSession: string; // e.g. "2025/2026"
  currentTerm: string; // e.g. "1st Term"
  nextTermBegins: string; // e.g. "January 12, 2026"
  principalName: string;
  assessmentConfig: AssessmentConfig;
  gradeScales: GradeScale[];
}

export interface ComputedSubjectScore {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  ca1: number;
  ca2: number;
  midterm: number;
  exam: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remark: string;
  subjectPosition?: string;
  classAverage?: number;
  highestInClass?: number;
  lowestInClass?: number;
}

export interface ComputedStudentReport {
  student: Student;
  classRoom?: ClassRoom;
  session: string;
  term: string;
  subjects: ComputedSubjectScore[];
  totalScoreObtainable: number;
  totalScoreObtained: number;
  overallPercentage: number;
  overallGrade: string;
  classPosition: string;
  totalStudentsInClass: number;
  classAveragePercentage: number;
  metadata?: StudentReportMetadata;
}
