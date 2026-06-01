import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { ArrowRight, User, Calendar, Phone, Tag, Mail, Save, Maximize2, Users, CheckCircle2, Info, MailIcon } from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import Swal from 'sweetalert2';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const ReportDetailsMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId } = location.state || {};
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null); // سيكون هذا النص الآن
  const [updating, setUpdating] = useState(false);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);

  // --- إضافات فرق العمل ---
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_KEY
  });

  const loadData = useCallback(async () => {
    if (!reportId) return navigate('/Reports');
    try {
      setLoading(true);
      // جلب بيانات البلاغ
      const resReport = await ApiAuthToken.get(`/Admin/report/${reportId}`);
      const data = resReport.data?.data || resReport.data;
      setReport(data);
      
      // ✅ تعديل: تخزين النص مباشرة بدلاً من الرقم
      setSelectedStatus(data.status || 'Pending');

      // جلب فرق العمل
      const resTeams = await ApiAuthToken.get('/Admin/all-teams');
      setTeams(resTeams.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [reportId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  // دالة تحويل البلاغ لفريق
  const handleAssignTeam = async () => {
    if (!selectedTeamId) return;
    setAssigning(true);
    try {
      await ApiAuthToken.post('/Admin/assign-report', {
        reportId: parseInt(reportId),
        teamId: selectedTeamId
      });
      
      // ✅ بعد الإسناد، تحديث حالة البلاغ محلياً إلى Assigned
      setReport(prev => ({ ...prev, status: 'Assigned' }));
      setSelectedStatus('Assigned');
      
      Swal.fire({
        icon: 'success',
        title: 'تم إسناد البلاغ للفريق بنجاح',
        background: '#0f121a',
        color: '#fff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'فشل عملية الإسناد', background: '#0f121a', color: '#fff' });
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      // ✅ تعديل: إرسال النص مباشرة (Pending, InProgress, Resolved, Rejected)
      await ApiAuthToken.patch(`/Admin/change-status/${reportId}`, { 
        newStatus: selectedStatus 
      });
      
      // ✅ تحديث الحالة محلياً
      setReport(prev => ({ ...prev, status: selectedStatus }));
      
      Swal.fire({ 
        icon: 'success', 
        title: 'تم التحديث بنجاح', 
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 2000 
      });
    } catch (err) {
      console.error('Update error:', err);
      Swal.fire({ icon: 'error', title: 'فشل التحديث' });
    } finally { 
      setUpdating(false); 
    }
  };

  // ✅ دالة مساعدة للحصول على لون الزر بناءً على الحالة
  const getButtonClass = (statusValue, label) => {
    const isSelected = selectedStatus === statusValue;
    const baseClass = "py-2.5 rounded-lg text-[11px] font-black transition-all border ";
    
    if (isSelected) {
      switch(statusValue) {
        case 'InProgress': return baseClass + "bg-blue-600 border-blue-400 text-white shadow-lg";
        case 'Resolved': return baseClass + "bg-emerald-600 border-emerald-400 text-white shadow-lg";
        case 'Rejected': return baseClass + "bg-red-600 border-red-400 text-white shadow-lg";
        case 'Pending': return baseClass + "bg-amber-600 border-amber-400 text-white shadow-lg";
        case 'Assigned': return baseClass + "bg-purple-600 border-purple-400 text-white shadow-lg";
        default: return baseClass + "bg-gray-600 border-gray-400 text-white shadow-lg";
      }
    }
    return baseClass + "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10";
  };

  if (!isLoaded || loading) return <div className="fixed inset-0 bg-[#0f121a] z-[999] flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>;

  return (
    <div className="fixed top-[70px] bottom-0 left-0 right-[260px] bg-black flex overflow-hidden z-10 font-sans" dir="rtl">
      
      {/* موديل الصورة */}
      {isImgModalOpen && (
        <div className="fixed inset-0 left-0 right-0 top-0 bottom-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-3xl" onClick={() => setIsImgModalOpen(false)}>
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <img src={report?.imageUrl} className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/10" alt="Full" />
          </div>
        </div>
      )}

      {/* الجانب الأيمن - لوحة البيانات */}
      <aside className="w-[440px] h-full bg-[#0f121a] border-l border-white/5 flex flex-col shadow-2xl relative z-20">
        <div className="relative h-48 shrink-0 overflow-hidden group">
          <img src={report?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Incident" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f121a] via-transparent to-transparent"></div>
          <button onClick={() => setIsImgModalOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 className="text-white" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <header>
            <h1 className="text-xl font-bold text-white leading-tight break-words">{report?.title}</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase mt-2 flex items-center gap-2">
              <Tag size={12}/> {report?.categoryName}
            </p>
          </header>

          {/* معلومات المُبلغ */}
          <div className="grid grid-cols-2 gap-3">
             {[
               { icon: <User size={14}/>, label: "المُبلغ", value: report?.citizenName, color: "text-blue-400" },
               { icon: <Calendar size={14}/>, label: "التاريخ", value: new Date(report?.createdAt).toLocaleDateString('ar-PS'), color: "text-amber-400" },
               { icon: <Phone size={14}/>, label: "الهاتف", value: report?.citizenPhone, color: "text-emerald-400" },
               { icon: <MailIcon size={14}/>, label: "البريد الإلكتروني", value: report?.citizenEmail, color: "text-emerald-400" }
             ].map((item, i) => (
               <div key={i} className="bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                 <div className={`flex items-center gap-2 ${item.color} mb-1`}>{item.icon} <span className="text-[10px] text-white/50 font-black uppercase">{item.label}</span></div>
                 <p className="text-[12px] font-bold text-slate-200 truncate">{item.value || '---'}</p>
               </div>
             ))}
          </div>

          {/* عرض الفريق المسند إليه (إذا موجود) */}
          {report?.assignedTeamId && (
            <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
              <p className="text-[11px] text-purple-400 font-black uppercase mb-1 flex items-center gap-2">
                <Users size={14} /> مسند إلى فريق
              </p>
              <p className="text-sm text-white font-bold">ID: {report.assignedTeamId}</p>
            </div>
          )}

          {/* تفاصيل المشكلة */}
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
            <p className="text-[12px] text-white/70 font-black uppercase mb-2">الوصف</p>
            <p className="text-xs text-white/90 leading-relaxed italic">"{report?.description}"</p>
          </div>

          {/* قسم تحويل البلاغ لفريق عمل */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-[13px] text-emerald-400 font-black uppercase mb-3 flex items-center gap-2">
              <Users size={16} /> إسناد البلاغ لفريق ميداني
            </p>
            <div className="flex gap-2">
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0f121a]">اختر فريق العمل المناسب...</option>
                {teams
                  .filter(t => t.teamStatus === "Available" || t.teamStatus === "OnMission")
                  .map(team => (
                    <option key={team.id} value={team.id} className="bg-[#0f121a]">
                      {team.fullName} - ({team.specialization})
                      {team.teamStatus === "OnMission" ? " 🔴 (في مهمة حالياً)" : ""}
                    </option>
                  ))}
              </select>
              <button 
                onClick={handleAssignTeam}
                disabled={!selectedTeamId || assigning || report?.status === 'Resolved' || report?.status === 'Rejected'}
                style={{cursor:"pointer"}}
                className="bg-emerald-600 text-white px-4 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center"
              >
                {assigning ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle2 size={20} />}
              </button>
            </div>
            <p className="text-[13px] text-white/70 uppercase mb-3 mt-3 flex items-center gap-2">
              <Info size={16} /> في حالة اسناد المهمة لفريق معين سيقوم النظام بتحديث حالة البلاغ تلقائيا
            </p>
            {selectedTeamId && (
              <p className="text-[10px] text-white/70 mt-2 px-1 italic">سيتم إرسال تفاصيل البلاغ والموقع الجغرافي للفريق فور الإسناد.</p>
            )}
          </div>

          {/* تحديث الحالة */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="text-[13px] text-white font-black uppercase text-center tracking-widest">تحديث الحالة للبلاغ</p>
            <p className="text-[11px] text-white/50 font-black uppercase text-center tracking-widest">يتم التحديث يدوياً في حالة عدم الحاجة لفريق عمل</p>

            <div className="grid grid-cols-5 gap-1.5">
              {/* ✅ استخدام القيم النصية بدلاً من الأرقام */}
              <button 
                onClick={() => setSelectedStatus('Pending')} 
                className={getButtonClass('Pending', 'انتظار')}
              >
                انتظار
              </button>
              <button 
                onClick={() => setSelectedStatus('Assigned')} 
                className={getButtonClass('Assigned', 'مسند')}
              >
                مسند
              </button>
              <button 
                onClick={() => setSelectedStatus('InProgress')} 
                className={getButtonClass('InProgress', 'قيد العمل')}
              >
                قيد العمل
              </button>
              <button 
                onClick={() => setSelectedStatus('Resolved')} 
                className={getButtonClass('Resolved', 'مُنجز')}
              >
                مُنجز
              </button>
              <button 
                onClick={() => setSelectedStatus('Rejected')} 
                className={getButtonClass('Rejected', 'مرفوض')}
              >
                مرفوض
              </button>
            </div>
            
            <button 
              onClick={handleUpdateStatus} 
              disabled={updating}
              className="w-full bg-white text-black py-3.5 rounded-xl flex items-center justify-center gap-2 font-black text-xs hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
            >
              {updating ? "جاري الحفظ..." : <><Save size={16}/> حفظ حالة البلاغ</>}
            </button>
          </div>
        </div>

        {/* اتصال سريع */}
        <div className="p-6 bg-[#0f121a] border-t border-white/5">
          <a href={`tel:${report?.citizenPhone}`} className="w-full bg-slate-800 text-white py-3.5 rounded-xl flex items-center justify-center gap-3 font-black text-[11px] hover:bg-emerald-600 transition-all border border-white/5">
            <Phone size={16} /> اتصال سريع بالمُبلغ
          </a>
        </div>
      </aside>

      {/* الجانب الأيسر - الخريطة */}
      <div className="flex-1 relative h-full">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={{ lat: parseFloat(report?.latitude) || 32.22, lng: parseFloat(report?.longitude) || 35.22 }} 
          zoom={18}
          options={{ mapTypeId: 'satellite', disableDefaultUI: true, tilt: 45 }}
        >
          <MarkerF position={{ lat: parseFloat(report?.latitude), lng: parseFloat(report?.longitude) }} />
        </GoogleMap>
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-emerald-600 transition-all z-20 group"
        >
          <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ReportDetailsMap;