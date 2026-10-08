const KEY="petHealthArchiveV02";

const defaultData={
  version:2,currentPetId:"pet_001",
  pets:[{id:"pet_001",profile:{name:"团团",avatar:"",species:"猫",breed:"英短",gender:"公",birthDate:"2024-06-12",weight:5.2,neutered:true,createdAt:new Date().toISOString()},
  dailyRecords:[
    {id:"d1",type:"food",time:todayTime("08:20"),meal:"早餐",foodType:"猫粮",appetite:"正常",note:""},
    {id:"d2",type:"water",time:todayTime("10:35"),amount:120,unit:"ml"},
    {id:"d3",type:"excretion",time:todayTime("11:10"),kind:"stool",status:"正常",form:"正常"},
    {id:"d4",type:"mood",time:todayTime("13:20"),mood:"精神不错",behaviors:[]}
  ],
  healthRecords:[
    {id:"h1",type:"weight",date:"2026-09-10",value:5.1,unit:"kg",createdAt:"2026-09-10T09:00:00"},
    {id:"h2",type:"weight",date:"2026-09-18",value:5.2,unit:"kg",createdAt:"2026-09-18T09:00:00"},
    {id:"h3",type:"weight",date:today(),value:5.2,unit:"kg",createdAt:new Date().toISOString()},
    {id:"h4",type:"visit",date:"2026-09-18",hospital:"东莞XX宠物医院",reason:["呕吐"],symptoms:"当天出现一次呕吐",examinations:"基础检查",conclusion:"已就医",medications:"遵医嘱",note:""},
    {id:"h5",type:"deworming",date:"2026-09-08",dewormType:"体内驱虫",medicine:"常规驱虫",nextDate:today()},
    {id:"h6",type:"vaccine",date:"2026-05-12",name:"猫三联",hospital:"东莞XX宠物医院",nextDate:"2027-05-12"}
  ],reminders:[
    {id:"r1",title:"体内驱虫",date:today(),icon:"🪱"},
    {id:"r2",title:"猫三联疫苗",date:"2026-11-01",icon:"💉"},
    {id:"r3",title:"喂药",date:today(),time:"20:00",icon:"💊"}
  ]}]
}};

let data=load();
let page="home";
let currentDate = today();

function today(){return localDate(new Date())}
function localDate(d){let y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`}
function todayTime(h){return `${today()}T${h}:00`}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x||structuredClone(defaultData)}catch(e){return structuredClone(defaultData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function pet(){return data.pets.find(p=>p.id===data.currentPetId)||data.pets[0]}
function records(){return pet().dailyRecords||[]}
function health(){return pet().healthRecords||[]}

function nowISO(){
  const d = new Date();
  const y  = d.getFullYear();
  const mo = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ss = String(d.getSeconds()).padStart(2,"0");
  return `${y}-${mo}-${da}T${hh}:${mm}:${ss}`;
}
function dateAdd(dateStr, days){
  const dt = new Date(dateStr + "T00:00:00");
  dt.setDate(dt.getDate() + days);
  return localDate(dt);
}
function fmtDate(s){
  if(!s) return "";
  const [y,m,d] = s.slice(0,10).split("-");
  return `${m}月${d}日`;
}
function fmtTime(s){return s?.slice(11,16)||""}
function age(b){if(!b)return "";let a=new Date(b),n=new Date();let years=n.getFullYear()-a.getFullYear(),months=n.getMonth()-a.getMonth();if(n.getDate()<a.getDate())months--;if(months<0){years--;months+=12}return years>0?`${years}岁${months?months+"个月":""}`:`${months}个月`}
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function iconFor(r){return ({food:"🍚",water:"💧",excretion:r.kind==="urine"?"💧":"💩",mood:"😸",sleep:"💤",activity:"🎾",care:"🧼"}[r.type]||"•")}
function typeName(r){return ({food:"吃饭",water:"喝水",excretion:r.kind==="urine"?"小便":"便便",mood:"状态",sleep:"睡眠",activity:"活动",care:"护理"}[r.type]||"记录")}
function todayRecords(){return records().filter(r=>(r.time||r.date||"").slice(0,10)===today())}
function render(){document.getElementById("view").innerHTML=pages[page]();document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===page))}
function pages(){return {home:homePage,daily:dailyPage,health:healthPage,profile:profilePage}}

function homePage(){
 const p=pet(), tr=todayRecords(), foods=tr.filter(x=>x.type==="food").length, water=tr.filter(x=>x.type==="water").reduce((a,x)=>a+Number(x.amount||0),0), ex=tr.filter(x=>x.type==="excretion").length;
 const mood=[...tr].reverse().find(x=>x.type==="mood")?.mood||"暂无记录", weight=latestWeight();
 const next=[...p.reminders].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
 return `<div class="topbar"><div><div class="greeting">晚上好 👋</div><div class="title">今天也看看团团</div></div><button class="icon-btn" onclick="openPetMenu()">⋯</button></div>
 <section class="pet-hero"><div class="pet-row"><div class="avatar">${p.profile.avatar?`<img src="${esc(p.profile.avatar)}">`:"🐱"}</div><div><div class="pet-name">${esc(p.profile.name)}</div><div class="pet-meta">${esc(p.profile.breed)} · ${esc(p.profile.gender)} · ${age(p.profile.birthDate)}</div></div><button class="pet-more" onclick="openPetMenu()">›</button></div><div class="weight-row"><div class="weight"><strong>${weight??p.profile.weight}</strong><small>kg · 当前体重</small></div><span class="status-pill">● 今日状态正常</span></div></section>
 <section class="section"><div class="section-head"><div class="section-title">今天 · ${fmtDate(today())}</div><span class="link" onclick="openQuick()">快速记录</span></div>
 <div class="today-grid">
 ${mini("🍚","饮食",foods+"/3 餐",foods?"今日有记录":"还没有记录")}
 ${mini("💧","饮水",water+" ml",water?"今日累计":"还没有记录")}
 ${mini("💩","排泄",ex+" 次",ex?"今日记录":"还没有记录")}
 ${mini("😸","状态",mood,mood==="暂无记录"?"点击记录":"最近状态")}
 </div></section>
 <section class="section"><div class="section-head"><div class="section-title">接下来</div><span class="link" onclick="showToast('提醒管理将在下一版开放')">全部</span></div>
 <div class="next-list">${next.length?next.map(n=>`<div class="next-item"><div class="dot-icon">${n.icon||"⏰"}</div><div class="item-main"><div class="item-title">${esc(n.title)}</div><div class="item-sub">${n.time?`今天 ${n.time}`:dateLabel(n.date)}</div></div><div class="item-right">${n.date===today()?"今天":""}</div></div>`).join(""):`<div class="empty">暂时没有提醒</div>`}</div></section>
 <section class="section"><div class="section-head"><div class="section-title">最近健康记录</div><span class="link" onclick="setPage('health')">查看全部</span></div>
 <div class="record-list">${health().slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,4).map(healthRow).join("")||`<div class="empty">还没有健康记录</div>`}</div></section>`;
}
function mini(i,l,v,n){return `<button class="mini-card" onclick="openQuick()"><div class="mini-icon">${i}</div><div class="mini-label">${l}</div><div class="mini-value">${esc(v)}</div><div class="mini-note">${esc(n)}</div></button>`}
function dateLabel(d){if(!d)return "";if(d===today())return "今天";let diff=Math.round((new Date(d+"T00:00:00")-new Date(today()+"T00:00:00"))/86400000);return diff>0?`${diff}天后 · ${fmtDate(d)}`:fmtDate(d)}
function healthRow(r){let title={weight:"体重",vaccine:"疫苗",deworming:"驱虫",medication:"用药",visit:"就诊",abnormal:"异常记录"}[r.type]||"健康记录";let desc=r.type==="weight"?`${r.value} kg`:r.type==="vaccine"?`${r.name||""}`:r.type==="visit"?`${r.hospital||""} · ${(r.reason||[]).join("、")}`:r.type==="deworming"?`${r.dewormType||""}`:r.medicine||r.note||"";return `<div class="record-item"><div class="dot-icon">${({weight:"⚖️",vaccine:"💉",deworming:"🪱",medication:"💊",visit:"🏥",abnormal:"⚠️"})[r.type]||"•"}</div><div class="item-main"><div class="item-title">${title}</div><div class="item-sub">${esc(desc)}</div></div><div class="item-right">${fmtDate(r.date)}</div></div>`}

/* ============ 日常页 ============ */
function dailyPage(){
  const t = today();
  const d = currentDate;
  const isToday = d === t;
  const isYesterday = d === dateAdd(t, -1);
  const label = isToday ? "今天" : isYesterday ? "昨天" : "";

  const rs = records()
    .filter(r => ((r.time||r.date||"").slice(0,10)) === d)
    .sort((a,b) => (a.time||a.date||"").localeCompare(b.time||b.date||""));

  return `<div class="topbar">
    <div><div class="greeting">${esc(pet().profile.name)} 的生活</div><div class="title">日常</div></div>
    <button class="icon-btn" onclick="openQuick()">＋</button>
  </div>

  <div class="date-nav">
    <button class="date-btn" onclick="shiftDate(-1)">‹</button>
    <button class="date-current" onclick="openDatePicker()">
      ${label ? `<span class="date-label">${label}</span>` : ""}
      <span>${fmtDate(d)}</span>
    </button>
    <button class="date-btn" onclick="shiftDate(1)" ${isToday ? "disabled" : ""}>›</button>
    <button class="date-btn" onclick="openDatePicker()">📅</button>
  </div>
  <input type="date" id="datePicker" class="hidden-date" value="${d}" max="${t}" onchange="onDatePick(event)">

  <div class="section-head">
    <div class="section-title">${label || fmtDate(d)}</div>
    <span class="link">${rs.length} 条记录</span>
  </div>

  <div class="timeline">${rs.length
    ? rs.map(r => `<div class="tl-item">
        <div class="tl-date">${fmtTime(r.time) || fmtDate((r.time||r.date||"").slice(0,10))}</div>
        <div class="tl-card">
          <div class="tl-title">${iconFor(r)} ${typeName(r)}</div>
          <div class="tl-desc">${dailyDesc(r)}</div>
        </div>
      </div>`).join("")
    : `<div class="empty">这一天还没有记录<br>点击下方“记录一下”开始。</div>`}</div>`;
}

function shiftDate(delta){
  const next = dateAdd(currentDate, delta);
  if (next > today()) return;
  currentDate = next;
  render();
}

function openDatePicker(){
  const el = document.getElementById("datePicker");
  if (!el) return;
  if (el.showPicker) el.showPicker();
  else el.click();
}

function onDatePick(e){
  const v = e.target.value;
  if (v && v <= today()) {
    currentDate = v;
    render();
  }
}

function dailyDesc(r){
  if(r.type==="food")return `${r.meal||"一餐"} · ${r.foodType||"食物"} · 食欲${r.appetite||"正常"}`;
  if(r.type==="water")return `${r.amount||0} ml`;
  if(r.type==="excretion")return `${r.kind==="urine"?"小便":"便便"} · ${r.status||"正常"}`;
  if(r.type==="mood")return `${r.mood||"正常"}${r.note?" · "+esc(r.note):""}`;
  if(r.type==="sleep")return `${r.duration||0} 小时 · ${r.quality||"正常"}`;
  if(r.type==="activity")return `${r.activityType||"活动"} · ${r.duration||0} 分钟`;
  if(r.type==="care")return r.careType||"护理";
  return r.note||"已记录";
}

/* ============ 健康页 ============ */
function healthPage(){
 let lw=latestWeight(), ws=health().filter(x=>x.type==="weight").sort((a,b)=>(a.date||"").localeCompare(b.date||"")).slice(-7);
 return `<div class="topbar"><div><div class="greeting">团团的健康</div><div class="title">健康档案</div></div><button class="icon-btn" onclick="openHealthMenu()">＋</button></div>
 <div class="health-banner"><div class="eyebrow">给医生看的健康摘要</div><h2>把团团的历史整理好</h2><p>疫苗、驱虫、用药、就诊和体重，都集中在这里。</p><button class="white-btn" onclick="showSummary()">📋 查看就诊摘要</button></div>
 <section class="section"><div class="section-head"><div class="section-title">当前体重</div><span class="link">${lw??pet().profile.weight} kg</span></div>
 <div class="chart-card"><div><b>${lw??pet().profile.weight} kg</b><span style="color:var(--sub);font-size:12px;margin-left:8px">近30天</span></div><div class="chart">${chart(ws)}</div></div></section>
 <section class="section"><div class="section-head"><div class="section-title">健康概览</div></div><div class="health-grid">
 ${hcard("💉","疫苗",latest("vaccine")?.name||"暂无记录",latest("vaccine")?.nextDate?`下次 ${fmtDate(latest("vaccine").nextDate)}`:"")}
 ${hcard("🪱","驱虫",latest("deworming")?.dewormType||"暂无记录",latest("deworming")?.nextDate?`下次 ${fmtDate(latest("deworming").nextDate)}`:"")}
 ${hcard("💊","用药",latest("medication")?"当前有记录":"暂无用药","")}
 ${hcard("🏥","就诊",latest("visit")?fmtDate(latest("visit").date):"暂无记录",latest("visit")?.hospital||"")}
 </div></section>
 <section class="section"><div class="section-head"><div class="section-title">完整健康记录</div><span class="link" onclick="openHealthMenu()">＋ 添加</span></div><div class="record-list">${health().slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(healthRow).join("")||`<div class="empty">还没有健康记录</div>`}</div></section>`;
}
function hcard(i,l,b,s){return `<div class="health-card"><div>${i} ${l}</div><div class="big">${esc(b)}</div><div class="small">${esc(s)}</div></div>`}
function latest(type){return health().filter(x=>x.type===type).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0]}
function latestWeight(){let x=latest("weight");return x?x.value:null}
function chart(ws){if(!ws.length)return `<div class="empty">暂无30天体重数据</div>`;let vals=ws.map(x=>Number(x.value)), min=Math.min(...vals)-.1,max=Math.max(...vals)+.1,w=320,h=110;let pts=vals.map((v,i)=>`${i*(w/(Math.max(vals.length-1,1)))},${h-(v-min)/(max-min||1)*h}`);return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="0" y1="25" x2="${w}" y2="25" class="chart-grid"/><line x1="0" y1="55" x2="${w}" y2="55" class="chart-grid"/><line x1="0" y1="85" x2="${w}" y2="85" class="chart-grid"/><polyline points="${pts.join(" ")}" class="chart-line"/>${pts.map(p=>{let [x,y]=p.split(",");return `<circle cx="${x}" cy="${y}" r="4" class="chart-dot"/>`}).join("")}</svg>`}

/* ============ 档案页 ============ */
function profilePage(){
 let p=pet().profile;
 return `<div class="topbar"><div><div class="greeting">关于团团</div><div class="title">档案</div></div><button class="icon-btn" onclick="editProfile()">✎</button></div>
 <div class="profile-head"><div class="avatar">${p.avatar?`<img src="${esc(p.avatar)}">`:"🐱"}</div><div class="profile-name">${esc(p.name)}</div><div class="profile-meta">${esc(p.breed)} · ${esc(p.gender)} · ${age(p.birthDate)}</div></div>
 <div class="profile-card">${row("出生日期",p.birthDate||"未填写")}${row("当前体重",(latestWeight()??p.weight)+" kg")}${row("是否绝育",p.neutered?"已绝育":"未绝育")}${row("宠物类型",p.species||"猫")}</div>
 <div class="section"><div class="section-title">重要资料</div>${action("📋","宠物健康摘要","整理一份可以给医生看的资料","showSummary()")}${action("🪪","宠物身份证","生成一张专属宠物卡","showPetCard()")}${action("📎","医疗文件","疫苗本、化验单、就诊资料","showToast('文件功能将在下一版接入')")}</div>
 <div class="section"><div class="section-title">数据</div>${action("💾","本地数据","数据保存在当前浏览器","exportData()")}</div>`;
}
function row(a,b){return `<div class="profile-row"><span>${a}</span><strong>${esc(b)}</strong></div>`}
function action(i,t,s,fn){return `<button class="action-card" onclick="${fn}"><div class="action-icon">${i}</div><div style="flex:1;text-align:left"><b>${t}</b><small>${s}</small></div><span>›</span></button>`}

/* ============ 快速记录 ============ */
function openQuick(){openSheet(`<div class="grabber"></div><div class="sheet-title">今天记录什么？</div><div class="quick-grid">
${q("🍚","吃饭","food")}${q("💧","喝水","water")}${q("💩","排泄","excretion")}${q("😸","状态","mood")}
${q("⚖️","体重","weight")}${q("💊","用药","medication")}${q("🧼","护理","care")}${q("🏥","就诊","visit")}
</div>`)}
function q(i,n,t){return `<button class="quick" onclick="${t==='weight'||t==='medication'||t==='visit'?`closeSheet();openHealthForm('${t}')`:`closeSheet();openDailyForm('${t}')`}"><div class="quick-icon">${i}</div><div class="quick-name">${n}</div></button>`}
function openDailyForm(type){
 let cfg={food:["🍚","记录吃饭"],water:["💧","记录喝水"],excretion:["💩","记录排泄"],mood:["😸","记录状态"]}[type];
 let body="";
 if(type==="food")body=`${options("餐次",["早餐","午餐","晚餐","加餐"],"meal")}${options("食欲",["正常","吃得少","没吃"],"appetite")}`;
 if(type==="water")body=`${input("饮水量","waterAmount","120","number","ml")}`;
 if(type==="excretion")body=`${options("类型",["便便","小便"],"kind")}${options("状态",["正常","偏软","偏硬","异常"],"status")}`;
 if(type==="mood")body=`${options("状态",["精神不错","正常","有点蔫","不太舒服"],"mood")}`;
 openSheet(`<div class="grabber"></div><div class="sheet-title">${cfg[0]} ${cfg[1]}</div>${body}${input("备注","note","可选……","text")||""}<button class="primary" onclick="saveDaily('${type}')">保存记录</button>`);
}
function input(label,id,placeholder="",type="text",suffix=""){return `<div class="form-row"><label class="form-label">${label}</label><input id="f_${id}" class="input" type="${type}" placeholder="${placeholder}">${suffix?`<small style="color:var(--sub);display:block;margin-top:4px">${suffix}</small>`:""}</div>`}
function options(label,arr,id,def){
  def = def || arr[0];
  return `<div class="form-row"><label class="form-label">${label}</label><div class="option-row">${arr.map(x=>`<button class="option ${x===def?"selected":""}" data-group="${id}" onclick="pick(this,'${id}')">${x}</button>`).join("")}</div></div>`;
}
function pick(el,id){document.querySelectorAll(`[data-group="${id}"]`).forEach(x=>x.classList.remove("selected"));el.classList.add("selected")}
function selected(id){return document.querySelector(`[data-group="${id}"].selected`)?.textContent||""}
function val(id){return document.getElementById("f_"+id)?.value||""}
function saveDaily(type){
 let r={id:"r_"+Date.now(),type,time:nowISO()};
 if(type==="food")Object.assign(r,{meal:selected("meal"),foodType:"猫粮",appetite:selected("appetite"),note:val("note")});
 if(type==="water")Object.assign(r,{amount:Number(val("waterAmount")||0),unit:"ml",note:val("note")});
 if(type==="excretion")Object.assign(r,{kind:selected("kind")==="小便"?"urine":"stool",status:selected("status"),note:val("note")});
 if(type==="mood")Object.assign(r,{mood:selected("mood"),note:val("note")});
 pet().dailyRecords.push(r);save();closeSheet();render();showToast("✓ 已记录");
}

/* ============ 健康记录 ============ */
function openHealthMenu(){openSheet(`<div class="grabber"></div><div class="sheet-title">添加健康记录</div><div class="quick-grid">${q("⚖️","体重","weight")}${q("💉","疫苗","vaccine")}${q("🪱","驱虫","deworming")}${q("💊","用药","medication")}${q("🏥","就诊","visit")}${q("⚠️","异常","abnormal")}</div>`)}
function openHealthForm(type){
 let title={weight:"⚖️ 记录体重",vaccine:"💉 疫苗记录",deworming:"🪱 驱虫记录",medication:"💊 用药记录",visit:"🏥 就诊记录",abnormal:"⚠️ 异常记录"}[type];
 let body= input("日期","date",today(),"date");
 if(type==="weight")body+=input("体重","value","5.2","number","kg");
 if(type==="vaccine")body+=input("疫苗名称","name","例如：猫三联")+input("下次日期","nextDate","","date")+input("医院","hospital","可选");
 if(type==="deworming")body+=input("驱虫类型","dewormType","体内驱虫")+input("药品","medicine","可选")+input("下次日期","nextDate","","date");
 if(type==="medication")body+=input("药品名称","medicine","例如：阿莫西林")+input("用量","dosage","例如：1片")+input("结束日期","endDate","","date");
 if(type==="visit")body+=input("医院","hospital","宠物医院")+input("就诊原因","reason","例如：呕吐、复诊")+`<div class="form-row"><label class="form-label">情况</label><textarea id="f_note" class="textarea" placeholder="记录检查、医生说明、用药等"></textarea></div>`;
 if(type==="abnormal")body+=input("表现","symptoms","例如：食欲下降")+options("程度",["轻微","需要观察","已就医"],"severity")+input("备注","note","可选");
 openSheet(`<div class="grabber"></div><div class="sheet-title">${title}</div>${body}<button class="primary" onclick="saveHealth('${type}')">保存记录</button>`);
}
function saveHealth(type){
 let r={id:"h_"+Date.now(),type,date:val("date")||today(),createdAt:nowISO()};
 if(type==="weight")r.value=Number(val("value")||0),r.unit="kg";
 if(type==="vaccine")Object.assign(r,{name:val("name"),nextDate:val("nextDate"),hospital:val("hospital")});
 if(type==="deworming")Object.assign(r,{dewormType:val("dewormType"),medicine:val("medicine"),nextDate:val("nextDate")});
 if(type==="medication")Object.assign(r,{medicine:val("medicine"),dosage:val("dosage"),endDate:val("endDate")});
 if(type==="visit")Object.assign(r,{hospital:val("hospital"),reason:(val("reason")||"").split(/[、,，]/),note:val("note")});
 if(type==="abnormal")Object.assign(r,{symptoms:[val("symptoms")],severity:selected("severity"),note:val("note")});
 pet().healthRecords.push(r);if(type==="weight")pet().profile.weight=r.value;save();closeSheet();render();showToast("✓ 健康记录已保存");
}

/* ============ 弹窗 ============ */
function openSheet(content){const layer=document.getElementById("modalLayer");layer.innerHTML=`<div class="sheet">${content}<button class="secondary" onclick="closeSheet()">取消</button></div>`;requestAnimationFrame(()=>layer.classList.add("open"))}
function closeSheet(){const l=document.getElementById("modalLayer");l.classList.remove("open");setTimeout(()=>l.innerHTML="",250)}
document.getElementById("modalLayer").addEventListener("click",e=>{if(e.target.id==="modalLayer")closeSheet()});

/* ============ 健康摘要 ============ */
function showSummary(){
 let p=pet().profile, w=latestWeight(), v=latest("vaccine"),d=latest("deworming"),visit=latest("visit");
 openSheet(`<div class="grabber"></div><div class="sheet-title">📋 团团 · 健康摘要</div>
 <div class="profile-card">${row("基本信息",`${p.breed} · ${p.gender} · ${age(p.birthDate)}`)}${row("当前体重",(w??p.weight)+" kg")}${row("绝育",p.neutered?"已绝育":"未绝育")}</div>
 <div class="section"><div class="section-title">近期记录</div><div class="profile-card">${row("最近就诊",visit?fmtDate(visit.date):"暂无")}${row("疫苗",v?.name||"暂无")}${row("驱虫",d?.dewormType||"暂无")}</div></div>
 <button class="primary" onclick="copySummary()">复制摘要</button>`);
}
function copySummary(){let p=pet().profile,w=latestWeight();let text=`团团｜${p.breed}｜${p.gender}｜${age(p.birthDate)}｜当前体重 ${w??p.weight}kg\n最近就诊：${latest("visit")?fmtDate(latest("visit").date):"暂无"}\n疫苗：${latest("vaccine")?.name||"暂无"}\n驱虫：${latest("deworming")?.dewormType||"暂无"}`;navigator.clipboard?.writeText(text);showToast("✓ 已复制");}

/* ============ 宠物卡 ============ */
function showPetCard(){let p=pet().profile;openSheet(`<div class="grabber"></div><div class="sheet-title">🪪 宠物身份证</div><div class="pet-hero" style="margin-top:8px;text-align:center"><div class="avatar" style="margin:auto">${p.avatar?`<img src="${esc(p.avatar)}">`:"🐱"}</div><div class="profile-name" style="margin-top:12px">${esc(p.name)}</div><div class="profile-meta">${esc(p.breed)} · ${esc(p.gender)} · ${age(p.birthDate)}</div><div style="margin-top:16px;font-size:13px;color:var(--sub)">当前体重 · ${latestWeight()??p.weight} kg</div></div><button class="primary" onclick="copyPetCard()">复制宠物卡信息</button>`)}
function copyPetCard(){navigator.clipboard?.writeText(`${pet().profile.name}｜${pet().profile.breed}｜${pet().profile.gender}｜${age(pet().profile.birthDate)}｜${latestWeight()??pet().profile.weight}kg`);showToast("✓ 已复制")}

/* ============ 编辑档案 ============ */
function editProfile(){
  const p = pet().profile;
  openSheet(`<div class="grabber"></div>
    <div class="sheet-title">编辑宠物资料</div>
    ${input("名字","name",p.name)}
    ${input("头像链接","avatar",p.avatar||"","text","留空则显示 🐱")}
    ${options("物种",["猫","狗","其他"],"species",p.species)}
    ${input("品种","breed",p.breed)}
    ${options("性别",["公","母"],"gender",p.gender)}
    ${input("出生日期","birthDate",p.birthDate,"date")}
    ${input("体重","profileWeight",p.weight,"number","kg")}
    ${options("绝育",["已绝育","未绝育"],"neutered",p.neutered?"已绝育":"未绝育")}
    <button class="primary" onclick="saveProfile()">保存</button>`);
}

function saveProfile(){
  const p = pet().profile;
  p.name = val("name") || p.name;
  p.avatar = val("avatar") || "";
  p.species = selected("species") || p.species;
  p.breed = val("breed") || p.breed;
  p.gender = selected("gender") || p.gender;
  p.birthDate = val("birthDate") || p.birthDate;
  p.weight = Number(val("profileWeight") || p.weight);
  p.neutered = selected("neutered") === "已绝育";
  save();
  closeSheet();
  render();
  showToast("✓ 档案已更新");
}

function openPetMenu(){
  const p = pet().profile;
  openSheet(`<div class="grabber"></div>
    <div class="sheet-title">${esc(p.name)}</div>
    <button class="action-card" onclick="closeSheet();editProfile()">
      <div class="action-icon">✏️</div>
      <div style="flex:1;text-align:left"><b>编辑档案</b><small>名字、头像、品种、绝育等</small></div><span>›</span>
    </button>
    <button class="action-card" onclick="closeSheet();showSummary()">
      <div class="action-icon">📋</div>
      <div style="flex:1;text-align:left"><b>导出健康摘要</b><small>给医生看</small></div><span>›</span>
    </button>
    <button class="action-card" onclick="closeSheet();showPetCard()">
      <div class="action-icon">🪪</div>
      <div style="flex:1;text-align:left"><b>生成宠物卡</b><small>可截图分享</small></div><span>›</span>
    </button>
    <button class="secondary" onclick="closeSheet()">取消</button>`);
}

/* ============ 导出数据 ============ */
function exportData(){let blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${pet().profile.name}-宠物档案.json`;a.click();URL.revokeObjectURL(a.href);showToast("✓ 数据已导出")}
function showToast(t){let x=document.getElementById("toast");x.textContent=t;x.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove("show"),1800)}
function setPage(p){page=p;render();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".tab[data-page]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));
document.getElementById("fab").addEventListener("click",openQuick);
render();
