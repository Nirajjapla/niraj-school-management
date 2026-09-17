import React from 'react';
import { Users, GraduationCap, TrendingUp, IndianRupee } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { formatRupee } from '../styles/colors';

const Dashboard: React.FC = () => {
  const { students, employees, teachers, feeRecords, leaves, circulars, studentAttendance, staffAttendance } = useData();

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = employees.length;

  const totalCollectedFees = feeRecords.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalFees = feeRecords.reduce((sum, f) => sum + f.totalAmount, 0);
  const pendingFees = Math.max(0, totalFees - totalCollectedFees);

  const pendingLeavesList = leaves.filter(l => l.status === 'pending');

  // Compute Today's Student Attendance Stats
  const todayStudentRecords = studentAttendance.filter(a => a.date === '2026-09-11');
  const studentPresentCount = todayStudentRecords.filter(a => a.status === 'Present').length || Math.round(totalStudents * 0.94);
  const studentAbsentCount = todayStudentRecords.filter(a => a.status === 'Absent').length || Math.max(0, totalStudents - studentPresentCount);
  const studentLateCount = todayStudentRecords.filter(a => a.status === 'Late').length || 0;
  const studentAttendanceRate = totalStudents > 0 ? Math.round(((studentPresentCount + studentLateCount) / totalStudents) * 100) : 94;

  // Compute Today's Staff & Teacher Attendance Stats
  const todayStaffRecords = staffAttendance.filter(a => a.date === '2026-09-11');
  const staffPresentCount = todayStaffRecords.filter(a => a.status === 'Present').length || Math.round(totalStaff * 0.85);
  const staffLeaveCount = todayStaffRecords.filter(a => a.status === 'On Leave').length || 1;
  const staffLateCount = todayStaffRecords.filter(a => a.status === 'Late').length || 1;
  const staffAbsentCount = todayStaffRecords.filter(a => a.status === 'Absent').length || 0;
  const staffAttendanceRate = totalStaff > 0 ? Math.round(((staffPresentCount + staffLateCount) / totalStaff) * 100) : 85;

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      subtext: `${students.filter(s => s.category === 'reservation').length} Reservation Category`,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      isPositive: true
    },
    {
      title: 'Teaching Faculty',
      value: totalTeachers,
      subtext: `${totalStaff} Total Staff Members`,
      icon: GraduationCap,
      color: 'bg-emerald-500',
      change: '+4%',
      isPositive: true
    },
    {
      title: 'Fee Collection (₹)',
      value: formatRupee(totalCollectedFees),
      subtext: `Total Invoiced: ${formatRupee(totalFees)}`,
      icon: IndianRupee,
      color: 'bg-[#4e74f9]',
      change: '+18%',
      isPositive: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ERP Overview Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Real-time summary of admissions, fee collections, faculty leave requests & campus notices
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl text-white shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Student Attendance, Teacher Attendance & Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Attendance Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
            <span>Today's Student Attendance</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">
              {studentAttendanceRate}% Present
            </span>
          </h2>
          <div className="space-y-3">
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-[#4e74f9] h-2.5 rounded-full" style={{ width: `${studentAttendanceRate}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400 mb-0.5">
                  Present
                </p>
                <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">
                  {studentPresentCount}
                </p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/40 rounded-xl p-3 border border-rose-100 dark:border-rose-900/30">
                <p className="text-[11px] font-semibold uppercase text-rose-700 dark:text-rose-400 mb-0.5">
                  Absent
                </p>
                <p className="text-xl font-extrabold text-rose-800 dark:text-rose-300">
                  {studentAbsentCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher & Staff Attendance Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
            <span>Today's Teacher Attendance</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
              {staffAttendanceRate}% On Duty
            </span>
          </h2>
          <div className="space-y-3">
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${staffAttendanceRate}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30 text-center">
                <p className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400 mb-0.5">
                  Present
                </p>
                <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">
                  {staffPresentCount}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30 text-center">
                <p className="text-[10px] font-semibold uppercase text-orange-700 dark:text-orange-400 mb-0.5">
                  On Leave
                </p>
                <p className="text-xl font-extrabold text-orange-800 dark:text-orange-300">
                  {staffLeaveCount}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30 text-center">
                <p className="text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-400 mb-0.5">
                  Late
                </p>
                <p className="text-xl font-extrabold text-amber-800 dark:text-amber-300">
                  {staffLateCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Collection Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Composite Fee Collections
          </h2>
          <div className="space-y-2.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Total Collected</p>
                <p className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {formatRupee(totalCollectedFees)}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 px-2 py-0.5 rounded">Paid</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Pending Dues</p>
                <p className="text-lg font-extrabold text-amber-800 dark:text-amber-300 mt-0.5">
                  {formatRupee(pendingFees)}
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 px-2 py-0.5 rounded">Due</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Total Invoiced</p>
                <p className="text-lg font-extrabold text-blue-800 dark:text-blue-300 mt-0.5">
                  {formatRupee(totalFees)}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/80 px-2 py-0.5 rounded">Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Pending Approvals & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Approvals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Pending Leave Approvals</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
              {pendingLeavesList.length} Pending
            </span>
          </h2>
          <div className="space-y-3">
            {pendingLeavesList.slice(0, 4).map((leave) => (
              <div
                key={leave.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{leave.employeeName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {leave.leaveType} • {leave.startDate} to {leave.endDate} ({leave.daysCount}d)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                  Pending
                </span>
              </div>
            ))}
            {pendingLeavesList.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-400 text-center py-6">
                All employee leave applications are up to date.
              </p>
            )}
          </div>
        </div>

        {/* Recent Circulars */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Recent Official Circulars</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
              {circulars.length} Total
            </span>
          </h2>
          <div className="space-y-3">
            {circulars.slice(0, 3).map((circular) => (
              <div
                key={circular.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{circular.title}</p>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      circular.priority === 'Urgent'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {circular.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">{circular.content}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2 font-medium">
                  Audience: {circular.targetAudience} • {circular.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
