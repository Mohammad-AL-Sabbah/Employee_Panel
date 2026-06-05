import React, { useEffect, useState } from 'react';
import { 
  User, Lock, Bell, Globe, ChevronLeft, Camera, 
  Eye, HelpCircle, Info, Loader2, X, EyeOff, CheckCircle2, AlertCircle
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

export default function StandardSettings() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // حالة الـ Modal الخاص بتغيير كلمة المرور
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // إظهار وإخفاء كلمات المرور (العين)
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // بيانات الملف الشخصي
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    city: '',
    street: ''
  });

  // بيانات تغيير كلمة المرور
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // جلب بيانات الملف الشخصي عند تحميل المكون
  useEffect(() => {
    fetchProfileData();
    document.title = "الإعدادات والخصوصية | P.S.R.S";
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // تعديل الـ Endpoint ليتناسب مع هيكلية الـ AccountController لديك إذا كان مدمجاً، أو ابقائه حسب السيرفر
      const response = await ApiAuthToken.get('/Auth/Account/display-profile');
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
      // محاولة برمجية احتياطية للمسار في حال كان الـ Profile في مكان آخر
      try {
        const fallbackResponse = await ApiAuthToken.get('/Admin/display-profile');
        if (fallbackResponse.data) {
          setFormData({
            fullName: fallbackResponse.data.fullName || '',
            userName: fallbackResponse.data.userName || '',
            phoneNumber: fallbackResponse.data.phoneNumber || '',
            email: fallbackResponse.data.email || '',
            city: fallbackResponse.data.city || '',
            street: fallbackResponse.data.street || ''
          });
          if (fallbackResponse.data.profilePictureUrl) setImagePreview(fallbackResponse.data.profilePictureUrl);
        }
      } catch (err) {
        console.error('Failed fallback profile fetch');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // فحص قوة كلمة المرور الجديدة ومطابقتها للشروط الأمنية
  const checkPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, text: 'ضعيفة جداً', color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 3) return { score, text: 'متوسطة القوة (يفضل إضافة رموز/أرقام)', color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { score, text: 'قوية ومحمية', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = checkPasswordStrength(passwordData.newPassword);
  const isPasswordMatching = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword !== '';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، الحد الأقصى هو 5 ميجابايت');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('نوع الصورة غير مدعوم، يرجى اختيار JPEG أو PNG');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // تحديث بيانات الملف الشخصي
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

      let response;
      try {
        response = await ApiAuthToken.put('/Auth/Account/update-profile', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        response = await ApiAuthToken.put('/Admin/update-profile', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        alert('تم تحديث الملف الشخصي بنجاح');
        setEditMode(false);
        fetchProfileData();
        setSelectedImage(null);
      } else {
        alert(response.data.message || 'فشل التحديث');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'فشل التحديث');
    } finally {
      setUpdating(false);
    }
  };

  // إرسال طلب تغيير كلمة المرور إلى الـ Endpoint الموحد الصحيح [HttpPost]
  const handleChangePasswordSubmit = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('الرجاء تعبئة جميع حقول كلمات المرور');
      return;
    }

    if (!isPasswordMatching) {
      alert('كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور');
      return;
    }

    if (strength.score < 2) {
      alert('الرجاء اختيار كلمة مرور أقوى لحماية حسابك');
      return;
    }

    try {
      setPasswordLoading(true);
      // التعديل الجوهري هنا: استخدام الـ POST والمسار الصحيح بناءً على الكود الخاص بك
      const response = await ApiAuthToken.post('/Auth/Account/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        alert('تم تغيير كلمة المرور بنجاح! سيتم تسجيل خروجك لتأمين الجلسة.');
        
        localStorage.clear(); 
        sessionStorage.clear();
        window.location.href = '/login'; 
      } else {
        alert(response.data.message || 'فشل في تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور، تأكد من كلمة المرور القديمة وشروط الحماية');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Loader2 size={40} className="text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-slate-900 font-sans" dir="rtl">
      {/* شريط التنقل */}
      <nav className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm border-gray-200">
        <h1 className="text-xl font-bold text-emerald-600">الإعدادات والخصوصية</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <HelpCircle size={22} className="text-slate-600" />
        </button>
      </nav>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        
        {/* قسم الهيدر للملف الشخصي */}
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
            <h2 className="font-bold text-lg text-slate-900">{formData.fullName || 'زائر'}</h2>
            <p className="text-sm text-slate-500">{formData.userName ? `@${formData.userName}` : 'عرض الملف الشخصي'}</p>
          </div>
        </section>

        {/* وضع تعديل البيانات الشخصية */}
        {editMode && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <h3 className="font-bold text-lg text-right mb-4 text-emerald-600">تعديل البيانات الشخصية</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div>
                <label className="block text-right text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-right text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                    placeholder="المدينة"
                  />
                </div>
                <div>
                  <label className="block text-right text-sm font-medium text-gray-700 mb-1">الشارع</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right"
                    placeholder="الشارع"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-bold"
                >
                  {updating && <Loader2 size={18} className="animate-spin" />}
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchProfileData();
                    setSelectedImage(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* مجموعات الإعدادات والخيارات */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">إعدادات الحساب</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div onClick={() => setEditMode(!editMode)}>
                <SettingRow 
                  icon={User} 
                  titleText="البيانات الشخصية" 
                  subtitle="تحديث وتعديل بيانات حسابك وعناوينك" 
                />
              </div>
              <div onClick={() => setIsPasswordModalOpen(true)}>
                <SettingRow 
                  icon={Lock} 
                  titleText="الأمان وكلمة المرور" 
                  subtitle="تغيير كلمة المرور وحماية حسابك" 
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">التفضيلات</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow icon={Bell} titleText="الإشعارات التنبيهية" subtitle="إدارة التنبيهات المباشرة والرسائل" />
              <SettingRow 
                icon={Globe} 
                titleText="لغة التطبيق" 
                subtitle="العربية (فلسطين)" 
                isLast 
                action={
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">العربية</span>
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2 px-2 uppercase tracking-wide text-right">الدعم والمعلومات</h3>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <SettingRow icon={Info} titleText="حول النظام الذكي (P.S.R.S)" />
              <SettingRow icon={Eye} titleText="سياسة الاستخدام والخصوصية" isLast />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== Password Change Modal ==================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-2xl overflow-hidden text-right">
            
            {/* رأس المودال */}
            <div className="flex justify-between items-center bg-gray-50 px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Lock size={20} className="text-emerald-600" />
                تغيير كلمة المرور
              </h3>
              <button 
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }} 
                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* محتوى المودال */}
            <div className="p-5 space-y-4">
              
              {/* حقل كلمة المرور القديمة */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* حقل كلمة المرور الجديدة */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* مقياس وقوة كلمة المرور */}
                {passwordData.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
                      <span className="text-gray-400">مقياس الحماية</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-gray-200'}`} />
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-gray-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* حقل تأكيد كلمة المرور الجديدة ومطابقتها */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-right font-mono"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* رسالة فحص ومطابقة كلمتي المرور */}
                {passwordData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    {isPasswordMatching ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 size={14} /> كلمات المرور متطابقة تماماً
                      </span>
                    ) : (
                      <span className="text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle size={14} /> كلمات المرور غير متطابقة
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* أزرار الحفظ في المودال */}
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleChangePasswordSubmit}
                disabled={passwordLoading || !isPasswordMatching || strength.score < 2}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-sm"
              >
                {passwordLoading && <Loader2 size={18} className="animate-spin" />}
                تأكيد التغيير والحفظ
              </button>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-bold"
              >
                إلغاء
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const SettingRow = ({ icon: Icon, titleText, subtitle, action, isLast }) => {
  return (
    <div className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
        <Icon size={20} />
      </div>
      <div className="flex-1 text-right">
        <h4 className="font-bold text-[15px] text-slate-900">{titleText}</h4>
        {subtitle && <p className="text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      {action ? action : <ChevronLeft size={18} className="text-gray-400" />}
    </div>
  );
};