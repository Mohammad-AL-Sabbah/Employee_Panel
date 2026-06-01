import React, { useState } from 'react'; // أضفنا useState هنا
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, AlertCircle, Users, CheckCircle, 
  Settings, HelpCircle, LogOut, ChevronLeft, ShieldCheck,
  Home, Wrench, Megaphone, Layout, PlusCircle, ChevronDown // أضفنا ChevronDown
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

// --- المكون المفقود الذي سبب المشكلة ---
const CollapsibleSidebarItem = ({ icon: Icon, label, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-1">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 opacity-30 ${isOpen ? 'rotate-180 opacity-100 text-emerald-500' : ''}`} 
        />
      </div>
      
      {isOpen && (
        <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-50 pr-2 animate-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <NavLink
              key={index}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 p-2.5 rounded-lg transition-all no-underline
                ${isActive 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <item.icon size={14} />
              <span className="text-[11px] font-bold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

// مكون SidebarItem (للعناصر التي تملك Action مثل تسجيل الخروج)
const SidebarItem = ({ icon: Icon, label, danger = false, hasArrow = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`
      flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline
      ${danger 
        ? 'text-rose-500 hover:bg-rose-50' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }
    `}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-xs font-bold">{label}</span>
    </div>
    {hasArrow && <ChevronLeft size={14} className="opacity-30" />}
  </div>
);

// مكون SidebarNavItem (للمسارات العادية)
const SidebarNavItem = ({ icon: Icon, label, to, danger = false, hasArrow = false }) => (
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

const Sidebar = () => {
  const navigate = useNavigate();

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
    <aside className="w-64 bg-white border-l border-slate-200 p-4 flex flex-col shadow-sm z-20 h-screen sticky top-0">
      {/* قسم الشعار */}
      <div className="flex items-center justify-center gap-2 mb-8 px-2 py-4 flex-col">
        <Link to="/MainPage" className="bg-[#10b981] p-2 rounded-lg text-slate-50 shadow-sm shadow-emerald-200">
          <ShieldCheck size={24} />
        </Link>
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tighter mt-2">لوحة الموظف</h2>
      </div>
      
      {/* روابط التنقل */}
      <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">القائمة</p>
        <SidebarNavItem icon={Home} label="الصفحة الرئيسية" to="/MainPage" hasArrow />
        <SidebarNavItem icon={LayoutGrid} label="لوحة التحكم" to="/ControlPanel" hasArrow />
        <SidebarNavItem icon={AlertCircle} label="إدارة البلاغات" to="/reports" hasArrow />
        <SidebarNavItem icon={Wrench} label="فرق الصيانة" to="/teams" hasArrow />
        <SidebarNavItem icon={Users} label="قاعدة المستخدمين" to="/users" hasArrow />

        {/* المكون الذي تم إصلاحه */}
        <CollapsibleSidebarItem 
          icon={Megaphone} 
          label="إعلانات البلدية" 
          items={[
            { icon: Layout, label: "عرض كافة الإعلانات", to: "/AllAds" },
            { icon: PlusCircle, label: "إضافة إعلان جديد", to: "/CreateAd" },
          ]} 
        />

        <SidebarNavItem icon={Settings} label="الإعدادات" to="/settings" hasArrow />
      </nav>

      {/* التذييل */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <SidebarNavItem icon={HelpCircle} label="المساعدة" to="/help" />
        <SidebarItem 
          icon={LogOut} 
          label="تسجيل الخروج" 
          danger 
          onClick={handleLogout}
        />
      </div>
    </aside>
  );
};

export default Sidebar;