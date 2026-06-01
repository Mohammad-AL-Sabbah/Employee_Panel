/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import { 
  Plus, MessageSquare, MapPin, AlertCircle, 
  Clock, Bell, ChevronLeft, Users, Loader2, Search, RotateCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';

function ControlPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // لحالة الريفريش الصامت في الخلفية
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // دالة جلب البيانات مع منطق الترتيب التلقائي من الأحدث للأقدم
const fetchReports = useCallback(async (showFullLoader = false) => {
  if (showFullLoader) setLoading(true);
  else setIsRefreshing(true);

  try {
    // استخدام كلاس الأمان المخصص مع تمرير الحجم المناسب للوحة الرئيسية (مثلاً أول 10 بلاغات)
    const response = await ApiAuthToken.get('/Admin/all-reports?pageNumber=1&pageSize=10');
    
    if (response.data && response.data.data) {
      // تصفية العناصر التي تمثل بلاغات فعلية (تحتوي على ID) كما فعلت في صفحة السجل
      const reportsData = response.data.data.filter(item => item.id);
      
      // ترتيب هندسي: الأحدث أولاً بناءً على تاريخ الإنشاء المتوفر في قاعدة بيانات PSRS
      const sortedData = [...reportsData].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setReports(sortedData);
      setError(null);
    } else {
      setReports([]);
    }
  } catch (err) {
    console.error("Error fetching reports in ControlPanel:", err);
    setError("فشل في جلب البلاغات المزامنة لنظام PSRS");
  } finally {
    setLoading(false);
    setIsRefreshing(false);
  }
}, []);
  // جلب البيانات عند تحميل الصفحة وإعداد المؤقت التلقائي (كل 10 دقائق)
  useEffect(() => {
    document.title = "لوحة التحكم | P.S.R.S";
    
    // أول جلب مع لودر كامل الواجهة
    fetchReports(true);

    // إعداد إنترفال للتحديث التلقائي الصامت كل 10 دقائق (10 * 60 * 1000 مللي ثانية)
    const intervalId = setInterval(() => {
      fetchReports(false);
    }, 600000);

    return () => clearInterval(intervalId);
  }, [fetchReports]);

  // منطق البحث والفلترة وعرض أول 5 بلاغات فقط في الصفحة الرئيسية
  const displayReports = reports
    .filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.citizenName && item.citizenName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toString().includes(searchTerm))
    )
    .slice(0, 5); 

  return (
    <div className="p-8 w-full bg-transparent animate-in fade-in duration-500" dir="rtl">
      
      {/* رأس الصفحة الداخلي */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم للموظف - نظام البلديات</h2>
      </div>

      <div className="grid grid-cols-8 gap-8">
        {/* الجزء الأيمن الرئيسي */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* قسم الإجراءات السريعة */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Plus size={16} className="text-[#10b981]" />
              <span>إجراءات سريعة</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickCard icon={Plus} label="إضافة إعلان" to="#" active />
              <QuickCard icon={MessageSquare} label="إرسال إشعار" to="#" />
              <QuickCard icon={Users} label="مستخدمين النظام" to="/users" />
              <QuickCard icon={MapPin} label="موقع وحالة الفرق" to="/teams" />
            </div>
          </div>

          {/* قسم البلاغات الواردة الحقيقي */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[450px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                  أحدث البلاغات الواردة
                  {isRefreshing && <Loader2 className="animate-spin text-emerald-500" size={16} />}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm ? `نتائج البحث عن: "${searchTerm}"` : "تحديث تلقائي مباشر كل 10 دقائق من PSRS"}
                </p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* حقل البحث الذكي */}
                <div className="relative w-full sm:w-72 group">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث برقم البلاغ، المحتوى، أو الاسم..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* زر التحديث اليدوي الفوري المدمج */}
                <button 
                  onClick={() => fetchReports(false)}
                  disabled={isRefreshing || loading}
                  className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                  title="تحديث البيانات الآن"
                >
                  <RotateCw size={16} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <Link to="/reports" className="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                عرض سجل البلاغات الكامل
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="text-sm font-medium">جاري مزامنة بيانات PSRS الحقيقية...</p>
                </div>
              ) : error ? (
                <div className="text-center py-24 text-red-400 bg-red-50 rounded-3xl border border-red-100 italic text-sm">
                  {error}
                </div>
              ) : displayReports.length > 0 ? (
                displayReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <AlertCircle size={22} />
                      </div>
                      <div className="max-w-xl text-right">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {report.title || report.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                          <span className="font-bold text-slate-500">المواطن:</span> {report.citizenName || "مجهول"}
                          <span className="text-slate-300">|</span>
                          <span className="font-bold text-slate-500">الحالة:</span> 
                          <span className="text-emerald-600 font-medium">{report.status || "جديد"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase">
                          رقم البلاغ : {report.id}
                        </span>
                      </div>
                      <ChevronLeft 
                        size={18} 
                        className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30 text-sm">
                   عذراً، لا يوجد بلاغات تطابق البحث أو السجل فارغ حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

    
      </div>
    </div>
  );
}

// مكون كرت الإجراءات السريعة المطور مع Link
const QuickCard = ({ icon: Icon, label, to = "/", active = false }) => {
  const baseClasses = "aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm no-underline";
  const stateClasses = active 
    ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-200 shadow-xl scale-105" 
    : "bg-white border-slate-200 text-slate-600 hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1";

  return (
    <Link to={to} className={`${baseClasses} ${stateClasses}`}>
      <div className={`${active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'} p-3.5 rounded-2xl transition-colors`}>
        <Icon size={22} />
      </div>
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
};

export default ControlPanel;