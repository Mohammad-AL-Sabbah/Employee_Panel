/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, ArrowRight, 
  Eye, Trash2, CheckCircle, 
  Clock, AlertTriangle, Loader2, ChevronRight,
  Calendar, CheckSquare, Square, X, Trash,
  ClipboardList, RefreshCw, Link2Off, MapPin, Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import ReportsData from './ReportsData';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import Swal from 'sweetalert2';

const Reports = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reportsPerPage = 10;

  const [selectedIds, setSelectedIds] = useState([]);

  // --- States المودال الخاص بعرض تفاصيل مهام الفريق الميداني ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null); 
  const [assignedReports, setAssignedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // جلب البيانات من السيرفر
  const fetchReportsFromServer = async (page = 1) => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get(`/Admin/all-reports?pageNumber=${page}&pageSize=${reportsPerPage}`);
      if (response.data && response.data.data) {
        const reportsData = response.data.data.filter(item => item.id);
        const paginationInfo = response.data.data.find(item => item.totalPages);
        
        setReports(reportsData);
        if (paginationInfo) {
          setTotalPages(paginationInfo.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("خطأ في جلب البلاغات:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = `PSRS | إدارة البلاغات`;
    fetchReportsFromServer(currentPage);
  }, [currentPage]);

  // دالة فتح المودال وجلب التقارير الخاصة بالفريق
  const openTeamDetailsModal = async (teamId, teamLeaderName) => {
    setSelectedTeam({ id: teamId, leader: teamLeaderName });
    setAssignedReports([]);
    setIsDetailsModalOpen(true);
    setLoadingReports(true);
    try {
      const response = await ApiAuthToken.get(`/Admin/maintenance-team/${teamId}/assigned-reports`);
      if (response.data) {
        setAssignedReports(response.data);
      }
    } catch (err) {
      console.error("Error fetching assigned reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // فك ارتباط جميع البلاغات عن الفريق من داخل المودال
  const handleUnassignReports = async (teamId) => {
    const confirmResult = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم فك ارتباط جميع البلاغات المسندة لهذا الفريق وإعادتها لحالة الانتظار",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، فك الارتباط الجماعي',
      cancelButtonText: 'تراجع'
    });

    if (confirmResult.isConfirmed) {
      setActionLoading(true);
      try {
        await ApiAuthToken.patch(`/Admin/maintenance-team/${teamId}/unassign-reports`);
        setAssignedReports([]);
        fetchReportsFromServer(currentPage); 
        Swal.fire({ icon: 'success', title: 'تم فك ارتباط البلاغات بنجاح', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'حدث خطأ أثناء فك الارتباط' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // فك ارتباط بلاغ فردي واحد من داخل المودال
  const handleUnassignSingleReport = async (reportId) => {
    const confirmResult = await Swal.fire({
      title: 'تأكيد الإجراء',
      text: `هل أنت متأكد من فك ارتباط البلاغ رقم #${reportId} فقط؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، فك الارتباط',
      cancelButtonText: 'إلغاء'
    });

    if (confirmResult.isConfirmed) {
      setActionLoading(true);
      try {
        await ApiAuthToken.patch(`/Admin/maintenance-team/unassign-single-report/${reportId}`);
        setAssignedReports(prev => prev.filter(report => report.id !== reportId));
        fetchReportsFromServer(currentPage); 
        Swal.fire({ icon: 'success', title: 'تم فك ارتباط البلاغ بنجاح', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'فشل فك ارتباط البلاغ المحدّد' });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const goToDetails = (reportId) => {
    navigate('/ReportDetailsMap', { state: { reportId } });
  };

  const deleteSingleReport = async (id) => {
    const confirmResult = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف هذا البلاغ نهائياً من النظام",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، احذف الآن',
      cancelButtonText: 'تراجع'
    });

    if (confirmResult.isConfirmed) {
      try {
        await ApiAuthToken.delete(`/Admin/delete-report/${id}`);
        fetchReportsFromServer(currentPage);
        setSelectedIds(prev => prev.filter(item => item !== id));
        Swal.fire({ icon: 'success', title: 'تم الحذف بنجاح', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'فشل عملية الحذف' });
      }
    }
  };

  const deleteSelectedReports = async () => {
    const confirmResult = await Swal.fire({
        title: `حذف ${selectedIds.length} بلاغ؟`,
        text: "هذا الإجراء سيقوم بمسح جميع البلاغات المحددة ولا يمكن التراجع عنه",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'تأكيد الحذف الجماعي',
        cancelButtonText: 'إلغاء'
    });

    if (confirmResult.isConfirmed) {
        setLoading(true);
        try {
            await Promise.all(selectedIds.map(id => ApiAuthToken.delete(`/Admin/delete-report/${id}`)));
            setSelectedIds([]);
            fetchReportsFromServer(currentPage);
            Swal.fire({ icon: 'success', title: 'تم حذف البلاغات المحددة بنجاح' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'حدث خطأ أثناء الحذف الجماعي' });
        } finally {
            setLoading(false);
        }
    }
  };

  const getStatusInfo = (status) => {
    const normalizedStatus = status?.trim();
    const statusMap = {
      'Pending': { label: 'قيد الانتظار', color: "bg-amber-100 text-amber-700", Icon: AlertTriangle },
      'InProgress': { label: 'قيد العمل', color: "bg-blue-100 text-blue-700", Icon: Clock },
      'Resolved': { label: 'مُنجز', color: "bg-emerald-100 text-emerald-700", Icon: CheckCircle },
      'Rejected': { label: 'مرفوض', color: "bg-rose-100 text-rose-700", Icon: X },
      'Assigned': { label: 'مُسنَد', color: "bg-violet-100 text-violet-700", Icon: CheckCircle }
    };
    return statusMap[normalizedStatus] || { label: 'قيد الانتظار', color: "bg-amber-100 text-amber-700", Icon: AlertTriangle };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-PS', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase().trim();
    const statusInfo = getStatusInfo(report.status);
    const matchesStatus = statusFilter === "الكل" || statusInfo.label === statusFilter;
    
    let matchesSearch = true;
    if (searchLower) {
      matchesSearch = report.id?.toString().includes(searchLower) || report.title?.toLowerCase().includes(searchLower);
    }
    return matchesStatus && matchesSearch;
  });

  const exportToExcel = () => {
    const dataToProcess = selectedIds.length > 0 ? reports.filter(r => selectedIds.includes(r.id)) : filteredReports;
    const excelData = dataToProcess.map(report => ({
      "رقم البلاغ": report.id,
      "العنوان": report.title,
      "القسم": report.categoryName,
      "الحالة": getStatusInfo(report.status).label,
      "التاريخ": formatDate(report.createdAt),
      "الفريق المُسنَد": report.assignedTeamName || '---'
    
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `PSRS_Reports_Export.xlsx`);
  };

  return (
    <div className="p-8 w-full bg-[#f8fafc] min-h-screen" dir="rtl">
      <ReportsData />

      {/* الرأس - Header */}
      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold">
            <Link to="/ControlPanel" className="hover:text-emerald-600 transition-colors">لوحة التحكم</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800">إدارة البلاغات</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">سجل البلاغات الذكي</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={deleteSelectedReports}
              className="cursor-pointer flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all animate-in fade-in"
            >
              <Trash size={18} />
              حذف المحدد ({selectedIds.length})
            </button>
          )}

          <button onClick={exportToExcel} className="cursor-pointer flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <Download size={18} className="text-emerald-600" />
            تصدير البيانات
          </button>
          
          <Link to="/ControlPanel" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all">
            <ArrowRight size={18} />
            رجوع
          </Link>
        </div>
      </div>

      {/* البحث والفلترة */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 space-y-6">
        <div className="relative w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم البلاغ أو العنوان..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pr-14 pl-6 text-sm outline-none focus:ring-2 ring-emerald-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
            <Filter size={14} /> تصفية حسب الحالة
          </div>
          {["الكل", "قيد الانتظار", "قيد العمل", "مُنجز", "مرفوض", "مسند"].map((filter) => (
            <button
              key={filter}
              onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === filter ? "bg-slate-800 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-white border border-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* الجدول المعزز بعد التعديل لإضافة عمود الفريق المسؤول */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden mb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-slate-500 font-bold">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 w-10">
                    <button 
                        onClick={() => setSelectedIds(selectedIds.length === reports.length ? [] : reports.map(r => r.id))}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600"
                    >
                        {selectedIds.length === reports.length && reports.length > 0 ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} />}
                    </button>
                  </th>
                  <th className="p-6 text-sm font-black text-slate-600 uppercase">ID</th>
                  <th className="p-6 text-sm font-black text-slate-600">الموضوع</th>
                  <th className="p-6 text-sm font-black text-slate-600">الوصف والتاريخ</th>
                  <th className="p-6 text-sm font-black text-slate-600">القسم</th>
                  <th className="p-6 text-sm font-black text-slate-600">الحالة</th>
                  {/* 🟢 ترويسة العمود الجديد المضاف بالتحديد بجانب الحالة والإجراءات 🟢 */}
                  <th className="p-6 text-sm font-black text-slate-600">الفريق المسؤول</th>
                  <th className="p-6 text-sm font-black text-slate-600 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredReports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  const StatusIcon = statusInfo.Icon;
                  return (
                    <tr key={report.id} className={`hover:bg-emerald-50/10 transition-all group ${selectedIds.includes(report.id) ? 'bg-emerald-50/30' : ''}`}>
                      <td className="p-6">
                        <button onClick={() => setSelectedIds(prev => prev.includes(report.id) ? prev.filter(i => i !== report.id) : [...prev, report.id])} className="cursor-pointer text-slate-300 hover:text-emerald-600">
                          {selectedIds.includes(report.id) ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} />}
                        </button>
                      </td>
                      <td className="p-6">
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs">#{report.id}</span>
                      </td>
                      <td className="p-6 font-bold text-slate-800 text-sm">{report.title}</td>
                      <td className="p-6 max-w-md">
                        <p className="text-xs text-slate-600 line-clamp-2 italic">"{report.description}"</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1 uppercase">
                          <Calendar size={10} /> {formatDate(report.createdAt)}
                        </div>
                      </td>
                      <td className="p-6"><span className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg font-bold">{report.categoryName}</span></td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black shadow-sm ${statusInfo.color}`}>
                          <StatusIcon size={14} /> {statusInfo.label}
                        </div>
                      </td>
                      
                      {/* 🟢 عمود عرض الفريق المسؤول الجديد والذكي 🟢 */}
                      <td className="p-6">
                        {report.assignedTeamName ? (
                          <button 
                            onClick={() => openTeamDetailsModal(report.assignedTeamId, report.assignedTeamName || 'قائد الفريق')}
                            className="inline-flex items-center gap-1.5 text-xs text-violet-600 font-bold hover:text-violet-800 bg-violet-50 hover:bg-violet-100/70 px-3 py-2 rounded-xl transition-all cursor-pointer border border-violet-100"
                          >
                            <Users size={12} />
                            <span>{report.assignedTeamName || `فريق #${report.assignedTeamId}`}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                            لم يتم التحديد
                          </span>
                        )}
                      </td>

                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => goToDetails(report.id)} className="cursor-pointer p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={16} /></button>
                          <button onClick={() => deleteSingleReport(report.id)} className="cursor-pointer p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* مودال تفاصيل البلاغات المسندة المدمج بدون أي عناصر واجهة إضافية غير مرغوبة */}
      {isDetailsModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-emerald-400" size={24} />
                <div>
                  <h2 className="text-lg font-black">بلاغات ومهام: {selectedTeam.leader}</h2>
                  <p className="text-xs text-slate-400">الرمز المعرّف للفريق الميداني: #{selectedTeam.id}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 cursor-pointer"><X size={20} /></button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-700 text-sm">قائمة المهام الحالية الموكلة للفريق ({assignedReports.length})</h3>
                {assignedReports.length > 0 && (
                  <button 
                    onClick={() => handleUnassignReports(selectedTeam.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    فك ارتباط جميع البلاغات
                  </button>
                )}
              </div>

              {loadingReports ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={36} className="animate-spin text-emerald-500 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">جاري سحب البلاغات من الخادم...</p>
                </div>
              ) : assignedReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle size={40} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-bold text-sm">سجل نظيف! لا يوجد بلاغات موكلة لهذا الفريق حالياً.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedReports.map((report) => (
                    <div key={report.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-md transition-all">
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">#{report.id} - {report.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-2">{report.description}</p>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                          <span className="bg-slate-200/60 px-2 py-0.5 rounded">{report.categoryName}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black text-[10px] rounded-lg">
                          {getStatusInfo(report.status).label}
                        </span>
                        
                        <button
                          onClick={() => handleUnassignSingleReport(report.id)}
                          disabled={actionLoading}
                          title="فك ارتباط هذا البلاغ فقط"
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer opacity-100 disabled:opacity-50"
                        >
                          <Link2Off size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;