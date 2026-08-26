import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Printer,
  Users,
  X,
  Check,
  BarChart3,
} from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface StudentManagementProps {
  students: Student[];
  classes: ClassRoom[];
  onSaveStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToScores: (studentId?: string) => void;
  onNavigateToReport: (studentId: string) => void;
  onNavigateToAnalysis?: (studentId: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  classes,
  onSaveStudent,
  onDeleteStudent,
  onNavigateToScores,
  onNavigateToReport,
  onNavigateToAnalysis,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    fullName: string;
    admissionNo: string;
    classId: string;
    gender: 'Male' | 'Female';
    parentPhone: string;
    dateOfBirth: string;
  }>({
    fullName: '',
    admissionNo: '',
    classId: classes[0]?.id || '',
    gender: 'Male',
    parentPhone: '',
    dateOfBirth: '',
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      admissionNo: `SAC/${new Date().getFullYear()}/${String(students.length + 1).padStart(3, '0')}`,
      classId: selectedClassId !== 'all' ? selectedClassId : classes[0]?.id || '',
      gender: 'Male',
      parentPhone: '',
      dateOfBirth: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      admissionNo: student.admissionNo,
      classId: student.classId,
      gender: student.gender,
      parentPhone: student.parentPhone || '',
      dateOfBirth: student.dateOfBirth || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.admissionNo.trim()) return;

    const studentToSave: Student = {
      id: editingStudent ? editingStudent.id : `stu-${Date.now()}`,
      fullName: formData.fullName.trim(),
      admissionNo: formData.admissionNo.trim(),
      classId: formData.classId,
      gender: formData.gender,
      parentPhone: formData.parentPhone.trim(),
      dateOfBirth: formData.dateOfBirth,
    };

    onSaveStudent(studentToSave);
    setIsModalOpen(false);
  };

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [students, selectedClassId, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Student Directory
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Total: {students.length} Student(s)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Student Management</h2>
          <p className="text-sm text-slate-500">
            Register students, assign classes, and jump directly to score sheets or report cards.
          </p>
        </div>

        <button
          id="btn-add-new-student"
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by student name or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div>
          <select
            id="filter-students-by-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Classes ({students.length})</option>
            {classes.map((cls) => {
              const count = students.filter((s) => s.classId === cls.id).length;
              return (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Full Name</th>
                <th className="py-3 px-4 min-w-[130px]">Admission No</th>
                <th className="py-3 px-4 min-w-[150px]">Class</th>
                <th className="py-3 px-4 w-24">Gender</th>
                <th className="py-3 px-4 min-w-[130px]">Parent Phone</th>
                <th className="py-3 px-4 text-center min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No students match your search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => {
                  const studentClass = classes.find((c) => c.id === st.classId);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-xs font-medium text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600 font-semibold">
                        {st.admissionNo}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {studentClass?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {st.gender}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {st.parentPhone || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Jump to Scores */}
                          <button
                            onClick={() => onNavigateToScores(st.id)}
                            title="Enter / Edit Scores"
                            className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>

                          {/* Jump to Performance Analysis */}
                          {onNavigateToAnalysis && (
                            <button
                              onClick={() => onNavigateToAnalysis(st.id)}
                              title="Subject-wise Performance & Strengths/Weaknesses"
                              className="p-1.5 rounded text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Jump to Report Card */}
                          <button
                            onClick={() => onNavigateToReport(st.id)}
                            title="View & Print Report Card"
                            className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(st)}
                            title="Edit Student Info"
                            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete ${st.fullName}? This will also delete their score records.`
                                )
                              ) {
                                onDeleteStudent(st.id);
                              }
                            }}
                            title="Delete Student"
                            className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chisom David Eze"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAC/2025/009"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Class <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {classes.length === 0 ? (
                    <option value="">-- No Classes Created (Add Class First) --</option>
                  ) : (
                    classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))
                  )}
                </select>
                {classes.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    Please create at least one class in Classes & Subjects before adding students.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Phone</label>
                  <input
                    type="tel"
                    placeholder="08012345678"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudent ? 'Update Student' : 'Save Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
