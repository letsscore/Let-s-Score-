(() => {
"use strict";

const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const CLASSES = ["VI","VII","VIII","IX","X","XI","XII"];
let sb = null;
let statusChannel = null;
let pollTimer = null;

function $(id){ return document.getElementById(id); }
function esc(v){ return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }

function toast(msg, type=""){
  let el=$("rtToast");
  if(!el){el=document.createElement("div");el.id="rtToast";el.className="rt-toast";document.body.appendChild(el);}
  el.textContent=msg; el.className="rt-toast "+type;
  clearTimeout(window.__rtToast); window.__rtToast=setTimeout(()=>el.remove(),3500);
}

async function loadSDK(){
  if(window.supabase) return;
  await new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src=SUPABASE_CDN; s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
  });
}

async function init(){
  const c=window.LETS_SCORE_SUPABASE;
  if(!c?.url || !c?.anonKey) throw new Error("Supabase configuration missing.");
  await loadSDK();
  sb=window.supabase.createClient(c.url,c.anonKey);
  return sb;
}

async function getStatus(cls){
  const {data,error}=await sb.from("revision_tests").select("*").eq("class",cls).maybeSingle();
  if(error) throw error;
  return data;
}

function renderClasses(rows){
  const box=$("classGrid"); if(!box) return;
  const map=Object.fromEntries((rows||[]).map(r=>[r.class,r]));
  box.innerHTML=CLASSES.map(cls=>{
    const r=map[cls]||{};
    const live=!!r.is_live;
    const title=r.title||"Revisionary Test";
    const href=live?`take-test.html?class=${encodeURIComponent(cls)}`:"#";
    return `<a class="rt-class-card ${live?"":"disabled"}" ${live?`href="${href}"`:"href=\"javascript:void(0)\""} data-class="${cls}">
      <h3>Class ${cls}</h3><p>${esc(title)}</p>
      <small><span class="rt-live-dot ${live?"on":""}"></span>${live?"TEST LIVE":"TEST NOT STARTED"}</small>
    </a>`;
  }).join("");
  const liveCount=(rows||[]).filter(x=>x.is_live).length;
  const status=$("globalStatus");
  if(status) status.innerHTML=liveCount?`<span class="rt-status on">● ${liveCount} TEST${liveCount>1?"S":""} LIVE</span>`:`<span class="rt-status off">● TEST NOT STARTED</span>`;
}

async function loadHome(){
  await init();
  const {data,error}=await sb.from("revision_tests").select("*");
  if(error){ console.error(error); toast(error.message,"err"); renderClasses([]); return; }
  renderClasses(data);
  subscribe();
}

function subscribe(){
  if(statusChannel) sb.removeChannel(statusChannel);
  statusChannel=sb.channel("revisionary-tests-live")
    .on("postgres_changes",{event:"*",schema:"public",table:"revision_tests"},()=>loadHome())
    .subscribe();
  clearInterval(pollTimer);
  pollTimer=setInterval(()=>loadHome().catch(()=>{}),30000);
}

document.addEventListener("DOMContentLoaded",()=>{
  if($("classGrid")) loadHome().catch(e=>{console.error(e); toast("Could not connect to the test server.","err");});
});
})();