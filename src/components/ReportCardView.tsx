import React, { useState, useMemo } from 'react';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  Award,
  Layers,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  ClassRoom,
  Subject,
  Student,
  StudentSubjectScore,
  StudentReportMetadata,
  SchoolProfile,
  ComputedStudentReport,
} from '../types';
import { generateClassReports } from '../utils/grading';

interface ReportCardViewProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadataList: StudentReportMetadata[];
  schoolProfile: SchoolProfile;
  initialStudentId?: string;
  onSaveMetadata: (updatedMetadata: StudentReportMetadata[]) => void;
  onNavigateToScores: () => void;
  onNavigateToAnalysis?: (studentId: string) => void;
}

export const ReportCardView: React.FC<ReportCardViewProps> = ({
  classes,
  subjects,
  students,
  scores,
  metadataList,
  schoolProfile,
  initialStudentId,
  onSaveMetadata,
  onNavigateToScores,
  onNavigateToAnalysis,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [isEditingComments, setIsEditingComments] = useState<boolean>(false);

  // Class selection object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Students in class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // All computed student reports in this class
  const classReports = useMemo(() => {
    if (!currentClass) return [];
    return generateClassReports(
      currentClass,
      classStudents,
      subjects,
      scores,
      metadataList,
      schoolProfile
    );
  }, [currentClass, classStudents, subjects, scores, metadataList, schoolProfile]);

  // Current single student report
  const currentReport = useMemo(() => {
    return (
      classReports.find((r) => r.student.id === selectedStudentId) ||
      classReports[0] ||
      null
    );
  }, [classReports, selectedStudentId]);

  // Handle previous / next student navigation
  const currentIndex = classReports.findIndex((r) => r.student.id === selectedStudentId);
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedStudentId(classReports[currentIndex - 1].student.id);
    }
  };
  const handleNext = () => {
    if (currentIndex < classReports.length - 1) {
      setSelectedStudentId(classReports[currentIndex + 1].student.id);
    }
  };

  // Editable comment drafts
  const [teacherComment, setTeacherComment] = useState<string>('');
  const [principalComment, setPrincipalComment] = useState<string>('');
  const [timesPresent, setTimesPresent] = useState<number>(105);
  const [timesOpened, setTimesOpened] = useState<number>(110);

  // Sync draft comment fields when current report changes
  React.useEffect(() => {
    if (currentReport?.metadata) {
      setTeacherComment(currentReport.metadata.classTeacherComment || '');
      setPrincipalComment(currentReport.metadata.principalComment || '');
      setTimesPresent(currentReport.metadata.timesPresent || 105);
      setTimesOpened(currentReport.metadata.timesSchoolOpened || 110);
    } else {
      // Default generated comments
      const pct = currentReport?.overallPercentage || 0;
      let defTeacher = 'Good effort shown this term. Keep working hard to achieve higher marks!';
      let defPrincipal = 'Satisfactory performance. Aim for higher distinctions next term.';
      if (pct >= 80) {
        defTeacher = 'Exceptional performance! A remarkably disciplined and intelligent learner.';
        defPrincipal = 'Outstanding result. Maintain this exemplary standard!';
      } else if (pct >= 65) {
        defTeacher = 'Very good work throughout the term. Active in class and shows strong potential.';
        defPrincipal = 'Commendable result. Encouraged to aim for the top positions.';
      } else if (pct < 50) {
        defTeacher = 'Needs to put in more study hours, especially in weak subjects.';
        defPrincipal = 'Fair result. More diligence and concentration required.';
      }

      setTeacherComment(defTeacher);
      setPrincipalComment(defPrincipal);
      setTimesPresent(105);
      setTimesOpened(110);
    }
  }, [currentReport]);

  const handleSaveComments = () => {
    if (!currentReport) return;

    const existingIdx = metadataList.findIndex(
      (m) =>
        m.studentId === currentReport.student.id &&
        m.term === schoolProfile.currentTerm &&
        m.session === schoolProfile.currentSession
    );

    const updatedItem: StudentReportMetadata = {
      studentId: currentReport.student.id,
      term: schoolProfile.currentTerm,
      session: schoolProfile.currentSession,
      timesSchoolOpened: timesOpened,
      timesPresent: timesPresent,
      timesAbsent: Math.max(0, timesOpened - timesPresent),
      classTeacherComment: teacherComment,
      principalComment: principalComment,
      affectiveTraits: currentReport.metadata?.affectiveTraits || {
        punctuality: 5,
        neatness: 5,
        politeness: 5,
        honesty: 5,
        attentiveness: 4,
        leadership: 4,
        teamwork: 5,
      },
      psychomotorSkills: currentReport.metadata?.psychomotorSkills || {
        handwriting: 4,
        sports: 4,
        crafts: 4,
        drawing: 4,
        verbalFluency: 5,
      },
    };

    const nextList = [...metadataList];
    if (existingIdx !== -1) {
      nextList[existingIdx] = updatedItem;
    } else {
      nextList.push(updatedItem);
    }

    onSaveMetadata(nextList);
    setIsEditingComments(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const config = schoolProfile.assessmentConfig;

  // Render individual report card printable canvas
  const renderReportCard = (report: ComputedStudentReport, isSinglePage: boolean = true) => {
    const student = report.student;
    const meta = report.metadata || {
      timesSchoolOpened: 110,
      timesPresent: 106,
      timesAbsent: 4,
      classTeacherComment:
        report.overallPercentage >= 75
          ? 'Outstanding academic performance! Chisom is an exceptional and dedicated pupil.'
          : 'Good progress. Needs to focus more on regular practice and assignments.',
      principalComment:
        report.overallPercentage >= 75
          ? 'A very impressive result. Keep up the brilliant standard!'
          : 'Fair academic standing. Encouraged to strive harder next term.',
      affectiveTraits: {
        punctuality: 5,
        neatness: 5,
        politeness: 5,
        honesty: 5,
        attentiveness: 4,
        leadership: 4,
        teamwork: 5,
      },
      psychomotorSkills: {
        handwriting: 4,
        sports: 5,
        crafts: 4,
        drawing: 4,
        verbalFluency: 5,
      },
    };

    return (
      <div
        key={student.id}
        className={`report-page-container bg-white border border-slate-300 shadow-md rounded-lg p-6 sm:p-8 max-w-4xl mx-auto text-slate-900 ${
          !isSinglePage ? 'page-break mb-10' : ''
        }`}
      >
        {/* REPORT HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
          <div className="flex items-center justify-between">
            {/* Left crest text */}
            <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center font-serif font-black text-xl text-slate-800 bg-slate-50">
              {schoolProfile.schoolLogoText || 'SCH'}
            </div>

            {/* School identity */}
            <div className="flex-1 px-4">
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase font-serif">
                {schoolProfile.schoolName}
              </h1>
              <p className="text-xs italic text-slate-600 font-medium">
                "{schoolProfile.schoolMotto}"
              </p>
              <p className="text-xs text-slate-600 mt-0.5">{schoolProfile.schoolAddress}</p>
              <p className="text-[11px] text-slate-500">
                Tel: {schoolProfile.schoolPhone} | Email: {schoolProfile.schoolEmail}
              </p>
            </div>

            {/* Right stamp badge */}
            <div className="w-16 h-16 rounded-full border-2 border-indigo-900 flex flex-col items-center justify-center text-[9px] font-bold text-indigo-900 bg-indigo-50/50 uppercase leading-tight text-center">
              <span>Official</span>
              <span>Report</span>
            </div>
          </div>

          <div className="mt-3 inline-block bg-slate-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-1 rounded">
            Student Terminal Assessment Report Card
          </div>
        </div>

        {/* STUDENT BIO PROFILE STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 border border-slate-300 rounded p-3 text-xs mb-4">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{student.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Admission Number</span>
            <span className="font-mono font-bold text-slate-800">{student.admissionNo}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Class</span>
            <span className="font-bold text-slate-800">{currentClass?.name || 'Class'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Gender</span>
            <span className="font-bold text-slate-800">{student.gender}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Academic Session</span>
            <span className="font-bold text-slate-800">{schoolProfile.currentSession}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Term</span>
            <span className="font-bold text-indigo-700">{schoolProfile.currentTerm}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Class Position</span>
            <span className="font-black text-indigo-900 text-sm">
              {report.classPosition} <span className="text-[10px] font-normal text-slate-500">out of {report.totalStudentsInClass}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Next Term Begins</span>
            <span className="font-bold text-slate-800">{schoolProfile.nextTermBegins}</span>
          </div>
        </div>

        {/* ACADEMIC PERFORMANCE TABLE */}
        <div className="mb-4 overflow-hidden border border-slate-900 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider text-center">
                <th className="py-2 px-2 text-left border-r border-slate-700 min-w-[150px]">Subject</th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">
                  CA1 <span className="block text-[9px] font-normal">({config.maxCa1})</span>
                </th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">
                  CA2 <span className="block text-[9px] font-normal">({config.maxCa2})</span>
                </th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">
                  Midterm <span className="block text-[9px] font-normal">({config.maxMidterm})</span>
                </th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">
                  Exam <span className="block text-[9px] font-normal">({config.maxExam})</span>
                </th>
                <th className="py-2 px-1 border-r border-slate-700 w-14 bg-slate-800">
                  Total <span className="block text-[9px] font-normal">({config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam})</span>
                </th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">%</th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">Grade</th>
                <th className="py-2 px-1 border-r border-slate-700 w-12">Pos.</th>
                <th className="py-2 px-1 border-r border-slate-700 w-10">High</th>
                <th className="py-2 px-1 border-r border-slate-700 w-10">Low</th>
                <th className="py-2 px-2 text-left min-w-[100px]">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {report.subjects.map((sub, idx) => (
                <tr key={sub.subjectId || idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="py-1.5 px-2 font-bold text-slate-900 border-r border-slate-300">
                    {sub.subjectName}
                  </td>
                  <td className="py-1.5 px-1 text-center font-medium border-r border-slate-300">
                    {sub.ca1}
                  </td>
                  <td className="py-1.5 px-1 text-center font-medium border-r border-slate-300">
                    {sub.ca2}
                  </td>
                  <td className="py-1.5 px-1 text-center font-medium border-r border-slate-300">
                    {sub.midterm}
                  </td>
                  <td className="py-1.5 px-1 text-center font-medium border-r border-slate-300">
                    {sub.exam}
                  </td>
                  <td className="py-1.5 px-1 text-center font-black text-slate-900 bg-indigo-50/50 border-r border-slate-300">
                    {sub.totalScore}
                  </td>
                  <td className="py-1.5 px-1 text-center font-semibold border-r border-slate-300">
                    {sub.percentage}%
                  </td>
                  <td className="py-1.5 px-1 text-center font-bold border-r border-slate-300">
                    <span className="px-1 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-900">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-1.5 px-1 text-center font-medium text-slate-600 border-r border-slate-300">
                    {sub.subjectPosition || '-'}
                  </td>
                  <td className="py-1.5 px-1 text-center text-slate-500 border-r border-slate-300">
                    {sub.highestInClass ?? '-'}
                  </td>
                  <td className="py-1.5 px-1 text-center text-slate-500 border-r border-slate-300">
                    {sub.lowestInClass ?? '-'}
                  </td>
                  <td className="py-1.5 px-2 text-slate-700 font-medium text-[11px]">
                    {sub.remark}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900 text-xs">
                <td className="py-2 px-2 border-r border-slate-300 uppercase">Grand Summary</td>
                <td colSpan={4} className="py-2 px-1 text-right pr-2 text-slate-600 border-r border-slate-300">
                  Total Score Obtained:
                </td>
                <td className="py-2 px-1 text-center font-black bg-indigo-100 text-indigo-900 border-r border-slate-300">
                  {report.totalScoreObtained} / {report.totalScoreObtainable}
                </td>
                <td className="py-2 px-1 text-center font-black text-indigo-900 border-r border-slate-300">
                  {report.overallPercentage}%
                </td>
                <td className="py-2 px-1 text-center font-black border-r border-slate-300">
                  {report.overallGrade}
                </td>
                <td colSpan={4} className="py-2 px-2 text-left text-slate-700">
                  Class Average: <strong>{report.classAveragePercentage}%</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* BEHAVIORAL, ATTENDANCE & SKILLS GRIDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
          {/* Affective Traits */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              Affective Domain (1-5)
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Punctuality</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.punctuality || 5} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Neatness & Decency</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.neatness || 5} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Politeness & Respect</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.politeness || 5} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Honesty & Reliability</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.honesty || 5} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Attentiveness in Class</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.attentiveness || 4} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Leadership & Initiative</span>
                <span className="font-bold text-slate-900">{meta.affectiveTraits?.leadership || 4} ★</span>
              </div>
            </div>
          </div>

          {/* Psychomotor Skills */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50">
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
              Psychomotor Skills (1-5)
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Handwriting & Legibility</span>
                <span className="font-bold text-slate-900">{meta.psychomotorSkills?.handwriting || 4} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Sports & Athletics</span>
                <span className="font-bold text-slate-900">{meta.psychomotorSkills?.sports || 5} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Crafts & Project Work</span>
                <span className="font-bold text-slate-900">{meta.psychomotorSkills?.crafts || 4} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Drawing & Visual Arts</span>
                <span className="font-bold text-slate-900">{meta.psychomotorSkills?.drawing || 4} ★</span>
              </div>
              <div className="flex justify-between">
                <span>Verbal Fluency</span>
                <span className="font-bold text-slate-900">{meta.psychomotorSkills?.verbalFluency || 5} ★</span>
              </div>
            </div>
          </div>

          {/* Attendance & Key Scale */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-1.5">
                Attendance Record
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Times School Opened:</span>
                  <span className="font-bold">{meta.timesSchoolOpened}</span>
                </div>
                <div className="flex justify-between">
                  <span>Times Present:</span>
                  <span className="font-bold text-emerald-700">{meta.timesPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Times Absent:</span>
                  <span className="font-bold text-rose-700">{meta.timesAbsent}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-600">
              <span className="font-bold block text-slate-800">Grading Key:</span>
              <span>A1 (75-100) • B2 (65-74) • B3 (60-64) • C4 (55-59) • C5 (50-54) • D7 (45-49) • E8 (40-44) • F9 (0-39)</span>
            </div>
          </div>
        </div>

        {/* COMMENTS & OFFICIAL ENDORSEMENTS */}
        <div className="border border-slate-900 rounded p-3 text-xs space-y-3 bg-white">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-0.5">
              <span>CLASS TEACHER'S REMARK:</span>
              <span className="font-normal italic text-slate-500">{currentClass?.classTeacher}</span>
            </div>
            <p className="font-medium text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
              {meta.classTeacherComment}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-0.5">
              <span>PRINCIPAL'S REMARK & DECISION:</span>
              <span className="font-normal italic text-slate-500">{schoolProfile.principalName}</span>
            </div>
            <p className="font-medium text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
              {meta.principalComment}
            </p>
          </div>

          {/* SIGNATURES ROW */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-600">
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center font-serif italic text-xs text-slate-800">
                {currentClass?.classTeacher?.split(' ')[1] || 'Signed'}
              </div>
              <span className="block mt-1 font-semibold uppercase">Class Teacher's Signature</span>
            </div>
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center font-bold text-slate-400 text-xs uppercase tracking-widest">
                [ OFFICIAL STAMP ]
              </div>
              <span className="block mt-1 font-semibold uppercase">School Stamp</span>
            </div>
            <div>
              <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-center font-serif italic text-xs text-slate-800">
                {schoolProfile.principalName?.split(' ')[1] || 'Principal'}
              </div>
              <span className="block mt-1 font-semibold uppercase">Principal's Signature</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Control Bar (Hidden on Print) */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Print & Report Center
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {schoolProfile.currentSession} • {schoolProfile.currentTerm}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Terminal Report Cards</h2>
            <p className="text-sm text-slate-500">
              Generate, customize comments, and print official terminal report cards for students.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-toggle-batch-print"
              onClick={() => setIsBatchMode(!isBatchMode)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                isBatchMode
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isBatchMode ? 'Switch to Single Student View' : `Batch Print All (${classStudents.length} Students)`}</span>
            </button>

            {!isBatchMode && (
              <button
                id="btn-edit-comments-toggle"
                onClick={() => setIsEditingComments(!isEditingComments)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isEditingComments ? 'Close Comment Editor' : 'Edit Remarks / Attendance'}</span>
              </button>
            )}

            {!isBatchMode && onNavigateToAnalysis && currentReport && (
              <button
                id="btn-view-student-analysis"
                onClick={() => onNavigateToAnalysis(currentReport.student.id)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Subject Analysis</span>
              </button>
            )}

            <button
              id="btn-trigger-print-report"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print {isBatchMode ? `All ${classStudents.length} Report Cards` : 'Report Card (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Filters and Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class</label>
            <select
              id="select-report-class"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const firstSt = students.find((s) => s.classId === e.target.value);
                if (firstSt) setSelectedStudentId(firstSt.id);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {!isBatchMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                id="select-report-student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {classStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.admissionNo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isBatchMode && (
            <div className="flex items-end space-x-2">
              <button
                id="btn-prev-student"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Student</span>
              </button>
              <button
                id="btn-next-student"
                onClick={handleNext}
                disabled={currentIndex >= classReports.length - 1}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-300 cursor-pointer"
              >
                <span>Next Student</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Comment / Remarks Editing Panel (Drawer) */}
        {isEditingComments && currentReport && (
          <div className="mt-4 p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-indigo-900 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Remarks & Attendance for {currentReport.student.fullName}</span>
              </h4>
              <span className="text-xs text-indigo-700 font-medium">Auto-saves to report card</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Teacher's Remark
                </label>
                <textarea
                  id="textarea-teacher-remark"
                  rows={3}
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Chisom is a brilliant and dedicated student..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal's Remark & Endorsement
                </label>
                <textarea
                  id="textarea-principal-remark"
                  rows={3}
                  value={principalComment}
                  onChange={(e) => setPrincipalComment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Excellent terminal result. Commended for exemplary conduct..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Times Present</label>
                <input
                  type="number"
                  min={0}
                  value={timesPresent}
                  onChange={(e) => setTimesPresent(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Times School Opened</label>
                <input
                  type="number"
                  min={0}
                  value={timesOpened}
                  onChange={(e) => setTimesOpened(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                id="btn-cancel-comment-edit"
                onClick={() => setIsEditingComments(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-comment-edit"
                onClick={handleSaveComments}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Remarks</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER REPORT SHEETS */}
      {classReports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-12 text-center text-slate-400">
          <Award className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Students In This Class</h3>
          <p className="text-xs text-slate-500 mt-1">
            Please add students in the Students tab or select a different class above.
          </p>
        </div>
      ) : isBatchMode ? (
        <div className="space-y-8">
          {classReports.map((report) => renderReportCard(report, false))}
        </div>
      ) : (
        currentReport && renderReportCard(currentReport, true)
      )}
    </div>
  );
};
