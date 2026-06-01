import React, { useState } from 'react';
import { 
  Megaphone, PlusCircle, UploadCloud, X, 
  Loader2, CheckCircle, AlertCircle, FileText 
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import Swal from 'sweetalert2';

const CreateAd = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: []
  });
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]); // لمعاينة الصور قبل الرفع

  // معالجة اختيار الملفات وعمل Preview
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFormData({ ...formData, files: selectedFiles });

    // إنشاء روابط للمعاينة
    const filePreviews = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type
    }));
    setPreviews(filePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      return Swal.fire('تنبيه', 'يرجى ملء العنوان والوصف على الأقل', 'warning');
    }

    setLoading(true);
    const data = new FormData();
    data.append('Title', formData.title);
    data.append('Description', formData.description);
    data.append('Type', 1); // القيمة الثابتة General كما طلبت

    if (formData.files.length > 0) {
      formData.files.forEach(file => {
        data.append('Files', file);
      });
    }

    try {
      await ApiAuthToken.post('/Admin/Create-Adds', data);
      
      Swal.fire({
        title: 'تم بنجاح!',
        text: 'تم نشر الإعلان الجديد بنجاح في النظام.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });

      // تفريغ النموذج بعد النجاح
      setFormData({ title: '', description: '', files: [] });
      setPreviews([]);
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire('خطأ', 'حدثت مشكلة أثناء رفع الإعلان، تأكد من حجم الملفات أو الصلاحيات.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center gap-4">
        <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
          <PlusCircle size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">نشر إعلان جديد</h1>
          <p className="text-sm text-slate-500 font-bold italic">أعلن عن أخبار البلدية أو التحديثات الهامة</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-widest">عنوان الإعلان</label>
              <input 
                type="text"
                placeholder="مثلاً: صيانة في منطقة حي النصر..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 px-1 uppercase tracking-widest">محتوى الإعلان</label>
              <textarea 
                rows="6"
                placeholder="اكتب تفاصيل الإعلان هنا..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 resize-none"
              ></textarea>
            </div>

            {/* Upload Area */}
            <div className="relative group">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center group-hover:border-emerald-400 group-hover:bg-emerald-50/50 transition-all duration-300">
                <UploadCloud size={40} className="mx-auto text-slate-300 mb-3 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm text-slate-500 font-black">اسحب المرفقات أو اضغط للاختيار</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">يدعم الصور، الفيديوهات، والملفات</p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
              نشر الإعلان الآن
            </button>
          </form>
        </div>

        {/* Previews & Info Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 mb-4 uppercase flex items-center gap-2">
              <AlertCircle size={14} className="text-emerald-500" /> معاينة المرفقات
            </h3>
            
            {previews.length === 0 ? (
              <div className="py-10 text-center border-2 border-dotted border-slate-100 rounded-2xl text-slate-300">
                <p className="text-[10px] font-bold">لا توجد ملفات مختارة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {previews.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    {file.type.startsWith('image/') ? (
                      <img src={file.url} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={24} className="text-slate-400" />
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        setPreviews(previews.filter((_, i) => i !== index));
                        setFormData({ ...formData, files: formData.files.filter((_, i) => i !== index) });
                      }}
                      className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-emerald-900 text-emerald-100 p-6 rounded-[2rem] shadow-sm">
            <h4 className="text-sm font-black mb-2">ملاحظة </h4>
            <p className="text-[10px] leading-relaxed opacity-80 font-bold">
              سيتم نشر هذا الإعلان كـ "إعلان عام" (General) بشكل تلقائي. سيظهر لجميع مستخدمي تطبيق PSRS فور الضغط على زر النشر.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateAd;