import React, { useEffect, useState } from 'react';
import { 
  User, Lock, Bell, Palette, Globe, 
  ChevronLeft, Camera, Shield, Eye, HelpCircle, Info, Check, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ApiAuthToken from '../../../Api/ApiAuthToken';

export default function StandardSettings() {
  const { t, i18n } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    city: '',
    street: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // جلب بيانات الملف الشخصي
  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    document.title = `${t('settings_title')} | P.S.R.S`;
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [t, i18n]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await ApiAuthToken.get('/Admin/display-profile');
      if (response.data) {
        setProfileData(response.data);
        setFormData({
          fullName: response.data.fullName || '',
          userName: response.data.userName || '',
          phoneNumber: response.data.phoneNumber || '',
          email: response.data.email || '',
          city: response.data.city || '',
          street: response.data.street || ''
        });
        if (response.data.profilePictureUrl) {
          setImagePreview(response.data.profilePictureUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert(t('failed_to_load_profile') || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('image_size_too_large') || 'حجم الصورة كبير جداً');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert(t('invalid_image_type') || 'نوع الصورة غير مدعوم');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      const submitData = new FormData();
      
      if (formData.fullName) submitData.append('FullName', formData.fullName);
      if (formData.userName) submitData.append('UserName', formData.userName);
      if (formData.phoneNumber) submitData.append('PhoneNumber', formData.phoneNumber);
      if (formData.email) submitData.append('Email', formData.email);
      if (formData.city) submitData.append('City', formData.city);
      if (formData.street) submitData.append('Street', formData.street);
      if (selectedImage) submitData.append('NewProfilePicture', selectedImage);

      const response = await ApiAuthToken.put('/Admin/update-profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert(t('profile_updated_successfully') || 'تم تحديث الملف الشخصي بنجاح');
        setEditMode(false);
        fetchProfileData();
        setSelectedImage(null);
      } else {
        alert(response.data.message || t('update_failed') || 'فشل التحديث');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || t('update_failed') || 'فشل التحديث');
    } finally {
      setUpdating(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Loader2 size={40} className="text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-slate-900" dir="rtl">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600">{t('settings_and_privacy')}</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle size={22} className="text-slate-600" />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        
        {/* قسم الهيدر للملف الشخصي (عرض فقط مع إمكانية تغيير الصورة) */}
        <section className="flex items-center gap-4 p-4 rounded-xl mb-6 bg-white border border-gray-200 shadow-sm">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-emerald-500">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || 'User')}&background=10b981&color=fff`} 
                  alt="Profile" 
                />
              )}
            </div>
            {/* الضغط على أي مكان في الدائرة أو الأيقونة سيفتح اختيار ملف فقط */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={18} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            <label className="absolute bottom-0 left-0 bg-white p-1 rounded-full border shadow-sm text-emerald-500 cursor-pointer hover:bg-gray-50">
              <Camera size={14} />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <div className="flex-1 text-right">
            <h2 className="font-bold text-lg text-slate-900">{formData.fullName || t('guest')}</h2>
            <p className="text-sm text-slate-500">{formData.userName ? `@${formData.userName}` : t('view_profile')}</p>
          </div>
        </section>

        {/* وضع التعديل (يظهر فقط عند تفعيل editMode من القائمة بالأسفل) */}
        {editMode && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm animate-fadeIn">
            <h3 className="font-bold text-lg text-right mb-4 text-emerald-600">{t('edit_personal_info')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_full_name')}
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_username')}
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('phone_number')}</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_phone_number')}
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_email')}
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_city')}
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">{t('street')}</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder={t('enter_street')}
                />
              </div>

              {/* أزرار الحفظ والإلغاء في أسفل الحقول */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={18} className="animate-spin" />}
                  {t('save_changes')}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchProfileData();
                    setSelectedImage(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* المجموعة الأولى: الحساب */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">
              {t('account_settings')}
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              {/* عند الضغط هنا يفتح الـ editMode وتظهر الحقول */}
              <div onClick={() => setEditMode(!editMode)}>
                <SettingRow 
                  icon={User} 
                  title={t('personal_info')} 
                  subtitle={t('update_personal_data')} 
                />
              </div>
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