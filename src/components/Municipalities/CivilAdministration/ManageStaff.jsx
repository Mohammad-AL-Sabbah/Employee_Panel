import React, { useState, useRef } from 'react';
import { 
  UserPlus, Mail, Phone, Shield, MapPin, 
  UserCircle, Camera, Loader2, Briefcase, Key, Save, User
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const ManageStaff = () => {

  const initialForm = {
    name: "",
    userName: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    role: "موظف",
    password: "",
    image: null
  };

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // 🔁 Role Mapping
  const mapRoleToEnglish = (role) =>
    role === "مسؤول" ? "SuperAdmin" : "MunicipalEmployee";

  // 📂 Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // 💾 Save / Submit
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();

      form.append("FullName", formData.name);
      form.append("UserName", formData.userName);
      form.append("Email", formData.email);
      form.append("PhoneNumber", formData.phone);
      form.append("City", formData.address || "");
      form.append("Role", mapRoleToEnglish(formData.role));

      if (formData.password) {
        form.append("Password", formData.password);
      }

      if (formData.image && formData.image.startsWith("data:")) {
        const blob = await (await fetch(formData.image)).blob();
        form.append("ProfilePicture", blob, "profile.png");
      }

      await ApiAuthToken.post(`/Admin/add-staff`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("تم إضافة الموظف بنجاح");
      setFormData(initialForm); // تفريغ الحقول بعد النجاح
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "خطأ أثناء إضافة الموظف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-[900px] mx-auto min-h-screen font-sans bg-slate-50/20" dir="rtl">
      
      {/* Header */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">إضافة كادر بشري جديد</h1>
        <p className="text-slate-400 text-sm mt-1">قم بتعبئة البيانات أدناه لإنشاء حساب موظف أو مسؤول جديد في نظام PSRS</p>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-8 space-y-6">
          
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-4 border-b border-slate-100 pb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-2 border-slate-200 shadow-inner">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={60} />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full shadow-lg border-2 border-white hover:bg-emerald-600 transition-all cursor-pointer"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
            <p className="text-[10px] font-medium text-slate-400">انقر على الكاميرا لتحميل الصورة الشخصية للموظف</p>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <User size={12} /> الاسم الكامل <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="text"
                placeholder="مثال: أحمد محمد"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <User size={12} /> اسم المستخدم <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="text"
                placeholder="أحمد123"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.userName}
                onChange={e => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Mail size={12} /> البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="email"
                placeholder="example@psrs.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Phone size={12} /> رقم الهاتف <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="tel"
                placeholder="059xxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Briefcase size={12} /> المسمى الوظيفي
              </label>
              <input 
                type="text"
                placeholder="مدير، مهندس، فني..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.jobTitle}
                onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <MapPin size={12} /> العنوان / المدينة
              </label>
              <input 
                type="text"
                placeholder="نابلس، رام الله..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Key size={12} /> كلمة المرور <span className="text-rose-500">*</span>
              </label>
              <input 
                required
                type="password"
                placeholder="كلمة مرور قوية (8 أحرف على الأقل)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Shield size={12} /> نوع الحساب
              </label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 outline-none cursor-pointer"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="موظف">موظف (صلاحيات محدودة - MunicipalEmployee)</option>
                <option value="مسؤول">مسؤول (صلاحيات كاملة - SuperAdmin)</option>
              </select>
            </div>
          </div>

          {/* Form Action Button */}
          <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#10b981] text-white px-10 py-3 rounded-xl text-sm font-semibold hover:bg-[#0da371] transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
              {isSubmitting ? "جاري الحفظ وإرسال الطلب..." : "إضافة الموظف للنظام"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageStaff;