/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Radio } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "تسجيل الدخول | PSRS";
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // --- بيانات تجريبية (Mock Data) ---
    const mockAdmin = {
      email: "admin@psrs.ps",
      password: "123",
      name: "عمر خالد"
    };

    const mockSuperAdmin = {
      email: "superadmin@psrs.ps",
      password: "123",
      name: "محمد الصباح"
    };

    // الحساب الجديد الخاص بلوحة الطوارئ
    const mockEmergency = {
      email: "sos@psrs.ps",
      password: "sos",
      name: "وحدة العمليات المركزية"
    };

    if (email === mockAdmin.email && password === mockAdmin.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "موظف"); 
      localStorage.setItem("userName", mockAdmin.name);
      navigate("/MainPage");
    } 
    else if (email === mockSuperAdmin.email && password === mockSuperAdmin.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "مسؤول");
      localStorage.setItem("userName", mockSuperAdmin.name);
      navigate("/AdminControlPanel");
    } 
    // المنطق الخاص بلوحة الطوارئ
    else if (email === mockEmergency.email && password === mockEmergency.password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "طوارئ");
      localStorage.setItem("userName", mockEmergency.name);
      // تأكد أن هذا المسار هو نفسه الذي ستعرفه في ملف App.jsx
      navigate("/EmergencyDashboard"); 
    }
    else {
      setError("عذراً، البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        
        {/* الهوية البصرية */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-sm mb-4">
            <ShieldCheck size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">نظام PSRS</h1>
          <p className="text-slate-500 font-bold text-sm mt-2">منصة التحكم والسيطرة لبلديات فلسطين</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          {/* لمسة بصرية تدل على وجود لوحة طوارئ */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500"></div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-800">تسجيل دخول الموظفين</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">الرجاء إدخال بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-[11px] font-black border border-rose-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse"></span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 mr-2">البريد الإلكتروني الرسمي</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="admin@psrs.ps"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black text-slate-700">كلمة المرور</label>
                <button 
                  type="button"
                  onClick={() => alert("الرجاء مراجعة قسم تكنولوجيا المعلومات في البلدية.")}
                  className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pr-12 pl-12 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-right"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-4 cursor-pointer active:scale-[0.98]"
            >
              <span>دخول للنظام</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

    
        <p className="text-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          نظام الاستجابة السريعة الفلسطيني © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;