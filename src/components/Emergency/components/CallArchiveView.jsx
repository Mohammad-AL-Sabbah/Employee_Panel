/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Phone, User, UserCheck, Clock, MapPin, Search, Eye, 
  ChevronRight, ChevronLeft, Filter, Download, 
  AlertCircle, Flame, Activity, ShieldAlert, Car, ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx'; // تأكد من تثبيت المكتبة عبر npm install xlsx

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

const CallArchiveView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' للأحدث، 'asc' للأقدم
  const recordsPerPage = 10;

  const [callLogs] = useState([
    { id: 1, caller: "محمد السعدي", receiver: "المستجيب أحمد", type: "حادث سير", icon: "Car", time: "10:30", date: "2024-05-25", location: "نابلس - دوار الشهداء", severity: "High" },
    { id: 2, caller: "سميرة القواسمي", receiver: "المناوب سيف", type: "وعكة صحية", icon: "Activity", time: "09:15", date: "2024-05-25", location: "الخليل - عين سارة", severity: "Medium" },
    { id: 3, caller: "نوح السامر", receiver: "المشرف خالد", type: "حريق", icon: "Flame", time: "08:45", date: "2024-05-25", location: "رام الله - الماصيون", severity: "Critical" },
    { id: 4, caller: "علاء جبارين", receiver: "المستجيبة مريم", type: "اشتباه أمني", icon: "ShieldAlert", time: "23:00", date: "2024-05-24", location: "القدس - باب العامود", severity: "Low" },
    { id: 5, caller: "إياد البرغوثي", receiver: "المستجيب أحمد", type: "إصابة عمل", icon: "AlertCircle", time: "14:20", date: "2024-05-24", location: "جنين - المنطقة الصناعية", severity: "High" },
    { id: 6, caller: "هاني المصري", receiver: "المناوب سيف", type: "حالة ولادة", icon: "Activity", time: "03:10", date: "2024-05-24", location: "غزة - الرمال", severity: "Medium" },
  ]);

  // --- منطق البحث والترتيب المشترك ---
  const filteredAndSortedLogs = useMemo(() => {
    let result = callLogs.filter(log => 
      log.caller.includes(searchTerm) || 
      log.type.includes(searchTerm) || 
      log.location.includes(searchTerm)
    );

    // الترتيب بناءً على التاريخ والوقت
    return result.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'desc' ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
    });
  }, [searchTerm, callLogs, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / recordsPerPage);
  const currentRecords = filteredAndSortedLogs.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // --- وظيفة التصدير إلى Excel ---
  const handleExport = () => {
    const dataToExport = filteredAndSortedLogs.map(log => ({
      'المتصل': log.caller,
      'المستجيب': log.receiver,
      'نوع الحالة': log.type,
      'التاريخ': log.date,
      'الوقت': log.time,
      'الموقع': log.location,
      'درجة الخطورة': log.severity
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Archive");
    XLSX.writeFile(wb, `Emergency_Calls_Archive_${new Date().toLocaleDateString()}.xlsx`);
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  // مساعد لاختيار الأيقونة
  const getIcon = (type) => {
    switch(type) {
      case "Car": return <Car size={14}/>;
      case "Activity": return <Activity size={14}/>;
      case "Flame": return <Flame size={14}/>;
      case "ShieldAlert": return <ShieldAlert size={14}/>;
      default: return <AlertCircle size={14}/>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-300" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .row-hover:hover { background-color: rgba(30, 41, 59, 0.3) !important; }
      `}</style>

      <EmergencyHeader pageTitle="أرشيف بلاغات فلسطين" />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-[1600px] p-3 mx-auto">
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-500">
                  <Phone size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">سجل المكالمات الواردة</h1>
                  <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em]">PALESTINE EMERGENCY DATABASE</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث سريع..." 
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="bg-[#080808] border border-slate-800 rounded-lg py-2 pr-10 pl-4 w-full lg:w-80 focus:border-blue-500 outline-none text-xs transition-all"
                  />
                </div>
                <button 
                  onClick={toggleSort}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold transition-all ${sortOrder === 'desc' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-blue-600/10 border-blue-500 text-blue-500'}`}
                >
                  <ArrowUpDown size={14} /> 
                  {sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Download size={14} /> تصدير Excel
                </button>
              </div>
            </div>

            <div className="bg-[#050505] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-right text-[13px]">
                <thead>
                  <tr className="bg-[#0c0c0c] border-b border-slate-800 text-slate-500 font-bold">
                    <th className="p-4">اسم المتصل </th>
                    <th className="p-4">المستجيب</th>
                    <th className="p-4">نوع الحالة</th>
                    <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={toggleSort}>
                      التوقيت <ArrowUpDown size={12} className="inline mr-1 opacity-50" />
                    </th>
                    <th className="p-4">الموقع الجغرافي</th>
                    <th className="p-4 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {currentRecords.map((log) => (
                    <tr key={log.id} className="row-hover transition-colors even:bg-[#080808]/40">
                      <td className="p-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full 'bg-blue-500/40'}`}></div>
                          {log.caller}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2"><UserCheck size={14} className="text-slate-600" /> {log.receiver}</div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-md w-fit border
                          ${log.severity === 'Critical' ? 'bg-red-500/5 text-red-400 border-red-500/20' : 
                            log.severity === 'High' ? 'bg-orange-500/5 text-orange-400 border-orange-500/20' : 
                            'bg-blue-500/5 text-blue-400 border-blue-500/20'}`}>
                          {getIcon(log.icon)}
                          <span className="font-bold text-[11px]">{log.type}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex flex-col leading-tight">
                          <span className="text-slate-300 font-bold">{log.time}</span>
                          <span className="text-[10px] text-slate-600">{log.date}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-red-500/60" /> {log.location}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-blue-500 hover:text-white hover:bg-blue-600 p-2 rounded-md transition-all">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-[#080808] border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold">إجمالي السجلات المفلترة: {filteredAndSortedLogs.length}</span>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-7 h-7 rounded border transition-all ${currentPage === i + 1 ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white"><ChevronRight size={16}/></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white"><ChevronLeft size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CallArchiveView;