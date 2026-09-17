import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import TeacherManagement from './pages/TeacherManagement';
import StaffManagement from './pages/StaffManagement';
import FeeManagement from './pages/FeeManagement';
import TransportManagement from './pages/TransportManagement';
import LeaveManagement from './pages/LeaveManagement';
import CommunicationManagement from './pages/CommunicationManagement';
import MessageManagement from './pages/MessageManagement';
import NotificationManagement from './pages/NotificationManagement';
import ExaminationManagement from './pages/ExaminationManagement';
import InventoryManagement from './pages/InventoryManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AcademicManagement from './pages/AcademicManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import ChangePassword from './pages/ChangePassword';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4e74f9] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading School ERP Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'notifications':
        return <NotificationManagement />;
      case 'messages':
        return <MessageManagement />;
      case 'circulars':
        return <CommunicationManagement />;
      case 'students':
        return <StudentManagement />;
      case 'teachers':
        return <TeacherManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'fees':
        return <FeeManagement />;
      case 'transportation':
        return <TransportManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'examinations':
        return <ExaminationManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'academic':
        return <AcademicManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'change-password':
        return <ChangePassword />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;
