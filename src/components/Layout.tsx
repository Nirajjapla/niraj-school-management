import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  IndianRupee,
  Bus,
  Calendar,
  MessageSquare,
  FileText,
  Package,
  BarChart3,
  BookOpen,
  Lock,
  Menu,
  X,
  LogOut,
  User,
  School,
  Sun,
  Moon,
  Bell,
  Award,
  ClipboardCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadNotificationCount, markNotificationRead } = useData();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const menuSections: MenuSection[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'ACADEMICS & STUDENTS',
      items: [
        { id: 'academic', label: 'Academic Setup', icon: BookOpen },
        { id: 'students', label: 'Student Management', icon: Users },
        { id: 'attendance', label: 'Attendance Management', icon: ClipboardCheck },
        { id: 'examinations', label: 'Examinations & Marks', icon: Award }
      ]
    },
    {
      title: 'PEOPLE & HR',
      items: [
        { id: 'teachers', label: 'Teacher Management', icon: GraduationCap },
        { id: 'staff', label: 'Staff Management', icon: UserCog },
        { id: 'leaves', label: 'Leave Management', icon: Calendar }
      ]
    },
    {
      title: 'FINANCE & OPERATIONS',
      items: [
        { id: 'fees', label: 'Fee Management', icon: IndianRupee },
        { id: 'transportation', label: 'Transportation', icon: Bus },
        { id: 'inventory', label: 'Inventory & Library', icon: Package }
      ]
    },
    {
      title: 'COMMUNICATION',
      items: [
        { id: 'circulars', label: 'Circulars & Notices', icon: FileText },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'change-password', label: 'Change Password', icon: Lock }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col z-30 shrink-0`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#4e74f9] p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white block text-sm leading-tight">School ERP</span>
              <span className="text-[11px] text-gray-400 dark:text-slate-400">Admin Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <div className="px-3.5 pt-2 pb-1">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-slate-500 uppercase">
                    {section.title}
                  </p>
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition font-medium text-xs ${
                          isActive
                            ? 'bg-[#4e74f9] text-white shadow-md shadow-blue-500/20'
                            : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isActive ? 'bg-white text-[#4e74f9]' : 'bg-[#4e74f9] text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 transition"
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#4e74f9] rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 py-3 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">Recent Alerts</span>
                    <button
                      onClick={() => {
                        setShowNotificationDropdown(false);
                        onNavigate('notifications');
                      }}
                      className="text-xs text-[#4e74f9] hover:underline font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                    {notifications.slice(0, 4).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionUrl) onNavigate(n.actionUrl);
                          setShowNotificationDropdown(false);
                        }}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 ${
                          !n.read ? 'bg-blue-50/50 dark:bg-blue-950/30 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-gray-400">{n.timestamp}</span>
                        </div>
                        <p className="text-gray-600 dark:text-slate-300 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-gray-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.fullName || 'Admin User'}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <div className="w-9 h-9 bg-[#4e74f9] rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-xs">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
