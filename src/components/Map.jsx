import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Map = () => {
  // إحداثيات افتراضية لنابلس
  const center = [32.2211, 35.2544];

  return (
    <div className="h-full w-full">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {/* مثال لنقطة طوارئ */}
        <CircleMarker center={[32.2211, 35.2600]} radius={10} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }}>
          <Popup>بلاغ طوارئ نشط</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

export default Map;