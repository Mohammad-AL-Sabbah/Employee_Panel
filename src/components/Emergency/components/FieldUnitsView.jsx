/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Shield, Ambulance, Flame, Phone, 
  MessageSquare, Eye, MapPin, User, 
  ChevronRight, ChevronLeft, Filter, Radio,
  BellPlus, Send, X, AlertTriangle, Loader2
} from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';

import EmergencySidebar from './EmergencySidebar';
import ApiAuthToken from '../../../Api/ApiAuthToken';
import { useGoogleMapsLoader } from '../../../components/Emergency/components/useGoogleMapsLoader';

const FieldUnitsView = () => {
  const [fieldUnits, setFieldUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const unitsPerPage = 6;

  const [showCallMenu, setShowCallMenu] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callTarget, setCallTarget] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { isLoaded, loadError: googleMapsLoadError } = useGoogleMapsLoader();

  useEffect(() => {
    fetchActiveUnits();
  }, []);

  const fetchActiveUnits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ApiAuthToken.get('/emergency-employee/available-units');
      setFieldUnits(response.data || []);
    } catch (err) {
      console.error("Error fetching field units:", err);
      setError("فشل في تحميل بيانات الوحدات الميدانية. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUnitConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'police': 
      case 'شرطة':
        return { icon: <Shield size={24} />, colorClass: 'bg-blue-600', textClass: 'text-blue-500', bgClass: 'bg-blue-600/10' };
      case 'ambulance': 
      case 'إسعاف':
        return { icon: <Ambulance size={24} />, colorClass: 'bg-emerald-500', textClass: 'text-emerald-500', bgClass: 'bg-emerald-600/10' };
      case 'fire': 
      case 'firefighter':
      case 'إطفاء':
        return { icon: <Flame size={24} />, colorClass: 'bg-red-600', textClass: 'text-red-500', bgClass: 'bg-red-600/10' };
      default: 
        return { icon: <Radio size={24} />, colorClass: 'bg-amber-500', textClass: 'text-amber-500', bgClass: 'bg-amber-600/10' };
    }
  };

  const filteredUnits = useMemo(() => {
    return fieldUnits.filter(unit => {
      const name = unit.name || unit.fullName || "";
      const leader = unit.leader || unit.leaderName || "";
      const id = String(unit.id || "");
      const type = unit.type || unit.specialization || unit.unitType || "";

      const matchesSearch = name.includes(searchTerm) || leader.includes(searchTerm) || id.includes(searchTerm);
      const matchesFilter = filterType === "all" || type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType, fieldUnits]);

  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage) || 1;
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top smoothly when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDispatch = (e) => {
    e.preventDefault();
    setShowCallModal(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 4000);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  if (googleMapsLoadError) {
    console.error("Google Maps failed to load:", googleMapsLoadError);
  }

  return (
    <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-in.slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out;
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar relative">
          <div className="max-w-7xl p-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <Radio className="text-blue-500" size={32} />
                  الوحدات الميدانية النشطة
                </h1>
                <p className="text-slate-500 text-sm mt-1">مراقبة مباشرة لانتشار وحدات الطوارئ في القطاعات</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative">
                  <button 
                    onClick={() => setShowCallMenu(!showCallMenu)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20 cursor-pointer"
                  >
                    <BellPlus size={20} />
                    <span>استدعاء كافة الوحدات</span>
                  </button>

                  {showCallMenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                      <button style={{cursor:'pointer'}} onClick={() => { setCallTarget("ambulance"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-emerald-500 font-bold"><Ambulance size={18}/> استدعاء الإسعاف</button>
                      <button style={{cursor:'pointer'}} onClick={() => { setCallTarget("fire"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-red-500 font-bold"><Flame size={18}/> استدعاء الإطفاء</button>
                      <button style={{cursor:'pointer'}} onClick={() => { setCallTarget("police"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm hover:bg-slate-800 flex items-center gap-3 text-blue-500 font-bold"><Shield size={18}/> استدعاء الشرطة</button>
                      <button style={{cursor:'pointer'}} onClick={() => { setCallTarget("all"); setShowCallModal(true); setShowCallMenu(false); }} className="w-full text-right px-4 py-3 text-sm bg-red-600/10 hover:bg-red-600/20 flex items-center gap-3 text-red-600 font-black border-t border-slate-800"><AlertTriangle size={18}/> استدعاء الكل (طارئ)</button>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="بحث عن وحدة..." 
                    className="bg-[#0a0a0a] border border-slate-800 rounded-xl py-2.5 pr-10 pl-4 w-full md:w-64 focus:border-blue-500 outline-none text-sm transition-all text-white"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="text-blue-500 animate-spin" size={40} />
                <p className="text-slate-400 text-sm font-medium">جاري تحديث حالة الوحدات الميدانية مباشرة...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="p-6 border border-red-900/50 bg-red-950/20 rounded-2xl text-center max-w-xl mx-auto my-10">
                <AlertTriangle className="text-red-500 mx-auto mb-3" size={32} />
                <p className="text-red-400 font-bold mb-4">{error}</p>
                <button onClick={fetchActiveUnits} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">إعادة المحاولة</button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {currentUnits.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">لا يوجد وحدات ميدانية تطابق خيارات البحث الحالية.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {currentUnits.map((unit) => {
                        const config = getUnitConfig(unit.type || unit.specialization || unit.unitType);
                        return (
                          <div key={unit.id} className="bg-[#0a0a0a] border border-slate-800 rounded-[2rem] p-6 hover:border-slate-600 transition-all group relative overflow-hidden shadow-2xl">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${config.colorClass}`} />
                            <div className="flex justify-between items-start mb-6">
                              <div className={`p-3 rounded-2xl ${config.bgClass} ${config.textClass}`}>{config.icon}</div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 bg-slate-900 px-3 py-1 rounded-full">{unit.id?.slice(0,8)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{unit.name || unit.fullName}</h3>
                            <div className="space-y-3 mb-8">
                              <div className="flex items-center gap-3 text-slate-400">
                                <User size={16} className="text-slate-600" />
                                <span className="text-sm font-medium">القائد: {unit.username || unit.userName || 'غير معين'}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <span className={`flex h-2 w-2 rounded-full animate-pulse ${unit.status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                <span className={`text-[13px] font-bold uppercase`}>حالة الوحدة: {unit.status}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800"><Phone size={16} />اتصال</button>
                              <button className="p-3 bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800 cursor-pointer"><MessageSquare size={18} /></button>
                              <button 
                                onClick={() => { setSelectedUnit(unit); setShowDetailsModal(true); }}
                                className="p-3 bg-slate-900 hover:bg-white hover:text-black text-slate-400 rounded-xl transition-all border border-slate-800 cursor-pointer"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Enhanced Pagination Section */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center mt-8 mb-4 pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-2xl border border-slate-800 p-2 shadow-xl">
                          {/* Previous Button */}
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`
                              flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200
                              ${currentPage === 1 
                                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                                : 'bg-slate-800 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-900/30 cursor-pointer'
                              }
                            `}
                          >
                            <ChevronRight size={18} />
                            <span>السابق</span>
                          </button>

                          {/* Page Numbers */}
                          <div className="flex items-center gap-1 mx-2">
                            {getPageNumbers().map((pageNum) => (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`
                                  min-w-[45px] h-[45px] rounded-xl font-bold transition-all duration-200
                                  ${currentPage === pageNum
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 scale-105'
                                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer'
                                  }
                                `}
                              >
                                {pageNum}
                              </button>
                            ))}
                          </div>

                          {/* Next Button */}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`
                              flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200
                              ${currentPage === totalPages 
                                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' 
                                : 'bg-slate-800 hover:bg-blue-600 text-white hover:shadow-lg hover:shadow-blue-900/30 cursor-pointer'
                              }
                            `}
                          >
                            <span>التالي</span>
                            <ChevronLeft size={18} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Page Info */}
                    {totalPages > 1 && (
                      <div className="text-center mt-4">
                        <p className="text-slate-500 text-sm">
                          صفحة {currentPage} من {totalPages} | إجمالي الوحدات: {filteredUnits.length}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal with Map */}
      {showDetailsModal && selectedUnit && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-slate-800 w-full max-w-xl rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white">{selectedUnit.fullName || selectedUnit.name}</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-500 hover:text-white cursor-pointer"><X size={24}/></button>
            </div>
            <div className="p-6">
              <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 mb-4">
                {isLoaded ? (
                  <GoogleMap 
                    mapContainerStyle={{ width: '100%', height: '100%' }} 
                    center={{ lat: selectedUnit.latitude || 30.0444, lng: selectedUnit.longitude || 31.2357 }} 
                    zoom={14}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true
                    }}
                  >
                    <Marker 
                      position={{ lat: selectedUnit.latitude || 30.0444, lng: selectedUnit.longitude || 31.2357 }} 
                      title={selectedUnit.fullName || selectedUnit.name}
                    />
                  </GoogleMap>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 bg-slate-900/50 rounded-2xl">
                    {googleMapsLoadError ? (
                      <div className="text-center p-4">
                        <AlertTriangle className="text-red-500 mx-auto mb-2" size={24} />
                        <p className="text-xs text-red-400">فشل تحميل الخريطة</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                        <p className="text-xs">جاري تحميل الخريطة...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p className="text-slate-400">القائد: <span className="text-white font-bold">{selectedUnit.userName || selectedUnit.username || 'غير محدد'}</span></p>
                <p className="text-slate-400">الهاتف: <span className="text-white font-bold">{selectedUnit.phoneNumber || 'غير متوفر'}</span></p>
                <p className="text-slate-400">المركز: <span className="text-white font-bold">{selectedUnit.centerName || 'غير محدد'}</span></p>
                <p className="text-slate-400">الحالة: <span className={`font-bold ${selectedUnit.status === 'Available' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedUnit.status || 'غير معروف'}</span></p>
              </div>
              {selectedUnit.latitude && selectedUnit.longitude && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <a 
                    href={`https://www.google.com/maps/dir//${selectedUnit.latitude},${selectedUnit.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-400 text-sm transition-colors"
                  >
                    <MapPin size={16} />
                    <span>فتح الاتجاهات في خرائط جوجل</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call Dispatch Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-white">تأكيد الاستدعاء</h2>
              <button onClick={() => setShowCallModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-6">
              <p className="text-slate-300 mb-6 text-center">
                هل أنت متأكد من استدعاء {callTarget === 'all' ? 'جميع الوحدات' : callTarget === 'ambulance' ? 'وحدات الإسعاف' : callTarget === 'fire' ? 'وحدات الإطفاء' : 'وحدات الشرطة'}؟
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowCallModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">إلغاء</button>
                <button onClick={handleDispatch} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-all font-bold">تأكيد الاستدعاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-6 right-6 z-[600] bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <BellPlus size={20} />
          <span className="font-bold">تم استدعاء الوحدات بنجاح!</span>
        </div>
      )}
    </div>
  );
};

export default FieldUnitsView;