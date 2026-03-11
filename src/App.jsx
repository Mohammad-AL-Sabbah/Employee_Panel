/* eslint-disable no-unused-vars */
import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Municipalities/Shared/Header'
import Sidebar from './components/Municipalities/CivilStaff/Sidebar'
import ControlPanel from './components/Municipalities/Shared/ControlPanel'
import LandingPage from './pages/Landing'; 
import Reports from './components/Municipalities/Shared/Reports';
import MainPage from './components/Municipalities/Shared/MainPage';
import Settings from './components/Municipalities/Shared/Settings';
import MaintenanceTeams from './components/Municipalities/Shared/MaintenanceTeams';
import Help from './components/Municipalities/CivilStaff/Help';
import ManageUsers from './components/Municipalities/Shared/ManageUsers';
import Login from './pages/Auth/Login';
import Kids from './pages/KidsPage/Kids';
import AdminControlPanel from './components/Municipalities/CivilAdministration/AdminControlPanel';
import AdminSideBar from './components/Municipalities/CivilAdministration/AdminSideBar';
import StaffLogs from './components/Municipalities/CivilAdministration/StaffLogs';
import StaffStatus from './components/Municipalities/CivilAdministration/StaffStatus';
import SupportTickets from './components/Municipalities/CivilAdministration/SupportTickets';
import ManageStaff  from './components/Municipalities/CivilAdministration/ManageStaff';
import { Toaster } from 'sonner';
import EmergencyDashboard from './components/Emergency/components/EmergencyDashboard';
function App() {
  const location = useLocation();
  
  // 1. جلب الرتبة من التخزين المحلي
  const userRole = localStorage.getItem("userRole");

  // 2. تحديد الصفحات التي لا يظهر فيها أي إطارات (Login, Landing, Kids)
  const isAuthOrLanding = ["/", "/login", "/Kids","/EmergencyDashboard"].includes(location.pathname);
  
  // 3. التحقق مما إذا كان المستخدم الحالي هو Super Admin فعلاً
  const isSuperAdmin = userRole === "مسؤول";

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      
      {/* 4. منطق الـ Sidebar: طالما لست في صفحة الدخول، اظهر السايد بار بناءً على رتبتك */}
      {!isAuthOrLanding && (
        isSuperAdmin ? <AdminSideBar /> : <Sidebar />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 5. الـ Header يظهر في كل الصفحات الداخلية (موظف ومدير) */}
        {!isAuthOrLanding && <Header />}
<Toaster 
        position="top-right" 
        expand={true} 
        richColors 
        closeButton
        theme="light" // أو dark حسب تصميمك
      />
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ControlPanel" element={<ControlPanel />} />
            <Route path="/Reports" element={<Reports />} />
            <Route path="/teams" element={<MaintenanceTeams />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/Settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="/Kids" element={<Kids />} />
            <Route path='/AdminControlPanel' element={<AdminControlPanel />} />
            <Route path='/StaffLogs' element={<StaffLogs />} />
            <Route path='/StaffStatus' element={<StaffStatus />} />
            <Route path='/SupportTickets' element={<SupportTickets />} />
            
            <Route path='/ManageStaff' element={<ManageStaff />} />
            <Route path='/EmergencyDashboard' element={<EmergencyDashboard />} />

            {/* توجيه ذكي: إذا حاول الدخول لرابط غير موجود يرجعه للرئيسية */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;