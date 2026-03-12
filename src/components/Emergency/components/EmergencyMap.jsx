/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import { Target, Crosshair, Trash2, CheckSquare, Square, Menu, X } from 'lucide-react'; 
import L from 'leaflet';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 100);
  }, [map]);
  return null;
};

const EmergencyMap = ({ onLocationSelect, selectedCoords }) => {
  const mapRef = useRef(null);
  const [isAiming, setIsAiming] = useState(false);
  const [activeCities, setActiveCities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // توزيع "عنقودي" مشتت يكسر الخط المستقيم نهائياً (شرطة، إسعاف، إطفاء)
  const cityUnitsData = {
    "القدس": [
      { id: 'J-P', type: 'Police', pos: [31.7683, 35.2137], color: '#0066ff' },
      { id: 'J-M', type: 'Medical', pos: [31.8150, 35.2620], color: '#10b981' },
      { id: 'J-F', type: 'Fire', pos: [31.7310, 35.1550], color: '#ef4444' }
    ],
    "نابلس": [
      { id: 'N-P', type: 'Police', pos: [32.2211, 35.2544], color: '#0066ff' },
      { id: 'N-M', type: 'Medical', pos: [32.2580, 35.2120], color: '#10b981' },
      { id: 'N-F', type: 'Fire', pos: [32.1920, 35.2980], color: '#ef4444' }
    ],
    "غزة": [
      { id: 'G-P', type: 'Police', pos: [31.5017, 34.4668], color: '#0066ff' },
      { id: 'G-M', type: 'Medical', pos: [31.5450, 34.4150], color: '#10b981' },
      { id: 'G-F', type: 'Fire', pos: [31.4650, 34.5120], color: '#ef4444' }
    ],
    "الخليل": [
      { id: 'H-P', type: 'Police', pos: [31.5297, 35.0938], color: '#0066ff' },
      { id: 'H-M', type: 'Medical', pos: [31.5750, 35.1420], color: '#10b981' },
      { id: 'H-F', type: 'Fire', pos: [31.4920, 35.0410], color: '#ef4444' }
    ],
    "رام الله": [
      { id: 'R-P', type: 'Police', pos: [31.9029, 35.2043], color: '#0066ff' },
      { id: 'R-M', type: 'Medical', pos: [31.9450, 35.2520], color: '#10b981' },
      { id: 'R-F', type: 'Fire', pos: [31.8620, 35.1580], color: '#ef4444' }
    ],
    "جنين": [
      { id: 'JN-P', type: 'Police', pos: [32.4573, 35.2868], color: '#0066ff' },
      { id: 'JN-M', type: 'Medical', pos: [32.5020, 35.3350], color: '#10b981' },
      { id: 'JN-F', type: 'Fire', pos: [32.4150, 35.2310], color: '#ef4444' }
    ],
    "بيت لحم": [
      { id: 'B-P', type: 'Police', pos: [31.7049, 35.2038], color: '#0066ff' },
      { id: 'B-M', type: 'Medical', pos: [31.7480, 35.1620], color: '#10b981' },
      { id: 'B-F', type: 'Fire', pos: [31.6620, 35.2480], color: '#ef4444' }
    ],
    "أريحا": [
      { id: 'A-P', type: 'Police', pos: [31.8575, 35.4444], color: '#0066ff' },
      { id: 'A-M', type: 'Medical', pos: [31.9050, 35.4820], color: '#10b981' },
      { id: 'A-F', type: 'Fire', pos: [31.8120, 35.4050], color: '#ef4444' }
    ],
    "طولكرم": [
      { id: 'T-P', type: 'Police', pos: [32.3152, 35.0208], color: '#0066ff' },
      { id: 'T-M', type: 'Medical', pos: [32.3620, 35.0650], color: '#10b981' },
      { id: 'T-F', type: 'Fire', pos: [32.2750, 34.9750], color: '#ef4444' }
    ],
    "قلقيلية": [
      { id: 'Q-P', type: 'Police', pos: [32.1936, 34.9811], color: '#0066ff' },
      { id: 'Q-M', type: 'Medical', pos: [32.2350, 35.0220], color: '#10b981' },
      { id: 'Q-F', type: 'Fire', pos: [32.1520, 34.9350], color: '#ef4444' }
    ],
    "سلفيت": [
      { id: 'S-P', type: 'Police', pos: [32.0847, 35.1814], color: '#0066ff' },
      { id: 'S-M', type: 'Medical', pos: [32.1350, 35.2250], color: '#10b981' },
      { id: 'S-F', type: 'Fire', pos: [32.0420, 35.1320], color: '#ef4444' }
    ],
    "طوباس": [
      { id: 'TB-P', type: 'Police', pos: [32.3214, 35.3694], color: '#0066ff' },
      { id: 'TB-M', type: 'Medical', pos: [32.3750, 35.4120], color: '#10b981' },
      { id: 'TB-F', type: 'Fire', pos: [32.2820, 35.3210], color: '#ef4444' }
    ]
  };

  const palestineCities = Object.keys(cityUnitsData).sort();

  const toggleCity = (cityName) => {
    setActiveCities(prev => 
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const createUnitIcon = (color) => L.divIcon({
    className: 'custom-unit-icon',
    html: `<div class="unit-wrapper"><div class="unit-pulse" style="background-color: ${color}"></div><div class="unit-core" style="background-color: ${color}"></div></div>`,
    iconSize: [20, 20], iconAnchor: [10, 10]
  });

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      const existingLink = document.querySelector(`link[href="${link.href}"]`);
      if (existingLink) document.head.removeChild(existingLink);
    };
  }, []);

  const scanIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-pin"></div>`,
    iconSize: [30, 42], iconAnchor: [15, 42]
  });

  return (
    <div className={`w-full h-full relative overflow-hidden bg-black ${isAiming ? 'cursor-crosshair' : ''}`}>
      
      {/* زر فتح وإغلاق القائمة */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-6 right-6 z-[4000] bg-slate-900/90 border border-slate-700 p-3 rounded-lg text-white hover:bg-blue-600 transition-all shadow-xl"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* واجهة اختيار المدن */}
      {isSidebarOpen && (
        <div className="absolute top-20 right-6 z-[3000] w-64 bg-black/95 border border-slate-800 rounded-xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 shadow-2xl">
          <div className="p-4 border-b border-slate-800 bg-slate-900/40 text-white font-black text-[12px] uppercase tracking-widest flex justify-between items-center">
            <span>Sector Grid</span>
            <span className="text-blue-500 font-mono text-[10px]">{activeCities.length} ON</span>
          </div>
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1">
            {palestineCities.map(city => (
              <button 
                key={city}
                onClick={() => toggleCity(city)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-[14px] font-black transition-all group ${
                  activeCities.includes(city) ? 'bg-blue-600/20 border border-blue-500/50 text-white shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {city}
                {activeCities.includes(city) ? <CheckSquare size={16} className="text-blue-400" /> : <Square size={16} className="text-slate-800 group-hover:text-slate-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* أزرار الاستهداف */}
      <div className="flex absolute top-6 left-6 z-[3000] flex flex-col gap-3">
        <button 
          onClick={() => setIsAiming(!isAiming)}
          className={`flex items-center gap-4 px-5 py-4 border transition-all duration-300 rounded-xl shadow-2xl ${
            isAiming ? 'bg-red-600 border-white text-white animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
          style={{cursor:'pointer'}}
        >
          <Crosshair size={24} />
          <span className="text-[12px] font-black uppercase tracking-[0.2em]">{isAiming ? 'SCANNING...' : 'START RADAR'}</span>
        </button>

        {isAiming && (
          <button 
            onClick={() => {
              if (mapRef.current) {
                const center = mapRef.current.getCenter();
                onLocationSelect({ lat: center.lat, lon: center.lng });
                setIsAiming(false);
              }
            }} 
            className="flex items-center gap-4 bg-green-600 text-white px-5 py-4 border border-green-400 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-in slide-in-from-left-4"
            style={{cursor:'pointer'}}
          >
            <Target size={20} />
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">CAPTURE SECTOR</span>
          </button>
        )}

        {selectedCoords && !isAiming && (
          <button onClick={() => onLocationSelect(null)} className="flex items-center gap-4 bg-slate-900/80 text-red-500 px-5 py-4 border border-red-900/30 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg">
            <Trash2 size={20} />
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">RESET RADAR</span>
          </button>
        )}
      </div>

      {/* مرجع التصويب (الذي تم تحديثه ليتوهج ويومض) */}
      {isAiming && (
        <div className="absolute inset-0 z-[2000] pointer-events-none flex items-center justify-center">
          {/* الخطوط المتقاطعة الرقيقة */}
          <div className="w-full h-[1px] bg-blue-500/20 absolute"></div>
          <div className="h-full w-[1px] bg-blue-500/20 absolute"></div>
          
          {/* دائرة التصويب المركزية الوامضة والمتوهجة */}
          <div className="relative flex items-center justify-center">
            {/* التوهج الخارجي الثابت */}
            <div className="w-24 h-24 border border-blue-500/10 rounded-full absolute shadow-[0_0_50px_rgba(59,130,246,0.1)]"></div>
            
            {/* الدائرة الوامضة بهدوء */}
            <div className="w-16 h-16 border-2 border-blue-500/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-aim-glow">
                {/* النقطة الحمراء المركزية الصلبة */}
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_15px_#ef4444]"></div>
            </div>
            
            {/* زوايا التصويب الرقمية */}
            <div className="absolute -top-5 -left-5 w-3 h-3 border-t-2 border-l-2 border-blue-500/50"></div>
            <div className="absolute -top-5 -right-5 w-3 h-3 border-t-2 border-r-2 border-blue-500/50"></div>
            <div className="absolute -bottom-5 -left-5 w-3 h-3 border-b-2 border-l-2 border-blue-500/50"></div>
            <div className="absolute -bottom-5 -right-5 w-3 h-3 border-b-2 border-r-2 border-blue-500/50"></div>
          </div>
        </div>
      )}

      <MapContainer center={[31.9, 35.2]} zoom={9} zoomControl={false} ref={mapRef} dragging={true} className="h-full w-full outline-none z-10">
        <MapResizer />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {activeCities.map(cityName => cityUnitsData[cityName]?.map(unit => (
          <Marker key={unit.id} position={unit.pos} icon={createUnitIcon(unit.color)} />
        )))}

        {selectedCoords && (
          <>
            <Circle center={[selectedCoords.lat, selectedCoords.lon]} radius={2000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1, dashArray: '10, 10' }} />
            <Marker position={[selectedCoords.lat, selectedCoords.lon]} icon={scanIcon} />
          </>
        )}
      </MapContainer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .unit-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
        .unit-core { width: 8px; height: 8px; border-radius: 50%; border: 1px solid white; z-index: 2; box-shadow: 0 0 5px rgba(255,255,255,0.3); }
        .unit-pulse { position: absolute; width: 14px; height: 14px; border-radius: 50%; opacity: 0.3; animation: unit-glow 3s ease-out infinite; }
        @keyframes unit-glow { 0% { transform: scale(0.6); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
        .marker-pin { width: 14px; height: 14px; border-radius: 50% 50% 50% 0; background: #3b82f6; position: absolute; transform: rotate(-45deg); left: 50%; top: 50%; margin: -7px 0 0 -7px; border: 2px solid white; box-shadow: 0 0 15px #3b82f6; }
        
        /* حركة التوهج والوميض الهادئ للمنظار */
        @keyframes aim-glow {
          0% { opacity: 0.4; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
          50% { opacity: 0.9; box-shadow: 0 0 40px rgba(59,130,246,0.4); }
          100% { opacity: 0.4; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
        }
        .animate-aim-glow {
          animation: aim-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EmergencyMap;