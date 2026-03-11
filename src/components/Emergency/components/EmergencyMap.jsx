import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. تحسين الأيقونة وتحديد نقطة الارتكاز (Anchor) بدقة
const createCustomIcon = (color) => new L.DivIcon({
  html: `
    <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
      <div style="background-color: ${color}; width: 10px; height: 10px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 15px ${color}; z-index: 2;"></div>
      <div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite; position: absolute; z-index: 1;"></div>
    </div>
    <style>
      @keyframes pulse { 0% { transform: scale(1); opacity: 0.4; } 100% { transform: scale(2.5); opacity: 0; } }
      /* حذف ستايل ليفلت الافتراضي الذي يسبب الانزياح */
      .leaflet-tooltip-top:before { display: none !important; }
      .cad-tooltip { 
        background: rgba(15, 23, 42, 0.9) !important; 
        border: 1px solid #1e293b !important; 
        color: white !important; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        font-family: 'monospace' !important;
        font-weight: 900 !important;
        font-size: 11px !important;
        letter-spacing: 0.5px !important;
      }
    </style>
  `,
  className: 'custom-emergency-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const EmergencyMap = () => {
  const centerPosition = [31.9029, 35.2062];

  const markers = [
    { name :"مركز الاطفاء والدفاع المدني", position: [31.7029, 35.2062], color: "#ef4444", type: "FIRE" },
    {name:"مركز شرطة",  position: [32.2211, 35.2544], color: "#3b82f6", type: "POLICE" },
    {name: "مستشفى الطوارئ", position: [31.9200, 35.2300], color: "#10b981", type: "MED" },
  ];

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "#020617" }}>
      <MapContainer 
        center={centerPosition} 
        zoom={13} 
        zoomControl={false} 
        className="h-full w-full"
        style={{ background: "#020617" }}
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
          attribution='&copy; PSRS Ops Center' 
        />

        {markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            position={marker.position} 
            icon={createCustomIcon(marker.color)}
          >
            <Tooltip 
              permanent 
              direction="top" 
              offset={[0, -12]} 
              className="cad-tooltip"
            >
            </Tooltip>

            <Popup className="cad-popup">
              <div className="text-right font-mono p-1">
                <h3 className="font-bold  border-slate-700 pb-2 mb-2 text-black text-center">{marker.name}</h3>
                <p className="text-[10px] text-slate-400 mb-2 uppercase">Loc: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</p>
              
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000] opacity-20">
        <div className="w-10 h-[1px] bg-blue-500"></div>
        <div className="w-[1px] h-10 bg-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-[999]"></div>
    </div>
  );
};

export default EmergencyMap;