/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { 
  Users, Wrench, CheckCircle2, Clock, 
  MapPin, Phone, ChevronLeft, Search, 
  Filter, Plus, Activity, X, UserPlus, ShieldCheck
} from 'lucide-react';

export default function MaintenanceTeams() {
  const [activeTab, setActiveTab] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // حالة التحكم في النافذة المنبثقة


  const title = useEffect(() =>{
document.title = "فريق الصيانة | P.S.R.S";
  },[]);


  const [teams, setTeams] = useState([
    { id: 1, name: "فريق الشمال - كهرباء", leader: "م. محمد علي", status: "متاح", tasks: 3, location: "الموقع الحالي : نابلس البلد", workload: 60 },
    { id: 2, name: "فريق الشبكات - مياه", leader: "أ. خالد حسن", status: "في مهمة", tasks: 1, location: "الموقع الحالي : بلاطة المخيم", workload: 20 },
    { id: 3, name: "الصيانة الإنشائية", leader: "م. سامر سعيد", status: "متاح", tasks: 0, location: "الموقع الحالي : راس العين", workload: 0 },
    { id: 4, name: "فريق الطرق والجسور", leader: "م. يوسف أحمد", status: "مشغول", tasks: 5, location: "الموقع الحالي : حوارة", workload: 90 },
    { id: 5, name: "فريق الإنارة العامة", leader: "أ. هاني جابر", status: "متاح", tasks: 0, location: "الموقع الحالي : بيتا", workload: 0 },
    { id: 6, name: "فريق صيانة الصرف الصحي ", leader: "م. إياد طه", status: "في مهمة", tasks: 2, location: "الموقع الحالي : دير شرف", workload: 45 },
  ]);

  // منطق الفلترة
  const filteredTeams = teams.filter(team => {
    const matchesTab = activeTab === 'الكل' || team.status === activeTab;
    const matchesSearch = 
      team.name.includes(searchQuery) || 
      team.leader.includes(searchQuery) || 
      team.location.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 relative" dir="rtl">
      
      {/* --- نافذة إضافة فريق جديد (Modal) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">إضافة فريق ميداني</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">اسم الفريق</label>
                  <input type="text" placeholder="مثلاً: فريق صيانة الكهرباء" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">اسم المسؤول</label>
                    <input type="text" placeholder="الاسم الرباعي" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">التخصص</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer">
                      <option>كهرباء</option>
                      <option>مياه وصرف صحي</option>
                      <option>طرق وإنشاءات</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">منطقة التواجد</label>
                  <input type="text" placeholder="اسم المركز أو النقطة" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <button type="button" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4 flex items-center justify-center gap-2">
                  <ShieldCheck size={20} /> تثبيت الفريق في النظام
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">إدارة القوى الميدانية</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">نظام PSRS المركزي</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 font-medium">
              <Search className="absolute right-4 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم الفريق، القائد، أو المنطقة..." 
                className="w-full pr-12 pl-4 py-2.5 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm"
              />
            </div>
            {/* زر إضافة فريق جديد */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 text-sm font-bold cursor-pointer active:scale-95"
            >
              <Plus size={18} /> إضافة فريق
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-8 px-6">
        {/* شريط الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatBox 
            icon={CheckCircle2} label="جاهز" 
            value={teams.filter(t => t.status === 'متاح').length} 
            color="text-emerald-600" bg="bg-emerald-50" 
            
          />
          <StatBox 
            icon={Clock} label="في مهمة" 
            value={teams.filter(t => t.status === 'في مهمة').length} 
            color="text-amber-600" bg="bg-amber-50" 
          
          />
          <StatBox icon={Users} label="الفنيين" value="48" color="text-slate-600" bg="bg-slate-100" />
          <StatBox icon={Wrench} label="بلاغات منجزة" value="142" color="text-blue-600" bg="bg-blue-50" />
        </div>

        {/* التبويبات */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-1">
          <div className="flex gap-8">
            {['الكل', 'متاح', 'في مهمة', 'مشغول'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 right-0 left-0 h-1 bg-emerald-600 rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* قائمة الفرق */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* محتوى كرت الفريق - نفس الكود السابق */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${getStatusTheme(team.status).bg} ${getStatusTheme(team.status).text}`}>
                  <Wrench size={20} />
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusTheme(team.status).bg} ${getStatusTheme(team.status).text}`}>
                  {team.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors tracking-tight">{team.name}</h3>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4 font-medium">
                <MapPin size={12} />
                {team.location}
              </div>
              <div className="mb-5 bg-slate-50 p-3 rounded-xl cursor-default">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase">
                  <span>ضغط العمل</span>
                  <span>{team.workload}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-700 ${team.workload > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${team.workload}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">المسؤول</span>
                  <span className="text-sm font-bold text-slate-700">{team.leader}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm cursor-pointer">
                    <Phone size={16} />
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all text-xs font-bold cursor-pointer">
                    المهام <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const getStatusTheme = (status) => {
  switch (status) {
    case 'متاح': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
    case 'في مهمة': return { bg: 'bg-blue-50', text: 'text-blue-600' };
    case 'مشغول': return { bg: 'bg-rose-50', text: 'text-rose-600' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-500' };
  }
};

const StatBox = ({ icon: Icon, label, value, color, bg, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.02] cursor-pointer active:scale-95`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div className="text-right">
      <div className={`text-xl font-black text-slate-800`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);