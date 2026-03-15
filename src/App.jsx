import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ConnectionAlert from './components/Emergency/components/ConnectionAlert';

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // مراقبة حالة الشبكة بشكل عام في التطبيق كاملاً
    const handleStatusChange = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <>
      {/* هذا المكون سيظهر الآن في أي صفحة (بلدية، طوارئ، أو لوجن) عند انقطاع الشبكة */}
      <ConnectionAlert isDisconnected={!isOnline} />

      <Outlet />
    </>
  );
};

export default App;