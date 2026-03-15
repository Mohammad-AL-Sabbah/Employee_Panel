/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Search, Shield, Ambulance, Flame, Phone, 
  MessageSquare, Eye, MapPin, User, 
  ChevronRight, ChevronLeft, Filter, Radio,
  BellPlus, Send, X, AlertTriangle
} from 'lucide-react';

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

const FieldUnitsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const unitsPerPage = 6;

  // حالات الـ Popups الجديدة
  const [showCallMenu, setShowCallMenu] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callTarget, setCallTarget] = useState(""); // police, ambulance, fire, all
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // بيانات الوحدات الميدانية
  const fieldUnits = [
    { id: 'POL-101', name: 'وحدة شرطة ', type: 'police', leader: 'العقيد جاسم محمد', location: 'ميدان التحرير - القطاع أ', status: 'متاح', color: 'blue' },
    { id: 'AMB-202', name: 'وحدة إسعاف ', type: 'ambulance', leader: 'د. سارة الأحمد', location: 'مستشفى الشفاء - الطوارئ', status: 'في مهمة', color: 'emerald' },
    { id: 'FIRE-303', name: 'وحدة إطفاء', type: 'fire', leader: 'الرائد خالد منصور', location: 'منطقة المستودعات المركزية', status: 'متاح', color: 'red' },
    { id: 'POL-104', name: 'وحدة شرطة ', type: 'police', leader: 'النقيب فهد وريد', location: 'طريق المطار الدولي', status: 'مشغول', color: 'blue' },
    { id: 'AMB-205', name: 'وحدة إسعاف ', type: 'ambulance', leader: 'أ. مريم إبراهيم', location: 'حي الياسمين - المربع 4', status: 'غير متاح', color: 'emerald' },
    { id: 'FIRE-306', name: 'وحدة إطفاء', type: 'fire', leader: 'الرائد يوسف عمر', location: 'ميناء المدينة الجنوبي', status: 'في مهمة', color: 'red' },
    { id: 'POL-107', name: 'وحدة شرطة', type: 'police', leader: 'المقدم ناصر علي', location: 'المنطقة الدبلوماسية', status: 'في مهمة ', color: 'blue' },
  ];

  const getUnitIcon = (type) => {
    switch (type) {
      case 'police': return <Shield size={24} />;
      case 'ambulance': return <Ambulance size={24} />;
      case 'fire': return <Flame size={24} />;
      default: return <Radio size={24} />;
    }
  };

  const filteredUnits = useMemo(() => {
    return fieldUnits.filter(unit => {
      const matchesSearch = unit.name.includes(searchTerm) || unit.leader.includes(searchTerm) || unit.id.includes(searchTerm);
      const matchesFilter = filterType === "all" || unit.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage) || 1;
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);

  // دالة التعامل مع الإرسال
  const handleDispatch = (e) => {
    e.preventDefault();
    setShowCallModal(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 4000);
  };

  return (
    <div className="flex  flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="h-14 w-full flex-shrink-0 z-[60]">
        <EmergencyHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1  h-full overflow-y-auto bg-black p-6 hide-scrollbar relative">
          <div className="max-w-7xl p-4 mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <Radio className="text-blue-500" size={32} />
                  الوحدات الميدانية النشطة
                </h1>
                <p className="text-slate-500 text-sm mt-1">مراقبة مباشرة لانتشار وحدات الطوارئ في القطاعات</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {/* زر استدعاء الوحدات الجديد */}
                <div className="relative">
                  <button 
                    onClick={() => setShowCallMenu(!showCallMenu)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 cursor-pointer"
                  >
                    <BellPlus size={20} />
                    <span>استدعاء كافة الوحدات</span>
                  </button>

                  {showCallMenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                      <button style={{cursor:'pointer'}} onClick={() => { setCallTarget("ambulance"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-emerald-500 font-bold"><Ambulance size={18}/> استدعاء الإسعاف</button>
                      <button style={{cursor:'pointer'}}  onClick={() => { setCallTarget("fire"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-red-500 font-bold"><Flame size={18}/> استدعاء الإطفاء</button>
                      <button style={{cursor:'pointer'}}  onClick={() => { setCallTarget("police"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-blue-500 font-bold"><Shield size={18}/> استدعاء الشرطة</button>
                      <button style={{cursor:'pointer'}}  onClick={() => { setCallTarget("all"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm bg-red-600/10 hover:bg-red-600/20 flex items-center gap-3 text-red-600 font-black border-t border-slate-800"><AlertTriangle size={18}/> استدعاء الكل (طارئ)</button>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="بحث عن وحدة..." 
                    className="bg-[#0a0a0a] border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 w-full md:w-64 focus:border-blue-500 outline-none text-sm transition-all text-white"
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentUnits.map((unit) => (
                <div key={unit.id} className="bg-[#0a0a0a] border border-slate-800 rounded-[2rem] p-6 hover:border-slate-600 transition-all group relative overflow-hidden shadow-2xl">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${unit.color === 'blue' ? 'bg-blue-600' : unit.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-600'}`} />
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${unit.color === 'blue' ? 'bg-blue-600/10 text-blue-500' : unit.color === 'emerald' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>{getUnitIcon(unit.type)}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-900 px-3 py-1 rounded-full">{unit.id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{unit.name}</h3>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-400"><User size={16} className="text-slate-600" /><span className="text-sm font-medium">القائد: <span className="text-slate-200">{unit.leader}</span></span></div>
                    <div className="flex items-center gap-3 text-slate-400"><MapPin size={16} className="text-slate-600" /><span className="text-sm font-medium line-clamp-1">المكان الحالي : {unit.location}</span></div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className={`flex h-2 w-2 rounded-full animate-pulse ${unit.status === 'متاح' ? 'bg-emerald-500' : unit.status === 'مشغول' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                      <span className={`text-[13px] font-bold uppercase tracking-tighter ${unit.status === 'متاح' ? 'text-emerald-500' : 'text-amber-500'}`}>حالة الوحدة : {unit.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800 shadow-lg"><Phone size={16} /><span className="text-xs font-bold">اتصال</span></button>
                    <button className="p-3 bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800 cursor-pointer"><MessageSquare size={18} /></button>
                    <button className="p-3 bg-slate-900 hover:bg-white hover:text-black text-slate-400 rounded-xl transition-all border border-slate-800 cursor-pointer"><Eye size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-[#050505] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">عرض {currentUnits.length} من {filteredUnits.length} وحدة</span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"><ChevronRight size={20} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-white border border-slate-800'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"><ChevronLeft size={20} /></button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Popup الاستدعاء --- */}
      {showCallModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl font-sans" dir="rtl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-red-950/20 to-transparent">
              <div>
                <h2 className="text-2xl font-black text-white">إرسال أمر استدعاء</h2>
                <p className="text-slate-500 text-sm">سيتم إخطار الوحدات المحددة فوراً</p>
              </div>
              <button onClick={() => setShowCallModal(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={24}/></button>
            </div>
            
            <form className="p-8 space-y-6" onSubmit={handleDispatch}>
              <div>
                <label className="block text-slate-400 text-sm mb-2 font-bold pr-1">الموقع المطلوب</label>
                <div className="relative">
                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                  <input required type="text" placeholder="حدد الموقع بدقة (مثال: تقاطع شارع النصر)" className="w-full bg-black border border-slate-800 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-red-600 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2 font-bold pr-1">وصف الحالة / التفاصيل</label>
                <textarea required rows="4" placeholder="اكتب تفاصيل المهمة الموكلة للوحدات..." className="w-full bg-black border border-slate-800 rounded-2xl p-4 text-white focus:border-red-600 outline-none transition-all resize-none"></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCallModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-900 transition-all cursor-pointer">إلغاء</button>
                <button type="submit" className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 cursor-pointer">
                  <Send size={18} />
                  <span>تأكيد الاستدعاء الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- تنبيه النجاح (عند استدعاء الكل) --- */}
      {showSuccessAlert && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
          <Shield size={24} />
          <div>
            <p className="font-black">تم إرسال بلاغ الاستدعاء!</p>
            <p className="text-xs opacity-90">تم توجيه {callTarget === 'all' ? 'كافة الوحدات' : 'الوحدات المطلوبة'} إلى الموقع بنجاح.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldUnitsView;