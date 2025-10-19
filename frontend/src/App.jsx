import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CollegeManagement from './components/CollegeManagement';
import ProgramManagement from './components/ProgramManagement';
import StudentManagement from './components/StudentManagement';
import { Users, GraduationCap, Building2, LayoutDashboard, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './components/ui/button';
import './App.css';

function AppContent() {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRegister, setShowRegister] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0EDE5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004643] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'programs', label: 'Programs', icon: GraduationCap },
    { id: 'colleges', label: 'Colleges', icon: Building2 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'programs':
        return <ProgramManagement />;
      case 'colleges':
        return <CollegeManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F0EDE5] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#F0EDE5] border-r border-[#004643]/10 shadow-sm flex flex-col fixed h-full z-20 transition-all duration-300`}>
        <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-[#004643]/10 relative transition-all duration-300`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-[#004643] p-2 rounded-lg shrink-0">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  SSIS
                </h1>
                <p className="text-xs text-gray-500">Student Info System</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-[#F0EDE5] border border-[#004643]/10 shadow-sm rounded-full p-1 hover:bg-[#004643]/10 text-[#004643] z-50"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isCollapsed ? tab.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#004643]/10 text-[#004643]'
                    : 'text-gray-600 hover:bg-[#004643]/5 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#004643]/10 bg-[#004643]/5">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="bg-[#004643]/10 p-2 rounded-full shrink-0">
              <User className="h-4 w-4 text-[#004643]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate" title={user?.full_name}>
                  {user?.full_name}
                </p>
                {user?.role === 'admin' && (
                  <span className="px-1.5 py-0.5 bg-[#004643]/10 text-[#004643] rounded text-[10px] font-medium uppercase">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-gray-600 hover:text-red-600 hover:bg-red-50`} 
            onClick={logout}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className={`h-4 w-4 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} p-8 w-full transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="w-full flex-1 flex flex-col min-h-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;