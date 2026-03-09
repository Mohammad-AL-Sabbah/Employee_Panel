/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx'; // استيراد مكتبة الإكسل
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, 
  ExternalLink, Clock, Calendar, Database, RotateCcw, ChevronDown, CheckCircle2
} from 'lucide-react';

const StaffLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]); // لتخزين المعرفات المختارة

  const initialLogs = [
    { id: "10221", user: "محمد صباح", role: "Super Admin", action: "تعديل صلاحية", target: "مدير 2", time: "10:45:01", date: "2026/03/09", type: "security" },
    { id: "10222", user: "أحمد علي", role: "موظف", action: "تحديث بلاغ", target: "#4421", time: "09:30:22", date: "2026/03/09", type: "update" },
    { id: "10223", user: "سارة خالد", role: "Admin", action: "حذف مستخدم", target: "U_88", time: "08:15:10", date: "2026/03/08", type: "delete" },
    { id: "10224", user: "ياسين علي", role: "Super Admin", action: "تعديل إعدادات", target: "النظام العام", time: "07:20:44", date: "2026/03/08", type: "security" },
    { id: "10225", user: "ليلى محمود", role: "موظف", action: "تحديث بلاغ", target: "#5512", time: "06:10:05", date: "2026/03/07", type: "update" },
  ];

  // منطق الفلترة والبحث
  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      const matchesSearch = log.user.includes(searchTerm) || log.action.includes(searchTerm) || log.target.includes(searchTerm);
      const matchesFilter = filterType === "all" || log.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  // دالة التصدير إلى إكسل
  const exportToExcel = (dataToExport, fileName) => {
    if (dataToExport.length === 0) return alert("لا توجد بيانات لتصديرها");
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
    XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
  };

  // معالجة اختيار الكل
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredLogs.map(log => log.id));
    } else {
      setSelectedIds([]);
    }
  };

  // معالجة اختيار سطر واحد
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
    <div className="p-6 w-full max-w-[1500px] mx-auto animate-in fade-in duration-300" dir="rtl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-white"><Database size={20} /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">سجل الرقابة العملياتي</h2>
            <p className="text-[11px] text-slate-400 font-medium">تم اختيار {selectedIds.length} سجلات</p>
          </div>
        </div>
        
        {/* قائمة التصدير المنسدلة */}
        <div className="relative group">
          <button style={{cursor:"pointer"}}  className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
            <Download size={14} /> تصدير إكسل <ChevronDown size={14} />
          </button>
          <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
            <button onClick={() => exportToExcel(initialLogs, 'All_Logs')} style={{cursor:"pointer"}} className="w-full text-right px-4 py-2.5 text-[11px] hover:bg-slate-50 text-slate-600 font-bold border-b border-slate-50">تصدير كل التقارير</button>
            <button onClick={() => exportToExcel(filteredLogs, 'Filtered_Logs')} style={{cursor:"pointer"}}  className="w-full text-right px-4 py-2.5 text-[11px] hover:bg-slate-50 text-slate-600 font-bold border-b border-slate-50">تصدير النوع المختار</button>
            <button 
              onClick={() => exportToExcel(initialLogs.filter(l => selectedIds.includes(l.id)), 'Selected_Logs')} 
              disabled={selectedIds.length === 0} style={{cursor:"pointer"}} 
              className="w-full text-right px-4 py-2.5 text-[11px] hover:bg-emerald-50 text-emerald-700 font-bold disabled:opacity-50"
            >
              تصدير السجلات المحددة ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* الأدوات */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="بحث سريع..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        
        {/* زر التصنيفات المحسّن */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" size={14} />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-emerald-50/50 border border-emerald-100 text-emerald-700 rounded-xl px-9 py-2.5 text-[11px] font-black outline-none cursor-pointer appearance-none hover:bg-emerald-50 transition-all shadow-sm shadow-emerald-50/50"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="security">إجراءات أمنية</option>
            <option value="update">تحديثات البيانات</option>
            <option value="delete">عمليات الحذف</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" size={14} />
        </div>

        <button onClick={() => {setSearchTerm(""); setFilterType("all"); setSelectedIds([])}} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><RotateCcw size={18} /></button>
      </div>

      {/* الجدول */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
            
              <th className="p-4 text-[11px] font-black text-slate-500 uppercase">المستخدم</th>
              <th className="p-4 text-[11px] font-black text-slate-500 text-center">الإجراء</th>
              <th className="p-4 text-[11px] font-black text-slate-500">الهدف</th>
              <th className="p-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">التاريخ والوقت</th>
              <th className="p-4 text-[11px] font-black text-slate-500 text-left">الخيار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className={`hover:bg-slate-50/80 transition-colors group ${selectedIds.includes(log.id) ? 'bg-emerald-50/30' : ''}`}>
                <td className="p-4">
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={() => handleSelectRow(log.id)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{log.user}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{log.role}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black inline-block min-w-[100px] ${typeStyles[log.type] || typeStyles.default}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-xs font-bold text-slate-600 italic tracking-tight">{log.target}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={12} /> <span className="text-[10px] font-bold">{log.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-mono">
                      <Clock size={12} /> <span className="text-[11px] font-bold">{log.time}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-left">
                  <button className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-all">
                    <span>عرض</span> <ExternalLink size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* الترقيم */}
        <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-200">
          <span className="text-[10px] font-black text-slate-400">
            تم اختيار {selectedIds.length} من أصل {filteredLogs.length} سجل معروض
          </span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-all cursor-not-allowed"><ChevronRight size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-600 text-white text-[10px] font-bold shadow-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 transition-all cursor-not-allowed"><ChevronLeft size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogs;