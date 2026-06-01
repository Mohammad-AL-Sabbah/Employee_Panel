import React, { useState } from 'react';
import EmergencyReportsPanel from '../../components/Emergency/components/EmergencyReportsPanel';
// افترضنا أن هذا هو مكون الخريطة لديك
import EmergencyMap from '../../components/Emergency/components/EmergencyMap'; 

const ReportsPage = () => {
  // تتبع الإحداثيات النشطة لإطلاق رادار التركيز (10 أمتار)
  const [radarLocation, setRadarLocation] = useState(null);

  const handleLocateOnMap = (lat, lng) => {
    if (lat && lng) {
      setRadarLocation({ lat, lng, timestamp: Date.now() });
    }
  };

  const handleViewAll = () => {
    console.log("الانتقال إلى أرشيف كافة البلاغات...");
    // هنا يمكنك استخدام useNavigate() للانتقال لصفحة الجدول الكامل إذا أردت لاحقاً
  };

  return (
    <div className="w-full h-[calc(100vh-64px)] flex bg-black overflow-hidden" dir="rtl">
      
      {/* منطقة الخريطة التفاعلية الرئيسية */}
      <div className="flex-1 h-full relative bg-slate-950">
        <EmergencyMap radarLocation={radarLocation} />
        
        {/* طبقة تكتيكية علوية لعرض حالة النظام داخل الخريطة */}
        <div className="absolute top-4 right-4 bg-black/80 border border-slate-800 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-mono text-emerald-400 pointer-events-none tracking-widest z-10">
          MAP_STATUS: ACTIVE_MONITORING
        </div>
      </div>

      {/* الـ Panel الجانبي المصلح الذي يسحب البيانات من الـ API */}
      <EmergencyReportsPanel 
        onLocateOnMap={handleLocateOnMap} 
        onViewAll={handleViewAll} 
      />

    </div>
  );
};

export default ReportsPage;