import React, { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Lock, Zap, Maximize, Minimize } from 'lucide-react';

const EmergencyHeader = ({ currentTime }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // مراقبة التغيير في وضع الشاشة (في حال ضغط المستخدم Esc)
  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <header className="h-14 bg-black border-b-2 border-[#1e293b] flex items-center justify-between px-4 z-[100] font-mono select-none">
      
      {/* القسم الأيمن: المعرفات الرقمية (نظام الـ CAD) */}
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

      {/* القسم الأيسر: عداد الوقت والتحكم بالواجهة */}
      <div className="flex items-center gap-4">
        {/* التوقيت العسكري */}
        <div className="bg-[#111] border border-slate-800 px-4 py-1 rounded flex flex-col items-center min-w-[120px]">
          <span className="text-[9px] text-slate-500 font-bold tracking-[0.2em] mb-0.5">ZULU_TIME</span>
          <span className="text-xl font-black text-blue-500 leading-none tracking-tighter tabular-nums">
            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
          </span>
        </div>

        {/* زر ملء الشاشة (التحديث الجديد) */}
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

        <div className="flex flex-col gap-1">
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-1 ${i < 4 ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
                ))}
            </div>
            <span className="text-[8px] text-slate-500 font-bold text-left uppercase">Signal</span>
        </div>

        <button className="ml-2 p-2 hover:bg-red-950/30 text-slate-600 hover:text-red-500 border border-transparent hover:border-red-900/50 transition-all">
          <Zap size={18} />
        </button>
      </div>

    </header>
  );
};

export default EmergencyHeader;