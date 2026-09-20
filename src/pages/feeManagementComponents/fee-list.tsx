import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Sparkles,
  CreditCard,
  IndianRupee,
  Calendar,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { formatRupee } from '../../styles/colors';
import { StudentFeeRecord, FeeStructure, FeeComponent } from '../../services/centralData';
import PaymentModal from './payment-modal';

interface FeeListProps {
  onSelectFee: (feeId: string) => void;
  onShowStructureManagement?: () => void;
}

const prePrimaryClasses = ['Nursery', 'LKG', 'UKG'];

const FeeList: React.FC<FeeListProps> = ({ onSelectFee, onShowStructureManagement }) => {
  const {
    feeRecords,
    updateFeeStructure,
    addFeeStructure,
    recordPayment,
    overrideStudentFee
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentFee, setCurrentFee] = useState<StudentFeeRecord | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<StudentFeeRecord | null>(null);
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideRemarks, setOverrideRemarks] = useState('');

  // Fee Structure Editing state
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const [structureFormData, setStructureFormData] = useState<Partial<FeeStructure>>({
    className: 'Nursery',
    category: 'normal',
    collectionFrequency: 'Monthly',
    compositeFee: 3500,
    lateFeeFixedAmount: 250,
    dueDayOfMonth: 10,
    components: []
  });

  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentAmount, setNewComponentAmount] = useState('');
  const [newComponentFrequency, setNewComponentFrequency] = useState<'Monthly' | 'Quarterly' | 'Half yearly' | 'Yearly'>('Monthly');
  const [newComponentOptional, setNewComponentOptional] = useState(true);

  const itemsPerPage = 10;

  // Filtered list
  const filteredFees = useMemo(() => {
    return feeRecords.filter((fee) => {
      const matchesSearch =
        fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.feeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = !selectedClass || fee.class === selectedClass;
      const matchesSection = !selectedSection || fee.section === selectedSection;
      const matchesCategory = !selectedCategory || fee.category === selectedCategory;
      const matchesFrequency = !selectedFrequency || fee.collectionFrequency === selectedFrequency;

      return matchesSearch && matchesClass && matchesSection && matchesCategory && matchesFrequency;
    });
  }, [feeRecords, searchTerm, selectedClass, selectedSection, selectedCategory, selectedFrequency]);

  const paginatedFees = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredFees.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredFees, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredFees.length / itemsPerPage));

  // Aggregate totals
  const totalMonthlyFee = feeRecords.reduce((sum, fee) => sum + fee.monthlyFee, 0);
  const totalQuarterlyFee = feeRecords.reduce((sum, fee) => sum + fee.quarterlyFee, 0);
  const totalAnnualFee = feeRecords.reduce((sum, fee) => sum + fee.annualFee, 0);

  const totalCollected = feeRecords.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalOutstanding = feeRecords.reduce((sum, fee) => sum + Math.max(0, fee.totalAmount - fee.paidAmount), 0);

  const handlePayment = (fee: StudentFeeRecord) => {
    setCurrentFee(fee);
    setShowPaymentModal(true);
  };

  const handleOpenOverride = (fee: StudentFeeRecord) => {
    setSelectedStudentForOverride(fee);
    setOverrideAmount(fee.totalAmount.toString());
    setOverrideRemarks(fee.overrideRemarks || '');
    setShowOverrideModal(true);
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForOverride) return;
    const amount = parseFloat(overrideAmount);
    if (!isNaN(amount) && amount >= 0) {
      overrideStudentFee(selectedStudentForOverride.studentId, amount, overrideRemarks);
      setShowOverrideModal(false);
      setSelectedStudentForOverride(null);
    }
  };

  const handleSendReminders = () => {
    const pendingList = feeRecords.filter(f => f.status === 'pending' || f.status === 'overdue' || f.status === 'partial');
    alert(`Payment reminders sent successfully to ${pendingList.length} students/parents via SMS and Notification.`);
    setShowReminderModal(false);
  };

  const handleOpenStructureModal = (fs?: FeeStructure) => {
    if (fs) {
      setSelectedStructure(fs);
      setStructureFormData(fs);
    } else {
      setSelectedStructure(null);
      setStructureFormData({
        className: 'Nursery',
        category: 'normal',
        collectionFrequency: 'Monthly',
        compositeFee: 3500,
        lateFeeFixedAmount: 250,
        dueDayOfMonth: 10,
        components: [
          { id: 'fc-trans', name: 'Transportation Fee', amount: 1500, frequency: 'Monthly', isOptional: true, description: 'Optional bus service' }
        ]
      });
    }
    setShowStructureModal(true);
  };

  const handleAddStructureComponent = () => {
    if (!newComponentName || !newComponentAmount) return;
    const comp: FeeComponent = {
      id: `fc-${Date.now()}`,
      name: newComponentName,
      amount: parseFloat(newComponentAmount) || 0,
      frequency: newComponentFrequency,
      isOptional: newComponentOptional,
      description: `${newComponentOptional ? 'Optional' : 'Mandatory'} component`
    };
    setStructureFormData(prev => ({
      ...prev,
      components: [...(prev.components || []), comp]
    }));
    setNewComponentName('');
    setNewComponentAmount('');
  };

  const handleRemoveStructureComponent = (id: string) => {
    setStructureFormData(prev => ({
      ...prev,
      components: (prev.components || []).filter(c => c.id !== id)
    }));
  };

  const handleSaveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStructure) {
      updateFeeStructure({
        ...selectedStructure,
        ...structureFormData as FeeStructure
      });
    } else {
      addFeeStructure(structureFormData as FeeStructure);
    }
    setShowStructureModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Track student fee collection, configure fee structures, and manage student fee overrides
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onShowStructureManagement?.()}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 text-sm font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Settings className="w-4 h-4 text-[#4e74f9]" />
            Manage Fee Structures
          </button>

          <button
            onClick={() => setShowReminderModal(true)}
            className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Mail className="w-4 h-4" />
            Send Reminders
          </button>
        </div>
      </div>

      {/* 1. Total Fee Cards (Monthly, Quarterly, Annually & Collections) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4e74f9]" />
            Fee Projections as per School Collection Cycle
          </h2>
          <span className="text-xs text-gray-500 dark:text-slate-400">Currency: Indian Rupee (₹)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Monthly Fee</p>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#4e74f9]">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatRupee(totalMonthlyFee)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Sum of 1-month billings</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Quarterly Fee</p>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatRupee(totalQuarterlyFee)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Per quarter billing cycle</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Annual Fee</p>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{formatRupee(totalAnnualFee)}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Full academic year total</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Collected</p>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatRupee(totalCollected)}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Recorded payments</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Pending Dues</p>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{formatRupee(totalOutstanding)}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Outstanding collections</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Class (Pre-Primary to 12)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Classes</option>
              <optgroup label="Pre-Primary">
                {prePrimaryClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </optgroup>
              <optgroup label="Primary & Secondary">
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Student Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Categories</option>
              <option value="normal">Normal Student</option>
              <option value="reservation">Reservation Student</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
              Collection Cycle
            </label>
            <select
              value={selectedFrequency}
              onChange={(e) => {
                setSelectedFrequency(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
            >
              <option value="">All Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annually">Annually</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('');
                setSelectedSection('');
                setSelectedCategory('');
                setSelectedFrequency('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class & Section</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Amount</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Paid Amount</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Outstanding</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {paginatedFees.map((fee) => {
                const outstanding = Math.max(0, fee.totalAmount - fee.paidAmount);
                return (
                  <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                      <div>
                        <span className="text-gray-900 dark:text-white block">{fee.studentName}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">Type: Composite Fee</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                      Class {fee.class}-{fee.section}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          fee.category === 'reservation'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {fee.category === 'reservation' ? 'Reservation' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300 text-xs">
                      {fee.dueDate}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-normal text-gray-700 dark:text-slate-300">
                      {formatRupee(fee.totalAmount)}
                      {fee.overrideAmount && (
                        <span className="block text-[10px] text-purple-600 dark:text-purple-400">Overridden</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-normal text-gray-700 dark:text-slate-300">
                      {formatRupee(fee.paidAmount)}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-normal text-gray-700 dark:text-slate-300">
                      {formatRupee(outstanding)}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-gray-700 dark:text-slate-300">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          fee.status === 'paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : fee.status === 'partial'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : fee.status === 'overdue'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {fee.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {outstanding > 0 && (
                          <button
                            onClick={() => handlePayment(fee)}
                            className="px-2.5 py-1 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white text-xs font-medium rounded-lg transition flex items-center gap-1 shadow-sm"
                            title="Pay Now"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenOverride(fee)}
                          className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition"
                          title="Override Fee"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectFee(fee.id)}
                          className="p-1.5 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredFees.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredFees.length)} of {filteredFees.length} records
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-gray-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fee Structure Configuration Modal */}
      {showStructureModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Fee Structure Configuration
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Set Base Composite Fee, Student Categories, Fixed Late Fee, and Optional Components
                </p>
              </div>
              <button
                onClick={() => setShowStructureModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStructure} className="flex flex-col flex-1 min-h-0">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                  Required fields are marked with an asterisk (<span className="text-red-500">*</span>)
                </p>

                {/* Optional Explanation Banner */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">What is 'Optional' in Fee Component?</span>
                    <p className="mt-0.5 text-blue-700 dark:text-blue-300/90">
                      Optional components (such as Transportation, Cafeteria/Meals, Practical Labs, or Sports Daycare) can be toggled per student according to their actual enrollment, while the Composite Fee represents the mandatory base tuition.
                    </p>
                  </div>
                </div>

                {/* Section 1: Base Configuration */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    <span>Base Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Class (Pre-Primary to 12) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={structureFormData.className}
                        onChange={(e) => setStructureFormData({ ...structureFormData, className: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      >
                        <optgroup label="Pre-Primary">
                          {prePrimaryClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </optgroup>
                        <optgroup label="Primary & Secondary">
                          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(cls => (
                            <option key={cls} value={cls}>Class {cls}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Student Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={structureFormData.category}
                        onChange={(e) => setStructureFormData({ ...structureFormData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      >
                        <option value="normal">Normal Student</option>
                        <option value="reservation">Reservation / Concession Student</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Collection Cycle <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={structureFormData.collectionFrequency}
                        onChange={(e) => setStructureFormData({ ...structureFormData, collectionFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Composite Fee (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={structureFormData.compositeFee}
                        onChange={(e) => setStructureFormData({ ...structureFormData, compositeFee: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Fixed Late Fee (₹ Fixed Amount) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={structureFormData.lateFeeFixedAmount}
                        onChange={(e) => setStructureFormData({ ...structureFormData, lateFeeFixedAmount: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                        Monthly Due Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        value={structureFormData.dueDayOfMonth}
                        onChange={(e) => setStructureFormData({ ...structureFormData, dueDayOfMonth: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Fee Components & Add-ons */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Plus className="w-3.5 h-3.5 text-gray-400" />
                    <span>Fee Components & Optional Add-ons</span>
                  </div>

                  {/* Add new component form */}
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-1">Component Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Transport, Computer Lab"
                        value={newComponentName}
                        onChange={(e) => setNewComponentName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newComponentAmount}
                        onChange={(e) => setNewComponentAmount(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 dark:text-slate-300 mb-1">Frequency</label>
                      <select
                        value={newComponentFrequency}
                        onChange={(e) => setNewComponentFrequency(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white text-xs"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Half yearly">Half yearly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newComponentOptional}
                          onChange={(e) => setNewComponentOptional(e.target.checked)}
                          className="rounded text-[#4e74f9]"
                        />
                        <span>Optional</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddStructureComponent}
                        className="px-3 py-1.5 bg-[#4e74f9] text-white rounded-lg text-xs font-medium hover:bg-[#3d5fd8] transition flex items-center gap-1 shrink-0 ml-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* List of components */}
                  <div className="space-y-2">
                    {(structureFormData.components || []).map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">{comp.name}</span>
                          <span className="text-gray-500 dark:text-slate-400 ml-2">({comp.frequency})</span>
                          <span
                            className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                              comp.isOptional
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {comp.isOptional ? 'Optional' : 'Mandatory'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900 dark:text-white">{formatRupee(comp.amount)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStructureComponent(comp.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Student Fee Override Modal */}
      {showOverrideModal && selectedStudentForOverride && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Custom Student Fee Override
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  Override fee for {selectedStudentForOverride.studentName} (Class {selectedStudentForOverride.class}-{selectedStudentForOverride.section})
                </p>
              </div>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="flex flex-col flex-1 min-h-0">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  Required fields are marked with an asterisk (<span className="text-red-500">*</span>)
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                    <span>Override Details</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Custom Total Fee (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={overrideAmount}
                      onChange={(e) => setOverrideAmount(e.target.value)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Reason / Concession Justification <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={overrideRemarks}
                      onChange={(e) => setOverrideRemarks(e.target.value)}
                      placeholder="e.g. Sibling concession 10%, Principal scholarship, Special financial aid"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#4e74f9] text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Payment Modal */}
      {showPaymentModal && currentFee && (
        <PaymentModal
          fee={currentFee}
          studentName={currentFee.studentName}
          onClose={() => {
            setShowPaymentModal(false);
            setCurrentFee(null);
          }}
          onSubmit={(amount, remarks) => {
            recordPayment(currentFee.id, amount, remarks);
            setShowPaymentModal(false);
            setCurrentFee(null);
          }}
        />
      )}

      {/* Reminder Modal */}
      {showReminderModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Send Payment Reminders</h2>
              <button
                onClick={() => setShowReminderModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Are you sure you want to send automated payment reminders (SMS & in-app alerts) to all students with outstanding balances?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminders}
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition"
              >
                Send Reminders
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default FeeList;
