/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import ApiAuthToken from '../../../Api/ApiAuthToken'; 
import { 
  Shield, Ambulance, Flame, MapPin, Eye, Trash2, Filter,
  Search, AlertTriangle, ChevronLeft, ChevronRight, Loader2, User, ChevronDown
} from 'lucide-react';

import EmergencySidebar from './EmergencySidebar';

const EmergencyType = {
  Police: "Police",
  Ambulance: "Ambulance",
  Fire: "Fire"
};

// قاموس متكامل ومحدث لترجمة وتلوين جميع حالات البلاغات إلى العربية بدقة
const StatusTranslate = {
  Pending: { label: "قيد الانتظار", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  InProgress: { label: "قيد التنفيذ", style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  Active: { label: "نشط حالياً", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Resolved: { label: "تم الحل", style: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  Closed: { label: "مغلق", style: "bg-slate-800 text-slate-400 border-slate-700" },
  rejected: { label: "مرفوض", style: "bg-red-500/10 text-red-400 border-red-500/20" },
  Rejected: { label: "مرفوض", style: "bg-red-500/10 text-red-400 border-red-500/20" } // احتياطاً في حال كانت بحرف كبير
};

const EmergencyReportsView = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // حالات الفلترة
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  // جلب البلاغات المعلقة من السيرفر بشكل مستقر وآمن
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get('/emergency-employee/pending-reports');
      if (response && response.data) {
        setReports(response.data);
      }
    } catch (error) {
      console.error("Error fetching system reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // دالة الحذف الموضعية للبلاغ
  const handleDeleteReport = (reportId, e) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف البلاغ رقم #${reportId}؟`)) {
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  // تصفية شاملة: بناءً على نص البحث، نوع الطوارئ، وحالة البلاغ
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // 1. تصفية النص (البحث عن العنوان، اسم المواطن، الحالة الإنجليزية أو المترجمة العربية)
      const arabicStatusText = StatusTranslate[report.status]?.label || "";
      const matchesSearch = 
        (report.title && report.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (report.citizenName && report.citizenName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (report.status && report.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (arabicStatusText.includes(searchTerm));

      // 2. تصفية نوع الطوارئ
      const matchesType = selectedType === "all" || report.emergencyType === selectedType;

      // 3. تصفية الحالة
      const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, reports, selectedType, selectedStatus]);

  // حسابات الباجينيشن الذكية
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage) || 1;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);

  // تنسيقات مخصصة مظهرياً لنوع البلاغ
  const getEmergencyStyle = (type) => {
    switch (type) {
      case EmergencyType.Police:
        return {
          label: "شرطة",
          icon: <Shield className="text-blue-500" size={14} />,
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"
        };
      case EmergencyType.Ambulance:
        return {
          label: "إسعاف",
          icon: <AmberIcon /> || <Ambulance className="text-amber-500" size={14} />,
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        };
      case EmergencyType.Fire:
        return {
          label: "إطفاء",
          icon: <Flame className="text-red-500" size={14} />,
          badge: "bg-red-500/10 text-red-400 border-red-500/20"
        };
      default:
        return {
          label: "طوارئ",
          icon: <AlertTriangle className="text-slate-400" size={14} />,
          badge: "bg-slate-800 text-slate-400 border-slate-700"
        };
    }
  };

  // دالة مساعدة لطباعة وعرض حالة البلاغ بالعربية
  const renderStatusBadge = (status) => {
    const config = StatusTranslate[status] || { label: status || "غير محدد", style: "bg-slate-800 text-slate-400 border-slate-700" };
    return (
      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${config.style}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      
      {/* الحاوية المرنة للأقسام الجانبية والمحتوى */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* السايد بار */}
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        {/* القسم الرئيسي لعرض السجلات */}
        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-6xl mx-auto mb-5">
            
            {/* عنوان الصفحة الرئيسي */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  <AlertTriangle className="text-red-500 animate-pulse" size={32} />
                  إدارة البلاغات 
                </h1>
                <p className="text-xs text-slate-500 mt-1">استعراض وتوجيه البلاغات المعلقة الواردة من المواطنين   </p>
              </div>
            </div>

            {/* شريط الفلاتر والبحث المطور */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch lg:items-center justify-between">
              
              {/* حقل البحث */}
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="بحث بالعنوان، اسم المواطن، أو الحالة..." 
                  className="bg-[#0a0a0a] border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 w-full focus:border-indigo-500 outline-none transition-all text-sm text-slate-200 shadow-inner"
                />
              </div>

              {/* القوائم المنسدلة للفلترة */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* فلتر نوع الطوارئ */}
                <div className="relative min-w-[150px]">
                  <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={selectedType}
                    onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none bg-[#0a0a0a] border border-slate-800 rounded-xl pr-9 pl-8 py-2.5 text-xs font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-colors text-slate-300"
                  >
                    <option value="all">جميع الأنواع</option>
                    <option value={EmergencyType.Police}>شرطة</option>
                    <option value={EmergencyType.Ambulance}>إسعاف</option>
                    <option value={EmergencyType.Fire}>إطفاء</option>
                  </select>
                  <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* فلتر حالة البلاغ المحدث برؤية الحالات الجديدة */}
                <div className="relative min-w-[150px]">
                  <Filter size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full appearance-none bg-[#0a0a0a] border border-slate-800 rounded-xl pr-9 pl-8 py-2.5 text-xs font-semibold outline-none cursor-pointer focus:border-indigo-500 transition-colors text-slate-300"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="Pending">قيد الانتظار</option>
                    <option value="InProgress">قيد التنفيذ</option>
                    <option value="Active">نشط حالياً</option>
                    <option value="Resolved">تم الحل</option>
                    <option value="rejected">مرفوض</option>
                    <option value="Closed">مغلق</option>
                  </select>
                  <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

              </div>
            </div>

            {/* جدول عرض البيانات */}
            <div className="bg-[#050505] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {loading && currentRecords.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="text-indigo-500 animate-spin" size={32} />
                  <span className="text-xs text-slate-500 font-bold tracking-widest">جاري سحب البلاغات النشطة من السيرفر...</span>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center opacity-40 text-center">
                  <AlertTriangle size={48} className="text-slate-600 mb-3" />
                  <p className="text-sm font-bold text-white uppercase tracking-widest">لا توجد أي بلاغات تطابق خيارات التصفية حالياً</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                        <th className="p-5">طبيعة البلاغ</th>
                        <th className="p-5 text-center">النوع والحالة</th>
                        <th className="p-5 text-center">المواطن ومُعَرّف البلاغ</th>
                        <th className="p-5">الموقع الجغرافي</th>
                        <th className="p-5 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {currentRecords.map((report, index) => {
                        const style = getEmergencyStyle(report.emergencyType);
                        return (
                          <tr key={report.id || index} className="hover:bg-indigo-600/5 transition-colors group">
                            
                            {/* العنوان والوصف */}
                            <td className="p-5">
                              <div className="font-bold text-slate-200 text-xs">{report.title || "بلاغ طارئ عاجل"}</div>
                              <div className="text-[11px] text-slate-400 max-w-xs leading-relaxed mt-1 bg-black/30 p-2 rounded-lg border border-white/5">
                                {report.description || "لا يوجد وصف ملحق"}
                              </div>
                            </td>
                            
                            {/* النوع وحالة البلاغ المعربة */}
                            <td className="p-5 text-center">
                              <div className="flex flex-col items-center gap-1.5 justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black ${style.badge}`}>
                                  {style.icon}
                                  {style.label}
                                </span>
                                {/* طباعة الحالة المترجمة ديناميكياً */}
                                {renderStatusBadge(report.status)}
                              </div>
                            </td>
                            
                            {/* اسم المواطن ورقم البلاغ */}
                            <td className="p-5 text-center">
                              <div className="flex flex-col items-center gap-1 justify-center">
                                <div className="flex items-center gap-1 text-slate-200 font-bold text-xs">
                                  <User size={12} className="text-slate-500" />
                                  <span>{report.citizenName || "مواطن مجهول"}</span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                                  ID: #{report.id}
                                </span>
                              </div>
                            </td>
                            
                            {/* الموقع الجغرافي */}
                            <td className="p-5">
                              <div className="flex items-center gap-1 text-xs text-slate-500 max-w-xs">
                                <MapPin size={12} className="text-slate-600 flex-shrink-0" />
                                <span className="truncate">{report.addressName || "موقع جغرافي مباشر"}</span>
                              </div>
                            </td>
                            
                            {/* الإجراءات */}
                            <td className="p-5 text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <button 
                                  onClick={() => navigate(`/EmergencyReportDetailsMap/${report.id}`)}
                                  className="bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white p-2 rounded-lg transition-all cursor-pointer shadow-md"
                                  title="عرض وتوجيه البلاغ على الخريطة"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={(e) => handleDeleteReport(report.id, e)} 
                                  className="bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 p-2 rounded-lg transition-all cursor-pointer shadow-md"
                                  title="حذف البلاغ"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* التحكم في صفحات العرض (الباجينيشن) */}
                  <div className="p-5 bg-[#080808] mb-3 border-t border-slate-900 flex items-center justify-between">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      عرض {currentRecords.length} من أصل {filteredReports.length} بلاغ مطابق للفلاتر
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentPage === i + 1 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                            : 'text-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// مكون داخلي مساعد لعرض أيقونة الإسعاف
const AmberIcon = () => <Ambulance className="text-amber-500" size={14} />;

export default EmergencyReportsView;