import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, AlertCircle, Users, Settings, HelpCircle, 
  LogOut, ChevronLeft, ShieldCheck, Home, Wrench, 
  Megaphone, Layout, PlusCircle, ChevronDown, X 
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

/** * نافذة التأكيد (Logout Modal) */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">تسجيل الخروج</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-slate-600 text-sm mb-6">هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition">
            إلغاء
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition">
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
};

// --- المكونات الأخرى ---
const CollapsibleSidebarItem = ({ icon: Icon, label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-1">
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800">
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 opacity-100 text-emerald-500' : 'opacity-30'}`} />
      </div>
      {isOpen && (
        <div className="mr-4 mt-1 space-y-1 border-r-2 border-slate-50 pr-2 animate-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <NavLink key={index} to={item.to} className={({ isActive }) => `flex items-center gap-3 p-2.5 rounded-lg transition-all no-underline ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}>
              <item.icon size={14} />
              <span className="text-[11px] font-bold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, danger = false, hasArrow = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline ${danger ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-xs font-bold">{label}</span>
    </div>
    {hasArrow && <ChevronLeft size={14} className="opacity-30" />}
  </div>
);

const SidebarNavItem = ({ icon: Icon, label, to, danger = false, hasArrow = false }) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 no-underline ${isActive ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-100' : danger ? 'text-rose-500 hover:bg-rose-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
    {({ isActive }) => (
      <>
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-xs font-bold">{label}</span>
        </div>
        {hasArrow && <ChevronLeft size={14} className={`transition-transform duration-200 ${isActive ? 'text-white rotate-90' : 'opacity-30'}`} />}
      </>
    )}
  </NavLink>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
      <aside className="w-64 bg-white border-l border-slate-200 p-4 flex flex-col shadow-sm z-20 h-screen sticky top-0">
        <div className="flex items-center justify-center gap-2 mb-8 px-2 py-4 flex-col">
          <Link to="/MainPage" className="bg-[#10b981] p-2 rounded-lg text-slate-50 shadow-sm shadow-emerald-200">
            <ShieldCheck size={24} />
          </Link>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tighter mt-2">لوحة الموظف</h2>
        </div>
        
        <nav className="flex-grow space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">القائمة</p>
          <SidebarNavItem icon={Home} label="الصفحة الرئيسية" to="/MainPage" hasArrow />
          <SidebarNavItem icon={LayoutGrid} label="لوحة التحكم" to="/ControlPanel" hasArrow />
          <SidebarNavItem icon={AlertCircle} label="إدارة البلاغات" to="/reports" hasArrow />
          <SidebarNavItem icon={Wrench} label="فرق الصيانة" to="/teams" hasArrow />
          <SidebarNavItem icon={Users} label="قاعدة المستخدمين" to="/users" hasArrow />

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

        <div className="mt-auto pt-4 border-t border-slate-100">
          <SidebarNavItem icon={HelpCircle} label="المساعدة" to="/help" />
          <SidebarItem 
            icon={LogOut} 
            label="تسجيل الخروج" 
            danger 
            onClick={() => setIsLogoutOpen(true)}
          />
        </div>
      </aside>

      {/* نافذة التأكيد */}
      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        onConfirm={handleLogout} 
      />
    </>
  );
};

export default Sidebar;