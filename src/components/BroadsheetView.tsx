import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Trophy,
  Users,
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

interface BroadsheetViewProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  metadataList: StudentReportMetadata[];
  schoolProfile: SchoolProfile;
}

export const BroadsheetView: React.FC<BroadsheetViewProps> = ({
  classes,
  subjects,
  students,
  scores,
  metadataList,
  schoolProfile,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const classSubjects = useMemo(() => {
    return subjects.filter(
      (s) => s.classIds.length === 0 || s.classIds.includes(selectedClassId)
    );
  }, [subjects, selectedClassId]);

  const classReports = useMemo(() => {
    if (!currentClass) return [];
    const reports = generateClassReports(
      currentClass,
      classStudents,
      subjects,
      scores,
      metadataList,
      schoolProfile
    );
    // Sort by rank / percentage descending for broadsheet
    return [...reports].sort((a, b) => b.overallPercentage - a.overallPercentage);
  }, [currentClass, classStudents, subjects, scores, metadataList, schoolProfile]);

  const handlePrint = () => {
    window.print();
  };

  // Export Broadsheet to CSV
  const handleExportCSV = () => {
    if (classReports.length === 0) return;

    // Header row
    const headers = [
      'Position',
      'Admission No',
      'Student Name',
      'Gender',
      ...classSubjects.map((s) => `${s.name} (${s.code}) Total`),
      'Grand Total Obtained',
      'Total Obtainable',
      'Overall %',
      'Grade',
    ];

    const rows = classReports.map((r) => {
      const subjScores = classSubjects.map((cs) => {
        const found = r.subjects.find((s) => s.subjectId === cs.id);
        return found ? found.totalScore : 0;
      });

      return [
        `"${r.classPosition}"`,
        `"${r.student.admissionNo}"`,
        `"${r.student.fullName}"`,
        `"${r.student.gender}"`,
        ...subjScores,
        r.totalScoreObtained,
        r.totalScoreObtainable,
        `${r.overallPercentage}%`,
        `"${r.overallGrade}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Broadsheet_${currentClass?.name || 'Class'}_${schoolProfile.currentTerm.replace(' ', '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Filter and Controls Bar (Hidden during print) */}
      <div className="no-print bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                Master Broadsheet
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {schoolProfile.currentSession} • {schoolProfile.currentTerm}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Class Master Broadsheet</h2>
            <p className="text-sm text-slate-500">
              Complete tabular compilation of student performance across all registered subjects.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-export-broadsheet-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-print-broadsheet"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Broadsheet</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center space-x-4">
          <div className="w-64">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class</label>
            <select
              id="select-broadsheet-class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BROADSHEET PRINTABLE DOCUMENT */}
      <div className="report-page-container bg-white border border-slate-300 shadow-md rounded-lg p-6 sm:p-8 max-w-7xl mx-auto text-slate-900 overflow-x-auto custom-scrollbar">
        {/* Printable Header */}
        <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 font-serif">
            {schoolProfile.schoolName}
          </h1>
          <p className="text-xs italic text-slate-600">"{schoolProfile.schoolMotto}"</p>
          <p className="text-xs text-slate-600">{schoolProfile.schoolAddress}</p>
          <div className="mt-2 inline-block bg-slate-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-1 rounded">
            Master Broadsheet: {currentClass?.name || 'Class'} ({schoolProfile.currentTerm}, {schoolProfile.currentSession})
          </div>
        </div>

        {/* Class Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 border border-slate-200 rounded p-2.5 mb-4">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Class Teacher</span>
            <span className="font-bold text-slate-800">{currentClass?.classTeacher || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Total Students</span>
            <span className="font-bold text-slate-800">{classReports.length}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Class Average</span>
            <span className="font-bold text-indigo-700">
              {classReports[0]?.classAveragePercentage || 0}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Top Student</span>
            <span className="font-bold text-emerald-700">
              {classReports[0]?.student.fullName || 'N/A'} ({classReports[0]?.overallPercentage || 0}%)
            </span>
          </div>
        </div>

        {/* Broadsheet Matrix Table */}
        <div className="overflow-x-auto border border-slate-900 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider text-center">
                <th className="py-2.5 px-2 w-12 border-r border-slate-700">Pos</th>
                <th className="py-2.5 px-3 text-left border-r border-slate-700 min-w-[180px]">Student Name</th>
                <th className="py-2.5 px-2 border-r border-slate-700 min-w-[90px]">Adm No</th>
                <th className="py-2.5 px-2 border-r border-slate-700 w-12">Sex</th>

                {/* Dynamic Subjects Columns */}
                {classSubjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="py-2 px-1 border-r border-slate-700 min-w-[65px] text-center"
                    title={sub.name}
                  >
                    <span className="block font-bold">{sub.code}</span>
                    <span className="block text-[8px] font-normal text-slate-300">Total</span>
                  </th>
                ))}

                <th className="py-2.5 px-2 border-r border-slate-700 w-16 bg-slate-800">Total</th>
                <th className="py-2.5 px-2 border-r border-slate-700 w-14">Avg %</th>
                <th className="py-2.5 px-2 w-12">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {classReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7 + classSubjects.length}
                    className="py-8 text-center text-slate-400"
                  >
                    No students in this class.
                  </td>
                </tr>
              ) : (
                classReports.map((report, idx) => (
                  <tr
                    key={report.student.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      idx < 3 ? 'bg-amber-50/20' : idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    <td className="py-2 px-2 text-center font-bold text-slate-900 border-r border-slate-300">
                      {report.classPosition}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-300">
                      {report.student.fullName}
                    </td>
                    <td className="py-2 px-2 text-xs font-mono text-slate-600 border-r border-slate-300">
                      {report.student.admissionNo}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 border-r border-slate-300">
                      {report.student.gender === 'Male' ? 'M' : 'F'}
                    </td>

                    {/* Subject scores */}
                    {classSubjects.map((sub) => {
                      const computed = report.subjects.find((s) => s.subjectId === sub.id);
                      return (
                        <td
                          key={sub.id}
                          className="py-2 px-1 text-center font-medium text-slate-800 border-r border-slate-300"
                        >
                          {computed ? computed.totalScore : 0}
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 text-center font-black text-slate-900 bg-indigo-50/50 border-r border-slate-300">
                      {report.totalScoreObtained}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-indigo-900 border-r border-slate-300">
                      {report.overallPercentage}%
                    </td>
                    <td className="py-2 px-2 text-center font-bold">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {report.overallGrade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Broadsheet Signoff Footer */}
        <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-600">
          <div>
            <div className="h-6 border-b border-slate-400"></div>
            <span className="block mt-1 font-semibold uppercase">Prepared By (Class Teacher)</span>
          </div>
          <div>
            <div className="h-6 border-b border-slate-400"></div>
            <span className="block mt-1 font-semibold uppercase">Exam Committee Officer</span>
          </div>
          <div>
            <div className="h-6 border-b border-slate-400"></div>
            <span className="block mt-1 font-semibold uppercase">Principal / Head of School</span>
          </div>
        </div>
      </div>
    </div>
  );
};
