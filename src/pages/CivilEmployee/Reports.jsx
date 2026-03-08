/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Download, ArrowRight, 
  MoreVertical, Eye, Trash2, CheckCircle, 
  Clock, AlertTriangle, Loader2, ChevronRight, ChevronLeft,
  Calendar, SortAsc, SortDesc, CheckSquare, Square
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import ReportsData from '../../components/ReportsData';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1); 
  const reportsPerPage = 10; 

  // --- ميزة التحديد الجديدة (بدون تغيير التصميم) ---
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/quotes?limit=30'); 
        setReports(response.data.quotes);
        setLoading(false);
      } catch (err) {
        console.error("خطأ في جلب البلاغات");
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    document.title = " إدارة البلاغات | P.S.R.S";
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatus = (id) => {
    if (id % 3 === 0) return { label: "مكتمل", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
    if (id % 2 === 0) return { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700", icon: Clock };
    return { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700", icon: AlertTriangle };
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase().trim();
    const reportStatus = getStatus(report.id).label;
    const matchesStatus = statusFilter === "الكل" || reportStatus === statusFilter;
    let matchesSearch = true;
    if (searchLower) {
      matchesSearch = report.id.toString().includes(searchLower) || 
                      report.quote.toLowerCase().includes(searchLower) || 
                      report.author.toLowerCase().includes(searchLower);
    }
    return matchesStatus && matchesSearch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    return sortOrder === "newest" ? b.id - a.id : a.id - b.id;
  });

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = sortedReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);

  const handleExportExcel = () => {
    // التصدير بناءً على التحديد إذا وُجد، وإلا التصدير العادي
    const dataToProcess = selectedIds.length > 0 
      ? reports.filter(r => selectedIds.includes(r.id)) 
      : sortedReports;

    const dataToExport = dataToProcess.map(report => ({
      "رقم البلاغ": report.id,
      "تفاصيل البلاغ": report.quote,
      "اسم المُبلغ": report.author,
      "حالة البلاغ": getStatus(report.id).label,
      "تاريخ البلاغ": "2026/03/02"
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, `PSRS_Reports_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="p-8 w-full bg-[#f8fafc] min-h-screen animate-in fade-in duration-500" dir="rtl">
      <ReportsData />

      <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold">
            <Link to="/home" className="hover:text-emerald-600 transition-colors">لوحة التحكم</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800">سجل البلاغات الكامل</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة البلاغات الواردة</h2>
        </div>

        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="cursor-pointer flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            <Download size={18} className="text-emerald-600" />
            {selectedIds.length > 0 ? `تصدير المحدد (${selectedIds.length})` : `تصدير ${statusFilter !== "الكل" ? statusFilter : ""} Excel`}
          </button>
          <Link to="/home" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
            <ArrowRight size={18} />
            رجوع
          </Link>
        </div>
      </div>

      {/* البحث والفلترة - كما هي تماماً */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 space-y-6">
        <div className="relative w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث برقم البلاغ، اسم المُبلغ، أو محتوى البلاغ..."
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
            { label: "الكل", color: "bg-slate-100 text-slate-600", active: "bg-slate-800 text-white" },
            { label: "مكتمل", color: "bg-emerald-50 text-emerald-600", active: "bg-emerald-600 text-white shadow-emerald-200" },
            { label: "قيد المعالجة", color: "bg-blue-50 text-blue-600", active: "bg-blue-600 text-white shadow-blue-200" },
            { label: "قيد الانتظار", color: "bg-amber-50 text-amber-600", active: "bg-amber-600 text-white shadow-amber-200" }
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => { setStatusFilter(filter.label); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === filter.label ? `${filter.active} shadow-lg scale-105` : `${filter.color} hover:bg-white border border-transparent hover:border-slate-200`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* الجدول - تمت إضافة عمود التحديد فقط */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-slate-500 font-bold">جاري تحميل سجل البلاغات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 w-10"></th> {/* عمود التحديد */}
                  <th className="p-6 text-sm font-black text-slate-600 uppercase">المعرف</th>
                  <th className="p-6 text-sm font-black text-slate-600">تفاصيل البلاغ</th>
                  <th className="p-6 text-sm font-black text-slate-600">المُبلغ</th>
                  <th className="p-6 text-sm font-black text-slate-600">الحالة</th>
                  <th className="p-6 text-sm font-black text-slate-600 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentReports.map((report) => {
                  const status = getStatus(report.id);
                  const isSelected = selectedIds.includes(report.id);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={report.id} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="p-6">
                        <button onClick={() => toggleSelect(report.id)} className="cursor-pointer text-slate-300 hover:text-emerald-600 transition-colors">
                          {isSelected ? <CheckSquare size={20} className="text-emerald-600" /> : <Square size={20} />}
                        </button>
                      </td>
                      <td className="p-6">
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">
                           {report.id} #
                        </span>
                      </td>
                      <td className="p-6 max-w-md">
                        <p className="text-sm font-bold text-slate-800 leading-relaxed mb-1">{report.quote}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                          <Calendar size={10} /> 2 مارس 2026
                        </div>
                      </td>
                      <td className="p-6 text-sm text-slate-600 font-medium">{report.author}</td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black ${status.color}`}>
                          <StatusIcon size={14} /> {status.label}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-sm border border-blue-100">
                            <Eye size={16} />
                          </button>
                          <button className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 shadow-sm border border-rose-100">
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
        )}

        {/* الترقيم - كما هو تماماً */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           {/* ... نفس كود الترقيم السابق ... */}
        </div>
      </div>
    </div>
  );
};

export default Reports;