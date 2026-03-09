/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Filter, Download, MessageSquare, Clock, 
  AlertCircle, CheckCircle2, MoreHorizontal, Plus, 
  User, Tag, RotateCcw, ChevronLeft, ChevronRight,
  ExternalLink, Circle, Mail
} from 'lucide-react';

const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [tickets] = useState([
    { id: "TK-7701", subject: "تعذر الوصول للملفات الشخصية", user: "عمر خالد", priority: "high", status: "open", category: "قاعدة البيانات", time: "منذ 10 دقائق" },
    { id: "TK-7702", subject: "استفسار عن طرق الدفع الجديدة", user: "ريم أحمد", priority: "low", status: "closed", category: "مالية", time: "منذ ساعتين" },
    { id: "TK-7703", subject: "بطء شديد في تحميل لوحة التحكم", user: "فهد السعيد", priority: "high", status: "pending", category: "أداء النظام", time: "منذ 15 دقيقة" },
    { id: "TK-7704", subject: "طلب تغيير البريد الإلكتروني", user: "هناء منصور", priority: "medium", status: "open", category: "حسابات", time: "منذ 4 ساعات" },
    { id: "TK-7705", subject: "خطأ 404 عند فتح التقارير", user: "سلطان علي", priority: "medium", status: "open", category: "تقنية", time: "منذ ساعة" },
  ]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.subject.includes(searchTerm) || t.id.includes(searchTerm) || t.user.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTickets);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Support_Tickets");
    XLSX.writeFile(wb, `Tickets_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const priorityConfig = {
    high: { label: "عاجل", class: "text-rose-600 bg-rose-50 border-rose-100" },
    medium: { label: "متوسط", class: "text-amber-600 bg-amber-50 border-amber-100" },
    low: { label: "عادي", class: "text-blue-600 bg-blue-50 border-blue-100" }
  };

  const statusConfig = {
    open: { label: "نشطة", dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" },
    pending: { label: "معلقة", dot: "bg-amber-400" },
    closed: { label: "مغلقة", dot: "bg-slate-300" }
  };

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen" dir="rtl">
      
      {/* الترويسة الرئيسية */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-8 bg-slate-900 rounded-full"></span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">مركز تذاكر الدعم</h1>
          </div>
          <p className="text-xs text-slate-400 font-bold mr-4">إدارة وحل طلبات المستخدمين بكل كفاءة</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} /> تصدير البيانات
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
            <Plus size={16} /> إنشاء تذكرة
          </button>
        </div>
      </div>

      {/* العدادات السريعة (Stats Cards) */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "إجمالي التذاكر", count: "128", icon: <Mail className="text-blue-500"/>, bg: "bg-blue-50/50" },
          { label: "تذاكر لم تُحل", count: tickets.filter(t => t.status === 'open').length, icon: <Clock className="text-rose-500"/>, bg: "bg-rose-50/50" },
          { label: "قيد المراجعة", count: "4", icon: <RotateCcw className="text-amber-500"/>, bg: "bg-amber-50/50" },
          { label: "معدل الحل", count: "94%", icon: <CheckCircle2 className="text-emerald-500"/>, bg: "bg-emerald-50/50" },
        ].map((stat, i) => (
          <div key={i} className={`p-5 rounded-[2rem] border border-white shadow-sm flex items-center gap-4 ${stat.bg}`}>
            <div className="p-3 bg-white rounded-2xl shadow-sm">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</p>
              <h4 className="text-xl font-black text-slate-800">{stat.count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* منطقة البحث والفلترة العائمة */}
      <div className="bg-white/70 backdrop-blur-md p-4 rounded-[2rem] border border-white shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="ابحث عن تذكرة عبر الموضوع أو المعرف..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-xs font-bold focus:ring-4 focus:ring-slate-100 transition-all outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl">
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-[11px] font-black text-slate-600 px-4 py-1 outline-none cursor-pointer"
          >
            <option value="all">الحالة: الكل</option>
            <option value="open">نشطة</option>
            <option value="pending">معلقة</option>
            <option value="closed">مغلقة</option>
          </select>
          <div className="w-[1px] h-4 bg-slate-200"></div>
          <select 
            value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-transparent border-none text-[11px] font-black text-slate-600 px-4 py-1 outline-none cursor-pointer"
          >
            <option value="all">الأولوية: الكل</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">عادية</option>
          </select>
        </div>
      </div>

      {/* الجدول العصري */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">معلومات التذكرة</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">التصنيف</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الأولوية</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTickets.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                <td className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">#{t.id}</span>
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-emerald-600 transition-colors">{t.subject}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1 text-slate-600"><User size={12}/> {t.user}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {t.time}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50">
                    <Tag size={12}/> {t.category}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black inline-block min-w-[70px] ${priorityConfig[t.priority].class}`}>
                    {priorityConfig[t.priority].label}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[t.status].dot}`}></div>
                    <span className="text-[10px] font-black text-slate-700">{statusConfig[t.status].label}</span>
                  </div>
                </td>
                <td className="p-6 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-800 px-4 py-2 rounded-xl text-[10px] font-black hover:border-slate-900 transition-all shadow-sm">
                      عرض <ExternalLink size={14} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* شريط التصفح السفلي (Pagination) */}
        <div className="bg-slate-50/80 p-5 flex justify-between items-center border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400">تظهر النتائج من 1 إلى {filteredTickets.length} من أصل 56 تذكرة</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ChevronRight size={16}/></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 text-white text-[10px] font-black shadow-lg">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"><ChevronLeft size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTickets;