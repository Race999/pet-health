/* =========================================================
   宠物健康档案 V0.6
   - 头像上传（IndexedDB）
   - 健康页四种可视化
   - 摘要生成 / 保存 / 分享图片
   - 日常页 7 天趋势
   - 饮食细分（主粮/罐头/零食/处方粮/湿粮）
   ========================================================= */

const STORAGE_KEY = 'petHealthV04';
const RECENT_KEY  = 'petHealthRecentV04';

/* ---------- 图标 ---------- */
const ICON_PATHS = {
  home:      '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar:  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  heart:     '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  plus:      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  bowl:      '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M8 6c0-1 1-2 2-2M14 4c1 0 2 1 2 2"/>',
  drop:      '<path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11z"/>',
  paw:       '<circle cx="6" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/><path d="M7 15c1-2 3-3 5-3s4 1 5 3c1 2-1 4-3 4h-4c-2 0-4-2-3-4z"/>',
  smile:     '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.5 2 4 2s3-.5 4-2"/><path d="M9 9h.01M15 9h.01" stroke-width="2.5"/>',
  moon:      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  activity:  '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  sparkles:  '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  scale:     '<path d="M12 3v2M6 5h12"/><path d="M6 5 3 13a3.5 3.5 0 0 0 7 0z"/><path d="M18 5l-3 8a3.5 3.5 0 0 0 7 0z"/><path d="M10 20h4"/>',
  syringe:   '<path d="M18 2 22 6M16 4 20 8M14 6l4 4-8 8H6v-4z"/><path d="M6 14l4 4"/>',
  shield:    '<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/><polyline points="9 12 11 14 15 10"/>',
  pill:      '<rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(-45 12 12)"/><line x1="9" y1="9" x2="15" y2="15"/>',
  hospital:  '<path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/><path d="M12 9v4M10 11h4"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6M9 19h4"/>',
  edit:      '<path d="M12 20h9"/><path d="m16 4 4 4L8 20H4v-4z"/>',
  trash:     '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  chevronL:  '<polyline points="15 6 9 12 15 18"/>',
  chevronR:  '<polyline points="9 6 15 12 9 18"/>',
  more:      '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  check:     '<polyline points="4 12 10 18 20 6"/>',
  file:      '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/>',
  image:     '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><polyline points="3 18 9 13 13 17 17 14 21 18"/>',
  bell:      '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M14 21a2 2 0 0 1-4 0"/>',
  share:     '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/>',
  download:  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  alert:     '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7" x2="12" y2="13"/><circle cx="12" cy="16.5" r=".5" fill="currentColor"/>',
  arrow_r:   '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  book:      '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>'
};

function icon(name, size) {
  size = size || 22;
  var d = ICON_PATHS[name] || '';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}

/* ---------- 色块 ---------- */
const SOFT = {
  orange: { bg: '#FDF0E3', fg: '#D6803F' },
  blue:   { bg: '#E8F0F5', fg: '#6689A3' },
  green:  { bg: '#EAF2E7', fg: '#6F9A6C' },
  pink:   { bg: '#F9EDED', fg: '#C77F86' },
  purple: { bg: '#F0ECF5', fg: '#8D7DA8' },
  red:    { bg: '#FAECEC', fg: '#C06F6F' },
  yellow: { bg: '#F8F1DF', fg: '#B59148' },
  gray:   { bg: '#F2EFEB', fg: '#8C877F' },
  indigo: { bg: '#EBEDF5', fg: '#7C7BA8' }
};

const TYPE_STYLE = {
  diet:     { icon: 'bowl',     color: 'orange', label: '饮食' },
  water:    { icon: 'drop',     color: 'blue',   label: '饮水' },
  poop:     { icon: 'paw',      color: 'green',  label: '排泄' },
  mood:     { icon: 'smile',    color: 'pink',   label: '情绪' },
  sleep:    { icon: 'moon',     color: 'indigo', label: '睡眠' },
  activity: { icon: 'activity', color: 'yellow', label: '活动' },
  care:     { icon: 'sparkles', color: 'purple', label: '护理' },
  health:   { icon: 'scale',    color: 'red',    label: '体重' }
};

const HEALTH_STYLE = {
  weight:     { icon: 'scale',      color: 'red',    label: '体重' },
  deworm:     { icon: 'shield',     color: 'green',  label: '驱虫' },
  vaccine:    { icon: 'syringe',    color: 'blue',   label: '疫苗' },
  visit:      { icon: 'hospital',   color: 'orange', label: '就诊' },
  medication: { icon: 'pill',       color: 'purple', label: '用药' },
  abnormal:   { icon: 'alert',      color: 'yellow', label: '异常' }
};

const TABS = [
  { k: 'home',    icon: 'home',     label: '首页' },
  { k: 'daily',   icon: 'calendar', label: '日常' },
  { k: 'health',  icon: 'heart',    label: '健康' },
  { k: 'profile', icon: 'user',     label: '档案' }
];

/* ---------- 工具 ---------- */
function pad(n) { return String(n).padStart(2, '0'); }
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function nowTime() {
  const d = new Date();
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function nowISO() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
function dateAdd(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}
function fmtMD(s) {
  if (!s) return '';
  const p = s.slice(0, 10).split('-');
  return (+p[1]) + '月' + p[2] + '日';
}
function fmtMD2(s) {
  if (!s) return '';
  const p = s.slice(0, 10).split('-');
  return p[1] + '/' + p[2];
}
function fmtYMD(s) {
  if (!s) return '';
  const p = s.slice(0, 10).split('-');
  return p[0] + '/' + p[1] + '/' + p[2];
}
function calcAge(birth) {
  if (!birth) return '—';
  const b = new Date(birth + 'T00:00:00');
  const n = new Date();
  if (isNaN(b.getTime())) return '—';
  let y = n.getFullYear() - b.getFullYear();
  let m = n.getMonth() - b.getMonth();
  if (n.getDate() < b.getDate()) m--;
  if (m < 0) { y--; m += 12; }
  if (y < 0) return '0个月';
  return y > 0 ? (y + '岁' + (m ? m + '个月' : '')) : (m + '个月');
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function byDateDesc(a, b) { return (b.date || '').localeCompare(a.date || ''); }

function greeting() {
  const h = new Date().getHours();
  if (h < 5)  return '夜深了';
  if (h < 11) return '早上好';
  if (h < 13) return '中午好';
  if (h < 18) return '下午好';
  if (h < 23) return '晚上好';
  return '夜深了';
}
function relativeDay(dateStr) {
  const t = todayStr();
  const diff = daysBetween(t, dateStr);
  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === 2) return '后天';
  if (diff > 0 && diff <= 30) return diff + '天后';
  if (diff === -1) return '昨天';
  return Math.abs(diff) + '天前';
}

/* =========================================================
   IndexedDB 头像
   ========================================================= */
let _db = null;
function idbOpen() {
  return new Promise(function (resolve, reject) {
    if (_db) return resolve(_db);
    if (!window.indexedDB) return reject(new Error('不支持 IndexedDB'));
    const req = indexedDB.open('petHealthDB', 1);
    req.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' });
      }
    };
    req.onsuccess = function (e) { _db = e.target.result; resolve(_db); };
    req.onerror = function () { reject(req.error); };
  });
}
function idbPut(obj) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('images', 'readwrite');
      const req = tx.objectStore('images').put(obj);
      req.onsuccess = function () { resolve(); };
      req.onerror = function () { reject(req.error); };
    });
  });
}
function idbGet(id) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('images', 'readonly');
      const req = tx.objectStore('images').get(id);
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  });
}
function idbDelete(id) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction('images', 'readwrite');
      const req = tx.objectStore('images').delete(id);
      req.onsuccess = function () { resolve(); };
      req.onerror = function () { reject(req.error); };
    });
  });
}

const avatarCache = {};
async function loadAvatarToCache(petId) {
  if (avatarCache[petId] !== undefined) return avatarCache[petId];
  try {
    const row = await idbGet(petId);
    if (!row || !row.blob) { avatarCache[petId] = ''; return ''; }
    const url = await blobToDataURL(row.blob);
    avatarCache[petId] = url;
    return url;
  } catch (e) { avatarCache[petId] = ''; return ''; }
}
async function saveAvatar(petId, blob) {
  await idbPut({ id: petId, blob: blob, updatedAt: nowISO() });
  const url = await blobToDataURL(blob);
  avatarCache[petId] = url;
  return url;
}
function blobToDataURL(blob) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function () { reject(reader.error); };
    reader.readAsDataURL(blob);
  });
}
function compressImage(file, maxW, maxH, quality) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        if (h > maxH) { w = w * maxH / h; h = maxH; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob); else reject(new Error('压缩失败'));
        }, 'image/jpeg', quality);
      };
      img.onerror = function () { reject(new Error('图片加载失败')); };
      img.src = reader.result;
    };
    reader.onerror = function () { reject(reader.error); };
    reader.readAsDataURL(file);
  });
}

/* ---------- 头像 SVG ---------- */
function petAvatarSVG(size) {
  size = size || 86;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" fill="none">' +
    '<circle cx="50" cy="50" r="50" fill="#FFE0C2"/>' +
    '<path d="M28 36 L22 20 L38 30 Z" fill="#D68A4F"/>' +
    '<path d="M72 36 L78 20 L62 30 Z" fill="#D68A4F"/>' +
    '<path d="M29 35 L25 24 L36 31 Z" fill="#F5BC8A"/>' +
    '<path d="M71 35 L75 24 L64 31 Z" fill="#F5BC8A"/>' +
    '<ellipse cx="50" cy="56" rx="28" ry="25" fill="#E89A5A"/>' +
    '<ellipse cx="50" cy="66" rx="18" ry="13" fill="#FFF1E0"/>' +
    '<circle cx="41" cy="54" r="3.5" fill="#2D2A27"/>' +
    '<circle cx="59" cy="54" r="3.5" fill="#2D2A27"/>' +
    '<circle cx="42.2" cy="52.7" r="1.2" fill="#fff"/>' +
    '<circle cx="60.2" cy="52.7" r="1.2" fill="#fff"/>' +
    '<path d="M48 62 L52 62 L50 64.5 Z" fill="#C77F86"/>' +
    '<path d="M50 64.5 Q50 68 46 68" stroke="#C77F86" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
    '<path d="M50 64.5 Q50 68 54 68" stroke="#C77F86" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
    '<line x1="30" y1="58" x2="38" y2="60" stroke="#A9724A" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="30" y1="64" x2="38" y2="64" stroke="#A9724A" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="70" y1="58" x2="62" y2="60" stroke="#A9724A" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="70" y1="64" x2="62" y2="64" stroke="#A9724A" stroke-width="1" stroke-linecap="round"/>' +
  '</svg>';
}
function dogAvatarSVG(size) {
  size = size || 86;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" fill="none">' +
    '<circle cx="50" cy="50" r="50" fill="#FFE0C2"/>' +
    '<ellipse cx="24" cy="52" rx="8" ry="16" fill="#C98A5C"/>' +
    '<ellipse cx="76" cy="52" rx="8" ry="16" fill="#C98A5C"/>' +
    '<ellipse cx="50" cy="54" rx="27" ry="24" fill="#E0A470"/>' +
    '<ellipse cx="50" cy="66" rx="15" ry="11" fill="#FFF1E0"/>' +
    '<circle cx="41" cy="52" r="3.5" fill="#2D2A27"/>' +
    '<circle cx="59" cy="52" r="3.5" fill="#2D2A27"/>' +
    '<circle cx="42.2" cy="50.7" r="1.2" fill="#fff"/>' +
    '<circle cx="60.2" cy="50.7" r="1.2" fill="#fff"/>' +
    '<ellipse cx="50" cy="62" rx="4" ry="3" fill="#2D2A27"/>' +
    '<path d="M50 65 Q50 70 45 70" stroke="#2D2A27" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
    '<path d="M50 65 Q50 70 55 70" stroke="#2D2A27" stroke-width="1.2" stroke-linecap="round" fill="none"/>' +
  '</svg>';
}
function petAvatarHTML(petObj, size) {
  size = size || 86;
  if (!petObj) return petAvatarSVG(size);
  const url = avatarCache[petObj.id];
  if (url) return '<img src="' + url + '" alt="">';
  const species = petObj.profile && petObj.profile.species;
  if (species === '狗') return dogAvatarSVG(size);
  return petAvatarSVG(size);
}

/* ---------- 种子数据 ---------- */
function seedDemo() {
  const t = todayStr();
  const d = function (n) { return dateAdd(t, n); };
  return {
    version: 4,
    currentPetId: 'pet_001',
    pets: [{
      id: 'pet_001',
      profile: {
        name: '团团', avatar: '', species: '猫', breed: '英短', gender: '公',
        birthDate: '2024-06-12', weight: 5.2, neutered: true, createdAt: nowISO(),
        ownerName: '', ownerPhone: '', ownerAlt: '',
        allergies: '', history: '', longTermMeds: '', hospital: '东莞XX宠物医院'
      },
      dailyRecords: [
        { id: 'd1', type: 'diet',  date: t, time: '08:10', data: { meal: '早餐', food: '主粮', appetite: '很好', amount: 35, note: '' } },
        { id: 'd2', type: 'diet',  date: t, time: '18:30', data: { meal: '晚餐', food: '罐头', appetite: '正常', amount: 40, note: '' } },
        { id: 'd3', type: 'water', date: t, time: '12:30', data: { amount: 80, source: '饮水机' } },
        { id: 'd4', type: 'poop',  date: t, time: '09:15', data: { subtype: '粪便', status: '正常' } },
        { id: 'd5', type: 'poop',  date: t, time: '13:20', data: { subtype: '尿液', status: '正常' } },
        { id: 'd6', type: 'mood',  date: t, time: '15:10', data: { mood: '开心', note: '粘人' } },
        { id: 'd7', type: 'care',  date: t, time: '20:00', data: { care: '梳毛' } }
      ],
      healthRecords: [
        { id: 'h1', type: 'weight', date: d(-29), title: '体重', detail: '5.0kg',  data: { value: 5.0 } },
        { id: 'h2', type: 'weight', date: d(-23), title: '体重', detail: '5.1kg',  data: { value: 5.1 } },
        { id: 'h3', type: 'weight', date: d(-16), title: '体重', detail: '5.1kg',  data: { value: 5.1 } },
        { id: 'h4', type: 'weight', date: d(-9),  title: '体重', detail: '5.15kg', data: { value: 5.15 } },
        { id: 'h5', type: 'weight', date: d(-4),  title: '体重', detail: '5.2kg',  data: { value: 5.2 } },
        { id: 'h6', type: 'weight', date: t,      title: '体重', detail: '5.2kg',  data: { value: 5.2 } },
        { id: 'h7', type: 'vaccine', date: d(-18), title: '猫三联疫苗', detail: '东莞XX宠物医院', data: { nextDate: d(347) } },
        { id: 'h8', type: 'deworm',  date: d(-18), title: '体内驱虫',   detail: '常规驱虫',     data: { nextDate: d(12) } },
        { id: 'h9', type: 'visit',   date: d(-10), title: '东莞XX宠物医院', detail: '食欲下降 · 已恢复', data: {} },
        { id: 'h10', type: 'visit',  date: d(-26), title: '东莞XX宠物医院', detail: '常规体检', data: {} }
      ],
      reminders: [
        { id: 'r1', title: '喂药', date: t, time: '20:00', icon: 'pill' }
      ]
    }]
  };
}

/* ---------- 数据读写 ---------- */
function validData(d) {
  if (!d || typeof d !== 'object') return false;
  if (!Array.isArray(d.pets) || !d.pets.length) return false;
  const p = d.pets[0];
  if (!p || !p.profile) return false;
  if (!Array.isArray(p.dailyRecords)) return false;
  if (!Array.isArray(p.healthRecords)) return false;
  if (!Array.isArray(p.reminders)) return false;
  return true;
}
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!validData(parsed)) throw new Error('结构异常');
    return parsed;
  } catch (err) {
    console.warn('数据异常，忽略：', err);
    return null;
  }
}
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  catch (e) { console.warn(e); }
}
function resetAll() {
  if (!confirm('确定重置所有数据吗？这会清空当前宠物的所有记录，并回到初始引导页。')) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RECENT_KEY);
  } catch (_) {}
  try { indexedDB.deleteDatabase('petHealthDB'); } catch (_) {}
  location.reload();
}

/* ---------- 全局状态 ---------- */
let DATA = null;
let currentTab = 'home';
let dailyDate = todayStr();
let pendingType = null;
let onboardingStep = null;
let trendType = 'weight'; // 30天趋势当前维度
function pet() {
  if (!DATA) return null;
  return DATA.pets.find(function (p) { return p.id === DATA.currentPetId; }) || DATA.pets[0];
}
function dailyRecords() { return (pet() && pet().dailyRecords) || []; }
function healthRecords() { return (pet() && pet().healthRecords) || []; }
function reminders() { return (pet() && pet().reminders) || []; }
function latestWeight() {
  const ws = healthRecords().filter(function (r) { return r.type === 'weight'; }).sort(byDateDesc);
  if (ws.length) return ws[0].data.value;
  return (pet() && pet().profile.weight) || 0;
}

/* ---------- 最近使用 ---------- */
function getRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (_) { return []; }
}
function pushRecent(type) {
  try {
    let arr = getRecent();
    arr = arr.filter(function (t) { return t !== type; });
    arr.unshift(type);
    arr = arr.slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  } catch (_) {}
}

/* ---------- 连续记录 ---------- */
function calcStreak() {
  const dates = new Set(dailyRecords().map(function (r) { return r.date; }));
  if (!dates.size) return { streak: 0, month: 0 };
  let streak = 0;
  let d = todayStr();
  while (dates.has(d)) { streak++; d = dateAdd(d, -1); }
  const thisMonth = todayStr().slice(0, 7);
  const month = new Set(Array.from(dates).filter(function (x) { return x.slice(0, 7) === thisMonth; })).size;
  return { streak: streak, month: month };
}

/* ---------- 渲染 ---------- */
function render() {
  try {
    if (!DATA) {
      renderOnboarding();
      document.getElementById('tabbar').style.display = 'none';
      document.getElementById('fab').style.display = 'none';
      return;
    }
    document.getElementById('tabbar').style.display = 'flex';
    document.getElementById('fab').style.display = 'flex';
    renderTabbar();
    if (currentTab === 'home') renderHome();
    else if (currentTab === 'daily') renderDaily();
    else if (currentTab === 'health') renderHealth();
    else renderProfile();
    window.scrollTo(0, 0);
  } catch (err) {
    console.error('渲染失败', err);
    document.getElementById('view').innerHTML =
      '<div style="padding:70px 24px;text-align:center">' +
        '<div style="font-size:44px;margin-bottom:16px">🐾</div>' +
        '<div style="font-size:16px;font-weight:800;margin-bottom:10px">页面加载出了点问题</div>' +
        '<div style="font-size:13px;color:#8C877F;line-height:1.7;margin-bottom:24px">可能是本地数据版本不兼容。</div>' +
        '<button onclick="resetAll()" style="padding:13px 28px;border-radius:14px;background:#E89458;color:#fff;font-weight:800;font-size:14px;border:0;cursor:pointer;font-family:inherit">重置本地数据</button>' +
      '</div>';
  }
}
function renderTabbar() {
  document.getElementById('tabbar').innerHTML = TABS.map(function (t) {
    return '<button data-tab="' + t.k + '" class="' + (currentTab === t.k ? 'active' : '') + '">' +
      icon(t.icon, 21) + '<span>' + t.label + '</span></button>';
  }).join('');
}

/* ---------- 引导页 ---------- */
function renderOnboarding() {
  if (!onboardingStep) onboardingStep = 'welcome';
  if (onboardingStep === 'welcome') {
    document.getElementById('view').innerHTML =
      '<div class="onboard">' +
        '<div class="onboard-logo">' + icon('paw', 44) + '</div>' +
        '<div class="onboard-title">给你的宠物<br>建一份专属档案</div>' +
        '<div class="onboard-sub">记录每天的生活<br>保存一生的健康</div>' +
        '<div class="onboard-actions">' +
          '<button class="btn btn-primary" id="onboardCreate">' + icon('plus', 18) + ' 创建宠物档案</button>' +
          '<button class="btn btn-ghost" id="onboardDemo">看看示例（团团）</button>' +
        '</div>' +
        '<div class="onboard-note">所有数据保存在本机浏览器</div>' +
      '</div>';
    return;
  }
  if (onboardingStep === 'create') {
    document.getElementById('view').innerHTML =
      '<div class="form-page">' +
        '<button class="back-btn" id="backToWelcome">' + icon('chevronL', 20) + '</button>' +
        '<div class="form-page-title">创建宠物档案</div>' +
        '<div class="form-page-sub">只需要几秒，之后可以随时修改</div>' +
        '<form id="createPetForm">' +
          field('名字', '<input type="text" data-field="name" placeholder="例如：团团" required>') +
          field('类型', chipGroup('species', ['猫', '狗', '其他'], '猫')) +
          field('品种', '<input type="text" data-field="breed" placeholder="例如：英短">') +
          field('性别', chipGroup('gender', ['公', '母'], '公')) +
          field('出生日期', '<input type="date" data-field="birthDate" value="2024-06-01">') +
          field('体重', '<div class="input-suffix"><input type="number" step="0.01" data-field="weight" value="4.5"><span>kg</span></div>') +
          '<div style="margin-top:26px"><button type="submit" class="btn btn-primary">' + icon('check', 18) + ' 完成</button></div>' +
        '</form>' +
      '</div>';
    return;
  }
}

/* ---------- 首页 ---------- */
function getUpcoming() {
  const t = todayStr();
  const now = nowTime();
  const items = [];
  reminders().forEach(function (r) {
    if (r.date && r.date >= t) {
      items.push({ icon: r.icon || 'bell', title: r.title || '提醒', date: r.date, time: r.time || '' });
    }
  });
  healthRecords().forEach(function (r) {
    const d = r.data || {};
    if (r.type === 'deworm' && d.nextDate && d.nextDate >= t) {
      items.push({ icon: 'shield', title: r.title || '驱虫', date: d.nextDate, time: '' });
    }
    if (r.type === 'vaccine' && d.nextDate && d.nextDate >= t) {
      items.push({ icon: 'syringe', title: r.title || '疫苗', date: d.nextDate, time: '' });
    }
    if (r.type === 'medication' && d.endDate && d.endDate >= t) {
      const time = d.time || '08:00';
      let nextDate = t;
      if (time <= now) nextDate = dateAdd(t, 1);
      if (nextDate <= d.endDate) {
        items.push({ icon: 'pill', title: r.title || '用药', date: nextDate, time: time });
      }
    }
  });
  items.sort(function (a, b) {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || '').localeCompare(b.time || '');
  });
  return items.slice(0, 3);
}

function renderHome() {
  const p = pet();
  const profile = p.profile;
  const t = todayStr();
  const today = dailyRecords().filter(function (r) { return r.date === t; });

  const dietCount = today.filter(function (r) { return r.type === 'diet'; }).length;
  const waterSum = today.filter(function (r) { return r.type === 'water'; }).reduce(function (s, r) { return s + (r.data.amount || 0); }, 0);
  const poopCount = today.filter(function (r) { return r.type === 'poop'; }).length;
  const mood = today.filter(function (r) { return r.type === 'mood'; }).sort(function (a, b) { return (b.time || '').localeCompare(a.time || ''); })[0];

  const weight = latestWeight();
  const upcoming = getUpcoming();
  const recent = healthRecords().slice().sort(byDateDesc).slice(0, 3);

  function cell(type, value, isEmpty) {
    const s = TYPE_STYLE[type];
    const c = SOFT[s.color];
    return '<button class="today-cell" data-quick="' + type + '">' +
      '<div class="ic-wrap" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(s.icon, 20) + '</div>' +
      '<div class="tcell-body"><div class="tcell-label">' + s.label + '</div>' +
      '<div class="tcell-value' + (isEmpty ? ' empty' : '') + '">' + value + '</div></div></button>';
  }

  const upcomingHtml = upcoming.length
    ? upcoming.map(function (it) {
        const when = relativeDay(it.date) + (it.time ? ' · ' + it.time : '');
        const isToday = it.date === t;
        const soon = daysBetween(t, it.date) <= 2;
        return '<div class="next-item">' +
          '<div class="ic-wrap" style="background:' + SOFT.orange.bg + ';color:' + SOFT.orange.fg + '">' + icon(it.icon, 20) + '</div>' +
          '<div class="next-body"><div class="next-title">' + esc(it.title) + '</div>' +
          '<div class="next-when">' + when + '</div></div>' +
          (isToday ? '<div class="next-badge soon">今天</div>' :
           soon ? '<div class="next-badge">' + relativeDay(it.date) + '</div>' : '') +
        '</div>';
      }).join('')
    : '<div class="empty-mini">暂时没有安排</div>';

  const recentHtml = recent.length
    ? recent.map(function (r) {
        const s = HEALTH_STYLE[r.type] || { icon: 'file', color: 'gray' };
        const c = SOFT[s.color];
        let detail = r.detail || '';
        if (r.type === 'vaccine' && r.data.nextDate) detail = '下次 ' + fmtYMD(r.data.nextDate);
        if (r.type === 'deworm' && r.data.nextDate) detail = '下次 ' + fmtYMD(r.data.nextDate);
        return '<div class="recent-item">' +
          '<div class="ic-wrap sm" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(s.icon, 18) + '</div>' +
          '<div class="recent-body"><div class="recent-title">' + esc(r.title || s.label) + '</div>' +
          (detail ? '<div class="recent-detail">' + esc(detail) + '</div>' : '') + '</div>' +
          '<div class="recent-date">' + fmtMD(r.date) + '</div></div>';
      }).join('')
    : '<div class="empty-mini">还没有健康记录</div>';

  document.getElementById('view').innerHTML =
    '<div class="greet"><div class="greet-sub">' + greeting() + ' 👋</div>' +
    '<div class="greet-title">今天也看看' + esc(profile.name) + '吧</div></div>' +
    '<div class="hero">' +
      '<div class="hero-tag">' + icon('sparkles', 12) + ' ' + esc(profile.name) + '的健康档案</div>' +
      '<div class="hero-avatar">' + petAvatarHTML(p, 86) + '</div>' +
      '<div class="hero-name">' + esc(profile.name) + '</div>' +
      '<div class="hero-meta">' + esc(profile.breed) + ' · ' + esc(profile.gender) + ' · ' + calcAge(profile.birthDate) + '</div>' +
      '<div class="hero-weight-row"><span class="hero-weight-num">' + weight + '</span><span class="hero-weight-unit">kg</span></div>' +
      '<div class="hero-status"><span class="dot"></span>今天状态不错</div>' +
    '</div>' +
    '<div class="section"><div class="section-head"><h2>今天</h2></div>' +
      '<div class="today-grid">' +
        cell('diet', dietCount === 0 ? '未记录' : dietCount + ' 次', dietCount === 0) +
        cell('water', waterSum === 0 ? '未记录' : waterSum + 'ml', waterSum === 0) +
        cell('poop', poopCount === 0 ? '未记录' : poopCount + ' 次', poopCount === 0) +
        cell('mood', !mood ? '未记录' : esc(mood.data.mood), !mood) +
      '</div>' +
    '</div>' +
    '<div class="section"><div class="section-head"><h2>接下来</h2></div>' +
      '<div class="next-list">' + upcomingHtml + '</div>' +
    '</div>' +
    '<button class="doctor-card" id="doctorCta">' +
      '<div class="doctor-icon">' + icon('clipboard', 22) + '</div>' +
      '<div class="doctor-text"><div class="doctor-title">给医生看我的健康摘要</div>' +
      '<div class="doctor-sub">疫苗 · 驱虫 · 用药 · 就诊 · 体重</div></div>' +
      '<div class="doctor-arrow">' + icon('chevronR', 20) + '</div>' +
    '</button>' +
    '<div class="section" style="margin-bottom:0">' +
      '<div class="section-head"><h2>最近</h2>' +
        '<button class="section-more" data-goto="health">查看全部 ' + icon('chevronR', 14) + '</button></div>' +
      '<div class="recent-list">' + recentHtml + '</div>' +
    '</div>';
}

/* ---------- 日常页 ---------- */
function dailyTitle(r) {
  switch (r.type) {
    case 'diet':     return r.data.meal + ' · ' + (r.data.food || '主粮');
    case 'water':    return '喝水';
    case 'poop':     return r.data.subtype === '尿液' ? '排尿' : '排便';
    case 'mood':     return '情绪';
    case 'sleep':    return '睡眠';
    case 'activity': return r.data.activity;
    case 'care':     return r.data.care;
    case 'health':   return '体重';
    default:         return '';
  }
}
function dailySub(r) {
  switch (r.type) {
    case 'diet':     return r.data.amount + 'g · 食欲 ' + r.data.appetite + (r.data.note ? ' · ' + r.data.note : '');
    case 'water':    return r.data.amount + 'ml · ' + r.data.source;
    case 'poop':     return r.data.status;
    case 'mood':     return (r.data.mood || '') + (r.data.note ? ' · ' + r.data.note : '');
    case 'sleep':    return r.data.duration + ' 小时';
    case 'activity': return r.data.duration + ' 分钟';
    case 'care':     return '';
    case 'health':   return r.data.value + 'kg';
    default:         return '';
  }
}

/* 7天趋势卡 */
function renderWeekTrend() {
  const allRecs = dailyRecords();
  const todayKey = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(dateAdd(todayKey, -i));

  const metrics = [
    { key: 'diet-main',  label: '主粮', icon: 'bowl', color: 'orange', unit: 'g',
      match: r => r.type === 'diet' && r.data.food === '主粮',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'diet-can',   label: '罐头', icon: 'bowl', color: 'yellow', unit: 'g',
      match: r => r.type === 'diet' && r.data.food === '罐头',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'diet-snack', label: '零食', icon: 'bowl', color: 'pink', unit: 'g',
      match: r => r.type === 'diet' && r.data.food === '零食',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'diet-rx',    label: '处方粮', icon: 'bowl', color: 'green', unit: 'g',
      match: r => r.type === 'diet' && r.data.food === '处方粮',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'diet-wet',   label: '湿粮', icon: 'bowl', color: 'blue', unit: 'g',
      match: r => r.type === 'diet' && r.data.food === '湿粮',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'water',      label: '饮水', icon: 'drop', color: 'blue', unit: 'ml',
      match: r => r.type === 'water',
      total: list => list.reduce((s, r) => s + (r.data.amount || 0), 0) },
    { key: 'poop',       label: '排泄', icon: 'paw', color: 'green', unit: '次',
      match: r => r.type === 'poop',
      total: list => list.length },
    { key: 'care',       label: '护理', icon: 'sparkles', color: 'purple', unit: '次',
      match: r => r.type === 'care',
      total: list => list.length }
  ];

  const bucket = {};
  days.forEach(d => { bucket[d] = {}; });
  allRecs.forEach(r => {
    if (!bucket[r.date]) return;
    metrics.forEach(m => {
      if (m.match(r)) {
        if (!bucket[r.date][m.key]) bucket[r.date][m.key] = [];
        bucket[r.date][m.key].push(r);
      }
    });
  });

  const activeMetrics = metrics.filter(m =>
    days.some(d => (bucket[d][m.key] || []).length > 0)
  );
  if (!activeMetrics.length) return '';

  const rows = activeMetrics.map(m => {
    const perDay = days.map(d => m.total(bucket[d][m.key] || []));
    const todayVal = perDay[perDay.length - 1];
    const maxVal = Math.max(1, Math.max.apply(null, perDay));
    const soft = SOFT[m.color];

    const cols = days.map((d, i) => {
      const v = perDay[i];
      const h = v === 0 ? 3 : Math.max(6, Math.round((v / maxVal) * 26));
      const isToday = d === todayKey;
      const color = v === 0 ? '#EDEAE4' : soft.fg;
      const numLabel = v === 0 ? '' : String(v);
      const dd = (+d.slice(8));
      return '<div class="wt-col">' +
        '<div class="wt-num">' + numLabel + '</div>' +
        '<div class="wt-bar' + (isToday ? ' today' : '') + '" ' +
          'style="height:' + h + 'px;background:' + color + '"></div>' +
        '<div class="wt-date' + (isToday ? ' today' : '') + '">' +
          (isToday ? '今' : dd) +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="wt-row">' +
      '<div class="wt-info">' +
        '<div class="ic-wrap sm" style="background:' + soft.bg + ';color:' + soft.fg + '">' + icon(m.icon, 16) + '</div>' +
        '<div><div class="wt-label">' + m.label + '</div>' +
        '<div class="wt-val">' + todayVal + ' <span>' + m.unit + '</span></div></div>' +
      '</div>' +
      '<div class="wt-chart">' + cols + '</div>' +
    '</div>';
  }).join('');

  return '<div class="week-trend">' + rows + '</div>';
}

function renderDaily() {
  const t = todayStr();
  if (dailyDate > t) dailyDate = t;

  const recs = dailyRecords()
    .filter(function (r) { return r.date === dailyDate; })
    .sort(function (a, b) { return (a.time || '').localeCompare(b.time || ''); });

  const isToday = dailyDate === t;
  const isYesterday = dailyDate === dateAdd(t, -1);
  const label = isToday ? '今天' : isYesterday ? '昨天' : '';
  const streak = calcStreak();

  let body;
  if (!recs.length) {
    body =
      '<div class="empty-state">' +
        '<div class="empty-illust">' + icon('book', 44) + '</div>' +
        '<div class="empty-title">这一天还没有记录</div>' +
        '<div class="empty-sub">花几秒钟记录' + esc(pet().profile.name) + '今天的状态吧</div>' +
        '<button class="empty-btn" id="emptyRecordBtn">' + icon('plus', 18) + ' 记录一下</button>' +
      '</div>';
  } else {
    body = '<div class="timeline">' +
      recs.map(function (r) {
        const s = TYPE_STYLE[r.type] || { icon: 'file', color: 'gray', label: '记录' };
        const c = SOFT[s.color];
        const sub = dailySub(r);
        return '<div class="tl-item">' +
          '<div class="tl-time">' + r.time + '</div>' +
          '<div class="tl-card" data-record-id="' + r.id + '" style="cursor:pointer">' +
            '<div class="tl-head">' +
              '<div class="ic-wrap sm" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(s.icon, 18) + '</div>' +
              '<div class="tl-title">' + esc(dailyTitle(r)) + '</div>' +
            '</div>' +
            (sub ? '<div class="tl-detail">' + esc(sub) + '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  document.getElementById('view').innerHTML =
    '<div class="greet">' +
      '<div class="greet-sub">' + esc(pet().profile.name) + '的生活</div>' +
      '<div class="greet-title">日常</div>' +
    '</div>' +
    (streak.streak > 0
      ? '<div class="streak-card">' +
          '<div class="streak-cell"><div class="streak-num">' + streak.streak + '<span>天</span></div><div class="streak-label">连续记录</div></div>' +
          '<div class="streak-cell"><div class="streak-num">' + streak.month + '<span>天</span></div><div class="streak-label">本月记录</div></div>' +
        '</div>'
      : '') +
    '<div class="date-nav">' +
      '<button class="date-arrow" data-nav="-1" aria-label="前一天">' + icon('chevronL', 20) + '</button>' +
      '<button class="date-current" id="dateCurrent">' +
        (label ? '<span class="dc-label">' + label + '</span>' : '') +
        '<span class="dc-date">' + fmtMD(dailyDate) + '</span>' +
      '</button>' +
      '<button class="date-arrow" data-nav="1"' + (isToday ? ' disabled' : '') + ' aria-label="后一天">' + icon('chevronR', 20) + '</button>' +
      '<button class="date-cal" id="dateCal" aria-label="选择日期">' + icon('calendar', 20) + '</button>' +
    '</div>' +
    '<input type="date" id="datePicker" class="hidden-date" value="' + dailyDate + '" max="' + t + '">' +
    renderWeekTrend() +
    body;
}

function shiftDate(delta) {
  const next = dateAdd(dailyDate, delta);
  if (next > todayStr()) return;
  dailyDate = next;
  renderDaily();
  window.scrollTo(0, 0);
}
function openDatePicker() {
  const el = document.getElementById('datePicker');
  if (!el) return;
  if (el.showPicker) el.showPicker();
  else el.click();
}

/* ---------- 健康页 ---------- */
/* 30天趋势图（可切换维度） */
function renderWeightChart() {
  const end = todayStr();
  const start = dateAdd(end, -29);
  const days = [];
  for (let i = 29; i >= 0; i--) days.push(dateAdd(end, -i));

  let values = [];
  let unit = '';

  if (trendType === 'weight') {
    unit = 'kg';
    const recs = healthRecords().filter(r => r.type === 'weight' && r.date >= start && r.date <= end);
    const byDate = {};
    recs.forEach(r => { byDate[r.date] = r.data.value; });
    values = days.map(d => byDate[d] || 0);
  } else if (trendType === 'diet-main' || trendType === 'diet-can') {
    unit = 'g';
    const food = trendType === 'diet-main' ? '主粮' : '罐头';
    const recs = dailyRecords().filter(r => r.date >= start && r.date <= end && r.type === 'diet' && r.data.food === food);
    const byDate = {};
    recs.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + (r.data.amount || 0); });
    values = days.map(d => byDate[d] || 0);
  } else if (trendType === 'water') {
    unit = 'ml';
    const recs = dailyRecords().filter(r => r.date >= start && r.date <= end && r.type === 'water');
    const byDate = {};
    recs.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + (r.data.amount || 0); });
    values = days.map(d => byDate[d] || 0);
  } else if (trendType === 'poop') {
    unit = '次';
    const recs = dailyRecords().filter(r => r.date >= start && r.date <= end && r.type === 'poop');
    const byDate = {};
    recs.forEach(r => { byDate[r.date] = (byDate[r.date] || 0) + 1; });
    values = days.map(d => byDate[d] || 0);
  }

  const hasData = values.some(v => v > 0);
  if (!hasData) return '<div class="chart-empty">这个维度还没有记录</div>';

  /* 体重：折线图 */
  if (trendType === 'weight') {
    const pts = [];
    days.forEach((d, i) => { if (values[i] > 0) pts.push({ x: i, y: values[i] }); });
    if (pts.length < 2) return '<div class="chart-empty">至少记录 2 次体重后显示趋势</div>';

    let min = Math.min.apply(null, pts.map(p => p.y));
    let max = Math.max.apply(null, pts.map(p => p.y));
    if (max - min < 0.4) { const mid = (max + min) / 2; min = mid - 0.3; max = mid + 0.3; }
    const pad = (max - min) * 0.16;
    min -= pad; max += pad;

    const W = 320, H = 130, padL = 34, padR = 12, padT = 12, padB = 24;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    function xOf(i) { return padL + (i / 29) * plotW; }
    function yOf(v) { return padT + (1 - (v - min) / (max - min)) * plotH; }

    const linePts = pts.map(p => ({ x: xOf(p.x), y: yOf(p.y) }));
    const line = linePts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const baseY = (padT + plotH).toFixed(1);
    const area = line + ' L ' + linePts[linePts.length - 1].x.toFixed(1) + ' ' + baseY + ' L ' + linePts[0].x.toFixed(1) + ' ' + baseY + ' Z';

    let grid = '';
    for (let i = 0; i <= 3; i++) {
      const y = padT + (plotH / 3) * i;
      const val = max - ((max - min) / 3) * i;
      grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="#F0EDE7" stroke-width="1"/>';
      grid += '<text x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" font-size="9" fill="#B5B0A8" text-anchor="end">' + val.toFixed(1) + '</text>';
    }
    const xLabels =
      '<text x="' + padL + '" y="' + (H - 6) + '" font-size="9" fill="#B5B0A8" text-anchor="start">' + fmtMD2(start) + '</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 6) + '" font-size="9" fill="#B5B0A8" text-anchor="end">' + fmtMD2(end) + '</text>';
    const dots = linePts.map(p => '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4" fill="#fff" stroke="#E89458" stroke-width="2.2"/>').join('');

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block">' +
      '<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#E89458" stop-opacity="0.22"/>' +
        '<stop offset="100%" stop-color="#E89458" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#wg)"/>' +
      '<path d="' + line + '" fill="none" stroke="#E89458" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      dots + xLabels + '</svg>';
  }

  /* 其他维度：柱状图 */
  const W = 320, H = 130, padL = 12, padR = 12, padT = 12, padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = Math.max(1, Math.max.apply(null, values));
  const barW = plotW / 30 * 0.65;

  let bars = '';
  let grid = '';
  for (let i = 0; i <= 2; i++) {
    const y = padT + (plotH / 2) * i;
    grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="#F0EDE7" stroke-width="1"/>';
  }
  days.forEach((d, i) => {
    const v = values[i];
    if (v === 0) return;
    const x = padL + (i / 29) * plotW;
    const h = Math.max(2, (v / maxVal) * plotH);
    const y = padT + plotH - h;
    const isToday = i === 29;
    bars += '<rect x="' + (x - barW / 2).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + (barW / 2).toFixed(1) + '" fill="' + (isToday ? '#D6803F' : '#E89458') + '" opacity="' + (isToday ? '1' : '0.75') + '"/>';
  });

  const xLabels =
    '<text x="' + padL + '" y="' + (H - 6) + '" font-size="9" fill="#B5B0A8" text-anchor="start">' + fmtMD2(start) + '</text>' +
    '<text x="' + (W - padR) + '" y="' + (H - 6) + '" font-size="9" fill="#B5B0A8" text-anchor="end">' + fmtMD2(end) + '</text>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block">' +
    grid + bars + xLabels + '</svg>';
}

function renderVaccineProgress() {
  const vacs = healthRecords().filter(function (r) { return r.type === 'vaccine'; }).sort(byDateDesc);
  if (!vacs.length) return '<div class="chart-empty">还没有疫苗记录</div>';
  const latest = vacs[0];
  const next = latest.data.nextDate;
  if (!next) return '<div class="chart-empty">未设置下次接种</div>';
  const total = daysBetween(latest.date, next);
  const passed = daysBetween(latest.date, todayStr());
  const pct = Math.max(0, Math.min(100, (passed / total) * 100));
  const left = daysBetween(todayStr(), next);
  return '<div class="vac-progress">' +
    '<div class="vp-head"><span class="vp-title">' + esc(latest.title || '疫苗') + '</span>' +
    '<span class="vp-days">' + (left > 0 ? '还有 ' + left + ' 天' : '已到期') + '</span></div>' +
    '<div class="vp-bar"><div class="vp-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="vp-foot"><span>' + fmtYMD(latest.date) + '</span><span>' + fmtYMD(next) + '</span></div>' +
  '</div>';
}

function renderDewormCountdown() {
  const dews = healthRecords().filter(function (r) { return r.type === 'deworm'; }).sort(byDateDesc);
  if (!dews.length) return '<div class="chart-empty">还没有驱虫记录</div>';
  const latest = dews[0];
  const next = latest.data.nextDate;
  if (!next) return '<div class="chart-empty">未设置下次驱虫</div>';
  const left = daysBetween(todayStr(), next);
  const status = left < 0 ? 'overdue' : left < 7 ? 'soon' : 'normal';
  const label = left < 0 ? '已过期 ' + Math.abs(left) + ' 天' : left === 0 ? '今天' : '还有 ' + left + ' 天';
  return '<div class="dew-card ' + status + '">' +
    '<div class="dew-num">' + left + '<span>天</span></div>' +
    '<div class="dew-label">' + label + '</div>' +
    '<div class="dew-date">下次 ' + fmtYMD(next) + '</div></div>';
}

function renderVisitChart() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: d.getFullYear() + '-' + pad(d.getMonth() + 1), label: (d.getMonth() + 1) + '月', count: 0 });
  }
  healthRecords().forEach(function (r) {
    if (r.type !== 'visit') return;
    const k = (r.date || '').slice(0, 7);
    const m = months.find(function (x) { return x.key === k; });
    if (m) m.count++;
  });
  const max = Math.max(1, Math.max.apply(null, months.map(function (m) { return m.count; })));
  return '<div class="visit-chart">' +
    months.map(function (m) {
      return '<div class="vc-col"><div class="vc-bar-wrap">' +
        '<div class="vc-bar" style="height:' + (m.count / max * 100) + '%"></div>' +
        (m.count > 0 ? '<span class="vc-num">' + m.count + '</span>' : '') +
      '</div><div class="vc-label">' + m.label + '</div></div>';
    }).join('') + '</div>';
}

function renderMedicationList() {
  const t = todayStr();
  const meds = healthRecords()
    .filter(function (r) { return r.type === 'medication' && r.data.endDate && r.data.endDate >= t; })
    .sort(function (a, b) { return a.data.endDate.localeCompare(b.data.endDate); });
  if (!meds.length) return '<div class="chart-empty">当前没有用药</div>';
  return '<div class="med-list">' + meds.map(function (m) {
    const left = daysBetween(t, m.data.endDate);
    return '<div class="med-item">' +
      '<div class="ic-wrap sm" style="background:' + SOFT.purple.bg + ';color:' + SOFT.purple.fg + '">' + icon('pill', 16) + '</div>' +
      '<div class="med-body"><div class="med-title">' + esc(m.title || '用药') + '</div>' +
      '<div class="med-sub">' + esc(m.detail || '') + ' · 至 ' + fmtYMD(m.data.endDate) + '</div></div>' +
      '<div class="med-days">剩 ' + left + ' 天</div></div>';
  }).join('') + '</div>';
}

function renderHealth() {
  const t = todayStr();
  const start30 = dateAdd(t, -29);
  const curWeight = latestWeight();
  const w30 = healthRecords()
    .filter(function (r) { return r.type === 'weight' && r.date >= start30 && r.date <= t; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  let changeHtml = '<span class="wh-change">近30天 · 数据不足</span>';
  if (w30.length >= 2) {
    const diff = w30[w30.length - 1].data.value - w30[0].data.value;
    const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
    const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '·';
    changeHtml = '<span class="wh-change ' + cls + '">' + arrow + ' ' + Math.abs(diff).toFixed(2) + ' kg · 近30天</span>';
  }

  const vac = healthRecords().filter(function (r) { return r.type === 'vaccine'; }).sort(byDateDesc)[0];
  const dew = healthRecords().filter(function (r) { return r.type === 'deworm'; }).sort(byDateDesc)[0];
  const med = healthRecords().filter(function (r) { return r.type === 'medication'; }).sort(byDateDesc)[0];
  const vis = healthRecords().filter(function (r) { return r.type === 'visit'; }).sort(byDateDesc)[0];
  const medActive = med && med.data.endDate && med.data.endDate >= t;

  function row(iconName, color, title, value, sub) {
    const c = SOFT[color];
    return '<div class="health-row">' +
      '<div class="ic-wrap" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(iconName, 20) + '</div>' +
      '<div class="hr-body"><div class="hr-title">' + title + '</div>' +
      '<div class="hr-value">' + esc(value) + '</div>' +
      (sub ? '<div class="hr-sub">' + esc(sub) + '</div>' : '') + '</div></div>';
  }

  const rows = [
    row('syringe', 'blue', '疫苗', vac ? (vac.title || '已记录') : '暂无记录',
      vac ? fmtYMD(vac.date) + (vac.data.nextDate ? ' · 下次 ' + fmtYMD(vac.data.nextDate) : '') : ''),
    row('shield', 'green', '驱虫', dew ? (dew.title || '已记录') : '暂无记录',
      dew ? fmtYMD(dew.date) + (dew.data.nextDate ? ' · 下次 ' + fmtYMD(dew.data.nextDate) : '') : ''),
    row('pill', 'purple', '用药', medActive ? (med.title + ' · ' + (med.detail || '')) : '暂无用药',
      medActive && med.data.endDate ? '至 ' + fmtYMD(med.data.endDate) : ''),
    row('hospital', 'orange', '就诊', vis ? (vis.title || '已就诊') : '暂无记录',
      vis ? fmtYMD(vis.date) + (vis.detail ? ' · ' + vis.detail : '') : '')
  ];

  const sorted = healthRecords().slice().sort(byDateDesc);
  const years = {};
  sorted.forEach(function (r) {
    const y = (r.date || '').slice(0, 4);
    if (!years[y]) years[y] = [];
    years[y].push(r);
  });

  let timelineHtml = '';
  const yearKeys = Object.keys(years).sort().reverse();
  if (!yearKeys.length) {
    timelineHtml = '<div class="empty-mini">还没有健康记录</div>';
  } else {
    yearKeys.forEach(function (y) {
      timelineHtml += '<div class="tl-year">' + y + '</div>';
      years[y].forEach(function (r) {
        const s = HEALTH_STYLE[r.type] || { icon: 'file', color: 'gray', label: '记录' };
        const c = SOFT[s.color];
        let detail = r.detail || '';
        if (r.type === 'vaccine' && r.data.nextDate) detail = '下次 ' + fmtYMD(r.data.nextDate);
        if (r.type === 'deworm' && r.data.nextDate) detail = '下次 ' + fmtYMD(r.data.nextDate);
        timelineHtml +=
          '<div class="htl-item"><div class="htl-date">' + fmtMD2(r.date) + '</div>' +
          '<div class="htl-body"><div class="htl-title">' +
            '<span style="color:' + c.fg + '">' + icon(s.icon, 15) + '</span> ' + esc(r.title || s.label) +
          '</div>' + (detail ? '<div class="htl-detail">' + esc(detail) + '</div>' : '') + '</div></div>';
      });
    });
  }

  document.getElementById('view').innerHTML =
    '<div class="greet"><div class="greet-sub">' + esc(pet().profile.name) + '的健康</div>' +
    '<div class="greet-title">健康档案</div></div>' +
    '<div class="weight-hero">' +
      '<div class="wh-label">' + icon('scale', 13) + ' 当前体重</div>' +
      '<div class="wh-value">' + curWeight + '<span>kg</span></div>' +
      '<div style="margin-top:10px">' + changeHtml + '</div>' +
    '</div>' +
       '<div class="card">' +
      '<div class="trend-tabs">' +
        [
          { k: 'weight',    label: '体重' },
          { k: 'diet-main', label: '主粮' },
          { k: 'diet-can',  label: '罐头' },
          { k: 'water',     label: '饮水' },
          { k: 'poop',      label: '排泄' }
        ].map(function (t) {
          return '<button class="trend-tab' + (trendType === t.k ? ' active' : '') + '" data-trend="' + t.k + '">' + t.label + '</button>';
        }).join('') +
      '</div>' +
      '<div class="chart-wrap">' + renderWeightChart() + '</div>' +
    '</div>' +
    '<div class="card" style="padding:18px 20px">' +
      '<div class="section-head" style="margin:0 0 14px"><h2 style="font-size:14px">疫苗进度</h2></div>' +
      renderVaccineProgress() + '</div>' +
    '<div class="card" style="padding:18px 20px">' +
      '<div class="section-head" style="margin:0 0 14px"><h2 style="font-size:14px">驱虫倒计时</h2></div>' +
      renderDewormCountdown() + '</div>' +
    '<div class="card" style="padding:18px 20px">' +
      '<div class="section-head" style="margin:0 0 14px"><h2 style="font-size:14px">近 6 个月就诊</h2></div>' +
      renderVisitChart() + '</div>' +
    '<div class="card" style="padding:18px 20px">' +
      '<div class="section-head" style="margin:0 0 14px"><h2 style="font-size:14px">当前用药</h2></div>' +
      renderMedicationList() + '</div>' +
    '<div class="section"><div class="section-head"><h2>健康档案</h2></div>' +
      '<div class="health-grid">' + rows.join('') + '</div></div>' +
    '<div class="section"><div class="section-head"><h2>健康时间轴</h2></div>' +
      '<div class="card" style="padding:18px 20px 8px">' + timelineHtml + '</div></div>' +
    '<button class="doctor-card" id="doctorBtn2" style="margin-bottom:20px">' +
      '<div class="doctor-icon">' + icon('clipboard', 22) + '</div>' +
      '<div class="doctor-text"><div class="doctor-title">给医生看</div>' +
      '<div class="doctor-sub">整理成一份健康摘要</div></div>' +
      '<div class="doctor-arrow">' + icon('chevronR', 20) + '</div></div>' +
    '</button>';
}

/* ---------- 档案页 ---------- */
function renderProfile() {
  const p = pet();
  const profile = p.profile;
  const weight = latestWeight();

  function infoRow(k, v, muted) {
    return '<div class="info-row"><span class="k">' + k + '</span>' +
      '<span class="v' + (muted ? ' muted' : '') + '">' + (v || '—') + '</span></div>';
  }
  function docRow(iconName, color, title, sub) {
    const c = SOFT[color];
    return '<button class="info-row" style="width:100%;border:0;background:none;font-family:inherit;text-align:left;cursor:pointer" data-doc="' + title + '">' +
      '<span style="display:flex;align-items:center;gap:12px">' +
        '<span class="ic-wrap sm" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(iconName, 18) + '</span>' +
        '<span><div style="font-size:14px;font-weight:600;color:#2D2A27">' + title + '</div>' +
        (sub ? '<div style="font-size:11.5px;color:#8C877F;margin-top:1px">' + sub + '</div>' : '') + '</span>' +
      '</span>' +
      '<span style="color:#B5B0A8">' + icon('chevronR', 16) + '</span></button>';
  }

  document.getElementById('view').innerHTML =
    '<div class="id-card">' +
      '<div class="id-brand">✦ MY PET ✦</div>' +
      '<div class="id-avatar">' + petAvatarHTML(p, 88) + '</div>' +
      '<div class="id-name">' + esc(profile.name) + '</div>' +
      '<div class="id-sub">' + esc(profile.breed) + ' · ' + esc(profile.gender) + '</div>' +
      '<div class="id-stats">' +
        '<div class="id-stat"><div class="is-num">' + calcAge(profile.birthDate) + '</div><div class="is-label">年龄</div></div>' +
        '<div class="id-stat"><div class="is-num">' + weight + 'kg</div><div class="is-label">体重</div></div>' +
        '<div class="id-stat"><div class="is-num">' + (profile.neutered ? '是' : '否') + '</div><div class="is-label">绝育</div></div>' +
      '</div>' +
    '</div>' +
    '<div class="section-head" style="margin:0 2px 10px"><h2>基本信息</h2></div>' +
    '<div class="info-card">' +
      infoRow('出生日期', profile.birthDate ? fmtYMD(profile.birthDate) : '') +
      infoRow('品种', profile.breed) +
      infoRow('性别', profile.gender) +
      infoRow('绝育', profile.neutered ? '已绝育' : '未绝育') +
    '</div>' +
    '<div class="section-head" style="margin:22px 2px 10px"><h2>重要信息</h2></div>' +
    '<div class="info-card">' +
      infoRow('过敏史', profile.allergies || '暂无记录', !profile.allergies) +
      infoRow('常去医院', profile.hospital || '未填写', !profile.hospital) +
    '</div>' +
    '<div class="section-head" style="margin:22px 2px 10px"><h2>重要资料</h2></div>' +
    '<div class="info-card" style="padding:0">' +
      docRow('file',  'blue',   '疫苗本', '疫苗接种记录本') +
      docRow('file',  'purple', '化验报告', '血常规、生化等') +
      docRow('file',  'green',  '检查单', '体检、影像检查') +
      docRow('image', 'orange', '照片资料', 'B超、X光等') +
    '</div>' +
    '<div style="margin:22px 0 20px">' +
      '<button class="btn btn-primary" id="doctorBtn3" style="margin-bottom:10px">' + icon('clipboard', 18) + ' 生成健康摘要</button>' +
      '<button class="btn btn-ghost" id="editProfileBtn" style="margin-bottom:10px">' + icon('edit', 18) + ' 编辑宠物资料</button>' +
      '<button class="btn btn-ghost" id="resetBtn">' + icon('trash', 18) + ' 重置所有数据</button>' +
    '</div>';
}

/* ---------- 弹窗 / Toast ---------- */
function openSheet(innerHtml) {
  const layer = document.getElementById('modalLayer');
  layer.innerHTML = '<div class="modal-mask"></div><div class="modal-sheet" role="dialog" aria-modal="true">' + innerHtml + '</div>';
  layer.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  const layer = document.getElementById('modalLayer');
  layer.classList.remove('show');
  layer.innerHTML = '';
  document.body.style.overflow = '';
}
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(function () { el.classList.remove('show'); }, 1800);
}

/* ---------- 快速记录 ---------- */
function openQuickRecord() {
  const ALL = [
    ['diet', 'bowl', 'orange', '吃饭'],
    ['water', 'drop', 'blue', '喝水'],
    ['poop', 'paw', 'green', '排泄'],
    ['mood', 'smile', 'pink', '情绪'],
    ['health', 'scale', 'red', '体重'],
    ['medication', 'pill', 'purple', '用药'],
    ['care', 'sparkles', 'purple', '护理'],
    ['visit', 'hospital', 'orange', '就诊']
  ];
  const recent = getRecent();
  let primary = [];
  let secondary = [];
  if (recent.length) {
    primary = recent.map(function (t) { return ALL.find(function (x) { return x[0] === t; }); }).filter(Boolean);
    secondary = ALL.filter(function (x) { return recent.indexOf(x[0]) < 0; });
  } else {
    primary = ALL.slice(0, 4);
    secondary = ALL.slice(4);
  }
  function gridHtml(items) {
    return '<div class="quick-grid">' + items.map(function (it) {
      const c = SOFT[it[2]];
      return '<button type="button" class="quick-item" data-quick-type="' + it[0] + '">' +
        '<div class="ic-wrap" style="background:' + c.bg + ';color:' + c.fg + '">' + icon(it[1], 22) + '</div>' +
        '<span class="ql">' + it[3] + '</span></button>';
    }).join('') + '</div>';
  }
  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">记录一下</h3>' +
    '<div class="sheet-sub">选一个开始，几秒搞定</div>' +
    (recent.length ? '<div class="quick-section-label">最近使用</div>' : '') +
    gridHtml(primary) +
    (secondary.length ? '<div class="quick-section-label">' + (recent.length ? '全部' : '') + '</div>' : '') +
    (secondary.length ? gridHtml(secondary) : '') +
    '<div style="height:20px"></div>'
  );
}

function field(label, inner) {
  return '<div class="field"><label>' + label + '</label>' + inner + '</div>';
}
function chipGroup(name, options, def) {
  return '<div class="chips" data-name="' + name + '">' + options.map(function (o) {
    return '<button type="button" class="chip' + (o === def ? ' active' : '') + '" data-value="' + o + '">' + o + '</button>';
  }).join('') + '</div>';
}

function openRecordForm(type) {
  pendingType = type;
  const timeField = field('时间', '<input type="time" data-field="time" value="' + nowTime() + '">');
  let title = '';
  let body = '';

  switch (type) {
    case 'diet':
      title = '记录吃饭';
      body = timeField +
        field('餐次', chipGroup('meal', ['早餐', '午餐', '晚餐', '加餐'], '早餐')) +
        field('食物', chipGroup('food', ['主粮', '罐头', '零食', '处方粮', '湿粮'], '主粮')) +
        field('食欲', chipGroup('appetite', ['很好', '正常', '一般', '不想吃'], '正常')) +
        field('分量', '<div class="input-suffix"><input type="number" inputmode="decimal" data-field="amount" value="35"><span>g</span></div>') +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;
    case 'water':
      title = '记录喝水';
      body = timeField +
        field('水量', '<div class="input-suffix"><input type="number" inputmode="decimal" data-field="amount" value="80"><span>ml</span></div>') +
        field('水源', chipGroup('source', ['饮水机', '水碗', '其他'], '饮水机'));
      break;
    case 'poop':
      title = '记录排泄';
      body = timeField +
        field('类型', chipGroup('subtype', ['粪便', '尿液'], '粪便')) +
        field('状态', chipGroup('status', ['正常', '偏软', '偏硬', '异常'], '正常'));
      break;
    case 'mood':
      title = '记录情绪';
      body = timeField +
        field('状态', chipGroup('mood', ['开心', '平静', '粘人', '焦虑', '低落'], '开心')) +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;
    case 'health':
      title = '记录体重';
      body = timeField +
        field('体重', '<div class="input-suffix"><input type="number" inputmode="decimal" step="0.01" data-field="value" value="' + latestWeight() + '"><span>kg</span></div>') +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;
    case 'care':
      title = '记录护理';
      body = timeField +
        field('护理项', chipGroup('careType', ['梳毛', '刷牙', '剪指甲', '洗澡', '清洁耳朵'], '梳毛'));
      break;
    case 'medication':
      title = '记录用药';
      body = field('药品', '<input type="text" data-field="title" placeholder="例：阿莫西林">') +
        field('用量', '<input type="text" data-field="detail" placeholder="例：每日2次">') +
        field('结束日期', '<input type="date" data-field="endDate" value="' + dateAdd(todayStr(), 7) + '">') +
        field('每日时间', '<input type="time" data-field="medTime" value="20:00">');
      break;
    case 'visit':
      title = '记录就诊';
      body = field('日期', '<input type="date" data-field="date" value="' + todayStr() + '">') +
        field('医院', '<input type="text" data-field="hospital" placeholder="宠物医院">') +
        field('原因', '<input type="text" data-field="reason" placeholder="例：呕吐、复诊">') +
        field('备注', '<textarea data-field="note" placeholder="检查、医生说明、用药等"></textarea>');
      break;
  }

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">' + title + '</h3>' +
    '<form id="recordForm">' +
      '<div class="sheet-body">' + body + '</div>' +
      '<div class="sheet-actions"><button type="submit" class="btn btn-primary">' + icon('check', 18) + ' 保存</button></div>' +
    '</form>'
  );
}

function handleSaveRecord() {
  const form = document.getElementById('recordForm');
  if (!form) return;
  const values = {};
  form.querySelectorAll('[data-field]').forEach(function (el) { values[el.dataset.field] = el.value; });
  form.querySelectorAll('.chips').forEach(function (g) {
    const a = g.querySelector('.chip.active');
    values[g.dataset.name] = a ? a.dataset.value : '';
  });

  const type = pendingType;
  const t = todayStr();
  const time = values.time || nowTime();
  pushRecent(type);

  if (type === 'medication') {
    healthRecords().push({
      id: uid('h'), type: 'medication', date: t, time: time,
      title: values.title || '用药', detail: values.detail || '',
      data: { endDate: values.endDate || dateAdd(t, 7), time: values.medTime || '20:00' }
    });
    saveData(DATA); closeSheet(); render(); toast('已记录');
    return;
  }
  if (type === 'visit') {
    healthRecords().push({
      id: uid('h'), type: 'visit', date: values.date || t, time: time,
      title: values.hospital || '就诊', detail: values.reason || '',
      data: { note: values.note || '' }
    });
    saveData(DATA); closeSheet(); render(); toast('已记录');
    return;
  }
  if (type === 'health') {
    const w = parseFloat(values.value) || 0;
    dailyRecords().push({
      id: uid('d'), type: 'health', date: t, time: time,
      createdAt: nowISO(), data: { value: w, note: values.note || '' }
    });
    healthRecords().push({
      id: uid('h'), type: 'weight', date: t, time: time,
      title: '体重', detail: w + 'kg', data: { value: w }
    });
    pet().profile.weight = w;
    saveData(DATA); closeSheet(); render(); toast('已记录');
    return;
  }

  const rec = { id: uid('d'), type: type, date: t, time: time, createdAt: nowISO(), data: {} };
  switch (type) {
    case 'diet':
      rec.data = {
        meal: values.meal || '早餐',
        food: values.food || '主粮',
        appetite: values.appetite || '正常',
        amount: parseFloat(values.amount) || 0,
        note: values.note || ''
      };
      break;
    case 'water':
      rec.data = { amount: parseFloat(values.amount) || 0, source: values.source || '饮水机' };
      break;
    case 'poop':
      rec.data = { subtype: values.subtype || '粪便', status: values.status || '正常' };
      break;
    case 'mood':
      rec.data = { mood: values.mood || '开心', note: values.note || '' };
      break;
    case 'care':
      rec.data = { care: values.careType || '梳毛' };
      break;
  }
  dailyRecords().push(rec);
  saveData(DATA); closeSheet(); render(); toast('已记录');
}

/* ---------- 健康摘要 ---------- */
function buildDoctorSummary() {
  const p = pet().profile;
  const t = todayStr();
  const date = new Date();
  const lines = [];
  lines.push(p.name + ' · 健康摘要');
  lines.push('生成日期：' + date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate()));
  lines.push('');
  lines.push('━━━ 基本信息 ━━━');
  lines.push('品种：' + p.breed);
  lines.push('性别：' + p.gender);
  lines.push('出生：' + (p.birthDate ? fmtYMD(p.birthDate) : '未填写'));
  lines.push('年龄：' + calcAge(p.birthDate));
  lines.push('当前体重：' + latestWeight() + ' kg');
  lines.push('绝育：' + (p.neutered ? '已绝育' : '未绝育'));
  lines.push('');

  const start30 = dateAdd(t, -29);
  const w30 = healthRecords().filter(function (r) { return r.type === 'weight' && r.date >= start30 && r.date <= t; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
  if (w30.length >= 2) {
    lines.push('━━━ 近 30 天体重 ━━━');
    lines.push(w30[0].data.value + ' kg  →  ' + w30[w30.length - 1].data.value + ' kg');
    lines.push('记录 ' + w30.length + ' 次');
    lines.push('');
  }

  const vacs = healthRecords().filter(function (r) { return r.type === 'vaccine'; }).sort(byDateDesc);
  lines.push('━━━ 疫苗 ━━━');
  if (vacs.length) {
    vacs.slice(0, 3).forEach(function (v) {
      let line = fmtYMD(v.date) + '  ' + (v.title || '疫苗');
      if (v.data.nextDate) line += '  （下次 ' + fmtYMD(v.data.nextDate) + '）';
      lines.push(line);
    });
  } else lines.push('暂无记录');
  lines.push('');

  const dews = healthRecords().filter(function (r) { return r.type === 'deworm'; }).sort(byDateDesc);
  lines.push('━━━ 驱虫 ━━━');
  if (dews.length) {
    dews.slice(0, 2).forEach(function (d) {
      let line = fmtYMD(d.date) + '  ' + (d.title || '驱虫');
      if (d.data.nextDate) line += '  （下次 ' + fmtYMD(d.data.nextDate) + '）';
      lines.push(line);
    });
  } else lines.push('暂无记录');
  lines.push('');

  const visits = healthRecords().filter(function (r) { return r.type === 'visit'; }).sort(byDateDesc);
  lines.push('━━━ 近期就诊 ━━━');
  if (visits.length) {
    visits.slice(0, 3).forEach(function (v) {
      lines.push(fmtYMD(v.date) + '  ' + (v.title || '就诊'));
      if (v.detail) lines.push('        ' + v.detail);
    });
  } else lines.push('暂无记录');
  lines.push('');

  const meds = healthRecords().filter(function (r) { return r.type === 'medication' && r.data.endDate && r.data.endDate >= t; }).sort(byDateDesc);
  lines.push('━━━ 当前用药 ━━━');
  if (meds.length) {
    meds.forEach(function (m) {
      lines.push((m.title || '用药') + '  ' + (m.detail || '') + '  至 ' + fmtYMD(m.data.endDate));
    });
  } else lines.push('暂无');
  lines.push('');

  if (p.allergies || p.history || p.longTermMeds) {
    lines.push('━━━ 特殊信息 ━━━');
    if (p.allergies) lines.push('过敏史：' + p.allergies);
    if (p.history) lines.push('既往病史：' + p.history);
    if (p.longTermMeds) lines.push('长期用药：' + p.longTermMeds);
  }
  return lines.join('\n');
}

function openDoctorSummary() {
  const p = pet();
  const t = todayStr();
  const text = buildDoctorSummary();
  const vac = healthRecords().filter(function (r) { return r.type === 'vaccine'; }).sort(byDateDesc)[0];
  const dew = healthRecords().filter(function (r) { return r.type === 'deworm'; }).sort(byDateDesc)[0];
  const vis = healthRecords().filter(function (r) { return r.type === 'visit'; }).sort(byDateDesc)[0];

  const start30 = dateAdd(t, -29);
  const w30 = healthRecords().filter(function (r) { return r.type === 'weight' && r.date >= start30 && r.date <= t; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
  let weightLine = latestWeight() + ' kg';
  if (w30.length >= 2) weightLine = w30[0].data.value + ' → ' + w30[w30.length - 1].data.value + ' kg';

  const shareCard =
    '<div class="share-card">' +
      '<div class="sc-brand">HEALTH RECORD</div>' +
      '<div class="sc-avatar">' + petAvatarHTML(p, 72) + '</div>' +
      '<div class="sc-name">' + esc(p.profile.name) + '</div>' +
      '<div class="sc-sub">' + esc(p.profile.breed) + ' · ' + esc(p.profile.gender) + ' · ' + calcAge(p.profile.birthDate) + '</div>' +
      '<div class="sc-divider"></div>' +
      '<div class="sc-row"><span class="sc-k">当前体重</span><span class="sc-v">' + latestWeight() + ' kg</span></div>' +
      (w30.length >= 2 ? '<div class="sc-row"><span class="sc-k">近30天</span><span class="sc-v">' + weightLine + '</span></div>' : '') +
      (vac ? '<div class="sc-row"><span class="sc-k">疫苗</span><span class="sc-v">' + esc(vac.title || '已记录') + '</span></div>' : '') +
      (dew && dew.data.nextDate ? '<div class="sc-row"><span class="sc-k">下次驱虫</span><span class="sc-v">' + fmtYMD(dew.data.nextDate) + '</span></div>' : '') +
      (vis ? '<div class="sc-row"><span class="sc-k">最近就诊</span><span class="sc-v">' + fmtYMD(vis.date) + '</span></div>' : '') +
      '<div class="sc-foot">' + esc(p.profile.name) + ' · 健康档案</div>' +
    '</div>';

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">' + esc(p.profile.name) + ' · 健康摘要</h3>' +
    '<div class="sheet-sub">可以直接截图或复制给医生</div>' +
    '<div class="sheet-body">' +
      shareCard +
      '<details style="margin-top:4px">' +
        '<summary style="cursor:pointer;font-size:13px;color:#8C877F;padding:8px 4px;user-select:none">查看完整文本摘要</summary>' +
        '<pre class="summary-pre" style="margin-top:10px">' + esc(text) + '</pre>' +
      '</details>' +
    '</div>' +
    '<div class="sheet-actions" style="display:flex;gap:8px">' +
      '<button type="button" class="btn btn-ghost" id="copySummaryBtn" style="flex:1;padding:12px 8px;font-size:13px">' + icon('clipboard', 16) + ' 复制</button>' +
      '<button type="button" class="btn btn-ghost" id="saveImageBtn" style="flex:1;padding:12px 8px;font-size:13px">' + icon('download', 16) + ' 保存图</button>' +
      '<button type="button" class="btn btn-primary" id="shareImageBtn" style="flex:1;padding:12px 8px;font-size:13px">' + icon('share', 16) + ' 分享图</button>' +
    '</div>'
  );
}

function copySummary() {
  const text = buildDoctorSummary();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      function () { toast('已复制，可以发给医生了'); },
      function () { fallbackCopyText(text); }
    );
  } else fallbackCopyText(text);
}
function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('已复制'); }
  catch (e) { toast('复制失败，请长按选择'); }
  ta.remove();
}

function generateShareImage() {
  return new Promise(async function (resolve, reject) {
    try {
      const p = pet();
      const profile = p.profile;
      const W = 750, H = 1050;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#FFF9F2');
      grad.addColorStop(0.6, '#FFFFFF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      const r = 40;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(W, 0, W, H, r);
      ctx.arcTo(W, H, 0, H, r);
      ctx.arcTo(0, H, 0, 0, r);
      ctx.arcTo(0, 0, W, 0, r);
      ctx.closePath();
      ctx.clip();

      const deco = ctx.createRadialGradient(W - 80, 80, 0, W - 80, 80, 300);
      deco.addColorStop(0, 'rgba(232,148,88,0.18)');
      deco.addColorStop(1, 'rgba(232,148,88,0)');
      ctx.fillStyle = deco;
      ctx.fillRect(0, 0, W, 400);

      ctx.fillStyle = '#D6803F';
      ctx.font = 'bold 22px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('H E A L T H   R E C O R D', W / 2, 80);

      const cx = W / 2, cy = 230, avR = 90;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, avR, 0, Math.PI * 2);
      ctx.fillStyle = '#FFEAD2';
      ctx.fill();
      ctx.clip();

      const avatarUrl = avatarCache[p.id];
      if (avatarUrl) {
        await new Promise(function (res) {
          const img = new Image();
          img.onload = function () { res(img); };
          img.onerror = function () { res(null); };
          img.src = avatarUrl;
        }).then(function (img) {
          if (img) ctx.drawImage(img, cx - avR, cy - avR, avR * 2, avR * 2);
        });
      } else {
        ctx.fillStyle = '#E89A5A';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 60, 54, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#D68A4F';
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy - 30); ctx.lineTo(cx - 52, cy - 62); ctx.lineTo(cx - 20, cy - 42); ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 40, cy - 30); ctx.lineTo(cx + 52, cy - 62); ctx.lineTo(cx + 20, cy - 42); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2D2A27';
        ctx.beginPath(); ctx.arc(cx - 20, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 20, cy, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#C77F86';
        ctx.beginPath();
        ctx.moveTo(cx - 6, cy + 20); ctx.lineTo(cx + 6, cy + 20); ctx.lineTo(cx, cy + 26); ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, avR + 3, 0, Math.PI * 2); ctx.stroke();

      ctx.fillStyle = '#2D2A27';
      ctx.font = 'bold 54px -apple-system, "PingFang SC", sans-serif';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(profile.name, W / 2, 400);

      ctx.fillStyle = '#8C877F';
      ctx.font = '26px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText((profile.breed || '') + ' · ' + (profile.gender || '') + ' · ' + calcAge(profile.birthDate), W / 2, 450);

      ctx.strokeStyle = '#ECE8E1'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(80, 510); ctx.lineTo(W - 80, 510); ctx.stroke();

      const vac = healthRecords().filter(function (x) { return x.type === 'vaccine'; }).sort(byDateDesc)[0];
      const dew = healthRecords().filter(function (x) { return x.type === 'deworm'; }).sort(byDateDesc)[0];
      const vis = healthRecords().filter(function (x) { return x.type === 'visit'; }).sort(byDateDesc)[0];

      const rows = [['当前体重', latestWeight() + ' kg']];
      if (vac) rows.push(['疫苗', vac.title || '已记录']);
      if (dew && dew.data.nextDate) rows.push(['下次驱虫', fmtYMD(dew.data.nextDate)]);
      if (vis) rows.push(['最近就诊', fmtYMD(vis.date)]);

      let ry = 580;
      rows.forEach(function (row) {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#8C877F';
        ctx.font = '26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(row[0], 90, ry);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#2D2A27';
        ctx.font = 'bold 28px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(row[1], W - 90, ry);
        ry += 60;
      });

      ctx.textAlign = 'center';
      ctx.fillStyle = '#B5B0A8';
      ctx.font = '22px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(profile.name + ' · 健康档案', W / 2, H - 60);
      ctx.restore();
      resolve(canvas.toDataURL('image/png'));
    } catch (e) { reject(e); }
  });
}

async function saveShareImage() {
  toast('生成图片中…');
  try {
    const dataUrl = await generateShareImage();
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = pet().profile.name + '-健康档案-' + todayStr() + '.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast('图片已保存');
  } catch (e) { console.error(e); toast('生成失败，请重试'); }
}
async function shareShareImage() {
  toast('生成图片中…');
  try {
    const dataUrl = await generateShareImage();
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], '健康档案.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: pet().profile.name + ' 健康档案', text: '宠物健康档案' });
    } else {
      saveShareImage();
    }
  } catch (e) {
    if (e.name !== 'AbortError') { console.error(e); toast('分享失败，试试保存图片'); }
  }
}

/* ---------- 编辑档案 ---------- */
function openProfileForm() {
  const p = pet();
  const profile = p.profile;
  const avatarUrl = avatarCache[p.id] || '';
  const avatarHtml =
    '<div class="avatar-upload-wrap">' +
      '<div class="avatar-upload-preview" id="avatarPreview">' +
        (avatarUrl ? '<img src="' + avatarUrl + '">' : '<span class="avatar-placeholder">＋</span><span>点击上传</span>') +
      '</div>' +
      '<input type="file" id="avatarFile" accept="image/*" hidden>' +
    '</div>';

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">编辑宠物资料</h3>' +
    '<form id="profileForm">' +
      '<div class="sheet-body">' +
        field('头像', avatarHtml) +
        field('名字', '<input type="text" data-field="name" value="' + esc(profile.name) + '">') +
        field('物种', chipGroup('species', ['猫', '狗', '其他'], profile.species)) +
        field('品种', '<input type="text" data-field="breed" value="' + esc(profile.breed) + '">') +
        field('性别', chipGroup('gender', ['公', '母'], profile.gender)) +
        field('出生日期', '<input type="date" data-field="birthDate" value="' + (profile.birthDate || '') + '">') +
        field('体重', '<div class="input-suffix"><input type="number" step="0.01" data-field="weight" value="' + (profile.weight || '') + '"><span>kg</span></div>') +
        field('绝育', chipGroup('neutered', ['已绝育', '未绝育'], profile.neutered ? '已绝育' : '未绝育')) +
        field('过敏史', '<input type="text" data-field="allergies" value="' + esc(profile.allergies || '') + '" placeholder="无">') +
        field('既往病史', '<input type="text" data-field="history" value="' + esc(profile.history || '') + '" placeholder="无">') +
        field('长期用药', '<input type="text" data-field="longTermMeds" value="' + esc(profile.longTermMeds || '') + '" placeholder="无">') +
        field('常去医院', '<input type="text" data-field="hospital" value="' + esc(profile.hospital || '') + '" placeholder="未填写">') +
      '</div>' +
      '<div class="sheet-actions"><button type="submit" class="btn btn-primary">' + icon('check', 18) + ' 保存</button></div>' +
    '</form>'
  );
}

function handleSaveProfile() {
  const form = document.getElementById('profileForm');
  if (!form) return;
  const values = {};
  form.querySelectorAll('[data-field]').forEach(function (el) { values[el.dataset.field] = el.value; });
  form.querySelectorAll('.chips').forEach(function (g) {
    const a = g.querySelector('.chip.active');
    values[g.dataset.name] = a ? a.dataset.value : '';
  });
  const profile = pet().profile;
  profile.name = values.name || profile.name;
  profile.species = values.species || profile.species;
  profile.breed = values.breed || profile.breed;
  profile.gender = values.gender || profile.gender;
  profile.birthDate = values.birthDate || profile.birthDate;
  profile.weight = parseFloat(values.weight) || profile.weight;
  profile.neutered = values.neutered === '已绝育';
  profile.allergies = values.allergies || '';
  profile.history = values.history || '';
  profile.longTermMeds = values.longTermMeds || '';
  profile.hospital = values.hospital || '';
  saveData(DATA); closeSheet(); render(); toast('档案已保存');
}

async function handleAvatarUpload(file) {
  if (!file) return;
  if (!/^image\//i.test(file.type)) { toast('请选择图片文件'); return; }
  if (file.size > 10 * 1024 * 1024) { toast('图片不能超过 10MB'); return; }
  try {
    const blob = await compressImage(file, 400, 400, 0.85);
    const p = pet();
    if (!p) { toast('请先创建宠物'); return; }
    const url = await saveAvatar(p.id, blob);
    const preview = document.getElementById('avatarPreview');
    if (preview) preview.innerHTML = '<img src="' + url + '">';
    toast('头像已更新');
  } catch (e) { console.error(e); toast('头像处理失败，请重试'); }
}

/* ---------- 创建宠物 ---------- */
function handleCreatePet(e) {
  e.preventDefault();
  const form = e.target;
  const values = {};
  form.querySelectorAll('[data-field]').forEach(function (el) { values[el.dataset.field] = el.value; });
  form.querySelectorAll('.chips').forEach(function (g) {
    const a = g.querySelector('.chip.active');
    values[g.dataset.name] = a ? a.dataset.value : '';
  });
  if (!values.name || !values.name.trim()) { toast('请填写名字'); return; }
  const id = uid('pet');
  DATA = {
    version: 4,
    currentPetId: id,
    pets: [{
      id: id,
      profile: {
        name: values.name.trim(), avatar: '',
        species: values.species || '猫', breed: values.breed || '',
        gender: values.gender || '公', birthDate: values.birthDate || '',
        weight: parseFloat(values.weight) || 0, neutered: false, createdAt: nowISO(),
        ownerName: '', ownerPhone: '', ownerAlt: '',
        allergies: '', history: '', longTermMeds: '', hospital: ''
      },
      dailyRecords: [], healthRecords: [], reminders: []
    }]
  };
  avatarCache[id] = '';
  saveData(DATA);
  onboardingStep = null; currentTab = 'home';
  render();
  toast('欢迎 ' + DATA.pets[0].profile.name);
}
function useDemo() {
  DATA = seedDemo();
  saveData(DATA);
  onboardingStep = null; currentTab = 'home';
  render();
  toast('已加载示例数据');
}

/* ---------- 全局事件 ---------- */
document.addEventListener('click', function (e) {
  if (e.target.closest('#onboardCreate')) { onboardingStep = 'create'; renderOnboarding(); return; }
  if (e.target.closest('#onboardDemo')) { useDemo(); return; }
  if (e.target.closest('#backToWelcome')) { onboardingStep = 'welcome'; renderOnboarding(); return; }

  const tab = e.target.closest('[data-tab]');
  if (tab) { currentTab = tab.dataset.tab; render(); return; }

  if (e.target.closest('#fab')) { openQuickRecord(); return; }
  const goto = e.target.closest('[data-goto]');
  if (goto) { currentTab = goto.dataset.goto; render(); return; }
  const quickCell = e.target.closest('[data-quick]');
  if (quickCell) { openRecordForm(quickCell.dataset.quick); return; }
     const trendTab = e.target.closest('[data-trend]');
  if (trendTab) {
    trendType = trendTab.dataset.trend;
    renderHealth();
    return;
  }

  const tlCard = e.target.closest('.tl-card[data-record-id]');
  if (tlCard) {
    openDailyRecordSheet(tlCard.dataset.recordId);
    return;
  }
  const quickType = e.target.closest('[data-quick-type]');
  if (quickType) {
    const t = quickType.dataset.quickType;
    closeSheet();
    setTimeout(function () { openRecordForm(t); }, 220);
    return;
  }
  if (e.target.closest('#emptyRecordBtn')) { openQuickRecord(); return; }

  const navBtn = e.target.closest('[data-nav]');
  if (navBtn && !navBtn.disabled) { shiftDate(parseInt(navBtn.dataset.nav, 10)); return; }
  if (e.target.closest('#dateCurrent') || e.target.closest('#dateCal')) { openDatePicker(); return; }

  if (e.target.closest('#doctorCta') || e.target.closest('#doctorBtn2') || e.target.closest('#doctorBtn3')) {
    openDoctorSummary(); return;
  }
  if (e.target.closest('#copySummaryBtn')) { copySummary(); return; }
  if (e.target.closest('#saveImageBtn')) { saveShareImage(); return; }
  if (e.target.closest('#shareImageBtn')) { shareShareImage(); return; }

  if (e.target.closest('#editProfileBtn')) { openProfileForm(); return; }
  if (e.target.closest('#resetBtn')) { resetAll(); return; }
  if (e.target.closest('#avatarPreview')) {
    const input = document.getElementById('avatarFile');
    if (input) input.click();
    return;
  }
  const docBtn = e.target.closest('[data-doc]');
  if (docBtn) { toast('文件管理即将开放'); return; }

  const chip = e.target.closest('.chip');
  if (chip) {
    const group = chip.closest('.chips');
    group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    chip.classList.add('active');
    return;
  }
  if (e.target.closest('.modal-mask')) { closeSheet(); return; }
});

document.addEventListener('submit', function (e) {
  if (e.target.id === 'recordForm') { e.preventDefault(); handleSaveRecord(); }
  if (e.target.id === 'profileForm') { e.preventDefault(); handleSaveProfile(); }
  if (e.target.id === 'createPetForm') { handleCreatePet(e); }
});

document.addEventListener('change', function (e) {
  if (e.target.id === 'datePicker' && e.target.value) {
    const v = e.target.value;
    if (v <= todayStr()) { dailyDate = v; renderDaily(); window.scrollTo(0, 0); }
  }
  if (e.target.id === 'avatarFile') {
    const file = e.target.files && e.target.files[0];
    if (file) handleAvatarUpload(file);
    e.target.value = '';
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeSheet();
});

/* ---------- 启动 ---------- */
/* ---------- 日常记录详情 + 删除 ---------- */
function openDailyRecordSheet(id) {
  const rec = dailyRecords().find(function (r) { return r.id === id; });
  if (!rec) return;
  const s = TYPE_STYLE[rec.type] || { icon: 'file', color: 'gray', label: '记录' };
  const c = SOFT[s.color];

  const rows = [
    ['时间', rec.time],
    ['类型', s.label]
  ];
  if (rec.type === 'diet') {
    rows.push(['餐次', rec.data.meal]);
    rows.push(['食物', rec.data.food || '主粮']);
    rows.push(['食欲', rec.data.appetite]);
    rows.push(['分量', (rec.data.amount || 0) + ' g']);
    if (rec.data.note) rows.push(['备注', rec.data.note]);
  } else if (rec.type === 'water') {
    rows.push(['水量', (rec.data.amount || 0) + ' ml']);
    rows.push(['水源', rec.data.source]);
  } else if (rec.type === 'poop') {
    rows.push(['类型', rec.data.subtype]);
    rows.push(['状态', rec.data.status]);
  } else if (rec.type === 'mood') {
    rows.push(['情绪', rec.data.mood]);
    if (rec.data.note) rows.push(['备注', rec.data.note]);
  } else if (rec.type === 'care') {
    rows.push(['护理项', rec.data.care]);
  } else if (rec.type === 'health') {
    rows.push(['体重', (rec.data.value || 0) + ' kg']);
    if (rec.data.note) rows.push(['备注', rec.data.note]);
  }

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">' + esc(dailyTitle(rec)) + '</h3>' +
    '<div class="sheet-sub">' + fmtMD(rec.date) + ' · ' + rec.time + '</div>' +
    '<div class="sheet-body">' +
      '<div class="record-detail-card">' +
        rows.map(function (r) {
          return '<div class="rd-row"><span class="rd-k">' + r[0] + '</span><span class="rd-v">' + esc(r[1]) + '</span></div>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div class="sheet-actions" style="display:flex;gap:10px">' +
      '<button type="button" class="btn btn-ghost" id="closeRecBtn" style="flex:1">关闭</button>' +
      '<button type="button" class="btn btn-danger" id="deleteRecBtn" style="flex:1;background:#D9534F;color:#fff">' +
        icon('trash', 16) + ' 删除' +
      '</button>' +
    '</div>'
  );

  document.getElementById('closeRecBtn').onclick = closeSheet;
  document.getElementById('deleteRecBtn').onclick = function () {
    if (!confirm('删除这条记录？删除后无法恢复。')) return;
    deleteDailyRecord(rec.id);
  };
}

function deleteDailyRecord(id) {
  const rec = dailyRecords().find(function (r) { return r.id === id; });
  if (!rec) return;
  const p = pet();
  p.dailyRecords = p.dailyRecords.filter(function (r) { return r.id !== id; });

  // 如果是体重记录，同步删除 healthRecords 里对应的那条
  if (rec.type === 'health') {
    p.healthRecords = p.healthRecords.filter(function (r) {
      return !(r.type === 'weight' && r.date === rec.date && r.data && r.data.value === rec.data.value);
    });
  }

  saveData(DATA);
  closeSheet();
  render();
  toast('已删除');
}
async function boot() {
  try { await idbOpen(); }
  catch (e) { console.warn('IndexedDB 不可用，头像功能将受限', e); }
  DATA = loadData();
  if (DATA) {
    for (let i = 0; i < DATA.pets.length; i++) {
      await loadAvatarToCache(DATA.pets[i].id);
    }
  }
  render();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
window.resetAll = resetAll;
