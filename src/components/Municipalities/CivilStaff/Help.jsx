/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, BookOpen, MessageSquare, 
  ChevronDown, Video, FileText, LifeBuoy, 
  Send, AlertCircle, CheckCircle2, X, Upload, 
  Tag, AlignLeft, Info, Loader2, History, Calendar, Eye
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken'; // استيراد كائن الاتصال المركزي الخاص بك
import Swal from 'sweetalert2'; // استيراد التنبيهات المتناسقة مع مشروعك

export default function HelpPortal() {
  useEffect(() => {
    document.title = "المساعدة والدعم | P.S.R.S";
    fetchMyTickets(); // جلب التذاكر تلقائياً عند تحميل الصفحة
  }, []);

  // إدارة التبويب النشط (مركز المساعدة أو تاريخ بلاغاتي)
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' أو 'history'

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // حالات حقول التذكرة الجديدة
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('أعطال تقنية');
  const [description, setDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('عادية');
  const [attachments, setAttachments] = useState([]); 

  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]); // لمعاينة الصور قبل الرفع

  // حالات جلب التذاكر الخاصة بالموظف
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // لعرض تفاصيل تذكرة معينة

  const fileInputRef = useRef(null);

  const faqs = [
    { 
      question: "كيف أقوم بتحويل بلاغ إلى فريق صيانة ميداني؟", 
      answer: "من لوحة التحكم الرئيسية، اضغط على 'البلاغات الواردة'، اختر البلاغ المعني، ثم اضغط على زر 'تعيين فريق'." 
    },
    { 
      question: "اذا لاحظت أن البلاغ يخص الأمن أو يهدد أمن المواطنين", 
      answer: "يجب عدم التعامل مع البلاغ من طرف الموظف وإبلاغ الجهة الأمنية المعنية فوراً بتفاصيل البلاغ." 
    }
  ];

  const priorities = [
    { id: 'low', label: 'عادية', activeClass: 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' },
    { id: 'medium', label: 'متوسطة', activeClass: 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' },
    { id: 'high', label: 'عاجلة', activeClass: 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' }
  ];

  // دالة جلب التذاكر من الباك إند
  const fetchMyTickets = async () => {
    setTicketsLoading(true);
    try {
      const response = await ApiAuthToken.get('/Admin/Employee-History-Tickets');
      setMyTickets(response.data);
    } catch (error) {
      console.error("Error fetching employee tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // معالجة اختيار الملفات وإنشاء الروابط للمعاينة
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (selectedFiles.length + attachments.length > 5) {
        return Swal.fire('تنبيه', 'لا يمكنك رفع أكثر من 5 صور كحد أقصى للتذكرة الواحدة.', 'warning');
      }

      setAttachments((prev) => [...prev, ...selectedFiles]);

      const filePreviews = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setPreviews((prev) => [...prev, ...filePreviews]);
    }
  };

  // حذف صورة مضافة قبل الإرسال
  const removeAttachment = (indexToRemove) => {
    setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // دالة إرسال التذكرة
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      return Swal.fire('تنبيه', 'يرجى ملء عنوان المشكلة وشرح التفاصيل', 'warning');
    }

    setLoading(true);

    const data = new FormData();
    data.append('Subject', subject);
    data.append('Description', description);
    data.append('Category', category);
    data.append('Priority', selectedPriority);

    if (attachments.length > 0) {
      attachments.forEach((file) => {
        data.append('Attachments', file); 
      });
    }

    try {
      await ApiAuthToken.post('/Admin/Create-Support-Ticket', data);

      Swal.fire({
        title: 'تم بنجاح!',
        text: 'تم إنشاء تذكرة الدعم الفني بنجاح وجاري متابعتها.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
      
      // تفريغ النموذج وإغلاق النافذة وتحديث القائمة
      setSubject('');
      setDescription('');
      setCategory('أعطال تقنية');
      setSelectedPriority('عادية');
      setAttachments([]);
      setPreviews([]);
      setIsModalOpen(false);
      
      // إعادة جلب التذاكر لتظهر التذكرة الجديدة فوراً
      fetchMyTickets();
      setActiveTab('history'); // تحويل الموظف تلقائياً لجدول تذاكره ليرى بلاغه المرفوع

    } catch (error) {
      console.error("Ticket upload error:", error);
      Swal.fire('خطأ', 'حدثت مشكلة أثناء إرسال التذكرة، تأكد من تسجيل الدخول بحساب موظف (MunicipalEmployee).', 'error');
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة لتلوين وحساب ستايل الحالات القادمة من المابينج العربي في السيرفر
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'نشط':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'معلق':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'مغلق':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-emerald-600 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight text-shadow-sm">كيف يمكننا مساعدتك اليوم؟</h1>
          <p className="text-emerald-100 mb-6 font-medium">مركز الدعم الفني والتقني الموحد لنظام PSRS</p>
          
          {/* Tabs Switcher التحكم بنظام التبويب بلمسة هندسية مدمجة */}
          <div className="inline-flex bg-emerald-700/50 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/30 shadow-inner">
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'portal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white hover:bg-emerald-600/50'}`}
            >
              <LifeBuoy size={16} /> مركز المساعدة
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white hover:bg-emerald-600/50'}`}
            >
              <History size={16} /> تذاكري({myTickets.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-12 px-6 relative z-20">
        
        {/* VIEW 1: مركز المساعدة والأسئلة الشائعة */}
        {activeTab === 'portal' && (
          <div className="animate-in fade-in duration-300">
            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <HelpCard icon={BookOpen} title="دليل الاستخدام" desc="شروحات لإدارة البلاغات والفرق" color="text-blue-600" bg="bg-blue-50" />
              <HelpCard icon={Video} title="دروس فيديو" desc="مقاطع مرئية سريعة للميزات الجديدة" color="text-purple-600" bg="bg-purple-50" />
              <HelpCard icon={FileText} title="سجلات النظام" desc="متابعة عمليات الرقابة والتدقيق" color="text-emerald-600" bg="bg-emerald-50" />
            </div>

            <div className="grid grid-cols-12 gap-8">
              {/* FAQ Section */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                    <LifeBuoy className="text-emerald-500" /> الأسئلة الشائعة
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden transition-all">
                        <button 
                          onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                          className="w-full flex justify-between items-center p-5 bg-slate-50/30 hover:bg-slate-50 transition-colors text-right outline-none cursor-pointer"
                        >
                          <span className="font-bold text-slate-700 text-sm">{faq.question}</span>
                          <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`} />
                        </button>
                        {activeAccordion === index && (
                          <div className="p-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 bg-white animate-in slide-in-from-top-2">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Action */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                  <h4 className="text-lg font-bold mb-4">لم تجد حلاً؟</h4>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed font-medium">فريقنا التقني مستعد للرد على استفساراتك في أي وقت.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-emerald-900/40 active:scale-95"
                  >
                    <MessageSquare size={18} /> فتح تذكرة دعم
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: جدول وبطاقات "بلاغاتي والدعم الفني" لقراءة الحالات المحدثة من الـ SuperAdmin */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <History className="text-emerald-500" /> سجل بلاغات الدعم المرفوعة
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">تابع حالة استجابة المسؤولين لبلاغاتك التقنية</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-3 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-100"
              >
                <MessageSquare size={14} /> تذكرة جديدة
              </button>
            </div>

            {ticketsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 size={36} className="animate-spin text-emerald-500" />
                <span className="text-xs font-bold">جاري تحميل تذاكر الدعم الفني...</span>
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <h4 className="font-bold text-slate-700 text-sm mb-1">لا يوجد أي تذاكر دعم فني حالياً</h4>
                <p className="text-xs text-slate-400 font-medium">كل البلاغات التي تقوم برفعها للمسؤولين ستظهر هنا وبحالاتها المحدثة.</p>
              </div>
            ) : (
              // تصميم جدول مستجيب ومدمج مخصص لعرض البلاغات بكفاءة عالية
              <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-tight border-b border-slate-100">
                      <th className="p-4">رقم البلاغ</th>
                      <th className="p-4">العنوان الرئيسي</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">الأولوية</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">تاريخ الرفع</th>
                      <th className="p-4 text-center">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                    {myTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-slate-400 font-mono">#{ticket.id}</td>
                        <td className="p-4 max-w-[180px] truncate">{ticket.subject}</td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-[10px]">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] ${ticket.priority === 'عاجلة' ? 'text-rose-600' : ticket.priority === 'متوسطة' ? 'text-amber-600' : 'text-blue-600'}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] border font-black ${getStatusBadgeStyle(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {new Date(ticket.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 rounded-xl transition-all cursor-pointer"
                            title="عرض تفاصيل التذكرة كاملة"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- نافذة النموذج (Modal): إنشاء تذكرة جديدة --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">تذكرة دعم جديدة</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">يرجى توضيح المشكلة بدقة</p>
                </div>
              </div>
              <button 
                onClick={() => { if(!loading) setIsModalOpen(false); }}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-all shadow-sm"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Wrap */}
            <form onSubmit={handleSubmitTicket}>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                      <Info size={14} className="text-emerald-500" /> عنوان المشكلة
                    </label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="مثال: تعذر الوصول للتقارير" 
                      className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                      <Tag size={14} className="text-emerald-500" /> القسم
                    </label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none transition-all"
                      >
                        <option value="أعطال تقنية">أعطال تقنية</option>
                        <option value="صيانة ميدانية">صيانة ميدانية</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                      <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                    <AlignLeft size={14} className="text-emerald-500" /> شرح التفاصيل
                  </label>
                  <textarea 
                    rows="4" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب هنا تفاصيل المشكلة، الخطوات التي أدت لظهورها، والنتيجة المتوقعة..." 
                    className="w-full bg-slate-50 border-none rounded-[2rem] py-4 px-5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all min-h-[120px]"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                      <AlertCircle size={14} className="text-rose-500" /> درجة الأولوية
                    </label>
                    <div className="flex gap-2">
                      {priorities.map((p) => (
                        <button 
                          key={p.id}
                          type="button" 
                          onClick={() => setSelectedPriority(p.label)}
                          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black border transition-all cursor-pointer 
                            ${selectedPriority === p.label ? p.activeClass : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}
                          `}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                      <Upload size={14} className="text-emerald-500" /> إرفاق ملفات (الحد الأقصى 5)
                    </label>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      className="hidden" 
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="w-full h-[52px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                    >
                      <Upload size={16} className="group-hover:text-emerald-500" />
                      <span className="text-[10px] font-bold">رفع صورة توضيحية</span>
                    </button>
                  </div>
                </div>

                {previews.length > 0 && (
                  <div className="space-y-2 animate-in fade-in">
                    <label className="text-[10px] font-black text-slate-400 mr-2">الملفات المجهزة للرفع:</label>
                    <div className="flex flex-wrap gap-2">
                      {previews.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-xl text-slate-600 text-[11px] font-bold">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeAttachment(idx)}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-2xl text-xs cursor-pointer hover:bg-slate-100 transition-all"
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> جاري إرسال التذكرة...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> إرسال التذكرة
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- نافذة عرض التفاصيل (Modal) للقراءة فقط للموظف --- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Header */}
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Info size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">تفاصيل بلاغ الدعم #{selectedTicket.id}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">صيغة مخصصة للقراءة والمتابعة فقط</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar text-right">
              {/* تتبع الحالة والأولوية */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 font-black block mb-1">الحالة الحالية:</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] border font-black inline-block ${getStatusBadgeStyle(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black block mb-1">درجة الأولوية:</span>
                  <span className={`text-[11px] font-black ${selectedTicket.priority === 'عاجلة' ? 'text-rose-600' : selectedTicket.priority === 'متوسطة' ? 'text-amber-600' : 'text-blue-600'}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black block mb-1">تاريخ الإنشاء:</span>
                  <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(selectedTicket.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* عنوان وتصنيف التذكرة */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black block">موضوع الاستفسار / المشكلة:</span>
                <h3 className="text-md font-black text-slate-800 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">{selectedTicket.subject}</h3>
              </div>

              {/* الشرح */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-black block">التفاصيل الكاملة لبلاغك:</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line font-medium">
                  {selectedTicket.description}
                </p>
              </div>

              {/* الصور المرفقة من السيرفر */}
              {selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-black block">الملفات والصور التوضيحية المرفقة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedTicket.imageUrls.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video block shadow-sm hover:shadow-md transition-all"
                      >
                        <img 
                          src={url} 
                          alt={`مرفق ${i+1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black gap-1">
                          <Eye size={12} /> عرض الصورة المكبرة
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-left">
              <button
                onClick={() => setSelectedTicket(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-8 rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-slate-200"
              >
                إغلاق التفاصيل
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const HelpCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group">
    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">{desc}</p>
  </div>
);