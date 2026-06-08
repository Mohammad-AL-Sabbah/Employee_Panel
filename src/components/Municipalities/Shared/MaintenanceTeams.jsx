/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { 
  Users, Wrench, CheckCircle2, Clock, 
  MapPin, Phone, ChevronLeft, Search, 
  Plus, Activity, X, ShieldCheck, Loader2,
  Mail, Lock, Trash2, ClipboardList, RefreshCw, Link2Off,
  MessageSquare, Send
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

// استيراد Firebase
import { db } from '../../../utils/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

export default function MaintenanceTeams() {
  const [activeTab, setActiveTab] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); 
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [assignedReports, setAssignedReports] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  // --- حالات الشات المباشر (للويب) ---
  const [activeChatTeam, setActiveChatTeam] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputChatMessage, setInputChatMessage] = useState("");
  const messagesEndRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    teamStatus: 'متاح',
    currentLocationName: '',
    phoneNumber: '',
    city: '',
    street: ''
  });

  // التمرير التلقائي لأسفل الشات
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // text-slate-400 الاستماع لرسائل Firebase عند اختيار فريق
  useEffect(() => {
    if (!activeChatTeam) return;

    const chatId = `MaintenanceChat_${activeChatTeam.id}`;
    
    const q = query(
      collection(db, "Chats", chatId, "Messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // تجنب الـ null المؤقت للـ serverTimestamp محلياً
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
        };
      });
      setChatMessages(msgs);
    }, (err) => {
      console.error("Firebase Chat Error:", err);
    });

    return () => unsubscribe();
  }, [activeChatTeam]);

  // إرسال رسالة من لوحة التحكم (الويب)
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!inputChatMessage.trim() || !activeChatTeam) return;

    const messageText = inputChatMessage.trim();
    setInputChatMessage("");
    
    const chatId = `MaintenanceChat_${activeChatTeam.id}`;

    try {
      await addDoc(collection(db, "Chats", chatId, "Messages"), {
        text: messageText,
        senderId: "HQ_Admin", // معرف ثابت لغرفة العمليات
        senderName: "غرفة العمليات - الصيانة", 
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await ApiAuthToken.get('/Admin/all-teams');
      if (response.data && Array.isArray(response.data)) {
        const formattedTeams = response.data.map(team => ({
          id: team.id,
          name: team.specialization || "فريق صيانة",
          leader: team.fullName,
          status: translateStatus(team.teamStatus),
          location: team.currentLocationName,
          phoneNumber: team.phoneNumber,
          city: team.city || '',
          street: team.street || '',
          tasks: 0,
          email: team.email || '',
        }));
        setTeams(formattedTeams);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const fetchAssignedReports = async (teamId) => {
    setLoadingReports(true);
    try {
      const response = await ApiAuthToken.get(`/Admin/maintenance-team/${teamId}/assigned-reports`);
      if (response.data) {
        setAssignedReports(response.data);
      }
    } catch (err) {
      console.error("Error fetching assigned reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleUnassignReports = async (teamId) => {
    if (window.confirm("هل أنت متأكد من فك ارتباط جميع البلاغات المسندة لهذا الفريق وإعادتها لحالة الانتظار؟")) {
      setActionLoading(true);
      try {
        const response = await ApiAuthToken.patch(`/Admin/maintenance-team/${teamId}/unassign-reports`);
        if (response.status === 200) {
          alert(response.data.message || "تم فك ارتباط البلاغات بنجاح.");
          setAssignedReports([]);
          fetchTeams();
        }
      } catch (err) {
        console.error("Error unassigning reports:", err);
        const msg = err.response?.data?.message || "حدث خطأ أثناء فك ارتباط البلاغات";
        alert(msg);
      } finally  {
        setActionLoading(false);
      }
    }
  };

  const handleUnassignSingleReport = async (reportId) => {
    if (window.confirm(`هل أنت متأكد من فك ارتباط البلاغ رقم #${reportId} فقط عن هذا الفريق؟`)) {
      setActionLoading(true);
      try {
        const response = await ApiAuthToken.patch(`/Admin/maintenance-team/unassign-single-report/${reportId}`);
        if (response.status === 200) {
          alert(response.data.message || "تم فك ارتباط البلاغ بنجاح.");
          setAssignedReports(prev => prev.filter(report => report.id !== reportId));
          fetchTeams(); 
        }
      } catch (err) {
        console.error("Error unassigning single report:", err);
        const msg = err.response?.data?.message || "حدث خطأ أثناء فك ارتباط البلاغ الفردي";
        alert(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'Available': return 'متاح';
      case 'OnMission': return 'في مهمة';
      case 'Unavailable': return 'غير متاح';
      default: return 'متاح';
    }
  };

  const translateStatusToEn = (status) => {
    switch (status) {
      case 'متاح': return 'Available';
      case 'في مهمة': return 'OnMission';
      case 'غير متاح': return 'Unavailable';
      default: return 'Available';
    }
  };

const handleAddTeam = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const newTeam = {
        teamLeaderName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        specialization: formData.specialization,
        currentLocationName: formData.currentLocationName,
        city: formData.city,
        street: formData.street
      };

      const response = await ApiAuthToken.post('/Admin/add-maintenance-team', newTeam);
      if (response.status === 200 || response.status === 201) {
        fetchTeams();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (err) {
      console.error("Validation Errors:", err.response?.data?.errors);
      const errorMsg = err.response?.data?.message || "حدث خطأ، تأكد من ملء جميع الحقول بشكل صحيح";
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

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
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        street: formData.street
      };

      const response = await ApiAuthToken.put(`/Admin/update-team/${selectedTeam.id}`, updatedTeam);
      if (response.status === 200) {
        fetchTeams();
        setIsEditModalOpen(false);
        resetForm();
      }
    } catch (err) {
      alert("حدث خطأ أثناء التعديل");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async (id, teamName) => {
    if (window.confirm(`تنبيه خطير: سيتم حذف الفريق "${teamName}" وحساب البريد الإلكتروني الخاص به نهائياً. هل تريد الاستمرار؟`)) {
      setActionLoading(true);
      try {
        const response = await ApiAuthToken.delete(`/Admin/hard-delete-maintenanceteam/${id}`);
        if (response.status === 200) {
          fetchTeams();
          setIsEditModalOpen(false);
          resetForm();
        }
      } catch (err) {
        console.error("Delete Error:", err);
        const msg = err.response?.data?.message || "حدث خطأ أثناء الحذف النهائي";
        alert(msg);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const openEditModal = (team) => {
    setSelectedTeam(team);
    setFormData({
      fullName: team.leader || '',
      specialization: team.name || '',
      teamStatus: team.status || 'متاح',
      currentLocationName: team.location || '',
      phoneNumber: team.phoneNumber || '',
      city: team.city || '',
      street: team.street || '',
      email: team.email || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (team) => {
    setSelectedTeam(team);
    setAssignedReports([]);
    setIsDetailsModalOpen(true);
    fetchAssignedReports(team.id);
  };

  const resetForm = () => {
    setFormData({ 
      fullName: '', email: '', password: '', specialization: '', 
      teamStatus: 'متاح', currentLocationName: '', phoneNumber: '',
      city: '', street: '' 
    });
  };

  useEffect(() => {
    document.title = "فرق الصيانة | P.S.R.S";
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchTeams();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const filteredTeams = teams.filter(team => {
    const matchesTab = activeTab === 'الكل' || team.status === activeTab;
    return matchesTab && (team.name.toLowerCase().includes(searchQuery.toLowerCase()) || team.leader.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const stats = {
    available: teams.filter(t => t.status === 'متاح').length,
    onMission: teams.filter(t => t.status === 'في مهمة').length,
    unavailable: teams.filter(t => t.status === 'غير متاح').length
  };

  const getStatusTheme = (status) => {
    switch (status) {
      case 'متاح': return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
      case 'في مهمة': return { bg: 'bg-blue-50', text: 'text-blue-600' };
      case 'غير متاح': return { bg: 'bg-rose-50', text: 'text-rose-600' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500' };
    }
  };

  if (loading) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><Loader2 size={48} className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 relative" dir="rtl">
      
      {/* Modal: تسجيل قوة ميدانية جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-500" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="relative bg-slate-900 px-10 py-12 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2">تسجيل فرق صيانة ميدانية</h2>
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-[0.2em]">إضافة وحدة صيانة جديدة للنظام</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transition-all cursor-pointer group">
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddTeam} className="p-10 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-slate-800 font-black text-lg">بيانات الاعتماد الرقمية</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">البريد المؤسسي</label>
                      <div className="relative">
                        <Mail className="absolute right-4 top-3.5 text-slate-300" size={18} />
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="team@psrs.ps" className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white pr-12 pl-4 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">كلمة المرور المؤقتة</label>
                      <div className="relative">
                        <Lock className="absolute right-4 top-3.5 text-slate-300" size={18} />
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white pr-12 pl-4 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h3 className="text-slate-800 font-black text-lg">الهوية المهنية والموقع</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">اسم مسؤول القوة الميدانية</label>
                      <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} placeholder="الاسم الكامل للمسوؤل" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">التخصص الفني</label>
                      <input type="text" required value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} placeholder="مثال: هندسة طرق" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">منطقة التمركز (الحالية)</label>
                      <input type="text" required value={formData.currentLocationName} onChange={(e) => setFormData({...formData, currentLocationName: e.target.value})} placeholder="الحي أو القطاع الحالي" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">المحافظة / المدينة</label>
                      <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="مثال: نابلس" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">الشارع / العنوان الجغرافي</label>
                      <input type="text" required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} placeholder="مثال: شارع رفيديا" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase mr-2">رقم التواصل السريع</label>
                      <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="05xxxxxxxx" className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white px-5 py-3.5 rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm" />
                    </div>
                  </div>
                </section>

                <button type="submit" disabled={actionLoading} className="group relative w-full h-16 bg-slate-900 text-white rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-70">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center gap-3 font-black text-lg tracking-wide">
                    {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} className="text-emerald-400 group-hover:text-white transition-colors" /><span>تفعيل القوة في النظام</span></>}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة التعديل */}
      {isEditModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Wrench size={20} /></div>
                  <h2 className="text-xl font-black text-slate-800">تعديل بيانات الفريق</h2>
                </div>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 mr-2">اسم المسؤول</label>
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 mr-2">التخصص</label>
                  <input type="text" required value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 mr-2">الحالة الحالية</label>
                  <select value={formData.teamStatus} onChange={(e) => setFormData({...formData, teamStatus: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer">
                    <option value="متاح">متاح</option>
                    <option value="في مهمة">في مهمة</option>
                    <option value="غير متاح">غير متاح</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 mr-2">التمركز الحالي</label>
                  <input type="text" required value={formData.currentLocationName} onChange={(e) => setFormData({...formData, currentLocationName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 mr-2">المحافظة</label>
                    <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 mr-2">الشارع</label>
                    <input type="text" required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 mr-2">رقم الهاتف</label>
                  <input type="tel" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button 
                    type="button" 
                    onClick={() => handleDeleteTeam(selectedTeam.id, selectedTeam.name)} 
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 px-6 bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    حذف نهائي
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={actionLoading} 
                    className="flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />} 
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل البلاغات المسندة وإدارتها */}
      {isDetailsModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ClipboardList className="text-emerald-400" size={24} />
                <div>
                  <h2 className="text-lg font-black">بلاغات ومهام: {selectedTeam.leader}</h2>
                  <p className="text-xs text-slate-400">تخصص: {selectedTeam.name}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 cursor-pointer"><X size={20} /></button>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-700 text-sm">قائمة المهام الحالية الموكلة للفريق ({assignedReports.length})</h3>
                {assignedReports.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => handleUnassignReports(selectedTeam.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    فك ارتباط جميع البلاغات
                  </button>
                )}
              </div>

              {loadingReports ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={36} className="animate-spin text-emerald-500 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">جاري سحب البلاغات من الخادم...</p>
                </div>
              ) : assignedReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-slate-500 font-bold text-sm">سجل نظيف! لا يوجد بلاغات لهذا الفريق حالياً.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedReports.map((report) => (
                    <div key={report.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-md transition-all">
                      <div className="text-right flex-1">
                        <h4 className="font-bold text-slate-800 text-sm mb-1">#{report.id} - {report.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mb-2">{report.description}</p>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                          <span className="bg-slate-200/60 px-2 py-0.5 rounded">{report.categoryName}</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {report.latitude?.toFixed(4) || '0.0000'}, {report.longitude?.toFixed(4) || '0.0000'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 font-black text-[10px] rounded-lg">
                          {report.status}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleUnassignSingleReport(report.id)}
                          disabled={actionLoading}
                          title="فك ارتباط هذا البلاغ فقط"
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all cursor-pointer opacity-100 disabled:opacity-50"
                        >
                          <Link2Off size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button type="button" onClick={() => setIsDetailsModalOpen(false)} className="px-6 py-2.5 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ مودال المحادثة الفورية (Chat Modal) - مخصص للويب */}
      {activeChatTeam && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-slate-800 w-full max-w-xl h-[600px] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-modal">
            
            {/* هيدر المودال */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-white">{activeChatTeam.leader || activeChatTeam.name}</h3>
                  <p className="text-xs text-slate-500">فريق صيانة • تواصل مباشر</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatTeam(null)} 
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* منطقة عرض الرسائل */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar bg-black/40">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                    لا توجد رسائل سابقة مع هذا الفريق. ابدأ التوجيه والإشراف على المهام الميدانية.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isHQ = msg.senderId === "HQ_Admin";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isHQ ? 'items-start' : 'items-end'}`}>
                      <span className="text-[10px] text-slate-600 mb-1 px-1">
                        {isHQ ? "غرفة العمليات - الصيانة" : (msg.senderName || "الفريق الميداني")}
                      </span>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md font-medium ${isHQ ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* حقل الإرسال الأسفل */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-800 bg-[#0b0b0b] flex gap-3 items-center">
              <input 
                type="text" 
                value={inputChatMessage}
                onChange={(e) => setInputChatMessage(e.target.value)}
                placeholder="اكتب توجيهات غرفة العمليات هنا..."
                className="flex-1 bg-black border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-emerald-500 outline-none text-white transition-all placeholder:text-slate-600"
              />
              <button 
                type="submit"
                disabled={!inputChatMessage.trim()}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${inputChatMessage.trim() ? 'bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}`}
              >
                <Send size={18} className="transform rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* الرأس والناف بار */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Activity size={24} /></div>
            <div><h1 className="text-xl font-black text-slate-800">إدارة القوى الميدانية</h1><p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-right">نظام PSRS المركزي</p></div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80"><Search className="absolute right-4 top-2.5 text-slate-400" size={18} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن تخصص أو مسؤول..." className="w-full pr-12 pl-4 py-2.5 rounded-xl border-none bg-slate-100 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-medium" /></div>
            <button type="button" onClick={() => {resetForm(); setIsModalOpen(true);}} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2 text-sm font-bold cursor-pointer"><Plus size={18} /> إضافة فريق</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto mt-8 px-6">
        {/* صناديق الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatBox icon={CheckCircle2} label="متاح" value={stats.available} color="text-emerald-600" bg="bg-emerald-50" />
          <StatBox icon={Clock} label="في مهمة" value={stats.onMission} color="text-amber-600" bg="bg-amber-50" />
          <StatBox icon={Users} label="غير متاح" value={stats.unavailable} color="text-slate-600" bg="bg-slate-100" />
        </div>

        {/* التبويبات */}
        <div className="flex gap-8 mb-6 border-b border-slate-200 pb-1">
          {['الكل', 'متاح', 'في مهمة', 'غير متاح'].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 right-0 left-0 h-1 bg-emerald-600 rounded-full" />}
            </button>
          ))}
        </div>

        {/* عرض البطاقات */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100"><Wrench size={48} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-400 font-bold">لا توجد نتائج بحث</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const theme = getStatusTheme(team.status);
              return (
                <div key={team.id} className="bg-white border border-slate-200 rounded-[1.5rem] p-5 hover:shadow-xl transition-all group animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}><Wrench size={20} /></div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}>{team.status}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">التخصص: {team.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4 font-medium">
                    <MapPin size={12} /> الموقع: {team.city || 'غير محدد'} - {team.street || 'غير محدد'} ({team.location || 'لا يوجد تمركز'})
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4 font-medium">
                    البريد الإلكتروني : {team.email}
                  </div>

                  <div className="mb-4">
                    <button 
                      type="button"
                      onClick={() => openDetailsModal(team)}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200/60 transition-all cursor-pointer"
                    >
                      <ClipboardList size={14} className="text-emerald-500" />
                      عرض التفاصيل وحالة المهام
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase">المسؤول</span><span className="text-sm font-bold text-slate-700">{team.leader}</span></div>
                    <div className="flex gap-2">
                      {/* زر الشات المباشر - يفتح مودال المحادثة */}
                      <button 
                        type="button"
                        onClick={() => setActiveChatTeam(team)} 
                        title="فتح محادثة فورية مع الفريق"
                        className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button type="button" onClick={() => openEditModal(team)} className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold cursor-pointer">تعديل <ChevronLeft size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* إضافة ستايل الـ animate-modal */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-modal {
          animation: modalFadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

const StatBox = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:scale-[1.02] cursor-pointer">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}><Icon size={24} /></div>
    <div className="text-right">
      <div className="text-xl font-black text-slate-800">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);