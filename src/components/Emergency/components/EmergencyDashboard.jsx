/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import EmergencySidebar from './EmergencySidebar';
import EmergencyMap from './EmergencyMap';
import EmergencyHeader from './EmergencyHeader';
import ConnectionAlert from './ConnectionAlert';
import WeatherPanel from './WeatherPanel';

const EmergencyDashboard = () => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isWeatherOpen, setIsWeatherOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // 1. مفتاح لتحديث الخريطة وإزالة المساحة البيضاء
  const [mapKey, setMapKey] = useState(0);

  // دالة لتحديث الخريطة عند انتهاء الأنميشن
  const refreshMap = useCallback(() => {
    setMapKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    document.title = "لوحة تحكم الطوارئ";
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return (
    <div className="h-screen w-full bg-black text-slate-200 overflow-hidden flex flex-col font-sans" dir="rtl">
      
      {/* الهيدر العلوي */}
      <EmergencyHeader />

      {/* تنبيه انقطاع الاتصال */}
      <ConnectionAlert isDisconnected={!isOnline} />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --------------------------------------------------------- */}
        {/* 1. القائمة اليمنى (Sidebar) - مع خاصية التحديث بعد الأنميشن */}
        {/* --------------------------------------------------------- */}
        <div className="relative flex shrink-0 z-[100]">
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-20 bg-[#1e293b] hover:bg-blue-600 border border-[#334155] flex items-center justify-center cursor-pointer z-[110] rounded-l-md transition-all group shadow-xl"
          >
            {isRightSidebarOpen ? 
              <ChevronRight size={14} className="text-white group-hover:scale-125 transition-transform" /> : 
              <ChevronLeft size={14} className="text-white group-hover:scale-125 transition-transform" />
            }
          </button>

          <motion.div 
            animate={{ width: isRightSidebarOpen ? 280 : 80 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            onAnimationComplete={refreshMap} // تحديث الخريطة فور استقرار العرض
            className="overflow-hidden bg-[#0a0a0a] border-l border-[#1e293b]"
          >
            <div className="w-[280px] h-full">
              <EmergencySidebar isOpen={isRightSidebarOpen} />
            </div>
          </motion.div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* 2. منطقة الخريطة المركزية - تستخدم Key لإعادة التشغيل بسلاسة */}
        {/* --------------------------------------------------------- */}
        <main className="flex-1 relative z-0 bg-black min-w-0 h-full">
          <EmergencyMap 
            key={mapKey} // هذا يضمن اختفاء المساحة البيضاء فوراً
            onLocationSelect={(coords) => setSelectedLocation(coords)} 
            selectedCoords={selectedLocation} 
          />
        </main>

        {/* --------------------------------------------------------- */}
        {/* 3. لوحة الطقس اليسرى (WeatherPanel) */}
        {/* --------------------------------------------------------- */}
        <div className="relative flex shrink-0 z-[100]">
          <button
            onClick={() => setIsWeatherOpen(!isWeatherOpen)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-20 bg-[#1e293b] hover:bg-blue-600 border border-[#334155] flex items-center justify-center cursor-pointer z-[110] rounded-r-md transition-all group shadow-xl"
          >
            {isWeatherOpen ? 
              <ChevronLeft size={14} className="text-white group-hover:scale-125 transition-transform" /> : 
              <ChevronRight size={14} className="text-white group-hover:scale-125 transition-transform" />
            }
          </button>

          <motion.div 
            animate={{ 
              width: isWeatherOpen ? 300 : 0,
              opacity: isWeatherOpen ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: "circOut" }}
            onAnimationComplete={refreshMap} // تحديث الخريطة أيضاً عند إغلاق/فتح الطقس
            className="overflow-hidden bg-[#0a0a0a] border-r border-[#1e293b]"
          >
            <div className="w-[300px] h-full">
               <WeatherPanel selectedCoords={selectedLocation} />
            </div>
          </motion.div>
        </div>

      </div>
      
      {/* تحسينات CSS إضافية */}
      <style>{`
        .framer-motion-container { will-change: width, opacity; }
        /* منع أي قفزة مفاجئة في المحتوى */
        main { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default EmergencyDashboard;