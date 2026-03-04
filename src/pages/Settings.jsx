import React, { useEffect } from 'react'; 



import { 
  User, Lock, Bell, Palette, Globe, 
  ChevronLeft, Camera, Shield, Eye, HelpCircle, Info 
} from 'lucide-react';

export default function StandardSettings() {

  const title = useEffect(() =>{
document.title = " الإعدادات | P.S.R.S";
  },[]);


  return (
    
    <div className="min-h-screen pb-20 bg-gray-50 text-slate-900" dir="rtl">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600">الإعدادات والخصوصية</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle size={22} className="text-slate-600" />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        
        {/* قسم الملف الشخصي */}
        <section className="flex items-center gap-4 p-4 rounded-xl mb-6 cursor-pointer hover:bg-gray-100 transition-colors bg-white border border-gray-200">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-emerald-500">
              <img src="https://ui-avatars.com/api/?name=User&background=10b981&color=fff" alt="Profile" />
            </div>
            <div className="absolute bottom-0 left-0 bg-white p-1 rounded-full border shadow-sm text-emerald-500">
              <Camera size={14} />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-slate-900">محمد الصباح</h2>
            <p className="text-sm text-slate-500">عرض الملف الشخصي</p>
          </div>
          <ChevronLeft size={20} className="text-gray-400" />
        </section>

        {/* كتل الإعدادات */}
        <div className="space-y-6">
          
          {/* المجموعة الأولى: الحساب */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide">إعدادات الحساب</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow icon={User} title="المعلومات الشخصية" subtitle="تحديث الاسم  والبيانات الشخصية" />
              <SettingRow icon={Lock} title="كلمة المرور والأمان" subtitle="تغيير كلمة المرور والتحقق الثنائي" />
              
            </div>
          </div>

          {/* المجموعة الثانية: التفضيلات */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide">التفضيلات</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            
              <SettingRow icon={Bell} title="الإشعارات" subtitle="إدارة تنبيهات النظام والبلاغات" />
              <SettingRow icon={Globe} title="اللغة" subtitle="العربية (فلسطين)" isLast />
            </div>
          </div>

          {/* المجموعة الثالثة: حول */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide">الدعم والمعلومات</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow icon={Info} title="حول النظام" />
              <SettingRow icon={Eye} title="سياسة الاستخدام" isLast />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// مكون السطر الواحد
const SettingRow = ({ icon: Icon, title, subtitle, action, isLast }) => (
  <div className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
    <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
      <Icon size={20} />
    </div>
    <div className="flex-1 text-right">
      <h4 className="font-bold text-[15px] text-slate-900">{title}</h4>
      {subtitle && <p className="text-[13px] text-slate-500">{subtitle}</p>}
    </div>
    {action ? action : <ChevronLeft size={18} className="text-gray-400" />}
  </div>
  
);
  