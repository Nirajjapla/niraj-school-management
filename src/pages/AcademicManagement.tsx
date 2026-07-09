import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Layers, PlusCircle, Edit, Check, X } from 'lucide-react';
import { classApi } from '../services/api';

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

const AcademicManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Editing state for classes and sections
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

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

  useEffect(() => {
    fetchAcademicData();
  }, []);

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

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Management</h1>
          <p className="text-gray-600">Configure classes and sections before enrolling students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classes Card */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[600px]">
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
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[600px]">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-600" />
            <span>Sections for {selectedClass ? selectedClass.name : 'Selected Class'}</span>
          </h2>

          {selectedClass ? (
            <>
              <form onSubmit={handleCreateSection} className="flex gap-2 mb-6 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. A, B, or Delta"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none text-sm"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition text-sm font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </form>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedClass.sections?.map((sec) => (
                    <div
                      key={sec.id}
                      className="border border-gray-100 bg-gray-50 rounded-xl p-4 flex items-center justify-between h-[64px]"
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
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
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
                    <div className="col-span-full text-center py-12 text-gray-400 text-sm">
                      No sections registered for this class. Add one above.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <BookOpen className="w-12 h-12 mb-2 stroke-1" />
              <p className="text-sm">Please select or create a class to manage its sections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicManagement;
