import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, AlertCircle, Users, Settings, LogOut, 
  ChevronLeft, ShieldCheck, Home, Wrench, FileClock, 
  UserCheck, Ticket, ChevronDown, UserCog,
  Megaphone, Layout, PlusCircle, X,
  Mail // ✅ تم استيراد أيقونة البريد هنا
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

/** * 1. نافذة التأكيد (Modal) */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">تسجيل الخروج</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        <p className="text-slate-600 text-sm mb-6">هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">إلغاء</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition">تأكيد</button>
        </div>
      </div>
    </div>
  );
};

/** * 2. مكون العنصر العادي في القائمة الجانبية */
const SidebarItem = ({ icon: Icon, label, to, danger = false, hasArrow = false, onClick }) => {
  if (onClick) {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline group ${danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${danger ? 'text-rose-500' : 'text-slate-500 group-hover:text-slate-800'}`} />
          <span className="text-xs font-bold tracking-tight">{label}</span>
        </div>
        {hasArrow && <ChevronLeft size={14} className="opacity-30" />}
      </div>
    );
  }
  return (
    <NavLink to={to} className={({ isActive }) => `flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline group ${isActive ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-100' : danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
            <span className="text-xs font-bold tracking-tight">{label}</span>
          </div>
          {hasArrow && <ChevronLeft size={14} className={`transition-transform duration-200 ${isActive ? 'text-white rotate-[-90deg]' : 'text-slate-300 group-hover:text-slate-500'}`} />}
        </>
      )}
    </NavLink>
  );
};

/** * 3. مكون القائمة المنسدلة */
const CollapsibleSidebarItem = ({ icon: Icon, label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isChildActive = items.some(item => location.pathname === item.to);

  return (
    <div className="space-y-1">
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${isChildActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isChildActive ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'}`} />
          <span className="text-xs font-bold tracking-tight">{label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen || isChildActive ? 'rotate-180 text-emerald-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen || isChildActive ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mr-4 pr-4 border-r-2 border-slate-100 space-y-1 mt-1">
          {items.map((item, index) => (
            <NavLink key={index} to={item.to} className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 no-underline group/sub ${isActive ? 'text-[#10b981] font-black' : 'text-slate-500 hover:text-slate-900'}`}>
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
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // حالة الموديل

  const handleLogout = async () => {
    try {
      await ApiAuthToken.post('/Auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
      navigate('/');
    }
  };

  return (
    <>
      <aside className="w-64 bg-white border-l border-slate-200 p-2 flex flex-col shadow-sm z-20 h-screen sticky top-0" dir="rtl">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-2 mb-8 px-2 py-4">
          <Link to="/AdminControlPanel" className="bg-[#10b981] p-2 rounded-lg text-slate-50 shadow-sm shadow-emerald-200 transition-transform hover:scale-105 active:scale-95">
            <ShieldCheck size={24} />
          </Link>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">لوحة المسؤول</h2>
        </div>
        
        {/* Nav Links */}
        <nav className="flex-grow space-y-1 overflow-y-auto px-1 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 mb-2 px-3 uppercase tracking-[0.15em]">القائمة العامة</p>
          <SidebarItem icon={Home} label="الصفحة الرئيسية" to="/MainPage" hasArrow />
          <SidebarItem icon={LayoutGrid} label="لوحة التحكم" to="/AdminControlPanel" hasArrow />
          
          <p className="text-[10px] font-black text-slate-400 mb-2 px-3 mt-6 uppercase tracking-[0.15em]">الإدارة التشغيلية</p>
          <SidebarItem icon={AlertCircle} label="إدارة البلاغات" to="/reports" hasArrow />
          <SidebarItem icon={Wrench} label="فرق الصيانة" to="/teams" hasArrow />
          <SidebarItem icon={Users} label="قاعدة المستخدمين" to="/users" hasArrow />
<SidebarItem icon={Mail} label="نظام المراسلات والبريد" to="/EmailNotifications" hasArrow />
          <CollapsibleSidebarItem icon={UserCog} label="شؤون الموظفين" items={[
            { icon: FileClock, label: "سجلات الرقابة", to: "/StaffLogs" },
            { icon: Users, label: "إضافة الموظفين", to: "/ManageStaff" }, 
          ]} />

          <CollapsibleSidebarItem icon={Megaphone} label="إعلانات البلدية" items={[
            { icon: Layout, label: "عرض كافة الإعلانات", to: "/AllAds" },
            { icon: PlusCircle, label: "إضافة إعلان جديد", to: "/CreateAd" },
          ]} />

          <p className="text-[10px] font-black text-slate-400 mb-2 px-3 mt-6 uppercase tracking-[0.15em]">الدعم والنظام</p>
          <SidebarItem icon={Ticket} label="تذاكر الدعم" to="/SupportTickets" hasArrow />
          
          {/* 🔥 إضافة نظام المراسلات والبريد هنا */}
          
          
          <SidebarItem icon={Settings} label="إعدادات النظام" to="/settings" hasArrow />
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <SidebarItem icon={LogOut} label="تسجيل الخروج" danger onClick={() => setIsLogoutOpen(true)} />
        </div>
      </aside>

      {/* الموديل */}
      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
};

export default AdminSideBar;