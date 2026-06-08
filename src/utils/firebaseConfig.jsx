
import { initializeApp } from "firebase/app";
// ✅ قمنا بتغيير getFirestore إلى initializeFirestore
import { initializeFirestore } from "firebase/firestore";

// ضع هنا بيانات الـ Config الخاصة بمشروعك (أعد كتابة قيمك السرية الحقيقية هنا)
const firebaseConfig = {
    apiKey: "AIzaSyD17WSBXpj810ZJRBWKPP9vowAqYEvREOw",

  authDomain: "psrs-chat.firebaseapp.com",
  projectId: "psrs-chat",
  storageBucket: "psrs-chat.firebasestorage.app",
  messagingSenderId: "663371783062",
  appId: "1:663371783062:web:6b9f954c5e0ab43f9b1bb7",
  measurementId: "G-RVSV4WMKYJ"
};

// تهيئة الفايربيز
const app = initializeApp(firebaseConfig);

// ✅ الحل الجذري للموبايل: إجبار الفايربيس على استخدام Long Polling لمنع انهيار الاتصال وتخطي الـ Unavailable
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});