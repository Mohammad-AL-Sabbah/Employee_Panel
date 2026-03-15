import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Lock, Zap, Maximize, Minimize } from 'lucide-react';

const EmergencyHeader = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(4);
  // --- إضافة حالة للوقت لتحديثه حياً ---
  const [time, setTime] = useState(new Date());

  // 1. منطق تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    document.title = `السجلات الطبية  `;
    link.rel = 'icon';
    link.href = '/icon.png'; // تأكد من وجوده في مجلد public
    return () => clearInterval(timer);
    
  }, []);

  // 2. منطق إشارة الشبكة (محسن)
  useEffect(() => {
    const updateStatus = () => {
      const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (!navigator.onLine) {
        setConnectionStrength(0);
        return;
      }

      if (nav && nav.effectiveType) {
        if (nav.effectiveType === '4g') setConnectionStrength(5);
        else if (nav.effectiveType === '3g') setConnectionStrength(3);
        else setConnectionStrength(2);
      } else {
        setConnectionStrength(navigator.onLine ? 5 : 0);
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateStatus);
    }

    updateStatus();
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch((e) => console.error(e));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullScreen(false));
      }
    }
  };

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <header className="h-14 bg-black border-b-2 border-[#1e293b] flex items-center justify-between px-4 z-[100] font-mono select-none relative">
      
      {/* القسم الأيمن */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-l-4 border-blue-600 bg-blue-950/20 px-3 py-1">
          <ShieldAlert size={18} className="text-blue-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-500 font-bold leading-none">TERMINAL_ID</span>
            <span className="text-xs text-white font-black tracking-wider">PSRS-DXB-0911</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[10px]">
          <div className="flex flex-col">
            <span className="text-slate-500 font-bold">NODE_STATUS</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <Activity size={10} /> ACTIVE
            </span>
          </div>
          <div className="w-[1px] h-6 bg-slate-800"></div>
          <div className="flex flex-col">
            <span className="text-slate-500 font-bold">ENCRYPTION</span>
            <span className="text-amber-500 font-bold flex items-center gap-1">
              <Lock size={10} /> AES_256
            </span>
          </div>
        </div>
      </div>

      {/* القسم الأوسط */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-blue-900"></div>
        <h1 className="text-sm font-black tracking-[0.4em] text-slate-300">
          DISPATCH <span className="text-blue-600">SYSTEM</span>
        </h1>
        <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-blue-900"></div>
      </div>

      {/* القسم الأيسر */}
      <div className="flex items-center gap-4">
        <div className="bg-[#111] border border-slate-800 px-4 py-1 rounded flex flex-col items-center min-w-[120px]">
          <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mb-0.5">الوقت الحالي</span>
          <span className="text-xl font-black text-blue-500 leading-none tracking-tighter tabular-nums">
            {time.toLocaleTimeString( { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>

        <button 
          onClick={toggleFullScreen}
          className={`p-2 border transition-all flex flex-col items-center gap-0.5 group ${
            isFullScreen ? 'border-emerald-900/50 text-emerald-500 bg-emerald-950/10' : 'border-slate-800 text-slate-600 hover:border-blue-900/50 hover:text-blue-500'
          }`}
        >
          {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
          <span className="text-[7px] font-black tracking-tighter uppercase">Full Screen</span>
        </button>

        <div className="flex flex-col gap-1 min-w-[65px]">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-1.5 transition-all duration-300 ${
                  i < connectionStrength 
                    ? (connectionStrength <= 1 ? 'bg-red-600 animate-pulse' : 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.5)]') 
                    : 'bg-slate-800'
                }`}
              ></div>
            ))}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-tighter ${connectionStrength <= 1 ? 'text-red-500' : 'text-slate-500'}`}>
            {connectionStrength === 0 ? 'No Signal' : `Signal: ${connectionStrength * 20}%`}
          </span>
        </div>

        <button className="ml-2 p-2 hover:bg-red-950/30 text-slate-600 hover:text-red-500 border border-transparent hover:border-red-900/50 transition-all">
          <Zap size={18} />
        </button>
      </div>
    </header>
  );
};

export default EmergencyHeader;