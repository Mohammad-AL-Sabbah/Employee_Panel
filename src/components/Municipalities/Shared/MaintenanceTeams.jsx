/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { 
  Users, Wrench, CheckCircle2, Clock, 
  MapPin, Phone, ChevronLeft, Search, 
  Filter, Plus, Activity, X, UserPlus, ShieldCheck, Loader2
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

export default function MaintenanceTeams() {
  const [activeTab, setActiveTab] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // حالة النموذج للإضافة والتعديل
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    teamStatus: 'Available',
    currentLocationName: '',
    phoneNumber: ''
  });

  // جلب الفرق من الـ API
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get('/Admin/all-teams');
      console.log("Teams API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // تحويل البيانات إلى الصيغة المطلوبة
        const formattedTeams = response.data.map(team => ({
          id: team.id,
          name: team.specialization || "فريق صيانة",
          leader: team.fullName,
          status: translateStatus(team.teamStatus),
          location: team.currentLocationName,
          phoneNumber: team.phoneNumber,
          tasks: 0, // سيتم إضافته لاحقاً من الـ API
          workload: 0 // سيتم إضافته لاحقاً من الـ API
        }));
        setTeams(formattedTeams);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  // ترجمة حالة الفريق
  const translateStatus = (status) => {
    switch (status) {
      case 'Available': return 'متاح';
      case 'Busy': return 'مشغول';
      case 'OnMission': return 'في مهمة';
      default: return 'متاح';
    }
  };

  // ترجمة الحالة من العربية إلى الإنجليزية
  const translateStatusToEn = (status) => {
    switch (status) {
      case 'متاح': return 'Available';
      case 'مشغول': return 'Busy';
      case 'في مهمة': return 'OnMission';
      default: return 'Available';
    }
  };

  // إضافة فريق جديد
  const handleAddTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newTeam = {
        fullName: formData.fullName,
        specialization: formData.specialization,
        teamStatus: translateStatusToEn(formData.teamStatus),
        currentLocationName: formData.currentLocationName,
        phoneNumber: formData.phoneNumber
      };
      
      const response = await ApiAuthToken.post('/Admin/add-team', newTeam);
      
      if (response.status === 200 || response.status === 201) {
        fetchTeams();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Error adding team:", err);
      alert("حدث خطأ أثناء إضافة الفريق");
    } finally {
      setActionLoading(false);
    }
  };

  // تعديل فريق
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const updatedTeam = {
        id: selectedTeam.id,
        fullName: formData.fullName,
        specialization: formData.specialization,
        teamStatus: translateStatusToEn(formData.teamStatus),
        currentLocationName: formData.currentLocationName,
        phoneNumber: formData.phoneNumber
      };
      
      const response = await ApiAuthToken.put(`/Admin/update-team/${selectedTeam.id}`, updatedTeam);
      
      if (response.status === 200) {
        fetchTeams();
        setIsEditModalOpen(false);
        resetForm();
        setSelectedTeam(null);
      }
    } catch (err) {
      console.error("Error updating team:", err);
      alert("حدث خطأ أثناء تعديل الفريق");
    } finally {
      setActionLoading(false);
    }
  };

  // حذف فريق
  const handleDeleteTeam = async (id, teamName) => {
    if (window.confirm(`هل أنت متأكد من حذف الفريق "${teamName}"؟`)) {
      try {
        const response = await ApiAuthToken.delete(`/Admin/delete-team/${id}`);
        if (response.status === 200) {
          fetchTeams();
        }
      } catch (err) {
        console.error("Error deleting team:", err);
        alert("حدث خطأ أثناء حذف الفريق");
      }
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({
      fullName: team.leader,
      specialization: team.name,
      teamStatus: team.status,
      currentLocationName: team.location,
      phoneNumber: team.phoneNumber || ''
    });
    setIsEditModalOpen(true);
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      fullName: '',
      specialization: '',
      teamStatus: 'متاح',
      currentLocationName: '',
      phoneNumber: ''
    });
  };

  // فتح نافذة الإضافة
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  useEffect(() => {
    document.title = "فرق الصيانة | P.S.R.S";
    fetchTeams();
  }, []);

  // منطق الفلترة
  const filteredTeams = teams.filter(team => {
    const matchesTab = activeTab === 'الكل' || team.status === activeTab;
    const matchesSearch = 
      team.name.includes(searchQuery) || 
      team.leader.includes(searchQuery) || 
      team.location.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  // إحصائيات
  const stats = {
    available: teams.filter(t => t.status === 'متاح').length,
    onMission: teams.filter(t => t.status === 'في مهمة').length,
    busy: teams.filter(t => t.status === 'مشغول').length,
    totalStaff: teams.length * 4, // تقديري - سيتم تعديله حسب الـ API
    completedReports: 142 // سيتم تعديله حسب الـ API
  };

  // دالة الحصول على لون الحالة
  const getStatusTheme = (status) => {
    switch (status) {
      case 'متاح': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'في مهمة': return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'مشغول': return { bg: 'bg-rose-50', text: 'text-rose-600' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 relative" dir="rtl">
      
      {/* نافذة إضافة فريق جديد */}
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
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">اسم قائد الفريق</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="الاسم الرباعي" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">التخصص</label>
                  <input 
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="مثلاً: كهرباء، مياه، طرق" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
          
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">منطقة التواجد</label>
                  <input 
                    type="text"
                    required
                    value={formData.currentLocationName}
                    onChange={(e) => setFormData({...formData, currentLocationName: e.target.value})}
                    placeholder="اسم المركز أو النقطة" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">رقم الهاتف</label>
                  <input 
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="059xxxxxxx" 
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                  {actionLoading ? "جاري الإضافة..." : "تثبيت الفريق في النظام"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل فريق */}
      {isEditModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">تعديل بيانات الفريق</h2>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">اسم قائد الفريق</label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">التخصص</label>
                  <input 
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">حالة الفريق</label>
                  <select 
                    value={formData.teamStatus}
                    onChange={(e) => setFormData({...formData, teamStatus: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer"
                  >
                    <option value="متاح">متاح</option>
                    <option value="في مهمة">في مهمة</option>
                    <option value="مشغول">مشغول</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">منطقة التواجد</label>
                  <input 
                    type="text"
                    required
                    value={formData.currentLocationName}
                    onChange={(e) => setFormData({...formData, currentLocationName: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase mr-1">رقم الهاتف</label>
                  <input 
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)}
                    className="flex-1 bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    حذف الفريق
                  </button>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                    {actionLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
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
            <button 
              onClick={openAddModal}
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
            value={stats.available} 
            color="text-emerald-600" bg="bg-emerald-50" 
          />
          <StatBox 
            icon={Clock} label="في مهمة" 
            value={stats.onMission} 
            color="text-amber-600" bg="bg-amber-50" 
          />
          <StatBox 
            icon={Users} label="الفنيين" 
            value={stats.totalStaff} 
            color="text-slate-600" bg="bg-slate-100" 
          />
          <StatBox 
            icon={Wrench} label="بلاغات منجزة" 
            value={stats.completedReports} 
            color="text-blue-600" bg="bg-blue-50" 
          />
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
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Wrench size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">لا توجد فرق صيانة مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const statusTheme = getStatusTheme(team.status);
              return (
                <div key={team.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${statusTheme.bg} ${statusTheme.text}`}>
                      <Wrench size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusTheme.bg} ${statusTheme.text}`}>
                      {team.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors tracking-tight">التخصص :  {team.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4 font-medium">
                    <MapPin size={12} />
                     الموقع الأساسي : {team.location}
                  </div>
                  
                  {/* نسبة العمل - مؤقتة حتى يتم إضافتها في الـ API */}
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
                      <button 
                        onClick={() => window.location.href = `tel:${team.phoneNumber}`}
                        className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm cursor-pointer"
                      >
                        <Phone size={16} />
                      </button>
                      <button 
                        onClick={() => openEditModal(team)}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold cursor-pointer"
                      >
                        تعديل <ChevronLeft size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// مكون صندوق الإحصائيات
const StatBox = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.02] cursor-pointer active:scale-95`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
      <Icon size={24} />
    </div>
    <div className="text-right">
      <div className={`text-xl font-black text-slate-800`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);