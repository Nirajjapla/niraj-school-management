import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  MessageSquare,
  DollarSign,
  Bus,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Filter
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { NotificationItem } from '../services/centralData';

const NotificationManagement: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Unread' | 'Leaves' | 'Messages' | 'Fees' | 'Transport' | 'Circulars'>('All');

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'teacher_leave':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
        );
      case 'teacher_message':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-[#4e74f9] dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
        );
      case 'fee_alert':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
        );
      case 'transport_alert':
        return (
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
        );
      case 'system_circular':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedFilter === 'Unread') return !notif.read;
    if (selectedFilter === 'Leaves') return notif.type === 'teacher_leave';
    if (selectedFilter === 'Messages') return notif.type === 'teacher_message';
    if (selectedFilter === 'Fees') return notif.type === 'fee_alert';
    if (selectedFilter === 'Transport') return notif.type === 'transport_alert';
    if (selectedFilter === 'Circulars') return notif.type === 'system_circular';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span>Notifications Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4e74f9] text-white">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Real-time alerts for teacher leave requests, user messages, fee due notices & transport updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-[#4e74f9]" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-1">
        {(['All', 'Unread', 'Leaves', 'Messages', 'Fees', 'Transport', 'Circulars'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              selectedFilter === tab
                ? 'bg-[#4e74f9] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* High-Readability Notification Cards with Background Colors, Borders & Shadows */}
      <div className="space-y-3.5">
        {filteredNotifications.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer shadow-sm hover:shadow-md ${
                !notif.read
                  ? 'bg-blue-50/70 dark:bg-slate-900 border-blue-200 dark:border-indigo-900/60 ring-1 ring-blue-500/10'
                  : 'bg-white dark:bg-slate-900/70 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
              }`}
            >
              {getNotificationIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#4e74f9]" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                        notif.priority === 'Urgent'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : notif.priority === 'High'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                      }`}
                    >
                      {notif.priority} Priority
                    </span>
                    <span className="text-xs text-gray-400 dark:text-slate-500">{notif.timestamp}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed font-normal">
                  {notif.message}
                </p>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 dark:text-slate-200 mb-1">No notifications in this category</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">All alerts and notices will appear here in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManagement;
