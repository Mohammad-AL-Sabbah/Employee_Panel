/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Search, MapPin, X, Loader2, Plus, Minus, Maximize, Layers } from 'lucide-react';

const PALESTINE_CENTER = { lat: 32.2211, lng: 35.2544 }; // نابلس
const DEFAULT_ZOOM = 9;

// --- مكون التحكم العائم والمطور بالخريطة ---
const CustomMapControls = ({ selectedLocation, mapType, setMapType }) => {
  const map = useMap();

  // تفعيل الحركة السلسة عند تغير الموقع المختار (FlyTo الموازي)
  useEffect(() => {
    if (map && selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(15);
    }
  }, [selectedLocation, map]);

  const handleZoomIn = () => map && map.setZoom(map.getZoom() + 1);
  const handleZoomOut = () => map && map.setZoom(map.getZoom() - 1);
  
  const handleReset = () => {
    if (!map) return;
    if (selectedLocation) {
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(15);
    } else {
      map.panTo(PALESTINE_CENTER);
      map.setZoom(DEFAULT_ZOOM);
    }
  };

  // الدوران بين أنواع الخرائط عند الضغط على زر الطبقات
  const toggleMapType = () => {
    if (mapType === 'dark') setMapType('roadmap');
    else if (mapType === 'roadmap') setMapType('satellite');
    else setMapType('dark');
  };

  return (
    <div className="absolute bottom-10 right-8 z-[4000] flex flex-col gap-3">
      {/* زر تبديل الطبقات (داكن / فاتح / أقمار صناعية) */}
      <button 
        onClick={toggleMapType}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-amber-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all shadow-2xl group"
        title="تغيير مظهر الخريطة"
      >
        <Layers size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      <hr className="border-white/10 my-1" />

      <button 
        onClick={handleZoomIn}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-2xl group"
        title="تكبير"
      >
        <Plus size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      <button 
        onClick={handleZoomOut}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-2xl group"
        title="تصغير"
      >
        <Minus size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      <button 
        onClick={handleReset}
        className="p-3 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl group"
        title="إعادة التوسيط"
      >
        <Maximize size={20} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

// --- المكون الأساسي للشاشة ---
const EmergencyMap = ({ medicalData = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingReports, setPendingReports] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  
  // الحالة المسؤولة عن نوع المظهر: 'dark' أو 'roadmap' أو 'satellite'
  const [mapType, setMapType] = useState('dark');

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = "bf51a910020cf5a"; 

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        const reportsRes = await fetch('/api/emergency-employee/pending-reports');
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setPendingReports(reportsData);
        }

        const unitsRes = await fetch('/api/emergency-employee/available-units');
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setAvailableUnits(unitsData);
        }
      } catch (error) {
        console.error("Error loading emergency dashboard data:", error);
      }
    };
    fetchEmergencyData();
  }, []);

  const searchLocation = async (query) => {
    if (query.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=ps&limit=5`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => { if (searchTerm) searchLocation(searchTerm); }, 600);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedLocation({ lat, lng, name: result.display_name.split(',')[0] });
    setResults([]);
    setSearchTerm("");
  };

  // تنسيق الوضع الداكن المخصص
  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
  ];

  return (
    <APIProvider apiKey={googleApiKey}>
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
                placeholder="ابحث في فلسطين عبر خرائط جوجل..."
                className="w-full bg-transparent text-white py-3 pr-2 pl-4 focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {selectedLocation && (
                <button onClick={() => setSelectedLocation(null)} className="pl-4 text-slate-500 hover:text-white">
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

        {/* الخريطة الذكية - تم إزالة center و zoom الديناميكي لمنع تجمد الخريطة */}
        <Map
          defaultCenter={PALESTINE_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapTypeId={mapType === 'dark' ? 'roadmap' : mapType} // إذا كان 'dark' نمرر 'roadmap' ونطبق الاستايل مصفوفة
          styles={mapType === 'dark' ? darkMapStyle : []}      // نلغي مصفوفة التعتيم إذا اختار الموظف المظهر الفاتح أو القمر الصناعي
          disableDefaultUI={true}
          mapId={MAP_ID}
          className="w-full h-full"
        >
          {/* أزرار التحكم والطبقات العائمة */}
          <CustomMapControls 
            selectedLocation={selectedLocation} 
            mapType={mapType} 
            setMapType={setMapType} 
          />

          {/* أ. ماركر الموقع المبحوث عنه */}
          {selectedLocation && (
            <AdvancedMarker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
              <Pin background={'#3b82f6'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
            </AdvancedMarker>
          )}

          {/* ب. ماركرز المستشفيات باللون الأخضر */}
          {medicalData.map((hospital) => (
            hospital.lat && hospital.lng && (
              <AdvancedMarker 
                key={hospital.id} 
                position={{ lat: parseFloat(hospital.lat), lng: parseFloat(hospital.lng) }}
                title={hospital.name}
              >
                <Pin background={'#10b981'} borderColor={'#ffffff'} scale={0.9} />
              </AdvancedMarker>
            )
          ))}

          {/* ج. ماركرز البلاغات الطارئة المعلقة باللون الأحمر والنبض اللحظي */}
          {pendingReports.map((report) => (
            report.latitude && report.longitude && (
              <AdvancedMarker 
                key={report.id} 
                position={{ lat: report.latitude, lng: report.longitude }}
                title={report.title || "بلاغ طارئ"}
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 bg-red-500/40 rounded-full animate-ping" />
                  <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-xl z-10" />
                </div>
              </AdvancedMarker>
            )
          ))}
        </Map>

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </APIProvider>
  );
};

export default EmergencyMap;