import React, { useState, useEffect } from 'react';
import { 
  Wind, Droplets, MapPin, RefreshCw, ChevronDown, 
  Sun, Cloud, CloudRain, CloudLightning, Snowflake, Thermometer 
} from 'lucide-react';

const WeatherPanel = ({ selectedCoords, onResetCoords }) => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);

  const palestineCities = [
    { name: "نابلس", lat: 32.2211, lon: 35.2544 },
    { name: "القدس", lat: 31.7683, lon: 35.2137 },
    { name: "غزة", lat: 31.5017, lon: 34.4668 },
    { name: "الخليل", lat: 31.5297, lon: 35.0938 },
    { name: "رام الله", lat: 31.9029, lon: 35.2043 },
    { name: "جنين", lat: 32.4573, lon: 35.2868 },
    { name: "بيت لحم", lat: 31.7049, lon: 35.2038 },
    { name: "أريحا", lat: 31.8575, lon: 35.4444 },
    { name: "طولكرم", lat: 32.3152, lon: 35.0208 },
    { name: "قلقيلية", lat: 32.1936, lon: 34.9811 }
  ];

  // دالة لجلب الأيقونة الكبيرة والمعبرة بناءً على كود الطقس (WMO Code)
  const getWeatherIcon = (code) => {
    // صافي
    if (code === 0) return <Sun className="text-yellow-500 animate-spin-slow" size={72} />;
    // غائم جزئياً
    if (code <= 3) return <Cloud className="text-slate-400" size={72} />;
    // أمطار
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-500 animate-pulse" size={72} />;
    // ثلوج
    if (code >= 71 && code <= 77) return <Snowflake className="text-cyan-300" size={72} />;
    // عواصف رعدية
    if (code >= 95) return <CloudLightning className="text-purple-500" size={72} />;
    // افتراضي (مستقر)
    return <Thermometer className="text-emerald-500" size={72} />;
  };

  useEffect(() => {
    if (selectedCoords) {
      fetchWeather(selectedCoords.lat, selectedCoords.lon, "إحداثيات جغرافية");
    }
  }, [selectedCoords]);

  const fetchWeather = async (lat, lon, label) => {
    setLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.current_weather) {
        setWeatherData({
          temp: Math.round(data.current_weather.temperature),
          wind: data.current_weather.windspeed,
          humidity: data.hourly?.relative_humidity_2m[0] || "--",
          code: data.current_weather.weathercode,
          label: label
        });
      }
    } catch (e) { console.error("Error Syncing"); }
    setLoading(false);
  };

  const handleCitySelect = (e) => {
    const city = palestineCities.find(c => c.name === e.target.value);
    if (city) fetchWeather(city.lat, city.lon, city.name);
  };

  return (
    <aside className="w-72 h-full bg-black border-l border-slate-900 flex flex-col font-sans overflow-hidden">
      
      {/* 1. اختيار القطاع */}
      <div className="p-4 border-b border-slate-900 bg-[#050505]">
        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] block mb-2 text-center">
          Sector Selection
        </label>
        <div className="relative">
          <select 
            onChange={handleCitySelect}
            className="w-full bg-black border border-slate-800 text-white py-2 px-3 rounded text-sm font-bold focus:border-blue-600 outline-none appearance-none cursor-pointer"
          >
            <option value="">-- اختر المدينة --</option>
            {palestineCities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute left-2 top-2.5 text-slate-500 pointer-events-none" size={14} />
        </div>
      </div>

      {/* 2. منطقة عرض البيانات البصرية */}
      <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">Syncing...</span>
          </div>
        ) : weatherData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* الأيقونة الكبيرة والمعبرة عن الحالة */}
            <div className="flex justify-center py-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {getWeatherIcon(weatherData.code)}
            </div>

            {/* الحرارة (رقم فقط وبخط ضخم) */}
            <div className="text-center relative">
              <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-1">{weatherData.label}</p>
              <span className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">{weatherData.temp}</span>
              <div className="text-slate-700 font-black text-[9px] mt-2 tracking-[0.4em]">ACTUAL_READING</div>
            </div>

            {/* تفاصيل الرياح والرطوبة */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 border border-slate-900 p-3 rounded flex flex-col items-center">
                <Wind size={16} className="text-blue-500 mb-1" />
                <span className="text-sm font-black text-white">{weatherData.wind}</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold">km/h Wind</span>
              </div>
              <div className="bg-slate-950 border border-slate-900 p-3 rounded flex flex-col items-center">
                <Droplets size={16} className="text-blue-400 mb-1" />
                <span className="text-sm font-black text-white">{weatherData.humidity}%</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold">Humidity</span>
              </div>
            </div>

        
          </div>
        ) : (
          <div className="text-center py-10 opacity-10">
            <MapPin size={48} className="mx-auto text-slate-500 mb-2 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-widest">Waiting for Input</p>
          </div>
        )}
      </div>

      {/* 3. الشعار - ثابت وبدون أي تأثيرات هوفر */}
      <div className="p-6 border-t border-slate-900 bg-[#020202] flex flex-col items-center">
        <img 
          src="icon.png" 
          alt="PSRS" 
          className="w-20 h-20 object-contain block pointer-events-none" 
        />
        <div className="mt-2 text-center">
            <div className="text-white font-black text-[10px] tracking-[0.4em]">PSRS SYSTEM</div>
            <div className="text-slate-700 text-[8px] font-bold uppercase">Tactical Dispatch Unit</div>
        </div>
      </div>

      {/* ستايل إضافي لحركة الشمس البطيئة */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>

    </aside>
  );
};

export default WeatherPanel;