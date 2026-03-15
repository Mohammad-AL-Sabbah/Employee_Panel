import { toast } from 'sonner';

export const TicketNotify = (priority, subject, id) => {
  if (priority === 'low') return;

  const isHigh = priority === 'high';

  toast.custom((t) => (
    <div className={`flex items-center gap-4 p-4 rounded-[1.5rem] border bg-white shadow-2xl transition-all duration-500 ${isHigh ? 'border-red-100' : 'border-amber-100'}`} dir="rtl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isHigh ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}>
        {isHigh ? '⚠️' : '🔔'}
      </div>
      <div className="flex-1 text-right">
        <p className={`text-[10px] font-black uppercase ${isHigh ? 'text-red-500' : 'text-amber-500'}`}>
           تذكرة {isHigh ? 'عاجلة جداً' : 'متوسطة الأهمية'}
        </p>
        <h4 className="text-xs font-bold text-slate-800 mt-0.5">{subject}</h4>
        <p className="text-[9px] text-slate-400 font-bold tracking-tighter mt-1">المعرف: {id}</p>
      </div>
      <button onClick={() => toast.dismiss(t)} className="text-slate-300 hover:text-slate-500 text-xl">×</button>
    </div>
  ), { duration: isHigh ? 10000 : 5000 });
};