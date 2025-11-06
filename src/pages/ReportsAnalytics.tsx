import React from 'react';
import { FileText, Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

const ReportsAnalytics: React.FC = () => {
  const reports = [
    {
      title: 'Student Attendance Report',
      description: 'Monthly attendance statistics and trends',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Fee Collection Report',
      description: 'Revenue and payment collection analysis',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Academic Performance',
      description: 'Exam results and student performance metrics',
      icon: TrendingUp,
      color: 'bg-[#4e74f9]'
    },
    {
      title: 'Leave Statistics',
      description: 'Teacher and staff leave patterns',
      icon: Calendar,
      color: 'bg-orange-500'
    },
    {
      title: 'Transportation Report',
      description: 'Bus routes and student transportation data',
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Inventory Report',
      description: 'Asset tracking and inventory status',
      icon: FileText,
      color: 'bg-teal-500'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view various reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className={`${report.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{report.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{report.description}</p>
              <button className="w-full px-4 py-2 bg-[#4e74f9] text-white rounded-lg hover:bg-[#3d5fd8] transition text-sm font-medium">
                Generate Report
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
