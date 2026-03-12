import React, { useState } from 'react';
import { 
  LayoutDashboard, Map as MapIcon, FileText, Users, 
  Radio, History, ChevronLeft, Terminal, Database, LogOut
} from 'lucide-react';

const EmergencySidebar = ({ isOpen, onClose }) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const navLinks = [
    { id: '01', name: 'UNIT_DASHBOARD', icon: <LayoutDashboard size={18} />, active: true },
    { id: '02', name: 'LIVE_GEOMAP', icon: <MapIcon size={18} />, active: false },
    { id: '03', name: 'INCIDENT_LOGS', icon: <FileText size={18} />, active: false },
    { id: '04', name: 'FLEET_MANAGEMENT', icon: <Users size={18} />, active: false },
    { id: '05', name: 'COMM_CHANNELS', icon: <Radio size={18} />, active: false },
    { id: '06', name: 'DATA_ARCHIVE', icon: <History size={18} />, active: false },
  ];

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <>
      <aside 
        className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] bg-black border-l-2 border-[#1e293b] transition-all duration-200 z-[9999] shadow-[20px_0_50px_rgba(0,0,0,0.8)] ${
          isOpen ? 'w-[260px]' : 'w-0'
        } overflow-hidden font-mono`}
      >
        <div className="w-[260px] flex flex-col h-full">
          
          <div className="bg-[#0a0a0a] p-4 border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 tracking-tighter">NAV_MODULE_v1.0</span>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1 mt-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                className={`w-full group flex items-center gap-3 px-3 py-3 transition-all relative ${
                  link.active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-[#111] hover:text-blue-400'
                }`}
              >
                <span className={`text-[9px] font-bold ${link.active ? 'text-blue-200' : 'text-slate-700'}`}>{link.id}</span>
                {link.icon}
                <span className="text-[11px] font-black tracking-widest uppercase">{link.name}</span>
                {link.active && <div className="absolute left-0 top-0 h-full w-1 bg-white shadow-[0_0_10px_#fff]"></div>}
              </button>
            ))}
          </nav>

          <div className="p-4 bg-[#050505] border-t-2 border-[#1e293b]">
            <div className="space-y-4">
              
              {/* زر خروج مبسط للموظف */}
              <button 
                onClick={() => setShowExitConfirm(true)}
               style={{cursor:'pointer'}}
                className="w-full flex items-center justify-center gap-2 py-2 border border-[#1e293b] text-slate-400 bg-red-600 hover:bg-red-700 text-white hover:border-red-600 transition-all text-[11px] font-bold uppercase rounded"
              >
                <LogOut size={14} />
                <span className="tracking-widest text-[15px]" >LogOut</span>
              </button>

          
            </div>
          </div>
        </div>
      </aside>

      {/* بوب اب تأكيد بسيط وعملي */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 font-mono">
          <div className="w-80 bg-[#0f172a] border border-[#1e293b] shadow-2xl p-6 rounded-lg text-center">
            <h3 className="text-white text-sm font-bold mb-2" >تأكيد الخروج</h3>
            <p className="text-slate-400 text-xs mb-6">هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟</p>
            
            <div className="flex gap-3">
              <button 
              style={{cursor:'pointer'}}
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2 bg-[#1e293b] text-slate-300 hover:text-white rounded text-xs transition-colors"
              >
                إلغاء
              </button>
              <button 
              style={{cursor:'pointer'}}
                onClick={handleLogout}
                className="flex-1 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors"
              >
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencySidebar;