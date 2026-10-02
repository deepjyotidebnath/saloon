const OWNER_PIN="1234", STUDIO="Aanya Beauty Studio", HOURS=[10,11,12,13,14,15,16,17,18];
const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const SERVICES={Hair:[["Haircut and blow-dry",600,"45 min"],["Hair spa",1200,"60 min"],["Global colour",3500,"2 hr"],["Keratin smoothing",5500,"3 hr"]],
Skin:[["Classic facial",900,"45 min"],["Hydra glow facial",2200,"60 min"],["De-tan cleanup",700,"40 min"],["Threading and waxing",450,"30 min"]],
Spa:[["Head and shoulder massage",800,"30 min"],["Aroma full-body massage",2800,"75 min"],["Manicure and pedicure",1300,"75 min"]],
Bridal:[["Bridal makeup",14000,"3 hr"],["Party makeup",3500,"90 min"],["Mehendi (both hands)",1500,"90 min"]]};
const ALL=Object.values(SERVICES).flat();
const PACKS=[{n:"Bridal week",d:"Facial, hair spa, mani-pedi and trial makeup",p:9999,was:12700},{n:"Self-care Sunday",d:"Aroma massage and hydra glow facial",p:4499,was:5000},{n:"Birthday glow",d:"Haircut, cleanup and party makeup, free in your birthday month",p:3999,was:4650}];
const GAL=[["Bridal look","#8a3b5a,#e9b8c2"],["Hair colour","#4a2650,#a67c3d"],["Glow facial","#e9b8c2,#f6e3d0"],["Nail art","#2f7a5a,#b6d9c8"],["Mehendi","#a67c3d,#5a2d1b"],["Party makeup","#c25a78,#4a2650"]];
const CATS={Hair:[3,"#4a2650,#a67c3d"],Skin:[4,"#e9b8c2,#c9a0d0"],Spa:[5,"#2f7a5a,#b6d9c8"],Bridal:[6,"#8a3b5a,#e9b8c2"]};
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rs=n=>"₹"+n.toLocaleString("en-IN");
const store={get(k,d){try{const v=localStorage.getItem("aanya_"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("aanya_"+k,JSON.stringify(v))}catch(e){}}};
let staff=store.get("staff",[{id:1,name:"Meera",days:[1,2,3,4,5,6]},{id:2,name:"Riya",days:[0,2,3,4,5,6]},{id:3,name:"Sana",days:[1,3,5,6,0]}]);
let bookings=store.get("bookings",[]), customers=store.get("customers",{});
let reviews=store.get("reviews",[{n:"Priya S.",r:5,t:"The hydra facial left my skin glowing for a week. The WhatsApp reminder was a nice touch."},{n:"Ananya D.",r:5,t:"Meera did my engagement makeup. It lasted all day and looked like me."},{n:"Rekha M.",r:4,t:"Clean studio, on time, fair prices. Hair spa was great."}]);
const wa=(ph,txt)=>"https://wa.me/"+ph+"?text="+encodeURIComponent(txt);

/* services */
let cat="Hair";
function drawSvc(){$("#svcTabs").innerHTML=Object.keys(SERVICES).map(c=>{const[n,g]=CATS[c],[a,b]=g.split(",");return`<button class="catcard" role="tab" aria-selected="${c==cat}" data-c="${c}" style="background:linear-gradient(145deg,${a},${b})"><img src="../assets/image-${n}.jpg" alt="" onerror="var e=['jpg','jpeg','png'],i=+(this.dataset.i||0)+1;if(i<3){this.dataset.i=i;this.src=this.src.replace(/\.\w+$/,'.'+e[i])}else this.remove()"><span>${c}</span></button>`}).join("");
$("#svcList").innerHTML=SERVICES[cat].map(s=>`<li><span><span class="n">${s[0]}</span><br><span class="d">${s[2]}</span></span><span class="dots"></span><span class="p">${rs(s[1])}</span></li>`).join("")}
$("#svcTabs").onclick=e=>{const b=e.target.closest("[data-c]");if(b){cat=b.dataset.c;drawSvc()}};drawSvc();
$("#packs").innerHTML=PACKS.map(p=>`<div class="pack"><span class="off">Save ${rs(p.was-p.p)}</span><h3>${p.n}</h3><p class="sub" style="margin:.3rem 0">${p.d}</p><p style="margin:0"><b style="font-size:1.4rem">${rs(p.p)}</b> <span class="was">${rs(p.was)}</span></p></div>`).join("");
$("#gal").innerHTML=GAL.map((g,i)=>{const[c1,c2]=g[1].split(",");return`<div style="background:linear-gradient(145deg,${c1},${c2})"><img src="../assets/image-${i+7}.jpg" alt="${g[0]}" loading="lazy" onerror="var e=['jpg','jpeg','png'],i=+(this.dataset.i||0)+1;if(i<3){this.dataset.i=i;this.src=this.src.replace(/\.\w+$/,'.'+e[i])}else this.remove()"><span>${g[0]}</span></div>`}).join("");

/* reviews */
function drawRev(){$("#revs").innerHTML=reviews.map(v=>`<div class="rev"><span class="star" aria-label="${v.r} out of 5">${"★".repeat(v.r)}${"☆".repeat(5-v.r)}</span><p style="margin:.3rem 0">${esc(v.t)}</p><span class="who">${esc(v.n)}</span></div>`).join("")}
drawRev();
$("#revForm").onsubmit=e=>{e.preventDefault();const f=e.target;reviews.unshift({n:f.n.value.trim(),r:+f.r.value,t:f.t.value.trim()});store.set("reviews",reviews);drawRev();f.reset()};

/* booking */
$("#bSvc").innerHTML=ALL.map(s=>`<option value="${s[0]}">${s[0]} (${rs(s[1])})</option>`).join("");
function drawStaffSel(){$("#bStaff").innerHTML=staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join("")}drawStaffSel();
const today=new Date().toISOString().slice(0,10);$("#bDate").min=today;$("#bDate").value=today;
let pick=null;
const fmt=h=>(h>12?h-12:h)+":00 "+(h>=12?"PM":"AM");
function drawSlots(){pick=null;const sid=+$("#bStaff").value,d=$("#bDate").value;if(!d)return;
const st=staff.find(s=>s.id===sid),dow=new Date(d+"T00:00").getDay(),works=st&&st.days.includes(dow);
const taken=bookings.filter(b=>b.staff===sid&&b.date===d&&b.status!=="Cancelled").map(b=>b.hour);
$("#slotNote").textContent=works?"":(st?st.name:"This stylist")+" is off on "+DAYS[dow]+". Choose another day or stylist.";
$("#slots").innerHTML=HOURS.map(h=>`<button type="button" class="slot" data-h="${h}" aria-pressed="false" ${(!works||taken.includes(h))?"disabled":""}>${fmt(h)}</button>`).join("")}
$("#slots").onclick=e=>{const b=e.target.closest(".slot");if(!b||b.disabled)return;pick=+b.dataset.h;document.querySelectorAll(".slot").forEach(x=>x.setAttribute("aria-pressed",x===b))};
$("#bStaff").onchange=$("#bDate").onchange=drawSlots;drawSlots();
$("#bookForm").onsubmit=e=>{e.preventDefault();
if(pick===null){$("#slotNote").textContent="Please choose a time.";return}
const svc=ALL.find(s=>s[0]===$("#bSvc").value),sid=+$("#bStaff").value,phone=$("#bPhone").value.trim(),name=$("#bName").value.trim();
const b={id:Date.now(),name,phone,svc:svc[0],price:svc[1],staff:sid,date:$("#bDate").value,hour:pick,status:"Booked"};
bookings.push(b);store.set("bookings",bookings);
const c=customers[phone]||{name,phone,visits:0,bday:"",ann:""};c.name=name;if($("#bBday").value)c.bday=$("#bBday").value;if($("#bAnn").value)c.ann=$("#bAnn").value;customers[phone]=c;store.set("customers",customers);
const sn=staff.find(s=>s.id===sid).name;
const txt=`Hi ${name}, your ${b.svc} at ${STUDIO} is confirmed for ${b.date} at ${fmt(b.hour)} with ${sn}. Total ${rs(b.price)}. Reply here to reschedule.`;
$("#done").classList.remove("hide");
$("#done").innerHTML=`<b>You're booked.</b> ${esc(b.svc)} with ${esc(sn)} on ${b.date} at ${fmt(b.hour)}.<br><a class="btn sm" style="margin-top:.6rem" target="_blank" rel="noopener" href="${wa(phone,txt)}">Send WhatsApp confirmation</a>`;
e.target.reset();$("#bDate").value=today;drawStaffSel();drawSlots()};

/* owner desk */
let tab="b";
$("#unlock").onclick=()=>{if($("#pin").value===OWNER_PIN){$("#lock").classList.add("hide");$("#desk").classList.remove("hide");drawDesk()}else $("#pinErr").textContent="Wrong PIN."};
$("#dTabs").onclick=e=>{const t=e.target.dataset.t;if(!t)return;tab=t;document.querySelectorAll("#dTabs .tab").forEach(x=>x.setAttribute("aria-selected",x.dataset.t===t));drawDesk()};
const sname=id=>(staff.find(s=>s.id===id)||{name:"Removed"}).name;
function drawDesk(){const B=$("#dBody");
if(tab==="b"){const rows=[...bookings].sort((a,b)=>(a.date+a.hour).localeCompare(b.date+b.hour));
B.innerHTML=rows.length?`<table><tr><th>When</th><th>Client</th><th>Service</th><th>Stylist</th><th>Status</th><th>Reminder</th></tr>${rows.map(b=>{
const rem=`Hi ${b.name}, a reminder of your ${b.svc} at ${STUDIO} tomorrow at ${fmt(b.hour)} with ${sname(b.staff)}. See you soon!`;
return`<tr><td>${b.date}<br>${fmt(b.hour)}</td><td>${esc(b.name)}</td><td>${esc(b.svc)}<br>${rs(b.price)}</td><td>${esc(sname(b.staff))}</td>
<td><select data-id="${b.id}" class="st">${["Booked","Completed","Cancelled"].map(s=>`<option ${s===b.status?"selected":""}>${s}</option>`).join("")}</select></td>
<td><a class="btn sm" target="_blank" rel="noopener" href="${wa(b.phone,rem)}">Remind</a></td></tr>`}).join("")}</table>`:`<p class="sub">No bookings yet. New bookings from the form above appear here.</p>`}
if(tab==="s"){B.innerHTML=`<p class="sub">Tick the days each stylist works. Clients can only book on those days.</p>`+staff.map(s=>`<div style="padding:.6rem 0;border-bottom:1px solid var(--line)"><b>${esc(s.name)}</b> <button class="chip rm" data-id="${s.id}">Remove</button><div class="chips" style="margin-top:.4rem">${DAYS.map((d,i)=>`<button class="chip dy" data-id="${s.id}" data-d="${i}" aria-pressed="${s.days.includes(i)}">${d}</button>`).join("")}</div></div>`).join("")+`<form id="addSt" style="grid-template-columns:1fr auto;margin-top:1rem"><input id="newSt" placeholder="New stylist name" required maxlength="30"><button class="btn sm" type="submit">Add stylist</button></form>`}
if(tab==="c"){const cs=Object.values(customers),mm=d=>d?d.slice(5):"",tm=new Date().toISOString().slice(5,10);
B.innerHTML=cs.length?`<table><tr><th>Client</th><th>Visits</th><th>Birthday</th><th>Anniversary</th><th>Messages</th></tr>${cs.map(c=>{
const v=bookings.filter(b=>b.phone===c.phone&&b.status==="Completed").length;
const left=5-(v%5);
const m={bd:`Happy birthday ${c.name}! A small gift from ${STUDIO}: 15% off any service this month. Book anytime.`,an:`Happy anniversary ${c.name}! Treat yourselves to a spa day at ${STUDIO} with 10% off this week.`,
lo:v&&v%5===0?`Thank you ${c.name}! You have completed ${v} visits at ${STUDIO}. Your next service is 20% off.`:`Hi ${c.name}, you have ${v} completed visits. ${left} more and you earn 20% off at ${STUDIO}.`};
return`<tr><td>${esc(c.name)}<br><span class="sub" style="font-size:.8rem">${c.phone}</span></td><td>${v}</td><td>${c.bday||"-"}${mm(c.bday)===tm?" (today)":""}</td><td>${c.ann||"-"}${mm(c.ann)===tm?" (today)":""}</td>
<td class="chips"><a class="chip" target="_blank" rel="noopener" href="${wa(c.phone,m.bd)}">Birthday</a><a class="chip" target="_blank" rel="noopener" href="${wa(c.phone,m.an)}">Anniversary</a><a class="chip" target="_blank" rel="noopener" href="${wa(c.phone,m.lo)}">Loyalty</a></td></tr>`}).join("")}</table><p class="sub" style="margin-top:.8rem">Loyalty: every 5th completed visit earns 20% off. Mark a booking Completed in the Bookings tab to count it.</p>`:`<p class="sub">Customers appear here after their first booking.</p>`}}
$("#dBody").onchange=e=>{if(e.target.classList.contains("st")){const b=bookings.find(x=>x.id===+e.target.dataset.id);b.status=e.target.value;store.set("bookings",bookings);drawSlots()}};
$("#dBody").onclick=e=>{const t=e.target;
if(t.classList.contains("dy")){const s=staff.find(x=>x.id===+t.dataset.id),d=+t.dataset.d;s.days=s.days.includes(d)?s.days.filter(x=>x!==d):[...s.days,d];store.set("staff",staff);drawDesk();drawSlots()}
if(t.classList.contains("rm")&&confirm("Remove this stylist?")){staff=staff.filter(x=>x.id!==+t.dataset.id);store.set("staff",staff);drawDesk();drawStaffSel();drawSlots()}};
$("#dBody").onsubmit=e=>{if(e.target.id==="addSt"){e.preventDefault();staff.push({id:Date.now(),name:$("#newSt").value.trim(),days:[1,2,3,4,5,6]});store.set("staff",staff);drawDesk();drawStaffSel();drawSlots()}};
$("#theme").onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue("--bg").trim()==="#1c121f";r.dataset.theme=d?"light":"dark"};
