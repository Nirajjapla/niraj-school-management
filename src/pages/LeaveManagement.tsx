import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Calendar,
  Layers,
  History,
  X,
  Sliders,
  ChevronDown,
  UserCheck,
  Save,
  CheckCircle2,
  User,
  Clock,
  FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { LeaveRequest } from '../services/centralData';

interface RoleLeaveQuota {
  casual: number;
  sick: number;
  earned: number;
  maternity: number;
}

const FormSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
  </section>
);

const LeaveSection: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-gray-500 dark:text-slate-400" />
      {title}
    </h3>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
  </section>
);

const LeaveDetail: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth }) => (
  <div className={fullWidth ? 'sm:col-span-2' : undefined}>
    <dt className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-white break-words">{children || '—'}</dd>
  </div>
);

const LeaveManagement: React.FC = () => {
  const { leaves, employees, applyLeave, approveLeave, rejectLeave } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'history'>('requests');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Searchable Employee Popover in Apply Modal
  const [empSearch, setEmpSearch] = useState('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);

  // Quota Configurations State
  const [quotas, setQuotas] = useState<Record<'teacher' | 'admin' | 'support', RoleLeaveQuota>>({
    teacher: { casual: 12, sick: 10, earned: 15, maternity: 180 },
    admin: { casual: 15, sick: 12, earned: 20, maternity: 180 },
    support: { casual: 10, sick: 8, earned: 10, maternity: 180 }
  });
  const [quotaSuccessMsg, setQuotaSuccessMsg] = useState<string | null>(null);

  // New leave form
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'Casual Leave' as 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave',
    isPaid: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    reason: ''
  });

  const selectedEmp = employees.find(e => e.id === leaveFormData.employeeId) || employees[0];

  const filteredEmployeesForDropdown = employees.filter(emp =>
    emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    (emp.code && emp.code.toLowerCase().includes(empSearch.toLowerCase())) ||
    (emp.designation && emp.designation.toLowerCase().includes(empSearch.toLowerCase())) ||
    emp.role.toLowerCase().includes(empSearch.toLowerCase())
  );

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = [
      leave.employeeName,
      leave.employeeRole,
      leave.designation || '',
      leave.leaveType,
      leave.reason
    ]
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = !filterType || leave.leaveType === filterType;
    const matchesStatus = !filterStatus || leave.status === filterStatus;
    
    const matchesDateRange =
      (!filterStartDate || leave.startDate >= filterStartDate || leave.endDate >= filterStartDate) &&
      (!filterEndDate || leave.startDate <= filterEndDate || leave.endDate <= filterEndDate);

    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  });

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'pending');
  const pastLeaves = filteredLeaves.filter(l => l.status !== 'pending');

  const handleOpenReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave || !rejectionReason.trim()) {
      alert('Please provide a valid reason for rejection.');
      return;
    }
    rejectLeave(selectedLeave.id, rejectionReason.trim());
    setShowRejectModal(false);
    setSelectedLeave(null);
  };

  const handleOpenView = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowViewModal(true);
  };

  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveFormData.employeeId) || employees[0];
    if (!emp || !leaveFormData.reason.trim()) {
      alert('Please fill all mandatory fields (Employee, Reason)');
      return;
    }

    applyLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      designation: emp.designation,
      leaveType: leaveFormData.leaveType,
      isPaid: leaveFormData.isPaid,
      startDate: leaveFormData.startDate,
      endDate: leaveFormData.endDate,
      daysCount: Math.max(1, leaveFormData.daysCount),
      reason: leaveFormData.reason.trim()
    });

    setShowApplyModal(false);
    setLeaveFormData({
      employeeId: employees[0]?.id || '',
      leaveType: 'Casual Leave',
      isPaid: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      daysCount: 1,
      reason: ''
    });
    setEmpSearch('');
  };

  const handleSaveQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    setQuotaSuccessMsg('Annual school leave quotas updated successfully for all staff categories.');
    setTimeout(() => {
      setQuotaSuccessMsg(null);
      setShowQuotaModal(false);
    }, 1500);
  };

  // Leave analytics
  const totalApplied = leaves.length;
  const totalApproved = leaves.filter(l => l.status === 'approved').length;
  const totalPaidLeaves = leaves.filter(l => l.isPaid).length;
  const totalUnpaidLeaves = leaves.filter(l => !l.isPaid).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage staff leave approvals, date range filters, category quotas, and paid/unpaid leave history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuotaModal(true)}
            className="px-4 py-2.5 border border-purple-300 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/40 transition flex items-center gap-2 shadow-sm"
          >
            <Sliders className="w-4 h-4" />
            <span>Leave Quota Settings</span>
          </button>

          <button
            onClick={() => {
              setEmpSearch('');
              setIsEmpDropdownOpen(false);
              setShowApplyModal(true);
            }}
            className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave for Employee</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'text-[#4e74f9] border-b-2 border-[#4e74f9] font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Requests</span>
          {pendingLeaves.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold">
              {pendingLeaves.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'balances'
              ? 'text-[#4e74f9] border-b-2 border-[#4e74f9] font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Quota & Balances</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 relative transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'text-[#4e74f9] border-b-2 border-[#4e74f9] font-bold'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Leave Audit History</span>
        </button>
      </div>

      {/* 1. Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filters and Date Range Search */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Search Employee / Reason
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name, role, reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Leave Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                >
                  <option value="">All Leave Types</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#4e74f9] dark:bg-slate-800 dark:text-white outline-none text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('');
                    setFilterStatus('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Date Range Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3.5 mt-3.5 border-t border-gray-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
                />
              </div>

              <div className="sm:col-span-2 flex items-center pt-5 text-xs text-gray-500 dark:text-slate-400">
                {(filterStartDate || filterEndDate) ? (
                  <span>Filtering leaves between <strong>{filterStartDate || 'Start'}</strong> and <strong>{filterEndDate || 'End'}</strong></span>
                ) : (
                  <span>Select dates to filter active and historical leave records.</span>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff Type & Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pay Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dates & Duration</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        {leave.employeeName}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span>{leave.designation || 'Staff'}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-400 block capitalize">
                          {leave.employeeRole === 'teacher' ? 'Teaching Staff' : leave.employeeRole === 'admin' ? 'Admin Staff' : 'Support Staff'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        {leave.leaveType}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            leave.isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {leave.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span>{leave.startDate} to {leave.endDate}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-400 block">
                          {leave.daysCount} day{leave.daysCount > 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal max-w-xs">
                        <p className="line-clamp-2">{leave.reason}</p>
                        {leave.rejectionReason && (
                          <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
                            Rejection: {leave.rejectionReason}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            leave.status === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : leave.status === 'rejected'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {leave.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenView(leave)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                            title="View Details"
                            aria-label={`View leave details for ${leave.employeeName}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {leave.status === 'pending' && (
                            <>
                              <button
                                onClick={() => approveLeave(leave.id)}
                                className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition"
                                title="Approve Leave"
                                aria-label={`Approve leave for ${leave.employeeName}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenReject(leave)}
                                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                                title="Reject with Reason"
                                aria-label={`Reject leave for ${leave.employeeName}`}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        No leave records found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Quota & Balances Tab */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                <span>Teaching Staff Quota</span>
                <span className="text-xs font-normal text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                  Annual Allotment
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Casual Leaves (CL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.teacher.casual} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Sick / Medical Leaves (SL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.teacher.sick} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Earned / Annual Leaves (EL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.teacher.earned} Days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 dark:text-slate-400">Maternity Leaves:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.teacher.maternity} Days</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                <span>Admin / Non-Teaching Quota</span>
                <span className="text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                  Annual Allotment
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Casual Leaves (CL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.admin.casual} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Sick / Medical Leaves (SL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.admin.sick} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Earned / Annual Leaves (EL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.admin.earned} Days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 dark:text-slate-400">Maternity Leaves:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.admin.maternity} Days</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5">
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                <span>Support & Fleet Staff Quota</span>
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Annual Allotment
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Casual Leaves (CL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.support.casual} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Sick / Medical Leaves (SL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.support.sick} Days</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800">
                  <span className="text-gray-500 dark:text-slate-400">Earned / Annual Leaves (EL):</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.support.earned} Days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 dark:text-slate-400">Maternity Leaves:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{quotas.support.maternity} Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Quota Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Employee Leave Balances</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Live remaining leave calculations per employee profile</p>
              </div>
              <button
                onClick={() => setShowQuotaModal(true)}
                className="text-xs text-[#4e74f9] hover:underline font-semibold"
              >
                Configure Quotas →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department & Role</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Casual (Left/Total)</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sick (Left/Total)</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Earned (Left/Total)</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Balance Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {employees.map(emp => {
                    const roleQuotas = quotas[emp.role] || quotas.teacher;
                    const clTotal = emp.leaveBalance?.casual?.total ?? roleQuotas.casual;
                    const clTaken = emp.leaveBalance?.casual?.taken ?? 0;
                    const clRemain = Math.max(0, clTotal - clTaken);

                    const slTotal = emp.leaveBalance?.sick?.total ?? roleQuotas.sick;
                    const slTaken = emp.leaveBalance?.sick?.taken ?? 0;
                    const slRemain = Math.max(0, slTotal - slTaken);

                    const elTotal = emp.leaveBalance?.earned?.total ?? roleQuotas.earned;
                    const elTaken = emp.leaveBalance?.earned?.taken ?? 0;
                    const elRemain = Math.max(0, elTotal - elTaken);

                    const totalRemain = clRemain + slRemain + elRemain;

                    return (
                      <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {emp.name}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {emp.department || 'Academics'} ({emp.role})
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {clRemain} / {clTotal}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {slRemain} / {slTotal}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {elRemain} / {elTotal}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-gray-700 dark:text-slate-300 font-normal">
                          {totalRemain} Days
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Leave Audit History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalApplied}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Approved Leaves</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalApproved}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">Paid Leaves Recorded</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{totalPaidLeaves}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400">Unpaid / LOP Leaves</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{totalUnpaidLeaves}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Complete Past Leave Audit History</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Historical log of approved, rejected, and completed leaves</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason / Remarks</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {pastLeaves.map(leave => (
                    <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{leave.employeeName}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{leave.leaveType}</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${leave.isPaid ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'}`}>
                          {leave.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">{leave.startDate} to {leave.endDate} ({leave.daysCount}d)</td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal max-w-xs">
                        <p>{leave.reason}</p>
                        {leave.rejectionReason && <p className="text-rose-600 dark:text-rose-400 text-xs mt-0.5">Rejected: {leave.rejectionReason}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${leave.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'}`}>
                          {leave.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {pastLeaves.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                        No past leave records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Quotas Configuration Modal */}
      {showQuotaModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Configure Annual Leave Quotas</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Set annual allowances per leave type across staff categories</p>
                </div>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowQuotaModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveQuotas} id="quota-form" className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
              {quotaSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{quotaSuccessMsg}</span>
                </div>
              )}

              {/* Teaching Staff Quota Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/60">
                <h4 className="text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-3">
                  Teaching Faculty Quota (Annual Days)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Casual (CL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.teacher.casual}
                      onChange={(e) => setQuotas({ ...quotas, teacher: { ...quotas.teacher, casual: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Sick (SL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.teacher.sick}
                      onChange={(e) => setQuotas({ ...quotas, teacher: { ...quotas.teacher, sick: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Earned (EL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.teacher.earned}
                      onChange={(e) => setQuotas({ ...quotas, teacher: { ...quotas.teacher, earned: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Maternity (ML)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.teacher.maternity}
                      onChange={(e) => setQuotas({ ...quotas, teacher: { ...quotas.teacher, maternity: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Staff Quota Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/60">
                <h4 className="text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-3">
                  Admin & Office Staff Quota (Annual Days)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Casual (CL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.admin.casual}
                      onChange={(e) => setQuotas({ ...quotas, admin: { ...quotas.admin, casual: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Sick (SL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.admin.sick}
                      onChange={(e) => setQuotas({ ...quotas, admin: { ...quotas.admin, sick: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Earned (EL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.admin.earned}
                      onChange={(e) => setQuotas({ ...quotas, admin: { ...quotas.admin, earned: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Maternity (ML)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.admin.maternity}
                      onChange={(e) => setQuotas({ ...quotas, admin: { ...quotas.admin, maternity: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Support Staff Quota Form */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/60">
                <h4 className="text-xs font-bold uppercase text-gray-700 dark:text-slate-300 mb-3">
                  Support, Security & Fleet Staff Quota (Annual Days)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Casual (CL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.support.casual}
                      onChange={(e) => setQuotas({ ...quotas, support: { ...quotas.support, casual: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Sick (SL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.support.sick}
                      onChange={(e) => setQuotas({ ...quotas, support: { ...quotas.support, sick: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Earned (EL)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.support.earned}
                      onChange={(e) => setQuotas({ ...quotas, support: { ...quotas.support, earned: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Maternity (ML)</label>
                    <input
                      type="number"
                      min={0}
                      value={quotas.support.maternity}
                      onChange={(e) => setQuotas({ ...quotas, support: { ...quotas.support, maternity: Number(e.target.value) } })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Fixed Footer */}
            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="quota-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                Save Quotas
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Reason Popup Modal */}
      {showRejectModal && selectedLeave && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Reject Leave Application
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
              Specify the reason for rejecting leave application of <span className="font-semibold text-gray-800 dark:text-slate-200">{selectedLeave.employeeName}</span> ({selectedLeave.leaveType}).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Rejection Reason / Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete syllabus schedule, staff shortage during examination, quota already exceeded."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Details Modal */}
      {showViewModal && selectedLeave && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLeave.employeeName}</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {selectedLeave.designation || 'Staff'} ({selectedLeave.employeeRole})
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              <LeaveSection title="Employee & Category" icon={User}>
                <LeaveDetail label="Employee Name">{selectedLeave.employeeName}</LeaveDetail>
                <LeaveDetail label="Role & Designation">{selectedLeave.designation || 'Staff'} ({selectedLeave.employeeRole})</LeaveDetail>
                <LeaveDetail label="Leave Type">{selectedLeave.leaveType}</LeaveDetail>
                <LeaveDetail label="Pay Classification">
                  <span className={`font-semibold ${selectedLeave.isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
                    {selectedLeave.isPaid ? 'Paid Leave' : 'Unpaid (Loss of Pay)'}
                  </span>
                </LeaveDetail>
              </LeaveSection>

              <LeaveSection title="Dates & Duration" icon={Clock}>
                <LeaveDetail label="Start Date">{selectedLeave.startDate}</LeaveDetail>
                <LeaveDetail label="End Date">{selectedLeave.endDate}</LeaveDetail>
                <LeaveDetail label="Total Duration">{selectedLeave.daysCount} Day{selectedLeave.daysCount > 1 ? 's' : ''}</LeaveDetail>
                <LeaveDetail label="Application Status">
                  <span className="font-semibold capitalize text-gray-900 dark:text-white">
                    {selectedLeave.status}
                  </span>
                </LeaveDetail>
              </LeaveSection>

              <LeaveSection title="Reason & Documentation" icon={FileText}>
                <LeaveDetail label="Application Reason" fullWidth>{selectedLeave.reason}</LeaveDetail>
                {selectedLeave.rejectionReason && (
                  <div className="sm:col-span-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                    <span className="font-bold block mb-0.5">Admin Rejection Remarks:</span>
                    {selectedLeave.rejectionReason}
                  </div>
                )}
              </LeaveSection>
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
            {/* Fixed Header */}
            <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply Leave on Behalf of Staff</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="text-red-500 font-semibold">*</span> Indicates required field
                </p>
              </div>
              <button
                aria-label="Close dialog"
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleApplyLeaveSubmit} id="apply-leave-form" className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
              {/* Section 1: Employee & Category */}
              <FormSection title="Employee & Category" icon={User}>
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Select Employee <span className="text-red-500">*</span>
                  </label>

                  {/* Selected Employee Trigger */}
                  <div
                    onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
                    className="w-full px-3.5 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-between cursor-pointer hover:border-[#4e74f9] transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <UserCheck className="w-4 h-4 text-[#4e74f9] shrink-0" />
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {selectedEmp?.name || 'Choose Employee'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-400 truncate">
                        ({selectedEmp?.code || ''} • {selectedEmp?.designation || ''})
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>

                  {/* Popover Dropdown Menu */}
                  {isEmpDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 p-2 max-h-60 overflow-hidden flex flex-col">
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search name, code, designation..."
                          value={empSearch}
                          onChange={(e) => setEmpSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-[#4e74f9]"
                          autoFocus
                        />
                      </div>

                      <div className="overflow-y-auto max-h-44 divide-y divide-gray-50 dark:divide-slate-800">
                        {filteredEmployeesForDropdown.map(emp => {
                          const isSelected = emp.id === leaveFormData.employeeId;
                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                setLeaveFormData({ ...leaveFormData, employeeId: emp.id });
                                setIsEmpDropdownOpen(false);
                              }}
                              className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between text-xs ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#4e74f9] font-bold'
                                  : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200'
                              }`}
                            >
                              <div>
                                <span className="font-semibold block">{emp.name}</span>
                                <span className="text-[11px] text-gray-400 dark:text-slate-400">
                                  {emp.code} • {emp.designation} ({emp.role})
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-gray-600 dark:text-slate-300">
                                CL: {emp.leaveBalance?.casual?.total ?? 12}d
                              </span>
                            </div>
                          );
                        })}

                        {filteredEmployeesForDropdown.length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">
                            No matching staff found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={leaveFormData.leaveType}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  >
                    <option value="Casual Leave">Casual Leave (CL)</option>
                    <option value="Sick Leave">Sick Leave (SL)</option>
                    <option value="Earned Leave">Earned Leave (EL)</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Pay Classification
                  </label>
                  <select
                    value={leaveFormData.isPaid ? 'true' : 'false'}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, isPaid: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                  >
                    <option value="true">Paid Leave</option>
                    <option value="false">Unpaid Leave (Loss of Pay)</option>
                  </select>
                </div>
              </FormSection>

              {/* Section 2: Dates & Duration */}
              <FormSection title="Dates & Duration" icon={Calendar}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Days Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={leaveFormData.daysCount}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, daysCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>
              </FormSection>

              {/* Section 3: Reason & Documentation */}
              <FormSection title="Reason & Documentation" icon={Layers}>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Reason for Leave <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                    placeholder="State the reason for leave..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                    required
                  />
                </div>
              </FormSection>
            </form>

            {/* Fixed Footer */}
            <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="apply-leave-form"
                className="px-5 py-2 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-500/20"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeaveManagement;
