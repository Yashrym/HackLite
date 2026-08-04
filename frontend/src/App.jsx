import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import TabNav from './components/TabNav';
import DashboardPage from './pages/Dashboard';
import CitizenUploadPage from './pages/CitizenUpload';
import AnalyticsPage from './pages/Analytics';

function AppShell() {
  const { activeTab, disasterMode } = useApp();

  return (
    <div className={`min-h-screen px-3 py-4 sm:px-6 ${disasterMode ? 'disaster-active' : ''}`}>
      <Header />
      <TabNav />
      <div className="mt-4">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'citizen' && <CitizenUploadPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
