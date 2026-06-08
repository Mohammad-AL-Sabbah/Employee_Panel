import { createBrowserRouter, Navigate } from 'react-router-dom';

// استيراد المكون الأب
import App from '../App'; 

// 1. القوالب
import MainLayout from '../Layouts/MainLayout'; 
import EmergencyLayout from '../Layouts/EmergencyLayout';

// 2. الصفحات العامة
import LandingPage from '../pages/Landing';
import Login from '../pages/Auth/Login';
import Kids from '../pages/KidsPage/Kids';

// 3. صفحات البلدية
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

// 4. صفحات الطوارئ
import EmergencyDashboard from '../components/Emergency/components/EmergencyDashboard';
import MedicalHistoryView from '../components/Emergency/components/MedicalHistoryView';
import CallArchiveView from '../components/Emergency/components/CallArchiveView';
import MessageArchiveView from '../components/Emergency/components/MessageArchiveView';
import FieldUnitsView from '../components/Emergency/components/FieldUnitsView';
import MedicalCentersView from '../components/Emergency/components/MedicalCentersView';
import EmergencyCenters from '../components/Emergency/components/EmergencyCenters';
import EmergencyStaffStatus from '../components/Emergency/components/EmergencyStaffStatus';
import EmergencyLogin from '../components/Emergency/components/EmergencyLogin';
import ReportsDetails from '../components/Municipalities/Shared/ReportsDetails';
import ReportDetailsMap from '../components/Municipalities/Shared/ReportDetailsMap';
import AllAds from '../components/Municipalities/Shared/AllAds';
import CreateAd from '../components/Municipalities/Shared/CreateAd';
import ReportsPage from '../pages/Emergency/ReportsPage';
import EmergencyReportsView from '../components/Emergency/components/EmergencyReportsView';
import EmergencyMap from '../components/Emergency/components/EmergencyMap';
import EmergencyReportDetailsMap from '../components/Emergency/components/EmergencyReportDetailsMap';
import AddFieldUnitView from '../components/Emergency/components/AddFieldUnitView';
import EmailNotifications from '../components/Municipalities/Shared/EmailNotifications';
import CreateEmergencyCenter from '../components/Emergency/components/CreateEmergencyCenter';


// --- الطريقة الأضمن لاكتشاف Tauri ---sب
// اكتشاف Tauri عبر اسم المحرك (WebView)
const queryParams = new URLSearchParams(window.location.search);
const isTauri = queryParams.get('platform') === 'tauri' || !!window.__TAURI_IPC__;;

const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '/',
        children: [
          { 
            index: true, 
            element: isTauri ? <Navigate to="/EmergencyLogin" replace /> : <LandingPage /> 
          },
          { path: 'login', element: <Login /> },
          { path: 'Kids', element: <Kids /> },
          { path: 'EmergencyLogin', element: <EmergencyLogin /> }, // إضافة مسار تسجيل الدخول
        ]
      },
      {
        path: '/',
        element: <MainLayout />, 
        children: [
          { path: 'MainPage', element: <MainPage /> },
          { path: 'ControlPanel', element: <ControlPanel /> },
          { path: 'Reports', element: <Reports /> },
          { path: 'ReportsDetails', element: <ReportsDetails /> },
          { path: 'teams', element: <MaintenanceTeams /> },
          { path: 'users', element: <ManageUsers /> },
          { path: 'Settings', element: <Settings /> },
          { path: 'help', element: <Help /> },
          { path: 'AdminControlPanel', element: <AdminControlPanel /> },
          { path: 'StaffLogs', element: <StaffLogs /> },
          { path: 'StaffStatus', element: <StaffStatus /> },
          { path: 'SupportTickets', element: <SupportTickets /> },
          { path: 'ManageStaff', element: <ManageStaff /> },
          { path: 'ReportDetailsMap', element: <ReportDetailsMap /> },
          { path: 'AllAds', element: <AllAds /> },
          { path: 'CreateAd', element: <CreateAd /> },
          {path: 'EmailNotifications', element: <EmailNotifications />}, 
        ]
      },
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
          { path: 'EmergencyCenters', element: <EmergencyCenters /> },
          { path: 'EmergencyStaffStatus', element: <EmergencyStaffStatus /> },
          { path: 'ReportsPage', element: <ReportsPage /> },
          {path: 'EmergencyReportsView', element: <EmergencyReportsView /> },
          {path:'AddFieldUnitView', element: <AddFieldUnitView />}, // إعادة استخدام نفس المكون مع تمييزه في الـ API
          { path: "EmergencyReportDetailsMap/:reportId", element: <EmergencyReportDetailsMap /> },
          { path: "CreateEmergencyCenter", element: <CreateEmergencyCenter /> },
          
    
        ]
      },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default routes;