/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup, Circle } from 'react-leaflet';
import { Search, MapPin, X, Navigation2, Loader2, Plus, Minus, Maximize } from 'lucide-react'; 
import L from 'leaflet';

// --- حل مشكلة اختفاء الأيقونات الافتراضية بعد الرفع ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- مكون التحكم بالخريطة (Handler) ---
const MapHandler = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lon], 15, { animate: true, duration: 2.1 });
    }
  }, [target, map]);
  return null;
};

// --- أزرار التحكم العائمة المخصصة ---
const CustomZoomControls = ({ target }) => {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleReset = () => {
    if (target) {
      map.flyTo([target.lat, target.lon], 15);
    } else {
      map.flyTo([31.9, 35.2], 9);
    }
  };

  return (
    <div className="absolute bottom-10 right-8 z-[4000] flex flex-col gap-3">
      {/* زر التكبير */}
      <button 
        onClick={handleZoomIn}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-2xl group"
        title="تكبير"
      >
        <Plus size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* زر التصغير (حل مشكلة الماوس باد) */}
      <button 
        onClick={handleZoomOut}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-2xl group"
        title="تصغير"
      >
        <Minus size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* زر إعادة التوسيط */}
      <button 
        onClick={handleReset}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl group mt-2"
        title="إعادة التوسيط"
      >
        <Maximize size={20} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

const EmergencyMap = ({ medicalData = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setSelectedLocation({ lat, lon, name: result.display_name.split(',')[0] });
    setEmergencyUnits([
      { id: 1, type: 'Police', pos: [lat + 0.005, lon + 0.005], color: '#0066ff' },
      { id: 2, type: 'Fire', pos: [lat - 0.004, lon - 0.006], color: '#ef4444' },
      { id: 3, type: 'Ambulance', pos: [lat - 0.006, lon - 0.006], color: '#ffffff' }
    ]);
    setResults([]);
    setSearchTerm("");
  };

  const createIcon = (color) => L.divIcon({
    className: 'custom-icon',
    html: `<div class="pulse-ring" style="border-color: ${color}"></div><div class="core-dot" style="background: ${color}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div className="w-full h-full relative bg-[#050505]" dir="rtl">
      
      {/* واجهة البحث */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[4000] w-[95%] max-w-xl">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 shadow-2xl">
          <div className="relative flex items-center">
            <div className="pr-4">
              {isLoading ? <Loader2 className="text-blue-500 animate-spin" size={20} /> : <Search className="text-slate-400" size={20} />}
            </div>
            <input
              type="text"
              placeholder="ابحث في فلسطين..."
              className="w-full bg-transparent text-white py-3 pr-2 pl-4 focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {selectedLocation && (
              <button onClick={() => {setSelectedLocation(null); setEmergencyUnits([]);}} className="pl-4 text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-2 border-t border-white/5 max-h-64 overflow-y-auto hide-scrollbar">
              {results.map((res, idx) => (
                <button key={idx} onClick={() => handleSelectResult(res)} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/5 text-right group transition-colors">
                  <MapPin size={16} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm">{res.display_name.split(',')[0]}</span>
                    <span className="text-slate-500 text-[11px] truncate w-64">{res.display_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* الخريطة */}
      <MapContainer center={[31.9, 35.2]} zoom={9} zoomControl={false} className="h-full w-full z-10">
        <MapHandler target={selectedLocation} /> 
        
        {/* أزرار التحكم المخصصة */}
        <CustomZoomControls target={selectedLocation} />

        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {selectedLocation && (
          <React.Fragment>
            <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
              <Popup><b>{selectedLocation.name}</b></Popup>
            </Marker>
            <Circle 
              center={[selectedLocation.lat, selectedLocation.lon]} 
              radius={1500} 
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} 
            />
          </React.Fragment>
        )}

        {emergencyUnits.map(unit => (
          <Marker key={unit.id} position={unit.pos} icon={createIcon(unit.color)}>
             <Popup>{unit.type}</Popup>
          </Marker>
        ))}

        {medicalData && medicalData.map(h => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={createIcon('#10b981')}>
             <Popup>{h.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .custom-icon { display: flex; align-items: center; justify-content: center; position: relative; }
        .pulse-ring { position: absolute; width: 30px; height: 30px; border: 2px solid; border-radius: 50%; animation: pulse 2s infinite; pointer-events: none; }
        .core-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; z-index: 10; }
        @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default EmergencyMap;