/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Heart, Activity, AlertTriangle, Search,
  User, Pill, Eye, UserSearch, ChevronLeft, ChevronRight
} from 'lucide-react';

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

const MedicalHistoryView = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const allUsers = [
    { id: "#PX-9920", name: "أحمد محمد كمال", age: 34, blood: "O+", lastUpdate: "2024-05-20" },
    { id: "#PX-8812", name: "سارة محمود علي", age: 28, blood: "A-", lastUpdate: "2024-05-21" },
    { id: "#PX-7754", name: "ياسين جلال عمر", age: 45, blood: "B+", lastUpdate: "2024-05-19" },
    { id: "#PX-6621", name: "ليلى حسن يوسف", age: 31, blood: "AB+", lastUpdate: "2024-05-18" },
    { id: "#PX-5544", name: "عمر خالد وريد", age: 22, blood: "O-", lastUpdate: "2024-05-22" },
    { id: "#PX-4433", name: "مريم إبراهيم", age: 39, blood: "A+", lastUpdate: "2024-05-23" },
    { id: "#PX-3322", name: "خالد منصور", age: 50, blood: "B-", lastUpdate: "2024-05-24" },
  ];

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => 
      user.name.includes(searchTerm) || user.id.includes(searchTerm)
    );
  }, [searchTerm, allUsers]);

  // --- حسابات الباجينيشن (تأكد من وجود هذه السطور دائماً) ---
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage) || 1;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  // -------------------------------------------------------

  const handleOpenPatient = (user) => {
    setSelectedPatient({
      ...user,
      bloodType: user.blood,
      allergies: ["البنسلين", "المكسرات"],
      chronicDiseases: ["السكري - النوع الثاني", "ارتفاع ضغط الدم"],
      recentMedications: ["Lisinopril", "Metformin"],
      lastUpdate: user.lastUpdate + " | 14:30"
    });
    setViewMode('details');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <div className="h-16 w-full flex-shrink-0 z-[60]">
        <EmergencyHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          {viewMode === 'list' ? (
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <UserSearch className="text-blue-500" size={32} />
                     السجلات الطبية العامة
                  </h1>
                </div>
                
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    placeholder="بحث باسم المريض أو الكود..." 
                    className="bg-[#0a0a0a] border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 w-80 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Table Container */}
              <div className="bg-[#050505] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                      <th className="p-5">المريض</th>
                      <th className="p-5 text-center">العمر</th>
                      <th className="p-5 text-center">الفصيلة</th>
                      <th className="p-5 text-center">تاريخ التحديث</th>
                      <th className="p-5 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {currentRecords.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-600/5 transition-colors group">
                        <td className="p-5">
                          <div className="font-bold text-slate-200">{user.name}</div>
                          <div className="text-[10px] text-slate-600 font-mono tracking-tighter">{user.id}</div>
                        </td>
                        <td className="p-5 text-center font-bold text-blue-400/80">{user.age} عاماً</td>
                        <td className="p-5 text-center">
                          <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded border border-red-500/20 font-black text-xs">{user.blood}</span>
                        </td>
                        <td className="p-5 text-center text-slate-400 text-[13px] font-mono">{user.lastUpdate}</td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => handleOpenPatient(user)} 
                            className="bg-slate-900 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white p-2 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="p-5 bg-[#080808] border-t border-slate-900 flex items-center justify-between">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    عرض {currentRecords.length} من أصل {filteredUsers.length} سجل
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
                          ? 'bg-blue-600 text-white shadow-lg' 
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
              </div>
            </div>
          ) : (
            /* Details View - كما في الصورة التي أرفقتها سابقاً */
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#0a0a0a] border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10">
                 <div className="flex items-center gap-8 mb-10 border-b border-slate-800 pb-8">
                    <div className="w-24 h-24 bg-blue-600/10 border-2 border-blue-500/30 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner">
                       <User size={48} />
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{selectedPatient.name}</h2>
                       <div className="flex gap-3">
                          <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-widest font-mono">ID: {selectedPatient.id}</span>
                          <span className="text-[10px] bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full text-red-500 font-bold uppercase tracking-widest">فصيلة الدم: {selectedPatient.bloodType}</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-red-950/10 border border-red-500/20 p-6 rounded-2xl">
                       <h3 className="text-red-500 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><AlertTriangle size={16}/> الحساسية</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.map((a, i) => (
                            <span key={i} className="bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-red-900/20">{a}</span>
                          ))}
                       </div>
                    </div>

                    <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl">
                       <h3 className="text-blue-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><Activity size={16}/> الأمراض المزمنة</h3>
                       {selectedPatient.chronicDiseases.map((d, i) => (
                         <div key={i} className="text-sm text-slate-300 mb-2 font-medium flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {d}
                         </div>
                       ))}
                    </div>

                    <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl">
                       <h3 className="text-emerald-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><Pill size={16}/> الأدوية النشطة</h3>
                       {selectedPatient.recentMedications.map((m, i) => (
                         <div key={i} className="text-sm text-slate-300 mb-2 font-medium flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {m}
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="mt-10 pt-6 flex justify-end gap-4 border-t border-slate-900">
                    <button 
                      onClick={() => setViewMode('list')} 
                      className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
                    >
                      إغلاق الملف
                    </button>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedicalHistoryView;