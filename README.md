# Waselni 10th — توصيل العاشر

نسخة محسّنة من مشروع توصيل العاشر: Web + PWA + تجهيز Android عبر Capacitor.

## أهم الإضافات
- تسجيل مندوب ببيانات كاملة وبريد إلكتروني.
- رفع البطاقة الأمامية والخلفية، الصورة الشخصية، وصورة المركبة إلى Firebase Storage.
- حالة المندوب تبدأ `pending` ولا يمكنه الدخول حتى اعتماد الإدارة.
- لوحة اعتماد للمندوبين مع معاينة المستندات وقبول/رفض وسبب الرفض.
- إشعار للمندوب عند الاعتماد أو الرفض.
- تحسينات UI وmicro-interactions وresponsive approval cards.
- إعداد Capacitor لإضافة Android وبناء APK/AAB.

## تشغيل الويب

```bash
npm install
npm run serve
```

افتح `http://localhost:8080`.

## Android

بعد تثبيت Android Studio وAndroid SDK:

```bash
npm install
npm run android:add
npm run cap:sync
npm run android:open
```

ولبناء Debug APK من Windows:

```bash
npm run android:build:debug
```

وللـRelease بعد إعداد signing:

```bash
npm run android:build:release
```

## Firebase

الإعداد الحالي يستخدم Firestore وStorage. **قبل النشر الحقيقي يجب تأمين Firestore وStorage باستخدام Firebase Authentication وSecurity Rules تعتمد على هوية المستخدم/claims، وعدم استخدام القواعد المفتوحة الموجودة في الملفات كقواعد Production.**

لا ترفع مفاتيح سرية أو service-account JSON إلى GitHub.
