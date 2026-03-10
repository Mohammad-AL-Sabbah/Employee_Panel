/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Search, ShieldCheck, MapPin, 
  Smartphone, Eye, Ban, SearchX, Lock, Unlock
} from 'lucide-react';

const Users = () => {
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  const [userRole] = useState(() => {
    return localStorage.getItem('userRole') || 'ضيف';
  });

  const [usersData, setUsersData] = useState([
    { id: 1, name: "م. أحمد الشكعة", type: "Staff", role: "مدير صيانة", email: "ahmad@psrs.ps", location: "نابلس", reportsCount: 45, isBanned: false },
    { id: 2, name: "سامر خليل", type: "Citizen", role: "مواطن", email: "samer88@gmail.com", location: "رفيديا", reportsCount: 12, isBanned: false },
    { id: 3, name: "سارة القطب", type: "Staff", role: "محللة نظم", email: "sara@psrs.ps", location: "ميداني", reportsCount: 89, isBanned: false },
    { id: 4, name: "هيا النابلسي", type: "Citizen", role: "مواطن", email: "haya.n@outlook.com", location: "البلدة القديمة", reportsCount: 3, isBanned: true },
  ]);

  useEffect(() => {
    document.title = " إدارة المستخدمين | P.S.R.S";
  }, []);

  const filteredUsers = usersData.filter(user => {
    const matchesTab = activeTab === "الكل" || user.type === activeTab;
    const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const toggleBan = (id) => {
    setUsersData(prev => prev.map(u => u.id === id ? { ...u, isBanned: !u.isBanned } : u));
  };

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen" dir="rtl">
      {/* الترويسة */}
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <UsersIcon size={28} className="text-emerald-600" />
          إدارة قاعدة بيانات المستخدمين
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
          نظام PSRS - الحساب الحالي: <span className="text-emerald-600">{userRole}</span>
        </p>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
          {["الكل", "Staff", "Citizen"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}>
              {tab === "الكل" ? "جميع الحسابات" : tab === "Staff" ? "كادر البلدية" : "المواطنين"}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-11 pl-4 text-xs font-bold outline-none focus:border-emerald-500 shadow-sm" />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase">المستخدم</th>
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase text-center">نوع الحساب</th>
              <th className="p-5 text-[11px] font-black text-slate-400 uppercase text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => {
              
              // المنطق البرمجي لتحديد من يمكنه التحكم بمن:
              // 1. المسؤول (Super Admin) يتحكم بالكل.
              // 2. الموظف (Admin) يتحكم في المواطنين (Citizen) فقط.
              const canControl = 
                userRole === "مسؤول" || 
                (userRole === "موظف" && user.type === "Citizen");

              return (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black ${user.type === 'Staff' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black border ${user.type === 'Staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {user.type === 'Staff' ? <ShieldCheck size={12} /> : <Smartphone size={12} />}
                      {user.type === 'Staff' ? 'موظف بلدية' : 'مستخدم تطبيق'}
                    </span>
                  </td>

                  <td className="p-5 text-left">
                    <div className="flex items-center justify-end gap-3">
                      
                      {canControl ? (
                        <>
                          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 text-xs font-black cursor-pointer">
                            <Eye size={16} /> <span>التفاصيل</span>
                          </button>
                          <button 
                            onClick={() => toggleBan(user.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-xs font-black cursor-pointer ${
                              user.isBanned 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                              : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                            }`}
                          >
                            {user.isBanned ? <Unlock size={16} /> : <Ban size={16} />}
                            <span>{user.isBanned ? "فك الحظر" : "حظر"}</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black italic shadow-inner">
                          <Lock size={14} /> <span>إجراءات مقيدة</span>
                        </div>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;