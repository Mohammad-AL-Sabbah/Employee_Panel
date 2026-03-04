import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Search, ShieldCheck, MapPin, 
  Smartphone, Eye, Ban, SearchX 
} from 'lucide-react';

const Users = () => {
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  const usersData = [
    { id: 1, name: "م. أحمد الشكعة", type: "Staff", role: "مدير صيانة", email: "ahmad@psrs.ps", location: "نابلس - الدوار", joinDate: "2024-01", reportsCount: 45 },
    { id: 2, name: "سامر خليل", type: "Citizen", role: "مواطن", email: "samer88@gmail.com", location: "رفيديا", joinDate: "2024-02", reportsCount: 12 },
    { id: 3, name: "سارة القطب", type: "Staff", role: "محللة نظم", email: "sara@psrs.ps", location: "ميداني", joinDate: "2023-11", reportsCount: 89 },
    { id: 4, name: "هيا النابلسي", type: "Citizen", role: "مواطن (موثوق)", email: "haya.n@outlook.com", location: "البلدة القديمة", joinDate: "2024-02", reportsCount: 3 },
  ];

  const filteredUsers = usersData.filter(user => {
    const matchesTab = activeTab === "الكل" || user.type === activeTab;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });
  const title = useEffect(() =>{
document.title = " إدارة المستخدمين | P.S.R.S";
  },[]);


  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen" dir="rtl">
      
      {/* الترويسة */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <UsersIcon size={28} className="text-emerald-600" />
            إدارة قاعدة بيانات المستخدمين
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">لوحة تحكم نظام PSRS</p>
        </div>
      </div>

      {/* شريط الأدوات */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
          {["الكل", "Staff", "Citizen"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer ${
                activeTab === tab 
                ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {tab === "الكل" ? "جميع الحسابات" : tab === "Staff" ? "كادر البلدية" : "المواطنين"}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم، الإيميل، أو الموقع..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-11 pl-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {filteredUsers.length > 0 ? (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">المستخدم</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">نوع الحساب</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">الموقع</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">النشاط</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-emerald-50/20 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner ${
                        user.type === 'Staff' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${
                      user.type === 'Staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.type === 'Staff' ? <ShieldCheck size={12} /> : <Smartphone size={12} />}
                      {user.type === 'Staff' ? 'موظف بلدية' : 'مستخدم تطبيق'}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-[12px]">
                      <MapPin size={14} className="text-rose-400" />
                      {user.location}
                    </div>
                  </td>

                  <td className="p-5 text-center">
                    <div className="bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                      <span className="text-xs font-black text-slate-700">{user.reportsCount}</span>
                      <span className="text-[10px] text-slate-400 font-bold mr-1 text-nowrap">بلاغ</span>
                    </div>
                  </td>
                  
                  {/* الإجراءات المطلوبة */}
                  <td className="p-5 text-left text-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* رابط التفاصيل */}
                      <a 
                        href={`/users/${user.id}`} 
                        title="عرض الملف الكامل"
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-blue-100 cursor-pointer no-underline text-xs font-black"
                      >
                        <Eye size={16} />
                        <span>التفاصيل</span>
                      </a>

                      {/* زر الحظر */}
                      <button 
                        onClick={() => alert(`حظر المستخدم: ${user.name}`)}
                        title="حظر المستخدم"
                        className="flex items-center gap-2 px-4 py-2 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm border border-amber-100 cursor-pointer text-xs font-black"
                      >
                        <Ban size={16} />
                        <span>حظر</span>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center">
            <SearchX size={60} className="text-slate-200 mb-6" />
            <h3 className="text-xl font-black text-slate-800">لم نعثر على أي مستخدم!</h3>
            <button onClick={() => setSearchTerm("")} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs cursor-pointer shadow-lg shadow-emerald-100 hover:scale-105 transition-transform">عرض الكل</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;