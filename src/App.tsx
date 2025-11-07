import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import ExaminationManagement from './pages/ExaminationManagement';
import InventoryManagement from './pages/InventoryManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AcademicManagement from './pages/AcademicManagement';
import ChangePassword from './pages/ChangePassword';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4e74f9] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
      case 'circulars':
        return <CommunicationManagement />;
      case 'examinations':
        return <ExaminationManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'academic':
        return <AcademicManagement />;
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
