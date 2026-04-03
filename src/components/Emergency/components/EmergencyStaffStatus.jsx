/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Search, User, Phone, Mail, MapPin, 
  Filter, ChevronRight, ChevronLeft, 
  Briefcase, Circle, UserCheck, UserX, 
  Clock, ArrowUpDown
} from 'lucide-react';

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

const EmergencyStaffStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // بيانات الكادر البشري
  const [staffList] = useState([
    { id: 'ST-001', name: 'أحمد ياسين', position: 'مشرف عمليات', location: 'قسم الطوارئ - نابلس', status: 'متاح', phone: '0599000111', email: 'a.yassin@dispatch.ps' },
    { id: 'ST-002', name: 'سارة خالد', position: 'مستقبل بلاغات', location: 'قسم الطوارئ - رام الله', status: 'مشغول', phone: '0599000222', email: 's.khaled@dispatch.ps' },
    { id: 'ST-003', name: 'محمد علي', position: 'مدير نوبة', location: 'قسم الطوارئ - الخليل', status: 'في إجازة', phone: '0599000333', email: 'm.ali@dispatch.ps' },
    { id: 'ST-004', name: 'لينا المصري', position: 'فني نظم', location: 'قسم الطوارئ - جنين', status: 'متاح', phone: '0599000444', email: 'l.masri@dispatch.ps' },
    { id: 'ST-005', name: 'عمر القاسم', position: 'محلل بيانات', location: 'قسم الطوارئ - طولكرم', status: 'غير متاح', phone: '0599000555', email: 'o.qasem@dispatch.ps' },
    { id: 'ST-006', name: 'رنا منصور', position: 'مشرف اتصالات', location: 'قسم الطوارئ - أريحا', status: 'متاح', phone: '0599000666', email: 'r.mansour@dispatch.ps' },
  ]);

  // منطق الفلترة والبحث
  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesSearch = staff.name.includes(searchTerm) || staff.position.includes(searchTerm) || staff.location.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, staffList]);

  const totalPages = Math.ceil(filteredStaff.length / recordsPerPage) || 1;
  const currentRecords = filteredStaff.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'متاح': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'مشغول': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'في إجازة': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'غير متاح': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-300" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .truncate-text { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <EmergencyHeader pageTitle="حالة الكادر البشري الميداني" />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-[1600px] p-3 mx-auto">
            
            {/* الهيدر الوظيفي */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600/10 rounded-2xl border border-emerald-500/20 text-emerald-500">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">حالة الموظفين</h1>
                  <p className="text-slate-500 text-[10px] mt-2 font-bold tracking-[0.2em] uppercase">Staff Deployment & Status Records</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {/* البحث */}
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="بحث عن موظف..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#080808] border border-slate-800 rounded-lg py-2 pr-10 pl-4 w-full lg:w-64 focus:border-emerald-500 outline-none text-xs transition-all"
                  />
                </div>

                {/* فلتر الحالة */}
                <div className="flex items-center gap-2 bg-[#080808] border border-slate-800 rounded-lg px-3 py-1.5">
                  <Filter size={14} className="text-slate-500" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-300 cursor-pointer"
                  >
                    <option value="all">كل الحالات</option>
                    <option value="متاح">متاح</option>
                    <option value="مشغول">مشغول</option>
                    <option value="في إجازة">في إجازة</option>
                    <option value="غير متاح">غير متاح</option>
                  </select>
                </div>
              </div>
            </div>

            {/* الجدول */}
            <div className="bg-[#050505] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-right text-[13px]">
                <thead>
                  <tr className="bg-[#0c0c0c] border-b border-slate-800 text-slate-500 font-bold uppercase tracking-tighter">
                    <th className="p-4">الموظف / المعرف</th>
                    <th className="p-4">المسمى الوظيفي</th>
                    <th className="p-4">القسم / الموقع</th>
                    <th className="p-4">رقم التواصل</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {currentRecords.map((staff) => (
                    <tr key={staff.id} className="hover:bg-emerald-500/5 transition-colors even:bg-[#080808]/40">
                      <td className="p-4 font-bold text-slate-200">
                        <div className="flex flex-col gap-1">
                          <span>{staff.name}</span>
                          <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">{staff.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-600" />
                          {staff.position}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-bold">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-500/60" />
                          {staff.location}
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        <div className="flex flex-col gap-1">
                          <a href={`tel:${staff.phone}`} className="text-slate-300 hover:text-emerald-500 transition-colors">{staff.phone}</a>
                          <span className="text-[11px] text-slate-600">{staff.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(staff.status)}`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <a href={`mailto:${staff.email}`} className="inline-flex p-2 bg-slate-900 border border-slate-800 rounded-md text-slate-400 hover:text-white hover:bg-emerald-600 transition-all">
                          <Mail size={16} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* الباجينيشن */}
              <div className="p-4 bg-[#080808] border-t border-slate-900 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-bold uppercase tracking-widest">إجمالي الموظفين: {filteredStaff.length}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all"><ChevronRight size={16}/></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded border transition-all font-bold ${currentPage === i + 1 ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-800 text-slate-500 hover:bg-slate-800'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 bg-slate-900 rounded border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft size={16}/></button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmergencyStaffStatus