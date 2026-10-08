/* =========================================================
   宠物个人档案 V0.1
   数据全部存放在 localStorage.petHealthArchive
   ========================================================= */

const STORAGE_KEY = 'petHealthArchive';

/* ---------- 元数据 ---------- */
const DAILY_META = {
  diet:     { icon: '🍚', label: '饮食' },
  water:    { icon: '💧', label: '饮水' },
  poop:     { icon: '💩', label: '排泄' },
  mood:     { icon: '😸', label: '情绪' },
  sleep:    { icon: '💤', label: '睡眠' },
  activity: { icon: '🎾', label: '活动' },
  care:     { icon: '🧼', label: '护理' },
  health:   { icon: '❤️', label: '健康' }
};

const HEALTH_META = {
  weight:     { icon: '⚖️', label: '体重' },
  deworm:     { icon: '🪱', label: '驱虫' },
  vaccine:    { icon: '💉', label: '疫苗' },
  visit:      { icon: '🏥', label: '就诊' },
  medication: { icon: '💊', label: '用药' },
  abnormal:   { icon: '🚨', label: '异常记录' }
};

const TABS = [
  { k: 'home',    icon: '🏠', label: '首页' },
  { k: 'daily',   icon: '📅', label: '日常' },
  { k: 'health',  icon: '❤️', label: '健康' },
  { k: 'profile', icon: '👤', label: '档案' }
];

const CARE_ITEMS = ['梳毛', '刷牙', '剪指甲'];

/* ---------- 工具函数 ---------- */
function pad(n) { return String(n).padStart(2, '0'); }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function nowTime() {
  const d = new Date();
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function dateAdd(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function daysBetween(a, b) {
  return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
}

/* 2026-10-08 -> 10月08日 */
function fmtMD(s) {
  const p = s.split('-');
  return (+p[1]) + '月' + p[2] + '日';
}
/* 2026-10-08 -> 10/08 */
function fmtMD2(s) {
  const p = s.split('-');
  return p[1] + '/' + p[2];
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
  return y > 0 ? (y + '岁' + m + '个月') : (m + '个月');
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function byDateDesc(a, b) { return b.date.localeCompare(a.date); }

/* =========================================================
   种子数据（首次打开时的示例，日期相对今天生成）
   ========================================================= */
function seedDemo() {
  const t = todayStr();
  const d = function (n) { return dateAdd(t, n); };

  return {
    version: 1,
    currentPetId: 'pet_001',
    pets: [{
      id: 'pet_001',
      profile: {
        name: '团团',
        avatar: '',
        species: '猫',
        breed: '英短',
        gender: '公',
        birthDate: '2024-06-12',
        weight: 5.2,
        neutered: true,
        createdAt: new Date().toISOString(),
        ownerName: '',
        ownerPhone: '',
        ownerAlt: '',
        allergies: '',
        history: '',
        longTermMeds: '',
        hospital: '东莞XX宠物医院'
      },
      dailyRecords: [
        { id: 'd1',  type: 'diet',     date: t, time: '08:10', data: { meal: '早餐', food: '主粮', appetite: '很好', amount: 35, note: '' } },
        { id: 'd2',  type: 'diet',     date: t, time: '18:30', data: { meal: '晚餐', food: '罐头', appetite: '正常', amount: 40, note: '' } },
        { id: 'd3',  type: 'water',    date: t, time: '12:30', data: { amount: 80, source: '饮水机' } },
        { id: 'd4',  type: 'poop',     date: t, time: '09:15', data: { subtype: '尿液', status: '正常' } },
        { id: 'd5',  type: 'poop',     date: t, time: '13:20', data: { subtype: '尿液', status: '正常' } },
        { id: 'd6',  type: 'poop',     date: t, time: '19:40', data: { subtype: '粪便', status: '正常' } },
        { id: 'd7',  type: 'mood',     date: t, time: '15:10', data: { mood: '开心', note: '粘人' } },
        { id: 'd8',  type: 'sleep',    date: t, time: '22:00', data: { duration: 9.5 } },
        { id: 'd9',  type: 'activity', date: t, time: '18:20', data: { activity: '玩耍', duration: 25 } },
        { id: 'd10', type: 'care',     date: t, time: '20:00', data: { care: '梳毛' } },
        { id: 'd11', type: 'care',     date: t, time: '20:05', data: { care: '刷牙' } },
        { id: 'd12', type: 'diet',     date: d(-1), time: '08:20', data: { meal: '早餐', food: '主粮', appetite: '正常', amount: 35, note: '' } },
        { id: 'd13', type: 'water',    date: d(-1), time: '11:00', data: { amount: 90, source: '饮水机' } },
        { id: 'd14', type: 'mood',     date: d(-1), time: '16:00', data: { mood: '平静', note: '' } },
        { id: 'd15', type: 'activity', date: d(-1), time: '19:00', data: { activity: '玩耍', duration: 30 } }
      ],
      healthRecords: [
        { id: 'h1',  type: 'weight',     date: t,      title: '体重',           detail: '5.2kg',        data: { value: 5.2 } },
        { id: 'h2',  type: 'weight',     date: d(-4),  title: '体重',           detail: '5.2kg',        data: { value: 5.2 } },
        { id: 'h3',  type: 'weight',     date: d(-9),  title: '体重',           detail: '5.15kg',       data: { value: 5.15 } },
        { id: 'h4',  type: 'weight',     date: d(-16), title: '体重',           detail: '5.1kg',        data: { value: 5.1 } },
        { id: 'h5',  type: 'weight',     date: d(-23), title: '体重',           detail: '5.1kg',        data: { value: 5.1 } },
        { id: 'h6',  type: 'weight',     date: d(-29), title: '体重',           detail: '5.0kg',        data: { value: 5.0 } },
        { id: 'h7',  type: 'deworm',     date: d(-7),  title: '体内驱虫',       detail: '下次：' + d(53), data: {} },
        { id: 'h8',  type: 'vaccine',    date: d(-18), title: '狂犬疫苗',       detail: '',             data: {} },
        { id: 'h9',  type: 'visit',      date: d(-26), title: '东莞XX宠物医院', detail: '常规体检',      data: {} },
        { id: 'h10', type: 'medication', date: d(-26), title: 'XXX',            detail: '每日2次',       data: {} },
        { id: 'h11', type: 'abnormal',   date: d(-28), title: '食欲下降',       detail: '需要观察',      data: {} }
      ],
      reminders: []
    }]
  };
}

/* =========================================================
   LocalStorage
   ========================================================= */
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const d = seedDemo();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return d;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.pets || !parsed.pets.length) throw new Error('结构异常');
    return parsed;
  } catch (error) {
    console.error('数据读取失败', error);
    const d = seedDemo();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return d;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let DATA = loadData();

/* =========================================================
   全局状态
   ========================================================= */
let currentTab = 'home';
let dailyDate = todayStr();
let pendingType = null;

function getPet() {
  return DATA.pets.find(function (p) { return p.id === DATA.currentPetId; }) || DATA.pets[0];
}

function latestWeight(pet) {
  const ws = pet.healthRecords
    .filter(function (r) { return r.type === 'weight'; })
    .sort(byDateDesc);
  if (ws.length) return ws[0].data.value;
  return pet.profile.weight || 0;
}

/* =========================================================
   渲染入口
   ========================================================= */
function render() {
  renderTabbar();
  if (currentTab === 'home') renderHome();
  else if (currentTab === 'daily') renderDaily();
  else if (currentTab === 'health') renderHealth();
  else renderProfile();
  window.scrollTo(0, 0);
}

function renderTabbar() {
  document.getElementById('tabbar').innerHTML = TABS.map(function (t) {
    return '<button data-tab="' + t.k + '" class="' + (currentTab === t.k ? 'active' : '') + '">' +
      '<span class="ico">' + t.icon + '</span><span>' + t.label + '</span>' +
    '</button>';
  }).join('');
}

/* =========================================================
   1. 首页
   ========================================================= */
function renderHome() {
  const pet = getPet();
  const p = pet.profile;
  const t = todayStr();
  const today = pet.dailyRecords.filter(function (r) { return r.date === t; });

  const dietCount = today.filter(function (r) { return r.type === 'diet'; }).length;
  const waterSum  = today.filter(function (r) { return r.type === 'water'; })
                         .reduce(function (s, r) { return s + (r.data.amount || 0); }, 0);
  const urine = today.filter(function (r) { return r.type === 'poop' && r.data.subtype === '尿液'; }).length;
  const stool = today.filter(function (r) { return r.type === 'poop' && r.data.subtype === '粪便'; }).length;
  const mood = today.filter(function (r) { return r.type === 'mood'; })
                    .sort(function (a, b) { return b.time.localeCompare(a.time); })[0];
  const sleepSum = today.filter(function (r) { return r.type === 'sleep'; })
                        .reduce(function (s, r) { return s + (r.data.duration || 0); }, 0);
  const actSum = today.filter(function (r) { return r.type === 'activity'; })
                      .reduce(function (s, r) { return s + (r.data.duration || 0); }, 0);
  const careCount = today.filter(function (r) { return r.type === 'care'; }).length;
  const weightVal = latestWeight(pet);
  const weightText = weightVal ? weightVal + 'kg' : '—';

  /* 30 天汇总 */
  const start30 = dateAdd(t, -29);

  const w30 = pet.healthRecords
    .filter(function (r) { return r.type === 'weight' && r.date >= start30 && r.date <= t; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  let weightTrend = '—';
  if (w30.length >= 2) {
    weightTrend = w30[0].data.value + ' → ' + w30[w30.length - 1].data.value + 'kg';
  }

  const water30 = pet.dailyRecords.filter(function (r) {
    return r.type === 'water' && r.date >= start30 && r.date <= t;
  });
  const waterDays = new Set(water30.map(function (r) { return r.date; })).size;
  const waterAvg = waterDays
    ? Math.round(water30.reduce(function (s, r) { return s + (r.data.amount || 0); }, 0) / waterDays)
    : 0;

  const diet30 = pet.dailyRecords.filter(function (r) {
    return r.type === 'diet' && r.date >= start30 && r.date <= t;
  }).length;

  /* 最近健康记录 */
  const recentHealth = pet.healthRecords.slice().sort(byDateDesc).slice(0, 3);

  /* 今日护理 */
  const doneCares = new Set(
    today.filter(function (r) { return r.type === 'care'; })
         .map(function (r) { return r.data.care; })
  );

  function metric(icon, val, label) {
    return '<div class="metric">' +
      '<div class="mi">' + icon + '</div>' +
      '<div class="mv">' + val + '</div>' +
      '<div class="ml">' + label + '</div>' +
    '</div>';
  }

  const html = '' +
    /* --- 宠物头卡 --- */
    '<div class="card">' +
      '<div class="hero">' +
        '<div class="avatar">' + (p.avatar ? '<img src="' + esc(p.avatar) + '" alt="">' : '🐱') + '</div>' +
        '<div class="hero-info">' +
          '<div class="hero-name">' + esc(p.name) + '</div>' +
          '<div class="hero-sub">' + esc(p.breed) + ' · ' + esc(p.gender) + ' · ' + calcAge(p.birthDate) + '</div>' +
          '<div class="hero-weight">' + weightText + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="status-line"><span class="dot"></span>今日状态：状态良好</div>' +
      '<button class="quick-btn" id="quickBtn">＋ 快速记录</button>' +
    '</div>' +

    /* --- 今天 --- */
    '<div class="section-title">今天</div>' +
    '<div class="metrics">' +
      metric('🍚', dietCount ? dietCount + '/3餐' : '—', '饮食') +
      metric('💧', waterSum ? waterSum + 'ml' : '—', '饮水') +
      metric('💩', (urine || stool) ? (urine + '尿' + stool + '便') : '—', '排泄') +
      metric('😸', mood ? esc(mood.data.mood) : '—', '情绪') +
      metric('💤', sleepSum ? sleepSum + 'h' : '—', '睡眠') +
      metric('🎾', actSum ? actSum + 'min' : '—', '活动') +
      metric('🧼', careCount ? careCount + '次' : '—', '护理') +
      metric('❤️', weightText, '健康') +
    '</div>' +

    /* --- 今日护理 --- */
    '<div class="card">' +
      '<div class="card-title">🧼 今日护理</div>' +
      '<div class="care-list">' +
        CARE_ITEMS.map(function (c) {
          return '<div class="care-item' + (doneCares.has(c) ? ' done' : '') + '" data-care="' + c + '">' +
            '<div class="care-box">✓</div>' +
            '<div class="care-text">' + c + '</div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>' +

    /* --- 最近健康记录 --- */
    '<div class="card">' +
      '<div class="card-title">❤️ 最近健康记录</div>' +
      '<div class="hlist">' +
        (recentHealth.length
          ? recentHealth.map(function (r) {
              const m = HEALTH_META[r.type] || { icon: '📌', label: '记录' };
              return '<div class="hitem">' +
                '<div class="hicon">' + m.icon + '</div>' +
                '<div class="hbody">' +
                  '<div class="hdate">' + fmtMD(r.date) + '</div>' +
                  '<div class="htitle">' + esc(r.title) + '</div>' +
                  (r.detail ? '<div class="hdetail">' + esc(r.detail) + '</div>' : '') +
                '</div>' +
              '</div>';
            }).join('')
          : '<div class="empty-mini">还没有健康记录</div>') +
      '</div>' +
    '</div>' +

    /* --- 最近30天 --- */
    '<div class="card">' +
      '<div class="card-title">📈 最近30天</div>' +
      '<div class="summary-row"><span class="k">体重趋势</span><span class="v">' + weightTrend + '</span></div>' +
      '<div class="summary-row"><span class="k">饮水趋势</span><span class="v">' + (waterAvg ? '平均 ' + waterAvg + 'ml/天' : '—') + '</span></div>' +
      '<div class="summary-row"><span class="k">饮食记录</span><span class="v">' + diet30 + '次</span></div>' +
    '</div>';

  document.getElementById('view').innerHTML = html;
}

/* =========================================================
   2. 日常页
   ========================================================= */
function dailyTitle(r) {
  switch (r.type) {
    case 'diet':     return r.data.meal + ' · ' + r.data.food;
    case 'water':    return '饮水';
    case 'poop':     return r.data.subtype;
    case 'mood':     return r.data.mood;
    case 'sleep':    return '睡眠';
    case 'activity': return r.data.activity;
    case 'care':     return r.data.care;
    case 'health':   return '体重 ' + r.data.value + 'kg';
    default:         return '';
  }
}

function dailySub(r) {
  switch (r.type) {
    case 'diet':     return r.data.amount + 'g　食欲：' + r.data.appetite + (r.data.note ? '　' + r.data.note : '');
    case 'water':    return r.data.amount + 'ml · ' + r.data.source;
    case 'poop':     return r.data.status;
    case 'mood':     return r.data.note || '';
    case 'sleep':    return r.data.duration + '小时';
    case 'activity': return r.data.duration + '分钟';
    case 'care':     return '';
    case 'health':   return r.data.note || '';
    default:         return '';
  }
}

function renderDaily() {
  const pet = getPet();
  const t = todayStr();

  const tabs = [];
  for (let i = 0; i < 6; i++) {
    const d = dateAdd(t, -i);
    tabs.push({
      d: d,
      label: i === 0 ? '今天' : i === 1 ? '昨天' : fmtMD(d)
    });
  }
  if (!tabs.some(function (x) { return x.d === dailyDate; })) dailyDate = t;

  const recs = pet.dailyRecords.filter(function (r) { return r.date === dailyDate; });
  const order = ['diet', 'water', 'poop', 'mood', 'sleep', 'activity', 'care', 'health'];

  let body = '';
  if (!recs.length) {
    body = '<div class="empty"><div class="eico">📝</div>这一天还没有记录</div>';
  } else {
    order.forEach(function (type) {
      const group = recs
        .filter(function (r) { return r.type === type; })
        .sort(function (a, b) { return a.time.localeCompare(b.time); });
      if (!group.length) return;

      const m = DAILY_META[type];
      body += '<div class="tl-group">' +
        '<div class="tl-head">' + m.icon + ' ' + m.label + '</div>' +
        group.map(function (r) {
          const sub = dailySub(r);
          return '<div class="tl-item">' +
            '<div class="tl-time">' + r.time + '</div>' +
            '<div class="tl-body">' +
              '<div class="tl-title">' + esc(dailyTitle(r)) + '</div>' +
              (sub ? '<div class="tl-sub">' + esc(sub) + '</div>' : '') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    });
  }

  document.getElementById('view').innerHTML =
    '<div class="date-tabs">' +
      tabs.map(function (x) {
        return '<button class="date-tab' + (x.d === dailyDate ? ' active' : '') + '" data-date="' + x.d + '">' + x.label + '</button>';
      }).join('') +
    '</div>' + body;
}

/* =========================================================
   3. 健康页
   ========================================================= */
function renderWeightChart() {
  const pet = getPet();
  const end = todayStr();
  const start = dateAdd(end, -29);

  const recs = pet.healthRecords
    .filter(function (r) { return r.type === 'weight' && r.date >= start && r.date <= end; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  if (recs.length < 2) {
    return '<div class="chart-empty">至少记录 2 次体重后显示趋势</div>';
  }

  const vals = recs.map(function (r) { return r.data.value; });
  let min = Math.min.apply(null, vals);
  let max = Math.max.apply(null, vals);

  if (max - min < 0.4) {
    const mid = (max + min) / 2;
    min = mid - 0.3;
    max = mid + 0.3;
  }
  const padding = (max - min) * 0.16;
  min -= padding;
  max += padding;

  const W = 320, H = 140, padL = 34, padR = 12, padT = 12, padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  function xOf(d) { return padL + (daysBetween(start, d) / 29) * plotW; }
  function yOf(v) { return padT + (1 - (v - min) / (max - min)) * plotH; }

  const pts = recs.map(function (r) {
    return { x: xOf(r.date), y: yOf(r.data.value) };
  });

  const line = pts.map(function (p, i) {
    return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
  }).join(' ');

  const baseY = (padT + plotH).toFixed(1);
  const area = line +
    ' L ' + pts[pts.length - 1].x.toFixed(1) + ' ' + baseY +
    ' L ' + pts[0].x.toFixed(1) + ' ' + baseY + ' Z';

  /* 网格 + Y 轴刻度 */
  let grid = '';
  const gN = 3;
  for (let i = 0; i <= gN; i++) {
    const y = padT + (plotH / gN) * i;
    const val = max - ((max - min) / gN) * i;
    grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" stroke="#F0EDE7" stroke-width="1"/>';
    grid += '<text x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" font-size="9" fill="#B0ABA2" text-anchor="end">' + val.toFixed(1) + '</text>';
  }

  const xLabels =
    '<text x="' + padL + '" y="' + (H - 8) + '" font-size="9" fill="#B0ABA2" text-anchor="start">' + fmtMD2(start) + '</text>' +
    '<text x="' + (W - padR) + '" y="' + (H - 8) + '" font-size="9" fill="#B0ABA2" text-anchor="end">' + fmtMD2(end) + '</text>';

  const dots = pts.map(function (p) {
    return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4" fill="#fff" stroke="#E8965A" stroke-width="2.2"/>';
  }).join('');

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block">' +
    '<defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#E8965A" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="#E8965A" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    grid +
    '<path d="' + area + '" fill="url(#wg)"/>' +
    '<path d="' + line + '" fill="none" stroke="#E8965A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    dots +
    xLabels +
  '</svg>';
}

function renderHealth() {
  const pet = getPet();
  const t = todayStr();
  const start30 = dateAdd(t, -29);

  const curWeight = latestWeight(pet);

  const w30 = pet.healthRecords
    .filter(function (r) { return r.type === 'weight' && r.date >= start30 && r.date <= t; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  let changeLine = '30天：暂无足够数据';
  if (w30.length >= 2) {
    const first = w30[0].data.value;
    const last = w30[w30.length - 1].data.value;
    const c = last - first;
    const pct = first ? (c / first * 100) : 0;
    changeLine = '30天：' + (c >= 0 ? '+' : '') + c.toFixed(2) + 'kg（' + (c >= 0 ? '+' : '') + pct.toFixed(1) + '%）';
  }

  const recs = pet.healthRecords.slice().sort(byDateDesc);

  let listHtml = '';
  if (!recs.length) {
    listHtml = '<div class="empty-mini">还没有健康记录</div>';
  } else {
    listHtml = recs.map(function (r) {
      const m = HEALTH_META[r.type] || { icon: '📌', label: '记录' };
      let detail = fmtMD(r.date);
      if (r.title && r.title !== m.label) detail += ' · ' + r.title;
      if (r.detail) detail += ' · ' + r.detail;

      return '<div class="hitem">' +
        '<div class="hicon">' + m.icon + '</div>' +
        '<div class="hbody">' +
          '<div class="htitle">' + m.label + '</div>' +
          '<div class="hdetail">' + esc(detail) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  document.getElementById('view').innerHTML = '' +
    '<div class="card">' +
      '<div class="card-title">⚖️ 当前体重</div>' +
      '<div class="big-num">' + curWeight + '<span>kg</span></div>' +
      '<div class="sub-note">' + changeLine + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title">📈 最近30天体重趋势</div>' +
      '<div class="chart-wrap">' + renderWeightChart() + '</div>' +
      '<div class="chart-foot">' +
        '<span>记录次数：' + w30.length + '次</span>' +
        '<span>' + fmtMD2(start30) + ' — ' + fmtMD2(t) + '</span>' +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title">❤️ 健康记录</div>' +
      '<div class="hlist">' + listHtml + '</div>' +
    '</div>';
}

/* =========================================================
   4. 档案页
   ========================================================= */
function renderProfile() {
  const pet = getPet();
  const p = pet.profile;

  function rows(obj) {
    return Object.keys(obj).map(function (k) {
      const v = obj[k];
      return '<div class="info-row">' +
        '<span class="k">' + k + '</span>' +
        '<span class="v">' + (v ? v : '—') + '</span>' +
      '</div>';
    }).join('');
  }

  document.getElementById('view').innerHTML = '' +
    '<div class="card">' +
      '<div class="profile-head">' +
        '<div class="profile-avatar">' + (p.avatar ? '<img src="' + esc(p.avatar) + '" alt="">' : '🐱') + '</div>' +
        '<div class="profile-name">' + esc(p.name) + '</div>' +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title">基本信息</div>' +
      rows({
        '姓名': esc(p.name),
        '物种': esc(p.species),
        '品种': esc(p.breed),
        '性别': esc(p.gender),
        '出生日期': p.birthDate,
        '年龄': calcAge(p.birthDate),
        '绝育': p.neutered ? '已绝育' : '未绝育',
        '当前体重': latestWeight(pet) + 'kg'
      }) +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title">主人信息</div>' +
      rows({
        '主人姓名': esc(p.ownerName || ''),
        '联系电话': esc(p.ownerPhone || ''),
        '备用联系人': esc(p.ownerAlt || '')
      }) +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title">医疗信息</div>' +
      rows({
        '过敏史': esc(p.allergies || ''),
        '既往病史': esc(p.history || ''),
        '长期用药': esc(p.longTermMeds || ''),
        '常去医院': esc(p.hospital || '')
      }) +
    '</div>' +

    '<button class="btn btn-ghost" id="editProfileBtn" style="margin-bottom:10px">✏️ 编辑档案</button>' +
    '<button class="btn btn-primary" id="exportBtn" style="margin-bottom:20px">📋 导出健康摘要</button>';
}

/* =========================================================
   弹窗
   ========================================================= */
function openSheet(innerHtml) {
  const layer = document.getElementById('modalLayer');
  layer.innerHTML = '<div class="modal-mask"></div><div class="modal-sheet">' + innerHtml + '</div>';
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
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 300);
  }, 1600);
}

/* =========================================================
   快速记录
   ========================================================= */
function openQuickRecord() {
  const items = [
    ['diet', '🍚', '饮食'], ['water', '💧', '饮水'],
    ['poop', '💩', '排泄'], ['mood', '😸', '情绪'],
    ['sleep', '💤', '睡眠'], ['activity', '🎾', '活动'],
    ['care', '🧼', '护理'], ['health', '❤️', '健康']
  ];

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">记录今天</h3>' +
    '<div class="quick-grid">' +
      items.map(function (it) {
        return '<button type="button" class="quick-item" data-record-type="' + it[0] + '">' +
          '<span class="qi">' + it[1] + '</span>' +
          '<span class="ql">' + it[2] + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<div style="height:16px"></div>'
  );
}

function field(label, inner) {
  return '<div class="field"><label>' + label + '</label>' + inner + '</div>';
}

function chipGroup(name, options, def) {
  return '<div class="chips" data-name="' + name + '">' +
    options.map(function (o) {
      return '<button type="button" class="chip' + (o === def ? ' active' : '') + '" data-value="' + o + '">' + o + '</button>';
    }).join('') +
  '</div>';
}

function openRecordForm(type) {
  pendingType = type;
  const meta = DAILY_META[type];

  const timeField = field('时间', '<input type="time" data-field="time" value="' + nowTime() + '">');
  let body = '';

  switch (type) {
    case 'diet':
      body = timeField +
        field('餐次', chipGroup('meal', ['早餐', '午餐', '晚餐', '加餐'], '早餐')) +
        field('食物', chipGroup('food', ['主粮', '罐头', '零食', '湿粮'], '主粮')) +
        field('食欲', chipGroup('appetite', ['很好', '正常', '一般', '较差'], '正常')) +
        field('喂了多少', '<div class="input-suffix"><input type="number" inputmode="decimal" data-field="amount" value="35"><span>g</span></div>') +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;

    case 'water':
      body = timeField +
        field('水量', '<div class="input-suffix"><input type="number" inputmode="decimal" data-field="amount" value="80"><span>ml</span></div>') +
        field('水源', chipGroup('source', ['饮水机', '水碗', '其他'], '饮水机'));
      break;

    case 'poop':
      body = timeField +
        field('类型', chipGroup('subtype', ['尿液', '粪便'], '尿液')) +
        field('状态', chipGroup('status', ['正常', '偏软', '偏硬', '异常'], '正常'));
      break;

    case 'mood':
      body = timeField +
        field('情绪', chipGroup('mood', ['开心', '平静', '粘人', '焦虑', '低落'], '开心')) +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;

    case 'sleep':
      body = timeField +
        field('时长', '<div class="input-suffix"><input type="number" inputmode="decimal" data-field="duration" value="9.5" step="0.5"><span>小时</span></div>');
      break;

    case 'activity':
      body = timeField +
        field('活动', chipGroup('activity', ['玩耍', '散步', '训练', '自由活动'], '玩耍')) +
        field('时长', '<div class="input-suffix"><input type="number" inputmode="numeric" data-field="duration" value="25"><span>分钟</span></div>');
      break;

    case 'care':
      body = timeField +
        field('护理项', chipGroup('care', ['梳毛', '刷牙', '剪指甲', '洗澡', '清洁耳朵'], '梳毛'));
      break;

    case 'health':
      body = timeField +
        field('体重', '<div class="input-suffix"><input type="number" inputmode="decimal" step="0.01" data-field="weight" value="' + latestWeight(getPet()) + '"><span>kg</span></div>') +
        field('备注', '<input type="text" data-field="note" placeholder="选填">');
      break;
  }

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">记录' + meta.label + '</h3>' +
    '<form id="recordForm">' +
      '<div class="sheet-body">' + body + '</div>' +
      '<div class="sheet-actions"><button type="submit" class="btn btn-primary">保存记录</button></div>' +
    '</form>'
  );
}

function handleSaveRecord() {
  const form = document.getElementById('recordForm');
  if (!form) return;

  const values = {};
  form.querySelectorAll('[data-field]').forEach(function (el) {
    values[el.dataset.field] = el.value;
  });
  form.querySelectorAll('.chips').forEach(function (g) {
    const a = g.querySelector('.chip.active');
    values[g.dataset.name] = a ? a.dataset.value : '';
  });

  const type = pendingType;
  const pet = getPet();
  const date = todayStr();
  const time = values.time || nowTime();

  const rec = {
    id: uid('d'),
    type: type,
    date: date,
    time: time,
    createdAt: new Date().toISOString(),
    data: {}
  };

  switch (type) {
    case 'diet':
      rec.data = {
        meal: values.meal, food: values.food, appetite: values.appetite,
        amount: parseFloat(values.amount) || 0, note: values.note || ''
      };
      break;
    case 'water':
      rec.data = { amount: parseFloat(values.amount) || 0, source: values.source };
      break;
    case 'poop':
      rec.data = { subtype: values.subtype, status: values.status };
      break;
    case 'mood':
      rec.data = { mood: values.mood, note: values.note || '' };
      break;
    case 'sleep':
      rec.data = { duration: parseFloat(values.duration) || 0 };
      break;
    case 'activity':
      rec.data = { activity: values.activity, duration: parseFloat(values.duration) || 0 };
      break;
    case 'care':
      rec.data = { care: values.care };
      break;
    case 'health': {
      const w = parseFloat(values.weight) || 0;
      rec.data = { value: w, note: values.note || '' };
      pet.healthRecords.push({
        id: uid('h'),
        type: 'weight',
        date: date,
        time: time,
        title: '体重',
        detail: w + 'kg',
        data: { value: w }
      });
      pet.profile.weight = w;
      break;
    }
  }

  pet.dailyRecords.push(rec);
  saveData(DATA);
  closeSheet();
  render();
  toast('已保存');
}

/* =========================================================
   今日护理勾选
   ========================================================= */
function toggleCare(care) {
  const pet = getPet();
  const t = todayStr();

  const idx = pet.dailyRecords.findIndex(function (r) {
    return r.type === 'care' && r.date === t && r.data.care === care;
  });

  if (idx >= 0) {
    pet.dailyRecords.splice(idx, 1);
  } else {
    pet.dailyRecords.push({
      id: uid('d'),
      type: 'care',
      date: t,
      time: nowTime(),
      data: { care: care }
    });
  }

  saveData(DATA);
  render();
}

/* =========================================================
   编辑档案
   ========================================================= */
function openProfileForm() {
  const p = getPet().profile;

  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">编辑档案</h3>' +
    '<form id="profileForm">' +
      '<div class="sheet-body">' +
        field('姓名', '<input type="text" data-field="name" value="' + esc(p.name) + '">') +
        field('头像链接', '<input type="text" data-field="avatar" value="' + esc(p.avatar || '') + '" placeholder="留空则显示 🐱">') +
        field('物种', chipGroup('species', ['猫', '狗', '其他'], p.species)) +
        field('品种', '<input type="text" data-field="breed" value="' + esc(p.breed) + '">') +
        field('性别', chipGroup('gender', ['公', '母'], p.gender)) +
        field('出生日期', '<input type="date" data-field="birthDate" value="' + (p.birthDate || '') + '">') +
        field('当前体重', '<div class="input-suffix"><input type="number" step="0.01" data-field="weight" value="' + (p.weight || '') + '"><span>kg</span></div>') +
        field('绝育', chipGroup('neutered', ['已绝育', '未绝育'], p.neutered ? '已绝育' : '未绝育')) +
        field('主人姓名', '<input type="text" data-field="ownerName" value="' + esc(p.ownerName || '') + '">') +
        field('联系电话', '<input type="tel" data-field="ownerPhone" value="' + esc(p.ownerPhone || '') + '">') +
        field('备用联系人', '<input type="text" data-field="ownerAlt" value="' + esc(p.ownerAlt || '') + '">') +
        field('过敏史', '<input type="text" data-field="allergies" value="' + esc(p.allergies || '') + '" placeholder="无">') +
        field('既往病史', '<input type="text" data-field="history" value="' + esc(p.history || '') + '" placeholder="无">') +
        field('长期用药', '<input type="text" data-field="longTermMeds" value="' + esc(p.longTermMeds || '') + '" placeholder="无">') +
        field('常去医院', '<input type="text" data-field="hospital" value="' + esc(p.hospital || '') + '" placeholder="未填写">') +
      '</div>' +
      '<div class="sheet-actions"><button type="submit" class="btn btn-primary">保存档案</button></div>' +
    '</form>'
  );
}

function handleSaveProfile() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  const values = {};
  form.querySelectorAll('[data-field]').forEach(function (el) {
    values[el.dataset.field] = el.value;
  });
  form.querySelectorAll('.chips').forEach(function (g) {
    const a = g.querySelector('.chip.active');
    values[g.dataset.name] = a ? a.dataset.value : '';
  });

  const p = getPet().profile;
  p.name = values.name || p.name;
  p.avatar = values.avatar || '';
  p.species = values.species || p.species;
  p.breed = values.breed || p.breed;
  p.gender = values.gender || p.gender;
  p.birthDate = values.birthDate || p.birthDate;
  p.weight = parseFloat(values.weight) || p.weight;
  p.neutered = values.neutered === '已绝育';
  p.ownerName = values.ownerName || '';
  p.ownerPhone = values.ownerPhone || '';
  p.ownerAlt = values.ownerAlt || '';
  p.allergies = values.allergies || '';
  p.history = values.history || '';
  p.longTermMeds = values.longTermMeds || '';
  p.hospital = values.hospital || '';

  saveData(DATA);
  closeSheet();
  render();
  toast('档案已保存');
}

/* =========================================================
   导出健康摘要
   ========================================================= */
function buildSummary() {
  const pet = getPet();
  const p = pet.profile;
  const lines = [];

  lines.push(p.name + ' · 健康摘要');
  lines.push('');
  lines.push('【基本信息】');
  lines.push(p.breed + ' / ' + p.gender + ' / ' + calcAge(p.birthDate) + ' / ' + latestWeight(pet) + 'kg');
  lines.push('');

  const vac = pet.healthRecords.filter(function (r) { return r.type === 'vaccine'; }).sort(byDateDesc)[0];
  const dew = pet.healthRecords.filter(function (r) { return r.type === 'deworm'; }).sort(byDateDesc)[0];
  const vis = pet.healthRecords.filter(function (r) { return r.type === 'visit'; }).sort(byDateDesc)[0];
  const med = pet.healthRecords.filter(function (r) { return r.type === 'medication'; }).sort(byDateDesc)[0];
  const abn = pet.healthRecords.filter(function (r) { return r.type === 'abnormal'; }).sort(byDateDesc)[0];

  if (vac) { lines.push('【疫苗】'); lines.push(vac.date + '  ' + vac.title); lines.push(''); }
  if (dew) { lines.push('【驱虫】'); lines.push(dew.date + '  ' + dew.title); if (dew.detail) lines.push(dew.detail); lines.push(''); }
  if (vis) { lines.push('【近期就诊】'); lines.push(vis.date + '  ' + vis.title); if (vis.detail) lines.push(vis.detail); lines.push(''); }
  if (med) { lines.push('【近期用药】'); lines.push(med.title + '  ' + med.detail); lines.push(''); }
  if (abn) { lines.push('【近期异常】'); lines.push(abn.date + '  ' + abn.title); if (abn.detail) lines.push(abn.detail); lines.push(''); }

  const t = todayStr();
  const s = dateAdd(t, -29);
  const w = pet.healthRecords
    .filter(function (r) { return r.type === 'weight' && r.date >= s && r.date <= t; })
    .sort(function (a, b) { return a.date.localeCompare(b.date); });

  if (w.length >= 2) {
    lines.push('【最近30天】');
    lines.push('体重：' + w[0].data.value + ' → ' + w[w.length - 1].data.value + 'kg');
  }

  return lines.join('\n');
}

function openExport() {
  const text = buildSummary();
  openSheet(
    '<div class="sheet-handle"></div>' +
    '<h3 class="sheet-title">健康摘要</h3>' +
    '<div class="sheet-body"><pre class="summary-pre">' + esc(text) + '</pre></div>' +
    '<div class="sheet-actions"><button type="button" class="btn btn-primary" id="copySummaryBtn">复制摘要</button></div>'
  );
}

function copySummary() {
  const text = buildSummary();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      function () { toast('已复制到剪贴板'); },
      function () { toast('复制失败，请长按选择'); }
    );
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制到剪贴板'); }
    catch (e) { toast('复制失败，请长按选择'); }
    ta.remove();
  }
}

/* =========================================================
   全局事件
   ========================================================= */
document.addEventListener('click', function (e) {

  /* 底部导航 */
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    currentTab = tab.dataset.tab;
    render();
    return;
  }

  /* 快速记录入口 */
  if (e.target.closest('#quickBtn')) {
    openQuickRecord();
    return;
  }

  /* 选择记录类型 */
  const typeBtn = e.target.closest('[data-record-type]');
  if (typeBtn) {
    openRecordForm(typeBtn.dataset.recordType);
    return;
  }

  /* 今日护理勾选 */
  const careItem = e.target.closest('[data-care]');
  if (careItem) {
    toggleCare(careItem.dataset.care);
    return;
  }

  /* 日常日期切换 */
  const dateTab = e.target.closest('[data-date]');
  if (dateTab) {
    dailyDate = dateTab.dataset.date;
    renderDaily();
    window.scrollTo(0, 0);
    return;
  }

  /* 编辑档案 */
  if (e.target.closest('#editProfileBtn')) {
    openProfileForm();
    return;
  }

  /* 导出摘要 */
  if (e.target.closest('#exportBtn')) {
    openExport();
    return;
  }

  /* 复制摘要 */
  if (e.target.closest('#copySummaryBtn')) {
    copySummary();
    return;
  }

  /* 选项 chip 切换 */
  const chip = e.target.closest('.chip');
  if (chip) {
    const group = chip.closest('.chips');
    group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
    chip.classList.add('active');
    return;
  }

  /* 点击遮罩关闭 */
  if (e.target.closest('.modal-mask')) {
    closeSheet();
    return;
  }
});

/* 表单提交 */
document.addEventListener('submit', function (e) {
  if (e.target.id === 'recordForm') {
    e.preventDefault();
    handleSaveRecord();
  }
  if (e.target.id === 'profileForm') {
    e.preventDefault();
    handleSaveProfile();
  }
});

/* =========================================================
   启动
   ========================================================= */
render();
