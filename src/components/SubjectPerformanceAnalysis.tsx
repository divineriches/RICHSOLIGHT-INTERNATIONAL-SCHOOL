import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  User,
  GraduationCap,
  Layers,
  Sparkles,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sliders,
  Check,
} from 'lucide-react';
import {
  ClassRoom,
  Subject,
  Student,
  StudentSubjectScore,
  SchoolProfile,
} from '../types';
import {
  analyzeStudentPerformance,
  analyzeClassSubjects,
  SubjectAssessmentBreakdown,
  StudentPerformanceProfile,
  ClassSubjectMetric,
} from '../utils/analysis';

interface SubjectPerformanceAnalysisProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  schoolProfile: SchoolProfile;
  initialStudentId?: string;
  onNavigateToScores: (studentId?: string) => void;
  onNavigateToReport: (studentId: string) => void;
}

export const SubjectPerformanceAnalysis: React.FC<SubjectPerformanceAnalysisProps> = ({
  classes,
  subjects,
  students,
  scores,
  schoolProfile,
  initialStudentId,
  onNavigateToScores,
  onNavigateToReport,
}) => {
  // Navigation & Selection States
  const [selectedClassId, setSelectedClassId] = useState<string>(
    () => {
      if (initialStudentId) {
        const found = students.find((s) => s.id === initialStudentId);
        if (found) return found.classId;
      }
      return classes[0]?.id || '';
    }
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || ''
  );

  const [viewMode, setViewMode] = useState<'student' | 'classMatrix'>('student');
  const [filterType, setFilterType] = useState<'all' | 'strengths' | 'weaknesses'>('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'percentage' | 'name' | 'rank' | 'diff'>('percentage');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter students by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Current selected class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Ensure an active student is selected
  const activeStudent = useMemo(() => {
    if (selectedStudentId) {
      const found = classStudents.find((s) => s.id === selectedStudentId);
      if (found) return found;
    }
    return classStudents[0] || null;
  }, [classStudents, selectedStudentId]);

  // Auto-sync selected student when class changes
  React.useEffect(() => {
    if (classStudents.length > 0) {
      if (!activeStudent || activeStudent.classId !== selectedClassId) {
        setSelectedStudentId(classStudents[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [selectedClassId, classStudents, activeStudent]);

  // Compute Student Performance Profile
  const studentAnalysis = useMemo<StudentPerformanceProfile | null>(() => {
    if (!activeStudent || !currentClass) return null;
    return analyzeStudentPerformance(
      activeStudent,
      currentClass,
      classStudents,
      subjects,
      scores,
      schoolProfile
    );
  }, [activeStudent, currentClass, classStudents, subjects, scores, schoolProfile]);

  // Compute Class-wide Subject Metrics
  const classSubjectMetrics = useMemo<ClassSubjectMetric[]>(() => {
    if (!currentClass) return [];
    return analyzeClassSubjects(
      currentClass,
      classStudents,
      subjects,
      scores,
      schoolProfile
    );
  }, [currentClass, classStudents, subjects, scores, schoolProfile]);

  // Filtered and Sorted Subjects for the student
  const displayedSubjects = useMemo(() => {
    if (!studentAnalysis) return [];
    let list = [...studentAnalysis.subjects];

    if (filterType === 'strengths') {
      list = list.filter((s) => s.status === 'strength' || s.status === 'proficient');
    } else if (filterType === 'weaknesses') {
      list = list.filter((s) => s.status === 'weakness');
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'percentage') {
        comparison = b.percentage - a.percentage;
      } else if (sortBy === 'name') {
        comparison = a.subjectName.localeCompare(b.subjectName);
      } else if (sortBy === 'diff') {
        comparison = b.diffFromClassAvg - a.diffFromClassAvg;
      } else if (sortBy === 'rank') {
        const rA = parseInt(a.subjectRank) || 999;
        const rB = parseInt(b.subjectRank) || 999;
        comparison = rA - rB;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return list;
  }, [studentAnalysis, filterType, sortBy, sortOrder]);

  const handlePrint = () => {
    window.print();
  };

  const config = schoolProfile.assessmentConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Subject Performance Analysis</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {schoolProfile.currentSession} • {schoolProfile.currentTerm}
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Diagnostic Academic Analytics & Strengths / Weaknesses
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Evaluate subject averages across assessments (CA1: {config.maxCa1}mks, CA2: {config.maxCa2}mks, Midterm: {config.maxMidterm}mks, Exam: {config.maxExam}mks), benchmark against class averages, and identify areas for growth.
          </p>
        </div>

        {/* View Mode & Print */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              id="view-mode-student-btn"
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Profile</span>
            </button>
            <button
              id="view-mode-class-btn"
              onClick={() => setViewMode('classMatrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'classMatrix'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Class Benchmarks</span>
            </button>
          </div>

          <button
            id="btn-print-performance-dossier"
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* FILTER & SELECTION CONTROLS */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        {/* Class Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Select Class
          </label>
          <select
            id="analysis-class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({students.filter((s) => s.classId === cls.id).length} students)
              </option>
            ))}
          </select>
        </div>

        {/* Student Selection (visible in student mode) */}
        {viewMode === 'student' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Student
            </label>
            <select
              id="analysis-student-select"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {classStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.admissionNo})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Filter Type for Subjects */}
        {viewMode === 'student' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Subject Scope
            </label>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({studentAnalysis?.subjects.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('strengths')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  filterType === 'strengths'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Strengths ({studentAnalysis?.strengths.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('weaknesses')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                  filterType === 'weaknesses'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                Weaknesses ({studentAnalysis?.weaknesses.length || 0})
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {viewMode === 'student' && activeStudent && (
          <div className="flex items-center space-x-2 pt-4 sm:pt-0">
            <button
              onClick={() => onNavigateToReport(activeStudent.id)}
              className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report Card</span>
            </button>
            <button
              onClick={() => onNavigateToScores(activeStudent.id)}
              className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Edit Scores</span>
            </button>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: INDIVIDUAL STUDENT ANALYSIS */}
      {viewMode === 'student' && studentAnalysis && activeStudent && (
        <div className="space-y-6">
          {/* Printable Header Dossier (shows on print and screen) */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
            {/* Student Header Profile Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-inner">
                  {activeStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-slate-900">{activeStudent.fullName}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {activeStudent.admissionNo}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>Class: <strong className="text-slate-800">{currentClass?.name}</strong></span>
                    <span>•</span>
                    <span>Gender: <strong>{activeStudent.gender}</strong></span>
                    <span>•</span>
                    <span>Session: <strong>{schoolProfile.currentSession}</strong></span>
                    <span>•</span>
                    <span>Term: <strong>{schoolProfile.currentTerm}</strong></span>
                  </div>
                </div>
              </div>

              {/* Overall Summary Badges */}
              <div className="flex items-center space-x-3 self-start sm:self-center">
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-center">
                  <span className="block text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                    Overall Average
                  </span>
                  <span className="text-xl font-black text-indigo-900">
                    {studentAnalysis.overallSubjectAveragePercentage}%
                  </span>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-center">
                  <span className="block text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                    Overall Grade
                  </span>
                  <span className="text-xl font-black text-amber-900">
                    {studentAnalysis.overallGrade}
                  </span>
                </div>

                <div className="bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-center">
                  <span className="block text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                    Class Position
                  </span>
                  <span className="text-xl font-black text-slate-900">
                    {studentAnalysis.classRank}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    of {studentAnalysis.totalStudentsInClass}
                  </span>
                </div>
              </div>
            </div>

            {/* ASSESSMENT AVERAGES ACROSS ALL SUBJECTS (CA1, CA2, Midterm, Exam) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">
                    Average Score Breakdown Across Assessment Types
                  </h4>
                </div>
                <span className="text-xs text-slate-500">
                  Calculated across all {studentAnalysis.subjects.length} enrolled subjects
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* CA1 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">1st CA (CA1)</span>
                    <span className="font-mono text-[11px] text-slate-500">Max {config.maxCa1}mks</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-indigo-700">
                      {Math.round((studentAnalysis.ca1AveragePercentage * config.maxCa1) / 100 * 10) / 10}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ {config.maxCa1}</span>
                    <span className="text-xs font-bold text-indigo-600 ml-auto">
                      ({studentAnalysis.ca1AveragePercentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, studentAnalysis.ca1AveragePercentage)}%` }}
                    />
                  </div>
                </div>

                {/* CA2 */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">2nd CA (CA2)</span>
                    <span className="font-mono text-[11px] text-slate-500">Max {config.maxCa2}mks</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-indigo-700">
                      {Math.round((studentAnalysis.ca2AveragePercentage * config.maxCa2) / 100 * 10) / 10}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ {config.maxCa2}</span>
                    <span className="text-xs font-bold text-indigo-600 ml-auto">
                      ({studentAnalysis.ca2AveragePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, studentAnalysis.ca2AveragePercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Midterm */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Midterm Test</span>
                    <span className="font-mono text-[11px] text-slate-500">Max {config.maxMidterm}mks</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-amber-700">
                      {Math.round((studentAnalysis.midtermAveragePercentage * config.maxMidterm) / 100 * 10) / 10}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ {config.maxMidterm}</span>
                    <span className="text-xs font-bold text-amber-700 ml-auto">
                      ({studentAnalysis.midtermAveragePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, studentAnalysis.midtermAveragePercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Final Exam */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Final Exam</span>
                    <span className="font-mono text-[11px] text-slate-500">Max {config.maxExam}mks</span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-rose-700">
                      {Math.round((studentAnalysis.examAveragePercentage * config.maxExam) / 100 * 10) / 10}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ {config.maxExam}</span>
                    <span className="text-xs font-bold text-rose-700 ml-auto">
                      ({studentAnalysis.examAveragePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, studentAnalysis.examAveragePercentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STRENGTHS & WEAKNESSES SPOTLIGHT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths Card */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-950 text-sm">Key Academic Strengths</h4>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Subjects with distinction scores or well above class average
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-200 text-emerald-900">
                    {studentAnalysis.strengths.length} Subjects
                  </span>
                </div>

                <div className="space-y-2">
                  {studentAnalysis.strengths.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No subjects currently classified as prominent strengths (score ≥ 60%).
                    </p>
                  ) : (
                    studentAnalysis.strengths.slice(0, 4).map((subj) => (
                      <div
                        key={subj.subjectId}
                        className="bg-white rounded-lg p-2.5 border border-emerald-200/80 shadow-2xs flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-slate-900">{subj.subjectName}</span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {subj.subjectCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            Rank: <strong>{subj.subjectRank}</strong> in class • Class Avg: {subj.classAverage}%
                          </p>
                        </div>

                        <div className="text-right flex items-center space-x-2">
                          <div>
                            <span className="block font-black text-xs text-emerald-800">
                              {subj.percentage}% ({subj.grade})
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end">
                              <ArrowUpRight className="w-3 h-3 mr-0.5" />
                              +{subj.diffFromClassAvg}% vs avg
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Weaknesses / Growth Areas Card */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-950 text-sm">Areas Needing Improvement</h4>
                      <p className="text-[11px] text-rose-700 font-medium">
                        Subjects falling below 50% benchmark or lagging class average
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-200 text-rose-900">
                    {studentAnalysis.weaknesses.length} Subjects
                  </span>
                </div>

                <div className="space-y-2">
                  {studentAnalysis.weaknesses.length === 0 ? (
                    <div className="bg-white rounded-lg p-3 border border-emerald-200 text-center text-xs text-emerald-800 font-medium flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Great job! No subjects currently fall below passing benchmark.</span>
                    </div>
                  ) : (
                    studentAnalysis.weaknesses.slice(0, 4).map((subj) => (
                      <div
                        key={subj.subjectId}
                        className="bg-white rounded-lg p-2.5 border border-rose-200/80 shadow-2xs flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-slate-900">{subj.subjectName}</span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {subj.subjectCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-rose-700 font-medium">
                            {subj.componentInsight}
                          </p>
                        </div>

                        <div className="text-right flex items-center space-x-2">
                          <div>
                            <span className="block font-black text-xs text-rose-800">
                              {subj.percentage}% ({subj.grade})
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 flex items-center justify-end">
                              <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              {subj.diffFromClassAvg}% vs avg
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* QUALITATIVE RECOMMENDATIONS & ACTION ITEM */}
            <div className="bg-slate-900 text-white rounded-xl p-4.5 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Academic Diagnostic Summary & Action Plan</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {studentAnalysis.performanceSummary}
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-start space-x-2 text-xs text-indigo-300">
                <strong className="text-white whitespace-nowrap">Recommended Action:</strong>
                <span>{studentAnalysis.keyActionItem}</span>
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS: SUBJECT PERFORMANCE VS CLASS BENCHMARK */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Subject Performance vs Class Average Chart</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visual comparison showing student's percentage in each subject against class benchmark.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px] font-semibold">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded bg-indigo-600" />
                  <span className="text-slate-700">Student Score (%)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-0.5 bg-amber-500 border-t-2 border-dashed border-amber-500" />
                  <span className="text-slate-700">Class Average</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4">
              {displayedSubjects.map((subj) => {
                const isAboveClassAvg = subj.diffFromClassAvg >= 0;
                return (
                  <div key={subj.subjectId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{subj.subjectName}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">
                          ({subj.subjectCode})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                            subj.status === 'strength'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : subj.status === 'proficient'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : subj.status === 'weakness'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {subj.statusLabel}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 font-semibold">
                        <span className="text-slate-500 text-[11px]">
                          Class Avg: <strong>{subj.classAverage}%</strong>
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            isAboveClassAvg ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isAboveClassAvg ? '+' : ''}
                          {subj.diffFromClassAvg}%
                        </span>
                        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {subj.percentage}% ({subj.grade})
                        </span>
                      </div>
                    </div>

                    {/* Dual Horizontal Bar Visualization */}
                    <div className="relative w-full bg-slate-100 rounded-lg h-6 overflow-hidden flex items-center">
                      {/* Class Average Marker line */}
                      <div
                        className="absolute top-0 bottom-0 z-20 w-0.5 bg-amber-500 border-r border-amber-600 shadow-sm"
                        style={{ left: `${Math.min(100, subj.classAverage)}%` }}
                        title={`Class Average: ${subj.classAverage}%`}
                      />

                      {/* Student Score Bar */}
                      <div
                        className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-bold text-white shadow-inner ${
                          subj.percentage >= 75
                            ? 'bg-emerald-600'
                            : subj.percentage >= 60
                            ? 'bg-indigo-600'
                            : subj.percentage >= 50
                            ? 'bg-amber-600'
                            : 'bg-rose-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, subj.percentage))}%` }}
                      >
                        {subj.percentage >= 15 && `${subj.percentage}%`}
                      </div>
                    </div>

                    {/* Assessment components sub-bar */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
                      <div className="flex items-center space-x-3">
                        <span>CA1: <strong className="text-slate-700">{subj.ca1}/{config.maxCa1}</strong></span>
                        <span>CA2: <strong className="text-slate-700">{subj.ca2}/{config.maxCa2}</strong></span>
                        <span>Midterm: <strong className="text-slate-700">{subj.midterm}/{config.maxMidterm}</strong></span>
                        <span>Exam: <strong className="text-slate-700">{subj.exam}/{config.maxExam}</strong></span>
                      </div>
                      <span className="font-medium text-slate-600 italic">
                        {subj.componentInsight}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COMPREHENSIVE SUBJECT PERFORMANCE TABLE */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Subject-Wise Assessment Matrix</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Itemized assessment values, total obtainable marks, ranking, and performance classification.
                </p>
              </div>

              {/* Table Sorting */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                >
                  <option value="percentage">Percentage (Score)</option>
                  <option value="name">Subject Name</option>
                  <option value="diff">Difference vs Class</option>
                  <option value="rank">Subject Rank</option>
                </select>
                <button
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title="Toggle Ascending/Descending"
                >
                  {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-3 py-3 text-center">CA1 ({config.maxCa1})</th>
                    <th className="px-3 py-3 text-center">CA2 ({config.maxCa2})</th>
                    <th className="px-3 py-3 text-center">Midterm ({config.maxMidterm})</th>
                    <th className="px-3 py-3 text-center">Exam ({config.maxExam})</th>
                    <th className="px-3 py-3 text-center bg-indigo-50/50 text-indigo-900">Total ({config.totalMax})</th>
                    <th className="px-3 py-3 text-center bg-indigo-50/50 text-indigo-900">Score (%)</th>
                    <th className="px-3 py-3 text-center">Grade</th>
                    <th className="px-3 py-3 text-center">Class Avg</th>
                    <th className="px-3 py-3 text-center">Diff</th>
                    <th className="px-3 py-3 text-center">Rank</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {displayedSubjects.map((subj) => (
                    <tr key={subj.subjectId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div>{subj.subjectName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{subj.subjectCode}</div>
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-medium">{subj.ca1}</td>
                      <td className="px-3 py-3 text-center font-mono font-medium">{subj.ca2}</td>
                      <td className="px-3 py-3 text-center font-mono font-medium">{subj.midterm}</td>
                      <td className="px-3 py-3 text-center font-mono font-medium">{subj.exam}</td>
                      <td className="px-3 py-3 text-center font-bold font-mono text-indigo-900 bg-indigo-50/30">
                        {subj.totalScore}
                      </td>
                      <td className="px-3 py-3 text-center font-black text-indigo-700 bg-indigo-50/30">
                        {subj.percentage}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${subj.colorClass}`}>
                          {subj.grade}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-slate-600">
                        {subj.classAverage}%
                      </td>
                      <td className="px-3 py-3 text-center font-mono font-bold">
                        <span
                          className={
                            subj.diffFromClassAvg >= 0 ? 'text-emerald-700' : 'text-rose-700'
                          }
                        >
                          {subj.diffFromClassAvg >= 0 ? '+' : ''}
                          {subj.diffFromClassAvg}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-700">
                        {subj.subjectRank}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            subj.status === 'strength'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : subj.status === 'proficient'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : subj.status === 'weakness'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {subj.status === 'strength' && <Check className="w-3 h-3" />}
                          {subj.status === 'weakness' && <AlertTriangle className="w-3 h-3" />}
                          <span>{subj.statusLabel}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CLASS SUBJECT BENCHMARKS MATRIX */}
      {viewMode === 'classMatrix' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentClass?.name} Cohort Analysis
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Class-Wide Subject Performance & Difficulty Index
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregate performance metrics across all {classStudents.length} students enrolled in this class.
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-center font-bold">
                  High Performing: {classSubjectMetrics.filter((m) => m.difficultyLevel === 'High Performing').length}
                </div>
                <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg text-center font-bold">
                  Challenging: {classSubjectMetrics.filter((m) => m.difficultyLevel === 'Challenging').length}
                </div>
              </div>
            </div>

            {/* SUBJECT BENCHMARKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classSubjectMetrics.map((metric) => (
                <div
                  key={metric.subjectId}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-indigo-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{metric.subjectName}</h4>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {metric.subjectCode}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        metric.difficultyLevel === 'High Performing'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : metric.difficultyLevel === 'Challenging'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {metric.difficultyLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block">Class Average</span>
                      <span className="text-base font-black text-indigo-700">
                        {metric.classAveragePercentage}%
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block">Pass Rate (≥50%)</span>
                      <span className="text-base font-black text-emerald-700">
                        {metric.passRate}%
                      </span>
                    </div>
                  </div>

                  {/* Component Averages */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>CA1 ({config.maxCa1}mks) Avg:</span>
                      <span className="font-bold text-slate-800">{metric.ca1Average}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>CA2 ({config.maxCa2}mks) Avg:</span>
                      <span className="font-bold text-slate-800">{metric.ca2Average}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Midterm ({config.maxMidterm}mks) Avg:</span>
                      <span className="font-bold text-slate-800">{metric.midtermAverage}%</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Exam ({config.maxExam}mks) Avg:</span>
                      <span className="font-bold text-slate-800">{metric.examAverage}%</span>
                    </div>
                  </div>

                  {/* Top Performer */}
                  <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-200">
                    <span>Highest: <strong className="text-slate-800">{metric.highestScore}%</strong></span>
                    <span className="truncate max-w-[130px] font-medium text-emerald-700" title={metric.highestStudentName}>
                      🏆 {metric.highestStudentName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
