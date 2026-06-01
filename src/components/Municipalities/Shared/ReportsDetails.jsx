/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, Image as ImageIcon, AlertTriangle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const ReportsDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;
  const [showSideCard, setShowSideCard] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Google Maps API Key (يجب استبداله بمفتاحك الحقيقي)
  const GOOGLE_MAPS_API_KEY = 'AIzaSyDMFiXrtRO8z8AEjppQGBWnvg10U2gp28o';

  useEffect(() => {
    document.title = "تفاصيل البلاغ | P.S.R.S";
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // إذا لم يتم تمرير بيانات البلاغ، ارجع للصفحة السابقة
  useEffect(() => {
    if (!report) {
      navigate('/ControlPanel/Reports');
    }
  }, [report, navigate]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate('/ControlPanel/Reports');
    }, 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return { label: "مكتمل", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle };
      case "InProgress":
        return { label: "قيد المعالجة", color: "text-blue-600 bg-blue-50", icon: Clock };
      case "Pending":
        return { label: "قيد الانتظار", color: "text-amber-600 bg-amber-50", icon: AlertTriangle };
      default:
        return { label: status || "غير محدد", color: "text-slate-600 bg-slate-50", icon: AlertTriangle };
    }
  };

  if (!report) {
    return null;
  }

  const statusInfo = getStatusBadge(report.status);
  const StatusIcon = statusInfo.icon;
  const center = {
    lat: report.latitude || 32.15871810913086,
    lng: report.longitude || 35.224822998046875
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900" dir="rtl">
      {/* زر العودة */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 z-50 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all cursor-pointer group"
      >
        <X size={24} className="text-slate-700 group-hover:text-red-500 transition-colors" />
      </button>

      {/* زر إظهار/إخفاء البطاقة */}
      <button
        onClick={() => setShowSideCard(!showSideCard)}
        className="fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:bg-white transition-all cursor-pointer"
      >
        <ChevronRight size={24} className={`text-slate-700 transition-transform duration-300 ${showSideCard ? 'rotate-180' : ''}`} />
      </button>

      {/* خريطة Google كاملة الشاشة */}
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          mapId={'3d-map-demo'}
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapTypeId="satellite"
          tilt={45}
          className="w-full h-full"
        >
          <AdvancedMarker position={center}>
            <Pin background={'#ef4444'} borderColor={'#ffffff'} glyphColor={'#ffffff'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>

      {/* البطاقة الجانبية المنزلقة */}
      <div 
        className={`fixed top-0 left-0 h-full w-full md:w-96 bg-white shadow-2xl z-40 transition-transform duration-300 ease-out overflow-y-auto ${
          showSideCard ? 'translate-x-0' : 'translate-x-[-100%]'
        } ${isClosing ? 'translate-x-[-100%]' : ''}`}
        style={{ direction: 'rtl' }}
      >
        <div className="p-6 pb-8">
          {/* رأس البطاقة */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                #{report.id}
              </span>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                <StatusIcon size={14} />
                {statusInfo.label}
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              {report.title || "بدون عنوان"}
            </h1>
          </div>

          {/* الصورة المرفقة */}
          {report.imageUrl && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase">الصورة المرفقة</span>
              </div>
              <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img 
                  src={report.imageUrl} 
                  alt={report.title}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            </div>
          )}

          {/* وصف البلاغ */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">تفاصيل البلاغ</label>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
              {report.description || "لا توجد تفاصيل"}
            </p>
          </div>

          {/* المعلومات الأساسية */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">نوع البلاغ</span>
              <span className="text-sm font-semibold text-slate-800">{report.categoryName || "غير محدد"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">تاريخ الإنشاء</span>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">{formatDate(report.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-sm text-slate-500">الموقع</span>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-sm font-mono text-slate-800">
                  {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          {report.emergencyType && (
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">نوع الطوارئ</label>
              <p className="text-sm text-slate-700">{report.emergencyType}</p>
            </div>
          )}

          {report.availableTeams && report.availableTeams.length > 0 && (
            <div className="mb-6">
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">الفرق المتاحة</label>
              <div className="flex flex-wrap gap-2">
                {report.availableTeams.map((team, idx) => (
                  <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* زر فتح في خرائط Google */}
          <a
            href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-4 text-center bg-slate-800 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
          >
            فتح الموقع في خرائط جوجل
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReportsDetails;