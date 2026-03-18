/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; 
import { 
  LayoutDashboard, Map as MapIcon, FileText,
  Radio, History, Activity, LogOut, ShieldCheck,
  ChevronDown, MessageSquare, Phone,
  Ambulance, Hospital, Home // أيقونات جديدة لوحدات الطوارئ
} from 'lucide-react';

const EmergencySidebar = ({ isOpen }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const location = useLocation();

  const navLinks = [
    { id: '01', path: '/EmergencyDashboard', name: 'الرئيسية', icon: <LayoutDashboard size={22} /> },
    { id: '02', path: '/map', name: 'خريطة البلاغات', icon: <MapIcon size={22} /> },
    { 
      id: '03', 
      name: 'مركز الأرشيف', 
      icon: <FileText size={22} />,
      isDropdown: true,
      subLinks: [
        { name: 'أرشيف المكالمات', path: '/CallArchiveView', icon: <Phone size={16} /> },
        { name: 'أرشيف الرسائل', path: '/MessageArchiveView', icon: <MessageSquare size={16} /> },
        { name: 'الأرشيف العام', path: '/archive', icon: <History size={16} /> },
      ]
    },
    { 
      id: '04', // تصحيح الـ ID ليكون فريداً
      name: 'وحدات الطوارئ', 
      icon: <Activity size={22} />,
      isDropdown: true,
      subLinks: [
        { name: 'الوحدات الميدانية', path: '/FieldUnitsView', icon: <Ambulance size={16} /> },
        { name: 'المراكز الطبية والمستشفيات', path: '/hospitals', icon: <Hospital size={16} /> },
        { name: 'مراكز الإيواء ', path: '/shelters', icon: <Home size={16} /> },
      ]
    },
    { id: '05', path: '/MedicalHistoryView', name: 'السجل الطبي العام', icon: <Activity size={22} className="text-red-500" /> },
    { id: '06', path: '/ops-room', name: 'غرفة العمليات', icon: <Radio size={22} /> },
  ];

  useEffect(() => {
    navLinks.forEach(link => {
      if (link.isDropdown) {
        const isActiveChild = link.subLinks.some(sub => location.pathname === sub.path);
        if (isActiveChild) {
          setOpenSubMenu(link.id);
        }
      }
    });
  }, [location.pathname]);

  const handleLogout = () => {
    window.location.href = "/";
  };

  const toggleSubMenu = (id) => {
    setOpenSubMenu(openSubMenu === id ? null : id);
  };

  return (
    <>
      {/* ستايل لإخفاء السكرول بار نهائياً */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <aside 
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] bg-[#0a0a0a] border-l border-slate-800 transition-all duration-300 z-[9999] shadow-2xl ${
          isOpen ? 'w-[280px]' : 'w-0'
        } overflow-hidden`}
        dir="rtl"
      >
        <div className="w-[280px] flex flex-col h-full font-sans">
          
          <div className="p-6 border-b border-slate-800/50 flex items-center gap-4 bg-[#0f0f0f]">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <ShieldCheck size={20} className="text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white leading-tight">مركز إدارة الطوارئ</span>
              <span className="text-[10px] text-slate-500 font-medium text-right">نظام الاستجابة الفورية</span>
            </div>
          </div>

          {/* إضافة كلاس no-scrollbar هنا */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto no-scrollbar text-right">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isSubMenuActive = link.isDropdown && link.subLinks.some(sub => location.pathname === sub.path);
              const isExpanded = openSubMenu === link.id;

              if (link.isDropdown) {
                return (
                  <div key={link.id} className="flex flex-col">
                    <button
                      style={{cursor:'pointer'}} 
                      onClick={() => toggleSubMenu(link.id)}
                      className={`w-full group flex items-center gap-4 px-4 py-3.5 transition-all duration-200 rounded-xl ${
                        isSubMenuActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className={isSubMenuActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-400'}>
                        {link.icon}
                      </div>
                      <span className="text-[15px] font-medium">{link.name}</span>
                      <ChevronDown size={16} className={`mr-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 bg-black/40 rounded-xl mt-1 ${isExpanded ? 'max-h-60 opacity-100 py-1' : 'max-h-0 opacity-0'}`}>
                      {link.subLinks.map((sub, idx) => {
                        const isChildActive = location.pathname === sub.path;
                        return (
                          <Link
                            key={idx}
                            to={sub.path}
                            className={`flex items-center gap-4 pr-12 pl-4 py-3 text-[13px] transition-colors ${
                              isChildActive ? 'text-blue-500 font-bold bg-blue-500/5' : 'text-slate-500 hover:text-slate-200'
                            }`}
                          >
                            <div className={`${isChildActive ? 'text-blue-500' : 'text-slate-600'}`}>
                              {sub.icon}
                            </div>
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`w-full group flex items-center gap-4 px-4 py-3.5 transition-all duration-200 rounded-xl no-underline ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                    {link.icon}
                  </div>
                  <span className={`text-[15px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {link.name}
                  </span>
                  {link.path === '/MedicalHistoryView' && (
                    <div className="mr-auto">
                      <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 bg-[#0a0a0a] border-t border-slate-800">
            <button 
              onClick={() => setShowExitConfirm(true)}
              className="w-full flex items-center justify-center gap-3 py-3 bg-slate-900 text-slate-300 hover:bg-red-600 hover:text-white transition-all rounded-xl font-bold text-[14px]"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 font-sans" dir="rtl">
          <div className="w-full max-w-sm bg-[#111] border border-slate-800 p-8 rounded-3xl text-center shadow-2xl">
            <h3 className="text-white text-xl font-bold mb-2">تأكيد الخروج</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">سيتم إنهاء الجلسة الحالية وإيقاف المتابعة.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">تراجع</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">خروج</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencySidebar;