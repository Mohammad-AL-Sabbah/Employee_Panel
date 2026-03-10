/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, 
  ExternalLink, Clock, Calendar, Database, RotateCcw, ChevronDown
} from 'lucide-react';

const StaffLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);

  const initialLogs = [
    { id: "10221", user: "محمد صباح", role: "Super Admin", action: "تعديل صلاحية", target: "مدير 2", time: "10:45:01", date: "2026/03/09", type: "security" },
    { id: "10222", user: "أحمد علي", role: "موظف", action: "تحديث بلاغ", target: "#4421", time: "09:30:22", date: "2026/03/09", type: "update" },
    { id: "10223", user: "سارة خالد", role: "Admin", action: "حذف مستخدم", target: "U_88", time: "08:15:10", date: "2026/03/08", type: "delete" },
    { id: "10224", user: "ياسين علي", role: "Super Admin", action: "تعديل إعدادات", target: "النظام العام", time: "07:20:44", date: "2026/03/08", type: "security" },
    { id: "10225", user: "ليلى محمود", role: "موظف", action: "تحديث بلاغ", target: "#5512", time: "06:10:05", date: "2026/03/07", type: "update" },
  ];

  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.action.includes(searchTerm) || 
        log.target.includes(searchTerm);
      const matchesFilter = filterType === "all" || log.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  // --- منطق زر الإكسل الذكي ---
  const getExportData = () => {
    // إذا كان هناك مربعات محددة، نصدر المحدد فقط، وإلا نصدر المفلتر كاملاً
    const data = selectedIds.length > 0 
      ? initialLogs.filter(log => selectedIds.includes(log.id))
      : filteredLogs;

    return data.map(log => ({
      "رقم السجل": log.id,
      "المستخدم": log.user,
      "الرتبة": log.role,
      "الإجراء": log.action,
      "الهدف": log.target,
      "التاريخ": log.date,
      "الوقت": log.time,
      "النوع": log.type
    }));
  };

  const handleExport = () => {
    const data = getExportData();
    if (data.length === 0) return alert("لا توجد بيانات لتصديرها");

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    
    const fileName = selectedIds.length > 0 
      ? `Selected_Logs_${selectedIds.length}`
      : `PSRS_Logs_${filterType}`;
      
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // نص الزر المتغير
  const getButtonText = () => {
    if (selectedIds.length > 0) return `استخراج (${selectedIds.length})  `;
    
    const typeNames = {
      all: "جميع السجلات",
      security: "سجلات الأمان",
      update: "سجلات التحديث",
      delete: "سجلات الحذف"
    };
    return `استخراج ${typeNames[filterType]}`;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredLogs.map(log => log.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const typeStyles = {
    security: "text-rose-600 bg-rose-50 border-rose-100",
    update: "text-amber-600 bg-amber-50 border-amber-100",
    delete: "text-red-700 bg-red-50 border-red-200",
    default: "text-emerald-600 bg-emerald-50 border-emerald-100"
  };

  return (
    <div className="p-6 w-full max-w-[1500px] mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-lg shadow-slate-200"><Database size={24} /></div>
             <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight">سجل الرقابة</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">نظام P.S.R.S - وحدة الرقابة الخاصة بالموظفين</p>
             </div>
          </div>

          <button 
            onClick={handleExport}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-lg cursor-pointer active:scale-95 ${
              selectedIds.length > 0 
              ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700" 
              : "bg-emerald-600 text-white shadow-slate-200 hover:bg-slate-800"
            }`}
          >
            <Download size={18} />
            <span>{getButtonText()}</span>
          </button>
      </div>

      {/* البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="بحث في اسم الموظف، الإجراء، أو الهدف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select 
            value={filterType}
            onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedIds([]); // تصفير التحديد عند تغيير النوع لضمان الدقة
            }}
            className="w-full appearance-none bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-4 text-xs font-bold outline-none cursor-pointer focus:border-emerald-500 shadow-sm"
          >
            <option value="all">جميع أنواع العمليات</option>
            <option value="security">أمن وصلاحيات</option>
            <option value="update">تحديث بيانات</option>
            <option value="delete">حذف سجلات</option>
          </select>
          <ChevronDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 w-14 text-center">
                
              </th>
              <th className="p-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">المستخدم المسؤول</th>
              <th className="p-6 text-[11px] font-black text-slate-500 text-center tracking-widest">الإجراء المنفذ</th>
              <th className="p-6 text-[11px] font-black text-slate-500 text-center tracking-widest">الجهة المتأثرة</th>
              <th className="p-6 text-[11px] font-black text-slate-500 text-center tracking-widest">التاريخ والوقت</th>
              <th className="p-6 text-[11px] font-black text-slate-500 text-left tracking-widest">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-50/80 transition-all ${selectedIds.includes(log.id) ? 'bg-emerald-50/50' : ''}`}>
                  <td className="p-6 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(log.id)}
                      onChange={() => handleSelectRow(log.id)}
                      className="w-5 h-5 rounded-lg border-slate-300 text-emerald-600 cursor-pointer accent-emerald-600"
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{log.user}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{log.role}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-2 rounded-xl border text-[10px] font-black inline-block min-w-[120px] shadow-sm ${typeStyles[log.type] || typeStyles.default}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <code className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">{log.target}</code>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={12} /> <span className="text-[10px] font-black">{log.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <Clock size={12} /> <span className="text-[11px] font-black font-mono">{log.time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-left">
                    <button className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                      <span>فتح</span> <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RotateCcw className="text-slate-200 animate-spin" size={48} />
                    <p className="text-slate-400 font-bold italic">لا توجد سجلات تطابق البحث حالياً</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* التذييل */}
        <div className="bg-slate-50/50 p-6 flex justify-between items-center border-t border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-black text-slate-400 uppercase">
              عرض {filteredLogs.length} سجل من {initialLogs.length}
            </span>
            {selectedIds.length > 0 && (
              <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black animate-pulse">
                تم تحديد {selectedIds.length} عنصر
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer"><ChevronRight size={20}/></button>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 text-white text-xs font-black shadow-lg">1</button>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer"><ChevronLeft size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogs;