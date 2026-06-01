import React, { useState, useEffect } from 'react';
import { Activity, Zap, Maximize, Minimize, User } from 'lucide-react';

const EmergencyHeader = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [connectionStrength, setConnectionStrength] = useState(4);
  const [time, setTime] = useState(new Date());
  
  // ✅ تثبيت الحالات بناءً على نموذج السيشن الخاص بك
  const [userName, setUserName] = useState("موظف الطوارئ");
  const [userRole, setUserRole] = useState("EmergencyEmployee");

  // 1. قراءة البيانات الحقيقية من sessionStorage فوراً عند تحميل المكون
  useEffect(() => {
    const name = sessionStorage.getItem("userName");
    const role = sessionStorage.getItem("userRole");
    
    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, []);

  // 2. تحديث الوقت كل ثانية وتغيير عنوان التبويب
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
    document.title = `نظام إدارة الطوارئ | PSRS`;
    link.rel = 'icon';
    link.href = '/icon.png'; 
    return () => clearInterval(timer);
  }, []);

  // 3. منطق إشارة الشبكة
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

  // دالة تحويل وتوطين الأدوار الوظيفية داخل واجهة الطوارئ
  const getRoleLabel = (role) => {
    switch(role) {
      case "SuperAdmin": return "مدير عام النظام";
      case "MunicipalEmployee": return "موظف البلدية";
      case "EmergencyEmployee": return "موظف الطوارئ";
      default: return "موظف مسؤول";
    }
  };

  return (
    <header className="h-14 w-full bg-black border-b-2 border-[#1e293b] flex items-center justify-between px-4 z-[100] font-mono select-none relative" dir="rtl">
      
      {/* القسم الأيمن: هوية الموظف الفعلي المستخرجة من الـ sessionStorage */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r-4 border-blue-600 bg-blue-950/20 px-4 py-1 rounded-l-md">
          <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-blue-500 animate-pulse" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[12px] font-bold text-blue-500 font-bold uppercase mt-1">
              {getRoleLabel(userRole)}
            </span>
            <span className="text-[12px] mt-2 text-white font-black leading-none tracking-tight">{userName}</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[10px]">
          <div className="w-[1px] h-6 bg-slate-800"></div>
          <div className="flex flex-col text-right">
            <span className="text-slate-500 font-bold">NODE_STATUS</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <Activity size={10} /> ACTIVE_SESSION
            </span>
          </div>
        </div>
      </div>

      {/* القسم الأوسط: شعار النظام التكتيكي */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none hidden sm:flex">
        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-blue-900"></div>
        <h1 className="text-sm font-black tracking-[0.4em] text-slate-300">
          DISPATCH <span className="text-blue-600">SYSTEM</span>
        </h1>
        <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-blue-900"></div>
      </div>

      {/* القسم الأيسر: الوقت، الشاشة الكاملة، والشبكة */}
      <div className="flex items-center gap-4">
        
        {/* ساعة النظام الحية */}
        <div className="bg-[#111] border border-slate-800 px-4 py-1 rounded flex flex-col items-center min-w-[120px]">
          <span className="text-[9px] text-slate-500 font-bold tracking-wider mb-0.5">الوقت الحالي</span>
          <span className="text-base font-black text-blue-500 leading-none tracking-tighter tabular-nums" dir="ltr">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>

        {/* زر ملء الشاشة التكتيكي */}
        <button 
          onClick={toggleFullScreen}
          className={`p-2 border transition-all flex flex-col items-center gap-0.5 group rounded cursor-pointer ${
            isFullScreen ? 'border-emerald-900/50 text-emerald-500 bg-emerald-950/10' : 'border-slate-800 text-slate-600 hover:border-blue-900/50 hover:text-blue-500'
          }`}
        >
          {isFullScreen ? <Minimize size={14} /> : <Maximize size={14} />}
          <span className="text-[7px] font-black tracking-tighter uppercase">Full Screen</span>
        </button>

        {/* مؤشر قوة الإشارة والاتصال */}
        <div className="flex flex-col gap-1 min-w-[65px] text-left" dir="ltr">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-1.5 transition-all duration-300 rounded-sm ${
                  i < connectionStrength 
                    ? (connectionStrength <= 1 ? 'bg-red-600 animate-pulse' : 'bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,0.5)]') 
                    : 'bg-slate-800'
                }`}
              ></div>
            ))}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-tighter block ${connectionStrength <= 1 ? 'text-red-500' : 'text-slate-500'}`}>
            {connectionStrength === 0 ? 'No Signal' : `Signal: ${connectionStrength * 20}%`}
          </span>
        </div>

        {/* زر تكتيكي إضافي */}
        <button className="p-2 hover:bg-red-950/30 text-slate-600 hover:text-red-500 border border-transparent hover:border-red-900/50 transition-all rounded cursor-pointer">
          <Zap size={16} />
        </button>
      </div>
    </header>
  );
};

export default EmergencyHeader;