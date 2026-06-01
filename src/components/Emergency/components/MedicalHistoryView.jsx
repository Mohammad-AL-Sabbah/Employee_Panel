/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, Activity, AlertTriangle, Search, Phone, Users,
  User, Pill, Eye, UserSearch, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken'; // تأكد من صحة مسار ملف الـ Axios الخاص بك
import EmergencySidebar from './EmergencySidebar';

const MedicalHistoryView = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // --- حالات التحكم بالبيانات القادمة من السيرفر ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const recordsPerPage = 10; // متوافق مع السيرفر الـ Default الـ PageSize = 10

  // --- دالة جلب البيانات الحية من السيرفر الموحد ---
  const fetchMedicalRecords = useCallback(async () => {
    try {
      setLoading(true);
      // بناء الـ query params المتوافقة مع الـ Backend
      const response = await ApiAuthToken.get('/emergency-employee/public-medical-history', {
        params: {
          pageNumber: currentPage,
          pageSize: recordsPerPage,
          search: searchTerm || null
        }
      });

      const data = response.data;
      if (data) {
        setPatients(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching medical histories:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // استدعاء الدالة عند تغيير الصفحة أو قيم البحث
  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  // دالة تحضير وفتح تفاصيل المريض الطبية
  const handleOpenPatient = (patient) => {
    // الـ API يرسل البيانات كنصوص مفصولة بفاصلة، نقوم بتحويلها لمصفوفات من أجل الـ UI
    const parseMetaList = (str) => {
      if (!str || str.trim() === "" || str === "string") return [];
      return str.split(/[،,]+/).map(item => item.trim());
    };

    setSelectedPatient({
      name: patient.fullName || "مواطن مجهول الاسم",
      age: patient.age || "غير مسجل",
      bloodType: patient.bloodType || "غير معروف",
      allergies: parseMetaList(patient.allergies),
      chronicDiseases: parseMetaList(patient.chronicDiseases),
      recentMedications: parseMetaList(patient.currentMedications),
      emergencyContacts: patient.emergencyContacts || [],
      profilePictureUrl: patient.profilePictureUrl
    });
    setViewMode('details');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          {viewMode === 'list' ? (
            <div className="max-w-6xl mx-auto">
              
              {/* هيدر شريط البحث والتحكم */}
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <UserSearch className="text-blue-500" size={32} />
                     السجلات الطبية الموحدة
                  </h1>
                </div>
                
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="البحث بالاسم، فصيلة الدم، أو المعرف..." 
                    className="bg-[#0a0a0a] border border-slate-800 rounded-xl py-2.5 pr-12 pl-4 w-80 focus:border-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* جدول عرض السجلات الحية */}
              <div className="bg-[#050505] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
                
                {loading ? (
                  <div className="w-full h-60 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-xs text-slate-500 font-bold">جاري مراجعة وتأمين قيود السجلات الحية...</span>
                  </div>
                ) : (
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                        <th className="p-5">المواطن</th>
                        <th className="p-5 text-center">العمر في النظام</th>
                        <th className="p-5 text-center">الفصيلة الأساسية</th>
                        <th className="p-5">الأمراض الحالية الموثقة</th>
                        <th className="p-5 text-center">الإجراء الميداني</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {patients.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-10 text-center text-xs text-slate-600 font-bold">
                            لا يوجد سجلات طبية عامة تطابق معايير البحث الحالية.
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient, index) => (
                          <tr key={index} className="hover:bg-blue-600/5 transition-colors group">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                {patient.profilePictureUrl ? (
                                  <img src={patient.profilePictureUrl} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500"><User size={14}/></div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-200">{patient.fullName || "اسم غير مدرج"}</div>
                                  <div className="text-[9px] text-slate-600 font-mono">نظام PSRS الموحد</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-center font-bold text-blue-400/80">{patient.age || "---"} عاماً</td>
                            <td className="p-5 text-center">
                              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded border border-red-500/20 font-black text-xs">
                                {patient.bloodType && patient.bloodType !== "string" ? patient.bloodType : "---"}
                              </span>
                            </td>
                            <td className="p-5 text-xs text-slate-400 max-w-xs truncate">
                              {patient.chronicDiseases && patient.chronicDiseases !== "string" ? patient.chronicDiseases : "لا يوجد أمراض مزمنة موثقة"}
                            </td>
                            <td className="p-5 text-center">
                              <button 
                                onClick={() => handleOpenPatient(patient)} 
                                className="bg-slate-900 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white p-2 rounded-lg transition-all cursor-pointer"
                                title="عرض وتحليل الملف الطبي بالكامل"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* شريط التحكم بالصفحات السفلي */}
                <div className="p-5 bg-[#080808] border-t border-slate-900 flex items-center justify-between">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    عرض {patients.length} سجل من إجمالي {totalCount} سجل طبي موثق
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        disabled={loading}
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
                      disabled={currentPage === totalPages || loading}
                      className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* شاشة عرض التفاصيل الشاملة للمواطن المستدعى */
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#0a0a0a] border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10">
                 
                 {/* هيدر الكرت الشخصي */}
                 <div className="flex items-center gap-8 mb-10 border-b border-slate-800 pb-8">
                    <div className="w-24 h-24 bg-blue-600/10 border-2 border-blue-500/30 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner overflow-hidden">
                       {selectedPatient.profilePictureUrl ? (
                         <img src={selectedPatient.profilePictureUrl} className="w-full h-full object-cover" alt="" />
                       ) : (
                         <User size={48} />
                       )}
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{selectedPatient.name}</h2>
                       <div className="flex gap-3">
                          <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold tracking-widest font-mono">العمر: {selectedPatient.age} عاماً</span>
                          <span className="text-[10px] bg-red-600/10 border border-red-500/20 px-3 py-1 rounded-full text-red-500 font-bold uppercase tracking-widest">فصيلة الدم الموثقة: {selectedPatient.bloodType}</span>
                       </div>
                    </div>
                 </div>

                 {/* كروت البيانات الطبية الرئيسية الثلاثة */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 1. الحساسية */}
                    <div className="bg-red-950/10 border border-red-500/20 p-6 rounded-2xl">
                       <h3 className="text-red-500 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><AlertTriangle size={16}/> الحساسية الدوائية والغذائية</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.length === 0 ? (
                            <span className="text-xs text-slate-500 italic">لا يوجد حساسية مسجلة</span>
                          ) : (
                            selectedPatient.allergies.map((a, i) => (
                              <span key={i} className="bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-red-900/20">{a}</span>
                            ))
                          )}
                       </div>
                    </div>

                    {/* 2. الأمراض المزمنة */}
                    <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl">
                       <h3 className="text-blue-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><Activity size={16}/> تشخيص الأمراض المزمنة</h3>
                       {selectedPatient.chronicDiseases.length === 0 ? (
                          <div className="text-xs text-slate-500 italic">خالٍ من الأمراض المزمنة الموثقة</div>
                       ) : (
                          selectedPatient.chronicDiseases.map((d, i) => (
                            <div key={i} className="text-sm text-slate-300 mb-2 font-medium flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {d}
                            </div>
                          ))
                       )}
                    </div>

                    {/* 3. الأدوية الحالية */}
                    <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-2xl">
                       <h3 className="text-emerald-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest"><Pill size={16}/> العلاجات والأدوية النشطة حالياً</h3>
                       {selectedPatient.recentMedications.length === 0 ? (
                          <div className="text-xs text-slate-500 italic">لا يوجد علاجات نشطة مسجلة</div>
                       ) : (
                          selectedPatient.recentMedications.map((m, i) => (
                            <div key={i} className="text-sm text-slate-300 mb-2 font-medium flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {m}
                            </div>
                          ))
                       )}
                    </div>
                 </div>

                 {/* 🔥 الإضافة اللوجستية المتقدمة: جهات اتصال الطوارئ والأقارب المقربين */}
                 <div className="mt-8 pt-6 border-t border-slate-900">
                    <h3 className="text-purple-400 text-xs font-black mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Users size={16}/> أقارب وجهات اتصال الطوارئ المصرح بها (Emergency Contacts)
                    </h3>
                    
                    {selectedPatient.emergencyContacts.length === 0 ? (
                      <p className="text-xs text-slate-600 font-medium italic">لم يقم المواطن بإدراج جهات اتصال طوارئ احتياطية في حسابه الموحد.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedPatient.emergencyContacts.map((contact, i) => (
                          <div key={i} className="bg-purple-500/[0.02] border border-purple-500/10 p-4 rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-200">{contact.name || "قريب غير مسمى"}</p>
                              <p className="text-[11px] font-mono text-slate-500 mt-1">{contact.phoneNumber}</p>
                            </div>
                            <a 
                              href={`tel:${contact.phoneNumber}`} 
                              className="bg-purple-900/20 border border-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-400 p-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                              title={`اتصال فوري بـ ${contact.name}`}
                            >
                              <Phone size={14} />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 {/* أزرار العودة والإغلاق */}
                 <div className="mt-10 pt-6 flex justify-end gap-4 border-t border-slate-900">
                    <button 
                      onClick={() => setViewMode('list')} 
                      className="px-8 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
                    >
                      إغلاق ومغادرة الملف
                    </button>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default MedicalHistoryView;