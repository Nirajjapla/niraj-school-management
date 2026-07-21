import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { leaveApi } from '../services/api';
import { mockLeaves as initialLeaves } from '../services/mockData';

interface Leave {
  id: string | number;
  userName?: string;
  applicant?: { name: string; role: string };
  userType?: string;
  leave_type?: string;
  leaveType?: string;
  start_date?: string;
  fromDate?: string;
  end_date?: string;
  toDate?: string;
  reason: string;
  status: string;
  approvedBy?: string | null;
}

const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveApi.getLeaves();
      if (Array.isArray(data) && data.length > 0) {
        setLeaves(data);
      } else {
        setLeaves(initialLeaves);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
      setLeaves(initialLeaves);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = leaves.filter(leave => {
    const name = leave.applicant?.name || leave.userName || '';
    const type = leave.leave_type || leave.leaveType || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleApprove = async (id: string | number) => {
    try {
      await leaveApi.updateLeaveStatus(id, 'approved', 'Approved by Admin');
      fetchLeaves();
    } catch (err) {
      console.error('Error approving leave:', err);
      setLeaves(leaves.map(leave =>
        leave.id === id ? { ...leave, status: 'approved' } : leave
      ));
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await leaveApi.updateLeaveStatus(id, 'rejected', 'Rejected by Admin');
      fetchLeaves();
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setLeaves(leaves.map(leave =>
        leave.id === id ? { ...leave, status: 'rejected' } : leave
      ));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-600">Manage and approve leave requests</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leaves..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4e74f9] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{leave.applicant?.name || leave.userName || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 capitalize">{leave.applicant?.role || leave.userType || 'Student'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 capitalize">{leave.leave_type || leave.leaveType || 'casual'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{leave.start_date || leave.fromDate || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{leave.end_date || leave.toDate || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{leave.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      leave.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : leave.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {leave.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
