import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Trash2, 
  X, Check, Mail, Phone, Shield, MapPin, 
  Clock, Heart, UserCircle, Camera, UploadCloud
} from 'lucide-react';

const ManageStaff = () => {
  const [staff, setStaff] = useState([
    { 
      id: 1, name: "محمد صباح", jobTitle: "مدير صيانة", 
      shift: "صباحي", socialStatus: "متزوج", address: "نابلس، فلسطين",
      role: "مسؤول", email: "m.sabah@psrs.com", phone: "0590000000", 
      status: "نشط", joinDate: "2024/01/10", image: null // الصورة افتراضياً null
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null); // مرجع لحقل رفع الملفات

  const [formData, setFormData] = useState({
    name: "", jobTitle: "", shift: "صباحي", socialStatus: "أعزب",
    address: "", role: "موظف", email: "", phone: "", status: "نشط", image: null
  });

  const closeModal = () => { setIsModalOpen(false); setEditingMember(null); };

  const openModal = (member = null) => {
    if (member) { setEditingMember(member); setFormData(member); }
    else { setFormData({ name: "", jobTitle: "", shift: "صباحي", socialStatus: "أعزب", address: "", role: "موظف", email: "", phone: "", status: "نشط", image: null }); }
    setIsModalOpen(true);
  };

  // دالة معالجة رفع الصورة (تحويلها لـ Base64 للعرض المؤقت)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result }); // تخزين الصورة كـ Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingMember) { setStaff(staff.map(m => m.id === editingMember.id ? { ...formData } : m)); }
    else { setStaff([...staff, { ...formData, id: Date.now(), joinDate: new Date().toLocaleDateString('ar-EG') }]); }
    closeModal();
  };

  return (
    <div className="p-8 w-full max-w-[1400px] mx-auto min-h-screen font-sans bg-slate-50/20" dir="rtl">
      
      {/* Header - هادئ واحترافي */}
      <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">إدارة شؤون الكادر البشري</h1>
          <p className="text-slate-400 text-sm mt-1">عرض وتعديل بيانات الموظفين وصلاحياتهم في نظام PSRS</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#10b981] hover:bg-[#0da371] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm text-sm font-semibold cursor-pointer"
        >
          <UserPlus size={18} />
          إضافة موظف جديد
        </button>
      </div>

      {/* البحث - بسيط ومركز */}
      <div className="relative mb-6 group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
        <input 
          type="text" placeholder="البحث عن موظف بالاسم أو الايميل..." 
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm text-slate-600 shadow-sm"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* الجدول - بساطة مطلقة مع الصورة */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-[12px] font-semibold border-b border-slate-100 tracking-wider">
              <th className="px-6 py-4">الموظف</th>
              <th className="px-6 py-4">المسمى والنوع</th>
              <th className="px-6 py-4">التواصل</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-left">التحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {/* عرض الصورة الشخصية أو الأيقونة الافتراضية */}
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={28} />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{member.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={10}/> {member.address}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-xs font-medium text-slate-600">{member.jobTitle}</div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{member.role}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                    <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {member.email}</div>
                    <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {member.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${member.status === 'نشط' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => openModal(member)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"><Edit3 size={16} /></button>
                    <button onClick={() => {}} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal - تصميم نحيف وأنيق مع الصورة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">بيانات الملف الشخصي</h3>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              {/* قسم تحميل الصورة الشخصية - التصميم الجديد */}
              <div className="flex flex-col items-center gap-4 border-b border-slate-50 pb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-2 border-slate-100 shadow-inner">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={60} />
                    )}
                  </div>
                  {/* زر الكاميرا للتحميل */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full shadow-lg border-2 border-white hover:bg-emerald-600 transition-all cursor-pointer"
                  >
                    <Camera size={16} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
                <p className="text-[10px] font-medium text-slate-400">انقر على الكاميرا لتحميل الصورة الشخصية للموظف (JPG, PNG)</p>
              </div>

              {/* شبكة الحقول - تنظيم مريح */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: "الاسم الكامل", key: "name", type: "text" },
                  { label: "المسمى الوظيفي", key: "jobTitle", type: "text" },
                  { label: "البريد الإلكتروني الرسمي", key: "email", type: "email" },
                  { label: "رقم الهاتف", key: "phone", type: "text" },
                  { label: "مكان السكن التفصيلي", key: "address", type: "text" }
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 mr-1">{field.label}</label>
                    <input 
                      required type={field.type} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                      value={formData[field.key]}
                      onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    />
                  </div>
                ))}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">نوع الحساب (الصلاحية)</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 outline-none cursor-pointer"
                    value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="موظف">موظف (صلاحيات محدودة)</option>
                    <option value="مسؤول">مسؤول (صلاحيات كاملة)</option>
                  </select>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex justify-end gap-3 mt-12 pt-6 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="px-6 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">إلغاء</button>
                <button type="submit" className="bg-slate-800 text-white px-8 py-2 rounded-lg text-xs font-semibold hover:bg-slate-900 transition-all shadow-sm cursor-pointer flex items-center gap-2">
                    <Check size={14}/>
                    حفظ بيانات الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;