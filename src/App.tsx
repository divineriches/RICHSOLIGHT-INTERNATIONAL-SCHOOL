import React, { useState, useEffect } from 'react';
import {
  SchoolProfile,
  ClassRoom,
  Subject,
  Student,
  StudentSubjectScore,
  StudentReportMetadata,
} from './types';
import {
  loadSchoolProfile,
  saveSchoolProfile,
  loadClasses,
  saveClasses,
  loadSubjects,
  saveSubjects,
  loadStudents,
  saveStudents,
  loadScores,
  saveScores,
  loadMetadata,
  saveMetadata,
  purgeLegacyStorage,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ScoreEntry } from './components/ScoreEntry';
import { ReportCardView } from './components/ReportCardView';
import { BroadsheetView } from './components/BroadsheetView';
import { SubjectPerformanceAnalysis } from './components/SubjectPerformanceAnalysis';
import { StudentManagement } from './components/StudentManagement';
import { ClassSubjectManagement } from './components/ClassSubjectManagement';
import { SchoolSettings } from './components/SchoolSettings';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'scores' | 'reports' | 'broadsheet' | 'analysis' | 'students' | 'classes' | 'settings'
  >('dashboard');

  // Application Data States
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(loadSchoolProfile);
  const [classes, setClasses] = useState<ClassRoom[]>(loadClasses);
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [students, setStudents] = useState<Student[]>(loadStudents);
  const [scores, setScores] = useState<StudentSubjectScore[]>(loadScores);
  const [metadataList, setMetadataList] = useState<StudentReportMetadata[]>(loadMetadata);

  // Selected student for report card focus
  const [reportStudentId, setReportStudentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    purgeLegacyStorage();
  }, []);

  // Reload all from storage (used after backup restore or demo reset)
  const refreshFromStorage = () => {
    setSchoolProfile(loadSchoolProfile());
    setClasses(loadClasses());
    setSubjects(loadSubjects());
    setStudents(loadStudents());
    setScores(loadScores());
    setMetadataList(loadMetadata());
  };

  // Handlers for data updates
  const handleSaveScores = (updatedScores: StudentSubjectScore[]) => {
    setScores(updatedScores);
    saveScores(updatedScores);
  };

  const handleSaveStudent = (student: Student) => {
    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === student.id);
      let updated: Student[];
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = student;
      } else {
        updated = [...prev, student];
      }
      saveStudents(updated);
      return updated;
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      saveStudents(updated);
      return updated;
    });
    // Also remove their scores
    setScores((prev) => {
      const updated = prev.filter((s) => s.studentId !== studentId);
      saveScores(updated);
      return updated;
    });
    // And metadata
    setMetadataList((prev) => {
      const updated = prev.filter((m) => m.studentId !== studentId);
      saveMetadata(updated);
      return updated;
    });
  };

  const handleSaveClass = (classRoom: ClassRoom) => {
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === classRoom.id);
      let updated: ClassRoom[];
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = classRoom;
      } else {
        updated = [...prev, classRoom];
      }
      saveClasses(updated);
      return updated;
    });
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => {
      const updated = prev.filter((c) => c.id !== classId);
      saveClasses(updated);
      return updated;
    });
  };

  const handleSaveSubject = (subject: Subject) => {
    setSubjects((prev) => {
      const idx = prev.findIndex((s) => s.id === subject.id);
      let updated: Subject[];
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = subject;
      } else {
        updated = [...prev, subject];
      }
      saveSubjects(updated);
      return updated;
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== subjectId);
      saveSubjects(updated);
      return updated;
    });
    setScores((prev) => {
      const updated = prev.filter((s) => s.subjectId !== subjectId);
      saveScores(updated);
      return updated;
    });
  };

  const handleSaveProfile = (profile: SchoolProfile) => {
    setSchoolProfile(profile);
    saveSchoolProfile(profile);
  };

  const handleSaveMetadata = (updatedList: StudentReportMetadata[]) => {
    setMetadataList(updatedList);
    saveMetadata(updatedList);
  };

  const handleNavigateToStudentReport = (studentId: string) => {
    setReportStudentId(studentId);
    setActiveTab('reports');
  };

  const handleNavigateToAnalysis = (studentId: string) => {
    setReportStudentId(studentId);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolProfile={schoolProfile}
        onQuickPrint={() => setActiveTab('reports')}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            metadataList={metadataList}
            schoolProfile={schoolProfile}
            onNavigateTab={setActiveTab}
            onOpenStudentReport={handleNavigateToStudentReport}
            onOpenStudentAnalysis={handleNavigateToAnalysis}
          />
        )}

        {activeTab === 'scores' && (
          <ScoreEntry
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            schoolProfile={schoolProfile}
            onSaveScores={handleSaveScores}
            onNavigateToReport={handleNavigateToStudentReport}
          />
        )}

        {activeTab === 'reports' && (
          <ReportCardView
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            metadataList={metadataList}
            schoolProfile={schoolProfile}
            initialStudentId={reportStudentId}
            onSaveMetadata={handleSaveMetadata}
            onNavigateToScores={() => setActiveTab('scores')}
            onNavigateToAnalysis={handleNavigateToAnalysis}
          />
        )}

        {activeTab === 'broadsheet' && (
          <BroadsheetView
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            metadataList={metadataList}
            schoolProfile={schoolProfile}
          />
        )}

        {activeTab === 'analysis' && (
          <SubjectPerformanceAnalysis
            classes={classes}
            subjects={subjects}
            students={students}
            scores={scores}
            schoolProfile={schoolProfile}
            initialStudentId={reportStudentId}
            onNavigateToScores={(studentId) => {
              if (studentId) setReportStudentId(studentId);
              setActiveTab('scores');
            }}
            onNavigateToReport={handleNavigateToStudentReport}
          />
        )}

        {activeTab === 'students' && (
          <StudentManagement
            students={students}
            classes={classes}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onNavigateToScores={(studentId) => {
              if (studentId) setReportStudentId(studentId);
              setActiveTab('scores');
            }}
            onNavigateToReport={handleNavigateToStudentReport}
            onNavigateToAnalysis={handleNavigateToAnalysis}
          />
        )}

        {activeTab === 'classes' && (
          <ClassSubjectManagement
            classes={classes}
            subjects={subjects}
            students={students}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onSaveSubject={handleSaveSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {activeTab === 'settings' && (
          <SchoolSettings
            schoolProfile={schoolProfile}
            onSaveProfile={handleSaveProfile}
            onResetAllData={refreshFromStorage}
            onImportSuccess={refreshFromStorage}
          />
        )}
      </main>
    </div>
  );
}
