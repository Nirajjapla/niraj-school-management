import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Layers, PlusCircle, Edit, Check, X, GraduationCap, Book } from 'lucide-react';
import { classApi, subjectApi, teacherApi } from '../services/api';

interface Section {
  id: number;
  class_id: number;
  name: string;
}

interface ClassData {
  id: number;
  name: string;
  sections?: Section[];
}

interface SubjectData {
  id: number;
  name: string;
  class_id: number;
  teacher_id?: number | null;
  section_id?: number | null;
  teacher?: {
    id: number;
    employee_code: string;
    user?: {
      id: number;
      name: string;
      email: string;
    }
  } | null;
  section?: {
    id: number;
    name: string;
  } | null;
}

interface TeacherData {
  id: number;
  employee_code: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const AcademicManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectTeacherId, setNewSubjectTeacherId] = useState<string>('');
  const [newSubjectSectionId, setNewSubjectSectionId] = useState<string>('');

  // Editing state for classes, sections, and subjects
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');
  const [editingSubjectTeacherId, setEditingSubjectTeacherId] = useState<string>('');
  const [editingSubjectSectionId, setEditingSubjectSectionId] = useState<string>('');

  const fetchAcademicData = async () => {
    try {
      setIsLoading(true);
      const classesData = await classApi.getClasses();
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch academic data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await teacherApi.getTeachers();
      setTeachers(data);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  };

  const fetchSubjects = async (classId: number) => {
    try {
      const data = await subjectApi.getSubjects(classId);
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  useEffect(() => {
    fetchAcademicData();
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchSubjects(selectedClassId);
    } else {
      setSubjects([]);
    }
  }, [selectedClassId]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const newClass = await classApi.createClass(newClassName.trim());
      setNewClassName('');
      await fetchAcademicData();
      setSelectedClassId(newClass.id);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create class');
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !selectedClassId) return;

    try {
      await classApi.createSection(selectedClassId, newSectionName.trim());
      setNewSectionName('');
      await fetchAcademicData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create section');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedClassId) return;

    try {
      const payload: any = {
        name: newSubjectName.trim(),
        class_id: selectedClassId
      };
      if (newSubjectTeacherId) {
        payload.teacher_id = Number(newSubjectTeacherId);
      }
      if (newSubjectSectionId) {
        payload.section_id = Number(newSubjectSectionId);
      }
      await subjectApi.createSubject(payload);
      setNewSubjectName('');
      setNewSubjectTeacherId('');
      setNewSubjectSectionId('');
      await fetchSubjects(selectedClassId);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create subject');
    }
  };

  const handleUpdateClass = async (id: number) => {
    if (!editingClassName.trim()) return;
    try {
      await classApi.updateClass(id, editingClassName.trim());
      setEditingClassId(null);
      setEditingClassName('');
      await fetchAcademicData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update class');
    }
  };

  const handleUpdateSection = async (id: number) => {
    if (!editingSectionName.trim()) return;
    try {
      await classApi.updateSection(id, editingSectionName.trim());
      setEditingSectionId(null);
      setEditingSectionName('');
      await fetchAcademicData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update section');
    }
  };

  const handleUpdateSubject = async (id: number) => {
    if (!editingSubjectName.trim() || !selectedClassId) return;
    try {
      const payload: any = {
        name: editingSubjectName.trim(),
        teacher_id: editingSubjectTeacherId ? Number(editingSubjectTeacherId) : null,
        section_id: editingSubjectSectionId ? Number(editingSubjectSectionId) : null
      };
      await subjectApi.updateSubject(id, payload);
      setEditingSubjectId(null);
      setEditingSubjectName('');
      setEditingSubjectTeacherId('');
      setEditingSubjectSectionId('');
      await fetchSubjects(selectedClassId);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update subject');
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class? This will delete all associated sections.')) {
      try {
        await classApi.deleteClass(id);
        if (selectedClassId === id) {
          setSelectedClassId(null);
        }
        await fetchAcademicData();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to delete class');
      }
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await classApi.deleteSection(id);
        await fetchAcademicData();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to delete section');
      }
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectApi.deleteSubject(id);
        if (selectedClassId) {
          await fetchSubjects(selectedClassId);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Failed to delete subject');
      }
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Management</h1>
          <p className="text-gray-600">Configure classes, sections, and subjects before enrolling students or managing timetables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[650px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4e74f9]" />
            <span>Classes</span>
          </h2>

          <form onSubmit={handleCreateClass} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Class 10"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-[#4e74f9] hover:bg-[#3b5ccc] text-white p-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                  selectedClassId === cls.id
                    ? 'bg-blue-50 text-[#4e74f9] border border-blue-100'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {editingClassId === cls.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingClassName}
                      onChange={(e) => setEditingClassName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-[#4e74f9]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateClass(cls.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => setEditingClassId(null)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-sm">{cls.name}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingClassId(cls.id);
                          setEditingClassName(cls.name);
                        }}
                        className="p-1 text-gray-400 hover:text-[#4e74f9] rounded-md transition hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClass(cls.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md transition hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {classes.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No classes defined yet. Add one above.
              </div>
            )}
          </div>
        </div>

        {/* Sections Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[650px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <span>Sections for {selectedClass ? selectedClass.name : 'Selected Class'}</span>
          </h2>

          {selectedClass ? (
            <>
              <form onSubmit={handleCreateSection} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="e.g. A, B, or Delta"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {selectedClass.sections?.map((sec) => (
                  <div
                    key={sec.id}
                    className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex items-center justify-between min-h-[56px]"
                  >
                    {editingSectionId === sec.id ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editingSectionName}
                          onChange={(e) => setEditingSectionName(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-green-600"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateSection(sec.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => setEditingSectionId(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                            {sec.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800 text-sm">Section {sec.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingSectionId(sec.id);
                              setEditingSectionName(sec.name);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 rounded-md transition hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md transition hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {(selectedClass.sections?.length === 0 || !selectedClass.sections) && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No sections registered for this class. Add one above.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Layers className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm">Please select or create a class to manage its sections</p>
            </div>
          )}
        </div>

        {/* Subjects Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[650px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-orange-500" />
            <span>Subjects for {selectedClass ? selectedClass.name : 'Selected Class'}</span>
          </h2>

          {selectedClass ? (
            <>
              <form onSubmit={handleCreateSubject} className="space-y-2 mb-6">
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={newSubjectSectionId}
                    onChange={(e) => setNewSubjectSectionId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm bg-white"
                  >
                    <option value="">All Sections</option>
                    {selectedClass.sections?.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newSubjectTeacherId}
                    onChange={(e) => setNewSubjectTeacherId(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm bg-white"
                  >
                    <option value="">Assign Teacher (Optional)</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user?.name || 'Unknown Teacher'} ({t.employee_code || t.id})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-gray-100 bg-gray-50 rounded-xl p-3 flex flex-col justify-between min-h-[72px]"
                  >
                    {editingSubjectId === sub.id ? (
                      <div className="space-y-2 w-full">
                        <input
                          type="text"
                          value={editingSubjectName}
                          onChange={(e) => setEditingSubjectName(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-orange-500"
                          autoFocus
                          required
                        />
                        <div className="flex gap-2 items-center">
                          <select
                            value={editingSubjectSectionId}
                            onChange={(e) => setEditingSubjectSectionId(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm outline-none bg-white focus:ring-1 focus:ring-orange-500"
                          >
                            <option value="">All Sections</option>
                            {selectedClass.sections?.map((sec) => (
                              <option key={sec.id} value={sec.id}>
                                Section {sec.name}
                              </option>
                            ))}
                          </select>
                          <select
                            value={editingSubjectTeacherId}
                            onChange={(e) => setEditingSubjectTeacherId(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm outline-none bg-white focus:ring-1 focus:ring-orange-500"
                          >
                            <option value="">No Teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.user?.name || 'Unknown Teacher'} ({t.employee_code || t.id})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateSubject(sub.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setEditingSubjectId(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start w-full">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                            <Book className="w-3.5 h-3.5 text-gray-400" />
                            {sub.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Section: {sub.section ? `Section ${sub.section.name}` : 'All Sections'}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            Teacher:{' '}
                            {sub.teacher
                              ? `${sub.teacher.user?.name || 'Unknown'} (${sub.teacher.employee_code || 'N/A'})`
                              : 'None Assigned'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingSubjectId(sub.id);
                              setEditingSubjectName(sub.name);
                              setEditingSubjectTeacherId(sub.teacher_id ? String(sub.teacher_id) : '');
                              setEditingSubjectSectionId(sub.section_id ? String(sub.section_id) : '');
                            }}
                            className="p-1 text-gray-400 hover:text-orange-500 rounded-md transition hover:bg-orange-50"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded-md transition hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {subjects.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    No subjects registered for this class. Add one above.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <GraduationCap className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm">Please select or create a class to manage its subjects</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicManagement;
