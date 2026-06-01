/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { 
  ArrowRight, User, Calendar, Phone, Tag, Mail, Save, 
  Maximize2, Users, CheckCircle2, Info, Layers, Shield, 
  Ambulance, Flame, AlertTriangle, Fingerprint ,
  Loader2, Activity, Pill, Heart, X, Eye
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import Swal from 'sweetalert2';
import { useGoogleMapsLoader } from '../../../components/Emergency/components/useGoogleMapsLoader';

// ==========================================
// 🔥 مَوْدال السجل الطبي الموحد للمواطن
// ==========================================
const CitizenMedicalModal = ({ isOpen, onClose, citizenId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !citizenId) return;

    const fetchPatientMedicalData = async () => {
      try {
        setLoading(true);
        const response = await ApiAuthToken.get(`/emergency-employee/medical-history/${citizenId}`);
        const targetPatient = response.data;
        
        if (targetPatient) {
          const parseMetaList = (str) => {
            if (!str || str.trim() === "" || str === "string" || str === "None") return [];
            return str.split(/[،,]+/).map(item => item.trim());
          };

          setPatient({
            name: targetPatient.fullName || "مواطن مجهول الاسم",
            age: targetPatient.age || "غير مسجل",
            bloodType: targetPatient.bloodType || "غير معروف",
            allergies: parseMetaList(targetPatient.allergies),
            chronicDiseases: parseMetaList(targetPatient.chronicDiseases),
            recentMedications: parseMetaList(targetPatient.currentMedications),
            emergencyContacts: targetPatient.emergencyContacts || [],
            profilePictureUrl: targetPatient.profilePictureUrl
          });
        } else {
          setPatient(null);
        }
      } catch (error) {
        console.error("Error fetching medical record for modal:", error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientMedicalData();
  }, [isOpen, citizenId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-3xl bg-[#0a0a0a] border border-slate-800 p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 overflow-y-auto max-h-[90vh] hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button onClick={onClose} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors cursor-pointer">
          <X size={20} />
        </button>

        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-xs text-slate-500 font-bold">جاري مراجعة وتأمين قيود السجلات الحية...</span>
          </div>
        ) : !patient ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 gap-2">
            <AlertTriangle size={24} className="text-amber-500" />
            <span className="text-xs font-bold">عذراً، لم يتم العثور على سجل طبي موحد مطابق لهذا الرقم في النظام.</span>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-900 pb-6">
              <div className="w-20 h-20 bg-blue-600/10 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner overflow-hidden flex-shrink-0">
                {patient.profilePictureUrl ? (
                  <img src={patient.profilePictureUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <User size={38} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{patient.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-bold font-mono">العمر: {patient.age} عاماً</span>
                  <span className="text-[9px] bg-red-600/10 border border-red-500/20 px-2.5 py-1 rounded-full text-red-500 font-bold uppercase tracking-widest">فصيلة الدم الموثقة: {patient.bloodType}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-950/10 border border-red-500/20 p-5 rounded-xl">
                <h3 className="text-red-500 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest"><AlertTriangle size={14}/> الحساسية الدوائية والغذائية</h3>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">لا يوجد حساسية مسجلة</span>
                  ) : (
                    patient.allergies.map((a, i) => (
                      <span key={i} className="bg-red-600 text-white text-[9px] px-2 py-1 rounded-md font-bold">{a}</span>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                <h3 className="text-blue-400 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest"><Activity size={14}/> تشخيص الأمراض المزمنة</h3>
                {patient.chronicDiseases.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">خالٍ من الأمراض الموثقة</div>
                ) : (
                  patient.chronicDiseases.map((d, i) => (
                    <div key={i} className="text-xs text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> {d}
                    </div>
                  ))
                )}
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                <h3 className="text-emerald-400 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest"><Pill size={14}/> العلاجات والأدوية النشطة</h3>
                {patient.recentMedications.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic">لا يوجد علاجات نشطة</div>
                ) : (
                  patient.recentMedications.map((m, i) => (
                    <div key={i} className="text-xs text-slate-300 mb-1.5 font-medium flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {m}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-900">
              <h3 className="text-purple-400 text-[10px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest">
                <Users size={14}/> أقارب وجهات اتصال الطوارئ (Emergency Contacts)
              </h3>
              {patient.emergencyContacts.length === 0 ? (
                <p className="text-[11px] text-slate-600 font-medium italic">لم يتم إدراج جهات اتصال طوارئ احتياطية.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {patient.emergencyContacts.map((contact, i) => (
                    <div key={i} className="bg-purple-500/[0.02] border border-purple-500/10 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{contact.name || "قريب غير مسمى"}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{contact.phoneNumber}</p>
                      </div>
                      <a 
                        href={`tel:${contact.phoneNumber}`} 
                        className="bg-purple-900/20 border border-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-400 p-2 rounded-lg transition-all cursor-pointer"
                      >
                        <Phone size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 🚨 المكون الأساسي لصفحة الخريطة والتفاصيل
// ==========================================
const EmergencyReportDetailsMap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reportId } = useParams();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [updating, setUpdating] = useState(false);
  const [isImgModalOpen, setIsImgModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [mapType, setMapType] = useState('satellite'); 

  const { isLoaded, loadError: googleMapsLoadError } = useGoogleMapsLoader();

  const loadData = useCallback(async () => {
    if (!reportId) {
      Swal.fire({
        icon: 'error',
        title: 'عذراً، لم يتم العثور على معرف البلاغ',
        background: '#050505',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      return navigate(-1);
    }

    try {
      setLoading(true);
      const cleanReportId = reportId.replace(/^\/+/, '');

      const resReport = await ApiAuthToken.get(`/emergency-employee/report/${cleanReportId}`);
      const data = resReport.data?.data || resReport.data;
      setReport(data);
      setSelectedStatus(data.status || 'Pending');

      const resUnits = await ApiAuthToken.get('/emergency-employee/available-units');
      setTeams(resUnits.data || []);
    } catch (err) { 
      console.error("Error loading emergency details:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [reportId, navigate]);

  useEffect(() => { 
    loadData(); 
  }, [loadData]);

  const handleAssignTeam = async () => {
    if (!selectedTeamId) return;
    setAssigning(true);
    try {
      // 🛠️ تم التعديل هنا لاستخدام الـ Query Params كما في الـ Endpoint الجديد
      await ApiAuthToken.post(`/emergency-employee/assign-task?reportId=${reportId}&unitId=${selectedTeamId}`);
      
      setReport(prev => ({ ...prev, status: 'Assigned', assignedTeamId: selectedTeamId }));
      setSelectedStatus('Assigned');
      
      Swal.fire({
        icon: 'success',
        title: 'تم إسناد الوحدة بنجاح',
        background: '#050505',
        color: '#fff',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'فشل عملية توجيه الوحدة', 
        background: '#050505', 
        color: '#fff' 
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await ApiAuthToken.patch(`/emergency-employee/change-status/${reportId}`, { 
        newStatus: selectedStatus 
      });
      
      setReport(prev => ({ ...prev, status: selectedStatus }));
      
      Swal.fire({ 
        icon: 'success', 
        title: 'تم تحديث حالة البلاغ بنجاح', 
        background: '#050505',
        color: '#fff',
        toast: true, 
        position: 'top-end', 
        showConfirmButton: false, 
        timer: 2000 
      });
    } catch (err) {
      console.error('Update status error:', err);
      Swal.fire({ icon: 'error', title: 'فشل تحديث الحالة في السيرفر' });
    } finally { 
      setUpdating(false); 
    }
  };

  const getEmergencyBadge = (type) => {
    switch (type) {
      case "Police":
        return { label: "شرطة / أمن الأدلة", icon: <Shield className="text-blue-500" size={14} />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "Ambulance":
        return { label: "إسعاف / طوارئ طبية", icon: <Ambulance className="text-amber-500" size={14} />, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "Fire":
        return { label: "إطفاء / دفاع مدني", icon: <Flame className="text-red-500" size={14} />, color: "text-red-400 bg-red-500/10 border-red-500/20" };
      default:
        return { label: "طوارئ عامة", icon: <AlertTriangle className="text-slate-400" size={14} />, color: "text-slate-400 bg-slate-800 border-slate-700" };
    }
  };

  const getButtonClass = (statusValue) => {
    const isSelected = selectedStatus === statusValue;
    const baseClass = "py-2.5 rounded-xl text-[10px] font-black transition-all border text-center cursor-pointer ";
    
    if (isSelected) {
      switch(statusValue) {
        case 'InProgress': return baseClass + "bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/40";
        case 'Resolved': return baseClass + "bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-900/40";
        case 'Rejected': return baseClass + "bg-red-600 border-red-400 text-white shadow-md shadow-red-900/40";
        case 'Pending': return baseClass + "bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-900/40";
        case 'Assigned': return baseClass + "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-900/40";
        default: return baseClass + "bg-slate-700 border-slate-500 text-white";
      }
    }
    return baseClass + "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white";
  };

  if ((!isLoaded || loading) && !googleMapsLoadError) {
    return (
      <div className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 font-bold tracking-widest">جاري سحب إحداثيات الموقع وتأمين البيانات...</span>
      </div>
    );
  }

  const emergencyInfo = getEmergencyBadge(report?.emergencyType);

  return (
    <div className="fixed top-[64px] bottom-0 left-0 right-0 bg-black flex overflow-hidden z-10 font-sans" dir="rtl">
      
      {isImgModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={() => setIsImgModalOpen(false)}>
          <div className="relative max-w-3xl max-h-[85vh] p-2">
            <img src={report?.imageUrl || '/placeholder-emergency.png'} className="rounded-xl object-contain max-h-[80vh] border border-white/10" alt="Incident Full Evidence" />
          </div>
        </div>
      )}

      <CitizenMedicalModal 
        isOpen={isMedicalModalOpen} 
        onClose={() => setIsMedicalModalOpen(false)} 
        citizenId={report?.citizenId} 
      />

      <aside className="w-[440px] h-full bg-[#050505] border-l border-slate-900 flex flex-col shadow-2xl relative z-20 overflow-hidden">
        
        <div className="relative h-44 shrink-0 overflow-hidden group bg-slate-950 border-b border-slate-900">
          {report?.imageUrl ? (
            <img src={report.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Incident Location" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 bg-slate-900/20">
              <AlertTriangle size={24} />
              <span className="text-[10px] font-bold">لم يتم إرفاق صورة ميدانية</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          {report?.imageUrl && (
            <button onClick={() => setIsImgModalOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Maximize2 className="text-white" size={20} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar">
          
          <header className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[10px] font-black ${emergencyInfo.color}`}>
                {emergencyInfo.icon}
                {emergencyInfo.label}
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                بلاغ رقم: #{report?.id}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white leading-tight">{report?.title || "بدون عنوان طارئ"}</h1>
          </header>

          <div className="space-y-2">
            <h3 className="text-[11px] font-black text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <Fingerprint size={12} className="text-indigo-500" /> هوية المواطن والملف الطبي
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black mb-1">
                  <User size={12}/> <span>الاسم الكامل</span>
                </div>
                <p className="text-xs font-bold text-slate-200 truncate">{report?.citizenName || 'مواطن مجهول'}</p>
              </div>

              <div className="bg-white/[0.01] p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black mb-1">
                  <Phone size={12}/> <span>رقم التواصل</span>
                </div>
                <p className="text-xs font-bold text-slate-200 font-mono tracking-wide truncate">{report?.citizenPhone || '---'}</p>
              </div>
            </div>

            <div className="bg-white/[0.02] p-3 rounded-xl border border-indigo-500/10 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-indigo-400 text-[10px] font-black">
                <Fingerprint size={13}/>
                <span>مُعرّف النظام الموحد (Citizen ID):</span>
              </div>
              <button 
                onClick={() => report?.citizenId && setIsMedicalModalOpen(true)}
                disabled={!report?.citizenId}
                className="w-full text-[11px] font-mono font-medium text-blue-400 bg-blue-950/20 hover:bg-blue-900/30 p-2 rounded-xl border border-blue-500/20 transition-all text-center tracking-tight cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{report?.citizenId || "غير متوفر"}</span>
                {report?.citizenId && <Eye size={12} className="text-blue-400 animate-pulse" />}
              </button>
            </div>
          </div>

          <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 space-y-1">
            <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-wider">شرح طبيعة الحالة والوصف الوارد</h4>
            <p className="text-xs text-slate-300 leading-relaxed italic">"{report?.description || 'لا يوجد تفاصيل إضافية ملحقة.'}"</p>
          </div>

          <div className="pt-3 border-t border-slate-900 space-y-2">
            <p className="text-[11px] text-emerald-400 font-black uppercase flex items-center gap-1.5 tracking-wider">
              <Users size={14} /> إرسال وإسناد وحدة طوارئ فورية
            </p>
            <div className="flex gap-2">
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="" className="bg-[#050505]">اختر الوحدة المتاحة حالياً...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id} className="bg-[#050505]">
                    {team.fullName} - ({team.specialization})
                  </option>
                ))}
              </select>
              
              <button 
                onClick={handleAssignTeam}
                disabled={!selectedTeamId || assigning || report?.status === 'Resolved'}
                className="bg-emerald-600 text-white px-4 rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-30 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                {assigning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-900">
            <div className="text-center">
              <p className="text-[11px] text-white font-black tracking-widest uppercase">تعديل حالة البلاغ في غرف التحكم</p>
            </div>

            <div className="grid grid-cols-5 gap-1">
              <button onClick={() => setSelectedStatus('Pending')} className={getButtonClass('Pending')}>انتظار</button>
              <button onClick={() => setSelectedStatus('Assigned')} className={getButtonClass('Assigned')}>مسند</button>
              <button onClick={() => setSelectedStatus('InProgress')} className={getButtonClass('InProgress')}>قيد العمل</button>
              <button onClick={() => setSelectedStatus('Resolved')} className={getButtonClass('Resolved')}>مُنجز</button>
              <button onClick={() => setSelectedStatus('Rejected')} className={getButtonClass('Rejected')}>مرفوض</button>
            </div>
            
            <button 
              onClick={handleUpdateStatus} 
              disabled={updating}
              className="w-full bg-white text-black py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {updating ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14}/> حفظ حالة البلاغ</>}
            </button>
          </div>
        </div>

        <div className="p-4 bg-[#020202] border-t border-slate-900 shrink-0">
          <a href={`tel:${report?.citizenPhone}`} className="w-full bg-slate-900/80 text-slate-300 py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-[11px] hover:bg-emerald-950/40 hover:text-emerald-400 hover:border-emerald-500/20 transition-all border border-white/5">
            <Phone size={14} /> اتصال طوارئ مباشر بالمُبلغ
          </a>
        </div>
      </aside>

      <div className="flex-1 relative h-full">
        {isLoaded && !googleMapsLoadError ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: parseFloat(report?.latitude) || 32.22, lng: parseFloat(report?.longitude) || 35.22 }} 
            zoom={17}
            options={{ 
              mapTypeId: mapType, 
              disableDefaultUI: true, 
              tilt: 45,
              zoomControl: true,
              streetViewControl: false,
              fullscreenControl: true,
              mapTypeControl: false
            }}
          >
            {report?.latitude && report?.longitude && (
              <MarkerF 
                position={{ lat: parseFloat(report.latitude), lng: parseFloat(report.longitude) }} 
                options={{ title: report?.title || "موقع الاستغاثة" }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <AlertTriangle className="text-amber-500 mx-auto mb-3" size={32} />
              <p className="text-slate-400 text-sm">تعذر تحميل الخريطة</p>
            </div>
          </div>
        )}

        <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex gap-1 z-20 shadow-xl">
          {[
            { id: 'roadmap', label: 'خريطة رقمية' },
            { id: 'satellite', label: 'قمر صناعي' },
            { id: 'terrain', label: 'تضاريس الأرض' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setMapType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                mapType === type.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 p-3.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-indigo-600 hover:border-indigo-400 transition-all z-20 group cursor-pointer shadow-lg"
        >
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default EmergencyReportDetailsMap;