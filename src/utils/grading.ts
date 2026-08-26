import { AssessmentConfig, GradeScale, ComputedSubjectScore, StudentSubjectScore, Student, ComputedStudentReport, ClassRoom, StudentReportMetadata, SchoolProfile } from '../types';

export const DEFAULT_GRADE_SCALES: GradeScale[] = [
  { grade: 'A1', minPercentage: 75, maxPercentage: 100, remark: 'Excellent', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { grade: 'B2', minPercentage: 65, maxPercentage: 74.99, remark: 'Very Good', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  { grade: 'B3', minPercentage: 60, maxPercentage: 64.99, remark: 'Good', colorClass: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { grade: 'C4', minPercentage: 55, maxPercentage: 59.99, remark: 'Credit', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  { grade: 'C5', minPercentage: 50, maxPercentage: 54.99, remark: 'Pass', colorClass: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { grade: 'D7', minPercentage: 45, maxPercentage: 49.99, remark: 'Fair', colorClass: 'text-orange-700 bg-orange-50 border-orange-200' },
  { grade: 'E8', minPercentage: 40, maxPercentage: 44.99, remark: 'Weak Pass', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' },
  { grade: 'F9', minPercentage: 0, maxPercentage: 39.99, remark: 'Fail', colorClass: 'text-red-700 bg-red-50 border-red-200' },
];

export const DEFAULT_ASSESSMENT_CONFIG: AssessmentConfig = {
  maxCa1: 10,
  maxCa2: 10,
  maxMidterm: 20,
  maxExam: 60,
  totalMax: 100, // 10 + 10 + 20 + 60 = 100
};

export function getOrdinalSuffix(i: number): string {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) return `${i}st`;
  if (j === 2 && k !== 12) return `${i}nd`;
  if (j === 3 && k !== 13) return `${i}rd`;
  return `${i}th`;
}

export function calculateGradeAndRemark(
  percentage: number,
  scales: GradeScale[] = DEFAULT_GRADE_SCALES
): { grade: string; remark: string; colorClass: string } {
  const matched = scales.find(
    (s) => percentage >= s.minPercentage && percentage <= s.maxPercentage
  );
  if (matched) {
    return { grade: matched.grade, remark: matched.remark, colorClass: matched.colorClass };
  }
  if (percentage >= 75) return { grade: 'A1', remark: 'Excellent', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  return { grade: 'F9', remark: 'Fail', colorClass: 'text-red-700 bg-red-50 border-red-200' };
}

export function computeStudentSubjectScore(
  score: StudentSubjectScore | undefined,
  subjectName: string,
  subjectCode: string,
  config: AssessmentConfig = DEFAULT_ASSESSMENT_CONFIG,
  scales: GradeScale[] = DEFAULT_GRADE_SCALES
): ComputedSubjectScore {
  const ca1 = Math.min(config.maxCa1, Math.max(0, Number(score?.ca1 || 0)));
  const ca2 = Math.min(config.maxCa2, Math.max(0, Number(score?.ca2 || 0)));
  const midterm = Math.min(config.maxMidterm, Math.max(0, Number(score?.midterm || 0)));
  const exam = Math.min(config.maxExam, Math.max(0, Number(score?.exam || 0)));

  const totalScore = ca1 + ca2 + midterm + exam;
  const maxScore = config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam;
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const { grade, remark } = calculateGradeAndRemark(percentage, scales);

  return {
    subjectId: score?.subjectId || '',
    subjectName,
    subjectCode,
    ca1,
    ca2,
    midterm,
    exam,
    totalScore,
    maxScore,
    percentage: Math.round(percentage * 10) / 10,
    grade,
    remark,
  };
}

export function generateClassReports(
  classRoom: ClassRoom,
  studentsInClass: Student[],
  allSubjects: { id: string; name: string; code: string; classIds: string[] }[],
  allScores: StudentSubjectScore[],
  metadataList: StudentReportMetadata[],
  schoolProfile: SchoolProfile
): ComputedStudentReport[] {
  const term = schoolProfile.currentTerm;
  const session = schoolProfile.currentSession;
  const config = schoolProfile.assessmentConfig || DEFAULT_ASSESSMENT_CONFIG;
  const scales = schoolProfile.gradeScales || DEFAULT_GRADE_SCALES;

  // Subjects applicable to this class
  const classSubjects = allSubjects.filter(
    (s) => s.classIds.length === 0 || s.classIds.includes(classRoom.id)
  );

  // Precompute all student subject totals to rank in subject & overall
  const studentReportsPreliminary: {
    student: Student;
    computedSubjects: ComputedSubjectScore[];
    totalObtained: number;
    totalObtainable: number;
    overallPercentage: number;
  }[] = [];

  studentsInClass.forEach((student) => {
    const computedSubjects: ComputedSubjectScore[] = classSubjects.map((subj) => {
      const existingScore = allScores.find(
        (s) =>
          s.studentId === student.id &&
          s.subjectId === subj.id &&
          s.term === term &&
          s.session === session
      );
      const computed = computeStudentSubjectScore(existingScore, subj.name, subj.code, config, scales);
      computed.subjectId = subj.id;
      return computed;
    });

    const totalObtained = computedSubjects.reduce((acc, curr) => acc + curr.totalScore, 0);
    const totalObtainable = computedSubjects.reduce((acc, curr) => acc + curr.maxScore, 0);
    const overallPercentage =
      totalObtainable > 0 ? (totalObtained / totalObtainable) * 100 : 0;

    studentReportsPreliminary.push({
      student,
      computedSubjects,
      totalObtained,
      totalObtainable,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
    });
  });

  // Calculate subject-level stats (Class Average, Highest, Lowest, Subject Positions)
  classSubjects.forEach((subj) => {
    const scoresForSubj = studentReportsPreliminary.map((sr) => {
      const s = sr.computedSubjects.find((cs) => cs.subjectId === subj.id);
      return {
        studentId: sr.student.id,
        score: s ? s.totalScore : 0,
      };
    });

    // Sort descending for position ranking
    scoresForSubj.sort((a, b) => b.score - a.score);

    const nonZeroScores = scoresForSubj.map((s) => s.score);
    const highest = nonZeroScores.length > 0 ? Math.max(...nonZeroScores) : 0;
    const lowest = nonZeroScores.length > 0 ? Math.min(...nonZeroScores) : 0;
    const sum = nonZeroScores.reduce((acc, c) => acc + c, 0);
    const avg = nonZeroScores.length > 0 ? Math.round((sum / nonZeroScores.length) * 10) / 10 : 0;

    scoresForSubj.forEach((item, index) => {
      const prelim = studentReportsPreliminary.find((sr) => sr.student.id === item.studentId);
      if (prelim) {
        const sub = prelim.computedSubjects.find((cs) => cs.subjectId === subj.id);
        if (sub) {
          sub.subjectPosition = getOrdinalSuffix(index + 1);
          sub.classAverage = avg;
          sub.highestInClass = highest;
          sub.lowestInClass = lowest;
        }
      }
    });
  });

  // Calculate overall class rankings based on percentage / totalObtained
  const sortedByRank = [...studentReportsPreliminary].sort(
    (a, b) => b.totalObtained - a.totalObtained
  );

  const totalClassPercentageSum = sortedByRank.reduce((acc, curr) => acc + curr.overallPercentage, 0);
  const classAvgPercentage =
    sortedByRank.length > 0
      ? Math.round((totalClassPercentageSum / sortedByRank.length) * 10) / 10
      : 0;

  return studentReportsPreliminary.map((item) => {
    const rankIndex = sortedByRank.findIndex((r) => r.student.id === item.student.id);
    const position = rankIndex !== -1 ? getOrdinalSuffix(rankIndex + 1) : '-';
    const { grade: overallGrade } = calculateGradeAndRemark(item.overallPercentage, scales);

    const metadata = metadataList.find(
      (m) =>
        m.studentId === item.student.id &&
        m.term === term &&
        m.session === session
    );

    return {
      student: item.student,
      classRoom,
      session,
      term,
      subjects: item.computedSubjects,
      totalScoreObtainable: item.totalObtainable,
      totalScoreObtained: item.totalObtained,
      overallPercentage: item.overallPercentage,
      overallGrade,
      classPosition: position,
      totalStudentsInClass: studentsInClass.length,
      classAveragePercentage: classAvgPercentage,
      metadata,
    };
  });
}
