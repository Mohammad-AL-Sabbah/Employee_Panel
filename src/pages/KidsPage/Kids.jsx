import React, { useEffect, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, Flame, Siren, Ambulance, 
  ChevronDown, Heart, Zap, ShieldCheck, Activity, Crown,
  Home, Rocket, Star, Sword
} from 'lucide-react';

// --- الحل الجذري: توليد البيانات خارج المكون تماماً ---
// بهذه الطريقة لا يمكن لـ React الاعتراض لأن القيم أصبحت ثابتة قبل بدء التشغيل
const STATIC_PARTICLES = [...Array(12)].map((_, i) => ({
  id: i,
  x: [i * -5, i * 5], // قيم تعتمد على الترتيب بدل العشوائية لتجنب الخطأ
  y: [i * -3, i * 3],
  top: `${(i * 13) % 100}%`,
  left: `${(i * 17) % 100}%`,
  duration: 10 + i
}));

const KidsPage = () => {
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollToGame = () => {
    const footer = document.getElementById('game-section');
    footer?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = "P.S.R.S | تعليم الأطفال";
  }, []);

  return (
    <div className="hero-master-wrapper bg-[#050510] text-white font-['Cairo'] w-full min-h-screen">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden !important;
          background: #050510;
          scroll-behavior: smooth;
        }
      `}} />

      {/* 1. Navbar */}
      <nav className="fixed top-6 left-0 right-0 z-[110] flex justify-center px-4 pointer-events-none">
        <div className="flex items-center gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 pointer-events-auto shadow-2xl">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors font-bold text-sm"
            style={{cursor:"pointer"}}
          >
            <Home size={18} className="text-blue-400"  /> الرجوع إلى الرئيسية
          </button>
          
          <div className="w-px h-6 bg-white/10" />

          <button 
            onClick={scrollToGame}
            style={{cursor:"pointer"}}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 transition-all font-black text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95"
          >
            <Rocket size={18} /> العب الآن
          </button>
        </div>
      </nav>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 origin-left z-[120]"
        style={{ scaleX }}
      />

      {/* 2. Welcome Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* استخدام الجزيئات الثابتة هنا يقتل الخطأ فوراً */}
          {STATIC_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              animate={{ x: p.x, y: p.y, opacity: [0.05, 0.2, 0.05] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
              style={{ top: p.top, left: p.left }}
              className="absolute text-2xl font-black text-blue-500/20 select-none"
            >
              HERO
            </motion.div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div 
            animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-[20%] left-[10%] text-8xl filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            🦸‍♂️
          </motion.div>
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-[25%] right-[10%] text-8xl filter drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
          >
            🦸‍♀️
          </motion.div>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center z-10"
        >
          <h1 className="p-6 text-[8rem] md:text-[11rem] font-black italic tracking-tighter mb-6 leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-slate-600 drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
            البطل الصغير
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <Star className="text-yellow-400 fill-yellow-400 animate-pulse" />
            <p className="text-2xl md:text-5xl font-black text-yellow-400 italic">
              استعد لمغامرة العمر!
            </p>
            <Star className="text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl font-bold text-slate-300 leading-relaxed mb-12 opacity-80">
            انطلق في رحلة الابطال مع نظام <span className="text-blue-400 font-black">PSRS</span> المتطور، واثبت للعالم أنك البطل الذي ننتظره.
          </p>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 opacity-40 cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <ChevronDown size={50} />
        </motion.div>
      </section>

      {/* 3. Missions */}
      <MissionSection 
        title="مهمة الإطفاء "
        description="النيران تشتعل ! استخدم عقل البطل  ونظام PSRS السريع لإستدعاء الإطفائية."
        icon={<Flame size={100} className="text-red-500" />}
        color="from-red-900/40"
        imgSrc="https://thumbs.dreamstime.com/b/fire-truck-14384555.jpg"
        subEmoji="🚒"
      />

      <MissionSection 
        title="مهمة الشرطي البطل"
        description="أنت الشرطي في الحي . تأكد من سلامة الجميع واستعمل نظامك للابلاغ عن أي خطر      ."
        icon={<Siren size={100} className="text-blue-500" />}
        color="from-blue-900/40"
        imgSrc="https://target.scene7.com/is/image/Target/GUEST_3d03288c-216d-46cc-bce9-db65c1f91b8e"
        subEmoji="🚓"
      />

      <MissionSection 
        title="مهمة طبيب الأبطال"
        description="أصيب صديقك بجروح أو حصل حادث أمامك ! لا تقلق انت البطل وتستطيع إستدعاء سيارة الإسعاف"
        icon={<Ambulance size={100} className="text-green-400" />}
        color="from-green-900/40"
        imgSrc="https://img.freepik.com/premium-vector/fun-cartoonish-ambulance-illustration-kids-medical-concept-designs_1263357-21558.jpg"
        subEmoji="🚑"
      />

      {/* 4. Game Entry Section */}
      <section id="game-section" className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-gradient-to-t from-blue-900/20 to-transparent">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-center mb-16 z-10"
        >
          <div className="flex justify-center gap-4 mb-6">
            <Crown size={60} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>
          <h2 className="text-6xl font-black mb-4 tracking-tighter">أنت مستعد للمغامرة !</h2>
          <p className="text-2xl text-slate-400 font-bold italic">مهمتك الأولى تبدأ من هنا...</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/game')}
          className="relative group cursor-pointer z-10"
        >
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-50 transition-all duration-500" />
          
          <button style={{cursor:"pointer"}} className="relative w-80 h-80 bg-white text-blue-950 rounded-full shadow-2xl flex flex-col items-center justify-center border-[15px] border-blue-500 group-hover:border-green-500 transition-colors duration-500">
            <Gamepad2 size={100} className="mb-4 text-blue-900 group-hover:scale-110 transition-transform" />
            <span className="font-black text-4xl italic tracking-tighter">ابدأ المغامرة</span>
          </button>
        </motion.div>
        
        <div className="mt-20 flex gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
          <ShieldCheck size={50} />
          <Activity size={50} />
          <Zap size={50} />
        </div>
      </section>

    </div>
  );
};

const MissionSection = ({ title, description, icon, color, imgSrc, subEmoji, reverse }) => (
  <section className={`min-h-screen flex items-center justify-center p-8 bg-gradient-to-b ${color} to-transparent border-t border-white/5`}>
    <div className={`max-w-7xl w-full flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
      
      <motion.div 
        initial={{ x: reverse ? 100 : -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`flex-1 ${reverse ? 'text-center lg:text-left' : 'text-center lg:text-right'}`}
      >
        <div className="inline-block p-6 rounded-[30px] bg-white/5 backdrop-blur-sm mb-8 border border-white/10 shadow-xl">
          {icon}
        </div>
        <h2 className="text-4xl md:text-[3.5rem]  font-black mb-8 leading-[1]  tracking-tighter">{title}</h2>
        <p className="text-2xl md:text-3xl font-bold text-slate-300 italic opacity-80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
          {description}
        </p>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.4, opacity: 0, rotate: reverse ? -10 : 10 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        viewport={{ once: true }}
        className="flex-1 flex justify-center relative"
      >
        <div className="relative w-72 h-72 md:w-96 md:h-96 bg-white rounded-[70px] border-4 border-white/20 flex items-center justify-center shadow-2xl overflow-hidden p-4">
          <img 
            src={imgSrc} 
            alt={title} 
            className="w-full h-full object-contain rounded-[40px]"
          />
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-4 right-4 bg-blue-500 text-4xl w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
          >
            {subEmoji}
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default KidsPage;