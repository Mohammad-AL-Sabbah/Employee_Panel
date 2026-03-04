import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import LandingPage from './pages/Landing'; 
import Reports from './pages/Reports';
import MainPage from './pages/MainPage';
import Settings from './pages/Settings';
import MaintenanceTeams from './pages/MaintenanceTeams';
import Help from './pages/Help';
import ManageUsers from './pages/ManageUsers';
import Login from './pages/Auth/Login';

function App() {
  const location = useLocation();

  const noLayoutPages = ["/", "/login"];
  
  const hideLayout = noLayoutPages.includes(location.pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      
      {!hideLayout && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* عرض الهيدر فقط إذا لم نكن في صفحات الاستثناء */}
        {!hideLayout && <Header />}
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* مسارات بدون هيدر وسايد بار */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* مسارات لوحة التحكم (Dashboard) */}
            <Route path="/home" element={<Home />} />
            <Route path="/Reports" element={<Reports />} />
            <Route path="/teams" element={<MaintenanceTeams />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/MainPage" element={<MainPage />} />

            {/* إعادة توجيه أي مسار غير معروف إلى الصفحة الرئيسية */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;