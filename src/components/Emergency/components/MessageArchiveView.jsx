/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, User, UserCheck, Clock, MapPin, Search, Eye, 
  ChevronRight, ChevronLeft, Filter, Download, 
  ArrowUpDown, Mail, Smartphone, AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

const MessageArchiveView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  const recordsPerPage = 10;

  // بيانات أرشيف الرسائل - محاكاة للواقع الفلسطيني
  const [messageLogs] = useState([
    { id: 1, sender: "أبو إياد", receiver: "المناوب رامي", content: "يوجد تسريب غاز كبير في بناية قبالة مستشفى رفيديا", source: "App", time: "11:20", date: "2024-05-26", location: "نابلس - رفيديا",  },
    { id: 2, sender: "0598123456", receiver: "المستجيبة لينا", content: "طلب مساعدة لطوارئ كبار السن، حي الشجاعية", source: "SMS", time: "09:45", date: "2024-05-26", location: "غزة - الشجاعية",  },
    { id: 3, sender: "باسم حمدان", receiver: "المشرف كمال", content: "إغلاق طريق رئيسي بسبب سقوط شجرة ضخمة", source: "App", time: "08:10", date: "2024-05-26", location: "طولكرم - شارع باريس", },
    { id: 4, sender: "0569111222", receiver: "المناوب رامي", content: "مشاجرة جماعية في وسط المدينة، نرجو التدخل", source: "SMS", time: "22:15", date: "2024-05-25", location: "قلقيلية - السوق القديم", },
    { id: 5, sender: "منى المصري", receiver: "المستجيبة لينا", content: "حالة تسمم غذائي لثلاثة أطفال في المنزل", source: "App", time: "19:30", date: "2024-05-25", location: "أريحا - وسط المدينة", },
    { id: 6, sender: "خالد صوافطة", receiver: "المشرف كمال", content: "انهيار جزئي في سور استنادي بسبب الأمطار", source: "App", time: "15:00", date: "2024-05-25", location: "طوباس - حي الثغرة", },
  ]);

  // منطق البحث والترتيب
  const filteredAndSortedMessages = useMemo(() => {
    let result = messageLogs.filter(msg => 
      msg.sender.includes(searchTerm) || 
      msg.content.includes(searchTerm) || 
      msg.location.includes(searchTerm)
    );

    return result.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
      return sortOrder === 'desc' ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
    });
  }, [searchTerm, messageLogs, sortOrder]);

  const currentRecords = filteredAndSortedMessages.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const totalPages = Math.ceil(filteredAndSortedMessages.length / recordsPerPage);

  // تصدير البيانات
  const handleExport = () => {
    const dataToExport = filteredAndSortedMessages.map(msg => ({
      'المرسل': msg.sender,
      'المستقبل': msg.receiver,
      'نص الرسالة': msg.content,
      'المصدر': msg.source,
      'التوقيت': `${msg.date} ${msg.time}`,
      'الموقع': msg.location,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Messages_Archive");
    XLSX.writeFile(wb, `Message_Archive_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-300" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .truncate-text { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <EmergencyHeader pageTitle="أرشيف الرسائل والبلاغات الرقمية" />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-[1600px] p-3 mx-auto">
            
            {/* الهيدر الوظيفي */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-500">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">أرشيف الرسائل  </h1>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold tracking-[0.2em]">PALESTINE DIGITAL DISPATCH RECORDS</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث في محتوى الرسائل..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#080808] border border-slate-800 rounded-lg py-2 pr-10 pl-4 w-full lg:w-80 focus:border-indigo-500 outline-none text-xs transition-all"
                  />
                </div>
                <button onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">
                  <ArrowUpDown size={14} /> {sortOrder === 'desc' ? 'الأحدث' : 'الأقدم'}
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20">
                  <Download size={14} /> تصدير السجلات
                </button>
              </div>
            </div>

            {/* الجدول */}
            <div className="bg-[#050505] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-right text-[13px]">
                <thead>
                  <tr className="bg-[#0c0c0c] border-b border-slate-800 text-slate-500 font-bold uppercase tracking-tighter">
                    <th className="p-4">المرسل / المصدر</th>
                    <th className="p-4 w-1/3">ملخص محتوى البلاغ</th>
                    <th className="p-4">المستجيب</th>
                    <th className="p-4">التوقيت</th>
                    <th className="p-4">الموقع الجغرافي</th>
                    <th className="p-4 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {currentRecords.map((msg) => (
                    <tr key={msg.id} className="hover:bg-indigo-500/5 transition-colors even:bg-[#080808]/40">
                      <td className="p-4 font-bold text-slate-200">
                        <div className="flex flex-col gap-1">
                          <span>{msg.sender}</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            {msg.source === 'App' ? <Smartphone size={10} /> : <Mail size={10} />}
                            {msg.source}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex flex-col gap-1">
                          <p className="truncate-text leading-relaxed text-[12px]">{msg.content}</p>
                      
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2"><UserCheck size={14} className="text-slate-600" /> {msg.receiver}</div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-bold text-[13px]">{msg.time}</span>
                          <span className="text-[12px] text-slate-600">{msg.date}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-indigo-500/60" />
                          <span className="text-[15px]">{msg.location}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-indigo-500 hover:text-white hover:bg-indigo-600 p-2 rounded-md transition-all">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* الباجينيشن */}
              <div className="p-4 bg-[#080808] border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold uppercase tracking-widest">إجمالي الرسائل: {filteredAndSortedMessages.length}</span>
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded border transition-all ${currentPage === i + 1 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <div className="flex gap-1 mr-2">
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

export default MessageArchiveView;