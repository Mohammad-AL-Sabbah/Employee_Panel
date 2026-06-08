import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ambulance, Shield, Flame, MapPin, Building, 
  Phone, Mail, Lock, User, ArrowLeft, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';
import EmergencySidebar from './EmergencySidebar';
import ApiAuthToken from '../../../Api/ApiAuthToken'; // تأكد من المسار الصحيح لهذا الملف

const AddFieldUnitView = () => {
  const [formData, setFormData] = useState({
    userName: '', // 🆕 اسم القائد
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    city: '',
    centerId: '',
    unitType: '3' 
  });

  const [centers, setCenters] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: null, message: '' });

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await ApiAuthToken.get('/emergency-employee/units-centers');
        setCenters(response.data);
      } catch (error) {
        console.error("فشل في جلب مراكز الطوارئ الميدانية:", error);
      }
    };
    fetchCenters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ success: null, message: '' });

    if (!formData.centerId) {
      setStatus({ success: false, message: 'الرجاء اختيار المركز الميداني الرئيسي التابع له الفريق أولاً.' });
      setLoading(false);
      return;
    }

    try {
      const response = await ApiAuthToken.post('/emergency-employee/add-emergency-unit-direct', {
        fullName: formData.userName, // 🆕 اسم القائد
        userName: formData. fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        city: formData.city,
        centerId: parseInt(formData.centerId),
        unitType: parseInt(formData.unitType)
      });

      if (response.data && response.data.success) {
        setStatus({ success: true, message: response.data.message || 'تم تسجيل وتفعيل وحدة الطوارئ بنجاح!' });
        setFormData({ userName: '', fullName: '', email: '', phoneNumber: '', password: '', city: '', centerId: '', unitType: '3' });
      } else {
        setStatus({ success: false, message: response.data.message || 'فشل في إضافة القوة الميدانية.' });
      }
    } catch (error) {
      console.error("خطأ أثناء الاتصال بالسيرفر:", error);
      setStatus({ success: false, message: error.response?.data?.message || 'حدث خطأ في الاتصال بالسيرفر.' });
    } finally {
      setLoading(false);
    }
  };

  const getUnitIcon = (type) => {
    switch (type) {
      case '1': return <Shield size={32} className="text-blue-500 animate-pulse" />;
      case '2': return <Flame size={32} className="text-orange-500 animate-pulse" />;
      default: return <Ambulance size={32} className="text-red-500 animate-pulse" />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
                    <Ambulance size={24} />
                  </span>
                  تسجيل وحدة ميدانية جديدة
                </h1>
              </div>
              <Link to="/FieldUnitsView" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all">
                <span>عرض كافة الوحدات</span>
                <ArrowLeft size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#0f0f0f] border border-slate-800/80 p-6 rounded-2xl shadow-xl">
                {status.success !== null && (
                  <div className={`p-4 mb-6 rounded-xl border flex items-start gap-3 text-sm ${status.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {status.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{status.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">اسم قائد الوحدة </label>
                      <input type="text" required name="userName" value={formData.userName} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">اسم الفرقة الميدانية </label>
                      <input type="text" required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">البريد الإلكتروني</label>
                      <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white text-left focus:border-blue-500 outline-none" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">كلمة المرور</label>
                      <input type="password" required name="password" value={formData.password} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">رقم التواصل</label>
                      <input type="text" required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">المدينة</label>
                      <input type="text" required name="city" value={formData.city} onChange={handleChange} className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">المركز الرئيسي</label>
                      <select name="centerId" value={formData.centerId} onChange={handleChange} required className="w-full bg-black/40 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none">
                        <option value="">اختر المركز...</option>
                        {centers.map(center => <option key={center.id} value={center.id}>{center.centerName}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/50 flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
                      {loading ? 'جاري التنفيذ...' : 'تثبيت وتفعيل الفرقة'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0f0f0f] border border-slate-800/80 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-white mb-4">معاينة بطاقة الفرقة</h3>
                  <div className="p-4 bg-black/60 border border-slate-800 rounded-xl relative">
                    <div className="absolute left-3 top-3">{getUnitIcon(formData.unitType)}</div>
                    <span className="text-sm font-bold text-slate-200">{formData.fullName || "اسم الفرقة"}</span>
                    <p className="text-xs text-slate-400 mt-2">القائد: {formData.userName || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default AddFieldUnitView;