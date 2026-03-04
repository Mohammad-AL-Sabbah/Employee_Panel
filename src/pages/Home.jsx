/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, MessageSquare, MapPin, AlertCircle, 
  Clock, Bell, ChevronLeft, Users, Loader2, Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "لوحةالتحكم  | P.S.R.S";
    
    const fetchQuotes = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/quotes?limit=50');
        setQuotes(response.data.quotes);
        setLoading(false);
      } catch (err) {
        setError("فشل في جلب البيانات من السيرفر");
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const displayQuotes = quotes
    .filter(item => 
      item.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toString().includes(searchTerm)
    )
    .slice(0, 5); 

  return (
    <div className="p-8 w-full bg-transparent animate-in fade-in duration-500" dir="rtl">
      
      {/* رأس الصفحة الداخلي */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم للموظف - نظام البلديات</h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* الجزء الأيمن الرئيسي */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* قسم الإجراءات السريعة - تم إضافة الروابط هنا */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Plus size={16} className="text-[#10b981]" />
              <span>إجراءات سريعة</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickCard icon={Plus} label="إضافة إعلان" to="/add-announcement" active />
              <QuickCard icon={MessageSquare} label="إرسال إشعار" to="/notifications" />
              <QuickCard icon={Users} label="مستخدمين النظام" to="/users" />
              <QuickCard icon={MapPin} label="موقع وحالة الفرق" to="/teams" />
            </div>
          </div>

          {/* قسم البلاغات الواردة */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[450px]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-slate-800 font-bold text-lg">أحدث البلاغات الواردة</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm ? `نتائج البحث عن: "${searchTerm}"` : "تحديث مباشر من نظام PSRS"}
                </p>
              </div>
              <div className="relative w-72 group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="بحث برقم البلاغ، المحتوى، أو الاسم..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-xs outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/reports" className="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                عرض سجل البلاغات الكامل
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="text-sm font-medium">جاري مزامنة البيانات...</p>
                </div>
              ) : error ? (
                <div className="text-center py-24 text-red-400 bg-red-50 rounded-3xl border border-red-100 italic">
                  {error}
                </div>
              ) : displayQuotes.length > 0 ? (
                displayQuotes.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                        <AlertCircle size={22} />
                      </div>
                      <div className="max-w-xl">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1 text-right">
                          {item.quote}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 justify-start">
                          <span className="font-bold text-slate-500 italic">بواسطة:</span> {item.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase">
                          ID : {item.id}
                        </span>
                      </div>
                      <ChevronLeft 
                        size={18} 
                        className="text-slate-300 group-hover:text-emerald-500 group-hover:-translate-x-1 transition-all" 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                   عذراً، لا يوجد بلاغ بهذا الرقم أو المحتوى حالياً.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الجزء الأيسر الجانبي */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-emerald-600 mb-5 font-bold text-xs uppercase tracking-tight">
              <Clock size={16} /> أوقات العمل
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tighter mb-1">08:00 - 20:00</p>
            <p className="text-slate-400 text-[11px]">نظام المناوبات الحالية</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs"><Bell size={16} /> الإشعارات</div>
              <span className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">03</span>
            </div>
            <div className="space-y-6">
              <div className="pr-4 border-r-2 border-emerald-500 text-right">
                <p className="text-[11px] font-bold text-slate-800">بلاغ طارئ جديد</p>
                <p className="text-[10px] text-slate-400 mt-1">كسر في خط مياه حي الروضة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون كرت الإجراءات السريعة المطور مع Link
const QuickCard = ({ icon: Icon, label, to = "/", active = false }) => {
  const baseClasses = "aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm no-underline";
  const stateClasses = active 
    ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-200 shadow-xl scale-105" 
    : "bg-white border-slate-200 text-slate-600 hover:shadow-xl hover:border-emerald-500 hover:-translate-y-1";

  return (
    <Link to={to} className={`${baseClasses} ${stateClasses}`}>
      <div className={`${active ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'} p-3.5 rounded-2xl transition-colors`}>
        <Icon size={22} />
      </div>
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
};

export default Home;