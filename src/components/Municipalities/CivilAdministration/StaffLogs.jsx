/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, 
  Clock, Calendar, Database, RotateCcw, ChevronDown
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken'; 

const StaffLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]); // ستحتوي الآن على المعرفات الفريدة الخاصة بالـ frontend
  const [loading, setLoading] = useState(false);

  // --- حالات الـ Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const apiActionMap = {
    all: "all",
    security: "Add Staff",
    update: "Status Toggle",
    delete: "Permanent Delete"
  };

  // --- 1. جلب البيانات الحية بالتزامن مع الفلاتر ---
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        
        if (searchTerm.trim() !== "") {
          queryParams.search = searchTerm;
        }
        
        if (filterType !== "all" && apiActionMap[filterType] !== "all") {
          queryParams.actionType = apiActionMap[filterType];
        }

        const response = await ApiAuthToken.get('/Admin/audit-logs', {
          params: queryParams
        });
        
        // حل المشكلة: توليد معرف فريد لكل سطر في الواجهة الأمامية منعاً لتكرار الـ id القادم من السيرفر
        const logsWithUniqueKeys = response.data.map((log, index) => ({
          ...log,
          frontendInternalId: log.id && !response.data.some((l, i) => l.id === log.id && i !== index)
            ? String(log.id)
            : `${log.id || 'log'}-${index}-${log.createdAt || Date.now()}`
        }));

        setLogs(logsWithUniqueKeys);
        setCurrentPage(1); // تصفير الصفحة عند تغيير الفلترة أو البحث
      } catch (error) {
        console.error("خطأ أثناء جلب سجلات الرقابة الحية:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchLogs();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType]);

  // --- 2. حسابات الـ Pagination المحلية ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // --- 3. تفكيك منسق وصحيح للوقت والتاريخ ---
  const formatDateTime = (isoString) => {
    if (!isoString) return { date: "---", time: "---" };
    const dateObj = new Date(isoString);
    
    const date = dateObj.getFullYear() + '/' + 
                 String(dateObj.getMonth() + 1).padStart(2, '0') + '/' + 
                 String(dateObj.getDate()).padStart(2, '0');
                 
    const time = String(dateObj.getHours()).padStart(2, '0') + ':' + 
                 String(dateObj.getMinutes()).padStart(2, '0') + ':' + 
                 String(dateObj.getSeconds()).padStart(2, '0');

    return { date, time };
  };

  // --- 4. تلوين ديناميكي للبادجات ---
  const getBadgeStyle = (action) => {
    const act = action?.toLowerCase() || '';
    if (act.includes('delete') || act.includes('remove') || act.includes('حذف')) 
      return "text-red-600 bg-red-50 border-red-100";
    if (act.includes('status') || act.includes('toggle') || act.includes('update') || act.includes('تعديل')) 
      return "text-amber-600 bg-amber-50 border-amber-100";
    if (act.includes('add') || act.includes('create') || act.includes('إضافة')) 
      return "text-blue-600 bg-blue-50 border-blue-100";
    
    return "text-slate-600 bg-slate-50 border-slate-100";
  };

  // --- 5. منطق تصدير تقارير إكسل ---
  const getExportData = () => {
    const data = selectedIds.length > 0 
      ? logs.filter(log => selectedIds.includes(log.frontendInternalId))
      : logs;

    return data.map(log => {
      const { date, time } = formatDateTime(log.createdAt);
      return {
        "رقم السجل الرقمي": log.id,
        "المستخدم المسؤول": log.responsibleUser,
        "الإجراء المنفذ": log.action,
        "الجهة المتأثرة": log.affectedEntity,
        "التاريخ": date,
        "الوقت": time,
        "تفاصيل العملية الكاملة": log.details
      };
    });
  };

  const handleExport = () => {
    const data = getExportData();
    if (data.length === 0) return alert("لا توجد بيانات لتصديرها حالياً");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "سجل الرقابة الفعلي");
    
    const fileName = selectedIds.length > 0 
      ? `Selected_Logs_${selectedIds.length}`
      : `PSRS_Logs_${filterType}`;
      
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const getButtonText = () => {
    if (selectedIds.length > 0) return `استخراج التقارير المحددة (${selectedIds.length})`;
    const typeNames = {
      all: "جميع السجلات",
      security: "سجلات الأمان",
      update: "سجلات التحديث",
      delete: "سجلات الحذف"
    };
    return `استخراج ${typeNames[filterType]}`;
  };

  // تعديل منطق اختيار السطر الفردي بناءً على المعرف الفريد الجديد
  const handleSelectRow = (frontendInternalId) => {
    setSelectedIds(prev => 
      prev.includes(frontendInternalId) 
        ? prev.filter(rowId => rowId !== frontendInternalId) 
        : [...prev, frontendInternalId]
    );
  };

  // تعديل منطق اختيار الكل ليتعامل مع أسطر الصفحة الحالية الفريدة دون التأثير على الاختيارات القديمة
  const handleSelectAll = (e) => {
    const currentRowsIds = currentLogs.map(log => log.frontendInternalId);
    if (e.target.checked) {
      setSelectedIds(prev => {
        const uniqueIds = new Set([...prev, ...currentRowsIds]);
        return Array.from(uniqueIds);
      });
    } else {
      setSelectedIds(prev => prev.filter(id => !currentRowsIds.includes(id)));
    }
  };

  // فحص ما إذا كانت كافة عناصر الصفحة الحالية محددة فعلاً
  const isAllCurrentPageSelected = currentLogs.length > 0 && currentLogs.every(log => selectedIds.includes(log.frontendInternalId));

  return (
    <div className="p-6 w-full max-w-[1500px] mx-auto text-slate-700 font-sans" dir="rtl">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-800 text-slate-100 rounded-xl shadow-md"><Database size={22} /></div>
             <div>
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">سجل الرقابة</h2>
               <p className="text-[10px] font-semibold text-slate-400 tracking-wider">نظام P.S.R.S - وحدة الرقابة الخاصة بالموظفين</p>
             </div>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 cursor-pointer active:scale-95 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Download size={16} />
            <span>{getButtonText()}</span>
          </button>
      </div>

      {/* البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث في اسم الموظف، الإجراء، أو الجهة المتأثرة..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIds([]); // تفريغ التحديد عند بدء بحث جديد لمنع تداخل أسطر النتائج القديمة
            }}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-xs font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all shadow-sm text-slate-800"
          />
        </div>
        <div className="relative min-w-[240px]">
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select 
            value={filterType}
            onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedIds([]); 
            }}
            className="w-full appearance-none bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-semibold outline-none cursor-pointer focus:border-slate-400 shadow-sm text-slate-700"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="security">أمن وصلاحيات (Add Staff)</option>
            <option value="update">تحديث بيانات (Status Toggle)</option>
            <option value="delete">حذف سجلات (Permanent Delete)</option>
          </select>
          <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <th className="p-4 w-14 text-center">
                  <input 
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={isAllCurrentPageSelected}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 cursor-pointer accent-emerald-600"
                  />
                </th>
                <th className="p-4 text-xs font-bold tracking-wide">المستخدم المسؤول</th>
                <th className="p-4 text-xs font-bold text-center tracking-wide">الإجراء المنفذ</th>
                <th className="p-4 text-xs font-bold text-center tracking-wide">الجهة المتأثرة</th>
                <th className="p-4 text-xs font-bold text-center tracking-wide">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!loading && currentLogs.length > 0 ? (
                currentLogs.map((log) => {
                  const { date, time } = formatDateTime(log.createdAt);
                  const isRowSelected = selectedIds.includes(log.frontendInternalId);
                  
                  return (
                    <tr key={log.frontendInternalId} className={`hover:bg-slate-50/50 transition-colors ${isRowSelected ? 'bg-slate-50' : ''}`}>
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleSelectRow(log.frontendInternalId)}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 cursor-pointer accent-emerald-600"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{log.responsibleUser || "مستخدم غير معروف"}</span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {log.role || "مسؤول بلدية"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold inline-block min-w-[110px] ${getBadgeStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <code className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
                          {log.affectedEntity || "---"}
                        </code>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex flex-col items-start gap-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Calendar size={11} /> <span className="text-[10px] font-medium">{date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock size={11} /> <span className="text-[10px] font-bold font-mono">{time}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <RotateCcw className={`text-slate-300 ${loading ? 'animate-spin' : ''}`} size={36} />
                      <p className="text-slate-400 text-xs font-medium italic">
                        {loading ? "جاري مزامنة السجلات الحية من قاعدة البيانات..." : "لا توجد سجلات تطابق البحث حالياً"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* التذييل الإحصائي والـ Pagination */}
        <div className="bg-slate-50 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-slate-400">
              إجمالي السجلات المسترجعة: <b className="text-slate-700">{logs.length}</b> سجل
            </span>
            {selectedIds.length > 0 && (
              <span className="bg-slate-800 text-slate-100 px-3 py-1 rounded-full text-[10px] font-medium">
                تم تحديد {selectedIds.length} عنصر جاهز للتصدير
              </span>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16}/>
              </button>
              
              <div className="flex items-center gap-1 px-2">
                <span className="font-bold text-slate-700">{currentPage}</span>
                <span className="text-slate-400">من</span>
                <span className="font-medium text-slate-500">{totalPages}</span>
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16}/>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffLogs;