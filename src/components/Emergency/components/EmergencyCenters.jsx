/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import ApiAuthToken from '../../../api/ApiAuthToken.jsx'; 
import { 
  Building2, Search, MapPin, ChevronRight, ChevronLeft, 
  Globe2, ArrowLeftRight, User, ShieldAlert, Edit2, Trash2, X, Phone
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import EmergencySidebar from './EmergencySidebar';

const EmergencyCenters = () => {
  // ---- الـ States الخاصة بالبيانات والتحميل والحماية ----
  const [emergencyDepartments, setEmergencyDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- الـ States الخاصة بالبحث والصفحات ----
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ---- الـ States الخاصة بموديول التعديل (Edit Modal) ----
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editFormData, setEditFormData] = useState({
    centerName: '',
    city: '',
    address: '',
    managerName: '',
    managerNumber: '',
    latitude: 0,
    longitude: 0,
    centerType: 'Police'
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // ---- الـ States الخاصة بموديول الخريطة (Google Maps Modal) ----
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 32.2226, lng: 35.2621, centerName: "" });

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const mapContainerStyle = { width: '100%', height: '450px', borderRadius: '1.5rem' };
  const defaultCenter = { lat: 32.2226, lng: 35.2621 };

  const darkMapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181818" }] },
      { featureType: "road", elementType: "geometry.solid", stylers: [{ color: "#2c2c2c" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] }
    ]
  };

  // ---- 1. جلب البيانات الحية ----
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await ApiAuthToken.get('/emergency-employee/emergency-departments');
      console.log("PSRS Live Data:", response.data);

      if (Array.isArray(response.data)) {
        setEmergencyDepartments(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setEmergencyDepartments(response.data.data);
      } else {
        setEmergencyDepartments([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error loading emergency centers:", err);
      setError("فشل في مزامنة البيانات الحية مع الخادم الرئيسي للـ PSRS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ---- 2. معالجة وتجهيز طلب التعديل وعرض البيانات السابقة ----
  const handleEditClick = (dept) => {
    setEditingDept(dept);
    
    // نقوم بتعبئة الـ Form بالبيانات الحالية القادمة من العنصر نفسه بالملي
    setEditFormData({
      centerName: dept.centerName || '',
      city: dept.city || '',
      address: dept.address || '',
      managerName: dept.managerName || '',
      managerNumber: dept.managerNumber || '', 
      latitude: parseFloat(dept.latitude) || 0,
      longitude: parseFloat(dept.longitude) || 0,
      // التأكد من تمرير القيمة النصية المسجلة بالباك إند مباشرة
      centerType: dept.centerType || 'Police' 
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept || !editingDept.id) return;

    setIsUpdating(true);
    try {
      const response = await ApiAuthToken.put(
        `/emergency-employee/emergency-departments/${editingDept.id}`, 
        editFormData
      );
      
      if (response.status === 200 || response.status === 204) {
        alert("تم تحديث بيانات قسم الطوارئ بنجاح.");
        setIsEditModalOpen(false);
        // تحديث البيانات في الـ State الرئيسية لتعكس التعديل فوراً بالواجهة
        setEmergencyDepartments(prev => 
          prev.map(item => item.id === editingDept.id ? { ...item, ...editFormData } : item)
        );
      }
    } catch (err) {
      console.error("Error updating department:", err);
      alert(err.response?.data?.message || "فشل في تحديث البيانات، يرجى التحقق من المدخلات والصلاحيات.");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---- 3. وظيفة الحذف الآمنة المربوطة بالباك-إند ----
  const handleDelete = async (id, name) => {
    if (!id) {
      alert("خطأ: معرف القسم غير موجود.");
      return;
    }
    
    if (window.confirm(`هل أنت متأكد من حذف قسم الطوارئ "${name}" نهائياً من نظام PSRS؟`)) {
      try {
        const response = await ApiAuthToken.delete(`/emergency-employee/emergency-departments/${id}`);
        
        if (response.status === 200 || response.status === 204) {
          alert("تم حذف القسم بنجاح من النظام.");
          setEmergencyDepartments(prev => prev.filter(item => item.id !== id));
        }
      } catch (err) {
        console.error("Error deleting department:", err);
        alert(err.response?.data?.message || "فشل في إتمام عملية الحذف من الخادم، يرجى مراجعة الصلاحيات.");
      }
    }
  };

  // ---- 4. فتح موديول الخريطة الداخلي ----
  const openMapModal = (dept) => {
    const lat = parseFloat(dept.latitude) || defaultCenter.lat;
    const lng = parseFloat(dept.longitude) || defaultCenter.lng;
    setSelectedLocation({ lat, lng, centerName: dept.centerName });
    setIsMapModalOpen(true);
  };

  // ---- 5. معالجة الـ Enum/String للنوع لقراءة الشارات بشكل صحيح ----
  const getCenterTypeBadge = (type) => {
    if (typeof type === 'string') {
      if (type.toLowerCase().includes('police')) return "مركز شرطة";
      if (type.toLowerCase().includes('fire')) return "مركز إطفاء";
      if (type.toLowerCase().includes('ambul')) return "مركز إسعاف";
    }
    switch (Number(type)) {
      case 1: return "مركز شرطة";
      case 2: return "مركز إطفاء";
      case 3: return "مركز إسعاف";
      default: return "قسم طوارئ";
    }
  };

  // ---- 6. الفلترة والترقيم ----
  const filteredDepts = useMemo(() => {
    if (!Array.isArray(emergencyDepartments)) return [];
    return emergencyDepartments.filter(dept => {
      if (!dept) return false;
      const targetName = dept.centerName || "";
      const targetCity = dept.city || "";
      const targetAddress = dept.address || "";
      const targetManager = dept.managerName || "";

      return targetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             targetCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
             targetAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
             targetManager.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, emergencyDepartments]);

  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    return filteredDepts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredDepts, currentPage]);

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar relative">
          <div className="max-w-7xl p-4 mx-auto">
            
            {/* Header القسم */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-blue-500 shadow-lg shadow-blue-900/10">
                  <ArrowLeftRight size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">أقسام الطوارئ الحية</h1>
                  <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold opacity-80">Palestine Emergency Departments Directory</p>
                </div>
              </div>

              {/* حقل البحث */}
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="بحث عن قسم، محافظة، مسؤول أو عنوان..." 
                  className="bg-[#0a0a0a] border border-slate-800 rounded-2xl py-3 pr-12 pl-5 w-full md:w-96 focus:border-blue-500 outline-none text-sm transition-all text-white placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>
            </div>

            {/* حالات التحميل والأخطاء */}
            {loading && (
              <div className="text-center py-24 bg-[#050505] rounded-[2.5rem] border border-slate-800/50">
                <div className="animate-spin inline-block w-10 h-10 border-[3px] border-current border-t-transparent text-blue-500 rounded-full mb-4"></div>
                <p className="text-slate-400 font-medium">جاري تحديث سجلات الطوارئ من قاعدة البيانات الموحدة...</p>
              </div>
            )}

            {error && (
              <div className="p-8 bg-red-950/10 border border-red-900/30 text-red-400 rounded-[2.5rem] text-center my-4 flex flex-col items-center gap-3">
                <ShieldAlert size={40} className="text-red-500" />
                <p className="font-semibold">{error}</p>
                <button onClick={fetchDepartments} className="mt-2 text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all">إعادة محاولة المزامنة</button>
              </div>
            )}

            {/* عرض بطاقات الأقسام */}
            {!loading && !error && (
              currentItems.length === 0 ? (
                <div className="text-center py-24 text-slate-500 bg-[#050505] rounded-[2.5rem] border border-dashed border-slate-800">
                  لم يتم العثور على أي مراكز أو أقسام تطابق المدخلات الحالية في النظام.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                  {currentItems.map((dept) => (
                    <div key={dept.id || dept.centerName} className="bg-[#080808] border border-slate-800/60 rounded-[2.5rem] p-8 hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between">
                      
                      <div>
                        <div className="flex justify-between items-start mb-8">
                          <div className="p-3.5 bg-slate-900 rounded-2xl text-blue-500 border border-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                            <Building2 size={26} />
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditClick(dept)}
                              className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black transition-all active:scale-95"
                              title="تعديل بيانات القسم"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(dept.id, dept.centerName)}
                              className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95"
                              title="حذف القسم نهائياً"
                            >
                              <Trash2 size={14} />
                            </button>
                            <span className="text-[10px] font-black text-slate-400 bg-black border border-slate-800 px-4 py-1.5 rounded-full tracking-widest uppercase mr-2">
                              {getCenterTypeBadge(dept.centerType)}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 leading-tight group-hover:text-blue-400 transition-colors">
                          {dept.centerName}
                        </h3>

                        <div className="space-y-5 mb-10">
                          <div className="flex items-center gap-4 text-slate-400 group/item">
                            <div className="p-2 bg-slate-900 rounded-lg group-hover/item:text-blue-500 transition-colors">
                              <Globe2 size={16} />
                            </div>
                            <span className="text-sm font-semibold tracking-wide text-slate-300">المحافظة: {dept.city}</span>
                          </div>

                          {dept.address && (
                            <div className="flex items-center gap-4 text-slate-400 group/item">
                              <div className="p-2 bg-slate-900 rounded-lg group-hover/item:text-blue-500 transition-colors">
                                <MapPin size={16} />
                              </div>
                              <span className="text-sm text-slate-400 truncate">{dept.address}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-slate-400 group/item">
                            <div className="p-2 bg-slate-900 rounded-lg group-hover/item:text-blue-500 transition-colors">
                              <User size={16} />
                            </div>
                            <span className="text-sm text-slate-400">المسؤول: {dept.managerName || "غير مدرج"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50">
                        <button 
                          onClick={() => openMapModal(dept)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-xs active:scale-95"
                        >
                          <MapPin size={14} className="text-blue-500" />
                          عرض خريطة الموقع الداعمة 📍
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )
            )}

            {/* الترقيم */}
            {!loading && !error && filteredDepts.length > 0 && (
              <div className="flex justify-between items-center bg-[#050505] p-7 rounded-[2rem] border border-slate-800 shadow-2xl">
                <span className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Total Departments: {filteredDepts.length}</span>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1} 
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-10 cursor-pointer transition-all shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages} 
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-10 cursor-pointer transition-all shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================== موديول التعديل الذكي المنبثق (Edit Modal) ==================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#080808] border border-slate-800 w-full max-w-xl rounded-[2.5rem] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit2 size={20} className="text-amber-500" />
                تعديل بيانات: {editingDept?.centerName}
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">اسم قسم الطوارئ</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                  value={editFormData.centerName}
                  onChange={(e) => setEditFormData({...editFormData, centerName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">المحافظة</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">نوع المركز</label>
                  <select 
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all cursor-pointer"
                    value={editFormData.centerType}
                    onChange={(e) => setEditFormData({...editFormData, centerType: e.target.value})}
                  >
                    <option value="Police">مركز شرطة</option>
                    <option value="Fire">مركز إطفاء</option>
                    <option value="Ambulance">مركز إسعاف</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">اسم المسؤول</label>
                  <input 
                    type="text"
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    value={editFormData.managerName}
                    onChange={(e) => setEditFormData({...editFormData, managerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">رقم هاتف المسؤول</label>
                  <input 
                    type="text"
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    value={editFormData.managerNumber}
                    onChange={(e) => setEditFormData({...editFormData, managerNumber: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">العنوان بالتفصيل</label>
                <input 
                  type="text"
                  className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">خط العرض (Lat)</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    value={editFormData.latitude}
                    onChange={(e) => setEditFormData({...editFormData, latitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">خط الطول (Lng)</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500 transition-all"
                    value={editFormData.longitude}
                    onChange={(e) => setEditFormData({...editFormData, longitude: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all"
                >
                  {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== موديول الخرائط الاحترافي ==================== */}
      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[#080808] border border-slate-800 w-full max-w-3xl rounded-[2.5rem] overflow-hidden p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  موقع: {selectedLocation.centerName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">الإحداثيات الحية: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</p>
              </div>
              <button 
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              {mapLoadError && (
                <div className="text-center py-32 text-red-500">
                  <p className="text-sm font-semibold">حدث خطأ أثناء تحميل الخريطة التفاعلية.</p>
                </div>
              )}

              {!GOOGLE_MAPS_API_KEY ? (
                <div className="text-center py-32 text-slate-500 flex flex-col items-center gap-2">
                  <ShieldAlert size={36} className="text-amber-500" />
                  <p className="text-sm font-semibold">تنبيه: لم يتم العثور على مفتاح الخرائط `VITE_GOOGLE_MAPS_API_KEY`</p>
                </div>
              ) : isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  zoom={14}
                  options={darkMapOptions}
                >
                  <Marker 
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} 
                    title={selectedLocation.centerName}
                  />
                </GoogleMap>
              ) : (
                <div className="text-center py-32 text-slate-600 flex flex-col items-center justify-center">
                  <p className="text-xs font-mono animate-pulse">جاري جلب بيانات الخريطة المظلمة فوراً...</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencyCenters;