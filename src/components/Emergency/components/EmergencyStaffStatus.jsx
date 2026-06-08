import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Users, RefreshCw, X, User, Search, ChevronRight, ChevronLeft, Upload, Mail, Phone, Lock, MapPin, Loader2 } from 'lucide-react';
import EmergencySidebar from './EmergencySidebar';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const EmergencyStaffStatus = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  
  const recordsPerPage = 8;

  // الحقول الأساسية للفورم
  const [formData, setFormData] = useState({
    fullName: "", 
    userName: "", 
    email: "", 
    phoneNumber: "", 
    password: "", 
    city: "", 
    profilePicture: null
  });

  // جلب موظفي الطوارئ من السيرفر
  const fetchEmergencyEmployees = async () => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get('/emergency-employee/emergency-employees');
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEmergencyEmployees(); 
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // منطق تصفية البحث للجدول
  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, staffList]);

  const totalPages = Math.ceil(filteredStaff.length / recordsPerPage) || 1;
  const currentRecords = filteredStaff.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // معالجة تغيير ومعاينة الصورة
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // إغلاق المودال وتفريغ الحقول
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImagePreview(null);
    setFormData({ 
      fullName: "", 
      userName: "", 
      email: "", 
      phoneNumber: "", 
      password: "", 
      city: "", 
      profilePicture: null 
    });
  };

  // دالة الحفظ المحدثة والمطابقة لـ Swagger
  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = new FormData();
      
      // 1. إضافة الحقول الأساسية المتوقعة من السيرفر بنظام PascalCase للمفاتيح
      data.append("FullName", formData.fullName.trim());
      data.append("UserName", formData.userName.trim());
      data.append("Email", formData.email.trim());
      data.append("PhoneNumber", formData.phoneNumber.trim());
      data.append("Password", formData.password);
      data.append("City", formData.city.trim());
      
      // نرسل الصورة فقط إذا تم اختيار ملف حقيقي لتجنب مشاكل الـ null النصي
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        data.append("ProfilePicture", formData.profilePicture);
      }
      
      // 2. إرسال الحقول الخفية المطلوبة في كواليس الفرونت إند بدقة
      data.append("Role", "EmergencyEmployee");
      data.append("UnitType", "");
      data.append("CenterId", parseInt(0, 10)); // تحويل صريح إلى رقم متوافق مع integer السيرفر

      // إرسال الطلب
      const response = await ApiAuthToken.post('/emergency-employee/add-emergency-employee', data, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201 || response.data) {
        alert("تم إضافة موظف الطوارئ بنجاح");
        handleCloseModal();
        fetchEmergencyEmployees();
      }
    } catch (error) {
      console.error("تفاصيل الخطأ الكاملة:", error.response?.data || error.message);
      const serverError = error.response?.data;
      let errorMessage = "حدث خطأ أثناء إضافة الموظف.";
      
      if (serverError && typeof serverError === 'object') {
        errorMessage = JSON.stringify(serverError);
      } else if (typeof serverError === 'string') {
        errorMessage = serverError;
      }
      
      alert(`فشلت الإضافة: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#030303] text-slate-300 antialiased font-sans" dir="rtl">
      <div className="flex flex-1 overflow-hidden">
        {/* القائمة الجانبية */}
        <aside className="w-64 border-l border-slate-900 bg-[#050505]">
          <EmergencySidebar isOpen={true} />
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#030303]">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* الهيدر وأدوات التحكم والبحث */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#070707] border border-slate-900 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                  <Users size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">موظفين الطوارئ</h1>
                  <p className="text-slate-500 text-sm mt-0.5">إدارة وتتبع موظفي الطوارئ الميدانيين</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute right-3.5 top-3 text-slate-500" size={18} />
                  <input 
                    placeholder="ابحث باسم الموظف أو البريد..." 
                    value={searchTerm}
                    className="w-64 bg-[#0c0c0c] border border-slate-800 focus:border-slate-700 p-2.5 pr-10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-colors" 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={fetchEmergencyEmployees} 
                  className="p-3 bg-[#0c0c0c] border border-slate-800 rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                  title="تحديث البيانات"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin text-emerald-500" : ""} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                >
                  <UserPlus size={18} />
                  إضافة موظف
                </button>
              </div>
            </div>

            {/* الجدول */}
            <div className="bg-[#050505] border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-[#090909] border-b border-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-5">الموظف المسؤول</th>
                      <th className="p-5">البريد الإلكتروني</th>
                      <th className="p-5">اسم المستخدم</th>
                      <th className="p-5">رقم الهاتف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="p-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                            <Loader2 size={32} className="animate-spin text-emerald-500" />
                            <span className="text-sm">جاري تحميل الكادر الميداني...</span>
                          </div>
                        </td>
                      </tr>
                    ) : currentRecords.length > 0 ? (
                      currentRecords.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/20 transition-colors group">
                          <td className="p-4 flex items-center gap-3.5">
                            <div className="relative">
                              {s.profilePictureUrl ? (
                                <img 
                                  src={s.profilePictureUrl} 
                                  alt={s.fullName} 
                                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-800 bg-slate-900"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-slate-900 ring-1 ring-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 transition-colors">
                                  <User size={20} />
                                </div>
                              )}
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#050505]"></div>
                            </div>
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">{s.fullName}</span>
                          </td>
                          <td className="p-4 text-slate-400 font-medium text-sm font-mono">{s.email || '—'}</td>
                          <td className="p-4 text-slate-400 font-medium text-sm">{s.userName}</td>
                          <td className="p-4 font-mono text-sm text-slate-400">{s.phoneNumber || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-16 text-center text-slate-600">
                          <User size={36} className="mx-auto mb-2 text-slate-800" />
                          <p className="text-sm">لم يتم العثور على أي موظفي طوارئ تطابق البحث.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* أزرار الصفحات الباجينيشن */}
              <div className="p-4 bg-[#080808] border-t border-slate-900 flex justify-between items-center text-sm">
                <span className="text-xs text-slate-500">
                  عرض <span className="text-slate-300 font-medium">{currentRecords.length}</span> من أصل <span className="text-slate-300 font-medium">{filteredStaff.length}</span> موظف
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1 || loading} 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    className="p-2 bg-[#121212] border border-slate-800 hover:border-slate-700 rounded-xl disabled:opacity-40 transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronRight size={18}/>
                  </button>
                  <span className="px-3 text-xs text-slate-400 font-medium">الصفحة {currentPage} من {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages || loading} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="p-2 bg-[#121212] border border-slate-800 hover:border-slate-700 rounded-xl disabled:opacity-40 transition-all text-slate-400 hover:text-white"
                  >
                    <ChevronLeft size={18}/>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* مودال إضافة الموظف */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className="bg-[#070707] border border-slate-800 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-[#0a0a0a]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <h2 className="text-lg font-bold text-white">تسجيل موظف طوارئ جديد</h2>
              </div>
              <button type="button" onClick={handleCloseModal} className="text-slate-500 hover:text-white p-1 hover:bg-slate-900 rounded-lg transition-colors">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* رفع الصورة الشخصية */}
              <div className="flex flex-col items-center justify-center bg-[#0c0c0c] border border-dashed border-slate-800 rounded-xl p-5 group hover:border-slate-700 transition-colors relative">
                <input 
                  type="file" 
                  id="profile-upload"
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
                <label htmlFor="profile-upload" className="cursor-pointer flex flex-col items-center text-center space-y-2 w-full">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30" />
                      <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">تغيير الصورة</div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 group-hover:bg-emerald-500/5 transition-all">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">رفع الصورة الشخصية للموظف</p>
                        <p className="text-xs text-slate-600 mt-0.5">يدعم JPG, PNG و WebP</p>
                      </div>
                    </>
                  )}
                </label>
              </div>

              {/* شبكة توزيع المدخلات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">الاسم الكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required value={formData.fullName} placeholder="الإسم الكامل" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">اسم المستخدم (ID)</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required value={formData.userName} placeholder="مثل:SalehNoor12" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, userName: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required type="email" value={formData.email} placeholder="example@gmail.com" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required value={formData.phoneNumber} placeholder="0599000000" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm font-mono text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">المدينة</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required value={formData.city} placeholder="رام الله" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">كلمة المرور المؤقتة</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 text-slate-600" size={16} />
                    <input required type="password" value={formData.password} placeholder="••••••••" className="w-full bg-[#0c0c0c] border border-slate-800 focus:border-emerald-600 p-2.5 pr-9 rounded-xl text-sm text-white focus:outline-none transition-colors" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* الأزرار السفلية */}
            <div className="p-4 bg-[#0a0a0a] border-t border-slate-900 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-colors">إلغاء</button>
              <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white rounded-xl text-sm font-bold min-w-[130px]">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "اعتماد ومزامنة"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmergencyStaffStatus;