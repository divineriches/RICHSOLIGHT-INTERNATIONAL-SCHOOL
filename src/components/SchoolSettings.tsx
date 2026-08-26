import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Building,
  Calendar,
  AlertTriangle,
  Award,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { SchoolProfile, AssessmentConfig, GradeScale } from '../types';
import {
  exportBackupData,
  importBackupData,
  clearAllData,
  loadSampleDemoData,
} from '../utils/storage';

interface SchoolSettingsProps {
  schoolProfile: SchoolProfile;
  onSaveProfile: (profile: SchoolProfile) => void;
  onResetAllData: () => void;
  onImportSuccess: () => void;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({
  schoolProfile,
  onSaveProfile,
  onResetAllData,
  onImportSuccess,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(schoolProfile);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfile(schoolProfile);
  }, [schoolProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSuccessMessage('School profile and grading settings saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleConfigChange = (field: keyof AssessmentConfig, val: number) => {
    setProfile((prev) => ({
      ...prev,
      assessmentConfig: {
        ...prev.assessmentConfig,
        [field]: Math.max(1, Number(val)),
      },
    }));
  };

  const handleBackupDownload = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamPortal_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupData(content);
        if (ok) {
          onImportSuccess();
          setSuccessMessage('Backup restored successfully!');
          setTimeout(() => setSuccessMessage(null), 3500);
        } else {
          alert('Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to CLEAR ALL DATA in the portal? All classes, subjects, students, scores, and records will be deleted so you can input your own.'
      )
    ) {
      clearAllData();
      onResetAllData();
      setSuccessMessage('All data has been cleared! You have a fresh, blank portal to input your own school data.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const handleLoadSampleDemo = () => {
    if (
      window.confirm(
        'Load the sample demo dataset? This will populate sample classes, subjects, students, and scores.'
      )
    ) {
      loadSampleDemoData();
      onResetAllData();
      setSuccessMessage('Sample demo dataset loaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Portal Configuration
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">School & Assessment Settings</h2>
          <p className="text-sm text-slate-500">
            Configure school profile, session, term, assessment marks distribution, and backup data.
          </p>
        </div>

        <button
          id="btn-save-all-settings"
          onClick={handleSave}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SCHOOL IDENTITY */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Building className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">School Identity & Contacts</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official School Name
              </label>
              <input
                type="text"
                required
                value={profile.schoolName}
                onChange={(e) => setProfile({ ...profile, schoolName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Motto</label>
              <input
                type="text"
                value={profile.schoolMotto}
                onChange={(e) => setProfile({ ...profile, schoolMotto: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={profile.schoolAddress}
                onChange={(e) => setProfile({ ...profile, schoolAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telephone</label>
                <input
                  type="text"
                  value={profile.schoolPhone}
                  onChange={(e) => setProfile({ ...profile, schoolPhone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile.schoolEmail}
                  onChange={(e) => setProfile({ ...profile, schoolEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal / Head of School
                </label>
                <input
                  type="text"
                  value={profile.principalName}
                  onChange={(e) => setProfile({ ...profile, principalName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo Crest Abbreviation
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={profile.schoolLogoText || 'SAC'}
                  onChange={(e) => setProfile({ ...profile, schoolLogoText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* ACADEMIC TERM & ASSESSMENT WEIGHTS */}
          <div className="space-y-8">
            {/* Session & Term */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Academic Session & Term</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Session
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025/2026"
                    value={profile.currentSession}
                    onChange={(e) => setProfile({ ...profile, currentSession: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Term
                  </label>
                  <select
                    value={profile.currentTerm}
                    onChange={(e) => setProfile({ ...profile, currentTerm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Next Term Resumption Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12th January, 2026"
                  value={profile.nextTermBegins}
                  onChange={(e) => setProfile({ ...profile, nextTermBegins: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Assessment Structure (CA1, CA2, Midterm, Exam) */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Assessment Marks Distribution</h3>
              </div>

              <p className="text-xs text-slate-500">
                Configure maximum marks for each assessment component (CA1: 10, CA2: 10, Midterm: 20, Exam: 60 = 100 Total).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    CA 1 (1st CA)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={profile.assessmentConfig.maxCa1}
                    onChange={(e) => handleConfigChange('maxCa1', Number(e.target.value))}
                    className="w-full text-center bg-white border border-slate-300 rounded-md py-1 text-sm font-bold text-indigo-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Marks</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    CA 2 (2nd CA)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={profile.assessmentConfig.maxCa2}
                    onChange={(e) => handleConfigChange('maxCa2', Number(e.target.value))}
                    className="w-full text-center bg-white border border-slate-300 rounded-md py-1 text-sm font-bold text-indigo-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Marks</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Midterm Test
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={profile.assessmentConfig.maxMidterm}
                    onChange={(e) => handleConfigChange('maxMidterm', Number(e.target.value))}
                    className="w-full text-center bg-white border border-slate-300 rounded-md py-1 text-sm font-bold text-amber-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Marks</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Exam Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={profile.assessmentConfig.maxExam}
                    onChange={(e) => handleConfigChange('maxExam', Number(e.target.value))}
                    className="w-full text-center bg-white border border-slate-300 rounded-md py-1 text-sm font-bold text-rose-700"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Marks</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-semibold">Total Obtainable Subject Score:</span>
                <span className="font-bold text-sm text-indigo-700">
                  {profile.assessmentConfig.maxCa1 +
                    profile.assessmentConfig.maxCa2 +
                    profile.assessmentConfig.maxMidterm +
                    profile.assessmentConfig.maxExam}{' '}
                  Marks (100% Scale)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GRADING SCALE PREVIEW */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Grading Scale & Remarks Scheme</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
            {profile.gradeScales.map((scale) => (
              <div key={scale.grade} className="p-2.5 rounded-lg border bg-slate-50 border-slate-200">
                <div className="font-black text-sm text-slate-900">{scale.grade}</div>
                <div className="font-semibold text-slate-600 text-[11px]">
                  {scale.minPercentage}% - {scale.maxPercentage}%
                </div>
                <div className="text-[10px] font-medium text-slate-500 mt-0.5">{scale.remark}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DATA BACKUP & RESTORE & WIPE */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Data Management & Reset</h3>
          </div>

          <p className="text-xs text-slate-500">
            Export a full JSON backup of your classes, subjects, students, and scores, or wipe all data to start fresh.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              id="btn-download-json-backup"
              onClick={handleBackupDownload}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>

            <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleBackupUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              id="btn-load-sample-demo"
              onClick={handleLoadSampleDemo}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Load Sample Demo Data</span>
            </button>

            <button
              type="button"
              id="btn-clear-all-data-fresh"
              onClick={handleClearAllData}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer sm:ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data (Blank Slate)</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
