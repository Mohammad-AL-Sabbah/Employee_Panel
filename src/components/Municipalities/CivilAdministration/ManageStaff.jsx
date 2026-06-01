import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Trash2, 
  X, Check, Mail, Phone, Shield, MapPin, 
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

  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingMember, setEditingMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fileInputRef = useRef(null);

  // 🔁 Role Mapping
  const mapRoleToEnglish = (role) =>
    role === "مسؤول" ? "SuperAdmin" : "MunicipalEmployee";

  const mapRoleToArabic = (role) =>
    role === "SuperAdmin" ? "مسؤول" : "موظف";

  // 🔁 Normalize
  const normalize = (u) => ({
    id: u.id,
    name: u.fullName,
    userName: u.userName,
    email: u.email,
    phone: u.phoneNumber,
    address: u.city,
    jobTitle: u.jobTitle,
    role: u.role,
    image: u.profilePictureUrl
  });

  // 📥 Fetch
  const fetchStaff = async () => {
    try {
      const res = await ApiAuthToken.get('/Admin/getAllStaff');
      const data = res.data?.data || [];
      setStaff(data.map(normalize));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 📂 Image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // 🧾 Open Modal
  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        userName: member.userName || "",
        email: member.email,
        phone: member.phone,
        address: member.address || "",
        jobTitle: member.jobTitle || "",
        role: mapRoleToArabic(member.role),
        password: "",
        image: member.image || null
      });
    } else {
      setEditingMember(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData(initialForm);
    setEditingMember(null);
    setIsModalOpen(false);
  };

  // 💾 Save
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

      if (editingMember) {
        await ApiAuthToken.put(`/Admin/update-staff/${editingMember.id}`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setStaff(prev =>
          prev.map(s => s.id === editingMember.id ? { ...s, ...formData } : s)
        );
      } else {
        const res = await ApiAuthToken.post(`/Admin/add-staff`, form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        if (res.data?.data) {
          setStaff(prev => [...prev, normalize(res.data.data)]);
        } else {
          fetchStaff();
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🗑 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("تأكيد الحذف؟")) return;
    try {
      await ApiAuthToken.delete(`/Admin/delete-staff/${id}`);
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("فشل الحذف");
    }
  };

  // 🔍 Filter
  const filtered = useMemo(() => {
    return staff.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 size={48} className="animate-spin text-emerald-500" />
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

      {/* Search */}
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

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">لا يوجد موظفون مطابقون للبحث</p>
          </div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[12px] font-semibold border-b border-slate-100 tracking-wider">
                <th className="px-6 py-4">الموظف</th>
                <th className="px-6 py-4">جهة الاتصال</th>
                <th className="px-6 py-4 text-center">الصلاحية</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle size={28} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{member.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Briefcase size={10} /> {member.jobTitle || "موظف"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[11px] text-slate-500 space-y-0.5 font-medium">
                      <div className="flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {member.email}</div>
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {member.phone}</div>
                      {member.address && (
                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" /> {member.address}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold ${
                      member.role === "SuperAdmin" 
                        ? "bg-amber-50 text-amber-700 border border-amber-200" 
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      <Shield size={12} />
                      {mapRoleToArabic(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1.5">
                      <button 
                        onClick={() => openModal(member)} 
                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                        title="تعديل"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(member.id)} 
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title="حذف"
                      >
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  {editingMember ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
                </h3>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
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
                <p className="text-[10px] font-medium text-slate-400">انقر على الكاميرا لتحميل الصورة الشخصية</p>
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
                    <Key size={12} /> كلمة المرور {!editingMember && <span className="text-rose-500">*</span>}
                  </label>
                  <input 
                    required={!editingMember}
                    type="password"
                    placeholder={editingMember ? "•••••••• (اتركه فارغاً للحفاظ على كلمة المرور الحالية)" : "كلمة مرور قوية (8 أحرف على الأقل)"}
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

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-6 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-slate-800 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSubmitting ? "جاري الحفظ..." : (editingMember ? "تحديث البيانات" : "حفظ الموظف")}
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