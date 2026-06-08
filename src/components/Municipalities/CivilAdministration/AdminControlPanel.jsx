/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Plus, MessageSquare, MapPin, AlertCircle, UserPlus,
  Clock, Bell, ChevronLeft, Users, Loader2, Search, 
  ShieldCheck, History, LifeBuoy, UserMinus, CheckCircle,
  Ticket
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner'; // استيراد السونر

function AdminControlPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [staff, setStaff] = useState([
    { id: 101, name: "أحمد محمد", role: "Admin", status: "نشط" },
    { id: 102, name: "سارة خالد", role: "Editor", status: "موقوف" },
    { id: 103, name: "ياسين علي", role: "Admin", status: "نشط" },
  ]);

  useEffect(() => {
    document.title = "لوحة الإدارة والدعم | P.S.R.S";
    
    // محاكاة تنبيه للمسؤول بوجود تذاكر دعم فني معلقة عند دخول الصفحة
    const timer = setTimeout(() => {
      toast.warning('تذكير: تذاكر دعم معلقة', {
        description: 'يوجد 2 من موظفي الميدان يواجهون مشاكل تقنية حالياً.',
        action: {
          label: 'مراجعة الآن',
          onClick: () => console.log('الذهاب لصفحة التذاكر')
        },
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-8 w-full bg-transparent animate-in fade-in duration-500" dir="rtl">
      
      {/* رأس الصفحة الداخلي */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">لوحة الإدارة والدعم الفني</h2>
      </div>

      <div className="grid grid-cols-8 gap-8">
        {/* الجزء الأيمن الرئيسي */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* قسم الإجراءات السريعة */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>إجراءات سريعة </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickCard icon={UserPlus} label="إضافة موظف" to="/ManageStaff" active />
              <QuickCard icon={History} label="سجلات الموظفين" to="/StaffLogs" />
              <QuickCard icon={Ticket} label="تذاكر الموظفين" to="/SupportTickets" />
              <QuickCard icon={Users} label="إدارة الرتب" to="/users" />
            </div>
          </div>

          {/* قسم إدارة الموظفين */}
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
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm text-right"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/StaffStatus" className="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                عرض كافة الطاقم
              </Link>
            </div>

            <div className="space-y-4">
              {staff.filter(m => m.name.includes(searchTerm)).map((member) => (
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
                        <span className="font-bold text-slate-500">المسمى الوظيفي:</span> {member.role}
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
      <span className="text-[11px] font-bold text-center">{label}</span>
    </Link>
  );
};

export default AdminControlPanel;