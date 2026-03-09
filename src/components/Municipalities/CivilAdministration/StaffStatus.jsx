/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Filter, Download, UserCheck, Clock, 
  RotateCcw, Ban, Unlock, Briefcase, Calendar, 
  UserCircle, Eye, ShieldCheck, Hash
} from 'lucide-react';

const StaffStatus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت تلقائياً كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // بيانات الموظفين
  const [staff, setStaff] = useState([
    { id: "EMP-9901", name: "محمد صباح", role: "Super Admin", status: "active", shiftStart: "08:00", shiftEnd: "16:00" },
    { id: "EMP-9902", name: "سارة خالد", role: "مدير عمليات", status: "busy", shiftStart: "09:00", shiftEnd: "17:00" },
    { id: "EMP-9903", name: "أحمد علي", role: "موظف دعم", status: "banned", shiftStart: "10:00", shiftEnd: "18:00" },
    { id: "EMP-9904", name: "ليلى محمود", role: "مصمم واجهات", status: "active", shiftStart: "08:30", shiftEnd: "16:30" },
    { id: "EMP-9905", name: "ياسين علي", role: "مطور برمجيات", status: "busy", shiftStart: "07:00", shiftEnd: "15:00" },
  ]);

  const filteredStaff = useMemo(() => {
    return staff.filter(person => {
      const matchesSearch = person.name.includes(searchTerm) || person.id.includes(searchTerm) || person.role.includes(searchTerm);
      const matchesFilter = statusFilter === "all" || person.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, statusFilter, staff]);

  const toggleBan = (id) => {
    setStaff(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'banned' ? 'active' : 'banned' } : p));
  };

  const exportToExcel = () => {
    const data = filteredStaff.map(({ id, name, role, status, shiftStart, shiftEnd }) => ({
      "المعرف": id, "الاسم": name, "المسمى الوظيفي": role, "الحالة": status, "بداية الدوام": shiftStart, "نهاية الدوام": shiftEnd
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff_Data");
    XLSX.writeFile(wb, `Staff_Status_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
  };

  const statusStyles = {
    active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    busy: "bg-amber-50 text-amber-600 border-amber-100",
    banned: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className="p-6 w-full max-w-[1500px] mx-auto animate-in fade-in duration-500" dir="rtl">
      
      {/* القسم العلوي: إحصائيات مع التاريخ الدقيق */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-xl flex items-center gap-4 group">
          <div className="bg-white/10 p-3 rounded-2xl transition-transform">
            <Calendar size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">اليوم الحالي</p>
            <h3 className="text-sm font-black mt-0.5">
              {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
          </div>
        </div>
        {[
          { label: "نشط حالياً", val: staff.filter(s => s.status === 'active').length, color: "bg-emerald-600", icon: <UserCheck size={20}/> },
          { label: "قيد الحظر", val: staff.filter(s => s.status === 'banned').length, color: "bg-rose-600", icon: <Ban size={20}/> },
          { label: "إجمالي الفريق", val: staff.length, color: "bg-blue-600", icon: <Briefcase size={20}/> },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-5 rounded-3xl text-white shadow-lg flex items-center justify-between group`}>
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase">{stat.label}</p>
              <h3 className="text-2xl font-black mt-1">{stat.val}</h3>
            </div>
            <div className="opacity-20">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="flex gap-4 mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="بحث بالاسم، المعرف، أو المسمى الوظيفي..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pr-12 pl-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
        
        <select 
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-6 text-xs font-black text-slate-600 cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="busy">مشغول</option>
          <option value="banned">محظور</option>
        </select>

        <button onClick={exportToExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md">
          <Download size={16} /> تصدير التقرير
        </button>
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-5 text-[11px] font-black text-slate-400 w-16 text-center">#</th>
              <th className="p-5 text-[11px] font-black text-slate-400">الموظف</th>
              <th className="p-5 text-[11px] font-black text-slate-400">المسمى الوظيفي</th>
              <th className="p-5 text-[11px] font-black text-slate-400 text-center">فترة الدوام</th>
              <th className="p-5 text-[11px] font-black text-slate-400 text-center">الحالة</th>
              <th className="p-5 text-[11px] font-black text-slate-400 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStaff.map((p, index) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-all">
                <td className="p-5 text-[10px] font-bold text-slate-400 text-center">{p.id}</td>
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs border border-white shadow-sm">
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-black text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                    {p.role}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Clock size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-700">
                      {p.shiftStart} - {p.shiftEnd}
                    </span>
                  </div>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black shadow-sm inline-block min-w-[80px] ${statusStyles[p.status]}`}>
                    {p.status === 'active' ? 'نشط الآن' : p.status === 'busy' ? 'مشغول' : 'محظور'}
                  </span>
                </td>
                <td className="p-5 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all" title="التفاصيل"><Eye size={16} /></button>
                    <button 
                      onClick={() => toggleBan(p.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black transition-all shadow-sm ${p.status === 'banned' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                    >
                      {p.status === 'banned' ? <><Unlock size={14}/> فك الحظر</> : <><Ban size={14}/> حظر</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffStatus;