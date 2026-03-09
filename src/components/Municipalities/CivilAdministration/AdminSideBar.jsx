
import React from 'react';
import { NavLink, Link } from 'react-router-dom'; // نستخدم NavLink بدلاً من Link
import { 
  LayoutGrid, AlertCircle, Users, CheckCircle, 
  Settings, HelpCircle, LogOut, ChevronLeft, ShieldCheck,
  Home,Wrench
} from 'lucide-react';

// تحديث SidebarItem ليستخدم NavLink
const SidebarItem = ({ icon: Icon, label, to, danger = false, hasArrow = false }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline
      ${isActive 
        ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-100' 
        : danger 
          ? 'text-rose-500 hover:bg-rose-50' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </div>
        {hasArrow && (
          <ChevronLeft 
            size={14} 
            className={`transition-transform duration-200 ${isActive ? 'text-white rotate-90' : 'opacity-30'}`} 
          />
        )}
      </>
    )}
  </NavLink>
);

const AdminSideBar = () => {
  return (
    <aside className="w-64 bg-white border-l border-slate-200 p-4 flex flex-col shadow-sm z-20 h-screen sticky top-0">
      {/* قسم الشعار */}
      <div className="flex items-center  justify-center gap-2 mb-8 px-2 py-4" style={{flexDirection:"column"}}>
        <Link to="/MainPage" className="bg-[#10b981] p-2 rounded-lg text-slate-50 shadow-sm shadow-emerald-200">
                      <ShieldCheck size={24} />

        </Link>
                <h2 className="text-lg font-bold text-slate-800 ">لوحة تحكم المسؤول</h2>

      </div>
      
      {/* روابط التنقل */}
      <nav className="flex-grow space-y-1 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">القائمة</p>
        <SidebarItem icon={Home} label="الصفحة الرئيسية" to="/MainPage"  hasArrow/>
        <SidebarItem icon={LayoutGrid} label="لوحة التحكم" to="/AdminControlPanel" hasArrow />
        <SidebarItem icon={AlertCircle} label="إدارة البلاغات" to="/reports" hasArrow />
        <SidebarItem icon={Wrench} label="فرق الصيانة" to="/teams" hasArrow />
        <SidebarItem icon={Users} label="المستخدمين" to="/users" hasArrow />
        <SidebarItem icon={Users} label="سجلات الموظفين" to="/StaffLogs" hasArrow />
        <SidebarItem icon={Users} label="حالة الموظفين" to="/StaffStatus" hasArrow />
        <SidebarItem icon={Users} label="تذاكر الدعم" to="/SupportTickets" hasArrow />

        <SidebarItem icon={Settings} label="الإعدادات" to="/settings"  hasArrow/>
      </nav>

      {/* التذييل */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <SidebarItem icon={LogOut} label="تسجيل الخروج" to="/logout" danger />
      </div>
    </aside>
  );
};

export default AdminSideBar;