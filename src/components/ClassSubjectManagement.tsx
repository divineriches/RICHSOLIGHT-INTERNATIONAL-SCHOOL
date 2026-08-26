import React, { useState } from 'react';
import {
  Plus,
  BookOpen,
  GraduationCap,
  Edit2,
  Trash2,
  X,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ClassRoom, Subject, Student } from '../types';

interface ClassSubjectManagementProps {
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  onSaveClass: (classRoom: ClassRoom) => void;
  onDeleteClass: (classId: string) => void;
  onSaveSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const ClassSubjectManagement: React.FC<ClassSubjectManagementProps> = ({
  classes,
  subjects,
  students,
  onSaveClass,
  onDeleteClass,
  onSaveSubject,
  onDeleteSubject,
}) => {
  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState({ name: '', section: '', classTeacher: '' });

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState<{
    name: string;
    code: string;
    classIds: string[];
  }>({
    name: '',
    code: '',
    classIds: [],
  });

  // Open Class Modal
  const openAddClass = () => {
    setEditingClass(null);
    setClassForm({ name: '', section: 'Primary School', classTeacher: '' });
    setIsClassModalOpen(true);
  };

  const openEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      section: cls.section || '',
      classTeacher: cls.classTeacher || '',
    });
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    const classToSave: ClassRoom = {
      id: editingClass ? editingClass.id : `class-${Date.now()}`,
      name: classForm.name.trim(),
      section: classForm.section.trim(),
      classTeacher: classForm.classTeacher.trim(),
    };

    onSaveClass(classToSave);
    setIsClassModalOpen(false);
  };

  // Open Subject Modal
  const openAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', code: '', classIds: [] });
    setIsSubjectModalOpen(true);
  };

  const openEditSubject = (subj: Subject) => {
    setEditingSubject(subj);
    setSubjectForm({
      name: subj.name,
      code: subj.code,
      classIds: subj.classIds || [],
    });
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.code.trim()) return;

    const subjectToSave: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      name: subjectForm.name.trim(),
      code: subjectForm.code.trim().toUpperCase(),
      classIds: subjectForm.classIds,
    };

    onSaveSubject(subjectToSave);
    setIsSubjectModalOpen(false);
  };

  const toggleClassForSubject = (classId: string) => {
    setSubjectForm((prev) => {
      const exists = prev.classIds.includes(classId);
      if (exists) {
        return { ...prev, classIds: prev.classIds.filter((id) => id !== classId) };
      } else {
        return { ...prev, classIds: [...prev.classIds, classId] };
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            Academic Structure
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Classes & Subjects Setup</h2>
          <p className="text-sm text-slate-500">
            Define grade levels, assign class teachers, and configure subjects offered across classes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CLASSES SECTION */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Classes ({classes.length})</h3>
            </div>
            <button
              id="btn-add-class"
              onClick={openAddClass}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 flex-1">
            {classes.map((cls) => {
              const studentCount = students.filter((s) => s.classId === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cls.name}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span>{cls.section || 'General'}</span>
                      <span>•</span>
                      <span>Teacher: <strong>{cls.classTeacher || 'Unassigned'}</strong></span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600">{studentCount} Students</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditClass(cls)}
                      className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete class "${cls.name}"? Note: Ensure students in this class are reassigned.`
                          )
                        ) {
                          onDeleteClass(cls.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUBJECTS SECTION */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Subjects ({subjects.length})</h3>
            </div>
            <button
              id="btn-add-subject"
              onClick={openAddSubject}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="divide-y divide-slate-200 flex-1 max-h-[500px] overflow-y-auto custom-scrollbar">
            {subjects.map((subj) => {
              const assignedClassNames =
                subj.classIds.length === 0
                  ? 'All Classes'
                  : classes
                      .filter((c) => subj.classIds.includes(c.id))
                      .map((c) => c.name)
                      .join(', ');

              return (
                <div
                  key={subj.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-sm">{subj.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {subj.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-xs sm:max-w-md">
                      Offered in: <span className="font-medium text-slate-700">{assignedClassNames}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditSubject(subj)}
                      className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete subject "${subj.name}"? This will delete scores recorded under this subject.`
                          )
                        ) {
                          onDeleteSubject(subj.id);
                        }
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingClass ? 'Edit Class Details' : 'Add New Class'}
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClassSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary 5 Emerald, Grade 6, JSS 1 Gold"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section / Level
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nursery, Primary School, Junior Secondary"
                  value={classForm.section}
                  onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Teacher's Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Emmanuel Okon"
                  value={classForm.classTeacher}
                  onChange={(e) => setClassForm({ ...classForm, classTeacher: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClass ? 'Update Class' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, English Language, Physics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MTH, ENG, BST"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Classes
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Leave all unchecked to make this subject applicable to ALL classes.
                </p>
                <div className="space-y-2 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
                  {classes.map((cls) => {
                    const isChecked = subjectForm.classIds.includes(cls.id);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => toggleClassForSubject(cls.id)}
                        className="flex items-center space-x-2 text-xs text-slate-800 cursor-pointer select-none hover:text-indigo-600"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{cls.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSubject ? 'Update Subject' : 'Create Subject'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
