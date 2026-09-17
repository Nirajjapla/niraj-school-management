"use client"

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, DollarSign, Layers, TrendingUp, Info, Copy, CheckSquare, Square } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { FeeStructure, FeeComponent, FeeComponentCode } from '../services/centralData';
import { formatRupee } from '../styles/colors';

const prePrimaryClasses = ['Nursery', 'LKG', 'UKG'];
const primaryAndSecClasses = Array.from({ length: 12 }, (_, i) => String(i + 1));
const allClasses = [...prePrimaryClasses, ...primaryAndSecClasses];

// Fee component templates
const feeComponentTemplates: Record<FeeComponentCode, { name: string; description: string; default: number }> = {
  TUITION: { name: 'Tuition Fee', description: 'Core academic instruction fee', default: 2000 },
  ANNUAL: { name: 'Annual Function Fee', description: 'School annual day and events', default: 500 },
  LAB: { name: 'Laboratory Fee', description: 'Science/Computer lab usage', default: 300 },
  LIBRARY: { name: 'Library Fee', description: 'Library and book usage', default: 150 },
  SPORTS: { name: 'Sports Fee', description: 'Sports and games activities', default: 250 },
  COMPUTER: { name: 'Computer Fee', description: 'Computer lab and IT education', default: 400 },
  EXAM: { name: 'Examination Fee', description: 'Internal and external exams', default: 200 },
  CAMPUS_DEV: { name: 'Campus Development Fee', description: 'Infrastructure maintenance', default: 300 },
  TRANSPORT: { name: 'Transportation Fee', description: 'School bus service (Optional)', default: 1500 },
  OTHER: { name: 'Other Fee', description: 'Miscellaneous charges', default: 100 }
};

interface FeeStructureEditorState {
  id: string;
  className: string;
  category: 'normal' | 'reservation';
  collectionFrequency: 'Monthly' | 'Quarterly' | 'Annually';
  dueDayOfMonth: number;
  graceDays: number;
  lateFeeFixedAmount: number;
  components: FeeComponent[];
}

const FeeStructureManagement: React.FC = () => {
  const { feeStructures = [], addFeeStructure, updateFeeStructure, deleteFeeStructure } = useData();

  const [showModal, setShowModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneSourceClass, setCloneSourceClass] = useState<string>('Nursery');
  const [cloneTargetClasses, setCloneTargetClasses] = useState<string[]>([]);
  const [cloneCategoryScope, setCloneCategoryScope] = useState<'both' | 'normal' | 'reservation'>('both');

  const [expandedStructureId, setExpandedStructureId] = useState<string | null>(null);
  const [editingStructure, setEditingStructure] = useState<FeeStructureEditorState | null>(null);
  
  const [formData, setFormData] = useState<Partial<FeeStructureEditorState>>({
    className: 'Nursery',
    category: 'normal',
    collectionFrequency: 'Monthly',
    dueDayOfMonth: 10,
    graceDays: 5,
    lateFeeFixedAmount: 250,
    components: []
  });

  const [newComponentCode, setNewComponentCode] = useState<FeeComponentCode>('TUITION');
  const [newComponentAmount, setNewComponentAmount] = useState('');
  const [newComponentFrequency, setNewComponentFrequency] = useState<'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly'>('Monthly');
  const [newComponentOptional, setNewComponentOptional] = useState(false);

  const handleToggleCloneTargetClass = (cls: string) => {
    setCloneTargetClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const handleSelectAllTargets = () => {
    const targets = allClasses.filter(c => c !== cloneSourceClass);
    if (cloneTargetClasses.length === targets.length) {
      setCloneTargetClasses([]);
    } else {
      setCloneTargetClasses(targets);
    }
  };

  const handleExecuteBulkClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloneTargetClasses.length === 0) {
      alert('Please select at least one target class to replicate the fee structure.');
      return;
    }

    const sourceStructures = feeStructures.filter(fs => fs.className === cloneSourceClass);
    if (sourceStructures.length === 0) {
      alert(`No fee structures found for source class ${cloneSourceClass}. Please configure it first.`);
      return;
    }

    let clonedCount = 0;
    cloneTargetClasses.forEach(targetClass => {
      sourceStructures.forEach(src => {
        if (cloneCategoryScope === 'both' || cloneCategoryScope === src.category) {
          const existing = feeStructures.find(fs => fs.className === targetClass && fs.category === src.category);
          const clonedComponents: FeeComponent[] = (src.components || []).map(comp => ({
            ...comp,
            id: `fc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          }));

          const newStruct: FeeStructure = {
            id: existing ? existing.id : `fs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            className: targetClass,
            category: src.category,
            collectionFrequency: src.collectionFrequency,
            compositeFee: src.compositeFee,
            lateFeeFixedAmount: src.lateFeeFixedAmount,
            dueDayOfMonth: src.dueDayOfMonth,
            graceDays: src.graceDays,
            components: clonedComponents
          };

          if (existing) {
            updateFeeStructure(newStruct);
          } else {
            addFeeStructure(newStruct);
          }
          clonedCount++;
        }
      });
    });

    alert(`Successfully cloned fee structures to ${cloneTargetClasses.length} classes (${clonedCount} structure configurations updated)!`);
    setShowCloneModal(false);
    setCloneTargetClasses([]);
  };

  const handleOpenModal = (structure?: FeeStructure) => {
    if (structure) {
      setEditingStructure(structure as FeeStructureEditorState);
      setFormData(structure);
    } else {
      setEditingStructure(null);
      setFormData({
        className: 'Nursery',
        category: 'normal',
        collectionFrequency: 'Monthly',
        dueDayOfMonth: 10,
        graceDays: 5,
        lateFeeFixedAmount: 250,
        components: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStructure(null);
    setFormData({
      className: 'Nursery',
      category: 'normal',
      collectionFrequency: 'Monthly',
      dueDayOfMonth: 10,
      graceDays: 5,
      lateFeeFixedAmount: 250,
      components: []
    });
    setNewComponentCode('TUITION');
    setNewComponentAmount('');
    setNewComponentFrequency('Monthly');
    setNewComponentOptional(false);
  };

  const handleAddComponent = () => {
    if (!newComponentAmount) return;

    const template = feeComponentTemplates[newComponentCode];
    const comp: FeeComponent = {
      id: `fc-${Date.now()}`,
      code: newComponentCode,
      name: template.name,
      amount: parseFloat(newComponentAmount) || template.default,
      frequency: newComponentFrequency,
      isOptional: newComponentOptional,
      description: template.description
    };

    setFormData(prev => ({
      ...prev,
      components: [...(prev.components || []), comp]
    }));

    setNewComponentCode('TUITION');
    setNewComponentAmount('');
    setNewComponentFrequency('Monthly');
    setNewComponentOptional(false);
  };

  const handleRemoveComponent = (id: string) => {
    setFormData(prev => ({
      ...prev,
      components: (prev.components || []).filter(c => c.id !== id)
    }));
  };

  const handleSaveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.className || !formData.category || !formData.collectionFrequency) return;

    const structure: FeeStructure = {
      id: editingStructure?.id || `fs-${Date.now()}`,
      className: formData.className,
      category: formData.category as 'normal' | 'reservation',
      collectionFrequency: formData.collectionFrequency as 'Monthly' | 'Quarterly' | 'Annually',
      compositeFee: 0, // Will be calculated
      components: formData.components || [],
      lateFeeFixedAmount: formData.lateFeeFixedAmount || 250,
      dueDayOfMonth: formData.dueDayOfMonth || 10,
      graceDays: formData.graceDays || 5
    };

    if (editingStructure) {
      updateFeeStructure(structure);
    } else {
      addFeeStructure(structure);
    }

    handleCloseModal();
  };

  const handleDeleteStructure = (id: string) => {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      deleteFeeStructure(id);
      if (expandedStructureId === id) {
        setExpandedStructureId(null);
      }
    }
  };

  // Group structures by class and category
  const groupedStructures = allClasses.reduce((acc, className) => {
    acc[className] = {
      normal: feeStructures.find(fs => fs.className === className && fs.category === 'normal'),
      reservation: feeStructures.find(fs => fs.className === className && fs.category === 'reservation')
    };
    return acc;
  }, {} as Record<string, { normal?: FeeStructure; reservation?: FeeStructure }>);

  const calculateTotalFee = (components: FeeComponent[], frequency: string) => {
    return components
      .filter(c => {
        if (frequency === 'Monthly') return c.frequency === 'Monthly';
        if (frequency === 'Quarterly') return ['Monthly', 'Quarterly'].includes(c.frequency);
        return true; // Annually includes all
      })
      .reduce((sum, c) => {
        if (c.frequency === 'Monthly') return sum + c.amount;
        if (c.frequency === 'Quarterly') return sum + (c.amount / 3);
        if (c.frequency === 'Half yearly') return sum + (c.amount / 6);
        return sum + (c.amount / 12);
      }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Structure Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Configure detailed fee structures for all classes with multiple components
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCloneTargetClasses([]);
              setShowCloneModal(true);
            }}
            className="px-4 py-2.5 border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Bulk Clone Structure
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20 w-fit"
          >
            <Plus className="w-4 h-4" />
            Add Fee Structure
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">Fee Structure Components</p>
          <p className="text-xs opacity-90">Define detailed fee breakdowns for each class and student category. Components can be mandatory or optional, and charged at different frequencies.</p>
        </div>
      </div>

      {/* Fee Structures by Class */}
      <div className="space-y-4">
        {allClasses.map((className) => (
          <div key={className} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            {/* Class Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-6 py-4 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Class {className}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Normal & Reservation Student Categories</p>
            </div>

            {/* Class Content */}
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {(['normal', 'reservation'] as const).map((category) => {
                const structure = groupedStructures[className]?.[category];
                const isExpanded = expandedStructureId === `${className}-${category}`;

                return (
                  <div key={`${className}-${category}`} className="p-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            category === 'normal'
                              ? 'bg-blue-500 dark:bg-blue-400'
                              : 'bg-purple-500 dark:bg-purple-400'
                          }`}
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category === 'normal' ? 'Normal Students' : 'Reservation / Concession Students'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {structure && (
                          <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                            Configured
                          </span>
                        )}

                        {structure ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setExpandedStructureId(isExpanded ? null : `${className}-${category}`)
                              }
                              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenModal(structure)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition text-blue-600 dark:text-blue-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStructure(structure.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFormData({
                                className,
                                category,
                                collectionFrequency: 'Monthly',
                                dueDayOfMonth: 10,
                                graceDays: 5,
                                lateFeeFixedAmount: 250,
                                components: []
                              });
                              setEditingStructure(null);
                              setShowModal(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && structure && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 space-y-4">
                        {/* Structure Summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Collection</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{structure.collectionFrequency}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Due Day</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{structure.dueDayOfMonth}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Grace Days</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{structure.graceDays || 0}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Late Fee</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatRupee(structure.lateFeeFixedAmount)}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Components</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{structure.components.length}</p>
                          </div>
                        </div>

                        {/* Fee Components Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-100 dark:border-slate-800">
                                <th className="text-left font-semibold text-gray-600 dark:text-slate-300 py-2 px-3">Component</th>
                                <th className="text-left font-semibold text-gray-600 dark:text-slate-300 py-2 px-3">Amount</th>
                                <th className="text-left font-semibold text-gray-600 dark:text-slate-300 py-2 px-3">Frequency</th>
                                <th className="text-left font-semibold text-gray-600 dark:text-slate-300 py-2 px-3">Type</th>
                                <th className="text-left font-semibold text-gray-600 dark:text-slate-300 py-2 px-3">Monthly</th>
                              </tr>
                            </thead>
                            <tbody>
                              {structure.components.map((comp) => (
                                <tr key={comp.id} className="border-b border-gray-50 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-800/40">
                                  <td className="py-2.5 px-3">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{comp.name}</p>
                                      <p className="text-xs text-gray-500 dark:text-slate-400">{comp.description}</p>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                                    {formatRupee(comp.amount)}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600 dark:text-slate-400">{comp.frequency}</td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded ${
                                        comp.isOptional
                                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                      }`}
                                    >
                                      {comp.isOptional ? 'Optional' : 'Mandatory'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">
                                    {formatRupee(
                                      comp.frequency === 'Monthly'
                                        ? comp.amount
                                        : comp.frequency === 'Quarterly'
                                        ? comp.amount / 3
                                        : comp.frequency === 'Half yearly'
                                        ? comp.amount / 6
                                        : comp.amount / 12
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Fee Totals */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Monthly Total</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
                              {formatRupee(calculateTotalFee(structure.components, 'Monthly'))}
                            </p>
                          </div>
                          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-3">
                            <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Quarterly Total</p>
                            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                              {formatRupee(calculateTotalFee(structure.components, 'Quarterly'))}
                            </p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3">
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">Yearly Total</p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1">
                              {formatRupee(calculateTotalFee(structure.components, 'Annually'))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Not Configured State */}
                    {!structure && (
                      <div className="text-center py-4 text-gray-500 dark:text-slate-400">
                        <p className="text-sm">Fee structure not configured for {category === 'normal' ? 'normal' : 'reservation'} students</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingStructure ? 'Edit' : 'Create'} Fee Structure
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="p-6 space-y-6">
              {/* Class & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Class
                  </label>
                  <select
                    value={formData.className || ''}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    disabled={!!editingStructure}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-60"
                  >
                    {allClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'normal' | 'reservation' })}
                    disabled={!!editingStructure}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-60"
                  >
                    <option value="normal">Normal Student</option>
                    <option value="reservation">Reservation / Concession</option>
                  </select>
                </div>
              </div>

              {/* Collection Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Collection Frequency
                  </label>
                  <select
                    value={formData.collectionFrequency || ''}
                    onChange={(e) => setFormData({ ...formData, collectionFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Due Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDayOfMonth || ''}
                    onChange={(e) => setFormData({ ...formData, dueDayOfMonth: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Grace Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.graceDays || ''}
                    onChange={(e) => setFormData({ ...formData, graceDays: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Late Fee (Fixed)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lateFeeFixedAmount || ''}
                    onChange={(e) => setFormData({ ...formData, lateFeeFixedAmount: parseInt(e.target.value) || 250 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Fee Components Section */}
              <div className="border-t border-gray-200 dark:border-slate-800 pt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#4e74f9]" />
                  Fee Components
                </h3>

                {/* Add Component */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                        Component Type
                      </label>
                      <select
                        value={newComponentCode}
                        onChange={(e) => setNewComponentCode(e.target.value as FeeComponentCode)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(feeComponentTemplates).map(([code, template]) => (
                          <option key={code} value={code}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        placeholder={String(feeComponentTemplates[newComponentCode].default)}
                        value={newComponentAmount}
                        onChange={(e) => setNewComponentAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                        Frequency
                      </label>
                      <select
                        value={newComponentFrequency}
                        onChange={(e) => setNewComponentFrequency(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half yearly">Half Yearly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition h-full">
                        <input
                          type="checkbox"
                          checked={newComponentOptional}
                          onChange={(e) => setNewComponentOptional(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300 whitespace-nowrap">Optional</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddComponent}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 h-full"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    {feeComponentTemplates[newComponentCode].description}
                  </p>
                </div>

                {/* Components List */}
                <div className="space-y-2">
                  {(formData.components || []).length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-slate-400">
                      <p className="text-sm">No components added yet. Add components to complete the fee structure.</p>
                    </div>
                  ) : (
                    (formData.components || []).map((comp) => (
                      <div key={comp.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{comp.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {formatRupee(comp.amount)} • {comp.frequency} •{' '}
                            {comp.isOptional ? 'Optional' : 'Mandatory'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(comp.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingStructure ? 'Update' : 'Create'} Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Clone Structure Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Bulk Clone Fee Structure</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Replicate fee components and settings to multiple classes</p>
                </div>
              </div>
              <button onClick={() => setShowCloneModal(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkClone} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Source Class (Copy From)
                </label>
                <select
                  value={cloneSourceClass}
                  onChange={(e) => setCloneSourceClass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  {allClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Category Scope
                </label>
                <select
                  value={cloneCategoryScope}
                  onChange={(e) => setCloneCategoryScope(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="both">Both Normal & Reservation / Concession</option>
                  <option value="normal">Normal Students Only</option>
                  <option value="reservation">Reservation Students Only</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    Target Destination Classes ({cloneTargetClasses.length} selected)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllTargets}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {cloneTargetClasses.length === allClasses.filter(c => c !== cloneSourceClass).length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  {allClasses
                    .filter(c => c !== cloneSourceClass)
                    .map(cls => {
                      const isChecked = cloneTargetClasses.includes(cls);
                      return (
                        <button
                          type="button"
                          key={cls}
                          onClick={() => handleToggleCloneTargetClass(cls)}
                          className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition ${
                            isChecked
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-purple-300'
                          }`}
                        >
                          <span className="truncate">Class {cls}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCloneModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cloneTargetClasses.length === 0}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  Clone & Apply Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeStructureManagement;
