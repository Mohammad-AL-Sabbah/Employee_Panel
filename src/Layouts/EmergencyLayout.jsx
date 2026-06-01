/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import EmergencySidebar from '../components/Emergency/components/EmergencySidebar';
import EmergencyHeader from '../components/Emergency/components/EmergencyHeader'; 
import ApiAuthToken from '../Api/ApiAuthToken';
import { AlertCircle, X, MapPin, Shield, Ambulance, Flame, BellRing } from 'lucide-react';

const EmergencyLayout = () => {
  const [latestReport, setLatestReport] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const prevReportsIdsRef = useRef(new Set());
  const isFirstLoad = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();

  // فحص دقيق للمسارات لضمان عدم ظهور السايد بار في صفحة الخريطة البث المباشر
  const isMapPage = location.pathname.toLowerCase().includes('emergencyreportdetailsmap') || 
                    location.pathname.toLowerCase().includes('/emergency-reports/details');

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      const osc1 = audioCtx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc1.connect(gainNode);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.15);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, audioCtx.currentTime);
        osc2.connect(gainNode);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.18);
      }, 140);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const checkNewReports = async () => {
    try {
      const response = await ApiAuthToken.get('/emergency-employee/pending-reports');
      if (response && response.data) {
        const currentReports = response.data;
        
        if (isFirstLoad.current) {
          currentReports.forEach(r => prevReportsIdsRef.current.add(r.id));
          isFirstLoad.current = false;
          return;
        }

        const newReport = currentReports.find(r => !prevReportsIdsRef.current.has(r.id));

        if (newReport) {
          prevReportsIdsRef.current.add(newReport.id);
          setLatestReport(newReport);
          setShowToast(true);
          playAlertSound();

          setTimeout(() => {
            setShowToast(false);
          }, 10000);
        }
      }
    } catch (error) {
      console.error("Background layout monitoring error:", error);
    }
  };

  useEffect(() => {
    checkNewReports();
    const interval = setInterval(checkNewReports, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBadgeStyle = (type, title = "") => {
    const text = `${type || ""} ${title || ""}`;
    if (text.includes("اسعاف") || text.includes("إسعاف")) {
      return { text: "إسعاف فوري", color: "text-amber-400 border-amber-500/30 bg-amber-500/10", icon: <Ambulance size={16} /> };
    }
    if (text.includes("شرطة") || text.includes("امني")) {
      return { text: "استجابة أمنية", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", icon: <Shield size={16} /> };
    }
    if (text.includes("اطفاء") || text.includes("حريق") || text.includes("دفاع")) {
      return { text: "دفاع مدني", color: "text-red-400 border-red-500/30 bg-red-500/10", icon: <Flame size={16} /> };
    }
    return { text: "إشارة طوارئ", color: "text-rose-400 border-rose-500/30 bg-rose-500/10", icon: <AlertCircle size={16} /> };
  };

  const badge = latestReport ? getBadgeStyle(latestReport.emergencyType, latestReport.title) : null;

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col relative overflow-hidden" dir="rtl">
      
      {/* الـ Header الموحد الرئيسي للنظام العلوي */}
      <EmergencyHeader />

      {/* منطقة العرض السفلية المقسمة تكتيكياً بالـ Flex */}
      <div className="w-full h-[calc(100vh-60px)] relative flex overflow-hidden">
        
        {/* المكونات الداخلية المتغيرة ديناميكياً */}
        <main className="flex-1 h-full overflow-hidden relative z-10">
          <Outlet /> 
        </main>

        {/* السايد بار يظهر فقط خارج صفحة الخريطة */}
        {!isMapPage && (
          <div className="z-50 shrink-0 h-full">
            <EmergencySidebar isOpen={true} />
          </div>
        )}
        
      </div>

      {/* الإشعار اللحظي العائم المطور */}
      {showToast && latestReport && badge && (
        <div 
          onClick={() => {
            navigate(`/EmergencyReportDetailsMap`, { state: { reportId: latestReport.id } });
            setShowToast(false);
          }}
          className="fixed bottom-6 left-6 z-[10000] w-96 bg-[#050505]/95 border border-red-500/40 backdrop-blur-xl p-5 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.25)] flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-300 cursor-pointer group hover:border-red-500 transition-all"
          dir="rtl"
        >
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl h-fit text-red-500 relative flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-xl bg-red-500/20 opacity-75"></span>
            <BellRing size={20} className="relative z-10 animate-pulse" />
          </div>
          
          <div className="flex-1 text-right min-w-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-black uppercase tracking-wider ${badge.color}`}>
                {badge.icon}
                <span>{badge.text}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowToast(false);
                }} 
                className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-slate-900/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <h5 className="text-white font-black text-sm tracking-tight truncate group-hover:text-red-400 transition-colors">
              {latestReport.title || "حالة طارئة عاجلة"}
            </h5>
            
            <div className="flex items-center gap-1 text-slate-400 text-[11px] min-w-0">
              <MapPin size={12} className="text-red-500/70 flex-shrink-0" />
              <p className="truncate font-medium">{latestReport.addressName || latestReport.userAddress || "موقع جغرافي مباشر"}</p>
            </div>

            <div className="text-[9px] text-slate-500 font-mono font-bold pt-1 border-t border-slate-900/60 flex justify-between items-center">
              <span>البلاغ رقم: #{latestReport.id}</span>
              <span className="text-red-400/80 group-hover:underline">اضغط للمعاينة الفورية ←</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencyLayout;