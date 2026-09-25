import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Calendar,
  X,
  User,
  Clock,
  FileText,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { LeaveRequest, LeaveType, LeaveStatus } from '../services/centralData';

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
  const { leaves, employees, applyLeave, approveLeave, rejectLeave, deleteLeave } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // New leave form state
  const [leaveFormData, setLeaveFormData] = useState<{
    employeeId: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string;
  }>({
    employeeId: employees[0]?.id || '',
    leaveType: 'Paid',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysCount: 1,
    reason: ''
  });

  const selectedEmp = employees.find(e => e.id === leaveFormData.employeeId) || employees[0];

  // Auto calculate days when dates change
  const handleDateChange = (start: string, end: string) => {
    let days = 1;
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      days = diffDays > 0 ? diffDays : 1;
    }
    setLeaveFormData(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      daysCount: days
    }));
  };

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

  const handleOpenReject = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave || !rejectionReason.trim()) {
      alert('Please provide a valid reason for rejection.');
      return;
    }
    await rejectLeave(selectedLeave.id, rejectionReason.trim());
    setShowRejectModal(false);
    setSelectedLeave(null);
  };

  const handleOpenView = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      await deleteLeave(id);
    }
  };

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === leaveFormData.employeeId) || employees[0];
    if (!emp || !leaveFormData.reason.trim()) {
      alert('Please fill all mandatory fields (Employee, Reason)');
      return;
    }

    await applyLeave({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeRole: emp.role,
      designation: emp.designation,
      leaveType: leaveFormData.leaveType,
      isPaid: leaveFormData.leaveType === 'Paid',
      startDate: leaveFormData.startDate,
      endDate: leaveFormData.endDate,
      daysCount: Math.max(1, leaveFormData.daysCount),
      reason: leaveFormData.reason.trim()
    });

    setShowApplyModal(false);
    setLeaveFormData({
      employeeId: employees[0]?.id || '',
      leaveType: 'Paid',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      daysCount: 1,
      reason: ''
    });
  };

  // Summary Metrics
  const totalLeaves = leaves.length;
  const paidLeavesCount = leaves.filter(l => l.leaveType === 'Paid' || l.isPaid).length;
  const unpaidLeavesCount = leaves.filter(l => l.leaveType === 'Unpaid' || !l.isPaid).length;
  const pendingLeavesCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage staff leave applications, track paid and unpaid requests, and process approvals
          </p>
        </div>

        <button
          onClick={() => {
            setLeaveFormData({
              employeeId: employees[0]?.id || '',
              leaveType: 'Paid',
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              daysCount: 1,
              reason: ''
            });
            setShowApplyModal(true);
          }}
          className="px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalLeaves}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#4e74f9]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Paid Leaves</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{paidLeavesCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Unpaid Leaves</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{unpaidLeavesCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingLeavesCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Single Unified Table: All Leaves */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Search & Filter Panel */}
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by employee name, role, reason..."
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
                <option value="Paid">Paid Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
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
          </div>

          {/* Date Range & Clear Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-3 border-t border-gray-100 dark:border-slate-800 items-end">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white outline-none text-sm"
              />
            </div>

            <div className="lg:col-span-2 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Showing {filteredLeaves.length} of {totalLeaves} leaves
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Unified Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Staff Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Leave Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Dates & Duration</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Applied Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredLeaves.map((leave) => {
                const isPaid = leave.leaveType === 'Paid' || leave.isPaid;
                return (
                  <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white block">{leave.employeeName}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-400">{leave.designation || 'Staff Member'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal capitalize">
                      {leave.employeeRole === 'teacher' ? 'Teaching Faculty' : leave.employeeRole === 'admin' ? 'Admin Staff' : 'Support Staff'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPaid
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        {isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                      <div>
                        <span>{leave.startDate} to {leave.endDate}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-400 block">
                          {leave.daysCount} day{leave.daysCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal">
                      {leave.appliedDate || '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-slate-300 font-normal max-w-xs">
                      <p className="line-clamp-2">{leave.reason}</p>
                      {leave.rejectionReason && (
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1">
                          Rejection: {leave.rejectionReason}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-normal">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          leave.status === 'approved'
                            ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                            : leave.status === 'rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenView(leave)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveLeave(leave.id, 'Admin')}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Approve Leave"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenReject(leave)}
                              className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Reject Leave"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Leave"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-500 dark:text-slate-400">
                    No leave applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
              {/* Fixed Header */}
              <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply Leave</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    <span className="text-red-500 font-semibold">*</span> Indicates required field
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleApplyLeaveSubmit} id="apply-leave-form" className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
                {/* Section 1: Employee Details */}
                <FormSection title="Employee Details" icon={User}>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Select Employee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={leaveFormData.employeeId}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                      required
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.code || emp.id}) — {emp.designation || emp.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEmp && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
                          Role
                        </label>
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 capitalize">
                          {selectedEmp.role} Staff
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1">
                          Designation
                        </label>
                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {selectedEmp.designation || 'Staff'}
                        </p>
                      </div>
                    </>
                  )}
                </FormSection>

                {/* Section 2: Leave & Duration Details */}
                <FormSection title="Leave & Duration Details" icon={Calendar}>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          leaveFormData.leaveType === 'Paid'
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="leaveType"
                          value="Paid"
                          checked={leaveFormData.leaveType === 'Paid'}
                          onChange={() => setLeaveFormData({ ...leaveFormData, leaveType: 'Paid' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-sm font-bold">Paid Leave</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Regular entitled leave with full pay</p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          leaveFormData.leaveType === 'Unpaid'
                            ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'
                            : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="leaveType"
                          value="Unpaid"
                          checked={leaveFormData.leaveType === 'Unpaid'}
                          onChange={() => setLeaveFormData({ ...leaveFormData, leaveType: 'Unpaid' })}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="text-sm font-bold">Unpaid Leave</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">Loss of pay leave application</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveFormData.startDate}
                      onChange={(e) => handleDateChange(e.target.value, leaveFormData.endDate)}
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
                      onChange={(e) => handleDateChange(leaveFormData.startDate, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-[#4e74f9]/20 focus:border-[#4e74f9] dark:focus:border-blue-400 transition"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Total Leave Duration
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {leaveFormData.daysCount} Day{leaveFormData.daysCount > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {leaveFormData.startDate} to {leaveFormData.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Reason for Leave <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={leaveFormData.reason}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                      placeholder="Please explain the reason for the leave application..."
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

      {/* View Leave Details Modal */}
      {showViewModal && selectedLeave &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
              {/* Fixed Header */}
              <div className="shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#4e74f9]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedLeave.employeeName}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {selectedLeave.leaveType} Leave Application • Applied on {selectedLeave.appliedDate || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4 [&>section+section]:border-t [&>section+section]:border-gray-100 dark:[&>section+section]:border-slate-800 [&>section+section]:pt-4">
                <LeaveSection title="Employee Details" icon={User}>
                  <LeaveDetail label="Employee Name">{selectedLeave.employeeName}</LeaveDetail>
                  <LeaveDetail label="Employee Role">{selectedLeave.employeeRole} Staff</LeaveDetail>
                  <LeaveDetail label="Designation">{selectedLeave.designation || 'Staff'}</LeaveDetail>
                  <LeaveDetail label="Employee ID">{selectedLeave.employeeId}</LeaveDetail>
                </LeaveSection>

                <LeaveSection title="Leave & Duration Details" icon={Calendar}>
                  <LeaveDetail label="Leave Type">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLeave.leaveType === 'Paid' || selectedLeave.isPaid
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {selectedLeave.leaveType === 'Paid' || selectedLeave.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                  </LeaveDetail>
                  <LeaveDetail label="Status">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        selectedLeave.status === 'approved'
                          ? 'bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300'
                          : selectedLeave.status === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {selectedLeave.status}
                    </span>
                  </LeaveDetail>
                  <LeaveDetail label="Start Date">{selectedLeave.startDate}</LeaveDetail>
                  <LeaveDetail label="End Date">{selectedLeave.endDate}</LeaveDetail>
                  <LeaveDetail label="Total Duration">{selectedLeave.daysCount} Day(s)</LeaveDetail>
                  <LeaveDetail label="Applied Date">{selectedLeave.appliedDate || 'N/A'}</LeaveDetail>
                  <LeaveDetail label="Reason for Leave" fullWidth>{selectedLeave.reason}</LeaveDetail>
                  {selectedLeave.rejectionReason && (
                    <LeaveDetail label="Rejection Reason" fullWidth>
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        {selectedLeave.rejectionReason}
                      </span>
                    </LeaveDetail>
                  )}
                  {selectedLeave.approvedBy && (
                    <LeaveDetail label="Reviewed By">{selectedLeave.approvedBy}</LeaveDetail>
                  )}
                </LeaveSection>
              </div>

              {/* Fixed Footer */}
              <div className="shrink-0 flex items-center justify-between p-5 border-t border-gray-100 dark:border-slate-800">
                <div>
                  {selectedLeave.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await approveLeave(selectedLeave.id, 'Admin');
                          setShowViewModal(false);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleOpenReject(selectedLeave);
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
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

      {/* Reject Leave Modal */}
      {showRejectModal && selectedLeave &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span>Reject Leave Application</span>
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-300 mb-4">
                Specify the reason for rejecting the leave application of{' '}
                <strong>{selectedLeave.employeeName}</strong> ({selectedLeave.leaveType} Leave for {selectedLeave.daysCount} days).
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Inadequate department coverage on requested dates"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-medium transition shadow-md shadow-rose-500/20"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LeaveManagement;
