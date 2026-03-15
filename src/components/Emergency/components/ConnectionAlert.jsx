import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // أضفنا هذا لمراقبة الصفحة

const ConnectionAlert = ({ isDisconnected }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // فحص هل الصفحة تابعة للطوارئ أم للإدارة/الموظفين
  const isEmergency = location.pathname.includes('Emergency') || location.pathname.includes('Medical');

  useEffect(() => {
    if (isDisconnected) {
      setIsVisible(true);
      setShowSuccess(false);
    } else if (isVisible && !isDisconnected) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDisconnected, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
  };

  // --- إعدادات الألوان بناءً على الصفحة والحالة ---
  const getThemeColors = () => {
    if (showSuccess) return 'border-emerald-600 shadow-emerald-900/40 bg-black text-emerald-400';
    
    // إذا كان انقطاع: نختار بين أحمر الطوارئ أو أزرق الإدارة
    if (isEmergency) {
      return 'border-red-600 shadow-red-900/40 bg-black text-red-400';
    } else {
      return 'border-blue-600 shadow-blue-900/40 bg-black text-blue-400';
    }
  };

  const getIconBg = () => {
    if (showSuccess) return 'bg-emerald-600';
    return isEmergency ? 'bg-red-600' : 'bg-blue-600';
  };

  const getProgressColor = () => {
    if (showSuccess) return 'bg-emerald-600';
    return isEmergency ? 'bg-red-600' : 'bg-blue-600';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          {/* خلفية الوميض */}
          <div className={`absolute inset-0 animate-pulse pointer-events-none 
            ${showSuccess ? 'bg-emerald-900/5' : isEmergency ? 'bg-red-900/5' : 'bg-blue-900/5'}`}>
          </div>

          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={`relative w-[500px] border-2 p-8 shadow-2xl text-center font-mono pointer-events-auto transition-colors duration-500 ${getThemeColors()}`}
          >
            <button 
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6">
              <motion.div 
                animate={showSuccess ? { scale: [1, 1.2, 1] } : { rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`p-4 rounded-full text-white transition-colors duration-500 ${getIconBg()}`}
              >
                {showSuccess ? <Wifi size={48} /> : <WifiOff size={48} />}
              </motion.div>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">
              {showSuccess ? 'Connection Restored' : 'No Signal'}
            </h2>
            
            <div className="space-y-4">
              <div className={`border p-4 text-[15px] leading-relaxed text-right transition-colors duration-500 
                ${showSuccess ? 'bg-emerald-950/20 border-emerald-900/50' : isEmergency ? 'bg-red-950/20 border-red-900/50' : 'bg-blue-950/20 border-blue-900/50'}`}>
                <p>
                  {showSuccess 
                    ? 'تم استعادة الاتصال بالإنترنت بنجاح. يتم الآن مزامنة البيانات  .' 
                    : isEmergency 
                      ? 'تم اكتشاف انقطاع في شبكة الإنترنت النظام يعمل الآن في وضع الأوفلاين . قد تكون البيانات المعروضة على الخريطة غير دقيقة.'
                      : 'عذراً، لا يوجد اتصال بالإنترنت حالياً. يرجى التحقق من الإتصال بالشبكة   .' /* يمكنك تغيير هذا النص كما تريد */}
                </p>
              </div>

              {!showSuccess && (
                <div className="flex flex-col gap-2">
                  <div className="h-1 w-full bg-slate-800 overflow-hidden relative">
                    <motion.div 
                      className={`absolute inset-y-0 left-0 ${getProgressColor()}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[16px] text-slate-500 font-bold uppercase tracking-widest italic">في إنتظار الاتصال بالإنترنت...</span>
                </div>
              )}
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionAlert;