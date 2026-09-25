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

   apiKey: "AIzaSyC544YxggY8FLZmvJnk-lf5KfspqbopGZs",
  authDomain: "delivery-10th.firebaseapp.com",
  projectId: "delivery-10th",
  storageBucket: "delivery-10th.firebasestorage.app",
  messagingSenderId: "323841266616",
  appId: "1:323841266616:web:a2b6250d9b12efd61af54d",
  measurementId: "G-7TW6DK29T7"
};
