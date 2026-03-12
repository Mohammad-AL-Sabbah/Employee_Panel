import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, AlertCircle, Users, Settings, LogOut, 
  ChevronLeft, ShieldCheck, Home, Wrench, FileClock, 
  UserCheck, Ticket, ChevronDown, UserCog
} from 'lucide-react';

/** * 1. مكون العنصر العادي في القائمة الجانبية
 * تم إصلاح تباين الألوان هنا ليكون النص أوضح (Slate-600)
 */
const SidebarItem = ({ icon: Icon, label, to, danger = false, hasArrow = false }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline group
      ${isActive 
        ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-100' 
        : danger 
          ? 'text-rose-600 hover:bg-rose-50' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }
    `}
  >
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
          <span className="text-xs font-bold tracking-tight">{label}</span>
        </div>
        {hasArrow && (
          <ChevronLeft 
            size={14} 
            className={`transition-transform duration-200 ${isActive ? 'text-white rotate-[-90deg]' : 'text-slate-300 group-hover:text-slate-500'}`} 
          />
        )}
      </>
    )}
  </NavLink>
);

/** * 2. مكون القائمة المنسدلة (Collapse)
 * تم حل مشكلة "isActive is not defined" (الصورة 3) عن طريق تمريرها كدالة داخل الـ NavLink
 */
const CollapsibleSidebarItem = ({ icon: Icon, label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isChildActive = items.some(item => location.pathname === item.to);

  return (
    <div className="space-y-1">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 group
          ${isChildActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isChildActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'}`} />
          <span className="text-xs font-bold tracking-tight">{label}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isOpen || isChildActive ? 'rotate-180 text-emerald-600' : 'text-slate-300 group-hover:text-slate-500'}`} 
        />
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen || isChildActive ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1 mt-1">
          {items.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 no-underline group/sub
                ${isActive ? 'text-[#10b981] font-black' : 'text-slate-500 hover:text-slate-900'} 
              `}
            >
              {/* الحل الصحيح لخطأ الصورة رقم 3 */}
              {({ isActive }) => (
                <>
                  <item.icon size={14} className={isActive ? 'text-[#10b981]' : 'text-slate-400 group-hover/sub:text-slate-700'} />
                  <span className="text-[11px] font-bold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminSideBar = () => {
  // 3. حل مشكلة الـ useEffect (الصورة 2)
  // نقوم بجلب بيانات المستخدم مباشرة عند تعريف الـ State لتجنب Cascading Renders
  const [userRole, setUserRole] = useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    return savedUser?.role?.toLowerCase() || 'admin';
  });

  useEffect(() => {
    document.title = "إدارة النظام | P.S.R.S";
  }, []);

  return (
    <aside className="w-64 bg-white border-l border-slate-200 p-2 flex flex-col shadow-sm z-20 h-screen sticky top-0" dir="rtl">
      <div className="flex flex-col items-center justify-center gap-2 mb-8 px-2 py-4">
        <Link to="/MainPage" className="bg-[#10b981] p-2 rounded-lg text-slate-50 shadow-sm shadow-emerald-200 transition-transform hover:scale-105 active:scale-95">
          <ShieldCheck size={24} />
        </Link>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">لوحة المسؤول</h2>
      </div>
      
      {/* روابط التنقل */}
      <nav className="flex-grow space-y-1 overflow-y-auto px-1 custom-scrollbar">
        <p className="text-[10px] font-black text-slate-400 mb-2 px-3 uppercase tracking-[0.15em]">القائمة العامة</p>
        <SidebarItem icon={Home} label="الصفحة الرئيسية" to="/MainPage" hasArrow />
        <SidebarItem icon={LayoutGrid} label="لوحة التحكم" to="/AdminControlPanel" hasArrow />
        
        <p className="text-[10px] font-black text-slate-400 mb-2 px-3 mt-6 uppercase tracking-[0.15em]">الإدارة التشغيلية</p>
        <SidebarItem icon={AlertCircle} label="إدارة البلاغات" to="/reports" hasArrow />
        <SidebarItem icon={Wrench} label="فرق الصيانة" to="/teams" hasArrow />
        <SidebarItem icon={Users} label="قاعدة المواطنين" to="/users" hasArrow />

        {/* القسم المجمع للموظفين - يحل مشكلة الزحام الجمالي */}
        <CollapsibleSidebarItem 
          icon={UserCog} 
          label="شؤون الموظفين" 
          items={[
            { icon: UserCheck, label: "حالة الموظفين", to: "/StaffStatus" },
            { icon: FileClock, label: "سجلات الرقابة", to: "/StaffLogs" },
            { icon: Users, label: "إدارة الموظفين", to: "/ManageStaff" }, 
          ]} 
        />

        <p className="text-[10px] font-black text-slate-400 mb-2 px-3 mt-6 uppercase tracking-[0.15em]">الدعم والنظام</p>
        <SidebarItem icon={Ticket} label="تذاكر الدعم" to="/SupportTickets" hasArrow />
        <SidebarItem icon={Settings} label="إعدادات النظام" to="/settings" hasArrow />
      </nav>

      {/* التذييل */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <SidebarItem icon={LogOut} label="تسجيل الخروج" to="/" danger />
      </div>
    </aside>
  );
};

export default AdminSideBar;