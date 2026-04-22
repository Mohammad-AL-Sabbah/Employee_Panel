import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Trash2, 
  X, Check, Mail, Phone, MapPin, 
  UserCircle, Camera, Loader2
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", 
    jobTitle: "", 
    address: "", 
    role: "موظف", 
    email: "", 
    phone: "", 
    image: null,
    password: ""
  });

  // دالة لتحويل الدور من العربية إلى الإنجليزية
  const mapRoleToEnglish = (arabicRole) => {
    switch(arabicRole) {
      case "مسؤول":
        return "SuperAdmin";
      case "موظف":
        return "MunicipalEmployee";
      default:
        return "MunicipalEmployee";
    }
  };

  // دالة لتحويل الدور من الإنجليزية إلى العربية
  const mapRoleToArabic = (englishRole) => {
    switch(englishRole) {
      case "SuperAdmin":
        return "مسؤول";
      case "MunicipalEmployee":
        return "موظف";
      default:
        return "موظف";
    }
  };

  // جلب بيانات الموظفين
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get('/Admin/getAllStaff');
      
      if (response.data && response.data.data) {
        setStaff(response.data.data);
      } else if (Array.isArray(response.data)) {
        setStaff(response.data);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const closeModal = () => { 
    setIsModalOpen(false); 
    setEditingMember(null); 
    setFormData({
      name: "", 
      jobTitle: "", 
      address: "", 
      role: "موظف", 
      email: "", 
      phone: "", 
      image: null,
      password: ""
    });
  };

  const openModal = (member = null) => {
    if (member) { 
      setEditingMember(member); 
      setFormData({ 
        name: member.name || member.fullName || "", 
        jobTitle: member.jobTitle || "", 
        address: member.address || member.city || "", 
        role: mapRoleToArabic(member.role || "MunicipalEmployee"), 
        email: member.email || "", 
        phone: member.phoneNumber || member.phone || "", 
        image: member.image || member.profilePictureUrl || null,
        password: ""
      }); 
    } else { 
      setFormData({ 
        name: "", 
        jobTitle: "", 
        address: "", 
        role: "موظف", 
        email: "", 
        phone: "", 
        image: null,
        password: ""
      }); 
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // حفظ الموظف
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        fullName: formData.name,
        userName: formData.email,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        city: formData.address,
        role: mapRoleToEnglish(formData.role)
      };
      
      if (editingMember) {
        await ApiAuthToken.put(`/Admin/update-staff/${editingMember.id}`, payload);
      } else {
        await ApiAuthToken.post('/Admin/add-staff', payload);
      }
      
      fetchStaff();
      closeModal();
    } catch (error) {
      console.error("Error saving staff:", error);
      const errorMessage = error.response?.data?.message || "حدث خطأ أثناء حفظ البيانات";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // حذف الموظف
  const handleDelete = async (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف الموظف "${name}"؟`)) {
      try {
        await ApiAuthToken.delete(`/Admin/delete-staff/${id}`);
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("حدث خطأ أثناء حذف الموظف");
      }
    }
  };

  // فلترة الموظفين
  const filteredStaff = staff.filter(member => 
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 w-full max-w-[1400px] mx-auto min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-[1400px] mx-auto min-h-screen font-sans bg-slate-50/20" dir="rtl">
      
      {/* Header */}
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

      {/* البحث */}
      <div className="relative mb-6 group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="البحث عن موظف بالاسم أو الايميل..." 
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm text-slate-600 shadow-sm"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* الجدول */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">لا يوجد موظفون مطابقون للبحث</p>
          </div>
        ) : (
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
              {filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                        {member.profilePictureUrl || member.image ? (
                          <img src={member.profilePictureUrl || member.image} alt={member.name || member.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={28} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{member.name || member.fullName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={10}/> {member.address || member.city || "غير محدد"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-medium text-slate-600">{member.jobTitle || "موظف"}</div>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">{mapRoleToArabic(member.role)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                      <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {member.email}</div>
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {member.phoneNumber || member.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">
                      نشط
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openModal(member)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all cursor-pointer">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(member.id, member.name || member.fullName)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[1px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">{editingMember ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-8">
              {/* قسم الصورة */}
              <div className="flex flex-col items-center gap-4 border-b border-slate-50 pb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-2 border-slate-100 shadow-inner">
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
                <p className="text-[10px] font-medium text-slate-400">انقر على الكاميرا لتحميل الصورة الشخصية</p>
              </div>

              {/* الحقول */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">الاسم الكامل *</label>
                  <input 
                    required type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">المسمى الوظيفي</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">البريد الإلكتروني *</label>
                  <input 
                    required type="email" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">رقم الهاتف *</label>
                  <input 
                    required type="tel" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">مكان السكن</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">كلمة المرور {!editingMember && "*"}</label>
                  <input 
                    type="password" 
                    required={!editingMember}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 focus:border-emerald-500/30 outline-none transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingMember ? "اتركه فارغاً للحفاظ على كلمة المرور الحالية" : "أدخل كلمة المرور"}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 mr-1">نوع الحساب</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-600 outline-none cursor-pointer"
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="موظف">موظف (MunicipalEmployee)</option>
                    <option value="مسؤول">مسؤول (SuperAdmin)</option>
                  </select>
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex justify-end gap-3 mt-12 pt-6 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="px-6 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-slate-800 text-white px-8 py-2 rounded-lg text-xs font-semibold hover:bg-slate-900 transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {isSubmitting ? "جاري الحفظ..." : (editingMember ? "تحديث" : "حفظ")}
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