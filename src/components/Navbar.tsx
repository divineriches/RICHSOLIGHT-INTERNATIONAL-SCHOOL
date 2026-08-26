import React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Users,
  BookOpen,
  Settings,
  Printer,
  BarChart3,
} from 'lucide-react';
import { SchoolProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'scores' | 'reports' | 'broadsheet' | 'analysis' | 'students' | 'classes' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'scores' | 'reports' | 'broadsheet' | 'analysis' | 'students' | 'classes' | 'settings') => void;
  schoolProfile: SchoolProfile;
  onQuickPrint?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  schoolProfile,
  onQuickPrint,
}) => {
  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Header */}
          <div
            id="nav-brand-logo"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-inner group-hover:bg-indigo-500 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate max-w-[220px] sm:max-w-xs md:max-w-md">
                {schoolProfile.schoolName || 'Exam Reporting Portal'}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="font-medium text-amber-400">{schoolProfile.currentSession}</span>
                <span>•</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-semibold">
                  {schoolProfile.currentTerm}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Print */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              id="nav-quick-report-btn"
              onClick={() => {
                setActiveTab('reports');
                if (onQuickPrint) onQuickPrint();
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report Card</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            id="tab-btn-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            id="tab-btn-scores"
            onClick={() => setActiveTab('scores')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'scores'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Score Entry</span>
          </button>

          <button
            id="tab-btn-reports"
            onClick={() => setActiveTab('reports')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'reports'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Print Report Cards</span>
          </button>

          <button
            id="tab-btn-broadsheet"
            onClick={() => setActiveTab('broadsheet')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'broadsheet'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Class Broadsheet</span>
          </button>

          <button
            id="tab-btn-analysis"
            onClick={() => setActiveTab('analysis')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Subject Analysis</span>
          </button>

          <button
            id="tab-btn-students"
            onClick={() => setActiveTab('students')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
          </button>

          <button
            id="tab-btn-classes"
            onClick={() => setActiveTab('classes')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'classes'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Classes & Subjects</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-white bg-slate-800/60 rounded-t-md'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
