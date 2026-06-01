/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, Download, MessageSquare, Clock, 
  AlertCircle, CheckCircle2, RotateCcw, User, Tag, 
  ExternalLink, Mail, CheckSquare, Square, Loader2, X, 
  FileText, ShieldAlert, ChevronLeft, Trash2
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken'; 
import Swal from 'sweetalert2';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTickets, setSelectedTickets] = useState([]);

  // حالات المودال والتذكرة النشطة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // لتحديد الزر الذي يقوم بالحذف حالياً

  // 1. جلب التذاكر من السيرفر
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ApiAuthToken.get('/Admin/Display-All-Tickets(SuperAdmin)');
      setTickets(response.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      Swal.fire({
        title: 'خطأ في الاتصال',
        text: 'فشل جلب البيانات. تأكد من تشغيل مشروع الـ Web API في الـ Visual Studio.',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // 2. جلب تفاصيل التذكرة عند الضغط
  const handleOpenDetails = async (ticketId) => {
    try {
      setIsModalOpen(true);
      setModalLoading(true);
      const response = await ApiAuthToken.get(`/Admin/${ticketId}`);
      setSelectedTicketDetails(response.data);
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      const localFallback = tickets.find(t => (t.id === ticketId || t.Id === ticketId));
      if (localFallback) {
        setSelectedTicketDetails(localFallback);
      } else {
        Swal.fire('خطأ', 'تعذر الوصول لتفاصيل التذكرة.', 'error');
        setIsModalOpen(false);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // 3. حذف التذكرة نهائياً من النظام
  const handleDeleteTicket = async (ticketId) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد من الحذف؟',
      text: "سيتم حذف تذكرة الدعم الفني هذه نهائياً من النظام ولا يمكن التراجع عن هذا الإجراء!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // لون أحمر متناسق مع التدمير
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، احذفها الآن',
      cancelButtonText: 'إلغاء الأمر',
      customClass: {
        popup: 'rounded-[2rem]',
        confirmButton: 'rounded-xl font-bold text-xs px-4 py-2',
        cancelButton: 'rounded-xl font-bold text-xs px-4 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(ticketId);
        // استدعاء الأيند بوينت الخاصة بك بالـ HTTP Delete
        await ApiAuthToken.delete(`/Admin/Delete-Ticket/${ticketId}`);

        // تحديث الـ State محلياً لحذف العنصر من الواجهة مباشرة
        setTickets(prev => prev.filter(t => (t.id !== ticketId && t.Id !== ticketId)));
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم حذف التذكرة بنجاح من قاعدة البيانات',
          showConfirmButton: false,
          timer: 2000
        });
      } catch (error) {
        console.error("خطأ أثناء حذف التذكرة:", error);
        Swal.fire({
          title: 'فشل عملية الحذف',
          text: error.response?.data?.message || 'لم يتمكن السيرفر من معالجة طلب الحذف، تأكد من صلاحيات الـ SuperAdmin.',
          icon: 'error',
          confirmButtonText: 'مفهوم'
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  // تحويل نص الحالة إلى القيمة الرقمية الـ Enum المطلوبة في الـ Dto
  const getStatusNumberForApi = (statusStr) => {
    if (!statusStr) return 1;
    const s = statusStr.toLowerCase();
    if (s === "نشط" || s === "active" || s === "open" || s === "نشطة") return 1;
    if (s === "معلق" || s === "inprocess" || s === "قيد الحل" || s === "pending" || s === "معلقة") return 2;
    if (s === "مغلق" || s === "closed" || s === "مغلقة") return 3;
    return 1;
  };

  // 4. تحديث حالة التذكرة فورياً
  const handleUpdateStatus = async (statusNumber) => {
    if (!selectedTicketDetails) return;
    const ticketId = selectedTicketDetails.id || selectedTicketDetails.Id;

    try {
      setUpdatingStatus(true);
      const statusInt = parseInt(statusNumber, 10);

      const requestBody = { 
        newStatus: statusInt 
      };

      await ApiAuthToken.put(`/Admin/${ticketId}/update-Ticket-status`, requestBody);
      
      let textStatus = "نشط";
      if (statusInt === 2) textStatus = "معلق";
      if (statusInt === 3) textStatus = "مغلق";

      setSelectedTicketDetails(prev => ({ ...prev, status: textStatus, Status: textStatus }));
      setTickets(prev => prev.map(t => (t.id === ticketId || t.Id === ticketId) ? { ...t, status: textStatus, Status: textStatus } : t));
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'تم تحديث حالة التذكرة بنجاح',
        showConfirmButton: false,
        timer: 2000
      });
    } catch (error) {
      console.error("خطأ أثناء تحديث الحالة:", error);
      Swal.fire({
        title: 'فشل التحديث',
        text: 'لم يتمكن السيرفر من معالجة الطلب، تأكد من مطابقة الـ Validation وقيمة الصلاحيات الخاصة بك.',
        icon: 'error',
        confirmButtonText: 'مفهوم'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const mapPriority = (p) => {
    if (!p) return 'low';
    const clean = p.toLowerCase();
    if (clean === 'high' || clean === 'عاجل' || clean === 'عالية' || clean === 'عاجلة') return 'high';
    if (clean === 'medium' || clean === 'متوسط' || clean === 'متوسطة') return 'medium';
    return 'low';
  };

  const mapStatus = (s) => {
    if (!s) return 'open';
    const clean = s.toLowerCase();
    if (clean === 'closed' || clean === 'مغلق' || clean === 'مغلقة') return 'closed';
    if (clean === 'pending' || clean === 'معلق' || clean === 'معلقة' || clean === 'inprocess' || clean === 'قيد الحل') return 'pending';
    return 'open';
  };

  // ميثود مسؤولة عن إرجاع كلاسات الألوان الخاصة بالحالات في الجدول والمودال
  const getStatusBadgeStyle = (statusStr) => {
    const mapped = mapStatus(statusStr);
    switch (mapped) {
      case 'open':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-2 ring-emerald-500/10';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/60 ring-2 ring-amber-500/10';
      case 'closed':
        return 'bg-slate-100 text-slate-600 border-slate-200/60';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  // ميثود مسؤولة عن تلوين مستويات الأولويات بشكل حذر واحترافي
  const getPriorityBadgeStyle = (priorityStr) => {
    const mapped = mapPriority(priorityStr);
    switch (mapped) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 font-black';
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200/60';
      case 'low':
        return 'bg-sky-50 text-sky-700 border-sky-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  // ميثود لتلوين رتب وصلاحيات المستخدمين ديناميكياً داخل الجدول
  const getRoleBadgeStyle = (roleStr) => {
    if (!roleStr) return 'bg-slate-50 text-slate-600 border-slate-200';
    const cleanRole = roleStr.toLowerCase();
    switch (cleanRole) {
      case 'citizen':
      case 'مواطن':
        return 'bg-blue-50 text-blue-700 border-blue-200/60 ring-2 ring-blue-500/5';
      case 'municipalemployee':
      case 'employee':
      case 'موظف بلدية':
      case 'موظف ميداني':
        return 'bg-purple-50 text-purple-700 border-purple-200/60 ring-2 ring-purple-500/5';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const subjectText = t.subject || t.Subject || "";
      const idText = String(t.id || t.Id || "");
      const userText = t.userName || t.UserName || "موظف بلدية";
      
      const matchesSearch = subjectText.includes(searchTerm) || idText.includes(searchTerm) || userText.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || mapStatus(t.status || t.Status) === statusFilter;
      const matchesPriority = priorityFilter === "all" || mapPriority(t.priority || t.Priority) === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter, tickets]);

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen text-right" dir="rtl">
      
      {/* الترويسة الرئيسية */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-8 bg-emerald-600 rounded-full"></span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">مركز إدارة طلبات الدعم</h1>
          </div>
          <p className="text-sm text-slate-400 font-bold mr-4">استعراض ومتابعة مشاكل موظفي الميدان وحلها فورياً</p>
        </div>
      </div>

      {/* شريط الإجراءات العلوي */}
      <div className="mb-6 flex justify-between items-center gap-4 flex-wrap">
        <button onClick={fetchTickets} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm">
          <RotateCcw size={14} className={loading ? "animate-spin" : ""} /> تحديث اللوحة والاتصال بالخادم
        </button>

        {/* فلاتر سريعة العرض تزيد من مظهر لوحة التحكم العصرية */}
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">كل الحالات</option>
            <option value="open">🟢 نشط</option>
            <option value="pending">🟡 معلق</option>
            <option value="closed">⚫ مغلق</option>
          </select>

          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">كل الأولويات</option>
            <option value="high">🔴 عاجل</option>
            <option value="medium">🟠 متوسط</option>
            <option value="low">🔵 عادي</option>
          </select>
        </div>
      </div>

      {/* حقل البحث الأنيق */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="البحث برقم التذكرة، العنوان، أو اسم الموظف..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pr-12 pl-4 text-xs font-bold focus:ring-4 focus:ring-slate-100 transition-all outline-none" 
          />
        </div>
      </div>

      {/* جدول عرض البيانات */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 size={36} className="animate-spin text-emerald-600" />
            <p className="text-sm font-bold">جاري الاتصال بقاعدة البيانات ومزامنة التذاكر...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 text-center text-slate-400 font-bold text-sm">
            لا يوجد تذاكر دعم فني تطابق معايير البحث الحالية.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider">معرف الطلب</th>
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider">عنوان التذكرة وإسم المرسل</th>
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider text-center">صلاحية المرسل</th>
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider text-center">الأولوية</th>
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider text-center">الحالة</th>
                  <th className="p-6 text-xs font-black text-slate-500 tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.map((t) => {
                  const id = t.id || t.Id;
                  const subject = t.subject || t.Subject;
                  const user = t.userName || t.UserName || "موظف ميداني";
                  const currentStatus = t.status || t.Status || "نشط";
                  const currentPriority = t.priority || t.Priority || "عادي";

                  return (
                    <tr key={id} className="hover:bg-slate-50/60 transition-all">
                      <td className="p-6 font-black text-emerald-600 text-xs">#TK-{id}</td>
                      <td className="p-6">
                        <div className="flex flex-col gap-0.5">
                          <h4 className="text-sm font-bold text-slate-800">{subject}</h4>
                          <span className="text-xs text-slate-400 font-medium">{user}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border tracking-wide transition-all shadow-sm ${getRoleBadgeStyle(t.userRole || t.UserRole)}`}>
                         {t.userRole || t.UserRole}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadgeStyle(currentPriority)}`}>
                          {currentPriority}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(currentStatus)}`}>
                          {mapStatus(currentStatus) === 'open' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {currentStatus}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenDetails(id)} 
                            className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm group"
                          >
                            عرض وتعديل
                            <ChevronLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
                          </button>

                          <button 
                            disabled={deletingId === id}
                            onClick={() => handleDeleteTicket(id)} 
                            className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
                            title="حذف التذكرة نهائياً"
                          >
                            {deletingId === id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🌟 مـودال مـراجـعـة وتـحـديـث حـالـة الـتـذكـرة 🌟 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] text-right" onClick={(e) => e.stopPropagation()}>
            
            {/* الهيدر الرئيسي للمودال */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">مراجعة وتعديل التذكرة</h3>
                  {selectedTicketDetails && (
                    <p className="text-xs text-emerald-600 font-black mt-0.5 tracking-wide">
                      المعرف : #TK-{selectedTicketDetails.id || selectedTicketDetails.Id}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-all cursor-pointer">
                <X size={22} />
              </button>
            </div>

            {/* محتوى المودال */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              {modalLoading ? (
                <div className="p-16 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 size={36} className="animate-spin text-emerald-600" />
                  <p className="text-sm font-bold">جاري جلب تفاصيل التذكرة الحية...</p>
                </div>
              ) : selectedTicketDetails ? (
                <>
                  {/* كارت معلومات الموظف والقسم */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-0.5">الموظف مقدم البلاغ</p>
                        <p className="text-sm font-black text-slate-800">{selectedTicketDetails.userName || selectedTicketDetails.UserName || "موظف بلدية"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Tag size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-0.5">تصنيف المشكلة</p>
                        <span className="inline-block text-xs font-black text-slate-700 bg-emerald-50/60 border border-emerald-100 px-3 py-1 rounded-lg">
                          {selectedTicketDetails.category || selectedTicketDetails.Category || "عام / صيانة"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* موضوع التذكرة بخط كبير ومقروء */}
                  <div className="bg-slate-50/40 border-r-4 border-emerald-500 p-4 rounded-l-xl">
                    <p className="text-xs font-black text-slate-400 mb-1">عنوان البلاغ الرئيسي:</p>
                    <h2 className="text-base font-black text-slate-800 leading-snug">
                      {selectedTicketDetails.subject || selectedTicketDetails.Subject}
                    </h2>
                  </div>

                  {/* وصف المشكلة التفصيلي */}
                  <div>
                    <p className="text-xs font-black text-slate-600 mb-2">الشرح والوصف الوارد من الموظف:</p>
                    <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl text-sm font-bold leading-relaxed whitespace-pre-line shadow-md min-h-[100px]">
                      {selectedTicketDetails.description || selectedTicketDetails.Description || "لا توجد تفاصيل نصية إضافية مرفقة."}
                    </div>
                  </div>

                  {/* الصور المرفقة إن وجدت */}
                  <div>
                    <p className="text-xs font-black text-slate-600 mb-2">الصور المرفقة بالبلاغ:</p>
                    {(selectedTicketDetails.imageUrls && selectedTicketDetails.imageUrls.length > 0) || 
                     (selectedTicketDetails.ImageUrls && selectedTicketDetails.ImageUrls.length > 0) ? (
                      <div className="grid grid-cols-1 gap-4">
                        {(selectedTicketDetails.imageUrls || selectedTicketDetails.ImageUrls).map((url, index) => (
                          <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 max-h-[300px] flex items-center justify-center shadow-inner">
                            <img src={url} alt="مرفق الدعم الفني" className="max-w-full max-h-[300px] object-contain" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs font-bold bg-slate-50/50">
                        لم يتم إرفاق صور مع هذه التذكرة.
                      </div>
                    )}
                  </div>

                  {/* لوحة التحكم بالحالة المحدثة بالكامل بصرياً */}
                  <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200/60">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <ShieldAlert size={16} className="text-emerald-600" /> إجراءات المشرف وتحديث الحالة
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">تحديث فوري مباشرة في قاعدة بيانات النظام</p>
                    </div>

                    <div className="relative min-w-[240px]">
                      <select 
                        disabled={updatingStatus}
                        value={getStatusNumberForApi(selectedTicketDetails.status || selectedTicketDetails.Status)}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className="w-full bg-slate-900 text-white rounded-xl py-3.5 px-4 text-xs font-black border-none outline-none cursor-pointer disabled:opacity-50 transition-all text-right shadow-md focus:ring-2 focus:ring-emerald-500 appearance-none"
                      >
                        <option value="1">🟢 نشط وبانتظار المراجعة (Active)</option>
                        <option value="2">🟡 قيد المعالجة والحل (InProcess)</option>
                        <option value="3">⚫ تم الحل والإغلاق (Closed)</option>
                      </select>
                      {updatingStatus && (
                        <Loader2 size={16} className="animate-spin text-white absolute left-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* فوتر المودال */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-950 hover:text-white transition-all cursor-pointer shadow-sm">
                إغلاق النافذة
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SupportTickets;