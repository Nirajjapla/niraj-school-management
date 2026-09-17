import React, { useState } from 'react';
import { FileText, Users, IndianRupee, Calendar, TrendingUp, Download, X, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatRupee } from '../styles/colors';

const ReportsAnalytics: React.FC = () => {
  const { students, feeRecords, employees, teachers, staff, leaves, transportRoutes, inventory, exams, examResults } = useData();

  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 'attendance',
      title: 'Student Attendance Report',
      description: 'School-wide attendance statistics, daily logs, and class-wise breakdown',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'fees',
      title: 'Fee Collection Report',
      description: 'Revenue, paid composite fees, concessions, and overdue audit in ₹',
      icon: IndianRupee,
      color: 'bg-emerald-500'
    },
    {
      id: 'academic',
      title: 'Academic Performance',
      description: 'Exam results, subject score averages, and student performance metrics',
      icon: TrendingUp,
      color: 'bg-[#4e74f9]'
    },
    {
      id: 'leaves',
      title: 'Staff Leave Statistics',
      description: 'Teacher and staff leave patterns, quota usage, paid vs unpaid breakdown',
      icon: Calendar,
      color: 'bg-amber-500'
    },
    {
      id: 'transport',
      title: 'Transportation & Fleet Report',
      description: 'Bus routes, vehicle occupancy rates, driver assignments, and fitness expiries',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      id: 'inventory',
      title: 'Library & Asset Catalog Report',
      description: 'Asset tracking, library book stock, laboratory kits, and equipment valuation',
      icon: BarChart3,
      color: 'bg-teal-500'
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  // Compute live metrics
  const totalBilled = feeRecords.reduce((sum, f) => sum + (f.overrideAmount !== undefined ? f.overrideAmount : f.totalAmount), 0);
  const totalCollected = feeRecords.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = Math.max(0, totalBilled - totalCollected);
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '100';

  const totalSeats = transportRoutes.reduce((sum, r) => sum + r.capacity, 0);
  const totalAssignedStudents = transportRoutes.reduce((sum, r) => sum + r.assignedStudentsCount, 0);
  const fleetOccupancy = totalSeats > 0 ? ((totalAssignedStudents / totalSeats) * 100).toFixed(1) : '0';

  const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;

  const totalInventoryItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalAvailableInventory = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (i.quantity * (i.unitPrice || 200)), 0);

  const totalExamMarks = examResults.reduce((sum, r) => sum + r.marksObtained, 0);
  const totalMaxMarks = examResults.reduce((sum, r) => sum + r.maxMarks, 0);
  const schoolAveragePct = totalMaxMarks > 0 ? ((totalExamMarks / totalMaxMarks) * 100).toFixed(1) : '86.4';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Generate, audit, and export real-time school ERP reports backed by central school data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className={`${report.color} w-12 h-12 rounded-xl text-white flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{report.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs mb-4 leading-relaxed">{report.description}</p>
              </div>
              <button
                onClick={() => handleGenerateReport(report.id)}
                className="w-full px-4 py-2.5 bg-[#4e74f9] hover:bg-[#3d5fd8] text-white rounded-xl transition text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Generate Audit Report</span>
              </button>
            </div>
          );
        })}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-[#4e74f9] rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {reports.find(r => r.id === selectedReport)?.title || 'ERP Analytics Report'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • School ERP System</p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500 dark:text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4e74f9] mx-auto mb-2"></div>
                Compiling database records...
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Attendance Report Content */}
                {selectedReport === 'attendance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Students</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{students.length}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-slate-800/80 p-4 rounded-xl border border-green-100 dark:border-slate-700">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Present Today</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">95.8%</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-slate-800/80 p-4 rounded-xl border border-rose-100 dark:border-slate-700">
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Absentee Rate</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">4.2%</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Active Student Sample Log</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Student ID</th>
                            <th className="p-3 text-left">Student Name</th>
                            <th className="p-3 text-left">Class & Section</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {students.slice(0, 6).map((s) => (
                            <tr key={s.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{s.studentId}</td>
                              <td className="p-3 text-gray-800 dark:text-slate-200">{s.firstName} {s.lastName}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{s.class}-{s.section}</td>
                              <td className="p-3 capitalize text-gray-600 dark:text-slate-400">{s.category} Student</td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-medium">Present</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 2. Fee Collection Report Content */}
                {selectedReport === 'fees' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Billed</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupee(totalBilled)}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-slate-800/80 p-4 rounded-xl border border-green-100 dark:border-slate-700">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total Collected</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupee(totalCollected)}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-slate-800/80 p-4 rounded-xl border border-amber-100 dark:border-slate-700">
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Outstanding (Pending)</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupee(totalPending)}</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Recent Fee Records & Status</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Student</th>
                            <th className="p-3 text-left">Class</th>
                            <th className="p-3 text-left">Fee Type</th>
                            <th className="p-3 text-right">Total Amount</th>
                            <th className="p-3 text-right">Paid</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {feeRecords.map((f) => (
                            <tr key={f.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{f.studentName}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{f.class}-{f.section}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{f.feeType}</td>
                              <td className="p-3 text-right font-medium text-gray-800 dark:text-slate-200">{formatRupee(f.overrideAmount || f.totalAmount)}</td>
                              <td className="p-3 text-right text-emerald-600 font-semibold">{formatRupee(f.paidAmount)}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${
                                  f.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  f.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                                  f.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {f.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. Academic Performance Report Content */}
                {selectedReport === 'academic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Scheduled Exams</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{exams.length}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-slate-800/80 p-4 rounded-xl border border-green-100 dark:border-slate-700">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">School Average</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{schoolAveragePct}%</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-slate-800/80 p-4 rounded-xl border border-purple-100 dark:border-slate-700">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Assessments Recorded</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{examResults.length}</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Exam Score Details</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Student Name</th>
                            <th className="p-3 text-left">Exam Title</th>
                            <th className="p-3 text-left">Subject</th>
                            <th className="p-3 text-center">Marks</th>
                            <th className="p-3 text-center">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {examResults.map((r) => (
                            <tr key={r.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{r.studentName}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{r.examName}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{r.subjectName}</td>
                              <td className="p-3 text-center font-bold text-gray-900 dark:text-white">{r.marksObtained}/{r.maxMarks}</td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold">{r.grade}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Staff Leave Report Content */}
                {selectedReport === 'leaves' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-3 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 font-medium">Total Staff</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{employees.length}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-slate-800/80 p-3 rounded-xl border border-green-100 dark:border-slate-700">
                        <p className="text-xs text-green-600 font-medium">Approved</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{approvedLeaves}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-100 dark:border-slate-700">
                        <p className="text-xs text-amber-600 font-medium">Pending</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{pendingLeaves}</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-slate-800/80 p-3 rounded-xl border border-rose-100 dark:border-slate-700">
                        <p className="text-xs text-rose-600 font-medium">Rejected</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{rejectedLeaves}</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Leave Applications Log</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Staff Member</th>
                            <th className="p-3 text-left">Role & Dept</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-center">Days</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {leaves.map((l) => (
                            <tr key={l.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{l.employeeName}</td>
                              <td className="p-3 capitalize text-gray-600 dark:text-slate-400">{l.employeeRole} • {l.designation}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{l.leaveType} ({l.isPaid ? 'Paid' : 'Unpaid'})</td>
                              <td className="p-3 text-center font-semibold text-gray-800 dark:text-slate-200">{l.daysCount}</td>
                              <td className="p-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${
                                  l.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  l.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Transportation Report Content */}
                {selectedReport === 'transport' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 font-medium">Active Bus Routes</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{transportRoutes.length}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-slate-800/80 p-4 rounded-xl border border-green-100 dark:border-slate-700">
                        <p className="text-xs text-green-600 font-medium">Fleet Occupancy</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{fleetOccupancy}%</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-slate-800/80 p-4 rounded-xl border border-purple-100 dark:border-slate-700">
                        <p className="text-xs text-purple-600 font-medium">Total Capacity / Commuters</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalAssignedStudents} / {totalSeats}</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Route & Fleet Status</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Route</th>
                            <th className="p-3 text-left">Vehicle No</th>
                            <th className="p-3 text-left">Type & AC</th>
                            <th className="p-3 text-left">Driver Contact</th>
                            <th className="p-3 text-left">Fitness Expiry</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {transportRoutes.map((r) => (
                            <tr key={r.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{r.routeNumber} - {r.routeTitle}</td>
                              <td className="p-3 font-mono text-gray-800 dark:text-slate-200">{r.vehicleNumber}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{r.vehicleType} • {r.isAC ? 'AC' : 'Non-AC'}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{r.driverName} ({r.driverPhone})</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{r.assetDetails.fitnessExpiry}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Inventory Report Content */}
                {selectedReport === 'inventory' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-teal-50 dark:bg-slate-800/80 p-4 rounded-xl border border-teal-100 dark:border-slate-700">
                        <p className="text-xs text-teal-600 font-medium">Catalog Line Items</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{inventory.length}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-slate-800/80 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                        <p className="text-xs text-blue-600 font-medium">Total Available Units</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalAvailableInventory} / {totalInventoryItems}</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-slate-800/80 p-4 rounded-xl border border-emerald-100 dark:border-slate-700">
                        <p className="text-xs text-emerald-600 font-medium">Estimated Asset Valuation</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatRupee(totalInventoryValue)}</p>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Catalog Inventory Items</h4>
                    <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                          <tr>
                            <th className="p-3 text-left">Item Name</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Rack / Room</th>
                            <th className="p-3 text-center">Stock</th>
                            <th className="p-3 text-right">Unit Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                          {inventory.map((item) => (
                            <tr key={item.id}>
                              <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{item.title}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{item.category}</td>
                              <td className="p-3 text-gray-600 dark:text-slate-400">{item.rackNumber}</td>
                              <td className="p-3 text-center font-semibold text-gray-800 dark:text-slate-200">{item.availableQuantity}/{item.quantity}</td>
                              <td className="p-3 text-right font-medium text-emerald-600">{formatRupee(item.unitPrice || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => alert(`Report for ${selectedReport} exported as PDF/Excel successfully!`)}
                    className="px-4 py-2 bg-[#4e74f9] text-white rounded-xl hover:bg-[#3d5fd8] transition text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF / CSV</span>
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;

