import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Calendar, Trash2, Edit, ExternalLink, 
  AlertCircle, Loader2, X, UploadCloud, CheckCircle 
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import Swal from 'sweetalert2';

const AllAds = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // 1. جلب الإعلانات - تم وضعها داخل useEffect لحل تحذير Cascading Renders
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await ApiAuthToken.get('/Admin/Display-All-Adds');
        setAnnouncements(response.data);
      } catch (error) {
        console.error("Error fetching ads:", error);
        // عرض تنبيه في حال فشل الـ Authorization (401)
        if (error.response?.status === 401) {
          Swal.fire('غير مصرح', 'انتهت جلستك، يرجى تسجيل الدخول مجدداً', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []); // مصفوفة فارغة لضمان التنفيذ مرة واحدة عند التحميل

  // 2. معالجة الحذف (لـ SuperAdmin)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف الإعلان والملفات المرفقة به نهائياً!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'تراجع'
    });

    if (result.isConfirmed) {
      try {
        await ApiAuthToken.delete(`/Admin/Delete-Add-${id}`);
        setAnnouncements(prev => prev.filter(ad => ad.id !== id));
        Swal.fire('تم الحذف!', 'تمت إزالة الإعلان بنجاح.', 'success');
      } catch (error) {
        Swal.fire('خطأ!', 'حدث خطأ أثناء محاولة الحذف.', 'error');
      }
    }
  };

  // 3. معالجة التحديث (Update)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    // استخدام FormData لأن الباك إند يستخدم [FromForm]
    const formData = new FormData();
    formData.append('Title', editModal.title);
    formData.append('Description', editModal.description);
    formData.append('Type', 1); // تثبيت القيمة على General كما طلبت

    // إضافة الملفات الجديدة فقط إذا اختارها المستخدم
    if (editModal.newFiles) {
      Array.from(editModal.newFiles).forEach(file => {
        formData.append('Files', file);
      });
    }

    try {
      await ApiAuthToken.put(`/Admin/Update-Add-${editModal.id}`, formData);
      Swal.fire('تم التحديث', 'تم تعديل بيانات الإعلان بنجاح', 'success');
      
      // تحديث القائمة محلياً دون الحاجة لإعادة طلب السيرفر بالكامل
      setAnnouncements(prev => prev.map(ad => 
        ad.id === editModal.id ? { ...ad, title: editModal.title, description: editModal.description } : ad
      ));
      
      setEditModal(null);
    } catch (error) {
      Swal.fire('خطأ', 'فشل في تحديث الإعلان، تأكد من حجم الملفات أو الصلاحيات', 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-emerald-500 bg-white">
      <Loader2 className="animate-spin mb-2" size={40} />
      <span className="font-bold tracking-widest">جاري جلب إعلانات PSRS...</span>
    </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">إعلانات البلدية</h1>
            <p className="text-xs text-slate-500 font-bold">مركز التحكم في المحتوى الإعلامي للنظام</p>
          </div>
        </div>
      </div>

      {/* Announcements Grid */}
      {announcements.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">لا توجد إعلانات منشورة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((ad) => (
            <div key={ad.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              {/* Image Preview */}
              <div className="h-52 bg-slate-100 relative overflow-hidden">
                {ad.files && ad.files.length > 0 ? (
                  <img 
                    src={ad.files[0]} 
                    alt={ad.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Megaphone size={48} strokeWidth={1} />
                  </div>
                )}
          ,
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3 font-black">
                  <Calendar size={12} className="text-emerald-500" />
                  {new Date(ad.createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' })}
                </div>
                <h3 className="text-md font-black text-slate-800 mb-2 line-clamp-1">{ad.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-2 h-8">{ad.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    <button 
                      style={{cursor:"pointer"}}
                      onClick={() => setEditModal(ad)}
                      className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                      title="تعديل الإعلان"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ad.id)}
                      style={{cursor:"pointer"}}
                      className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      title="حذف الإعلان"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
              
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditModal(null)}></div>
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-7 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2 rounded-xl text-white">
                  <Edit size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800">تعديل الإعلان</h2>
              </div>
              <button style={{cursor:"pointer"}} onClick={() => setEditModal(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 px-1">عنوان الإعلان</label>
                <input 
                  type="text"
                  required
                  value={editModal.title}
                  onChange={(e) => setEditModal({...editModal, title: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 px-1">وصف الإعلان</label>
                <textarea 
                  rows="4"
                  required
                  value={editModal.description}
                  onChange={(e) => setEditModal({...editModal, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 resize-none"
                ></textarea>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setEditModal({...editModal, newFiles: e.target.files})}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center group-hover:border-emerald-400 group-hover:bg-emerald-50/30 transition-all duration-300">
                  <UploadCloud size={32} className="mx-auto text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">رفع مرفقات جديدة</p>
                  <p className="text-[9px] text-slate-400 mt-1 italic">سيتم استبدال المرفقات القديمة في حال الرفع</p>
                  {editModal.newFiles && (
                    <div className="mt-3 bg-emerald-500 text-white text-[10px] py-1 px-3 rounded-full inline-block font-black">
                      تم اختيار {editModal.newFiles.length} ملفات
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={updateLoading}
                className="w-full py-4 bg-emerald-500 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-200 hover:bg-emerald-600 hover:shadow-emerald-300 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
              >
                {updateLoading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                تأكيد وحفظ التغييرات
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAds;