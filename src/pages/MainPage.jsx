/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from 'react'; // 1. إضافة useRef
import { 
  Megaphone, ShieldCheck, TrendingUp, Bell, 
  ArrowLeft, Clock, Info, CheckCircle, Zap,
  FileSearch, Users, MessageSquare, AlertTriangle 
} from 'lucide-react';
import ReportsData from '../components/ReportsData';


const MainPage = () => {
  const instructionsRef = useRef(null);

  const scrollToInstructions = () => {
    instructionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const title = useEffect(() =>{
document.title = "الصفحة الرئيسية | P.S.R.S";
  },[]);


  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
      
      {/* 1. البانر الرئيسي */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-[3rem] p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 w-fit px-4 py-1.5 rounded-full text-[10px] font-black mb-6 backdrop-blur-md text-emerald-400 uppercase tracking-widest">
            <Megaphone size={14} /> 
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
            مرحباً بك في نظام <span className="text-emerald-500">P.S.R.S</span> الفلسطيني
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
            تم تحديث بروتوكولات الاستجابة الميدانية لعام 2026. يرجى مراجعة دليل الموظف الجديد لضمان سرعة معالجة البلاغات في محافظتك.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={scrollToInstructions}
              style={{cursor:"pointer"}} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 group"
            >
              عرض التعليمات الجديدة
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute right-0 bottom-0 opacity-10">
            <Zap size={300} />
        </div>
      </div>
 
        {/* 2. قسم إحصائيات البلاغات */}
 <ReportsData />
      

      {/* 3. قسم التوجيهات السريعة */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Info className="text-emerald-500" /> لمحة سريعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-r-4 border-emerald-500 pr-3">للبلاغات الطارئة:</h4>
              <p className="text-xs text-slate-500 leading-loose">تحويل البلاغ إلى "قيد المعالجة" في أقل من 10 دقائق لضمان كفاءة التقييم.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-r-4 border-blue-500 pr-3">تصدير التقارير:</h4>
              <p className="text-xs text-slate-500 leading-loose">تصدير البيانات بصيغة Excel متاح الآن مباشرة من سجل البلاغات.</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-emerald-50 rounded-[2.5rem] p-10 border border-emerald-100 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-200/50 mb-6 animate-pulse">
            <ShieldCheck size={40} />
          </div>
          <h4 className="font-black text-emerald-900 text-lg">اتصال آمن ومستقر</h4>
          <p className="text-emerald-600/70 text-xs mt-2 font-medium">أنت متصل بالنظام بنجاح </p>
        </div>
      </div>

  
      <div 
        ref={instructionsRef}
        className="pt-12 space-y-8"
      >
        <div className="flex flex-col items-center text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800 mb-2">تعليمات وإجراءات العمل المحدثة</h2>
            <p className="text-slate-400 text-sm">يجب على جميع الموظفين اتباع الخطوات التالية لضمان جودة الخدمة</p>
            <div className="w-20 h-1.5 bg-emerald-500 rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InstructionStep 
                icon={FileSearch}
                step="01"
                title="استلام وتصنيف البلاغ"
                desc="عند استلام بلاغ جديد، يجب التحقق من الموقع الجغرافي ونوع العطل (كهرباء، مياه، طرق) وتحديد درجة الأولوية فوراً."
            />
            <InstructionStep 
                icon={Users}
                step="02"
                title="توجيه فريق الصيانة"
                desc="يتم إرسال تفاصيل البلاغ لأقرب فريق ميداني متاح عبر التطبيق، مع إرفاق الصور والملاحظات الفنية المستلمة."
            />
            <InstructionStep 
                icon={MessageSquare}
                step="03"
                title="التواصل مع المواطن"
                desc="يجب تحديث حالة البلاغ لإشعار المواطن ببدء العمل، والتواصل معه هاتفياً في حال الحاجة لتوضيحات إضافية."
            />
            <InstructionStep 
                icon={AlertTriangle}
                step="04"
                title="الحالات الطارئة"
                desc="في حالات الكوارث الطبيعية أو الحوادث الكبرى، يتم تفعيل خط الاتصال الساخن مع الدفاع المدني والشرطة مباشرة."
            />
            <InstructionStep 
                icon={ShieldCheck}
                step="05"
                title="إغلاق البلاغ "
                desc="لا يتم إغلاق البلاغ إلا بعد رفع صورة الإصلاح النهائي وتأكيد المواطن على انتهاء المشكلة بنجاح."
            />
            <InstructionStep 
                icon={CheckCircle}
                step="06"
                title="التقارير اليومية"
                desc="يلتزم الموظف برفع ملخص بنهاية الوردية يوضح عدد البلاغات المنجزة والمعلقة وأسباب التأخير إن وجدت."
            />
        </div>
      </div>
    </div>
  );
};

/* مكون فرعي لخطوات التعليمات */
const InstructionStep = ({ icon: Icon, step, title, desc }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative group overflow-hidden">
        <div className="absolute -left-4 -top-4 text-slate-50 text-6xl font-black group-hover:text-emerald-50 transition-colors">
            {step}
        </div>
        <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Icon size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-3">{title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
        </div>
    </div>
);


export default MainPage;