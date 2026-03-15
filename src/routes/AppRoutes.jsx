import { createBrowserRouter, Navigate } from 'react-router-dom';

// استيراد المكون الأب الجديد الذي يحتوي على مراقب الإنترنت
import App from '../App'; 

// 1. استيراد القوالب (Layouts)
import MainLayout from '../Layouts/MainLayout'; 


import EmergencyLayout from '../Layouts/EmergencyLayout';

// 2. استيراد الصفحات العامة
import LandingPage from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Kids from '../pages/KidsPage/Kids';

// 3. استيراد صفحات نظام البلدية
import ControlPanel from '../components/Municipalities/Shared/ControlPanel';
import Reports from '../components/Municipalities/Shared/Reports';
import MaintenanceTeams from '../components/Municipalities/Shared/MaintenanceTeams';
import ManageUsers from '../components/Municipalities/Shared/ManageUsers';
import Settings from '../components/Municipalities/Shared/Settings';
import Help from '../components/Municipalities/CivilStaff/Help';
import MainPage from '../components/Municipalities/Shared/MainPage';
import AdminControlPanel from '../components/Municipalities/CivilAdministration/AdminControlPanel';
import StaffLogs from '../components/Municipalities/CivilAdministration/StaffLogs';
import StaffStatus from '../components/Municipalities/CivilAdministration/StaffStatus';
import SupportTickets from '../components/Municipalities/CivilAdministration/SupportTickets';
import ManageStaff from '../components/Municipalities/CivilAdministration/ManageStaff';

// 4. استيراد صفحات نظام الطوارئ
import EmergencyDashboard from '../components/Emergency/components/EmergencyDashboard';
import MedicalHistoryView from '../components/Emergency/components/MedicalHistoryView';
import CallArchiveView from '../components/Emergency/components/CallArchiveView';
import MessageArchiveView from '../components/Emergency/components/MessageArchiveView';
import FieldUnitsView from '../components/Emergency/components/FieldUnitsView';
import MedicalCentersView from '../components/Emergency/components/MedicalCentersView';

const routes = createBrowserRouter([
  {
    // جعل المكون App هو الجذر (Root) لجميع المسارات
    path: '/',
    element: <App />, 
    children: [
      // المجموعة الأولى: الصفحات العامة
      {
        path: '/',
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'login', element: <Login /> },
          { path: 'Kids', element: <Kids /> },
        ]
      },

      // المجموعة الثانية: صفحات نظام البلدية (تستخدم MainLayout)
      {
        path: '/',
        element: <MainLayout />, 
        children: [
          { path: 'MainPage', element: <MainPage /> },
          { path: 'ControlPanel', element: <ControlPanel /> },
          { path: 'Reports', element: <Reports /> },
          { path: 'teams', element: <MaintenanceTeams /> },
          { path: 'users', element: <ManageUsers /> },
          { path: 'Settings', element: <Settings /> },
          { path: 'help', element: <Help /> },
          { path: 'AdminControlPanel', element: <AdminControlPanel /> },
          { path: 'StaffLogs', element: <StaffLogs /> },
          { path: 'StaffStatus', element: <StaffStatus /> },
          { path: 'SupportTickets', element: <SupportTickets /> },
          { path: 'ManageStaff', element: <ManageStaff /> },
        ]
      },

      // المجموعة الثالثة: صفحات نظام الطوارئ (تستخدم EmergencyLayout)
      {
        path: '/',
        element: <EmergencyLayout />, 
        children: [
          { path: 'EmergencyDashboard', element: <EmergencyDashboard /> },
          { path: 'MedicalHistoryView', element: <MedicalHistoryView /> },
          { path: 'CallArchiveView', element: <CallArchiveView /> },
          { path: 'MessageArchiveView', element: <MessageArchiveView /> },
          { path: 'FieldUnitsView', element: <FieldUnitsView /> },
          { path: 'MedicalCentersView', element: <MedicalCentersView /> },
        ]
      },
    ]
  },

  // التوجيه الافتراضي (خارج نطاق الـ App إذا أردت أو داخله)
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default routes;