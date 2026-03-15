import { Outlet } from 'react-router-dom';
import EmergencySidebar from '../components/Emergency/components/EmergencySidebar';

const EmergencyLayout = () => {
  return (
    // 1. الحاوية الكبرى: نستخدم flex لتوزيع السايد بار والمحتوى عرضياً
    <div className="flex h-screen w-full overflow-hidden bg-black" dir="rtl">
      
      {/* 2. حاوية السايد بار: نعطيها عرضاً ثابتاً ونمنع انكماشها */}
      <div className="flex-shrink-0 z-50">
        <EmergencySidebar isOpen={true} />
      </div>

      {/* 3. منطقة المحتوى (الخريطة والداشبورد): تأخذ باقي المساحة flex-1 */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        
        {/* نلغي الـ padding هنا إذا كنت تريد الخريطة لتملأ الشاشة بالكامل */}
        <main className="flex-1 w-full h-full overflow-hidden relative">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
};

export default EmergencyLayout;