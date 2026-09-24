/* توصيل العاشر - طبقة قاعدة البيانات المحلية IndexedDB */
(function(){
  'use strict';
  const DB_NAME='delivery10th_db', DB_VERSION=1;
  const STORES=['users','orders','notifications','audit_logs','settings','sessions','locations','zones'];
  let dbPromise=null, liveDb=null;
  function reqToPromise(req){return new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error);});}
  function open(){
    if(liveDb) return Promise.resolve(liveDb);
    if(dbPromise) return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const r=indexedDB.open(DB_NAME,DB_VERSION);
      r.onupgradeneeded=()=>{
        const db=r.result;
        const defs={
          users:{key:'id',idx:[['phone','phone',true],['role','role'],['status','status']]},
          orders:{key:'id',idx:[['clientId','clientId'],['courierId','courierId'],['status','status'],['createdAt','createdAt']]},
          notifications:{key:'id',idx:[['userId','userId'],['read','read'],['createdAt','createdAt']]},
          audit_logs:{key:'id',idx:[['actorId','actorId'],['action','action'],['createdAt','createdAt']]},
          settings:{key:'key',idx:[]},sessions:{key:'id',idx:[['userId','userId']]},
          locations:{key:'id',idx:[['userId','userId'],['createdAt','createdAt']]},
          zones:{key:'id',idx:[['name','name']]}
        };
        Object.keys(defs).forEach(name=>{
          if(!db.objectStoreNames.contains(name)){
            const d=defs[name], s=db.createObjectStore(name,{keyPath:d.key});
            d.idx.forEach(x=>s.createIndex(x[0],x[1],{unique:!!x[2]}));
          }
        });
      };
      r.onsuccess=()=>{
        const db=r.result;
        // المتصفح ممكن يقفل الاتصال تلقائياً (مثلاً لما التاب يبقى في الخلفية لفترة،
        // أو لو حصل تعارض إصدارات مع تاب تاني). من غير المعالجة دي، أي عملية بعد
        // الإغلاق كانت بتطلع خطأ "The database connection is closing".
        db.onclose=()=>{liveDb=null;dbPromise=null;};
        db.onversionchange=()=>{db.close();liveDb=null;dbPromise=null;};
        liveDb=db;
        resolve(db);
      };
      r.onerror=()=>{dbPromise=null;reject(r.error);};
      r.onblocked=()=>{dbPromise=null;reject(new Error('قاعدة البيانات مستخدمة في تاب آخر، أغلق التابات الأخرى وحاول تاني'));};
    });
    return dbPromise;
  }
  // نفّذ عملية IndexedDB مع إعادة محاولة واحدة لو الاتصال كان بيتقفل في نفس اللحظة
  async function withDb(fn){
    try{
      const db=await open();
      return await fn(db);
    }catch(e){
      if(e && (e.name==='InvalidStateError' || /closing|closed/i.test(String(e.message||'')))){
        liveDb=null;dbPromise=null;
        const db=await open();
        return await fn(db);
      }
      throw e;
    }
  }
  async function tx(store,mode,fn){return withDb(db=>new Promise((resolve,reject)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let out;try{out=fn(s);}catch(e){reject(e);return;}t.oncomplete=()=>resolve(out);t.onerror=()=>reject(t.error);}));}
  async function all(store){return withDb(db=>reqToPromise(db.transaction(store,'readonly').objectStore(store).getAll()));}
  async function get(store,key){return withDb(db=>reqToPromise(db.transaction(store,'readonly').objectStore(store).get(key)));}
  async function put(store,obj){return withDb(db=>reqToPromise(db.transaction(store,'readwrite').objectStore(store).put(obj)));}
  async function add(store,obj){return withDb(db=>reqToPromise(db.transaction(store,'readwrite').objectStore(store).add(obj)));}
  async function del(store,key){return withDb(db=>reqToPromise(db.transaction(store,'readwrite').objectStore(store).delete(key)));}
  async function clear(store){return withDb(db=>reqToPromise(db.transaction(store,'readwrite').objectStore(store).clear()));}
  async function count(store){return withDb(db=>reqToPromise(db.transaction(store,'readonly').objectStore(store).count()));}
  const now=()=>new Date().toISOString();
  const uid=(p)=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
  const hash=async s=>{if(globalThis.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(s)));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return ('00000000'+(h>>>0).toString(16)).slice(-8);};
  const normalizePhone=p=>String(p||'').replace(/\D/g,'');
  const ZONE_NAMES=['الحي الأول','الحي الثاني','الحي الثالث','الحي الرابع','الحي الخامس','الحي السادس','الحي السابع','الحي الثامن','الحي العاشر','المنطقة الصناعية الأولى','المنطقة الصناعية الثانية','المنطقة الصناعية الثالثة'];
  async function seed(){
    if(await count('users')) return;
    const zones=[]; for(const name of ZONE_NAMES){const z={id:uid('zone'),name,createdAt:now()};zones.push(z);await put('zones',z);}
    const admin={id:uid('usr'),name:'مدير النظام',phone:'01000000000',passwordHash:await hash('123456'),role:'admin',status:'active',createdAt:now(),updatedAt:now(),avatar:'',bio:'',address:'',permissions:['*']};
    const client={id:uid('usr'),name:'عميل تجريبي',phone:'01000000001',passwordHash:await hash('123456'),role:'client',status:'active',createdAt:now(),updatedAt:now(),avatar:'',bio:'',address:'العاشر من رمضان'};
    const courier={id:uid('usr'),name:'مندوب تجريبي',phone:'01000000002',passwordHash:await hash('123456'),role:'courier',status:'active',online:false,rating:5,earnings:0,completedOrders:0,createdAt:now(),updatedAt:now(),avatar:'',bio:'',address:'',specialty:'توصيل موتوسيكل',zoneId:zones[0]?.id||null};
    const courier2={id:uid('usr'),name:'مندوب تجريبي 2',phone:'01000000003',passwordHash:await hash('123456'),role:'courier',status:'active',online:false,rating:5,earnings:0,completedOrders:0,createdAt:now(),updatedAt:now(),avatar:'',bio:'',address:'',specialty:'توصيل سيارة - شحنات كبيرة',zoneId:zones[1]?.id||null};
    await put('users',admin);await put('users',client);await put('users',courier);await put('users',courier2);
    await put('settings',{key:'app',value:{name:'توصيل العاشر',city:'العاشر من رمضان',baseFare:20,perKm:8,currency:'ج.م'},updatedAt:now()});
    await log(admin.id,'system_seed','تهيئة قاعدة البيانات');
  }
  async function log(actorId,action,details,data){await put('audit_logs',{id:uid('log'),actorId:actorId||null,action,details:details||'',data:data||null,createdAt:now()});}
  async function notify(userId,title,message,type='info',meta){await put('notifications',{id:uid('not'),userId,title,message,type,meta:meta||null,read:false,createdAt:now()});}
  async function login(phone,password,role){
    const p=normalizePhone(phone), h=await hash(password), users=await all('users');
    const u=users.find(x=>x.phone===p&&x.role===role&&x.status==='active');
    if(!u||u.passwordHash!==h) throw new Error('بيانات الدخول غير صحيحة أو الحساب موقوف');
    const sid=uid('ses');await put('sessions',{id:sid,userId:u.id,createdAt:now(),expiresAt:new Date(Date.now()+86400000).toISOString()});
    await log(u.id,'login','تسجيل دخول'); return {...u,passwordHash:undefined,sessionId:sid};
  }
  async function createUser(data,actor){
    const phone=normalizePhone(data.phone); if(!/^01\d{9}$/.test(phone)) throw new Error('رقم الهاتف غير صحيح');
    if((await all('users')).some(x=>x.phone===phone)) throw new Error('رقم الهاتف مستخدم بالفعل');
    const u={id:uid('usr'),name:String(data.name).trim(),phone,passwordHash:await hash(data.password),role:data.role||'client',status:data.status||'active',createdAt:now(),updatedAt:now(),online:false,rating:data.role==='courier'?5:undefined,earnings:0,completedOrders:0};
    await put('users',u);await log(actor,'create_user','إنشاء حساب '+u.role,{userId:u.id});return u;
  }
  async function updateUser(id,patch,actor){const u=await get('users',id);if(!u) throw new Error('الحساب غير موجود');Object.assign(u,patch,{updatedAt:now()});if(patch.password) {u.passwordHash=await hash(patch.password);delete u.password;}if(patch.phone)u.phone=normalizePhone(patch.phone);await put('users',u);await log(actor,'update_user','تعديل حساب',{userId:id,patch});return u;}
  async function deleteUser(id,actor){const u=await get('users',id);if(!u) return;if(u.role==='admin'&&(await all('users')).filter(x=>x.role==='admin'&&x.status==='active').length<=1)throw new Error('لا يمكن حذف آخر مدير فعال');await del('users',id);await log(actor,'delete_user','حذف حساب',{userId:id});}
  window.DB={open,seed,all,get,put,add,del,clear,count,login,createUser,updateUser,deleteUser,notify,log,hash,normalizePhone,now,uid};
})();
