import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Lock, Zap, Maximize, Minimize } from 'lucide-react';

const EmergencyHeader = ({ currentTime }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(4); // الافتراضي 4 أشرطة

  // --- منطق إشارة الشبكة الديناميكي ---
  useEffect(() => {
    const updateStatus = () => {
      // الوصول إلى معلومات الشبكة في المتصفح
      const nav = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (!navigator.onLine) {
        setConnectionStrength(0); // لا يوجد إنترنت
        return;
      }

      if (nav) {
        // تحديد القوة بناءً على نوع الشبكة (4g, 3g, etc) وزمن الاستجابة
        if (nav.effectiveType === '4g' && nav.rtt < 100) setConnectionStrength(5);
        else if (nav.effectiveType === '4g') setConnectionStrength(4);
        else if (nav.effectiveType === '3g') setConnectionStrength(3);
        else setConnectionStrength(2);
      } else {
        // في حال عدم دعم المتصفح لـ Network Information API
        setConnectionStrength(navigator.onLine ? 5 : 0);
      }
    };

    // مراقبة التغييرات في الاتصال
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateStatus);
    }

    updateStatus(); // تشغيل فوري عند التحميل

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  // دالة التحكم في ملء الشاشة
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch((e) => {
        console.error(`Error: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullScreen(false);
        });
      }
    }
  };

  // مراقبة التغيير في وضع الشاشة (Esc key)
  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <header className="h-14 bg-black border-b-2 border-[#1e293b] flex items-center justify-between px-4 z-[100] font-mono select-none">
      
      {/* القسم الأيمن: المعرفات الرقمية */}
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

      {/* القسم الأوسط: شعار النظام المركزي */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-blue-900"></div>
        <h1 className="text-sm font-black tracking-[0.4em] text-slate-300">
          DISPATCH <span className="text-blue-600">SYSTEM</span>
        </h1>
        <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-blue-900"></div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-[#111] border border-slate-800 px-4 py-1 rounded flex flex-col items-center min-w-[120px]">
          <span className="text-[15px] text-slate-500 font-bold tracking-[0.2em] mb-0.5">الوقت الحالي</span>
          <span className="text-xl font-black text-blue-500 leading-none tracking-tighter tabular-nums">
            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
          </span>
        </div>

        <button 
          onClick={toggleFullScreen}
          className={`p-2 border transition-all flex flex-col items-center gap-0.5 group ${
            isFullScreen ? 'border-emerald-900/50 text-emerald-500 bg-emerald-950/10' : 'border-slate-800 text-slate-600 hover:border-blue-900/50 hover:text-blue-500'
          }`}
          title="TACTICAL_VIEW (F11 Override)"
        >
          {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
          <span className="text-[7px] font-black tracking-tighter uppercase">Full Screen</span>
        </button>

        {/* القسم المحدث: Signal Strength */}
        <div className="flex flex-col gap-1 min-w-[65px]">
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-1 transition-all duration-500 ${
                        i < connectionStrength 
                          ? (connectionStrength <= 1 ? 'bg-red-600 animate-pulse' : 'bg-blue-600') 
                          : 'bg-slate-800'
                      }`}
                    ></div>
                ))}
            </div>
            <span className={`text-[8px] font-bold text-left uppercase ${connectionStrength <= 1 ? 'text-red-500' : 'text-slate-500'}`}>
              {connectionStrength === 0 ? 'No Signal' : 'Signal'}
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