/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Building2, Phone, Mail, Search, 
  MapPin, ChevronRight, ChevronLeft, 
  Globe2, ArrowLeftRight
} from 'lucide-react';

import EmergencySidebar from './EmergencySidebar';

const EmergencyCenters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // بيانات أقسام الطوارئ - أسماء موحدة ومباشرة
  const [emergencyDepartments] = useState([
    { id: 'ED-RAM', name: 'قسم الطوارئ - رام الله', governorate: 'رام الله والبيرة', type: 'المقر الرئيسي', phone: '022980000', email: 'ramallah.em@dispatch.ps' },
    { id: 'ED-NAB', name: 'قسم الطوارئ - نابلس', governorate: 'نابلس', type: 'المقر الرئيسي', phone: '092380000', email: 'nablus.em@dispatch.ps' },
    { id: 'ED-HEB', name: 'قسم الطوارئ - الخليل', governorate: 'الخليل', type: 'المقر الرئيسي', phone: '022220000', email: 'hebron.em@dispatch.ps' },
    { id: 'ED-JEN', name: 'قسم الطوارئ - جنين', governorate: 'جنين', type: 'المقر الرئيسي', phone: '042500000', email: 'jenin.em@dispatch.ps' },
    { id: 'ED-JER', name: 'قسم الطوارئ - أريحا', governorate: 'أريحا', type: 'المقر الرئيسي', phone: '022320000', email: 'jericho.em@dispatch.ps' },
    { id: 'ED-TUL', name: 'قسم الطوارئ - طولكرم', governorate: 'طولكرم', type: 'المقر الرئيسي', phone: '092670000', email: 'tulkarem.em@dispatch.ps' },
    { id: 'ED-QAL', name: 'قسم الطوارئ - قلقيلية', governorate: 'قلقيلية', type: 'المقر الرئيسي', phone: '092940000', email: 'qalqilya.em@dispatch.ps' },
    { id: 'ED-BTH', name: 'قسم الطوارئ - بيت لحم', governorate: 'بيت لحم', type: 'المقر الرئيسي', phone: '022740000', email: 'bethlehem.em@dispatch.ps' },
  ]);

  const filteredDepts = useMemo(() => {
    return emergencyDepartments.filter(dept => 
      dept.name.includes(searchTerm) || dept.governorate.includes(searchTerm)
    );
  }, [searchTerm, emergencyDepartments]);

  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage) || 1;
  const currentItems = filteredDepts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

    

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar relative">
          <div className="max-w-7xl p-4 mx-auto">
            
            {/* Header القسم */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-blue-500 shadow-lg shadow-blue-900/10">
                  <ArrowLeftRight size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">أقسام الطوارئ</h1>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold opacity-80">Palestine Emergency Departments Directory</p>
                </div>
              </div>

              <div className="relative flex-1 md:flex-none">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="بحث عن قسم أو محافظة..." 
                  className="bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3 pr-12 pl-5 w-full md:w-96 focus:border-blue-500 outline-none text-sm transition-all text-white placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>
            </div>

            {/* شبكة الأقسام */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
              {currentItems.map((dept) => (
                <div key={dept.id} className="bg-[#080808] border border-slate-800/60 rounded-[2.5rem] p-8 hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-2xl">
                  
                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3.5 bg-slate-900 rounded-2xl text-blue-500 border border-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      <Building2 size={26} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-black border border-slate-800 px-4 py-1.5 rounded-full tracking-widest uppercase">
                      {dept.type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-6 leading-tight group-hover:text-blue-400 transition-colors">
                    {dept.name}
                  </h3>

                  <div className="space-y-5 mb-10">
                    <div className="flex items-center gap-4 text-slate-400 group/item">
                      <div className="p-2 bg-slate-900 rounded-lg group-hover/item:text-blue-500 transition-colors">
                        <Globe2 size={16} />
                      </div>
                      <span className="text-sm font-semibold tracking-wide text-slate-300">{dept.governorate}</span>
                    </div>

                    {/* أرقام اتصال وإيميل تفاعلية */}
                    <a href={`tel:${dept.phone}`} className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group/item">
                      <div className="p-2 bg-slate-900 rounded-lg group-hover/item:bg-blue-600/20 group-hover/item:text-blue-500">
                        <Phone size={16} />
                      </div>
                      <span className="text-base font-mono font-bold tracking-tighter">{dept.phone}</span>
                    </a>

                    <a href={`mailto:${dept.email}`} className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group/item">
                      <div className="p-2 bg-slate-900 rounded-lg group-hover/item:bg-blue-600/20 group-hover/item:text-blue-500">
                        <Mail size={16} />
                      </div>
                      <span className="text-sm font-medium truncate opacity-80">{dept.email}</span>
                    </a>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50 flex gap-4">
                    <a 
                      href={`tel:${dept.phone}`}
                      className="flex-1 bg-white text-black hover:bg-blue-600 hover:text-white py-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-black text-xs uppercase shadow-xl active:scale-95"
                    >
                      <Phone size={16} />
                      اتصال مباشر
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center bg-[#050505] p-7 rounded-[2rem] border border-slate-800 shadow-2xl">
              <span className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Total Departments: {filteredDepts.length}</span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-10 cursor-pointer transition-all shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages} 
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-10 cursor-pointer transition-all shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmergencyCenters;