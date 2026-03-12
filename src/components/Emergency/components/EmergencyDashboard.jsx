/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Wind, Droplets, Eye } from 'lucide-react';
import EmergencySidebar from './EmergencySidebar';
import EmergencyMap from './EmergencyMap';
import EmergencyHeader from './EmergencyHeader';
import ConnectionAlert from './ConnectionAlert';
import WeatherPanel from './WeatherPanel';

const EmergencyDashboard = () => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // --- حالة الربط بين الخريطة ولوحة الطقس ---
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    document.title = "لوحة تحكم الطوارئ";
    const icon = document.getElementById("icon");
    if (icon) icon.href = "icon.png";
  }, []);

  useEffect(() => {
    // 1. تحديث الوقت كل ثانية
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // 2. دالة تحديث حالة الإنترنت
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // 3. مراقبة أحداث الشبكة
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateOnlineStatus);
    }

    const statusInterval = setInterval(updateOnlineStatus, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(statusInterval);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateOnlineStatus);
      }
    };
  }, []);

  return (
    <div className="h-screen w-full bg-black text-slate-200 overflow-hidden flex flex-col font-mono" dir="rtl">
      
      {/* الهيدر العلوي */}
      <EmergencyHeader currentTime={currentTime} />

      {/* تنبيه انقطاع الاتصال */}
      <ConnectionAlert isDisconnected={!isOnline} />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 1. القائمة اليمنى (EmergencySidebar) */}
        <div className="relative flex shrink-0 z-[100]">
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-20 bg-[#1e293b] hover:bg-blue-600 border border-[#334155] flex items-center justify-center cursor-pointer z-[110] rounded-l-md transition-all group"
          >
            {isRightSidebarOpen ? 
              <ChevronRight size={14} className="text-white group-hover:scale-125 transition-transform" /> : 
              <ChevronLeft size={14} className="text-white group-hover:scale-125 transition-transform" />
            }
          </button>

          <motion.div 
            animate={{ width: isRightSidebarOpen ? 260 : 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="overflow-hidden bg-[#050505] border-l border-[#1e293b]"
          >
            <div className="w-[260px] h-full">
              <EmergencySidebar isOpen={true} />
            </div>
          </motion.div>
        </div>

        {/* 2. منطقة الخريطة المركزية - الوسيط الرئيسي */}
        <main className="flex-1 relative z-0 bg-black min-w-0 h-full">
          <EmergencyMap 
            onLocationSelect={(coords) => {
              console.log("Dashboard: New Coordinates Received", coords);
              setSelectedLocation(coords); // تخزين الإحداثيات في الأب
            }} 
            selectedCoords={selectedLocation} 
          />
        </main>

        {/* 3. لوحة الطقس اليسرى - تستقبل البيانات عبر البروبس */}
        <div className="z-[50] border-r border-[#1e293b]">
           <WeatherPanel selectedCoords={selectedLocation} />
        </div>

      </div>
    </div>
  );
};

export default EmergencyDashboard;