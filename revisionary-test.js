const RT_CLASSES=["VI","VII","VIII","IX","X","XI","XII"];
let sb=null,studentTest=null,studentAnswers={},studentIndex=0,studentEnd=0,studentName="",studentRoll="",statusChannel=null;

async function rtLoadSupabase(){
  if(!window.LETS_SCORE_SUPABASE || window.LETS_SCORE_SUPABASE.url.includes("PASTE_")) return null;
  if(!window.supabase) return null;
  sb=window.supabase.createClient(window.LETS_SCORE_SUPABASE.url,window.LETS_SCORE_SUPABASE.anonKey);
  return sb;
}
async function rtLoadScript(){
  if(window.supabase)return;
  await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
}
async function rtInit(){try{await rtLoadScript();return await rtLoadSupabase()}catch(e){return null}}
function qClass(){return new URLSearchParams(location.search).get("class")||"VI"}
async function fetchActive(c){
  if(!sb)return null;
  const {data,error}=await sb.from("revision_tests").select("*").eq("class_code",c).eq("is_live",true).order("updated_at",{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;return data;
}
async function home(){
 const box=document.getElementById("classes");if(!box)return;
 await rtInit();
 for(const c of RT_CLASSES){
   let live=false;
   try{live=!!await fetchActive(c)}catch(e){}
   box.insertAdjacentHTML("beforeend",`<a class="rt-class-card" href="take-test.html?class=${c}"><h3>Class ${c}</h3><p>Revisionary Test</p><small>${live?"🟢 LIVE":"🔴 NOT STARTED"}</small></a>`);
 }
 const any=[...box.querySelectorAll("small")].some(x=>x.textContent.includes("LIVE"));
 const p=document.getElementById("globalStatus");p.className="rt-status "+(any?"on":"off");p.textContent=any?"● TEST LIVE":"● TEST NOT STARTED";
}
async function startStudentTest(){
 const loading=document.getElementById("loading");if(!loading)return;
 await rtInit();const c=qClass();
 if(!sb){loading.classList.add("rt-hidden");document.getElementById("locked").classList.remove("rt-hidden");document.getElementById("lockTitle").textContent="Setup Required";document.getElementById("lockText").textContent="The test server is not configured yet. Add your Supabase URL and anon/publishable key to supabase-config.js.";return}
 try{
  studentTest=await fetchActive(c);loading.classList.add("rt-hidden");
  if(!studentTest){document.getElementById("locked").classList.remove("rt-hidden");return}
  document.getElementById("identity").classList.remove("rt-hidden");
  document.getElementById("identityMeta").textContent=`${studentTest.title} • ${studentTest.duration_minutes} minutes • ${studentTest.total_marks} marks`;
  statusChannel=sb.channel("test-status-"+studentTest.id).on("postgres_changes",{event:"UPDATE",schema:"public",table:"revision_tests",filter:"id=eq."+studentTest.id},payload=>{if(!payload.new.is_live)location.reload()}).subscribe();
 }catch(e){loading.classList.add("rt-hidden");document.getElementById("locked").classList.remove("rt-hidden");document.getElementById("lockText").textContent="Unable to load the test. Please try again."}
}
async function beginExam(){
 studentName=document.getElementById("studentName").value.trim();studentRoll=document.getElementById("studentRoll").value.trim();
 if(!studentName){document.getElementById("identityError").textContent="Please enter your name.";return}
 const {data:qs,error}=await sb.from("revision_questions").select("*").eq("test_id",studentTest.id).order("question_no");
 if(error||!qs?.length){document.getElementById("identityError").textContent="Questions are not available yet.";return}
 studentTest.questions=qs;studentAnswers={};studentIndex=0;studentEnd=Date.now()+studentTest.duration_minutes*60000;
 document.getElementById("identity").classList.add("rt-hidden");document.getElementById("exam").classList.remove("rt-hidden");
 document.getElementById("examClass").textContent="CLASS "+studentTest.class_code;document.getElementById("testTitle").textContent=studentTest.title;document.getElementById("meta").textContent=`${qs.length} questions • ${studentTest.duration_minutes} minutes • ${studentTest.total_marks} marks`;renderStudentQuestion();studentClock();
}
function renderStudentQuestion(){
 const q=studentTest.questions[studentIndex];document.getElementById("count").textContent=`Question ${studentIndex+1} of ${studentTest.questions.length}`;document.getElementById("percent").textContent=Math.round((studentIndex+1)/studentTest.questions.length*100)+"%";document.getElementById("bar").style.width=((studentIndex+1)/studentTest.questions.length*100)+"%";document.getElementById("question").textContent=q.question_text;
 const opts=q.options||[];document.getElementById("options").innerHTML=opts.map((o,j)=>`<div class="rt-option ${studentAnswers[q.id]===j?"selected":""}" onclick="pick(${j})">${String.fromCharCode(65+j)}. ${o}</div>`).join("");
 document.getElementById("nav").innerHTML=studentTest.questions.map((x,j)=>`<button class="rt-navq ${studentAnswers[x.id]!==undefined?"done":""} ${j===studentIndex?"current":""}" onclick="jump(${j})">${j+1}</button>`).join("");document.getElementById("next").textContent=studentIndex===studentTest.questions.length-1?"Finish":"Next →";
}
function pick(j){studentAnswers[studentTest.questions[studentIndex].id]=j;renderStudentQuestion()}function jump(j){studentIndex=j;renderStudentQuestion()}function nextQ(){if(studentIndex<studentTest.questions.length-1){studentIndex++;renderStudentQuestion()}else submitExam()}function prevQ(){if(studentIndex>0){studentIndex--;renderStudentQuestion()}}
function studentClock(){const s=Math.max(0,Math.ceil((studentEnd-Date.now())/1000));document.getElementById("timer").textContent=`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;if(s===0){submitExam(true);return}setTimeout(studentClock,500)}
async function submitExam(auto=false){
 if(!auto&&!confirm("Submit this test now?"))return;
 let correct=0,attempted=Object.keys(studentAnswers).length;
 for(const q of studentTest.questions)if(studentAnswers[q.id]===q.correct_option)correct++;
 const payload={test_id:studentTest.id,student_name:studentName,student_roll:studentRoll||null,answers:studentAnswers,score:correct,total_questions:studentTest.questions.length,submitted_at:new Date().toISOString()};
 try{await sb.from("test_submissions").insert(payload)}catch(e){}
 document.getElementById("exam").classList.add("rt-hidden");document.getElementById("result").classList.remove("rt-hidden");document.getElementById("score").textContent=`${correct} / ${studentTest.questions.length}`;document.getElementById("breakdown").textContent=`Correct: ${correct} • Wrong: ${attempted-correct} • Unattempted: ${studentTest.questions.length-attempted}`;
}
async function teacherLogin(){
 await rtInit();if(!sb){document.getElementById("loginError").textContent="Configure Supabase first.";return}
 const email=document.getElementById("teacherEmail").value.trim(),password=document.getElementById("teacherPassword").value;
 const {error}=await sb.auth.signInWithPassword({email,password});if(error){document.getElementById("loginError").textContent=error.message;return}
 document.getElementById("login").classList.add("rt-hidden");document.getElementById("dashboard").classList.remove("rt-hidden");adminInit();
}
async function adminInit(){const sel=document.getElementById("cls");sel.innerHTML=RT_CLASSES.map(c=>`<option>${c}</option>`).join("");sel.onchange=adminLoad;await adminLoad()}
async function adminLoad(){
 const c=document.getElementById("cls").value,{data,error}=await sb.from("revision_tests").select("*").eq("class_code",c).order("updated_at",{ascending:false}).limit(1).maybeSingle();const x=data||{title:"Revisionary Test",duration_minutes:30,total_marks:30,is_live:false};
 document.getElementById("title").value=x.title;document.getElementById("duration").value=x.duration_minutes;document.getElementById("marks").value=x.total_marks;setAdminStatus(x.is_live);
 document.getElementById("summary").innerHTML=`Class: <b>${c}</b><br>Title: ${x.title}<br>Status: <b>${x.is_live?"LIVE":"NOT STARTED"}</b>`;
 if(x.id){const {data:r}=await sb.from("test_submissions").select("student_name,student_roll,score,total_questions,submitted_at").eq("test_id",x.id).order("submitted_at",{ascending:false}).limit(50);document.getElementById("results").innerHTML=r?.length?r.map(v=>`<div class="rt-result-row"><span>${v.student_name}${v.student_roll?" ("+v.student_roll+")":""}</span><b>${v.score}/${v.total_questions}</b></div>`).join(""):"No submissions yet."}else document.getElementById("results").textContent="No test created yet.";
}
function setAdminStatus(live){const e=document.getElementById("adminStatus");e.className="rt-status "+(live?"on":"off");e.textContent=live?"● LIVE":"● NOT STARTED"}
async function saveConfig(){
 const c=document.getElementById("cls").value,{data:existing}=await sb.from("revision_tests").select("id,is_live").eq("class_code",c).maybeSingle();
 const obj={class_code:c,title:document.getElementById("title").value||"Revisionary Test",duration_minutes:Math.max(1,+document.getElementById("duration").value||30),total_marks:Math.max(1,+document.getElementById("marks").value||30),is_live:existing?.is_live||false};
 let res=existing?await sb.from("revision_tests").update(obj).eq("id",existing.id).select().single():await sb.from("revision_tests").insert(obj).select().single();if(res.error)alert(res.error.message);else{await adminLoad();alert("Saved.")}}
async function startLive(){await saveConfig();const c=document.getElementById("cls").value;const {error}=await sb.from("revision_tests").update({is_live:true,started_at:new Date().toISOString()}).eq("class_code",c);if(error)alert(error.message);else{await adminLoad();alert("Class "+c+" test is LIVE for students.")}}
async function stopLive(){const c=document.getElementById("cls").value;const {error}=await sb.from("revision_tests").update({is_live:false,ended_at:new Date().toISOString()}).eq("class_code",c);if(error)alert(error.message);else{await adminLoad();alert("Class "+c+" test stopped.")}}
document.addEventListener("DOMContentLoaded",home);
window.startStudentTest=startStudentTest;window.beginExam=beginExam;window.pick=pick;window.jump=jump;window.nextQ=nextQ;window.prevQ=prevQ;window.submitExam=submitExam;window.teacherLogin=teacherLogin;window.saveConfig=saveConfig;window.startLive=startLive;window.stopLive=stopLive;