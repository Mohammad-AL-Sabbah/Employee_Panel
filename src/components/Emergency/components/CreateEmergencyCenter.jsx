/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
// 🚨 استدعاء الأكسيوس المخصص الذي يحتوي على ميزة تجديد الـ Token تلقائياً
import ApiAuthToken from '../../../Api/ApiAuthToken'; 
import { 
  Building2, Phone, MapPin, Globe2, 
  User, Save, XCircle, Navigation 
} from 'lucide-react';
// استيراد الـ Hook الحديث بدلاً من LoadScript لمنع بطء وتحجيم تحميل الخريطة
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

import EmergencySidebar from './EmergencySidebar';

const CreateEmergencyCenter = () => {
  // ---- الـ State الخاص ببيانات طلب الإضافة ----
  const [formData, setFormData] = useState({
    centerName: '',
    city: '',
    centerType: 3, // الافتراضي إسعاف (CenterType: 3)
    address: '',
    managerName: '',
    managerNumber: '',
    latitude: 32.2226,  // إحداثيات افتراضية دقيقة لفلسطين (نابلس كمحور)
    longitude: 35.2621
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // جلب مفتاح الخرائط السحابي الآمن من متغيرات البيئة لـ Vite
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // ⚡ تفعيل التحميل الذكي والسريع للخرائط عبر الـ Hook لمنع تكرار الـ Re-render
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const mapContainerStyle = { width: '100%', height: '350px', borderRadius: '1.5rem' };

  // تنسيق الثيم المظلم الفاخر ليحافظ على الهوية البصرية للـ PSRS
  const darkMapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
      { featureType: "road", elementType: "geometry.solid", stylers: [{ color: "#2c2c2c" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
    ]
  };

  // قائمة المحافظات الفلسطينية الموحدة في السيستم
  const palestinianCities = [
    "القدس", "رام الله والبيرة", "نابلس", "الخليل", "بيت لحم", 
    "جنين", "طولكرم", "قلقيلية", "أريحا", "سلفيت", "طوباس"
  ];

  // دالة التعامل مع تغيير المدخلات وتجهيز الأنواع الرقمية والصحيحة
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'centerType' || name === 'latitude' || name === 'longitude') ? Number(value) : value
    }));
  };

  // ---- دالة التقاط موقع المستخدم الحالي عبر المتصفح تلقائياً ----
  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: Number(position.coords.latitude),
            longitude: Number(position.coords.longitude)
          }));
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("تعذر التقاط موقعك الحالي، يرجى التحقق من صلاحيات تحديد الموقع في متصفحك.");
        }
      );
    } else {
      alert("متصفحك الحالي لا يدعم ميزة تحديد الموقع التلقائي.");
    }
  };

  // ---- دالة تحديث الإحداثيات عند النقر على الخريطة في أي مكان ----
  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat),
      longitude: Number(lng)
    }));
  };

  // ---- دالة تحديث الإحداثيات عند الانتهاء من سحب وإفلات الدبوس ----
  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat),
      longitude: Number(lng)
    }));
  };

  // دالة رفع البيانات الحية إلى الـ API عبر الـ Interceptor المطور
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await ApiAuthToken.post('/emergency-employee/emergency-departments', formData);

      const successMessage = response.data?.message || 'تم إدراج قسم الطوارئ الجديد بنجاح في قاعدة البيانات الموحدة للـ PSRS.';
      setMessage({ type: 'success', text: successMessage });
      
      // تفريغ الفورم وإعادته للوضع الافتراضي
      setFormData({
        centerName: '', city: '', centerType: 3, address: '',
        managerName: '', managerNumber: '', latitude: 32.2226, longitude: 35.2621
      });

    } catch (err) {
      console.error("Error creating center via interceptor:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'فشل تسجيل القسم، يرجى التحقق من صلاحيات الدخول أو المدخلات.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar relative">
          <div className="max-w-4xl p-4 mx-auto">
            
            {/* Header القسم الفخم */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-blue-500 shadow-lg shadow-blue-900/10">
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">إدراج قسم طوارئ جديد</h1>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold opacity-80">Register New Emergency Unit Center</p>
                </div>
              </div>
            </div>

            {/* رسائل التغذية الراجعة */}
            {message.text && (
              <div className={`mb-8 p-6 rounded-[2rem] border transition-all text-sm flex items-center gap-4 ${
                message.type === 'success' 
                  ? 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-950/10 border-red-500/30 text-red-400'
              }`}>
                {message.type === 'error' && <XCircle size={24} className="text-red-500 flex-shrink-0" />}
                <p className="font-semibold leading-relaxed">{message.text}</p>
              </div>
            )}

            {/* النموذج (Form Container) */}
            <form onSubmit={handleSubmit} className="bg-[#080808] border border-slate-800/60 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8">
              
              {/* القسم الأول: معلومات المركز الأساسية */}
              <div>
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <span>01</span> البيانات الإدارية والقطاع
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">اسم القسم / المركز الطارئ *</label>
                    <input 
                      type="text" 
                      name="centerName"
                      required
                      placeholder="مثال: قسم الطوارئ - نابلس"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">نوع قطاع الطوارئ *</label>
                    <select 
                      name="centerType"
                      value={formData.centerType}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white bg-no-repeat"
                    >
                      <option value="3" className="bg-[#0a0a0a]">مركز إسعاف (Ambulance)</option>
                      <option value="1" className="bg-[#0a0a0a]">مركز شرطة (Police)</option>
                      <option value="2" className="bg-[#0a0a0a]">مركز إطفاء (Firefighter)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* القسم الثاني: التوزيع الجغرافي والموقع وحقن الخريطة */}
              <div>
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <span>02</span> التوزيع الجغرافي والموقع التفاعلي
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">المحافظة التابع لها *</label>
                    <select 
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white"
                    >
                      <option value="" className="text-slate-600">اختر المحافظة...</option>
                      {palestinianCities.map(c => <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">العنوان التفصيلي أو الشارع</label>
                    <input 
                      type="text" 
                      name="address"
                      placeholder="مثال: شارع رفيديا الرئيسي - بجانب الهلال"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>

                {/* حقول الإحداثيات (تتحدث تلقائياً من الخريطة) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-black/40 p-5 rounded-t-2xl border border-slate-900 border-b-0 items-center">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">خط العرض (Latitude)</label>
                    <input 
                      type="number" 
                      step="any"
                      name="latitude"
                      readOnly
                      value={formData.latitude}
                      className="w-full bg-[#050505] border border-slate-800 rounded-xl py-2.5 px-3 outline-none text-xs font-mono text-blue-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block mr-1 uppercase">خط الطول (Longitude)</label>
                    <input 
                      type="number" 
                      step="any"
                      name="longitude"
                      readOnly
                      value={formData.longitude}
                      className="w-full bg-[#050505] border border-slate-800 rounded-xl py-2.5 px-3 outline-none text-xs font-mono text-blue-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* ميزة حقن خرائط جوجل التفاعلية بنمط الـ Cyberpunk المظلم بعد تحسين الأداء المذهل */}
                <div className="relative border border-slate-900 rounded-b-2xl overflow-hidden bg-slate-950">
                  {loadError && (
                    <div className="text-center py-24 text-red-500 bg-slate-950">
                      <p className="text-xs font-mono">حدث خطأ أثناء تحميل الخرائط الرقمية.</p>
                    </div>
                  )}

                  {isLoaded ? (
                    <>
                      {/* زر تحديد موقعي الحالي الذكي المعلق فوق الخريطة */}
                      <button
                        type="button"
                        onClick={handleGetMyLocation}
                        className="absolute top-3 left-3 z-30 bg-slate-900/90 border border-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-xl active:scale-95"
                        title="التقاط موقعي الحالي وحقنه"
                      >
                        <Navigation size={14} className="animate-pulse" />
                        تحديد موقعي الآلي 📍
                      </button>

                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: formData.latitude, lng: formData.longitude }}
                        zoom={13}
                        options={darkMapOptions}
                        onClick={handleMapClick}
                      >
                        <Marker 
                          position={{ lat: formData.latitude, lng: formData.longitude }}
                          draggable={true}
                          onDragEnd={handleMarkerDragEnd}
                          title="اسحبني لتحديد الموقع بدقة"
                        />
                      </GoogleMap>
                    </>
                  ) : (
                    <div className="text-center py-24 text-slate-600 bg-slate-950">
                      <p className="text-xs font-mono animate-pulse">جاري تهيئة الخرائط المظلمة بأمان وسرعة عالية...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* القسم الثالث: بيانات التواصل والمتابعة */}
              <div>
                <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-6 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <span>03</span> مسؤول الإرسال والتواصل
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">اسم المسؤول / مدير القسم</label>
                    <input 
                      type="text" 
                      name="managerName"
                      placeholder="اسم الضابط المسؤول عن المركز"
                      value={formData.managerName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white placeholder:text-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 block mr-1">رقم هاتف التواصل المباشر *</label>
                    <input 
                      type="text" 
                      name="managerNumber"
                      required
                      placeholder="رقم الهاتف الثابت أو الخلوي"
                      value={formData.managerNumber}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3.5 px-4 focus:border-blue-500 outline-none text-sm transition-all text-white font-mono text-left placeholder:text-slate-700 placeholder:text-right"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* أزرار الحفظ والإرسال */}
              <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row justify-end gap-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-white text-black hover:bg-blue-600 hover:text-white px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-xs uppercase shadow-xl active:scale-95 disabled:opacity-40"
                >
                  <Save size={16} />
                  {submitting ? "جاري الحفظ والمزامنة..." : "حفظ القسم وإدراجه فوراً"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateEmergencyCenter;