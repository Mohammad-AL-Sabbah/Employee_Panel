import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Search, ShieldCheck, MapPin, 
  Smartphone, Eye, Ban, SearchX, Lock, Unlock, Loader2,
  ChevronLeft, ChevronRight, X, Mail, Phone, User, Info, Calendar, Trash2, Award, Check
} from 'lucide-react';
import ApiAuthToken from '../../../Api/ApiAuthToken';

const Users = () => {
  const [activeTab, setActiveTab] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // ✅ حالة الـ Popup
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  // ✅ حالة الرتبة المحددة داخل الـ Dropdown وزر التأكيد
  const [pendingRole, setPendingRole] = useState("");

  // إعدادات الـ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // قراءة دور المستخدم من sessionStorage
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('userRole') || 'ضيف';
  });

  // جلب المستخدمين من الـ API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiAuthToken.get('/Admin/getAllUsers');
      
      console.log("API Response:", response.data);
      
      if (response.data && response.data.users) {
        const formattedUsers = response.data.users.map(user => ({
          id: user.id,
          name: user.fullName || user.name,
          type: user.accountType === "موظف بلدية" || user.accountType === "SuperAdmin" || user.accountType === "MunicipalEmployee" ? "Staff" : "Citizen",
          role: user.accountType,
          email: user.email,
          phoneNumber: user.phoneNumber || "غير متوفر",
          location: user.location || "غير محدد",
          reportsCount: user.reportsCount || 0,
          isBanned: user.isBlocked === "True" || user.isBlocked === true,
          profilePictureUrl: user.profilePictureUrl,
          createdAt: user.createdAt || "غير محدد"
        }));
        setUsersData(formattedUsers);
        setCurrentPage(1);
      } else {
        setError("لم يتم العثور على بيانات المستخدمين");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  // دالة حظر/فك حظر المستخدم
  const toggleBan = async (userId, isCurrentlyBanned) => {
    setActionLoading(userId);
    try {
      const response = await ApiAuthToken.post(`/Admin/toggle-block/${userId}`);
      
      console.log("Toggle block response:", response.data);
      
      if (response.data.success || response.status === 200) {
        setUsersData(prev => prev.map(u => 
          u.id === userId ? { ...u, isBanned: !isCurrentlyBanned } : u
        ));
        
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(prev => ({ ...prev, isBanned: !isCurrentlyBanned }));
        }
        
        const newStatus = !isCurrentlyBanned;
        alert(newStatus ? "تم حظر المستخدم بنجاح" : "تم فك الحظر عن المستخدم بنجاح");
      } else {
        alert(response.data.message || "فشلت العملية");
      }
    } catch (err) {
      console.error("Error toggling ban:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء تنفيذ العملية");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ دالة الحذف النهائي للمواطن
  const handleDeleteCitizen = async (userId, userName) => {
    const confirmDelete = window.confirm(`تنبيه أمني حساس: هل أنت متأكد تماماً من رغبتك في حذف المواطن "${userName}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء!`);
    
    if (!confirmDelete) return;

    setActionLoading(userId);
    try {
      const response = await ApiAuthToken.delete(`/Admin/delete-citizen/${userId}`);
      
      if (response.status === 200 || response.data.success) {
        alert("تم حذف حساب المواطن نهائياً وبنجاح من النظام.");
        
        if (showPopup && selectedUser?.id === userId) {
          closePopup();
        }

        setUsersData(prev => prev.filter(u => u.id !== userId));
      } else {
        alert(response.data.message || "فشلت عملية الحذف، يرجى التحقق من الصلاحيات.");
      }
    } catch (err) {
      console.error("Error deleting citizen:", err);
      alert(err.response?.data?.message || "حدث خطأ غير متوقع أثناء محاولة حذف الحساب.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ دالة تغيير رتبة الموظف المعدلة مع التأكيد الحامي من الأخطاء البشرية
  const handleUpdateRole = async () => {
    if (!selectedUser || !pendingRole || pendingRole === selectedUser.role) return;
    
    const confirmChange = window.confirm(`تأكيد إداري: هل أنت متأكد من تغيير رتبة الموظف "${selectedUser.name}" من (${selectedUser.role}) إلى (${pendingRole})؟`);
    if (!confirmChange) return;

    setActionLoading(selectedUser.id);
    try {
      const response = await ApiAuthToken.put('/Admin/update-role', {
        userId: selectedUser.id,
        newRole: pendingRole
      });

      if (response.status === 200 || response.data.success) {
        alert("تم تحديث رتبة الموظف وصلاحياته بنجاح.");
        
        // تحديث البيانات محلياً في الجدول
        setUsersData(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, role: pendingRole } : u
        ));

        // تحديث البيانات في الـ Popup المفتوح وإعادة تصفير الـ pendingRole
        setSelectedUser(prev => ({ ...prev, role: pendingRole }));
        setPendingRole(""); 
      } else {
        alert(response.data.message || "فشلت عملية تحديث الرتبة.");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء محاولة تعديل الرتبة.");
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ دالة عرض تفاصيل المستخدم في Popup
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setPendingRole(""); // تصفير الاختيار المعلق عند فتح أي مستخدم جديد
    setShowPopup(true);
    document.body.style.overflow = 'hidden';
  };

  // ✅ إغلاق الـ Popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedUser(null);
    setPendingRole("");
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    document.title = "إدارة المستخدمين | P.S.R.S";
    fetchUsers();
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // فلترة المستخدمين
  const filteredUsers = usersData.filter(user => {
    const matchesTab = activeTab === "الكل" || user.type === activeTab;
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // حساب المستخدمين المعروضين حسب الصفحة الحالية
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const canControl = (userType) => {
    if (userRole === "SuperAdmin") return true;
    if (userRole === "MunicipalEmployee" && userType === "Citizen") return true;
    return false;
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-500 font-bold">جاري تحميل المستخدمين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#f8fafc] min-h-screen" dir="rtl">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <SearchX size={48} className="text-rose-500 mx-auto mb-3" />
          <p className="text-rose-600 font-bold">{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen" dir="rtl">
      {/* الترويسة */}
      <div className="mb-10">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <UsersIcon size={28} className="text-emerald-600" />
          إدارة قاعدة بيانات المستخدمين
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
          نظام PSRS - الحساب الحالي: <span className="text-emerald-600">
            {userRole === "SuperAdmin" ? "مدير عام" : userRole === "MunicipalEmployee" ? "موظف بلدية" : userRole}
          </span>
        </p>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200">
          {["الكل", "Staff", "Citizen"].map((tab) => (
            <button 
              key={tab} 
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }} 
              className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {tab === "الكل" ? "جميع الحسابات" : tab === "Staff" ? "كادر البلدية" : "المواطنين"}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو البريد..." 
            value={searchTerm} 
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }} 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-11 pl-4 text-xs font-bold outline-none focus:border-emerald-500 shadow-sm" 
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <SearchX size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">لا يوجد مستخدمون مطابقون للبحث</p>
          </div>
        ) : (
          <>
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase">المستخدم</th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase text-center">نوع الحساب / الرتبة</th>
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentUsers.map((user) => {
                  const canControlUser = canControl(user.type);
                  
                  return (
                    <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black ${user.type === 'Staff' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{user.email}</p>
                            {user.phoneNumber && user.phoneNumber !== "غير متوفر" && (
                              <p className="text-[9px] text-slate-300 mt-0.5">{user.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black border ${user.type === 'Staff' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                          {user.type === 'Staff' ? <ShieldCheck size={12} /> : <Smartphone size={12} />}
                          {user.role}
                        </span>
                      </td>

                      <td className="p-5 text-left">
                        <div className="flex items-center justify-end gap-3">
                          {canControlUser ? (
                            <>
                              <button 
                                onClick={() => viewUserDetails(user)}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 text-xs font-black cursor-pointer"
                              >
                                <Eye size={16} /> <span>التفاصيل</span>
                              </button>
                              
                              <button 
                                onClick={() => toggleBan(user.id, user.isBanned)}
                                disabled={actionLoading === user.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-xs font-black cursor-pointer ${
                                  user.isBanned 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                                  : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
                                } ${actionLoading === user.id ? 'opacity-50 cursor-wait' : ''}`}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : user.isBanned ? (
                                  <Unlock size={16} />
                                ) : (
                                  <Ban size={16} />
                                )}
                                <span>{user.isBanned ? "فك الحظر" : "حظر"}</span>
                              </button>

                              {user.type === "Citizen" && (
                                <button
                                  onClick={() => handleDeleteCitizen(user.id, user.name)}
                                  disabled={actionLoading === user.id}
                                  className="flex items-center gap-2 px-4 py-2 text-rose-700 bg-rose-100 hover:bg-rose-700 hover:text-white border border-rose-200 rounded-xl transition-all text-xs font-black cursor-pointer"
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={16} />
                                  )}
                                  <span>حذف نهائي</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black italic shadow-inner">
                              <Lock size={14} /> <span>إجراءات مقيدة</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <div className="text-[11px] text-slate-500 font-bold">
                  عرض {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} من {filteredUsers.length} مستخدم
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={goToPrevPage} disabled={currentPage === 1} className={`p-2 rounded-xl transition-all ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'}`}>
                    <ChevronRight size={18} />
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    <button key={index} onClick={() => typeof page === 'number' && goToPage(page)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === page ? 'bg-emerald-500 text-white shadow-md' : page === '...' ? 'text-slate-400 cursor-default' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'}`} disabled={page === '...'}>
                      {page}
                    </button>
                  ))}
                  
                  <button onClick={goToNextPage} disabled={currentPage === totalPages} className={`p-2 rounded-xl transition-all ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100 cursor-pointer'}`}>
                    <ChevronLeft size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Popup تفاصيل المستخدم المحسن والآمن إدارياً */}
      {showPopup && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closePopup}
          >
            <div 
              className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* رأس الـ Popup */}
              <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 text-white">
                <button 
                  style={{cursor:"pointer"}}
                  onClick={closePopup}
                  className="absolute left-4 top-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-3 border-4 border-white/30">
                    {selectedUser.profilePictureUrl ? (
                      <img src={selectedUser.profilePictureUrl} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                  </div>
                  <h2 className="text-xl font-black">{selectedUser.name}</h2>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold mt-2 ${selectedUser.type === 'Staff' ? 'bg-emerald-400/30 text-emerald-100' : 'bg-blue-400/30 text-blue-100'}`}>
                    {selectedUser.type === 'Staff' ? <ShieldCheck size={12} /> : <Smartphone size={12} />}
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              {/* جسم الـ Popup والمعلومات */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Mail size={16} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-400 font-bold">البريد الإلكتروني</p>
                    <p className="text-[11px] font-black text-slate-700 mt-1 break-all">{selectedUser.email}</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Phone size={16} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-400 font-bold">رقم الهاتف</p>
                    <p className="text-[11px] font-black text-slate-700 mt-1">{selectedUser.phoneNumber}</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <MapPin size={16} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-400 font-bold">الموقع</p>
                    <p className="text-[11px] font-black text-slate-700 mt-1">{selectedUser.location}</p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <Info size={16} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-[9px] text-slate-400 font-bold">الحالة</p>
                    <p className={`text-[11px] font-black mt-1 ${selectedUser.isBanned ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedUser.isBanned ? 'محظور' : 'نشط'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold">المعرف (ID)</span>
                    <span className="text-[9px] font-mono text-slate-500">{selectedUser.id}</span>
                  </div>
                  {selectedUser.createdAt && selectedUser.createdAt !== "غير محدد" && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold">تاريخ التسجيل</span>
                      <span className="text-[9px] text-slate-600">{selectedUser.createdAt}</span>
                    </div>
                  )}
                </div>

                {/* ✅ تعديل قسم إدارة الرتب لمنع الوقوع في الأخطاء البشرية */}
                {userRole === "SuperAdmin" && selectedUser.type === "Staff" && (
                  <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 space-y-3">
                    <label className="text-[11px] font-black text-amber-800 flex items-center gap-2">
                      <Award size={14} /> تعديل الصلاحية أو الرتبة الوظيفية:
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={pendingRole || ""}
                        disabled={actionLoading === selectedUser.id}
                        onChange={(e) => setPendingRole(e.target.value)}
                        className="flex-1 bg-white border border-amber-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-amber-500 shadow-sm text-slate-700 cursor-pointer"
                      >
                        {/* خيار افتراضي يعرض الحالة الحالية ولا يقبل الإرسال */}
                        <option value="" disabled>
                          اختر رتبة جديدة... (الحالية: {selectedUser.role})
                        </option>
                        {/* منع ظهور الرتبة الحالية كخيار متاح وقابل للاختيار لعدم استهلاك API بدون تغيير */}
                        {selectedUser.role !== "MunicipalEmployee" && (
                          <option value="MunicipalEmployee">MunicipalEmployee (موظف بلدية)</option>
                        )}
                        {selectedUser.role !== "SuperAdmin" && (
                          <option value="SuperAdmin">SuperAdmin (مدير عام)</option>
                        )}
                      </select>

                      {/* زر التأكيد المنفصل لحماية تجربة المستخدم من التغيير الفوري */}
                      <button
                        onClick={handleUpdateRole}
                        disabled={actionLoading === selectedUser.id || !pendingRole || pendingRole === selectedUser.role}
                        className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-black transition-all ${
                          pendingRole && pendingRole !== selectedUser.role
                            ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 cursor-pointer"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        {actionLoading === selectedUser.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>تأكيد</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* أزرار الحظر والحذف في الـ Popup */}
                {canControl(selectedUser.type) && (
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-3">
                      <button 
                        style={{cursor:"pointer"}}
                        onClick={() => toggleBan(selectedUser.id, selectedUser.isBanned)}
                        disabled={actionLoading === selectedUser.id}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all text-sm font-bold cursor-pointer ${
                          selectedUser.isBanned 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white" 
                            : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white"
                        } ${actionLoading === selectedUser.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {actionLoading === selectedUser.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : selectedUser.isBanned ? (
                          <Unlock size={16} />
                        ) : (
                          <Ban size={16} />
                        )}
                        {selectedUser.isBanned ? "فك الحظر" : "حظر المستخدم"}
                      </button>
                    </div>

                    {selectedUser.type === "Citizen" && (
                      <button
                        style={{cursor:"pointer"}}
                        onClick={() => handleDeleteCitizen(selectedUser.id, selectedUser.name)}
                        disabled={actionLoading === selectedUser.id}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-100 cursor-pointer"
                      >
                        {actionLoading === selectedUser.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        <span>حذف المواطن نهائياً من السجلات</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;