import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { studentApi, teacherApi, feeApi } from '../services/api';
import { mockLeaves, mockCirculars } from '../services/mockData';

const Dashboard: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [collectedFees, setCollectedFees] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  const pendingLeaves = mockLeaves.filter(leave => leave.status === 'pending').length;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const students = await studentApi.getStudents();
        const teachers = await teacherApi.getTeachers();
        const fees = await feeApi.getFees();

        const sCount = students.length;
        const tCount = teachers.length;

        const total = fees.reduce((sum: number, f: any) => sum + Number(f.amount), 0);
        const collected = fees.reduce((sum: number, f: any) => {
          if (f.status === 'paid') return sum + Number(f.amount);
          if (f.status === 'partial') return sum + (Number(f.amount) / 2);
          return sum;
        }, 0);

        setTotalStudents(sCount);
        setTotalStaff(tCount);
        setCollectedFees(collected);
        setTotalFees(total);
        setPendingFees(total - collected);

        const present = sCount > 0 ? Math.floor(sCount * 0.92) : 0;
        const absent = sCount - present;
        const pct = sCount > 0 ? Math.floor((present / sCount) * 100) : 0;

        setPresentToday(present);
        setAbsentToday(absent);
        setAttendancePercentage(pct);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchDashboardStats();
  }, []);

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+5%',
      isPositive: true
    },
    {
      title: 'Total Staff',
      value: totalStaff,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '+2%',
      isPositive: true
    },
    {
      title: 'Fees Collected',
      value: `$${collectedFees.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-[#4e74f9]',
      change: '+12%',
      isPositive: true
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">{stat.change}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Today's Attendance</span>
                <span className="text-sm font-medium text-gray-800">{attendancePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#4e74f9] h-3 rounded-full"
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-700 text-sm mb-1">Present</p>
                <p className="text-2xl font-bold text-green-800">{presentToday}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-red-700 text-sm mb-1">Absent</p>
                <p className="text-2xl font-bold text-red-800">{absentToday}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Fee Summary</h2>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-700 text-sm mb-1">Collected</p>
              <p className="text-xl font-bold text-green-800">${collectedFees.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-orange-700 text-sm mb-1">Pending</p>
              <p className="text-xl font-bold text-orange-800">${pendingFees.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-700 text-sm mb-1">Total</p>
              <p className="text-xl font-bold text-blue-800">${totalFees.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            {mockLeaves
              .filter(leave => leave.status === 'pending')
              .slice(0, 5)
              .map(leave => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{leave.userName}</p>
                    <p className="text-sm text-gray-600">
                      {leave.leaveType} - {leave.fromDate} to {leave.toDate}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            {pendingLeaves === 0 && (
              <p className="text-gray-500 text-center py-4">No pending approvals</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h2>
          <div className="space-y-3">
            {mockCirculars.slice(0, 5).map(circular => (
              <div key={circular.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-800">{circular.title}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    circular.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : circular.priority === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {circular.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{circular.content}</p>
                <p className="text-xs text-gray-500 mt-2">{circular.createdAt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
