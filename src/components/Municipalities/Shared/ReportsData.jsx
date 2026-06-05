import React, { useState, useEffect } from 'react';
import { 
  Megaphone, ShieldCheck, TrendingUp, Bell, 
  ArrowLeft, Clock, Info, CheckCircle, Zap,
  FileSearch, Users, MessageSquare, AlertTriangle, Loader2 
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

function ReportsData() {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        // جلب البيانات بطلب حجم صفحة كبير لضمان قراءة إحصائية دقيقة لجميع البلاغات المتاحة
        const response = await ApiAuthToken.get('/Admin/all-reports?pageNumber=1&pageSize=1000');
        if (response.data && response.data.data) {
          // تصفية العناصر التي تمثل بلاغات حقيقية وتحتوي على معرف (id)
          const validReports = response.data.data.filter(item => item.id);
          
          const totalCount = validReports.length;
          const resolvedCount = validReports.filter(r => r.status?.trim() === 'Resolved').length;
          const pendingCount = validReports.filter(r => r.status?.trim() === 'Pending').length;

          setStats({
            total: totalCount,
            resolved: resolvedCount,
            pending: pendingCount
          });
        }
      } catch (err) {
        console.error("خطأ في جلب إحصائيات البلاغات:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-36 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-300" size={24} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="إجمالي البلاغات" 
          value={stats.total.toLocaleString('en-US')} 
          change="+100%" 
          isPositive={true}
        />
        <StatCard 
          icon={CheckCircle} 
          label="بلاغات تم إغلاقها" 
          value={stats.resolved.toLocaleString('en-US')} 
          change={`${stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} 
          isPositive={true}
        />
        <StatCard 
          icon={Clock} 
          label="متوسط وقت الاستجابة" 
          value="42 دقيقة" 
          change="-5m" 
          isPositive={true}
        />
        <StatCard 
          icon={AlertCircle} 
          label="بلاغات قيد الانتظار" 
          value={stats.pending.toLocaleString('en-US')} 
          change={`+${stats.pending}`} 
          isPositive={false}
        />
      </div>
    </>
  );
}

const AlertCircle = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

// eslint-disable-next-line no-unused-vars
const StatCard = ({ icon: Icon, label, value, change, isPositive }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
        {change}
      </span>
    </div>
    <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{value}</h3>
  </div>
);

export default ReportsData;