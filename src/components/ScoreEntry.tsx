import React, { useState, useMemo, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Search,
  BookOpen,
  Users,
  ChevronRight,
  Printer,
  Info,
  GraduationCap,
} from 'lucide-react';
import {
  ClassRoom,
  Subject,
  Student,
  StudentSubjectScore,
  SchoolProfile,
} from '../types';
import { computeStudentSubjectScore } from '../utils/grading';

interface ScoreEntryProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  scores: StudentSubjectScore[];
  schoolProfile: SchoolProfile;
  onSaveScores: (updatedScores: StudentSubjectScore[]) => void;
  onNavigateToReport: (studentId: string) => void;
}

export const ScoreEntry: React.FC<ScoreEntryProps> = ({
  classes,
  subjects,
  students,
  scores,
  schoolProfile,
  onSaveScores,
  onNavigateToReport,
}) => {
  // Mode: 'by-subject' (one subject, all students in class) vs 'by-student' (one student, all subjects)
  const [entryMode, setEntryMode] = useState<'by-subject' | 'by-student'>('by-subject');

  // Filter selections
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!classes.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(classes[0]?.id || '');
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (!subjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0]?.id || '');
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (!students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0]?.id || '');
    }
  }, [students, selectedStudentId]);

  const config = schoolProfile.assessmentConfig;
  const currentTerm = schoolProfile.currentTerm;
  const currentSession = schoolProfile.currentSession;

  // Filter subjects applicable for the selected class
  const classSubjects = useMemo(() => {
    return subjects.filter(
      (s) => s.classIds.length === 0 || s.classIds.includes(selectedClassId)
    );
  }, [subjects, selectedClassId]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Local draft state for quick inputs before permanent commit
  const [localScores, setLocalScores] = useState<Record<string, { ca1: string; ca2: string; midterm: string; exam: string }>>({});

  // Helper to construct unique lookup key
  const makeKey = (studentId: string, subjectId: string) => `${studentId}_${subjectId}`;

  // Get current score value from local state or props
  const getScoreData = (studentId: string, subjectId: string) => {
    const key = makeKey(studentId, subjectId);
    if (localScores[key]) {
      return localScores[key];
    }
    const existing = scores.find(
      (s) =>
        s.studentId === studentId &&
        s.subjectId === subjectId &&
        s.term === currentTerm &&
        s.session === currentSession
    );
    return {
      ca1: existing ? String(existing.ca1) : '',
      ca2: existing ? String(existing.ca2) : '',
      midterm: existing ? String(existing.midterm) : '',
      exam: existing ? String(existing.exam) : '',
    };
  };

  const handleScoreChange = (
    studentId: string,
    subjectId: string,
    field: 'ca1' | 'ca2' | 'midterm' | 'exam',
    value: string
  ) => {
    const key = makeKey(studentId, subjectId);
    const current = getScoreData(studentId, subjectId);
    
    // Clean input - only positive numbers or empty
    const numValue = value === '' ? '' : Math.max(0, Number(value));
    
    setLocalScores((prev) => ({
      ...prev,
      [key]: {
        ...current,
        [field]: numValue === '' ? '' : String(numValue),
      },
    }));
  };

  const handleSaveAll = () => {
    const updatedScoresMap = new Map<string, StudentSubjectScore>();
    
    // Copy existing
    scores.forEach((s) => {
      const k = `${s.studentId}_${s.subjectId}_${s.term}_${s.session}`;
      updatedScoresMap.set(k, s);
    });

    // Apply all local draft entries
    Object.entries(localScores).forEach(([key, val]: [string, { ca1: string; ca2: string; midterm: string; exam: string }]) => {
      const [studentId, subjectId] = key.split('_');
      const student = students.find((s) => s.id === studentId);
      if (!student) return;

      const mapKey = `${studentId}_${subjectId}_${currentTerm}_${currentSession}`;
      const existing = updatedScoresMap.get(mapKey);

      const ca1 = Math.min(config.maxCa1, Math.max(0, Number(val.ca1 || 0)));
      const ca2 = Math.min(config.maxCa2, Math.max(0, Number(val.ca2 || 0)));
      const midterm = Math.min(config.maxMidterm, Math.max(0, Number(val.midterm || 0)));
      const exam = Math.min(config.maxExam, Math.max(0, Number(val.exam || 0)));

      const updatedRecord: StudentSubjectScore = {
        id: existing ? existing.id : `sc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId,
        subjectId,
        classId: student.classId,
        term: currentTerm,
        session: currentSession,
        ca1,
        ca2,
        midterm,
        exam,
      };

      updatedScoresMap.set(mapKey, updatedRecord);
    });

    const finalScoresArray = Array.from(updatedScoresMap.values());
    onSaveScores(finalScoresArray);
    setLocalScores({});
    setSaveSuccessMessage('All assessment scores have been saved successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Quick fill sample scores for testing
  const handleQuickFillDemoScores = () => {
    if (entryMode === 'by-subject') {
      const updates: Record<string, { ca1: string; ca2: string; midterm: string; exam: string }> = {};
      classStudents.forEach((student) => {
        const key = makeKey(student.id, selectedSubjectId);
        updates[key] = {
          ca1: String(Math.floor(Math.random() * 3) + 8), // 8-10
          ca2: String(Math.floor(Math.random() * 3) + 8), // 8-10
          midterm: String(Math.floor(Math.random() * 5) + 16), // 16-20
          exam: String(Math.floor(Math.random() * 10) + 30), // 30-40
        };
      });
      setLocalScores((prev) => ({ ...prev, ...updates }));
    } else {
      const updates: Record<string, { ca1: string; ca2: string; midterm: string; exam: string }> = {};
      classSubjects.forEach((subj) => {
        const key = makeKey(selectedStudentId, subj.id);
        updates[key] = {
          ca1: String(Math.floor(Math.random() * 3) + 8),
          ca2: String(Math.floor(Math.random() * 3) + 8),
          midterm: String(Math.floor(Math.random() * 5) + 16),
          exam: String(Math.floor(Math.random() * 10) + 30),
        };
      });
      setLocalScores((prev) => ({ ...prev, ...updates }));
    }
  };

  // Filtered student list for table
  const filteredStudents = useMemo(() => {
    return classStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classStudents, searchQuery]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Assessment Breakdown Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Assessment Score Sheet
            </span>
            <span className="text-xs font-medium text-slate-500">
              {currentSession} • {currentTerm}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Score Entry Portal</h2>
          <p className="text-sm text-slate-500">
            Record Continuous Assessments (CA1, CA2), Midterm Test, and Final Examination scores.
          </p>
        </div>

        {/* Assessment Marks Structure Summary */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-slate-200">
            <span className="text-slate-500 font-medium">CA1:</span>
            <span className="font-bold text-indigo-700">{config.maxCa1} Marks</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-slate-200">
            <span className="text-slate-500 font-medium">CA2:</span>
            <span className="font-bold text-indigo-700">{config.maxCa2} Marks</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-slate-200">
            <span className="text-slate-500 font-medium">Midterm:</span>
            <span className="font-bold text-indigo-700">{config.maxMidterm} Marks</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded border border-slate-200">
            <span className="text-slate-500 font-medium">Exam:</span>
            <span className="font-bold text-indigo-700">{config.maxExam} Marks</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-600 text-white rounded font-bold">
            <span>Total: {config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam} Marks</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-sm">{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Mode Selector & Filter Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Entry Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg w-fit">
            <button
              id="mode-by-subject-btn"
              onClick={() => setEntryMode('by-subject')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                entryMode === 'by-subject'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>By Class & Subject (Spreadsheet)</span>
            </button>
            <button
              id="mode-by-student-btn"
              onClick={() => setEntryMode('by-student')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                entryMode === 'by-student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>By Individual Student</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-quick-fill-sample"
              onClick={handleQuickFillDemoScores}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Populates realistic marks for demo and testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Fill Sample Marks</span>
            </button>

            <button
              id="btn-save-scores-primary"
              onClick={handleSaveAll}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Scores</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class</label>
            <select
              id="select-class-dropdown"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const firstStudentInClass = students.find((s) => s.classId === e.target.value);
                if (firstStudentInClass) {
                  setSelectedStudentId(firstStudentInClass.id);
                }
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {classes.length === 0 ? (
                <option value="">-- No Classes Created --</option>
              ) : (
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {entryMode === 'by-subject' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Subject</label>
              <select
                id="select-subject-dropdown"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {classSubjects.length === 0 ? (
                  <option value="">-- No Subjects Available --</option>
                ) : (
                  classSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                id="select-student-dropdown"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {classStudents.length === 0 ? (
                  <option value="">-- No Students Enrolled --</option>
                ) : (
                  classStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.admissionNo})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {entryMode === 'by-subject' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Search Student</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter name or admission no..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="flex items-end">
            {entryMode === 'by-student' && currentStudent && (
              <button
                id="btn-jump-to-report-from-scores"
                onClick={() => onNavigateToReport(currentStudent.id)}
                className="w-full inline-flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>View Full Report Card</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODE 1: BY SUBJECT TABLE */}
      {entryMode === 'by-subject' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentSubject?.name || 'Subject'} — {currentClass?.name || 'Class'}
              </h3>
              <p className="text-xs text-slate-500">
                Entering assessment scores for {filteredStudents.length} enrolled student(s).
              </p>
            </div>
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Use TAB to jump smoothly between inputs.</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[200px]">Student Name</th>
                  <th className="py-3 px-4 min-w-[120px]">Adm No</th>
                  <th className="py-3 px-3 w-28 text-center bg-indigo-50/50">
                    CA 1 <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa1}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-indigo-50/50">
                    CA 2 <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa2}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-amber-50/50">
                    Midterm <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxMidterm}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-rose-50/50">
                    Exam <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxExam}</span>
                  </th>
                  <th className="py-3 px-3 w-24 text-center bg-slate-100">
                    Total <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam}</span>
                  </th>
                  <th className="py-3 px-3 w-20 text-center">Grade</th>
                  <th className="py-3 px-4 min-w-[120px]">Remark</th>
                  <th className="py-3 px-3 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No students found in this class. Add students from the Students tab.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, idx) => {
                    const scoreData = getScoreData(st.id, selectedSubjectId);
                    const ca1Num = Number(scoreData.ca1 || 0);
                    const ca2Num = Number(scoreData.ca2 || 0);
                    const midtermNum = Number(scoreData.midterm || 0);
                    const examNum = Number(scoreData.exam || 0);

                    const isCa1Over = ca1Num > config.maxCa1;
                    const isCa2Over = ca2Num > config.maxCa2;
                    const isMidtermOver = midtermNum > config.maxMidterm;
                    const isExamOver = examNum > config.maxExam;

                    // Computed preview
                    const computed = computeStudentSubjectScore(
                      {
                        id: '',
                        studentId: st.id,
                        subjectId: selectedSubjectId,
                        classId: selectedClassId,
                        term: currentTerm,
                        session: currentSession,
                        ca1: ca1Num,
                        ca2: ca2Num,
                        midterm: midtermNum,
                        exam: examNum,
                      },
                      currentSubject?.name || '',
                      currentSubject?.code || '',
                      config,
                      schoolProfile.gradeScales
                    );

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 text-center font-medium text-slate-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {st.fullName}
                        </td>
                        <td className="py-2.5 px-4 text-xs font-mono text-slate-500">
                          {st.admissionNo}
                        </td>

                        {/* CA1 Input (Max 10) */}
                        <td className="py-2 px-3 text-center bg-indigo-50/20">
                          <input
                            id={`input-ca1-${st.id}`}
                            type="number"
                            min={0}
                            max={config.maxCa1}
                            step={0.5}
                            value={scoreData.ca1}
                            placeholder="0"
                            onChange={(e) =>
                              handleScoreChange(st.id, selectedSubjectId, 'ca1', e.target.value)
                            }
                            className={`w-20 text-center font-semibold rounded-md py-1.5 text-sm border focus:ring-2 focus:outline-hidden ${
                              isCa1Over
                                ? 'bg-red-50 border-red-500 text-red-700 ring-red-400'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-200'
                            }`}
                          />
                        </td>

                        {/* CA2 Input (Max 10) */}
                        <td className="py-2 px-3 text-center bg-indigo-50/20">
                          <input
                            id={`input-ca2-${st.id}`}
                            type="number"
                            min={0}
                            max={config.maxCa2}
                            step={0.5}
                            value={scoreData.ca2}
                            placeholder="0"
                            onChange={(e) =>
                              handleScoreChange(st.id, selectedSubjectId, 'ca2', e.target.value)
                            }
                            className={`w-20 text-center font-semibold rounded-md py-1.5 text-sm border focus:ring-2 focus:outline-hidden ${
                              isCa2Over
                                ? 'bg-red-50 border-red-500 text-red-700 ring-red-400'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-200'
                            }`}
                          />
                        </td>

                        {/* Midterm Input (Max 20) */}
                        <td className="py-2 px-3 text-center bg-amber-50/20">
                          <input
                            id={`input-midterm-${st.id}`}
                            type="number"
                            min={0}
                            max={config.maxMidterm}
                            step={0.5}
                            value={scoreData.midterm}
                            placeholder="0"
                            onChange={(e) =>
                              handleScoreChange(st.id, selectedSubjectId, 'midterm', e.target.value)
                            }
                            className={`w-20 text-center font-semibold rounded-md py-1.5 text-sm border focus:ring-2 focus:outline-hidden ${
                              isMidtermOver
                                ? 'bg-red-50 border-red-500 text-red-700 ring-red-400'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-amber-200'
                            }`}
                          />
                        </td>

                        {/* Exam Input (Max 40) */}
                        <td className="py-2 px-3 text-center bg-rose-50/20">
                          <input
                            id={`input-exam-${st.id}`}
                            type="number"
                            min={0}
                            max={config.maxExam}
                            step={0.5}
                            value={scoreData.exam}
                            placeholder="0"
                            onChange={(e) =>
                              handleScoreChange(st.id, selectedSubjectId, 'exam', e.target.value)
                            }
                            className={`w-20 text-center font-semibold rounded-md py-1.5 text-sm border focus:ring-2 focus:outline-hidden ${
                              isExamOver
                                ? 'bg-red-50 border-red-500 text-red-700 ring-red-400'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-rose-500 focus:ring-rose-200'
                            }`}
                          />
                        </td>

                        {/* Total Score */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50 text-sm">
                          {computed.totalScore}
                        </td>

                        {/* Grade Badge */}
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {computed.grade}
                          </span>
                        </td>

                        {/* Remark */}
                        <td className="py-2.5 px-4 text-xs font-medium text-slate-600">
                          {computed.remark}
                        </td>

                        {/* Report shortcut */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            id={`btn-report-shortcut-${st.id}`}
                            onClick={() => onNavigateToReport(st.id)}
                            title="Open Student Report Card"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Changes stay in draft until you click <strong>Save Scores</strong>.
            </span>
            <button
              id="btn-save-scores-footer"
              onClick={handleSaveAll}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Assessment Scores</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: BY STUDENT TABLE */}
      {entryMode === 'by-student' && currentStudent && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {currentStudent.fullName} ({currentStudent.admissionNo}) — {currentClass?.name}
              </h3>
              <p className="text-xs text-slate-500">
                All subject scores for {currentTerm}, {currentSession}.
              </p>
            </div>
            <button
              id="btn-print-student-from-scores"
              onClick={() => onNavigateToReport(currentStudent.id)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Print Student Report Card</span>
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Subject Name</th>
                  <th className="py-3 px-4 w-20">Code</th>
                  <th className="py-3 px-3 w-28 text-center bg-indigo-50/50">
                    CA 1 <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa1}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-indigo-50/50">
                    CA 2 <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa2}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-amber-50/50">
                    Midterm <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxMidterm}</span>
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-rose-50/50">
                    Exam <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxExam}</span>
                  </th>
                  <th className="py-3 px-3 w-24 text-center bg-slate-100">
                    Total <span className="block text-[10px] text-slate-500 font-normal">Max: {config.maxCa1 + config.maxCa2 + config.maxMidterm + config.maxExam}</span>
                  </th>
                  <th className="py-3 px-3 w-20 text-center">Grade</th>
                  <th className="py-3 px-4 min-w-[140px]">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classSubjects.map((sub, idx) => {
                  const scoreData = getScoreData(currentStudent.id, sub.id);
                  const ca1Num = Number(scoreData.ca1 || 0);
                  const ca2Num = Number(scoreData.ca2 || 0);
                  const midtermNum = Number(scoreData.midterm || 0);
                  const examNum = Number(scoreData.exam || 0);

                  const computed = computeStudentSubjectScore(
                    {
                      id: '',
                      studentId: currentStudent.id,
                      subjectId: sub.id,
                      classId: selectedClassId,
                      term: currentTerm,
                      session: currentSession,
                      ca1: ca1Num,
                      ca2: ca2Num,
                      midterm: midtermNum,
                      exam: examNum,
                    },
                    sub.name,
                    sub.code,
                    config,
                    schoolProfile.gradeScales
                  );

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-4 text-center font-medium text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {sub.name}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-mono text-slate-500 font-medium">
                        {sub.code}
                      </td>

                      {/* CA1 */}
                      <td className="py-2 px-3 text-center bg-indigo-50/20">
                        <input
                          id={`input-by-student-ca1-${sub.id}`}
                          type="number"
                          min={0}
                          max={config.maxCa1}
                          step={0.5}
                          value={scoreData.ca1}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(currentStudent.id, sub.id, 'ca1', e.target.value)
                          }
                          className="w-20 text-center font-semibold rounded-md py-1.5 text-sm border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                        />
                      </td>

                      {/* CA2 */}
                      <td className="py-2 px-3 text-center bg-indigo-50/20">
                        <input
                          id={`input-by-student-ca2-${sub.id}`}
                          type="number"
                          min={0}
                          max={config.maxCa2}
                          step={0.5}
                          value={scoreData.ca2}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(currentStudent.id, sub.id, 'ca2', e.target.value)
                          }
                          className="w-20 text-center font-semibold rounded-md py-1.5 text-sm border border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-hidden"
                        />
                      </td>

                      {/* Midterm */}
                      <td className="py-2 px-3 text-center bg-amber-50/20">
                        <input
                          id={`input-by-student-midterm-${sub.id}`}
                          type="number"
                          min={0}
                          max={config.maxMidterm}
                          step={0.5}
                          value={scoreData.midterm}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(currentStudent.id, sub.id, 'midterm', e.target.value)
                          }
                          className="w-20 text-center font-semibold rounded-md py-1.5 text-sm border border-slate-300 bg-white text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                        />
                      </td>

                      {/* Exam */}
                      <td className="py-2 px-3 text-center bg-rose-50/20">
                        <input
                          id={`input-by-student-exam-${sub.id}`}
                          type="number"
                          min={0}
                          max={config.maxExam}
                          step={0.5}
                          value={scoreData.exam}
                          placeholder="0"
                          onChange={(e) =>
                            handleScoreChange(currentStudent.id, sub.id, 'exam', e.target.value)
                          }
                          className="w-20 text-center font-semibold rounded-md py-1.5 text-sm border border-slate-300 bg-white text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-hidden"
                        />
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50 text-sm">
                        {computed.totalScore}
                      </td>

                      {/* Grade */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {computed.grade}
                        </span>
                      </td>

                      {/* Remark */}
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-600">
                        {computed.remark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Click <strong>Save Scores</strong> to persist updates to this student report.
            </span>
            <button
              id="btn-save-by-student-scores"
              onClick={handleSaveAll}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Student Scores</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
