(() => {
"use strict";
const CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
const CLASSES=["VI","VII","VIII","IX","X","XI","XII"];
let sb=null, rows=[];

function $(id){return document.getElementById(id)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(m,t=""){let e=$("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="rt-toast";document.body.appendChild(e)}e.textContent=m;e.className="rt-toast "+t;setTimeout(()=>e.remove(),3500)}
async function init(){
 const c=window.LETS_SCORE_SUPABASE;
 if(!c?.url||!c?.anonKey)throw Error("Supabase configuration missing.");
 if(!window.supabase)await new Promise((res,rej)=>{let s=document.createElement("script");s.src=CDN;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
 sb=window.supabase.createClient(c.url,c.anonKey);
}
async function load(){
 const {data,error}=await sb.from("revision_tests").select("*").order("class");
 if(error)throw error; rows=data||[];
 $("classSelect").innerHTML=CLASSES.map(c=>`<option value="${c}">Class ${c}</option>`).join("");
 $("classSelect").addEventListener("change",()=>loadEditor());
 renderTable();loadEditor();
}
function renderTable(){
 $("testRows").innerHTML=CLASSES.map(c=>{
  const r=rows.find(x=>x.class===c)||{};
  return `<tr><td><b>Class ${c}</b></td><td>${esc(r.title||"Revisionary Test")}</td><td>${r.questions?.length||0}</td><td>${r.is_live?'<span class="rt-status on">LIVE</span>':'<span class="rt-status off">NOT STARTED</span>'}</td><td><button class="rt-btn small ${r.is_live?"danger":"success"}" onclick="window.rtToggle('${c}',${!r.is_live})">${r.is_live?"Stop Test":"Start Test"}</button></td></tr>`;
 }).join("");
}
function loadEditor(){
 const c=$("classSelect").value,r=rows.find(x=>x.class===c);
 $("titleInput").value=r?.title||"Revisionary Test";
 $("durationInput").value=r?.duration_minutes||30;
 $("questionsInput").value=JSON.stringify(r?.questions||[
  {question:"প্ৰশ্ন লিখক",options:["ক","খ","গ","ঘ"],answer:0}
 ],null,2);
 $("liveLabel").textContent=r?.is_live?"TEST IS LIVE":"TEST IS NOT STARTED";
}
function parseQuestions(){
 let q;
 try{q=JSON.parse($("questionsInput").value)}catch(e){throw Error("Questions JSON is not valid.")}
 if(!Array.isArray(q)||!q.length)throw Error("Add at least one question.");
 for(let i=0;i<q.length;i++){
  if(!q[i].question||!Array.isArray(q[i].options)||q[i].options.length<2||typeof q[i].answer!=="number")throw Error(`Question ${i+1} is incomplete.`);
  if(q[i].answer<0||q[i].answer>=q[i].options.length)throw Error(`Question ${i+1} has an invalid answer index.`);
 }
 return q;
}
async function save(startValue=null){
 const c=$("classSelect").value,q=parseQuestions();
 const existing=rows.find(x=>x.class===c);
 const payload={class:c,title:$("titleInput").value.trim()||"Revisionary Test",duration_minutes:Number($("durationInput").value)||30,questions:q};
 if(startValue!==null)payload.is_live=startValue;
 let res;
 if(existing)res=await sb.from("revision_tests").update(payload).eq("id",existing.id);
 else res=await sb.from("revision_tests").insert({...payload,is_live:startValue===true});
 if(res.error)throw res.error;
 const {data,error}=await sb.from("revision_tests").select("*").order("class");
 if(error)throw error;rows=data||[];renderTable();loadEditor();toast(startValue===true?"Test started.":"Test saved.","ok");
}
async function toggle(c,val){
 $("classSelect").value=c;loadEditor();
 try{await save(val)}catch(e){toast(e.message,"err")}
}
async function logout(){
 try{await sb.auth.signOut()}catch(e){}
 location.href="index.html";
}
window.rtToggle=toggle;
document.addEventListener("DOMContentLoaded",async()=>{
 try{
  await init();
  const {data}=await sb.auth.getSession();
  if(!data.session){$("login").classList.remove("rt-hidden");return}
  $("app").classList.remove("rt-hidden"); await load();
 }catch(e){console.error(e);$("loginError").textContent=e.message}
 $("loginBtn")?.addEventListener("click",async()=>{
   const email=$("email").value.trim(),password=$("password").value;
   const {error}=await sb.auth.signInWithPassword({email,password});
   if(error){$("loginError").textContent=error.message;return}
   $("login").classList.add("rt-hidden");$("app").classList.remove("rt-hidden");load().catch(e=>toast(e.message,"err"));
 });
 $("saveBtn")?.addEventListener("click",async()=>{try{await save()}catch(e){toast(e.message,"err")}});
 $("startBtn")?.addEventListener("click",async()=>{try{await save(true)}catch(e){toast(e.message,"err")}});
 $("stopBtn")?.addEventListener("click",async()=>{try{await save(false)}catch(e){toast(e.message,"err")}});
 $("logoutBtn")?.addEventListener("click",logout);
});
})();