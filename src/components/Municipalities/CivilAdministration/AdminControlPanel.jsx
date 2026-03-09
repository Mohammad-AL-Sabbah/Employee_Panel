/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, MapPin, AlertCircle, UserPlus,
  Clock, Bell, ChevronLeft, Users, Loader2, Search, 
  ShieldCheck, History, LifeBuoy, UserMinus, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminControlPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  // لنفترض أننا سنعرض الموظفين في المكان الذي كانت فيه الاقتباسات (Quotes)
  const [staff, setStaff] = useState([
    { id: 101, name: "أحمد محمد", role: "Admin", status: "نشط" },
    { id: 102, name: "سارة خالد", role: "Editor", status: "موقوف" },
    { id: 103, name: "ياسين علي", role: "Admin", status: "نشط" },
  ]);

  useEffect(() => {
    document.title = "لوحة الإدارة والدعم | P.S.R.S";
  }, []);

  return (
    <div className="p-8 w-full bg-transparent animate-in fade-in duration-500" dir="rtl">
      
      {/* رأس الصفحة الداخلي (نفس الـ Header الخاص بك) */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">لوحة الإدارة العليا والدعم الفني</h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* الجزء الأيمن الرئيسي */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* قسم الإجراءات السريعة - بنفس توزيع الكروت الخاصة بك */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>إجراءات المدير العام</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickCard icon={UserPlus} label="إضافة موظف" to="/admin/add" active />
              <QuickCard icon={History} label="سجل التدقيق" to="/admin/audit" />
              <QuickCard icon={LifeBuoy} label="تذاكر الموظفين" to="/admin/tickets" />
              <QuickCard icon={Users} label="إدارة الرتب" to="/admin/roles" />
            </div>
          </div>

          {/* قسم إدارة الموظفين - بديل قسم البلاغات في كودك */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[450px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-slate-800 font-bold text-lg">قائمة موظفي النظام</h3>
                <p className="text-xs text-slate-400 mt-1">إدارة صلاحيات وحالة وصول الطاقم</p>
              </div>
              <div className="relative w-72 group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="بحث عن موظف بالاسم أو الرقم..." 
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                عرض كافة الطاقم
              </button>
            </div>

            <div className="space-y-4">
              {staff.map((member) => (
                <div 
                  key={member.id} 
                  className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-5 flex-1">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                      <Users size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors text-right">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <span className="font-bold text-slate-500">الرتبة:</span> {member.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase ${member.status === 'نشط' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                         {member.status}
                       </span>
                    </div>
                    <ChevronLeft size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* الجزء الأيسر الجانبي - مطابق تماماً لكودك */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-emerald-600 mb-5 font-bold text-xs uppercase tracking-tight">
              <Clock size={16} /> حالة النظام العليا
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tighter mb-1">متصل الآن</p>
            <p className="text-slate-400 text-[11px]">جميع الخوادم تعمل بكفاءة</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs"><LifeBuoy size={16} /> تذاكر الدعم</div>
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">02</span>
            </div>
            <div className="space-y-6">
              <div className="pr-4 border-r-2 border-red-500 text-right">
                <p className="text-[11px] font-bold text-slate-800">مشكلة في الخريطة</p>
                <p className="text-[10px] text-slate-400 mt-1">مرسلة من: م. سليم</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const QuickCard = ({ icon: Icon, label, to = "/", active = false }) => {
  const baseClasses = "aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm no-underline";
  const stateClasses = active 
    ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-200 shadow-xl scale-105" 
    : "bg-white border-slate-200 text-slate-600 hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1";

  return (
    <Link to={to} className={`${baseClasses} ${stateClasses}`}>
      <div className={`${active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'} p-3.5 rounded-2xl transition-colors`}>
        <Icon size={22} />
      </div>
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
};

export default AdminControlPanel;