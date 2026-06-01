/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ استدعاء محرك التوجيه لربطه برابط العرض الشامل
import ApiAuthToken from '../../../Api/ApiAuthToken'; 
import { 
  Shield, Ambulance, Flame, MapPin, Eye, 
  X, AlertTriangle, ArrowLeftRight, Loader2 
} from 'lucide-react';

const EmergencyType = {
  Police: 1,
  Ambulance: 2,
  Fire: 3
};

const EmergencyReportsPanel = ({ onLocateOnMap }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate(); // ✅ تفعيل الـ Navigation

  // --- 1. جلب البيانات من الـ Endpoint المعلق في الـ Controller عبر الـ Interceptor المعتمد لديك ---
  const fetchPendingReports = useCallback(async () => {
    setLoading(true);
    try {
      // سحب البلاغات المعلقة المتوافقة مع [HttpGet("pending-reports")]
      const response = await ApiAuthToken.get('/emergency-employee/pending-reports');
      if (response && response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Error connecting via ApiAuthToken Interceptor:", error);
    } finally {
      setLoading(false);
    }
  }, []); // مصفوفة فارغة لضمان استقرار الدالة في الذاكرة ومنع الخطوط الحمراء وحلقات الريندر

  // تفعيل التتبع الدوري الذكي لجلب البلاغات الطازجة كل 15 ثانية تلقائياً
  useEffect(() => {
    fetchPendingReports();
    
    const interval = setInterval(() => {
      fetchPendingReports();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchPendingReports]);

  // دالة الاستايلات والألوان الموحدة لبلاغات الطوارئ
  const getEmergencyStyle = (type) => {
    switch (type) {
      case EmergencyType.Police:
        return {
          icon: <Shield className="text-blue-500" size={18} />,
          bg: "border-blue-500/20 bg-blue-950/10 hover:bg-blue-950/20",
          badge: "bg-blue-500/20 text-blue-400"
        };
      case EmergencyType.Ambulance:
        return {
          icon: <Ambulance className="text-amber-500" size={18} />,
          bg: "border-amber-500/20 bg-amber-950/10 hover:bg-amber-950/20",
          badge: "bg-amber-500/20 text-amber-400"
        };
      case EmergencyType.Fire:
        return {
          icon: <Flame className="text-red-500" size={18} />,
          bg: "border-red-500/20 bg-red-950/10 hover:bg-red-950/20",
          badge: "bg-red-500/20 text-red-400"
        };
      default:
        return {
          icon: <AlertTriangle className="text-slate-400" size={18} />,
          bg: "border-slate-800 bg-slate-900/40 hover:bg-slate-900/60",
          badge: "bg-slate-800 text-slate-400"
        };
    }
  };

  return (
    <aside className="w-80 h-full bg-black border-l border-slate-900 flex flex-col font-sans overflow-hidden" dir="rtl">
      
      {/* هيدر تغذية البيانات الحية */}
      <div className="p-4 border-b border-slate-900 bg-[#050505] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">
            Live Emergency Feed
          </span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 size={12} className="text-slate-400 animate-spin" />}
          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-bold">
            {reports.length} معلق
          </span>
        </div>
      </div>

      {/* قائمة الكروت المبسطة للاستقبال اللحظي من السيرفر */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 hide-scrollbar">
        {loading && reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            <Loader2 className="text-blue-500 animate-spin" size={24} />
            <span className="text-[10px] text-slate-500 font-bold tracking-widest">جاري تأمين الاتصال الآمن...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-4">
            <AlertTriangle size={32} className="text-slate-500 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white">لا يوجد بلاغات نشطة حالياً</p>
          </div>
        ) : (
          reports.map((report, index) => {
            const style = getEmergencyStyle(report.emergencyType);
            return (
              <div 
                key={report.id || index}
                className={`border rounded-xl p-3 transition-all duration-300 relative group flex flex-col gap-2 ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {style.icon}
                    <h4 className="text-white font-bold text-xs truncate">
                      {report.title || "بلاغ طارئ عاجل"}
                    </h4>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="p-1.5 rounded-lg bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all shadow-md cursor-pointer"
                  >
                    <Eye size={13} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 min-w-0 text-slate-500">
                    <MapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{report.addressName || "موقع جغرافي مباشر"}</span>
                  </div>
                  {report.city && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${style.badge}`}>
                      {report.city}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* أزرار السحب السفلي والتحكم الاستراتيجي والتوجيه لصفحة العرض الشامل */}
      <div className="p-3 bg-[#020202] border-t border-slate-900">
        <button 
          onClick={() => navigate('/emergency-reports/view')} // ✅ الانتقال الفوري لصفحة الطوارئ الشاملة عند الضغط
          className="w-full bg-slate-900/60 border border-white/5 hover:bg-indigo-600 hover:border-indigo-400 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg cursor-pointer"
        >
          <ArrowLeftRight size={14} className="text-indigo-400 group-hover:text-white transition-colors" />
          <span>عرض جميع البلاغات في النظام</span>
        </button>
      </div>

      <div className="pb-4 pt-1 bg-[#020202] flex flex-col items-center opacity-40">
        <div className="text-slate-600 font-black text-[8px] tracking-[0.4em]">PSRS SYSTEM</div>
      </div>

      {/* ======================================================== */}
      {/* مودال تفاصيل البلاغ وتتبع مسار صور مجلد الطوارئ الحقيقي */}
      {/* ======================================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2">
                {getEmergencyStyle(selectedReport.emergencyType).icon}
                <span className="text-white font-black text-sm">تفاصيل البلاغ الطارئ</span>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-right overflow-y-auto max-h-[70vh] hide-scrollbar">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">عنوان البلاغ</label>
                <p className="text-white font-bold text-sm">{selectedReport.title || "بلاغ طارئ عاجل"}</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">وصف الحادث وطبيعة الحالة</label>
                <p className="text-slate-300 text-xs leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                  {selectedReport.description || "لا يوجد وصف تفصيلي ملحق بهذا البلاغ العاجل."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">المدينة</label>
                  <p className="text-white text-xs font-bold">{selectedReport.city || "غير محددة"}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">العنوان الوصفي</label>
                  <p className="text-white text-xs font-bold truncate">{selectedReport.addressName || "موقع جغرافي مباشر"}</p>
                </div>
              </div>

              {/* معالجة وحل مسار سلاشات مجلد uploads/EmergencyReports المسترجع من قاعدة البيانات */}
              {selectedReport.imagePath && (
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">صورة ملتقطة من الموقع</label>
                  <div className="border border-white/10 rounded-xl overflow-hidden bg-black max-h-40 flex items-center justify-center">
                    <img 
                      src={`${import.meta.env.VITE_BASE_URL}/${selectedReport.imagePath.replace(/\\/g, '/')}`} 
                      alt="Incident Evidence" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // صورة احتياطية في حال تعذر العثور على الملف الفعلي في خادم السيرفر المحلي
                        e.target.src = '/placeholder-emergency.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900/20 flex gap-2">
              <button
                onClick={() => {
                  // إطلاق الرادار الدقيق وإسقاط الإحداثيات المباشرة على الخريطة
                  onLocateOnMap(selectedReport.latitude, selectedReport.longitude);
                  setSelectedReport(null); 
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MapPin size={14} />
                <span>اعرض المكان على الخريطة</span>
              </button>
              <button onClick={() => setSelectedReport(null)} className="px-4 bg-slate-900 text-slate-400 border border-white/5 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </aside>
  );
};

export default EmergencyReportsPanel;