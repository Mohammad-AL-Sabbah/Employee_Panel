/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { 
  Search, Hospital, MapPin, Phone, 
  ChevronRight, ChevronLeft, Map, 
  Filter, Building2, Navigation, 
  MapPinned, Info
} from 'lucide-react';

import EmergencyHeader from './EmergencyHeader';
import EmergencySidebar from './EmergencySidebar';

// أضفنا onShowMap هنا لكي يستقبل الدالة من المكون الأب
const MedicalCentersView = ({ onShowMap }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const palestineCities = [
    "القدس", "غزة", "نابلس", "الخليل", "رام الله", 
    "خانيونس", "حيفا", "يافا", "جنين", "بيت لحم"
  ];

  const medicalCenters = [
    { id: 'JER-01', name: 'مستشفى المقاصد الخيرية', city: 'القدس', type: 'أهلي', address: 'جبل الزيتون', phone: '026270222', capacity: 'كبيرة', lat: 31.7806, lng: 35.2444 },
    { id: 'JER-02', name: 'مستشفى مطلع الفجر (أوغستا فيكتوريا)', city: 'القدس', type: 'أهلي', address: 'جبل المشارف', phone: '026279911', capacity: 'متوسطة', lat: 31.7875, lng: 35.2483 },
    { id: 'JER-03', name: 'مستشفى الفرنساوي (سانت جوزيف)', city: 'القدس', type: 'خاص', address: 'الشيخ جراح', phone: '025833251', capacity: 'متوسطة', lat: 31.7931, lng: 35.2308 },
    { id: 'GZ-01', name: 'مجمع الشفاء الطبي', city: 'غزة', type: 'حكومي', address: 'غرب غزة', phone: '082824610', capacity: 'كبيرة جداً', lat: 31.5247, lng: 34.4455 },
    { id: 'GZ-02', name: 'مستشفى الرنتيسي التخصصي', city: 'غزة', type: 'حكومي', address: 'حي النصر', phone: '082877520', capacity: 'متوسطة', lat: 31.5361, lng: 34.4512 },
    { id: 'GZ-03', name: 'مستشفى الخدمة العامة', city: 'غزة', type: 'أهلي', address: 'وسط غزة', phone: '082828416', capacity: 'متوسطة', lat: 31.5190, lng: 34.4530 },
    { id: 'NAB-01', name: 'مستشفى رفيديا الجراحي', city: 'نابلس', type: 'حكومي', address: 'حي رفيديا', phone: '092383131', capacity: 'كبيرة', lat: 32.2211, lng: 35.2422 },
    { id: 'NAB-02', name: 'مستشفى النجاح الوطني الجامعي', city: 'نابلس', type: 'جامعي', address: 'المنطقة الجبلية', phone: '092331471', capacity: 'كبيرة جداً', lat: 32.2250, lng: 35.2350 },
    { id: 'NAB-03', name: 'المستشفى العربي التخصصي', city: 'نابلس', type: 'خاص', address: 'شارع تونس', phone: '092338181', capacity: 'متوسطة', lat: 32.2275, lng: 35.2510 },
    { id: 'HEB-01', name: 'مستشفى الخليل الحكومي', city: 'الخليل', type: 'حكومي', address: 'عين سارة', phone: '022228121', capacity: 'كبيرة', lat: 31.5326, lng: 35.0998 },
    { id: 'HEB-02', name: 'مستشفى الميزان التخصصي', city: 'الخليل', type: 'خاص', address: 'شارع المستشفى', phone: '022227222', capacity: 'متوسطة', lat: 31.5410, lng: 35.0920 },
    { id: 'HEB-03', name: 'مستشفى الأهلي بالخليل', city: 'الخليل', type: 'أهلي', address: 'نمرة', phone: '022215101', capacity: 'كبيرة', lat: 31.5500, lng: 35.1050 },
    { id: 'RAM-01', name: 'مجمع فلسطين الطبي', city: 'رام الله', type: 'حكومي', address: 'وسط المدينة', phone: '022982222', capacity: 'كبيرة جداً', lat: 31.9055, lng: 35.2044 },
    { id: 'RAM-02', name: 'مستشفى الاستشاري العربي', city: 'رام الله', type: 'خاص', address: 'الريحانية', phone: '022944444', capacity: 'كبيرة', lat: 31.9560, lng: 35.1850 },
    { id: 'RAM-03', name: 'مستشفى الرعاية العربية', city: 'رام الله', type: 'خاص', address: 'حي البالوع', phone: '022421111', capacity: 'متوسطة', lat: 31.9180, lng: 35.2100 },
  ];

  const filteredCenters = useMemo(() => {
    return medicalCenters.filter(center => {
      const matchesSearch = center.name.includes(searchTerm) || center.address.includes(searchTerm);
      const matchesCity = selectedCity === "all" || center.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [searchTerm, selectedCity]);

  const totalPages = Math.ceil(filteredCenters.length / itemsPerPage) || 1;
  const currentItems = filteredCenters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // تعديل هذه الدالة لترسل الإحداثيات فعلياً بدلاً من الـ alert
  const handleShowOnMap = (center) => {
    if (onShowMap) {
      // نرسل الكائن للأب بتنسيق lat و lon كما تتوقعه الخريطة
      onShowMap({ lat: center.lat, lon: center.lng });
    }
  };

  return (
    <div className="flex p-4 flex-col h-screen w-full bg-black overflow-hidden font-sans text-slate-200" dir="rtl">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="h-14 w-full flex-shrink-0 z-[60]">
        <EmergencyHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 h-full flex-shrink-0 border-l border-slate-800 bg-[#050505] z-50">
          <EmergencySidebar isOpen={true} />
        </aside>

        <main className="flex-1 h-full overflow-y-auto bg-black p-6 hide-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-4xl font-black text-white mb-2">المنظومة الطبية الفلسطينية</h1>
              <p className="text-slate-500 font-medium">قاعدة بيانات المستشفيات المركزية - تحديد المواقع الجغرافي</p>
            </div>

            <div className="flex flex-wrap gap-4 mb-8 bg-[#0a0a0a] p-5 rounded-[2rem] border border-slate-800 shadow-xl">
              <div className="flex-1 min-w-[280px] relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input 
                  type="text" 
                  placeholder="ابحث عن مستشفى في فلسطين..." 
                  className="w-full bg-black border border-slate-800 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:border-blue-500 text-white transition-all"
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>

              <div className="min-w-[200px] relative">
                <MapPinned className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <select 
                  className="w-full bg-black border border-slate-800 rounded-2xl py-3.5 pr-12 pl-10 outline-none focus:border-blue-500 appearance-none cursor-pointer text-white font-bold"
                  onChange={(e) => {setSelectedCity(e.target.value); setCurrentPage(1);}}
                >
                  <option value="all">كل مدن فلسطين</option>
                  {palestineCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className="flex items-center px-6 bg-slate-900 rounded-2xl border border-slate-800 text-blue-400 font-black">
                {filteredCenters.length} منشأة
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-500 text-[15px] font-black uppercase tracking-tighter border-b border-slate-800">
                    <th className="p-6">المدينة</th>
                    <th className="p-6">اسم المستشفى</th>
                    <th className="p-6">القدرة</th>
                    <th className="p-6">الاتصال</th>
                    <th className="p-6 text-center">الإجراءات الجغرافية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {currentItems.map((center) => (
                    <tr key={center.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <span className="text-white font-bold bg-slate-800 px-3 py-1.5 rounded-xl text-xs">{center.city}</span>
                      </td>
                      <td className="p-6">
                        <div className="text-white font-bold text-lg mb-1">{center.name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 leading-none italic"><MapPin size={12}/> {center.address}</div>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300 font-medium text-sm">{center.capacity}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <a href={`tel:${center.phone}`} className="text-blue-400 font-mono font-bold hover:text-blue-300 transition-colors"> {center.phone}  </a>
                          <span className='text-blue-400'><Phone/> </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleShowOnMap(center)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black transition-all cursor-pointer shadow-lg shadow-blue-900/20"
                          >
                            <Map size={14} /> عرض الخريطة
                          </button>
                          <button className="bg-slate-800 hover:bg-white hover:text-black p-2 rounded-xl transition-all cursor-pointer">
                            <Navigation size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-[#050505] p-6 rounded-2xl border border-slate-800">
              <p className="text-xs font-bold text-slate-600 uppercase">نظام إدارة المواقع الطبية - دولة فلسطين</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="flex items-center px-4 text-blue-500 font-black tracking-widest">{currentPage} / {totalPages}</div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default MedicalCentersView;