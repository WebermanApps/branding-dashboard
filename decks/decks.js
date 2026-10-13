/* Deck Building view, shared by /decks/ and the main dashboard. Usage: DeckApp(el,{base:'<url of decks.json dir>',self:'<page url>'}) */
(function(w){
const esc=x=>String(x==null?'':x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SS='https://webermanapps.github.io/style-swipe/',BANKS=SS+'banks/index.json';
const sv=(p,sw=2.2)=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={cards:sv('<rect x="4" y="6" width="12" height="15" rx="2"/><path d="M8 3h10a2 2 0 0 1 2 2v13"/>'),check:sv('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',2.4),inbox:sv('<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>'),mix:sv('<path d="M4 7h4l8 10h4M4 17h4l2.5-3M14 10l2-3h4M17 4l3 3-3 3M17 14l3 3-3 3"/>'),play:sv('<path d="M7 5l12 7-12 7z"/>',2.4)};
const CSS=`.dk *{box-sizing:border-box}.dk{font-family:Hind,system-ui,sans-serif;color:#0a0a0a}
.dk h2{font:700 28px/1.1 Khand,sans-serif;margin:8px 0 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.dk h3{font:700 22px/1.1 Khand,sans-serif;margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dk .bub{font:600 13px Hind,sans-serif;background:#f5f5f5;border-radius:999px;padding:2px 10px}.dk .bank{font:700 13px Khand,sans-serif;letter-spacing:.06em;text-transform:uppercase;border:1.5px solid #05668D;color:#05668D;padding:1px 8px}
.dk .cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:14px}
.dk .cat{border:1px solid #e5e5e5;padding:14px;background:#fff;min-width:0}
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
@media(max-width:480px){.dk .cats{grid-template-columns:1fr}}`;
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
  const wc=d=>`<a class="card mw-hover" style="--c:#D4A017" href="${href(d)}">${IC.cards}<div><div class="nm">${esc(d.name)}</div><div class="sub">${esc(d.about)}</div><div class="meta" data-size="${esc(d.id)}">${d.size?d.size+" pairs":""}</div></div></a>`;
  const fc=d=>`<a class="card mw-hover" style="--c:#0B6E4F" href="${href(d)}">${IC.check}<div><div class="nm">${esc(d.name)}</div><div class="meta">Results In · ${d.answered!=null?`${d.answered}/${d.total||d.size||"?"} answered`:'count not recorded'} · <span data-size="${esc(d.id)}">${d.size?d.size+' pairs':''}</span>${d.via==='submit'?` · Sent with Submit ${date(d.submitted)}`:''}</div></div></a>`;
  const mix=`<div class="mix"><h3>${IC.mix}Mixed Deck</h3><div class="sub" style="margin-top:4px">Pick categories and a size, then start one deck that mixes them.</div>
   <div class="boxes">${C.map(c=>`<label><input type="checkbox" value="${c.slug}" checked>${esc(c.name)}</label>`).join('')}</div>
   <div class="row"><div class="size" role="radiogroup" aria-label="Deck size"><label><input type="radio" name="mixn" value="25" checked>25 Pairs</label><label><input type="radio" name="mixn" value="50">50 Pairs</label></div>
   <button type="button" class="tl" data-all="1">Select All</button><button type="button" class="tl" data-all="0">Clear</button>
   <a class="start mw-hover" href="#">${IC.play}Start</a></div></div>`;
  const cats=C.map(c=>{const w=D.filter(d=>d.cat===c.slug&&d.status==='wait').sort((a,b)=>a.order-b.order),f=D.filter(d=>d.cat===c.slug&&d.status==='done').sort((a,b)=>a.order-b.order);
   return `<section class="cat" data-cat="${c.slug}"><h3>${esc(c.name)} <span class="bub">${w.length} Waiting</span><span class="bank">Bank: ${bankOf(B,c.slug)}/100</span></h3>
   <div class="k">Waiting On You</div>${w.map(wc).join('')||'<div class="none">Nothing waiting.</div>'}
   <div class="k">Finished</div>${f.map(fc).join('')||'<div class="none">None yet.</div>'}</section>`}).join('');
  const R=(RQ.requests||[]).filter(r=>r.status!=='Done');
  const req=R.map(r=>`<${r.deck?`a href="${link(r.deck)}"`:'div'} class="card mw-hover" style="--c:#05668D">${IC.inbox}<div><div class="nm">${esc(r.title)}</div><div class="sub">${esc(r.detail)}</div><div class="meta">From ${esc(r.from)} · ${esc(r.status)}</div></div></${r.deck?'a':'div'}>`).join('')||'<div class="none">No open requests.</div>';
  el.innerHTML=`<h2>Deck Building <span class="bub">${W.length} Waiting</span></h2>${mix}<div class="cats">${cats}</div><h2 style="margin-top:22px">Requests From Agents <span class="bub">${R.length}</span></h2><div class="cats"><div>${req}</div></div>`;
  const st=el.querySelector('.start'),upd=()=>{const s=[...el.querySelectorAll('.boxes input:checked')].map(i=>i.value),n=(el.querySelector('input[name=mixn]:checked')||{}).value||25;
   st.href=s.length?SS+'?mix='+s.join(',')+'&n='+n+'&from='+encodeURIComponent(self):'#';st.setAttribute('aria-disabled',s.length?'false':'true')};
  el.querySelector('.mix').addEventListener('change',upd);el.querySelectorAll('.tl').forEach(b=>b.onclick=()=>{el.querySelectorAll('.boxes input').forEach(i=>i.checked=b.dataset.all==='1');upd()});upd();
  /* live sizes: one sizes.json (deck_id -> pair count); decks.json size stays as fallback; external url decks keep their size */
  fetch(SS+'decks/sizes.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(S=>{if(!S)return;D.forEach(d=>{if(d.url)return;const n=+S[d.id]||0;if(!n)return;d.size=n;el.querySelectorAll('[data-size="'+d.id+'"]').forEach(e=>e.textContent=n+' pairs')})}).catch(()=>{});
 }).catch(()=>{el.innerHTML='<p class="none">Decks not available.</p>'});
};
})(window);
