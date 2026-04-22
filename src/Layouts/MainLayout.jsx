import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Municipalities/CivilStaff/Sidebar';
import AdminSideBar from '../components/Municipalities/CivilAdministration/AdminSideBar';
import Header from '../components/Municipalities/Shared/Header';

const MainLayout = () => {
  // ✅ التصحيح: استخدام sessionStorage بدلاً من localStorage
  // ✅ التصحيح: المقارنة مع "SuperAdmin" بدلاً من "مسؤول"
  const userRole = sessionStorage.getItem("userRole");
  const isSuperAdmin = userRole === "SuperAdmin";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]" dir="rtl">
      {isSuperAdmin ? <AdminSideBar /> : <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;