const KEY="habitTrackerV1";
const defaults=[
 {id:"exercise",name:"Exercise",icon:"🏃",desc:"Move your body"},
 {id:"study",name:"Study",icon:"📚",desc:"Focused learning"},
 {id:"finance",name:"Finance",icon:"💰",desc:"Track/save/invest"},
 {id:"english",name:"English & Communication",icon:"🇬🇧",desc:"Practice communication"},
 {id:"relationships",name:"Relationships",icon:"🤝",desc:"Family & people"}
];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{habits:defaults,days:{},notes:{}};
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const dateKey=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
const today=dateKey(new Date());
const getDay=k=>state.days[k]||{};
const toggle=(id)=>{let d=getDay(today);d[id]=!d[id];state.days[today]=d;save();render()};
function render(){
 const d=getDay(today), total=state.habits.length, done=state.habits.filter(h=>d[h.id]).length, pct=total?Math.round(done/total*100):0;
 document.getElementById("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"});
 document.getElementById("score").textContent=pct+"%";document.getElementById("ringText").textContent=pct+"%";
 document.querySelector(".ring").style.background=`conic-gradient(#8b5cf6 ${pct*3.6}deg,#27324a 0deg)`;
 document.getElementById("doneCount").textContent=done;document.getElementById("totalCount").textContent=total;
 document.getElementById("habitList").innerHTML=state.habits.map(h=>`<div class="habit"><span class="icon">${h.icon||"✅"}</span><div class="habitText"><b>${esc(h.name)}</b><small>${esc(h.desc||"Daily habit")}</small></div><button class="check ${d[h.id]?"done":""}" onclick="toggle('${h.id}')">${d[h.id]?"✓":""}</button></div>`).join("");
 renderWeek();renderManage();document.getElementById("note").value=state.notes[today]||"";
 document.getElementById("streak").textContent=bestStreak();
}
function renderWeek(){
 const out=[];for(let i=6;i>=0;i--){let dt=new Date();dt.setDate(dt.getDate()-i);let k=dateKey(dt),d=getDay(k),done=state.habits.filter(h=>d[h.id]).length,p=state.habits.length?Math.round(done/state.habits.length*100):0;out.push(`<div class="day"><small>${dt.toLocaleDateString(undefined,{weekday:"short"})}</small><strong>${p}%</strong><div class="bar"><i style="width:${p}%"></i></div></div>`)}document.getElementById("week").innerHTML=out.join("");
}
function bestStreak(){let best=0,cur=0;for(let i=0;i<365;i++){let dt=new Date();dt.setDate(dt.getDate()-i);let d=getDay(dateKey(dt));let all=state.habits.length&&state.habits.every(h=>d[h.id]);if(all)cur++;else{if(cur>best)best=cur;cur=0}}return Math.max(best,cur)}
function renderManage(){document.getElementById("manage").innerHTML=state.habits.map(h=>`<div class="manageRow"><span>${h.icon||"✅"} ${esc(h.name)}</span><button class="delete" onclick="removeHabit('${h.id}')">Delete</button></div>`).join("")}
function removeHabit(id){if(!confirm("Delete this habit?"))return;state.habits=state.habits.filter(h=>h.id!==id);save();render()}
document.getElementById("addBtn").onclick=()=>{let n=document.getElementById("newHabit").value.trim();if(!n)return;state.habits.push({id:"h"+Date.now(),name:n,icon:"⭐",desc:"Daily habit"});document.getElementById("newHabit").value="";save();render()};
document.getElementById("resetBtn").onclick=()=>{state.days[today]={};save();render()};
document.getElementById("note").oninput=e=>{state.notes[today]=e.target.value;save()};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
let deferred;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;document.getElementById("installBtn").classList.remove("hidden")});
document.getElementById("installBtn").onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;document.getElementById("installBtn").classList.add("hidden")};
// ===== GROWTH CALENDAR =====
let growthMonth = new Date();

function renderGrowthCalendar() {
  const grid = document.getElementById("growthCalendar");
  const title = document.getElementById("monthTitle");

  if (!grid || !title) return;

  const year = growthMonth.getFullYear();
  const month = growthMonth.getMonth();

  title.textContent = growthMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

  grid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty cells before the 1st day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day);
    const key = dateKey(dt);
    const data = state.days[key] || {};

    const total = state.habits.length;
    const done = state.habits.filter(h => data[h.id]).length;

    const percent = total
      ? Math.round((done / total) * 100)
      : 0;

    let level = 0;

    if (percent === 0) level = 0;
    else if (percent < 25) level = 1;
    else if (percent < 50) level = 2;
    else if (percent < 75) level = 3;
    else level = 4;

    const cell = document.createElement("div");
    cell.className = `calendar-day level${level}`;

    cell.innerHTML = `
      <span>${day}</span>
      <small>${percent}%</small>
    `;

    cell.title = `${dt.toLocaleDateString()} — ${done}/${total} habits completed`;

    grid.appendChild(cell);
  }
}

// Previous month
document.getElementById("prevMonth").onclick = () => {
  growthMonth.setMonth(growthMonth.getMonth() - 1);
  renderGrowthCalendar();
};

// Next month
document.getElementById("nextMonth").onclick = () => {
  growthMonth.setMonth(growthMonth.getMonth() + 1);
  renderGrowthCalendar();
};

// Update calendar whenever the app renders
const originalRender = render;
render = function () {
  originalRender();
  renderGrowthCalendar();
};

renderGrowthCalendar();
// ===== V2 ONBOARDING: LOGIN → GROWTH AREAS =====

const authScreen = document.getElementById("authScreen");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const growthAreaScreen = document.getElementById("growthAreaScreen");

if (loginBtn) {
  loginBtn.onclick = () => {
    const name = usernameInput.value.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    localStorage.setItem("growthUserName", name);

    authScreen.classList.add("hidden");
    growthAreaScreen.classList.remove("hidden");
  };
}
// ===== V2 ONBOARDING: GROWTH AREA SELECTION =====

const growthNextBtn = document.getElementById("growthNextBtn");
const selectedCount = document.getElementById("selectedCount");

if (growthNextBtn) {
  const areaCheckboxes = document.querySelectorAll(
    '#growthAreaScreen input[type="checkbox"]'
  );

  areaCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const selected = document.querySelectorAll(
        '#growthAreaScreen input[type="checkbox"]:checked'
      );

      if (selected.length > 5) {
        checkbox.checked = false;
        alert("You can choose up to 5 growth areas.");
      }

      const count = document.querySelectorAll(
        '#growthAreaScreen input[type="checkbox"]:checked'
      ).length;

      if (selectedCount) {
        selectedCount.textContent = `${count}/5 selected`;
      }
    });
  });

  growthNextBtn.onclick = () => {
    const selected = [...document.querySelectorAll(
      '#growthAreaScreen input[type="checkbox"]:checked'
    )].map((checkbox) => checkbox.value);

    if (selected.length === 0) {
      alert("Please choose at least one growth area.");
      return;
    }

    localStorage.setItem(
      "growthAreas",
      JSON.stringify(selected)
    );

    alert("Growth areas saved! 🌱");
  };
}
