(() => {
"use strict";
const CDN="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
let sb=null, test=null, questions=[], answers={}, idx=0, timer=null, submitted=false;

function $(id){return document.getElementById(id)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function cls(){return new URLSearchParams(location.search).get("class")||""}
function toast(m,t=""){let e=$("toast");if(!e){e=document.createElement("div");e.id="toast";e.className="rt-toast";document.body.appendChild(e)}e.textContent=m;e.className="rt-toast "+t;setTimeout(()=>e.remove(),3500)}
async function init(){
 const c=window.LETS_SCORE_SUPABASE;
 if(!c?.url||!c?.anonKey) throw Error("Supabase configuration missing.");
 if(!window.supabase) await new Promise((res,rej)=>{let s=document.createElement("script");s.src=CDN;s.onload=res;s.onerror=rej;document.head.appendChild(s)});
 sb=window.supabase.createClient(c.url,c.anonKey);
}
async function load(){
 await init();
 const c=cls();
 if(!["VI","VII","VIII","IX","X","XI","XII"].includes(c)) return setupError("Invalid class.");
 const {data,error}=await sb.from("revision_tests").select("*").eq("class",c).maybeSingle();
 if(error) return setupError(error.message);
 if(!data || !data.is_live) return setupError("The test has not been started by the teacher yet.");
 test=data;
 questions=Array.isArray(data.questions)?data.questions:[];
 if(!questions.length) return setupError("Questions have not been added yet.");
 showIdentity();
}
function setupError(m){$("loading")?.classList.add("rt-hidden");$("errorBox")?.classList.remove("rt-hidden");$("errorMsg").textContent=m}
function showIdentity(){
 $("loading")?.classList.add("rt-hidden"); $("identity")?.classList.remove("rt-hidden");
 $("testTitle").textContent=test.title||"Revisionary Test";
 $("testMeta").innerHTML=`<span>Class ${esc(test.class)}</span><span>${questions.length} Questions</span><span>${Number(test.duration_minutes||30)} Minutes</span>`;
}
function begin(){
 const name=$("studentName").value.trim();
 if(name.length<2){$("identityError").textContent="Please enter your name.";return}
 $("identity").classList.add("rt-hidden");$("exam").classList.remove("rt-hidden");
 $("studentLabel").textContent=name;
 $("examTitle").textContent=test.title||"Revisionary Test";
 $("examClass").textContent="Class "+test.class;
 $("totalQ").textContent=questions.length;
 renderNav(); renderQuestion(); startTimer(Number(test.duration_minutes||30)*60);
}
function renderNav(){
 $("navGrid").innerHTML=questions.map((_,i)=>`<button class="rt-navq ${i===idx?"current":""} ${answers[i]!=null?"done":""}" onclick="window.rtGo(${i})">${i+1}</button>`).join("");
}
function renderQuestion(){
 const q=questions[idx]||{};
 $("qNo").textContent=idx+1; $("qText").innerHTML=esc(q.question||"");
 $("options").innerHTML=(q.options||[]).map((o,i)=>`<div class="rt-option ${answers[idx]===i?"selected":""}" onclick="window.rtPick(${i})"><b>${String.fromCharCode(65+i)}.</b> ${esc(o)}</div>`).join("");
 $("progress").style.width=((idx+1)/questions.length*100)+"%";
 $("prevBtn").disabled=idx===0; $("prevBtn").onclick=()=>go(idx-1); $("nextBtn").textContent=idx===questions.length-1?"Review & Submit":"Next"; $("nextBtn").onclick=()=>{if(idx===questions.length-1)submit(false);else go(idx+1)};
 renderNav();
}
function pick(i){answers[idx]=i;renderQuestion()}
function go(i){idx=Math.max(0,Math.min(questions.length-1,i));renderQuestion()}
function startTimer(sec){
 let end=Date.now()+sec*1000;
 const tick=()=>{
   let left=Math.max(0,Math.ceil((end-Date.now())/1000));
   let m=Math.floor(left/60),s=left%60;
   $("timer").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
   if(left<=60)$("timer").style.color="#f87171";
   if(left===0){clearInterval(timer);submit(true)}
 };
 tick(); timer=setInterval(tick,1000);
}
async function submit(auto=false){
 if(submitted)return;
 if(!auto && !confirm("Submit this test now?"))return;
 submitted=true; clearInterval(timer);
 const student=$("studentName").value.trim();
 let correct=0;
 questions.forEach((q,i)=>{if(answers[i]===q.answer)correct++});
 const payload={test_id:test.id,student_name:student,class:test.class,answers,score:correct,total:questions.length,submitted_at:new Date().toISOString()};
 const {error}=await sb.from("test_submissions").insert(payload);
 if(error){submitted=false;toast(error.message,"err");return}
 $("exam").classList.add("rt-hidden"); $("result").classList.remove("rt-hidden");
 $("score").textContent=`${correct} / ${questions.length}`;
 $("resultText").textContent=`You scored ${correct} out of ${questions.length}.`;
 if(auto) $("resultNote").textContent="Time ended. Your test was submitted automatically.";
}
window.rtPick=pick;window.rtGo=go;window.rtSubmit=()=>submit(false);window.rtNext=()=>{if(idx===questions.length-1)submit(false);else go(idx+1)};
document.addEventListener("DOMContentLoaded",()=>{
 $("beginBtn")?.addEventListener("click",begin);
 load().catch(e=>{console.error(e);setupError("Could not connect to the test server.");});
});
})();