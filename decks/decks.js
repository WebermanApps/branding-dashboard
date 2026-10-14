/* Deck Building view, shared by /decks/ and the main dashboard. Usage: DeckApp(el,{base:'<url of decks.json dir>',self:'<page url>'}) */
(function(w){
const esc=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SS='https://webermanapps.github.io/style-swipe/',BANKS=SS+'banks/index.json';
const sv=(p,sw=2.2)=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={cards:sv('<rect x="4" y="6" width="12" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>'),check:sv('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',2.4),inbox:sv('<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>'),mix:sv('<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M17 4l3 3-3 3M17 14l3 3-3 3"/>'),play:sv('<path d="M7 5l12 7-12 7z"/>',2.4)};
const CSS=`.dk *{box-sizing:border-box}.dk{font-family:Hind,system-ui,sans-serif;color:#0a0a0a}
.dk h2{font:700 28px/1.1 Khand,sans-serif;margin:8px 0 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dk h3{font:700 22px/1.1 Khand,sans-serif;margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dk .bub{font:600 13px Hind,sans-serif;background:#fbf3dc;color:#7a5c00;min-width:0;height:auto;line-height:1.5;border-radius:999px;padding:2px 10px}.dk .bank{font:700 13px Khand,sans-serif;letter-spacing:.06em;text-transform:uppercase;border:1.5px solid #05668D;color:#05668D;padding:1px 8px}
.dk .cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.dk .cat{min-width:0}
.dk .k{font:700 12px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#737373;margin:12px 0 6px}
.dk .card{display:flex;gap:10px;align-items:flex-start;border:1px solid #e5e5e5;border-left:4px solid var(--c);padding:10px 12px;color:inherit;text-decoration:none;background:#fff;margin:0 0 8px;min-width:0}
.dk .card>div{min-width:0;flex:1}.dk .nm{font:700 18px/1.15 Khand,sans-serif}.dk .sub{font-size:14px;color:#525252}.dk .meta{font-size:13px;color:#737373;margin-top:2px}
.dk .ic{width:20px;height:20px;flex:none;color:var(--c,#05668D);margin-top:2px}.dk .none{font-size:14px;color:#737373}
.dk .mix{border:2px solid #05668D;padding:16px;margin:0 0 16px;--c:#05668D}.dk .boxes{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.dk .boxes label,.dk .size label{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border:1px solid #d4d4d4;cursor:pointer;font-size:15px}
.dk .boxes input,.dk .size input{width:18px;height:18px;accent-color:#05668D}
.dk .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.dk .size{display:flex;gap:8px}
.dk .start{display:inline-flex;align-items:center;gap:8px;min-height:52px;padding:0 26px;border:2px solid #05668D;background:#05668D;color:#fff;font:700 18px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;cursor:pointer}.dk .start .ic{color:#fff;margin:0}
.dk .start[aria-disabled=true]{opacity:.5;pointer-events:none}.dk .tl{font:600 14px Hind,sans-serif;background:none;border:0;color:#05668D;text-decoration:underline;cursor:pointer;min-height:44px}
.dk .mw-hover{transition:transform 180ms ease-out,box-shadow 180ms ease-out}.dk .mw-hover:hover,.dk .mw-hover:focus-visible{transform:translateY(-1px) scale(1.02);box-shadow:0 6px 18px rgba(10,10,10,.12)}
@media(hover:none){.dk .mw-hover:hover{transform:none;box-shadow:none}}@media(prefers-reduced-motion:reduce){.dk .mw-hover{transition:none}}
@media(max-width:480px){.dk .cats{grid-template-columns:1fr}}
.dk .bigt{font:700 clamp(40px,7vw,64px)/1 Khand,sans-serif;margin:8px 0 4px;text-align:left;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.dk .bigt .bub{font-size:14px}
.dk .bigsub{color:#525252;margin:0 0 16px;font-size:15px}
.dk details.fold{border:1px solid #e5e5e5;background:#fff;min-width:0}.dk details.fold>summary{list-style:none;cursor:pointer;min-height:56px;display:flex;align-items:center;gap:8px;padding:10px 14px;flex-wrap:wrap}
.dk details.fold>summary::-webkit-details-marker{display:none}.dk details.fold>summary::after{content:"";width:9px;height:9px;border-right:2.5px solid #05668D;border-bottom:2.5px solid #05668D;transform:rotate(45deg);margin-left:auto}
.dk details.fold[open]>summary::after{transform:rotate(-135deg)}.dk details.fold .in{padding:0 14px 16px}.dk .cats{align-items:start}
.dk .tlinks{display:flex;flex-direction:column}.dk .tlinks a,.dk .tlinks div.tx{display:flex;gap:8px;align-items:flex-start;min-height:44px;padding:8px 0;border-top:1px solid #f0f0f0;color:#05668D;text-decoration:underline;text-underline-offset:3px}.dk .tlinks>:first-child{border-top:0}
.dk .tlinks .sub{text-decoration:none}
.dk .card{padding:8px 10px;margin:0 0 6px}.dk .k{margin:8px 0 4px}.dk h2{margin:4px 0 8px}.dk .mix{padding:12px;margin:0 0 10px}.dk .cats{gap:10px}
.dk .sub.cl{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.dk .sub.cl.x{display:block}
.dk .dt{margin-left:auto;flex:none;font-size:13px;color:#737373;white-space:nowrap;padding-left:8px}
.dk .more{display:none}.dk .seeall{min-height:44px;border:0;background:none;color:#05668D;font:600 15px Hind,sans-serif;text-decoration:underline;cursor:pointer;padding:0}
.dk .list.all .more{display:flex}
/* Deck Board picks (Oct 14 2026, deck-board 19/20): featured big gold card first, Mixed Deck chips at top, coloured category chips all open by newest activity,
   white-outline rows with title/topic/agent label, category-colour progress ring, partial line + Resume, icon app row, compact, spaced-caps headings, wide grid on big monitors */
.dk h2,.dk h3,.dk .bigt{text-transform:uppercase;letter-spacing:.08em}
.dk .bigt{font-size:clamp(30px,5vw,46px)}
.dk .feat{display:block;border:3px solid #ECC978;background:#FBF8F1;padding:14px 16px;margin:0 0 10px;color:inherit;text-decoration:none}
.dk .feat .fk{font:700 12px Khand,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8A6A0E}.dk .feat .fn{font:700 26px/1.1 Khand,sans-serif;margin:2px 0 4px}
.dk .feat .go{display:inline-flex;align-items:center;min-height:40px;margin-top:6px;padding:0 14px;border:2px solid #0a0a0a;font:700 14px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.dk .apps{display:flex;gap:8px;margin:0 0 10px;overflow-x:auto}.dk .apps a{flex:1 0 76px;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:44px;padding:6px 4px;color:#0a0a0a;text-decoration:none;font:600 12px/1.15 Khand,sans-serif;text-align:center}
.dk .apps a span{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--c) 14%,#fff);color:var(--c)}.dk .apps .ic{margin:0;width:20px;height:20px}
.dk .boxes label{border-radius:999px;border-color:var(--c,#d4d4d4);color:var(--c,#0a0a0a);font-weight:600;min-height:40px}.dk .boxes input{position:absolute;opacity:0;width:1px;height:1px}
.dk .boxes label:has(input:checked){background:var(--c);color:#fff}.dk .boxes label:has(input:focus-visible){outline:2px solid #05668D;outline-offset:2px}
.dk .size label{border-radius:999px;min-height:40px}.dk .boxes{gap:6px}@media(max-width:480px){.dk .boxes label{min-height:36px;padding:0 10px;font-size:14px}}
.dk section.cat{border:0;background:none;padding:0}.dk .chip{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:color-mix(in srgb,var(--c) 14%,#fff);color:var(--c);font:700 18px/1.2 Khand,sans-serif;letter-spacing:.08em;text-transform:uppercase}
.dk .cathead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:6px 0 2px}
.dk .card{border:1px solid #E5E0D8;border-radius:10px;align-items:center}
.dk .ring{width:34px;height:34px;flex:none}.dk .agent{display:inline-block;font:700 11px Khand,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--c) 14%,#fff);color:var(--c)}
.dk .partial{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px;font-size:13px;color:#8A6A0E;font-weight:600}.dk .resume{display:inline-flex;align-items:center;min-height:32px;padding:0 10px;background:#0a0a0a;color:#fff;font:700 12px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase}
.dk .card{padding:7px 10px;margin:0 0 5px}.dk .k{margin:6px 0 3px}.dk .cats{gap:8px}
.dk .today{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid #E5E0D8;border-radius:10px;padding:8px 12px;margin:0 0 10px;background:#fff}.dk .today b{font:700 26px/1 Khand,sans-serif;color:#0B6E4F}.dk .today .tl2{font:700 13px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase}.dk .today .tp{font-size:13px;color:#525252}
.dk .wk{display:flex;align-items:flex-end;gap:4px;margin-left:auto;height:34px}.dk .wk div{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;color:#737373}.dk .wk i{display:block;width:14px;border-radius:3px;background:#0B6E4F55}.dk .wk div:last-child i{background:#0B6E4F}
@media(min-width:1400px){.dk .cats{grid-template-columns:1fr}.dk .cat .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:0 8px}.dk .cat .list .seeall{grid-column:1/-1;justify-self:start}.dk .cat .list:not(.all) .more{display:none}.dk .cat .list.all .more{display:flex}}`;
function bankOf(B,s){if(!B)return 0;let v=B[s];if(v==null&&B.banks)v=Array.isArray(B.banks)?B.banks.find(x=>x&&(x.slug===s||x.id===s||x.category===s)):B.banks[s];
 if(v==null&&Array.isArray(B))v=B.find(x=>x&&(x.slug===s||x.id===s||x.category===s));
 if(typeof v==='number')return v;if(v&&typeof v==='object')return +(v.count??v.n??v.size??v.total??(Array.isArray(v.pairs)?v.pairs.length:0))||0;return 0}
w.DeckApp=function(el,o){
 if(!document.getElementById('dk-css')){const s=document.createElement('style');s.id='dk-css';s.textContent=CSS;document.head.appendChild(s)}
 const self=o.self||location.href.split(/[?#]/)[0],link=id=>SS+'?date='+encodeURIComponent(id)+'&from='+encodeURIComponent(self),href=d=>d.url||link(d.id);
 const date=ts=>new Date(ts).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'Asia/Bangkok'});
 el.classList.add('dk');el.innerHTML='<p class="none">Loading decks…</p>';
 Promise.all([fetch(o.base+'decks.json',{cache:'no-store'}).then(r=>r.json()),fetch(o.base+'requests.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({requests:[]})),fetch(BANKS,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)]).then(([J,RQ,B])=>{
  if(o.onData)try{o.onData(J)}catch(_){}
  const C=J.categories,D=J.decks,W=D.filter(d=>d.status==='wait');
  const PAL=['#C1502E','#05668D','#0B6E4F','#D4A017'],act=c=>{const i=D.findIndex(d=>d.cat===c.slug);return i<0?1e9:i};
  const CO=[...C].sort((a,b)=>act(a)-act(b)),col={};C.forEach((c,i)=>col[c.slug]=PAL[i%4]);const cname={};C.forEach(c=>cname[c.slug]=c.name);
  const ring=(a,n,c,done)=>{const f=n?Math.min(1,(a||0)/n):0,r=13,L=2*Math.PI*r;return `<svg class="ring" viewBox="0 0 34 34" aria-label="${a||0} of ${n||'?'} answered"><circle cx="17" cy="17" r="${r}" fill="none" stroke="#EEEBE5" stroke-width="4"/>${f?`<circle cx="17" cy="17" r="${r}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${(f*L).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 17 17)"/>`:''}${done?`<path d="M12 17.5l3.5 3.5 6.5-7" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`:''}</svg>`};
  const row=(d,done)=>{const c=col[d.cat]||'#05668D',n=d.total||d.size,a=d.answered||0,part=!done&&a>0&&n&&a<n;
   return `<a class="card mw-hover" style="--c:${c}" href="${href(d)}">${ring(done?(d.answered??n):a,n,c,done)}<div><div class="nm">${esc(d.name)}</div><div class="sub cl">${esc(d.about)}</div><div class="meta"><span class="agent">${esc(cname[d.cat]||d.cat)}</span> · <span data-size="${esc(d.id)}">${d.size?d.size+' pairs':''}</span>${done?` · Results In${d.answered!=null?' · '+d.answered+'/'+(n||'?'):''}`:''}</div>${part?`<div class="partial">Sent partial, ${n-a} left to answer <span class="resume">Resume</span></div>`:''}</div>${done&&d.submitted?`<span class="dt">${date(d.submitted)}</span>`:''}</a>`};
  const wc=d=>row(d,false),fc=d=>row(d,true);
  const F=o.featured===false?null:(D.find(d=>d.featured&&d.status==='wait'&&d.cat==='wellnest')||D.find(d=>d.featured&&d.status==='wait'));
  const feat=F?`<a class="feat mw-hover" href="${href(F)}"><div class="fk">Featured · ${esc(cname[F.cat]||'')}</div><div class="fn">${esc(F.name)}</div><div class="sub">${esc(F.about)}</div><span class="go">Open The Deck</span></a>`:'';
  const apps=o.apps?`<nav class="apps" aria-label="My Apps">${o.apps.map((x,i)=>`<a class="mw-hover" style="--c:${PAL[i%4]}" href="${x.href}"><span>${IC[x.ic]||IC.cards}</span>${esc(x.name)}</a>`).join('')}</nav>`:'';
  const mix=`<div class="mix"><h3>${IC.mix}Mixed Deck</h3><div class="sub" style="margin-top:4px">Pick categories and a size, then start one deck that mixes them.</div>
   <div class="boxes">${CO.map(c=>`<label style="--c:${col[c.slug]}"><input type="checkbox" value="${c.slug}" checked>${esc(c.name)}</label>`).join('')}</div>
   <div class="row"><div class="size" role="radiogroup" aria-label="Deck size"><label><input type="radio" name="mixn" value="25" checked>25 Pairs</label><label><input type="radio" name="mixn" value="50">50 Pairs</label></div>
   <button type="button" class="tl" data-all="1">Select All</button><button type="button" class="tl" data-all="0">Clear</button>
   <a class="start mw-hover" href="#">${IC.play}Start</a></div></div>`;
  const five=(a,f,none)=>a.length?`<div class="list">${a.map((d,i)=>f(d).replace(/^<a class="card/,i>4?'<a class="more card':'<a class="card')).join('')}${a.length>5?`<button type="button" class="seeall">See All ${a.length}</button>`:''}</div>`:none;
  const cats=CO.map(c=>{const w=D.filter(d=>d.cat===c.slug&&d.status==='wait').sort((a,b)=>a.order-b.order),f=D.filter(d=>d.cat===c.slug&&d.status==='done').sort((a,b)=>a.order-b.order);
   return `<section class="cat" data-cat="${c.slug}" style="--c:${col[c.slug]}"><div class="cathead"><h3 class="chip">${esc(c.name)}</h3><span class="bub">${w.length} Waiting</span><span class="bank">Bank: ${bankOf(B,c.slug)}/100</span></div>
   <div class="k">Waiting On You</div>${five(w,wc,'<div class="none">Nothing waiting.</div>')}
   <div class="k">Finished</div>${five(f,fc,'<div class="none">None yet.</div>')}</section>`}).join('');
    const R=(RQ.requests||[]).filter(r=>r.status!=='Done');
  const req=R.map(r=>`<${r.deck?`a href="${link(r.deck)}"`:'div class="tx"'}>${IC.inbox}<div><b>${esc(r.title)}</b><div class="sub">${esc(r.detail)} · From ${esc(r.from)} · ${esc(r.status)}</div></div></${r.deck?'a':'div'}>`).join('')||'<div class="none">No open requests.</div>';
  el.innerHTML=`<h2 class="bigt">Deck Building <span class="bub">${W.length} Waiting</span></h2><p class="bigsub">Newest activity first. Start a mixed deck or open any deck.</p><div class="today" id="dkToday" hidden></div>${feat}${apps}${mix}<div class="cats">${cats}</div><details class="fold" style="margin-top:16px"><summary><h3>Requests From Agents <span class="bub">${R.length}</span></h3></summary><div class="in tlinks">${req}</div></details>`;
  const st=el.querySelector('.start'),upd=()=>{const s=[...el.querySelectorAll('.boxes input:checked')].map(i=>i.value),n=(el.querySelector('input[name=mixn]:checked')||{}).value||25;
   st.href=s.length?SS+'?mix='+s.join(',')+'&n='+n+'&from='+encodeURIComponent(self):'#';st.setAttribute('aria-disabled',s.length?'false':'true')};
  el.querySelectorAll('.seeall').forEach(b=>b.onclick=()=>{const l=b.parentNode,on=l.classList.toggle('all');b.textContent=on?'Show Less':'See All '+l.querySelectorAll('.card').length});
  el.querySelectorAll('.sub.cl').forEach(e=>e.addEventListener('click',ev=>{if(e.scrollHeight>e.clientHeight+2&&!e.classList.contains('x')){ev.preventDefault();e.classList.add('x')}}));
  el.querySelector('.mix').addEventListener('change',upd);el.querySelectorAll('.tl').forEach(b=>b.onclick=()=>{el.querySelectorAll('.boxes input').forEach(i=>i.checked=b.dataset.all==='1');upd()});upd();
  /* decks finished today (ICT), from decks/today.json written by tools/deck_today.py */
  fetch(o.base+'decks/today.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(T=>{const t=el.querySelector('#dkToday');if(!T||!t)return;
   const mx=Math.max(1,...T.week.map(x=>x.count)),dl=d=>new Date(d+'T12:00:00+07:00').toLocaleDateString('en-US',{weekday:'narrow',timeZone:'Asia/Bangkok'});
   t.innerHTML=`<b>${T.count}</b><div><div class="tl2">Decks Finished Today</div><div class="tp">${T.partial?T.partial+' partial · ':''}ICT, each deck once</div></div><div class="wk" aria-label="Last 7 days">${T.week.map(x=>`<div title="${x.date}: ${x.count}"><i style="height:${Math.max(2,Math.round(22*x.count/mx))}px"></i>${dl(x.date)}</div>`).join('')}</div>`;t.hidden=false}).catch(()=>{});
  /* live sizes: one sizes.json (deck_id -> pair count); decks.json size stays as fallback; external url decks keep their size */
  fetch(SS+'decks/sizes.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(S=>{if(!S)return;D.forEach(d=>{if(d.url)return;const n=+S[d.id]||0;if(!n)return;d.size=n;el.querySelectorAll('[data-size="'+d.id+'"]').forEach(e=>e.textContent=n+' pairs')})}).catch(()=>{});
 }).catch(e=>{console.warn('deck render',e);el.innerHTML='<p class="none">Decks not available.</p>'});
};
})(window);
