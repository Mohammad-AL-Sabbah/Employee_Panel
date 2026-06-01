import React, { useEffect } from 'react'; 
import { 
  User, Lock, Bell, Palette, Globe, 
  ChevronLeft, Camera, Shield, Eye, HelpCircle, Info, Check 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StandardSettings() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // تحديث عنوان المتصفح بناءً على اللغة
    document.title = `${t('settings_title')} | P.S.R.S`;
    
    // عند تحميل الصفحة، نتحقق من وجود لغة مخزنة في localStorage
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [t, i18n]);

  // دالة تبديل اللغة مع الحفظ في localStorage
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang); // حفظ اللغة المختارة
    document.documentElement.lang = newLang;
  };

  return (
    /* قمنا بتثبيت dir="rtl" هنا بناءً على طلبك ليبقى الاتجاه ثابتاً */
    <div className="min-h-screen pb-20 bg-gray-50 text-slate-900" dir="rtl">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600">{t('settings_and_privacy')}</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle size={22} className="text-slate-600" />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        
        {/* قسم الملف الشخصي */}
        <section className="flex items-center gap-4 p-4 rounded-xl mb-6 cursor-pointer hover:bg-gray-100 transition-colors bg-white border border-gray-200">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-emerald-500">
              <img src="https://ui-avatars.com/api/?name=Mohammad+Al+Sabbah&background=10b981&color=fff" alt="Profile" />
            </div>
            <div className="absolute bottom-0 left-0 bg-white p-1 rounded-full border shadow-sm text-emerald-500">
              <Camera size={14} />
            </div>
          </div>
          <div className="flex-1 text-right">
            <h2 className="font-bold text-lg text-slate-900">محمد الصباح</h2>
            <p className="text-sm text-slate-500">{t('view_profile')}</p>
          </div>
          <ChevronLeft size={20} className="text-gray-400" />
        </section>

        <div className="space-y-6">
          
          {/* المجموعة الأولى: الحساب */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">
              {t('account_settings')}
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow 
                icon={User} 
                title={t('personal_info')} 
                subtitle={t('update_personal_data')} 
              />
              <SettingRow 
                icon={Lock} 
                title={t('security_password')} 
                subtitle={t('change_password_desc')} 
              />
            </div>
          </div>

          {/* المجموعة الثانية: التفضيلات */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">
              {t('preferences')}
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow 
                icon={Bell} 
                title={t('notifications')} 
                subtitle={t('manage_alerts')} 
              />
              
              <div onClick={toggleLanguage}>
                <SettingRow 
                  icon={Globe} 
                  title={t('language')} 
                  subtitle={i18n.language === 'ar' ? 'العربية (فلسطين)' : 'English (US)'} 
                  isLast 
                  action={
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {i18n.language === 'ar' ? 'EN' : 'عربي'}
                      </span>
                      <ChevronLeft size={18} className="text-gray-400" />
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* المجموعة الثالثة: حول */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">
              {t('support_info')}
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow icon={Info} title={t('about_system')} />
              <SettingRow icon={Eye} title={t('usage_policy')} isLast />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const SettingRow = ({ icon: Icon, title, subtitle, action, isLast }) => {
  return (
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
};