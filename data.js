/* توصيل العاشر - طبقة قاعدة البيانات (Firebase Firestore - قاعدة بيانات مشتركة بين كل الأجهزة) */
(function () {
  'use strict';

  // أسماء الحقل اللي بيتحدد بيه كل عنصر في كل مجموعة (افتراضياً "id")
  const KEY_FIELD = { settings: 'key' };
  const keyField = (store) => KEY_FIELD[store] || 'id';

  // Firebase configuration is intentionally embedded here so the project no longer depends on a separate firebase-config.js file.
  window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyCoULVGF_0OHNKFMOhRsrCF3qrAq3sH9_Q",
    authDomain: "delivery-10th-2deef.firebaseapp.com",
    projectId: "delivery-10th-2deef",
    storageBucket: "delivery-10th-2deef.firebasestorage.app",
    messagingSenderId: "792094138758",
    appId: "1:792094138758:web:5a12c11380e6a41aa30c07",
    measurementId: "G-ZCVSCHFP6J"
  };

  let db = null, fbReadyPromise = null;

  function ensureFirebase() {
    if (fbReadyPromise) return fbReadyPromise;
    fbReadyPromise = new Promise((resolve, reject) => {
      if (typeof firebase === 'undefined') {
        reject(new Error('مكتبة Firebase مش متحمّلة. تأكد إن ملفات firebase-app-compat.js و firebase-firestore-compat.js متضافة في index.html قبل data.js'));
        return;
      }
      if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.projectId || /ضع-قيمتك-هنا/.test(window.FIREBASE_CONFIG.projectId) || !window.FIREBASE_CONFIG.apiKey || /ضع-قيمتك-هنا/.test(window.FIREBASE_CONFIG.apiKey)) {
        reject(new Error('إعدادات Firebase غير مكتملة. ضع إعدادات مشروع Firebase داخل data.js إذا احتجت تغيير المشروع.'));
        return;
      }
      try {
        if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
        db = firebase.firestore();
        resolve(db);
      } catch (e) { reject(e); }
    });
    return fbReadyPromise;
  }

  // Firestore بيرفض أي قيمة undefined في المستند، فبنشيلها قبل الحفظ
  function stripUndefined(obj) {
    const out = {};
    Object.keys(obj || {}).forEach(k => { if (obj[k] !== undefined) out[k] = obj[k]; });
    return out;
  }

  function open() { return ensureFirebase(); }

  async function all(store) {
    await ensureFirebase();
    const snap = await db.collection(store).get();
    return snap.docs.map(d => d.data());
  }
  async function get(store, key) {
    if (key == null) return undefined;
    await ensureFirebase();
    const doc = await db.collection(store).doc(String(key)).get();
    return doc.exists ? doc.data() : undefined;
  }
  async function put(store, obj) {
    await ensureFirebase();
    const kf = keyField(store);
    const id = obj && obj[kf];
    if (id == null) throw new Error('عنصر بدون مفتاح (' + kf + ') عشان يتخزن في ' + store);
    const clean = stripUndefined(obj);
    await db.collection(store).doc(String(id)).set(clean);
    return clean;
  }
  async function add(store, obj) { return put(store, obj); }
  async function del(store, key) {
    await ensureFirebase();
    await db.collection(store).doc(String(key)).delete();
  }
  async function clear(store) {
    await ensureFirebase();
    const snap = await db.collection(store).get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  async function count(store) {
    await ensureFirebase();
    const snap = await db.collection(store).get();
    return snap.size;
  }

  const now = () => new Date().toISOString();
  const uid = (p) => p + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  const hash = async s => {
    if (globalThis.crypto && crypto.subtle) {
      const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    let h = 2166136261;
    for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  };
  const normalizePhone = p => String(p || '').replace(/\D/g, '');
  const ZONE_NAMES = ['الحي الأول', 'الحي الثاني', 'الحي الثالث', 'الحي الرابع', 'الحي الخامس', 'الحي السادس', 'الحي السابع', 'الحي الثامن', 'الحي العاشر', 'المنطقة الصناعية الأولى', 'المنطقة الصناعية الثانية', 'المنطقة الصناعية الثالثة'];

  async function seed() {
    // لو فيه مستخدمين محفوظين بالفعل في المشروع المشترك (من أي جهاز) منعملش سيد تاني
    if (await count('users')) return;
    const zones = [];
    for (const name of ZONE_NAMES) { const z = { id: uid('zone'), name, createdAt: now() }; zones.push(z); await put('zones', z); }
    const admin = { id: uid('usr'), name: 'مدير النظام', phone: '01000000000', passwordHash: await hash('123456'), role: 'admin', status: 'active', createdAt: now(), updatedAt: now(), avatar: '', bio: '', address: '', permissions: ['*'] };
    const client = { id: uid('usr'), name: 'عميل تجريبي', phone: '01000000001', passwordHash: await hash('123456'), role: 'client', status: 'active', createdAt: now(), updatedAt: now(), avatar: '', bio: '', address: 'العاشر من رمضان' };
    const courier = { id: uid('usr'), name: 'مندوب تجريبي', phone: '01000000002', passwordHash: await hash('123456'), role: 'courier', status: 'active', online: false, rating: 5, earnings: 0, completedOrders: 0, createdAt: now(), updatedAt: now(), avatar: '', bio: '', address: '', specialty: 'توصيل موتوسيكل', zoneId: zones[0]?.id || null };
    const courier2 = { id: uid('usr'), name: 'مندوب تجريبي 2', phone: '01000000003', passwordHash: await hash('123456'), role: 'courier', status: 'active', online: false, rating: 5, earnings: 0, completedOrders: 0, createdAt: now(), updatedAt: now(), avatar: '', bio: '', address: '', specialty: 'توصيل سيارة - شحنات كبيرة', zoneId: zones[1]?.id || null };
    await put('users', admin); await put('users', client); await put('users', courier); await put('users', courier2);
    await put('settings', { key: 'app', value: { name: 'توصيل العاشر', city: 'العاشر من رمضان', baseFare: 20, perKm: 8, currency: 'ج.م' }, updatedAt: now() });
    await log(admin.id, 'system_seed', 'تهيئة قاعدة البيانات');
  }
  async function log(actorId, action, details, data) { await put('audit_logs', { id: uid('log'), actorId: actorId || null, action, details: details || '', data: data || null, createdAt: now() }); }
  async function notify(userId, title, message, type = 'info', meta) { await put('notifications', { id: uid('not'), userId, title, message, type, meta: meta || null, read: false, createdAt: now() }); }
  async function login(phone, password, role) {
    const p = normalizePhone(phone), h = await hash(password), users = await all('users');
    const u = users.find(x => x.phone === p && x.role === role && x.status === 'active');
    if (!u || u.passwordHash !== h) throw new Error('بيانات الدخول غير صحيحة أو الحساب موقوف');
    const sid = uid('ses'); await put('sessions', { id: sid, userId: u.id, createdAt: now(), expiresAt: new Date(Date.now() + 86400000).toISOString() });
    await log(u.id, 'login', 'تسجيل دخول');
    const { passwordHash, ...rest } = u;
    return { ...rest, sessionId: sid };
  }
  async function createUser(data, actor) {
    const phone = normalizePhone(data.phone); if (!/^01\d{9}$/.test(phone)) throw new Error('رقم الهاتف غير صحيح');
    if ((await all('users')).some(x => x.phone === phone)) throw new Error('رقم الهاتف مستخدم بالفعل');
    const u = { id: uid('usr'), name: String(data.name).trim(), phone, passwordHash: await hash(data.password), role: data.role || 'client', status: data.status || 'active', createdAt: now(), updatedAt: now(), online: false, rating: data.role === 'courier' ? 5 : null, earnings: 0, completedOrders: 0 };
    await put('users', u); await log(actor, 'create_user', 'إنشاء حساب ' + u.role, { userId: u.id }); return u;
  }
  async function updateUser(id, patch, actor) {
    const u = await get('users', id); if (!u) throw new Error('الحساب غير موجود');
    Object.assign(u, patch, { updatedAt: now() });
    if (patch.password) { u.passwordHash = await hash(patch.password); delete u.password; }
    if (patch.phone) u.phone = normalizePhone(patch.phone);
    await put('users', u); await log(actor, 'update_user', 'تعديل حساب', { userId: id, patch }); return u;
  }
  async function deleteUser(id, actor) {
    const u = await get('users', id); if (!u) return;
    if (u.role === 'admin' && (await all('users')).filter(x => x.role === 'admin' && x.status === 'active').length <= 1) throw new Error('لا يمكن حذف آخر مدير فعال');
    await del('users', id); await log(actor, 'delete_user', 'حذف حساب', { userId: id });
  }

  window.DB = { open, seed, all, get, put, add, del, clear, count, login, createUser, updateUser, deleteUser, notify, log, hash, normalizePhone, now, uid };
})();
