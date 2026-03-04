/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react'; 
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  ShieldCheck, Zap, Users, 
  ArrowLeft, CheckCircle2, Globe, Target, BarChart,
  Siren, ShieldAlert, Radio, Activity, LayoutGrid, Clock, Smartphone, MapPin, Send, Cpu, CheckCircle
} from 'lucide-react';

const createCustomIcon = (color) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [12, 12],
});

const LandingPage = () => {
  useEffect(() => {
    document.title = "P.S.R.S | نظام البلاغات الذكي";
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const centerPosition = [31.9029, 35.2062]; 

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#f8fafc] overflow-x-hidden font-sans text-right select-none" 
      dir="rtl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 1. Header */}
      <motion.nav 
        variants={itemVariants}
        className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-[1000] border-b border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-[#10b981] p-1.5 rounded-lg text-white shadow-lg shadow-emerald-100">
              <ShieldCheck size={24} />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-800 uppercase">P.S.R.S - System</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button onClick={() => scrollToSection('about')} className="hover:text-[#10b981] transition-colors cursor-pointer">من نحن؟</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-[#10b981] transition-colors cursor-pointer font-bold">مزايا النظام</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#10b981] transition-colors cursor-pointer">كيف يعمل النظام؟</button>
          </div>
        </div>

        <Link 
          to="/login" 
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#10b981] transition-all flex items-center gap-2 group shadow-lg shadow-slate-200"
        >
          دخول الموظفين
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </motion.nav>

      {/* 2. Hero Section */}
      <section className="py-10 px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div className="space-y-8" variants={containerVariants}>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold border border-emerald-100">
            <Zap size={14} />   تم الإطلاق عام 2026
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
          رؤية شاملة
          <br /> 
            <span className="text-[#10b981]">لإدارة ميدانية ذكية</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg text-slate-500 max-w-lg leading-relaxed">
            نظام متكامل يدمج بين الخدمات البلدية الذكية ومركز إدارة الطوارئ (الإسعاف، الإطفاء، والشرطة). رؤية فلسطينية تقنية لحماية الأرواح واستدامة الخدمات.
          </motion.p>

    <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
  <a 
    href="/app-release.apk" 
    download="P.S.R.S.apk"
    className="bg-[#10b981] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-emerald-200 text-center min-w-[160px]"
  >
    حمل التطبيق من هنا
  </a>
</motion.div>



        </motion.div>

        <motion.div variants={itemVariants} className="relative h-[550px] w-full z-0 group">
          <div className="absolute -inset-4 bg-emerald-400/10 blur-3xl rounded-full opacity-50"></div>
          <div className="h-full w-full rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white relative">
            <MapContainer center={centerPosition} zoom={10} scrollWheelZoom={false} className="h-full w-full" style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap' />
              <CustomMarker position={[31.9029, 35.2062]} label="مركز الطوارئ " color="#ef4444" />
              <CustomMarker position={[32.2211, 35.2544]} label="وحدة طوارئ نابلس" color="#3b82f6" />
              <PulseMarker position={[31.9200, 35.2300]} />
            </MapContainer>
            <div className="absolute top-6 left-6 right-6 z-[500] pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-[2rem] shadow-xl border border-white/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="relative"><Radio size={20} className="text-rose-500" /><span className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-25"></span></div>
                        <span className="text-xs font-black text-slate-800 tracking-tight">تحديد أماكن البلاغات : شامل (بلديات + طوارئ)</span>
                    </div>
                </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. "من نحن" Section */}
      <section id="about" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-4xl font-black italic tracking-tighter">مركز البلاغات الرقمي </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                <span className="text-emerald-400 font-bold">PSRS</span> ليس مجرد تطبيق للصيانة، بل هو منظومة خدمات متكاملة. توفر أريحية وسهولة للمواطن للإبلاغ عن أي عطل أو ضرر بشكل إلكتروني دون تعقيدات , إضافة لطلب خدمات النجدة أو الطوارئ بشكل سريع .
              </p>
              <div className="grid grid-cols-2 gap-6 pt-6 text-right">
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Target size={20}/></div>
                  <div><h4 className="font-bold mb-1">بلاغات البلدية</h4><p className="text-xs text-slate-500 italic">طرق، إنارة، ونظافة بذكاء.</p></div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Siren size={20}/></div>
                  <div><h4 className="font-bold mb-1">مركز الطوارئ</h4><p className="text-xs text-slate-500 italic">إنقاذ، إسعاف، شرطة.</p></div>
                </div>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-sm">
              <div className="space-y-6">
                 <div className="space-y-4">
                    {[
                      { label: "محافظة تحت التغطية ", val: "11+", color: "bg-emerald-500" },
                      { label: "زمن الاستجابة للطوارئ", val: "دقيقتين الى ثلاث", color: "bg-rose-500" },
                      { label: "سهولة الإستخدام", val: "99.9%", color: "bg-blue-500" }
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">{stat.label}</span>
                        <span className={`px-3 py-1 ${stat.color} text-white text-[10px] font-bold rounded-lg`}>{stat.val}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. مزايا النظام (New Section) */}
      <section id="features" className="py-24 bg-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter  decoration-8 ">مزايا النظام</h2>
            <p className="text-slate-500 font-bold tracking-wide">تتبع مسار البلاغ من لحظة الإرسال حتى التنفيذ</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* مسار بلاغ البلدية */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-emerald-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><LayoutGrid size={28}/></div>
                <h3 className="text-2xl font-black text-slate-800 italic">المسار البلدي (الخدمي)</h3>
              </div>
              
              <div className="space-y-8 relative  before:right-[2.75rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                <FeatureStep icon={Smartphone} title="الاستلام الرقمي" desc="تلقي البلاغ المصور عبر تطبيق المواطن مع تحديد إحداثيات الموقع بدقة مترية." color="emerald" />
                <FeatureStep icon={Cpu} title="الفرز والتحليل" desc="خوارزميات الذكاء الاصطناعي تحدد نوع الصيانة المطلوبة (إنارة، حفر، نفايات) وترسلها للقسم المختص." color="emerald" />
                <FeatureStep icon={MapPin} title="التحرك الميداني" desc="إرسال المهمة لأقرب مركبة صيانة متاحة عبر النظام. " color="emerald" />
                <FeatureStep icon={CheckCircle} title="التوثيق والإغلاق" desc="التقاط صورة لما بعد الإصلاح، إغلاق البلاغ، وإرسال تنبيه للمواطن بإنتهاء الصيانة." color="emerald" />
              </div>
            </motion.div>

            {/* مسار بلاغ الطوارئ */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-slate-900 p-10 rounded-[3rem] shadow-xl border-t-8 border-rose-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl"><Siren size={28}/></div>
                <h3 className="text-2xl font-black text-white italic">مسار الطوارئ </h3>
              </div>

              <div className="space-y-8 relative  before:right-[2.75rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-500/20">
                <FeatureStep icon={Send} title="البلاغ الفوري" desc="استقبال طلب الاستغاثة بشكل فوري يتخطى  قوائم الانتظار." color="rose" isDark />
                <FeatureStep icon={Radio} title="مركز الطوارئ " desc="تحليل طبيعة الخطر (حريق، إسعاف، أمن) وتوزيع المهمة على اقرب وحدة من المكان  ." color="rose" isDark />
                <FeatureStep icon={Clock} title="الاستجابة السريعة" desc="الاستجابة وفقاً لخطورة الحالة ضمن برنامج الأوليات" color="rose" isDark />
                <FeatureStep icon={ShieldCheck} title="إنتهاء الخطر" desc="إرسال اشعار نهائي لهواتف المواطنين  بانتهاء الخطر   ." color="rose" isDark />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <motion.section 
        id="how-it-works"
        className="bg-white py-24 border-y border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-8 text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter underline decoration-[#10b981] decoration-4 underline-offset-8 italic">كيف يعمل النظام؟</h2>
          <p className="text-slate-500 italic">فصل ذكي بين المهام الخدمية والحالات الطارئة</p>
        </div>

        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Activity} 
            title="التصنيف الذكي" 
            desc="يقوم النظام فور استلام الإشارة بفرزها: إذا كانت (بنية تحتية) تذهب للبلدية، وإذا كانت (خطر حياة) تذهب فوراً لجهات الطوارئ ." 
            delay={0.1}
          />
          <FeatureCard 
            icon={ShieldAlert} 
            title="توجيه الأولوية" 
            desc="في حالات الطوارئ (إسعاف/إطفاء/شرطة)، يحسب النظام المسافة ويرسل أقرب وحدة لصاحب الطلب في المنطقة " 
            delay={0.2}
          />
          <FeatureCard 
            icon={CheckCircle2} 
            title="السيطرة والتقارير" 
            desc="لوحة تحكم منفصلة لكل قطاع تضمن الخصوصية؛ بحيث يدير موظفين البلدية مهامهم، بينما يدير موظفين الطوارئ مهامهم." 
            delay={0.3}
          />
        </div>
      </motion.section>
    </motion.div>
  );
};

// --- المكونات المساعدة ---

const FeatureStep = ({ icon: Icon, title, desc, color, isDark = false }) => {
  const colorMap = {
    emerald: isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-600",
    rose: isDark ? "bg-rose-500/100 text-white" : "bg-rose-100 text-rose-600",
  };
  return (
    <div className="flex gap-6 relative z-10 group">
      <div className={`p-3 rounded-xl h-fit shadow-sm transition-transform group-hover:scale-110 ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h4 className={`font-black text-sm tracking-tight ${isDark ? "text-white" : "text-slate-800"}`}>{title}</h4>
        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
      </div>
    </div>
  );
};

const CustomMarker = ({ position, label, color }) => (
  <Marker position={position} icon={createCustomIcon(color)}>
    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
      <span className="font-bold text-xs">{label}</span>
    </Tooltip>
  </Marker>
);

const PulseMarker = ({ position }) => (
  <Marker position={position} icon={new L.DivIcon({
    className: 'pulse-container',
    html: `
      <div style="position: relative;">
        <div style="position: absolute; width: 24px; height: 24px; background: #ef4444; border-radius: 50%; opacity: 0.6; animation: pulse 2s infinite;"></div>
        <div style="position: absolute; top: 7px; left: 7px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 2px solid white;"></div>
      </div>
      <style> @keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.5); opacity: 0; } } </style>
    `,
    iconSize: [24, 24],
  })}>
    <Popup>تحذير: منطقة نشاط طوارئ</Popup>
  </Marker>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="p-10 rounded-[2.5rem] bg-[#f8fafc] border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl transition-all group cursor-default text-right"
  >
    <div className="bg-white p-4 rounded-2xl w-fit mb-6 text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-4 italic">{title}</h3>
    <p className="text-sm text-slate-500 leading-loose">{desc}</p>
  </motion.div>
);

export default LandingPage;