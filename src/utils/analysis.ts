import {
  Student,
  ClassRoom,
  Subject,
  StudentSubjectScore,
  AssessmentConfig,
  SchoolProfile,
  ComputedSubjectScore,
  GradeScale,
} from '../types';
import {
  computeStudentSubjectScore,
  calculateGradeAndRemark,
  DEFAULT_ASSESSMENT_CONFIG,
  DEFAULT_GRADE_SCALES,
  getOrdinalSuffix,
} from './grading';

export interface SubjectAssessmentBreakdown {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  ca1: number;
  maxCa1: number;
  ca1Percentage: number;
  ca2: number;
  maxCa2: number;
  ca2Percentage: number;
  midterm: number;
  maxMidterm: number;
  midtermPercentage: number;
  exam: number;
  maxExam: number;
  examPercentage: number;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  remark: string;
  colorClass: string;
  classAverage: number;
  highestInClass: number;
  lowestInClass: number;
  subjectRank: string;
  diffFromClassAvg: number;
  status: 'strength' | 'proficient' | 'average' | 'weakness';
  statusLabel: string;
  componentInsight: string;
}

export interface StudentPerformanceProfile {
  student: Student;
  classRoom?: ClassRoom;
  session: string;
  term: string;
  subjects: SubjectAssessmentBreakdown[];
  // Assessment averages across all subjects (percentages)
  ca1AveragePercentage: number;
  ca2AveragePercentage: number;
  midtermAveragePercentage: number;
  examAveragePercentage: number;
  continuousAssessmentAvgPercentage: number; // (CA1 + CA2 + Midterm)
  overallSubjectAveragePercentage: number;
  overallTotalObtained: number;
  overallTotalMax: number;
  overallGrade: string;
  overallRemark: string;
  classRank: string;
  totalStudentsInClass: number;
  classAveragePercentage: number;
  // Strengths & Weaknesses
  strengths: SubjectAssessmentBreakdown[];
  weaknesses: SubjectAssessmentBreakdown[];
  moderateSubjects: SubjectAssessmentBreakdown[];
  // Qualitative recommendations
  performanceSummary: string;
  keyActionItem: string;
}

export interface ClassSubjectMetric {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  enrolledStudents: number;
  classAveragePercentage: number;
  ca1Average: number;
  ca2Average: number;
  midtermAverage: number;
  examAverage: number;
  highestScore: number;
  highestStudentName: string;
  lowestScore: number;
  passRate: number; // % scoring >= 50%
  distinctionRate: number; // % scoring >= 75%
  gradeDistribution: Record<string, number>;
  difficultyLevel: 'Challenging' | 'Moderate' | 'High Performing';
}

/**
 * Calculates detailed subject-wise performance analysis for a given student
 */
export function analyzeStudentPerformance(
  student: Student,
  classRoom: ClassRoom,
  allStudentsInClass: Student[],
  allSubjects: Subject[],
  allScores: StudentSubjectScore[],
  schoolProfile: SchoolProfile
): StudentPerformanceProfile {
  const term = schoolProfile.currentTerm;
  const session = schoolProfile.currentSession;
  const config = schoolProfile.assessmentConfig || DEFAULT_ASSESSMENT_CONFIG;
  const scales = schoolProfile.gradeScales || DEFAULT_GRADE_SCALES;

  // Subjects applicable to this class
  const classSubjects = allSubjects.filter(
    (s) => s.classIds.length === 0 || s.classIds.includes(classRoom.id)
  );

  // Compute all scores for all students in class to compute benchmarks
  const classSubjStatsMap = new Map<
    string,
    { scores: { studentId: string; total: number; percentage: number }[]; avgPct: number; highest: number; lowest: number }
  >();

  classSubjects.forEach((subj) => {
    const studentScoresInSubj = allStudentsInClass.map((st) => {
      const rec = allScores.find(
        (s) =>
          s.studentId === st.id &&
          s.subjectId === subj.id &&
          s.term === term &&
          s.session === session
      );
      const computed = computeStudentSubjectScore(rec, subj.name, subj.code, config, scales);
      return {
        studentId: st.id,
        total: computed.totalScore,
        percentage: computed.percentage,
      };
    });

    studentScoresInSubj.sort((a, b) => b.total - a.total);
    const percentages = studentScoresInSubj.map((s) => s.percentage);
    const avgPct =
      percentages.length > 0
        ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10
        : 0;
    const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
    const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;

    classSubjStatsMap.set(subj.id, {
      scores: studentScoresInSubj,
      avgPct,
      highest,
      lowest,
    });
  });

  // Calculate subject breakdown for targeted student
  const subjectBreakdowns: SubjectAssessmentBreakdown[] = classSubjects.map((subj) => {
    const rawScore = allScores.find(
      (s) =>
        s.studentId === student.id &&
        s.subjectId === subj.id &&
        s.term === term &&
        s.session === session
    );

    const ca1 = Math.min(config.maxCa1, Math.max(0, Number(rawScore?.ca1 || 0)));
    const ca2 = Math.min(config.maxCa2, Math.max(0, Number(rawScore?.ca2 || 0)));
    const midterm = Math.min(config.maxMidterm, Math.max(0, Number(rawScore?.midterm || 0)));
    const exam = Math.min(config.maxExam, Math.max(0, Number(rawScore?.exam || 0)));

    const ca1Percentage = config.maxCa1 > 0 ? Math.round((ca1 / config.maxCa1) * 1000) / 10 : 0;
    const ca2Percentage = config.maxCa2 > 0 ? Math.round((ca2 / config.maxCa2) * 1000) / 10 : 0;
    const midtermPercentage = config.maxMidterm > 0 ? Math.round((midterm / config.maxMidterm) * 1000) / 10 : 0;
    const examPercentage = config.maxExam > 0 ? Math.round((exam / config.maxExam) * 1000) / 10 : 0;

    const totalScore = ca1 + ca2 + midterm + exam;
    const maxScore = config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 1000) / 10 : 0;

    const { grade, remark, colorClass } = calculateGradeAndRemark(percentage, scales);

    const stats = classSubjStatsMap.get(subj.id) || { scores: [], avgPct: 0, highest: 0, lowest: 0 };
    const rankIdx = stats.scores.findIndex((s) => s.studentId === student.id);
    const subjectRank = rankIdx !== -1 ? getOrdinalSuffix(rankIdx + 1) : '-';
    const diffFromClassAvg = Math.round((percentage - stats.avgPct) * 10) / 10;

    // Determine strength / weakness status
    let status: 'strength' | 'proficient' | 'average' | 'weakness' = 'average';
    let statusLabel = 'Satisfactory';

    if (percentage >= 75 || diffFromClassAvg >= 12) {
      status = 'strength';
      statusLabel = 'Key Strength';
    } else if (percentage >= 60 || diffFromClassAvg >= 5) {
      status = 'proficient';
      statusLabel = 'Proficient';
    } else if (percentage < 50 || diffFromClassAvg <= -10) {
      status = 'weakness';
      statusLabel = 'Area for Improvement';
    }

    // Component diagnostic note
    let componentInsight = '';
    const caAvg = (ca1Percentage + ca2Percentage + midtermPercentage) / 3;
    if (examPercentage - caAvg > 15) {
      componentInsight = 'Excels in Final Exam compared to continuous assessments.';
    } else if (caAvg - examPercentage > 15) {
      componentInsight = 'High CA scores but underperformed in Final Exam.';
    } else if (percentage >= 80) {
      componentInsight = 'Consistent excellence across all assessment components.';
    } else if (percentage < 45) {
      componentInsight = 'Requires targeted tutoring and practice across both CA and Exam.';
    } else {
      componentInsight = 'Balanced performance across continuous tests and final exam.';
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      ca1,
      maxCa1: config.maxCa1,
      ca1Percentage,
      ca2,
      maxCa2: config.maxCa2,
      ca2Percentage,
      midterm,
      maxMidterm: config.maxMidterm,
      midtermPercentage,
      exam,
      maxExam: config.maxExam,
      examPercentage,
      totalScore,
      maxScore,
      percentage,
      grade,
      remark,
      colorClass,
      classAverage: stats.avgPct,
      highestInClass: stats.highest,
      lowestInClass: stats.lowest,
      subjectRank,
      diffFromClassAvg,
      status,
      statusLabel,
      componentInsight,
    };
  });

  // Calculate assessment component averages across all subjects
  const validCount = subjectBreakdowns.length || 1;
  const ca1AvgPct = Math.round((subjectBreakdowns.reduce((a, b) => a + b.ca1Percentage, 0) / validCount) * 10) / 10;
  const ca2AvgPct = Math.round((subjectBreakdowns.reduce((a, b) => a + b.ca2Percentage, 0) / validCount) * 10) / 10;
  const midAvgPct = Math.round((subjectBreakdowns.reduce((a, b) => a + b.midtermPercentage, 0) / validCount) * 10) / 10;
  const examAvgPct = Math.round((subjectBreakdowns.reduce((a, b) => a + b.examPercentage, 0) / validCount) * 10) / 10;
  const caCombinedAvgPct = Math.round(((ca1AvgPct + ca2AvgPct + midAvgPct) / 3) * 10) / 10;

  const totalObtained = subjectBreakdowns.reduce((a, b) => a + b.totalScore, 0);
  const totalMax = subjectBreakdowns.reduce((a, b) => a + b.maxScore, 0);
  const overallAvgPct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;
  const { grade: overallGrade, remark: overallRemark } = calculateGradeAndRemark(overallAvgPct, scales);

  // Categorize subjects into strengths & weaknesses
  const sortedByPct = [...subjectBreakdowns].sort((a, b) => b.percentage - a.percentage);
  const strengths = sortedByPct.filter((s) => s.status === 'strength' || s.status === 'proficient');
  const weaknesses = sortedByPct.filter((s) => s.status === 'weakness');
  const moderateSubjects = sortedByPct.filter((s) => s.status === 'average');

  // Overall class ranking
  const allClassTotals = allStudentsInClass.map((st) => {
    const studentScores = classSubjects.map((subj) => {
      const rec = allScores.find(
        (s) =>
          s.studentId === st.id &&
          s.subjectId === subj.id &&
          s.term === term &&
          s.session === session
      );
      const c = computeStudentSubjectScore(rec, subj.name, subj.code, config, scales);
      return c.totalScore;
    });
    return {
      studentId: st.id,
      total: studentScores.reduce((a, b) => a + b, 0),
    };
  });

  allClassTotals.sort((a, b) => b.total - a.total);
  const studentRankIdx = allClassTotals.findIndex((s) => s.studentId === student.id);
  const classRank = studentRankIdx !== -1 ? getOrdinalSuffix(studentRankIdx + 1) : '-';

  const classAvgPct =
    allClassTotals.length > 0 && totalMax > 0
      ? Math.round(
          (allClassTotals.reduce((a, b) => a + b.total, 0) / (allClassTotals.length * totalMax)) * 1000
        ) / 10
      : 0;

  // Summary analysis & action recommendation
  let performanceSummary = '';
  let keyActionItem = '';

  if (overallAvgPct >= 80) {
    performanceSummary = `${student.fullName} demonstrates outstanding academic mastery across curriculum subjects, maintaining an overall average of ${overallAvgPct}%. Strongest subjects include ${strengths.slice(0, 2).map((s) => s.subjectName).join(' and ')}.`;
    keyActionItem = 'Encourage extension challenges, academic competitions, and peer tutoring opportunities to further sharpen advanced skills.';
  } else if (overallAvgPct >= 65) {
    performanceSummary = `${student.fullName} exhibits solid academic progress with a commendable average of ${overallAvgPct}%. Performance is balanced with prominent competence in ${strengths.slice(0, 2).map((s) => s.subjectName).join(', ') || 'core subjects'}.`;
    keyActionItem = weaknesses.length > 0
      ? `Focus revision and targeted homework on ${weaknesses.map((w) => w.subjectName).join(', ')} to boost exam confidence.`
      : 'Maintain consistent study habits and active classroom participation to push towards distinction level.';
  } else if (overallAvgPct >= 50) {
    performanceSummary = `${student.fullName} achieved a passing average of ${overallAvgPct}%. While showing promise in ${strengths[0]?.subjectName || 'certain subjects'}, there is notable variance across the academic spectrum.`;
    keyActionItem = `Provide guided intervention in ${weaknesses.slice(0, 2).map((w) => w.subjectName).join(' and ') || 'underperforming subjects'}, with focused attention on examination technique.`;
  } else {
    performanceSummary = `${student.fullName} is currently experiencing academic difficulty with an overall average of ${overallAvgPct}%, falling below class benchmarks in multiple subjects.`;
    keyActionItem = 'Urgent parent-teacher consultation recommended. Implement a daily supervised study timetable, remedial classes, and weekly assessment check-ins.';
  }

  return {
    student,
    classRoom,
    session,
    term,
    subjects: subjectBreakdowns,
    ca1AveragePercentage: ca1AvgPct,
    ca2AveragePercentage: ca2AvgPct,
    midtermAveragePercentage: midAvgPct,
    examAveragePercentage: examAvgPct,
    continuousAssessmentAvgPercentage: caCombinedAvgPct,
    overallSubjectAveragePercentage: overallAvgPct,
    overallTotalObtained: totalObtained,
    overallTotalMax: totalMax,
    overallGrade,
    overallRemark,
    classRank,
    totalStudentsInClass: allStudentsInClass.length,
    classAveragePercentage: classAvgPct,
    strengths,
    weaknesses,
    moderateSubjects,
    performanceSummary,
    keyActionItem,
  };
}

/**
 * Calculates class-wide subject benchmarks and difficulty metrics
 */
export function analyzeClassSubjects(
  classRoom: ClassRoom,
  studentsInClass: Student[],
  allSubjects: Subject[],
  allScores: StudentSubjectScore[],
  schoolProfile: SchoolProfile
): ClassSubjectMetric[] {
  const term = schoolProfile.currentTerm;
  const session = schoolProfile.currentSession;
  const config = schoolProfile.assessmentConfig || DEFAULT_ASSESSMENT_CONFIG;
  const scales = schoolProfile.gradeScales || DEFAULT_GRADE_SCALES;

  const classSubjects = allSubjects.filter(
    (s) => s.classIds.length === 0 || s.classIds.includes(classRoom.id)
  );

  return classSubjects.map((subj) => {
    let sumCa1Pct = 0;
    let sumCa2Pct = 0;
    let sumMidPct = 0;
    let sumExamPct = 0;
    let sumTotalPct = 0;
    let highestScore = 0;
    let highestStudentName = 'N/A';
    let lowestScore = 100;
    let passCount = 0;
    let distinctionCount = 0;
    const gradeCounts: Record<string, number> = {};

    scales.forEach((s) => {
      gradeCounts[s.grade] = 0;
    });

    studentsInClass.forEach((st) => {
      const rawScore = allScores.find(
        (s) =>
          s.studentId === st.id &&
          s.subjectId === subj.id &&
          s.term === term &&
          s.session === session
      );

      const computed = computeStudentSubjectScore(rawScore, subj.name, subj.code, config, scales);
      const ca1Pct = config.maxCa1 > 0 ? (computed.ca1 / config.maxCa1) * 100 : 0;
      const ca2Pct = config.maxCa2 > 0 ? (computed.ca2 / config.maxCa2) * 100 : 0;
      const midPct = config.maxMidterm > 0 ? (computed.midterm / config.maxMidterm) * 100 : 0;
      const examPct = config.maxExam > 0 ? (computed.exam / config.maxExam) * 100 : 0;

      sumCa1Pct += ca1Pct;
      sumCa2Pct += ca2Pct;
      sumMidPct += midPct;
      sumExamPct += examPct;
      sumTotalPct += computed.percentage;

      if (computed.percentage >= 50) passCount++;
      if (computed.percentage >= 75) distinctionCount++;

      if (gradeCounts[computed.grade] !== undefined) {
        gradeCounts[computed.grade]++;
      }

      if (computed.percentage > highestScore) {
        highestScore = computed.percentage;
        highestStudentName = st.fullName;
      }
      if (computed.percentage < lowestScore) {
        lowestScore = computed.percentage;
      }
    });

    const count = studentsInClass.length || 1;
    const avgPct = Math.round((sumTotalPct / count) * 10) / 10;
    const passRate = Math.round((passCount / count) * 1000) / 10;
    const distinctionRate = Math.round((distinctionCount / count) * 1000) / 10;

    let difficultyLevel: 'Challenging' | 'Moderate' | 'High Performing' = 'Moderate';
    if (avgPct >= 72 && passRate >= 85) {
      difficultyLevel = 'High Performing';
    } else if (avgPct < 55 || passRate < 60) {
      difficultyLevel = 'Challenging';
    }

    return {
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      enrolledStudents: studentsInClass.length,
      classAveragePercentage: avgPct,
      ca1Average: Math.round((sumCa1Pct / count) * 10) / 10,
      ca2Average: Math.round((sumCa2Pct / count) * 10) / 10,
      midtermAverage: Math.round((sumMidPct / count) * 10) / 10,
      examAverage: Math.round((sumExamPct / count) * 10) / 10,
      highestScore: Math.round(highestScore * 10) / 10,
      highestStudentName,
      lowestScore: lowestScore === 100 && count === 0 ? 0 : Math.round(lowestScore * 10) / 10,
      passRate,
      distinctionRate,
      gradeDistribution: gradeCounts,
      difficultyLevel,
    };
  });
}
