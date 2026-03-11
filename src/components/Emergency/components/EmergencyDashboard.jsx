import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
// استيراد مكوناتك
import EmergencySidebar from './EmergencySidebar';
import EmergencyMap from './EmergencyMap';
import EmergencyHeader from './EmergencyHeader';

const EmergencyDashboard = () => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [leftPanel, setLeftPanel] = useState('none');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    // الدخول في وضع الشاشة الكاملة
    document.documentElement.requestFullscreen().catch((e) => {
      console.error(`Error attempting to enable full-screen mode: ${e.message}`);
    });
  } else {
    // الخروج من وضع الشاشة الكاملة
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};



  return (
    <div className="h-screen w-full bg-black text-slate-200 overflow-hidden flex flex-col font-mono" dir="rtl">
      <EmergencyHeader currentTime={currentTime} />

      <div className="flex flex-1 overflow-hidden relative bg-black">
        
        {/* --- منطقة العمل المركزية (الخريطة + الألواح) --- */}
        <main className="flex-1 flex relative z-0 overflow-hidden">
          
          {/* الخريطة: أزلنا أي Padding أو Margin لملء المساحة بالكامل */}
          <div className="flex-1 relative bg-black z-0 border-r border-[#1e293b]">
            <EmergencyMap />
          </div>

          {/* نظام الألواح اليسرى (VS Code Style) - ملتصق بالخريطة */}
          <div className="flex h-full bg-[#050505] z-[80]">
             {/* ... كود اللوحة اليسرى كما هو ... */}
          </div>
        </main>

        {/* --- الـ Sidebar اليمين مع كبسة الفتح الذكية --- */}
        <div className="relative flex z-[100]">
          
          {/* كبسة الفتح/الإغلاق: مثبتة دائماً على الحافة اليسرى للسيدبار */}
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-20 bg-[#1e293b] hover:bg-blue-600 border border-l-0 border-[#334155] flex items-center justify-center cursor-pointer transition-colors z-[110] rounded-l-md shadow-lg"
            title={isRightSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isRightSidebarOpen ? (
              <ChevronRight size={14} className="text-white" />
            ) : (
              <ChevronLeft size={14} className="text-white" />
            )}
          </button>

          {/* حاوية السيدبار مع أنيميشن سلس لضمان عدم وجود مسافات */}
          <motion.div 
            initial={false}
            animate={{ width: isRightSidebarOpen ? 260 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-black border-r border-[#1e293b]"
          >
            <div className="w-[260px] h-full">
              <EmergencySidebar isOpen={true} /> {/* نمرر true دائماً لأن الـ motion.div هو من يتحكم في العرض */}
            </div>
          </motion.div>
        </div>

      </div>
      
    </div>
  );
};

export default EmergencyDashboard;