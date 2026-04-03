/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, ArrowLeft, AlertCircle, X } from 'lucide-react';

const EmergencyLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (credentials.email === "sos@psrs.ps" && credentials.password === "sos") {
      navigate('/EmergencyDashboard');
    } else {
      setError("بيانات الدخول غير صحيحة");
      
      setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center font-sans text-slate-300 relative overflow-hidden" dir="rtl">
      {/* تأثير إضاءة خلفي خفيف */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-slate-800 rounded-[2.5rem] shadow-2xl relative z-10 backdrop-blur-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-500 mb-4 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">نظام الطوارئ</h1>
          <p className="text-slate-500 text-[10px] mt-2 font-bold tracking-[0.2em] uppercase opacity-70">Emergency System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 mr-1 uppercase tracking-widest">البريد الإلكتروني</label>
            <div className="relative group">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-black border border-slate-800 rounded-2xl py-4 pr-12 pl-4 focus:border-indigo-600 outline-none transition-all text-sm text-white placeholder:text-slate-700 shadow-inner"
                placeholder="sos@psrs.ps"
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 mr-1 uppercase tracking-widest">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black border border-slate-800 rounded-2xl py-4 pr-12 pl-4 focus:border-indigo-600 outline-none transition-all text-sm text-white placeholder:text-slate-700 shadow-inner"
                placeholder="••••••••"
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>

          {/* رسالة الخطأ المصممة بجمالية */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={18} className="flex-shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
              <button onClick={() => setError("")} className="mr-auto opacity-50 hover:opacity-100 transition-opacity">
                <X size={14} />
              </button>
            </div>
          )}

          <button 
            type="submit" 
            style={{cursor:'pointer'}}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 mt-4"
          >
            <span>تسجيل الدخول</span>
            <ArrowLeft size={18} />
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-900 text-center">
           <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium leading-loose">
             Property of <span className="text-slate-400 font-black">PSRS System</span><br/>
             Authorized Personnel Only
           </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyLogin;