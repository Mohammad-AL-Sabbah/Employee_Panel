import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, User, ChevronDown, Clock, CloudSun, MapPin, 
  CloudRain, Sun, Cloud, Loader2 
} from 'lucide-react';

const Header = () => {
  // جلب البيانات المخزنة من localStorage (التي وضعناها في صفحة Login)
  const storedName = localStorage.getItem("userName") || "User Name";
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 18, desc: "صافٍ", icon: 'Clear' });
  const [loadingWeather, setLoadingWeather] = useState(true);

  // 1. تحديث الوقت كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. جلب حالة الطقس مع معالجة ذكية للأخطاء
useEffect(() => {
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const lat = 32.2211;
        const lon = 35.2544;
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            desc: "صافٍ حالياً", 
            icon: 'Clear'
          });
        }
      } catch (error) {
        console.error("فشل جلب الطقس:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear': return <Sun size={20} className="text-amber-500" />;
      case 'Clouds': return <Cloud size={20} className="text-slate-400" />;
      case 'Rain': return <CloudRain size={20} className="text-blue-500" />;
      default: return <CloudSun size={20} className="text-amber-500" />;
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-8 z-30 sticky top-0 shadow-sm" dir="rtl">
      
      {/* القسم الأيمن: المستخدم */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 flex items-center justify-center shadow-sm group-hover:shadow-emerald-200 transition-all duration-300">
              <User size={20} className="text-emerald-600" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>

          <div className="text-right ml-1">
            <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
              {storedName}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              موظف نظام PSRS
            </p>
          </div>
          <ChevronDown size={14} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>

      {/* القسم الأيسر: الطقس والوقت */}
      <div className="hidden md:flex items-center gap-4">
        
        {/* ويدجت طقس نابلس */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 min-w-[150px]">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 leading-none mb-1 flex items-center gap-1">
              <MapPin size={10} className="text-rose-500" /> نابلس الآن
            </p>
            {loadingWeather ? (
              <div className="flex items-center gap-2">
                <Loader2 size={10} className="animate-spin text-emerald-500" />
                <span className="text-[10px] text-slate-400 font-bold">جاري التحديث..</span>
              </div>
            ) : (
              <p className="text-xs font-black text-slate-700 leading-none capitalize">
                {weather.temp}°C - {weather.desc}
              </p>
            )}
          </div>
          {!loadingWeather && getWeatherIcon(weather.icon)}
        </div>

        {/* ويدجت الوقت */}
        <div className="flex items-center gap-3 bg-emerald-50/50 px-4 py-2 rounded-2xl border border-emerald-100/50">
          <div className="text-right">
            <p className="text-[10px] font-bold text-emerald-600/60 leading-none mb-1">توقيت النظام</p>
            <p className="text-xs font-black text-emerald-700 leading-none tracking-wider">
              {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Clock size={18} className="text-emerald-600" />
        </div>
      </div>
    </header>
  );
};

export default Header;