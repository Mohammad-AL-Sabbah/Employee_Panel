/* eslint-disable no-unused-vars */
import React, { useState } from 'react';  // ✅ إزالة useEffect
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import ApiAuthToken from '../../Api/ApiAuthToken';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // ✅ تم إزالة useEffect بالكامل - لا حاجة لـ check-auth

  const redirectBasedOnRole = (role) => {
    switch(role) {
      case "SuperAdmin":
        navigate("/AdminControlPanel");
        break;
      case "MunicipalEmployee":
        navigate("/MainPage");
        break;
      case "EmergencyEmployee":
        navigate("/EmergencyDashboard");
        break;
      default:
        setServerError("عذراً، هذا النظام مخصص للموظفين فقط. حسابك لا يملك إذن الوصول.");
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await ApiAuthToken.post('/Auth/Account/login', {
        email: data.email,
        password: data.password
      });

      console.log("Login Response:", response.data);

      if (response.data.success) {
        const { accessToken, username, role } = response.data;
        
        if (accessToken) {
          sessionStorage.setItem('accessToken', accessToken);
        }
        if (username) {
          sessionStorage.setItem('userName', username);
        }
        if (role) {
          sessionStorage.setItem('userRole', role);
        }
        
        redirectBasedOnRole(role);
      } else {
        setServerError(response.data.message || "حدث خطأ أثناء تسجيل الدخول");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || 
                     error.response?.data?.title ||
                     "عذراً، البريد الإلكتروني أو كلمة المرور غير صحيحة!";
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 shadow-sm mb-4">
            <ShieldCheck size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">نظام PSRS</h1>
          <p className="text-slate-500 font-bold text-sm mt-2">منصة التحكم والسيطرة لبلديات فلسطين</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-red-500"></div>

          <div className="mb-8">
            <h2 className="text-xl font-black text-slate-800">تسجيل دخول الموظفين</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">الرجاء إدخال بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-[11px] font-black border border-rose-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse"></span>
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 mr-2">البريد الإلكتروني الرسمي</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email"
                  {...register("email", { 
                    required: "البريد الإلكتروني مطلوب",
                    pattern: { value: /^\S+@\S+$/i, message: "صيغة البريد غير صحيحة" }
                  })}
                  placeholder="admin@psrs.ps"
                  className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200'} rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all text-right`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 font-bold mr-2">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black text-slate-700">كلمة المرور</label>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  {...register("password", { required: "كلمة المرور مطلوبة" })}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-500' : 'border-slate-200'} rounded-2xl py-3.5 pr-12 pl-12 text-xs font-bold outline-none focus:border-emerald-500 transition-all text-right`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[10px] text-rose-500 font-bold mr-2">{errors.password.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>دخول للنظام</span>
                  <ArrowRight size={18} />
                </>
              )}
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