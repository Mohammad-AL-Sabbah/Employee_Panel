/* eslint-disable no-unused-vars */
import React, { useState,useEffect } from 'react';
import { 
  HelpCircle, BookOpen, MessageSquare, 
   ChevronDown, ChevronLeft, 
  Video, FileText, LifeBuoy, 
  Send, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function Help() {

  const title = useEffect(() =>{
document.title = " المساعدة | P.S.R.S";
  },[]);




  
  const [activeAccordion, setActiveAccordion] = useState(null);

  const faqs = [
    {
      question: "كيف أقوم بتحويل بلاغ إلى فريق صيانة ميداني؟",
      answer: "من لوحة التحكم الرئيسية، اضغط على 'البلاغات الواردة'، اختر البلاغ المعني، ثم اضغط على زر 'تعيين فريق'. ستظهر لك قائمة بالفرق المتاحة حالياً بناءً على الموقع الجغرافي."
    },
    {
      question: "النظام لا يظهر لي الفرق المتاحة في منطقة معينة، ما السبب؟",
      answer: "تأكد من تفعيل خاصية الـ GPS لدى الفريق في تطبيق الهاتف المحمول الخاص بهم، ومن أن حالة الفريق هي 'متاح' وليست 'مشغول' أو 'خارج الخدمة'."
    },
    {
      question: "كيف يمكنني إصدار تقرير شهري عن الإنجازات؟",
      answer: "انتقل إلى قسم 'التقارير والإحصائيات' من القائمة الجانبية، اختر النطاق الزمني، ثم اضغط على 'تصدير PDF'."
    },
      {
      question: "اذا لاحظت أن البلاغ يخص الأمن أو يهدد أمن المواطنين",
      answer: "عدم التعامل مع البلاغ من طرف الموظف وإبلاغ الجهة المعنية بتفاصيل البلاغ بشكل مباشر وفوري ."
    },
      {
      question: "كيف يمكنني إصدار تقرير شهري عن الإنجازات؟",
      answer: "انتقل إلى قسم 'التقارير والإحصائيات' من القائمة الجانبية، اختر النطاق الزمني، ثم اضغط على 'تصدير PDF'."
    },
      {
      question: "كيف يمكنني إصدار تقرير شهري عن الإنجازات؟",
      answer: "انتقل إلى قسم 'التقارير والإحصائيات' من القائمة الجانبية، اختر النطاق الزمني، ثم اضغط على 'تصدير PDF'."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12" dir="rtl">
      {/* Header مع محرك بحث كبير */}
      <div className="bg-emerald-600 pt-16 pb-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <HelpCircle size={400} className="absolute -bottom-20 -left-20 text-white" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-black text-white mb-4">كيف يمكننا مساعدتك اليوم؟</h1>
          <p className="text-emerald-100 mb-8 font-medium">ابحث عن حلول، أدلة استخدام، أو تواصل مع الدعم الفني لنظام PSRS</p>
          
        
        </div>
      </div>

      <div className="max-w-6xl mx-auto -mt-12 px-6 relative z-20">
        {/* الكروت السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <HelpCard 
            icon={BookOpen} 
            title="دليل الاستخدام" 
            desc="تعلم كيفية إدارة البلاغات والفرق خطوة بخطوة"
            color="text-blue-600" bg="bg-blue-50"
          />
          <HelpCard 
            icon={Video} 
            title="دروس فيديو" 
            desc="شروحات مرئية سريعة لميزات النظام الجديدة"
            color="text-purple-600" bg="bg-purple-50"
          />
          <HelpCard 
            icon={FileText} 
            title="وثائق الـ API" 
            desc="للمطورين: كيفية ربط الأنظمة الخارجية بـ PSRS"
            color="text-emerald-600" bg="bg-emerald-50"
          />
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* قسم الأسئلة الشائعة */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
                <LifeBuoy className="text-emerald-500" /> الأسئلة الأكثر شيوعاً
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                      className="w-full flex justify-between items-center p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-right"
                    >
                      <span className="font-bold text-slate-700 text-sm">{faq.question}</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-slate-400 transition-transform duration-300 ${activeAccordion === index ? 'rotate-180' : ''}`} 
                      />
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

          {/* قسم تواصل معنا الجانبي */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/40 transition-all"></div>
              
              <h4 className="text-lg font-bold mb-4 relative z-10">لم تجد حلاً؟</h4>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed relative z-10">فريق الدعم الفني متواجد لمساعدتك على مدار الساعة في حالات الطوارئ.</p>
              
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/20">
                <MessageSquare size={18} /> فتح تذكرة دعم
              </button>
              
              <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <AlertCircle size={16} className="text-emerald-500" />
                  <span className="text-slate-300">وقت الاستجابة التقريبي: 15 دقيقة</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">إصدار النظام الحالي</p>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black">
                <CheckCircle2 size={12} /> PSRS v1.0.0 - LATEST 2026
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HelpCard = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
    <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-xs text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);