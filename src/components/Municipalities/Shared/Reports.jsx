/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ArrowRight, 
  Eye, Trash2, CheckCircle, 
  Clock, AlertTriangle, Loader2, ChevronRight, ChevronLeft,
  Calendar, CheckSquare, Square, X, MapPin, Image as ImageIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ReportsData from './ReportsData';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const reportsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState([]);
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get(`/Admin/all-reports?pageNumber=${page}&pageSize=${reportsPerPage}`);
      
      console.log("Reports API Response:", response.data);
      
      if (response.data && response.data.data) {
        const reportsData = response.data.data.filter(item => item.id);
        const paginationInfo = response.data.data.find(item => item.totalPages);
        
        setReports(reportsData);
        
        if (paginationInfo) {
          setTotalPages(paginationInfo.totalPages || 1);
          setTotalRecords(paginationInfo.totalRecords || reportsData.length);
        }
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "إدارة البلاغات | P.S.R.S";
    fetchReports(currentPage);
  }, [currentPage]);

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setShowPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedReport(null);
    document.body.style.overflow = 'auto';
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا البلاغ؟")) {
      try {
        await ApiAuthToken.delete(`/Admin/delete-report/${id}`);
        fetchReports(currentPage);
        closePopup();
      } catch (err) {
        console.error("Error deleting report:", err);
        alert("حدث خطأ أثناء حذف البلاغ");
      }
    }
  };

  // ✅ التصحيح هنا: icon → Icon
  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return { label: "مكتمل", color: "bg-emerald-100 text-emerald-700", Icon: CheckCircle };
      case "InProgress":
        return { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700", Icon: Clock };
      case "Pending":
        return { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700", Icon: AlertTriangle };
      default:
        return { label: status || "غير محدد", color: "bg-slate-100 text-slate-700", Icon: AlertTriangle };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase().trim();
    const reportStatus = getStatusBadge(report.status).label;
    const matchesStatus = statusFilter === "الكل" || reportStatus === statusFilter;
    
    let matchesSearch = true;
    if (searchLower) {
      matchesSearch = report.id?.toString().includes(searchLower) || 
                      report.title?.toLowerCase().includes(searchLower) || 
                      report.description?.toLowerCase().includes(searchLower);
    }
    return matchesStatus && matchesSearch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = sortedReports.slice(indexOfFirstReport, indexOfLastReport);
  const frontendTotalPages = Math.ceil(sortedReports.length / reportsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages > 1 ? totalPages : frontendTotalPages)) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExportExcel = () => {
    const dataToProcess = selectedIds.length > 0 
      ? reports.filter(r => selectedIds.includes(r.id)) 
      : sortedReports;

    const dataToExport = dataToProcess.map(report => ({
      "رقم البلاغ": report.id,
      "عنوان البلاغ": report.title,
      "تفاصيل البلاغ": report.description,
      "نوع البلاغ": report.categoryName,
      "حالة البلاغ": getStatusBadge(report.status).label,
      "تاريخ البلاغ": formatDate(report.createdAt),
      "الموقع": `${report.latitude}, ${report.longitude}`
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `PSRS_Reports_${new Date().toLocaleDateString()}.xlsx`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const displayedPages = totalPages > 1 ? totalPages : frontendTotalPages;
  const currentTotalRecords = totalRecords > 0 ? totalRecords : sortedReports.length;

  return (
    <div className="p-8 w-full bg-[#f8fafc] min-h-screen animate-in fade-in duration-500" dir="rtl">
      <ReportsData />

      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold">
            <Link to="/ControlPanel" className="hover:text-emerald-600 transition-colors">لوحة التحكم</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800">سجل البلاغات الكامل</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة البلاغات الواردة</h2>
        </div>

        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="cursor-pointer flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            <Download size={18} className="text-emerald-600" />
            {selectedIds.length > 0 ? `تصدير المحدد (${selectedIds.length})` : "تصدير Excel"}
          </button>
          <Link to="/ControlPanel" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
            <ArrowRight size={18} />
            رجوع
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 space-y-6">
        <div className="relative w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم البلاغ، العنوان، أو التفاصيل..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pr-14 pl-6 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 ml-2 font-bold text-[10px] uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
            <Filter size={14} /> تصفية النتائج
          </div>
          
          {[
            { label: "الكل", value: "الكل" },
            { label: "مكتمل", value: "Completed" },
            { label: "قيد المعالجة", value: "InProgress" },
            { label: "قيد الانتظار", value: "Pending" }
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => { setStatusFilter(filter.label); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === filter.label 
                  ? "bg-slate-800 text-white shadow-lg" 
                  : "bg-slate-100 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50 mb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-slate-500 font-bold">جاري تحميل سجل البلاغات...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 w-10"></th>
                    <th className="p-6 text-sm font-black text-slate-600 uppercase">المعرف</th>
                    <th className="p-6 text-sm font-black text-slate-600">عنوان البلاغ</th>
                    <th className="p-6 text-sm font-black text-slate-600">التفاصيل</th>
                    <th className="p-6 text-sm font-black text-slate-600">النوع</th>
                    <th className="p-6 text-sm font-black text-slate-600">الحالة</th>
                    <th className="p-6 text-sm font-black text-slate-600 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentReports.map((report) => {
                    const status = getStatusBadge(report.status);
                    const StatusIcon = status.Icon;
                    const isSelected = selectedIds.includes(report.id);
                    
                    return (
                      <tr key={report.id} className="hover:bg-emerald-50/20 transition-all group">
                        <td className="p-6">
                          <button onClick={() => toggleSelect(report.id)} className="cursor-pointer text-slate-300 hover:text-emerald-600 transition-colors">
                            {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} />}
                          </button>
                        </td>
                        <td className="p-6">
                          <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm text-xs">
                            #{report.id}
                          </span>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-bold text-slate-800 leading-relaxed">{report.title || "بدون عنوان"}</p>
                        </td>
                        <td className="p-6 max-w-md">
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            {report.description || "لا توجد تفاصيل"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                            <Calendar size={10} /> {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                            {report.categoryName || "غير محدد"}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black ${status.color}`}>
                            <StatusIcon size={14} /> {status.label}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => viewReportDetails(report)}
                              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-sm border border-blue-100 cursor-pointer"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(report.id)}
                              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 shadow-sm border border-rose-100 cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {displayedPages > 1 && (
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-slate-500 font-bold">
                  عرض <span className="text-slate-800">{indexOfFirstReport + 1}</span> إلى{" "}
                  <span className="text-slate-800">{Math.min(indexOfLastReport, sortedReports.length)}</span> من أصل{" "}
                  <span className="text-slate-800">{currentTotalRecords}</span> بلاغ
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(displayedPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-black transition-all cursor-pointer ${
                          currentPage === index + 1 
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === displayedPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popup لعرض التفاصيل */}
      {showPopup && selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white rounded-t-2xl">
              <button 
                onClick={closePopup}
                className="absolute left-4 top-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold pr-8">تفاصيل البلاغ #{selectedReport.id}</h2>
              <div className="flex items-center gap-2 mt-2">
                {(() => {
                  const status = getStatusBadge(selectedReport.status);
                  const StatusIcon = status.Icon;
                  return <StatusIcon size={14} className="text-white/80" />;
                })()}
                <span className="text-white/80 text-sm">{getStatusBadge(selectedReport.status).label}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">عنوان البلاغ</label>
                <p className="text-lg font-bold text-slate-800 mt-1">{selectedReport.title || "بدون عنوان"}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">التفاصيل الكاملة</label>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{selectedReport.description || "لا توجد تفاصيل"}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">نوع البلاغ</label>
                <p className="text-sm text-slate-700 mt-1">{selectedReport.categoryName || "غير محدد"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Calendar size={12} /> التاريخ
                  </label>
                  <p className="text-sm text-slate-700 mt-1">{formatDate(selectedReport.createdAt)}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <MapPin size={12} /> الموقع
                  </label>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedReport.latitude}, {selectedReport.longitude}
                  </p>
                </div>
              </div>

              {selectedReport.imageUrl && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <ImageIcon size={12} /> الصورة المرفقة
                  </label>
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={selectedReport.imageUrl} 
                      alt="Report" 
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={closePopup}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
              <button 
                onClick={() => handleDelete(selectedReport.id)}
                className="px-6 py-2 text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                حذف البلاغ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;