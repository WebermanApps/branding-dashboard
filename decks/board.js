/* Main deck board (Deck Building page) v1 (Branding, Oct 17 2026). Applies Max's Main Deck Board Layout Deck (submitted 20:47 ICT):
   five across in a tight grid on desktop; a ring with answered/picks (3/10) on each card; agent + date asked; ONE list, newest asked first;
   grey cross top right = kit one-click remove (R102: DeckShelf.removable, 'Removed · Undo', board 'branding-djqmb410#decks');
   small NEW tag until first click (R98, localStorage ds-opened:<id>); empty state = a line plus an Ask button (opens Branding chat, R74);
   finished decks leave instantly (status done or submitted in this browser) but stay counted; phone = swipeable carousel with a peek of the next
   card (kit dash-theme .mw-carousel--peek --swipe, .mw-track, .mw-slide, .mw-dots). Date asked comes from decks/asked.json (tools/deck_asked.py).
   Usage: DeckBoard(el,{base:'../',self:'<page url>',apps:[...]}). decks.js (DeckApp) is unchanged and still used by the main board. */
(function(w){
const esc=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SS='https://webermanapps.github.io/style-swipe/',BOARD='branding-djqmb410#decks',AGENT_ID='3fac5054-3a3d-49b1-af61-59883f7fdc78';
const LS=k=>{try{return localStorage.getItem(k)}catch(_){return null}},LSset=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}};
const sv=(p,sw=2.2)=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={cards:sv('<rect x="4" y="6" width="12" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>'),check:sv('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',2.4),inbox:sv('<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>'),mix:sv('<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M17 4l3 3-3 3M17 14l3 3-3 3"/>'),play:sv('<path d="M7 5l12 7-12 7z"/>',2.4)};
const CSS=`.dk *{box-sizing:border-box}.dk{font-family:Hind,system-ui,sans-serif;color:#0a0a0a}
.dk h2,.dk h3{text-transform:uppercase;letter-spacing:.08em}
.dk h3{font:700 22px/1.1 Khand,sans-serif;margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dk .bigt{font:700 clamp(30px,5vw,46px)/1 Khand,sans-serif;margin:8px 0 4px;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;text-transform:uppercase;letter-spacing:.08em}
.dk .bub{font:600 14px Hind,sans-serif;background:#fbf3dc;color:#7a5c00;line-height:1.5;border-radius:999px;padding:2px 10px;letter-spacing:0;text-transform:none}
.dk .bub.fin{background:#EEF5F1;color:#0B6E4F}
.dk .bigsub{color:#525252;margin:0 0 14px;font-size:15px}.dk .none{font-size:14px;color:#737373}
.dk .today{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px solid #E5E0D8;border-radius:10px;padding:8px 12px;margin:0 0 14px;background:#fff}.dk .today b{font:700 26px/1 Khand,sans-serif;color:#0B6E4F}.dk .today .tl2{font:700 13px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase}.dk .today .tp{font-size:13px;color:#525252}
.dk .wk{display:flex;align-items:flex-end;gap:4px;margin-left:auto;height:34px}.dk .wk div{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10px;color:#737373}.dk .wk i{display:block;width:14px;border-radius:3px;background:#0B6E4F55}.dk .wk div:last-child i{background:#0B6E4F}
/* the one list: phone = kit carousel (peek + swipe); 600px+ = grid (3 across), 1024px+ = five across, tight */
.dk .db-list{margin:0 0 22px}
.dk .db-list .mw-track{gap:10px;padding:2px 2px 10px;scroll-padding-left:2px}
.dk .db-card{position:relative;display:flex;flex-direction:column;gap:6px;min-height:132px;padding:12px 12px 10px;background:#fff;border:1px solid #E5E0D8;border-top:3px solid var(--c);border-radius:10px;min-width:0}
.dk .db-card .db-a{position:absolute;inset:0;z-index:0;border-radius:10px}
.dk .db-card .db-a:focus-visible{outline:2px solid #05668D;outline-offset:2px}
.dk .db-nm{font:700 18px/1.15 Khand,sans-serif;padding-right:30px;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;pointer-events:none}
.dk .db-info{font-size:13px;line-height:1.35;color:#737373;pointer-events:none}.dk .db-info b{font-weight:600;color:#525252}
.dk .db-foot{margin-top:auto;display:flex;align-items:center;gap:8px;min-height:30px;pointer-events:none}
.dk .ring{width:28px;height:28px;flex:none}.dk .db-cnt{font:700 15px/1 Khand,sans-serif;color:#0B6E4F;letter-spacing:.02em}
.dk .db-new{margin-left:auto;font:600 12px/1 Khand,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#C1502E;background:#FAF6EE;border:1px solid #e3ddd2;border-radius:0;padding:3px 6px 2px}
.dk .db-card .ds-x{position:absolute;top:0;right:0;width:44px;height:44px;z-index:2;border-radius:0 10px 0 8px;color:#A3A3A3;font-size:19px}
.dk .db-card .ds-x:hover,.dk .db-card .ds-x:focus-visible{color:#C1502E;background:#FAF6EE}
.dk .db-card.mw-hover{transition:transform 180ms ease-out,box-shadow 180ms ease-out}
.dk .db-card.mw-hover:hover,.dk .db-card.mw-hover:focus-within{transform:translateY(-1px);box-shadow:0 6px 18px rgba(10,10,10,.10)}
@media(hover:none){.dk .db-card.mw-hover:hover{transform:none;box-shadow:none}}@media(prefers-reduced-motion:reduce){.dk .db-card.mw-hover{transition:none}}
.dk .mw-dots{flex-wrap:wrap;margin-top:6px}.dk .mw-dot{display:block}
.dk .db-pos{text-align:center;font-size:13px;color:#737373;margin-top:4px}
@media(max-width:599.98px){.dk .db-list .mw-track{grid-auto-columns:82%}.dk .db-card{min-height:150px;padding:14px 14px 12px}.dk .db-nm{font-size:20px}}
@media(min-width:600px){.dk .db-list .mw-track{display:grid;grid-auto-flow:row;grid-auto-columns:auto;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible;scroll-snap-type:none;padding:0}
 .dk .db-list .mw-dots,.dk .db-list .db-pos{display:none}}
@media(min-width:1024px){.dk .db-list .mw-track{grid-template-columns:repeat(5,minmax(0,1fr))}}
.dk .db-empty{border:1px solid #e3ddd2;background:#FAF6EE;border-radius:10px;padding:18px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 22px}
.dk .db-empty p{margin:0;font-size:16px;color:#0a0a0a;flex:1 1 220px}
.dk .db-ask{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:0 18px;border:2px solid #171717;background:#fff;color:#171717;font:700 15px/1 Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;cursor:pointer}
.dk .db-ask:hover,.dk .db-ask:focus-visible{background:#171717;color:#fff}
.dk .mix{border:2px solid #05668D;padding:12px;margin:0 0 12px;--c:#05668D}.dk .boxes{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.dk .boxes label,.dk .size label{position:relative;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border:1px solid #d4d4d4;cursor:pointer;font-size:15px;border-radius:999px}
.dk .boxes label{border-color:var(--c,#d4d4d4);color:var(--c,#0a0a0a);font-weight:600}.dk .boxes input{position:absolute;opacity:0;width:1px;height:1px}
.dk .boxes label:has(input:checked){background:var(--c);color:#fff}.dk .boxes label:has(input:focus-visible){outline:2px solid #05668D;outline-offset:2px}
.dk .size input{width:18px;height:18px;accent-color:#05668D}
.dk .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.dk .size{display:flex;gap:8px}
.dk .start{display:inline-flex;align-items:center;gap:8px;min-height:52px;padding:0 26px;border:2px solid #05668D;background:#05668D;color:#fff;font:700 18px Khand,sans-serif;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;cursor:pointer}.dk .start .ic{color:#fff;margin:0;width:20px;height:20px}
.dk .start[aria-disabled=true]{opacity:.5;pointer-events:none}.dk .tl{font:600 14px Hind,sans-serif;background:none;border:0;color:#05668D;text-decoration:underline;cursor:pointer;min-height:44px}
.dk .ic{width:20px;height:20px;flex:none;color:var(--c,#05668D)}.dk .sub{font-size:14px;color:#525252}
.dk details.fold{border:1px solid #e5e5e5;background:#fff;min-width:0;margin-top:12px}.dk details.fold>summary{list-style:none;cursor:pointer;min-height:56px;display:flex;align-items:center;gap:8px;padding:10px 14px;flex-wrap:wrap}
.dk details.fold>summary::-webkit-details-marker{display:none}.dk details.fold>summary::after{content:"";width:9px;height:9px;border-right:2.5px solid #05668D;border-bottom:2.5px solid #05668D;transform:rotate(45deg);margin-left:auto}
.dk details.fold[open]>summary::after{transform:rotate(-135deg)}.dk details.fold .in{padding:0 14px 16px}
.dk .tlinks{display:flex;flex-direction:column}.dk .tlinks a,.dk .tlinks div.tx{display:flex;gap:8px;align-items:flex-start;min-height:44px;padding:8px 0;border-top:1px solid #f0f0f0;color:#05668D;text-decoration:underline;text-underline-offset:3px}.dk .tlinks>:first-child{border-top:0}.dk .tlinks .sub{text-decoration:none}
.dk .apps{display:flex;gap:8px;margin:14px 0 0;overflow-x:auto}.dk .apps a{flex:1 0 76px;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:44px;padding:6px 4px;color:#0a0a0a;text-decoration:none;font:600 12px/1.15 Khand,sans-serif;text-align:center}
.dk .apps a span{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--c) 14%,#fff);color:var(--c)}.dk .apps .ic{margin:0}`;
/* progress = higher of decks.json answered and this browser's saved picks (same keys as kit deck-shelf.js) */
const st8=d=>{try{return JSON.parse((d.progress_key&&LS(d.progress_key))||(d.id&&(LS('styleSwipe:'+d.id)||LS('styleSwipe:v3:'+d.id)))||'null')||{}}catch(_){return {}}};
const cnt=s=>Array.isArray(s.picks)?s.picks.length:s.a&&typeof s.a==='object'?Object.keys(s.a).length:Object.keys(s).filter(k=>!/^(v|idx|order|updated|skip|sent|at)$/.test(k)).length;
const answered=d=>Math.max(+d.answered||0,cnt(st8(d)));
const submittedHere=d=>!!(d.id&&LS('styleSwipe:submitted:'+d.id));
const GONE=/^(done|hidden|retired|replaced|split|unlisted|removed)$/;
const finished=d=>GONE.test(String(d.status||''))||d.hidden===true||submittedHere(d);
const removedHere=d=>!!LS('ds-removed:'+BOARD+':'+d.id);
const ring=(a,n,c)=>{const f=n?Math.min(1,a/n):0,r=11,L=2*Math.PI*r;return `<svg class="ring" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="${r}" fill="none" stroke="#EEEBE5" stroke-width="3.5"/>${f?`<circle cx="14" cy="14" r="${r}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${(f*L).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 14 14)"/>`:''}</svg>`};
const dateOf=v=>{const t=typeof v==='number'?v:Date.parse(v||'');return t?new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'Asia/Bangkok'}):''};
w.DeckBoard=function(el,o){
 if(!document.getElementById('db-css')){const s=document.createElement('style');s.id='db-css';s.textContent=CSS;document.head.appendChild(s)}
 const self=o.self||location.href.split(/[?#]/)[0];
 const withFrom=u=>{try{const x=new URL(u,location.href);if(x.hostname!=='webermanapps.github.io')return u;x.searchParams.set('from',self);x.searchParams.set('from_name','Deck Building');return x.href}catch(_){return u}};
 const href=d=>d.url?withFrom(d.url):SS+'?date='+encodeURIComponent(d.id)+'&from='+encodeURIComponent(self)+'&from_name=Deck%20Building';
 el.classList.add('dk');el.innerHTML='<p class="none">Loading decks…</p>';
 const get=(u,fb)=>fetch(u,{cache:'no-store'}).then(r=>r.ok?r.json():fb).catch(()=>fb);
 Promise.all([fetch(o.base+'decks.json',{cache:'no-store'}).then(r=>r.json()),get(o.base+'decks/asked.json',{}),get(o.base+'requests.json',{requests:[]}),get(SS+'decks/sizes.json',null)]).then(([J,A,RQ,SZ])=>{
  if(o.onData)try{o.onData(J)}catch(_){}
  const C=J.categories||[],D=J.decks||[],asked=(A&&A.asked)||A||{};
  const PAL=['#C1502E','#05668D','#0B6E4F','#D4A017'],col={},cname={};C.forEach((c,i)=>{col[c.slug]=PAL[i%4];cname[c.slug]=c.name});
  const askedAt=d=>Date.parse(asked[d.id]||d.requested_at||d.asked||'')||0;
  const total=d=>{const n=d.url?0:+(SZ&&SZ[d.id])||0;return n||d.total||d.size||10};
  const draw=()=>{
   const live=D.filter(d=>!finished(d)&&!removedHere(d)).sort((a,b)=>askedAt(b)-askedAt(a)||(a.order||0)-(b.order||0));
   const doneN=D.filter(finished).length;
   const card=d=>{const c=col[d.cat]||'#05668D',n=total(d),a=Math.min(answered(d),n),nw=!LS('ds-opened:'+d.id)&&!a,dt=dateOf(askedAt(d));
    return `<article class="db-card mw-slide mw-hover" style="--c:${c}" data-id="${esc(d.id)}" aria-label="${esc(d.name)}"><a class="db-a" href="${esc(href(d))}" aria-label="Open ${esc(d.name)}, ${a} of ${n} answered"></a>
     <div class="db-nm">${esc(d.name)}</div><div class="db-info"><b>${esc(cname[d.cat]||String(d.cat||'Deck').replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()))}</b>${dt?' · Asked '+dt:''}</div>
     <div class="db-foot">${ring(a,n,'#0B6E4F')}<span class="db-cnt">${a}/${n}</span>${nw?'<span class="db-new">New</span>':''}</div></article>`};
   const nDots=live.length>12?10:live.length,per=Math.ceil(live.length/Math.max(1,nDots));
   const list=live.length?`<div class="db-list mw-carousel mw-carousel--peek mw-carousel--swipe"><div class="mw-track" aria-label="Decks waiting, newest asked first">${live.map(card).join('')}</div>
     <div class="mw-dots" aria-hidden="true">${Array.from({length:nDots},(_,i)=>`<span class="mw-dot"${i?'':' aria-current="true"'}></span>`).join('')}</div><div class="db-pos" aria-live="polite">1 of ${live.length}</div></div>`
    :`<div class="db-empty"><p>No decks waiting right now.</p><a class="db-ask" href="grokbot://app/v1/agent?id=${AGENT_ID}" data-ask>Ask For A Deck</a></div>`;
   const R=(RQ.requests||[]).filter(r=>r.status!=='Done');
   const req=R.map(r=>`<${r.deck?`a href="${esc(SS+'?date='+encodeURIComponent(r.deck)+'&from='+encodeURIComponent(self))}"`:'div class="tx"'}>${IC.inbox}<div><b>${esc(r.title)}</b><div class="sub">${esc(r.detail)} · From ${esc(r.from)} · ${esc(r.status)}</div></div></${r.deck?'a':'div'}>`).join('')||'<div class="none">No open requests.</div>';
   const CO=[...C];
   const mix=`<div class="mix"><h3>${IC.mix}Mixed Deck</h3><div class="sub" style="margin-top:4px">Pick categories and a size, then start one deck that mixes them.</div>
    <div class="boxes">${CO.map(c=>`<label style="--c:${col[c.slug]}"><input type="checkbox" value="${c.slug}" checked>${esc(c.name)}</label>`).join('')}</div>
    <div class="row"><div class="size" role="radiogroup" aria-label="Deck size"><label><input type="radio" name="mixn" value="10" checked>10 Pairs</label><label><input type="radio" name="mixn" value="20">20 Pairs</label></div>
    <button type="button" class="tl" data-all="1">Select All</button><button type="button" class="tl" data-all="0">Clear</button>
    <a class="start mw-hover" href="#">${IC.play}Start</a></div></div>`;
   const apps=o.apps?`<nav class="apps" aria-label="My Apps">${o.apps.map((x,i)=>`<a class="mw-hover" style="--c:${PAL[i%4]}" href="${x.href}"><span>${IC[x.ic]||IC.cards}</span>${esc(x.name)}</a>`).join('')}</nav>`:'';
   el.innerHTML=`<h2 class="bigt">Deck Building <span class="bub">${live.length} Waiting</span><span class="bub fin">${doneN} Finished</span></h2><p class="bigsub">One list, newest asked first. Finished decks leave the list and still count.</p><div class="today" id="dkToday" hidden></div>${list}${mix}<details class="fold"><summary><h3>Requests From Agents <span class="bub">${R.length}</span></h3></summary><div class="in tlinks">${req}</div></details>${apps}`;
   /* remove (R102 kit helper) + New until first click (R98) */
   el.querySelectorAll('.db-card').forEach(cd=>{const d=live.find(x=>x.id===cd.dataset.id);if(!d)return;
    if(w.DeckShelf&&DeckShelf.removable)DeckShelf.removable(cd,{board:BOARD,agent:'branding',deck:d.id,name:d.name,onChange:draw});
    cd.querySelector('.db-a').addEventListener('click',()=>{LSset('ds-opened:'+d.id,new Date().toISOString());const b=cd.querySelector('.db-new');if(b)b.remove()})});
   /* phone carousel dots + position */
   const tr=el.querySelector('.db-list .mw-track');if(tr){const dots=[...el.querySelectorAll('.db-list .mw-dot')],pos=el.querySelector('.db-pos');let tk=0;
    tr.addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const s=tr.querySelector('.mw-slide');if(!s)return;const i=Math.min(live.length-1,Math.round(tr.scrollLeft/(s.getBoundingClientRect().width+10)));
     const k=Math.min(dots.length-1,Math.floor(i/per));dots.forEach((x,j)=>j===k?x.setAttribute('aria-current','true'):x.removeAttribute('aria-current'));if(pos)pos.textContent=(i+1)+' of '+live.length})},{passive:true})}
   const ask=el.querySelector('[data-ask]');if(ask)ask.addEventListener('click',()=>{setTimeout(()=>{if(document.hidden||ask.parentNode.querySelector('.db-note'))return;const p=document.createElement('p');p.className='none db-note';p.style.flexBasis='100%';p.textContent='Open this in the Grok Bot app to ask Branding for a deck.';ask.parentNode.append(p)},1200)});
   const st=el.querySelector('.start'),upd=()=>{const s=[...el.querySelectorAll('.boxes input:checked')].map(i=>i.value),n=(el.querySelector('input[name=mixn]:checked')||{}).value||10;
    st.href=s.length?SS+'?mix='+s.join(',')+'&n='+n+'&from='+encodeURIComponent(self):'#';st.setAttribute('aria-disabled',s.length?'false':'true')};
   el.querySelector('.mix').addEventListener('change',upd);el.querySelectorAll('.tl').forEach(b=>b.onclick=()=>{el.querySelectorAll('.boxes input').forEach(i=>i.checked=b.dataset.all==='1');upd()});upd();
   today();
  };
  const today=()=>fetch(o.base+'decks/today.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(T=>{const t=el.querySelector('#dkToday');if(!T||!t)return;
   const mx=Math.max(1,...T.week.map(x=>x.count)),dl=d=>new Date(d+'T12:00:00+07:00').toLocaleDateString('en-US',{weekday:'narrow',timeZone:'Asia/Bangkok'});
   t.innerHTML=`<b>${T.count}</b><div><div class="tl2">Decks Finished Today</div><div class="tp">${T.partial?T.partial+' partial · ':''}ICT, each deck once</div></div><div class="wk" aria-label="Last 7 days">${T.week.map(x=>`<div title="${x.date}: ${x.count}"><i style="height:${Math.max(2,Math.round(22*x.count/mx))}px"></i>${dl(x.date)}</div>`).join('')}</div>`;t.hidden=false}).catch(()=>{});
  draw();
  /* finished in another tab (submit) or removed elsewhere: leave instantly */
  addEventListener('storage',e=>{if(e.key&&/^(styleSwipe:submitted:|ds-removed:)/.test(e.key))draw()});
  addEventListener('pageshow',e=>{if(e.persisted)draw()});
 }).catch(e=>{console.warn('deck board',e);el.innerHTML='<p class="none">Decks not available.</p>'});
};
})(window);
