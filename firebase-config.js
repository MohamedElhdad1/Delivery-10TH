/*
  إعدادات Firebase — عشان كل الأجهزة (موبايلات وكمبيوترات) تشتغل على نفس قاعدة البيانات.

  خطوات سريعة (5 دقايق، مجاني بالكامل):
  1) افتح https://console.firebase.google.com وسجل دخول بحساب Google.
  2) اعمل مشروع جديد (Add project) — اديله أي اسم زي "delivery-10th".
  3) من القائمة الجانبية: Build > Firestore Database > Create database.
     - اختار أي Location قريب (مثلاً eur3).
     - في وضع البداية اختار "Start in test mode" (هنظبط الصلاحيات بعدين).
  4) من صفحة المشروع الرئيسية دوس على أيقونة الويب </> عشان تسجل تطبيق ويب جديد،
     وهيديك object فيه apiKey و authDomain و projectId ... الصقهم مكان القيم
     تحت دي بالظبط.
  5) احفظ الملف وارفع المشروع (كل الملفات مع بعض) على أي استضافة ثابتة
     زي Netlify أو Vercel أو GitHub Pages، وافتحه من أي جهاز.

  تنبيه أمان: القواعد اللي هنحطها دلوقتي (test mode) بتسمح لأي حد يقرأ/يكتب
  في قاعدة البيانات لو عرف رابط المشروع. ده مناسب للتجربة والاستخدام الداخلي
  بس مش لإطلاق حقيقي للعموم. قبل ما تطلق التطبيق فعلياً قولّي عشان نضيف
  حماية حقيقية (صلاحيات حسب نوع الحساب).
*/
window.FIREBASE_CONFIG = {

   apiKey: "AIzaSyCoULVGF_0OHNKFMOhRsrCF3qrAq3sH9_Q",
  authDomain: "delivery-10th-2deef.firebaseapp.com",
  projectId: "delivery-10th-2deef",
  storageBucket: "delivery-10th-2deef.firebasestorage.app",
  messagingSenderId: "792094138758",
  appId: "1:792094138758:web:5a12c11380e6a41aa30c07",
  measurementId: "G-ZCVSCHFP6J"
};
