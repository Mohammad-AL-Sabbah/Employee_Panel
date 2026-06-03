import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertTriangle, CheckCircle, Info, Users, User, ShieldAlert } from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const EmailNotifications = () => {
  // 1. حالات الـ State لإدارة النموذج والبيانات
  const [formData, setFormData] = useState({
    userId: 'string', // القيمة الافتراضية المتوقعة في الـ DTO في حال كان الإرسال جماعياً
    sendToAll: true,
    header: '',
    bodyContent: '',
    type: 3, // الافتراضي: إشعار عام / معلومات
  });

  const [usersList, setUsersList] = useState([]); // قائمة المستخدمين للإرسال المخصص
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // 2. جلب المستخدمين عند اختيار "إرسال لمستلم محدد"
  useEffect(() => {
    if (!formData.sendToAll) {
      fetchUsers();
    }
  }, [formData.sendToAll]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      // ✅ تم تصحيح المسار ليتطابق تماماً مع الـ Controller: /Admin/getAllUsers
      const response = await ApiAuthToken.get('/Admin/getAllUsers'); 
      
      if (response.status === 200 && response.data) {
        // ✅ استخراج المصفوفة بناءً على شكل الـ Return المكتوب في السيرفر: { message, users }
        const extractedUsers = response.data.users || [];
        setUsersList(extractedUsers);
        
        if (extractedUsers.length === 0) {
          console.warn("تمت عملية الاتصال بنجاح ولكن مصفوفة الـ users فارغة.");
        }
      }
    } catch (err) {
      console.error("خطأ أثناء جلب قائمة المستخدمين للحساب المخصص:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  // 3. معالجة الإرسال إلى الـ API
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.header.trim() || !formData.bodyContent.trim()) {
      alert("الرجاء إدخال عنوان الإشعار ونص الرسالة بالكامل.");
      return;
    }

    if (!formData.sendToAll && (formData.userId === 'string' || !formData.userId)) {
      alert("الرجاء اختيار مستلم محدد من القائمة.");
      return;
    }

    setLoading(true);
    try {
      // الـ End-point هنا صحيحة تماماً وتطابق السيرفر: /Admin/send-Email-notification
      const response = await ApiAuthToken.post('/Admin/send-Email-notification', {
        userId: formData.sendToAll ? "string" : formData.userId,
        sendToAll: formData.sendToAll,
        header: formData.header,
        bodyContent: formData.bodyContent,
        type: parseInt(formData.type),
        customDate: null
      });

      if (response.status === 200 && response.data?.isSuccess) {
        alert(`تمت عملية الإرسال بنجاح! إجمالي الرسائل المرسلة: ${response.data.totalSent}`);
        setFormData({
          userId: 'string',
          sendToAll: true,
          header: '',
          bodyContent: '',
          type: 3,
        });
      } else {
        alert(response.data?.message || "فشل إرسال البريد الإلكتروني.");
      }
    } catch (err) {
      console.error("Send Email Error:", err);
      alert(err.response?.data?.message || "حدث خطأ غير متوقع أثناء عملية الإرسال.");
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: 0, label: "عاجل جداً", color: "border-rose-500 text-rose-600 bg-rose-50", icon: ShieldAlert },
    { value: 1, label: "تنبيه وتحذير", color: "border-amber-500 text-amber-600 bg-amber-50", icon: AlertTriangle },
    { value: 2, label: "إشعار نجاح", color: "border-emerald-500 text-emerald-600 bg-emerald-50", icon: CheckCircle },
    { value: 3, label: "إشعار عام / معلومات", color: "border-blue-500 text-blue-600 bg-blue-50", icon: Info },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto text-right" dir="rtl">
      
      {/* الهيدر الرئيسي للمكون */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
          <Mail size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">نظام المراسلات والبريد المركزي</h2>
          <p className="text-xs text-slate-500 mt-1">بث الإشعارات والتعاميم البريدية لفرق الصيانة والموظفين والمواطنين بشكل آمن وفوري.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* العمود الجانبي */}
        <div className="space-y-4 md:col-span-1">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider mb-3 text-slate-400">محددات القوالب الذكية</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
            يتم إختيار القالب الخاص بالرسالة حسب أهمية الرسالة أو مضمونها
            </p>
            <div className="space-y-2">
              {notificationTypes.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.value} className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold ${item.color}`}>
                    <IconComponent size={14} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* نموذج الإرسال الرئيسي */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:col-span-2 shadow-sm">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {/* وجهة الإرسال */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">وجهة ونطاق الإرسال</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sendToAll: true, userId: 'string' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${formData.sendToAll ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  <Users size={16} />
                  إرسال للجميع (كافة الحسابات)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, sendToAll: false, userId: '' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${!formData.sendToAll ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  <User size={16} />
                  مستلم محدد (فريق / موظف)
                </button>
              </div>
            </div>

            {/* اختيار مستلم محدد */}
            {!formData.sendToAll && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-black text-slate-700 uppercase mb-2">تحديد الحساب المستلم</label>
                {fetchingUsers ? (
                  <div className="text-xs text-slate-400 py-2">جاري تحميل قائمة الحسابات من النظام...</div>
                ) : (
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">اختر الحساب البريدي...</option>
                    {usersList && usersList.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName || user.userName} ({user.email || 'لا يوجد إيميل'})
                      </option>
                    ))}
                  </select>
                )}
                {usersList.length === 0 && !fetchingUsers && (
                  <p className="text-[11px] text-rose-500 mt-1">⚠️ لم يتم استرجاع مستخدمين، يرجى مراجعة صلاحيات قاعدة البيانات.</p>
                )}
              </div>
            )}

            {/* نوع ودرجة الإشعار */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">نوع ودرجة الإشعار</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all"
              >
                <option value="3">إشعار عام / معلومات</option>
                <option value="0">عاجل جداً (Urgent)</option>
                <option value="1">تنبيه وتحذير (Warning)</option>
                <option value="2">تم بنجاح (Success)</option>
              </select>
            </div>

            {/* عنوان الإشعار */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">عنوان الرسالة الإشعارية (Header)</label>
              <input
                type="text"
                value={formData.header}
                onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                placeholder="مثال: تحديث أمني هام لفرق الطوارئ ميدانياً"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* نص وجسد الرسالة */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-2">محتوى الإشعار والرسالة (Body Content)</label>
              <textarea
                rows={6}
                value={formData.bodyContent}
                onChange={(e) => setFormData({ ...formData, bodyContent: e.target.value })}
                placeholder="اكتب تفاصيل الرسالة البريدية هنا..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* زر الإرسال النهائي */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#10b981] text-white rounded-xl text-xs font-black hover:bg-emerald-600 shadow-md shadow-emerald-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>جاري معالجة وبث الإيميلات في الخلفية...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>بث الإشعار وتوزيع البريد الإلكتروني الآن</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default EmailNotifications;