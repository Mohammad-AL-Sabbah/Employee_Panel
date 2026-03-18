/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, Circle } from 'react-leaflet';
import { Search, MapPin, X, Navigation2, Loader2, Shield, Flame, Activity } from 'lucide-react'; 
import L from 'leaflet';

// مكون لتحريك الكاميرا بسلاسة
const MapHandler = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], 15, { animate: true, duration: 2.1 });
    }
  }, [target, map]);
  return null;
};

const EmergencyMap = ({ medicalData = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // بيانات وحدات الطوارئ (وهمية للمثال - يمكنك استبدالها بـ API حقيقي)
  // تظهر هذه الوحدات "ديناميكياً" حول الموقع المختار
  const [emergencyUnits, setEmergencyUnits] = useState([]);

  const searchLocation = async (query) => {
    if (query.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=ps&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(() => { if (searchTerm) searchLocation(searchTerm); }, 600);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // 1. تحديث الموقع الحالي (يمسح القديم تلقائياً)
    setSelectedLocation({ lat, lon, name: result.display_name.split(',')[0] });
    
    // 2. محاكاة ظهور وحدات طوارئ قريبة من البحث (شرطة وإطفاء)
    setEmergencyUnits([
      { id: 1, type: 'Police', pos: [lat + 0.005, lon + 0.005], color: '#0066ff' },
      { id: 2, type: 'Fire', pos: [lat - 0.004, lon - 0.006], color: '#ef4444' },
      { id: 3, type: 'Ambulance', pos: [lat - 0.006, lon - 0.006], color: '#ffffff' }

    ]);

    setResults([]);
    setSearchTerm("");
  };

  // أيقونات مخصصة
  const createIcon = (color) => L.divIcon({
    className: 'custom-icon',
    html: `<div class="pulse-ring" style="border-color: ${color}"></div><div class="core-dot" style="background: ${color}"></div>`,
    iconSize: [20, 20]
  });

  return (
    <div className="w-full h-full relative bg-[#050505]" dir="rtl">
      
      {/* واجهة البحث الاحترافية */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[4000] w-[95%] max-w-xl">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="relative flex items-center">
            <div className="pr-4">
              {isLoading ? <Loader2 className="text-blue-500 animate-spin" size={20} /> : <Search className="text-slate-400" size={20} />}
            </div>
            <input
              type="text"
              placeholder="ابحث عن مدينة، قرية، أو حي في فلسطين..."
              className="w-full bg-transparent text-white py-3 pr-2 pl-4 focus:outline-none font-medium placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {selectedLocation && (
              <button onClick={() => {setSelectedLocation(null); setEmergencyUnits([]);}} className="pl-4 text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>

          {/* نتائج البحث */}
          {results.length > 0 && (
            <div className="mt-2 border-t border-white/5 max-h-64 overflow-y-auto custom-scrollbar">
              {results.map((res, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(res)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-all text-right group"
                >
                  <div className="bg-blue-500/10 p-2 rounded-xl group-hover:bg-blue-500/20">
                    <MapPin size={16} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{res.display_name.split(',')[0]}</span>
                    <span className="text-slate-500 text-[11px] truncate w-64">{res.display_name}</span>
                  </div>
                  <Navigation2 size={14} className="mr-auto text-slate-700 group-hover:text-blue-500 rotate-45" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      <MapContainer center={[31.9, 35.2]} zoom={9} zoomControl={false} className="h-full w-full z-10">
        <MapHandler target={selectedLocation} /> 
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* 1. الماركر الأساسي للموقع المبحوث عنه */}
        {selectedLocation && (
          <>
            <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
              <Popup><b>{selectedLocation.name}</b></Popup>
            </Marker>
            <Circle 
              center={[selectedLocation.lat, selectedLocation.lon]} 
              radius={1500} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1 }} 
            />
          </>
        )}

        {/* 2. وحدات الطوارئ (شرطة وإطفاء) حول البحث */}
        {emergencyUnits.map(unit => (
          <Marker key={unit.id} position={unit.pos} icon={createIcon(unit.color)}>
             <Popup>{unit.type === 'Police' ? 'مركز شرطة' : unit.type === 'Fire' ? 'مركز اطفاء' :  'مركز إسعاف'}</Popup>
          </Marker>
        ))}

        {/* 3. المستشفيات (من الـ props) */}
        {medicalData.map(h => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={createIcon('#10b981')}>
             <Popup>{h.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .custom-icon { display: flex; align-items: center; justify-content: center; }
        .pulse-ring { position: absolute; width: 30px; height: 30px; border: 2px solid; border-radius: 50%; animation: pulse 2s infinite; }
        .core-dot { width: 8px; height: 8px; border-radius: 50%; border: 2px solid white; z-index: 10; }
        @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default EmergencyMap;