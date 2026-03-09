/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, BookOpen, MessageSquare, 
  ChevronDown, Video, FileText, LifeBuoy, 
  Send, AlertCircle, CheckCircle2, X, Upload, 
  Tag, AlignLeft, Info
} from 'lucide-react';

export default function HelpPortal() {
  useEffect(() => {
    document.title = "المساعدة والدعم | P.S.R.S";
  }, []);

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // الحالة الخاصة باختيار الأولوية
  const [selectedPriority, setSelectedPriority] = useState('عادية');

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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-emerald-600 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight text-shadow-sm">كيف يمكننا مساعدتك اليوم؟</h1>
          <p className="text-emerald-100 mb-8 font-medium">مركز الدعم الفني والتقني الموحد لنظام PSRS</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-12 px-6 relative z-20">
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

      {/* --- نافذة النموذج (Modal) --- */}
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
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                    <Info size={14} className="text-emerald-500" /> عنوان المشكلة
                  </label>
                  <input type="text" placeholder="مثال: تعذر الوصول للتقارير" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                    <Tag size={14} className="text-emerald-500" /> القسم
                  </label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none transition-all">
                    <option>أعطال تقنية</option>
                    <option>صيانة ميدانية</option>
                    <option>أخرى</option>
                  </select>
                </div>
              </div>

              {/* حقل شرح التفاصيل - المضاف حديثاً */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 mr-2 flex items-center gap-2">
                  <AlignLeft size={14} className="text-emerald-500" /> شرح التفاصيل
                </label>
                <textarea 
                  rows="4" 
                  placeholder="اكتب هنا تفاصيل المشكلة، الخطوات التي أدت لظهورها، والنتيجة المتوقعة..." 
                  className="w-full bg-slate-50 border-none rounded-[2rem] py-4 px-5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none transition-all min-h-[120px]"
                ></textarea>
              </div>

              {/* اختيار الأولوية التفاعلي */}
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
                    <Upload size={14} className="text-emerald-500" /> إرفاق ملفات
                  </label>
                  <button className="w-full h-[52px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
                    <Upload size={16} className="group-hover:text-emerald-500" />
                    <span className="text-[10px] font-bold">رفع صورة توضيحية</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-2xl text-xs cursor-pointer hover:bg-slate-100 transition-all"
              >
                إلغاء
              </button>
              <button className="flex-[2] bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 cursor-pointer active:scale-95 transition-all">
                <Send size={16} /> إرسال التذكرة
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