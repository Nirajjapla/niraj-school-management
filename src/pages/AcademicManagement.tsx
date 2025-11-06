import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { mockAcademicCalendar } from '../services/mockData';

const AcademicManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = mockAcademicCalendar.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Academic Management</h1>
        <p className="text-gray-600">Manage holidays, exams, and school events</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      event.eventType === 'holiday' ? 'bg-blue-100 text-blue-700' :
                      event.eventType === 'exam' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{event.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{event.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{event.startDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{event.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicManagement;
