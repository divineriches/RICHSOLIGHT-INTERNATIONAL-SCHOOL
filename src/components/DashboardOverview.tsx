import React, { useMemo } from 'react';
import {
  Users,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Printer,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
  UserPlus,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import {
  ClassRoom,
  Subject,
  Student,
  StudentSubjectScore,
  StudentReportMetadata,
  SchoolProfile,
} from '../types';
import { generateClassReports } from '../utils/grading';

interface DashboardOverviewProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadataList: StudentReportMetadata[];
  schoolProfile: SchoolProfile;
  onNavigateTab: (tab: 'dashboard' | 'scores' | 'reports' | 'broadsheet' | 'analysis' | 'students' | 'classes' | 'settings') => void;
  onOpenStudentReport: (studentId: string) => void;
  onOpenStudentAnalysis?: (studentId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  classes,
  subjects,
  students,
  scores,
  metadataList,
  schoolProfile,
  onNavigateTab,
  onOpenStudentReport,
  onOpenStudentAnalysis,
}) => {
  // Aggregate stats across all classes
  const allClassReports = useMemo(() => {
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id);
      const reports = generateClassReports(
        cls,
        classStudents,
        subjects,
        scores,
        metadataList,
        schoolProfile
      );
      // sort by overall percentage
      const sorted = [...reports].sort((a, b) => b.overallPercentage - a.overallPercentage);
      const avg =
        sorted.length > 0
          ? Math.round(
              (sorted.reduce((acc, c) => acc + c.overallPercentage, 0) / sorted.length) * 10
            ) / 10
          : 0;

      return {
        classRoom: cls,
        studentCount: classStudents.length,
        reports: sorted,
        averagePercentage: avg,
        topStudent: sorted[0] || null,
      };
    });
  }, [classes, students, subjects, scores, metadataList, schoolProfile]);

  // Overall Top Students Across School
  const topStudentsSchoolWide = useMemo(() => {
    const allReports = allClassReports.flatMap((c) => c.reports);
    return allReports
      .filter((r) => r.totalScoreObtained > 0)
      .sort((a, b) => b.overallPercentage - a.overallPercentage)
      .slice(0, 5);
  }, [allClassReports]);

  // Estimated recorded assessments count
  const recordedScoresCount = scores.filter(
    (s) => s.term === schoolProfile.currentTerm && s.session === schoolProfile.currentSession
  ).length;

  const totalPossibleScores = students.length * subjects.length;
  const completionRate =
    totalPossibleScores > 0
      ? Math.min(100, Math.round((recordedScoresCount / totalPossibleScores) * 100))
      : 0;

  const config = schoolProfile.assessmentConfig;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <span>Academic Assessment Portal</span>
              <span>•</span>
              <span className="text-amber-400">{schoolProfile.currentSession}</span>
              <span>•</span>
              <span>{schoolProfile.currentTerm}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {schoolProfile.schoolName}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Record assessment scores (CA1: {config.maxCa1}mks, CA2: {config.maxCa2}mks, Midterm: {config.maxMidterm}mks, Exam: {config.maxExam}mks), analyze student performances, and print official terminal report cards.
            </p>
          </div>

          {/* Assessment Formula Badge */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 text-xs space-y-2.5 min-w-[260px]">
            <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Grading Structure
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center font-bold">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                <span className="text-indigo-400 block text-sm">{config.maxCa1}</span>
                <span className="text-[10px] text-slate-400 font-normal">CA1</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                <span className="text-indigo-400 block text-sm">{config.maxCa2}</span>
                <span className="text-[10px] text-slate-400 font-normal">CA2</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                <span className="text-amber-400 block text-sm">{config.maxMidterm}</span>
                <span className="text-[10px] text-slate-400 font-normal">Midterm</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-700">
                <span className="text-rose-400 block text-sm">{config.maxExam}</span>
                <span className="text-[10px] text-slate-400 font-normal">Exam</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px] pt-1 text-slate-300 border-t border-slate-700/60">
              <span>Max Obtainable Total:</span>
              <span className="font-bold text-amber-400">
                {config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam} Marks (100%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Students
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {students.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Across all classes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Classes / Arms
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {classes.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Active grade levels</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Subjects Offered
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {subjects.length}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Cognitive curriculum</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Assessment Progress */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Scores Recorded
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {recordedScoresCount}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Ready for reporting</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* QUICK ACTION TILES */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          <div
            id="dash-action-scores"
            onClick={() => onNavigateTab('scores')}
            className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Enter Scores</h4>
                <p className="text-[11px] text-slate-500">CA1, CA2, Mid & Exam</p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              <span>Open Score Sheet</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div
            id="dash-action-reports"
            onClick={() => onNavigateTab('reports')}
            className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Printer className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Print Reports</h4>
                <p className="text-[11px] text-slate-500">Terminal report cards</p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Generate Reports</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div
            id="dash-action-analysis"
            onClick={() => onNavigateTab('analysis')}
            className="bg-white p-4.5 rounded-xl border border-indigo-200 shadow-xs hover:shadow-md hover:border-indigo-400 bg-indigo-50/20 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center group-hover:bg-indigo-700 transition-colors shadow-2xs">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Subject Analysis</h4>
                <p className="text-[11px] text-indigo-700 font-medium">Strengths & Weaknesses</p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-semibold text-indigo-700 group-hover:translate-x-1 transition-transform">
              <span>View Analytics</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div
            id="dash-action-broadsheet"
            onClick={() => onNavigateTab('broadsheet')}
            className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Broadsheet</h4>
                <p className="text-[11px] text-slate-500">Master class matrices</p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>View Broadsheet</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div
            id="dash-action-students"
            onClick={() => onNavigateTab('students')}
            className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Students</h4>
                <p className="text-[11px] text-slate-500">Admissions & classes</p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-semibold text-cyan-600 group-hover:translate-x-1 transition-transform">
              <span>Open Student List</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* CLASS OVERVIEW CARDS & TOP PERFORMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Overview Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Class Performance Summary</h3>
            <button
              onClick={() => onNavigateTab('classes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Manage Classes →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allClassReports.length === 0 ? (
              <div className="sm:col-span-2 bg-white rounded-xl shadow-xs border border-dashed border-slate-300 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h4 className="font-bold text-slate-900 text-base">Your portal is clean and ready</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Start by setting up your academic classes and subjects, then register your students to begin inputting scores.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onNavigateTab('classes')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>1. Add Classes & Subjects</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('students')}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
                  >
                    <span>2. Register Students</span>
                  </button>
                </div>
              </div>
            ) : (
              allClassReports.map((item) => (
                <div
                  key={item.classRoom.id}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{item.classRoom.name}</h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.studentCount} Students
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Class Teacher:</span>
                      <span className="font-medium text-slate-800">{item.classRoom.classTeacher || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Class Average:</span>
                      <span className="font-bold text-indigo-700">{item.averagePercentage}%</span>
                    </div>
                    {item.topStudent && (
                      <div className="flex justify-between">
                        <span>Top Performer:</span>
                        <span className="font-bold text-emerald-700 truncate max-w-[140px]">
                          {item.topStudent.student.fullName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateTab('scores')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Enter Scores
                    </button>
                    <button
                      onClick={() => onNavigateTab('reports')}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      Print Reports →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Students Leaderboard */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Top Academic Performers</h3>
          </div>

          <div className="space-y-3">
            {topStudentsSchoolWide.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Enter scores in the Score Entry tab to view rankings.
              </p>
            ) : (
              topStudentsSchoolWide.map((rep, idx) => (
                <div
                  key={rep.student.id}
                  onClick={() => onOpenStudentReport(rep.student.id)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {rep.student.fullName}
                      </h5>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {rep.classRoom?.name} • {rep.student.admissionNo}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-black text-xs text-indigo-700">
                      {rep.overallPercentage}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{rep.overallGrade}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
