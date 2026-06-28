const nums=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,17,19,20,21,22];
const key='nmt_scada_v6';
let current=null,map,markers=[];

function injectLayoutFix(){
  const st=document.createElement('style');
  st.textContent=`
    @media (min-width:801px){
      .dash{
        direction:ltr;
        display:grid!important;
        grid-template-columns:repeat(auto-fill,minmax(220px,1fr))!important;
        gap:14px!important;
        align-items:stretch;
      }
      .tile{
        direction:rtl;
        min-height:235px!important;
        padding:14px 16px!important;
        border-radius:18px!important;
      }
      .tile h3{
        font-size:24px!important;
        margin:0 0 10px!important;
      }
      .tile b{
        font-size:16px!important;
      }
      .mini{
        font-size:13px!important;
        line-height:1.55!important;
        white-space:nowrap!important;
      }
      .noiseBox{
        margin-top:10px!important;
        padding-top:10px!important;
        font-size:13px!important;
      }
      .noiseBox b{
        font-size:13px!important;
      }
      .noiseBox div{
        grid-template-columns:58px 1fr 1fr!important;
        gap:6px!important;
      }
      .noiseBox span{
        padding:7px 6px!important;
        border-radius:10px!important;
      }
    }
  `;
  document.head.appendChild(st);
}

injectLayoutFix();
today.textContent=new Date().toLocaleDateString('he-IL');
function preset(n){
  if([2,3,4,10].includes(n))return{regMain:'88',heavyMain:'88',regEarly:'91',heavyEarly:'93'};
  if([5,6,7,8,9,11,12].includes(n))return{regMain:'82',heavyMain:'82',regEarly:'85',heavyEarly:'88'};
  return{regMain:'',heavyMain:'',regEarly:'',heavyEarly:''};
}
function base(){return nums.map(n=>({id:'NMT '+n,n,city:'',loc:'',st:'מנותק',date:'',det:'',file:'',lat:null,lng:null,hist:[],...preset(n)}));}
function oldData(){try{return JSON.parse(localStorage.getItem('nmt_scada_v5'))||[]}catch(e){return[]}}
function normalize(d){return d.map(x=>{let p=preset(x.n);return{...p,regMain:x.regMain||x.noiseDay||p.regMain,heavyMain:x.heavyMain||x.noiseEvening||p.heavyMain,regEarly:x.regEarly||'',heavyEarly:x.heavyEarly||x.noiseNight||p.heavyEarly,...x}})}
function D(){try{let d=JSON.parse(localStorage.getItem(key));if(d&&d.length)return normalize(d);let o=oldData();if(o.length){o=normalize(o);localStorage.setItem(key,JSON.stringify(o));return o}return base()}catch(e){return base()}}
function S(d){localStorage.setItem(key,JSON.stringify(d))}
function esc(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function dot(s){return '<span class="dot '+(s==='תקין'?'ok':s==='תקול'?'bad':'')+'"></span>'}
function cls(s){return s==='תקין'?'ok':s==='תקול'?'bad':''}
function sel(a,b){return a===b?'selected':''}
function isOld(x){return x.date&&(Date.now()-new Date(x.date).getTime())/86400000>14}
function thr(v){return v?esc(v):'--'}
function noiseText(x){return '06–05 רגיל '+thr(x.regMain)+' / כבד '+thr(x.heavyMain)+' | 05–06 רגיל '+thr(x.regEarly)+' / כבד '+thr(x.heavyEarly)+' dB'}
function noiseHtml(x){return '<div class="noiseBox"><b>ספי רעש dB</b><div><span>06–05</span><span>רגיל '+thr(x.regMain)+'</span><span>כבד '+thr(x.heavyMain)+'</span></div><div><span>05–06</span><span>רגיל '+thr(x.regEarly)+'</span><span>כבד '+thr(x.heavyEarly)+'</span></div></div>'}
function filtered(){let q=document.getElementById('q').value.toLowerCase(),f=flt.value;return D().filter(x=>(f==='הכל'||x.st===f)&&(x.id+' '+x.city+' '+x.loc+' '+x.det+' '+noiseText(x)).toLowerCase().includes(q))}
function counts(d){ok.textContent=d.filter(x=>x.st==='תקין').length;bad.textContent=d.filter(x=>x.st==='תקול').length;off.textContent=d.filter(x=>x.st==='מנותק').length;old.textContent=d.filter(isOld).length}
function ensureNoiseFields(){
 if(document.getElementById('regMain'))return;
 const wrap=document.createElement('div');
 wrap.className='full noiseEdit';
 wrap.innerHTML='<h3 style="margin:6px 0">ספי רעש dB</h3><div class="noiseEditGrid"><label>06:00–05:00 רגיל<input id="regMain" class="f" inputmode="decimal"></label><label>06:00–05:00 כבד<input id="heavyMain" class="f" inputmode="decimal"></label><label>05:00–06:00 רגיל<input id="regEarly" class="f" inputmode="decimal"></label><label>05:00–06:00 כבד<input id="heavyEarly" class="f" inputmode="decimal"></label></div>';
 document.getElementById('mdet').closest('label').before(wrap);
}
function render(){
 ensureNoiseFields();
 let d=D(),a=filtered();counts(d);
 tiles.innerHTML=a.map(x=>'<div class="tile '+cls(x.st)+'" onclick="openM(\''+x.id+'\')"><h3>'+x.id+'</h3><div>'+dot(x.st)+' <b>'+x.st+'</b></div><div class="mini">📍 '+(esc(x.city)||'לא הוגדר')+'</div><div class="mini">📅 '+(x.date||'אין עדכון')+'</div>'+noiseHtml(x)+'<div class="mini">'+(x.lat?'🗺️ '+Number(x.lat).toFixed(3)+', '+Number(x.lng).toFixed(3):'🗺️ אין קואורדינטות')+'</div></div>').join('');
 rows.innerHTML=a.map(x=>'<tr><td><b>'+x.id+'</b></td><td><input class="f" value="'+esc(x.city)+'" onchange="quick(\''+x.id+'\',\'city\',this.value)"></td><td><input class="f" value="'+esc(x.loc)+'" onchange="quick(\''+x.id+'\',\'loc\',this.value)"></td><td><select class="f" onchange="quick(\''+x.id+'\',\'st\',this.value)"><option '+sel(x.st,'מנותק')+'>מנותק</option><option '+sel(x.st,'תקין')+'>תקין</option><option '+sel(x.st,'תקול')+'>תקול</option></select></td><td><input class="f" type="date" value="'+esc(x.date)+'" onchange="quick(\''+x.id+'\',\'date\',this.value)"></td><td><input class="f" value="'+esc(noiseText(x))+'" readonly></td><td><input class="f" value="'+esc(x.det)+'" onchange="quick(\''+x.id+'\',\'det\',this.value)"></td><td><button onclick="openM(\''+x.id+'\')">פתח</button></td></tr>').join('');
 rep.innerHTML='<p>תקין: '+ok.textContent+'</p><p>תקול: '+bad.textContent+'</p><p>מנותק: '+off.textContent+'</p><p>לא עודכנו: '+old.textContent+'</p>';
 let h=d.flatMap(x=>(x.hist||[]).map(h=>({id:x.id,...h}))).sort((a,b)=>(b.ts||'').localeCompare(a.ts||'')).slice(0,8);
 hist.innerHTML=h.length?h.map(h=>'<div class="hist"><b>'+h.id+' - '+h.st+'</b><br><small>'+esc(h.date)+'</small><div>'+esc(h.det)+'</div></div>').join(''):'אין היסטוריה';
 renderMap();
}
async function quick(id,k,v){let d=D(),x=d.find(i=>i.id===id);x[k]=v;if(k==='city'||(k==='loc'&&!x.city)){x.lat=null;x.lng=null;S(d);render();let p=await geoText(k==='city'?v:(x.city||v));d=D();x=d.find(i=>i.id===id);if(p){x.lat=p.lat;x.lng=p.lng}S(d);render();return}if(k==='st')x.date=x.date||new Date().toISOString().slice(0,10);S(d);render()}
function openM(id){ensureNoiseFields();let x=D().find(i=>i.id===id);current=id;mt.textContent=x.id;mcity.value=x.city||'';mloc.value=x.loc||'';mst.value=x.st;mdate.value=x.date||'';mdet.value=x.det||'';mfile.value=x.file||'';regMain.value=x.regMain||'';heavyMain.value=x.heavyMain||'';regEarly.value=x.regEarly||'';heavyEarly.value=x.heavyEarly||'';mcoords.value=x.lat?Number(x.lat).toFixed(5)+', '+Number(x.lng).toFixed(5):'';mcoords.dataset.lat=x.lat||'';mcoords.dataset.lng=x.lng||'';mhist.innerHTML=(x.hist||[]).slice().reverse().map(h=>'<div class="hist"><b>'+h.st+'</b> '+esc(h.date)+'<div>'+esc(h.det)+'</div></div>').join('')||'<small>אין היסטוריה</small>';modal.classList.add('show')}
function closeM(){modal.classList.remove('show')}
async function saveM(){let d=D(),x=d.find(i=>i.id===current),oldCity=x.city,oldLoc=x.loc;x.city=mcity.value;x.loc=mloc.value;x.st=mst.value;x.date=mdate.value||new Date().toISOString().slice(0,10);x.det=mdet.value;x.file=mfile.value;x.regMain=regMain.value;x.heavyMain=heavyMain.value;x.regEarly=regEarly.value;x.heavyEarly=heavyEarly.value;if(x.city!==oldCity||x.loc!==oldLoc||!x.lat){let p=await geoText(x.city||x.loc);if(p){x.lat=p.lat;x.lng=p.lng}}x.hist=x.hist||[];x.hist.push({ts:new Date().toISOString(),st:x.st,date:x.date,det:x.det});S(d);closeM();render()}
function initMap(){if(map)return;map=L.map('mapBox').setView([31.8,34.9],8);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map)}
function icon(x){let st=x.st==='תקין'?'ok':x.st==='תקול'?'bad':'off';return L.divIcon({className:'',html:'<div class="lbl"><span class="mapNum '+st+'">'+x.n+'</span></div>',iconSize:[22,22],iconAnchor:[11,11]})}
function renderMap(){if(!map)return;markers.forEach(m=>m.remove());markers=[];D().filter(x=>x.lat&&x.lng).forEach(x=>{let m=L.marker([x.lat,x.lng],{icon:icon(x)}).addTo(map);m.on('click',()=>openM(x.id));m.bindPopup('<b>'+x.id+'</b><br>'+x.st+'<br>'+esc(x.city)+'<br>'+esc(noiseText(x))+'<br><button onclick="nav(\''+x.id+'\')">נווט</button>');markers.push(m)});if(markers.length)fitMap()}
function fitMap(){if(!map)return;if(markers.length)map.fitBounds(L.featureGroup(markers).getBounds().pad(.25));else map.setView([31.8,34.9],8)}
async function geoText(t){let q=(t||'').trim();if(!q)return null;if(!/ישראל|israel/i.test(q))q+=' ישראל';try{let r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q));let j=await r.json();return j&&j[0]?{lat:+j[0].lat,lng:+j[0].lon}:null}catch(e){return null}}
async function geocodeAll(){let d=D(),n=0;for(let x of d){if(x.city||x.loc){let p=await geoText(x.city||x.loc);if(p){x.lat=p.lat;x.lng=p.lng;n++}await new Promise(r=>setTimeout(r,900))}}S(d);render();alert(n?'עודכנו '+n+' מיקומים':'לא נמצאו מיקומים')}
async function geoCurrent(){let p=await geoText(mcity.value||mloc.value);if(!p){alert('לא נמצא מיקום');return}mcoords.value=p.lat.toFixed(5)+', '+p.lng.toFixed(5);mcoords.dataset.lat=p.lat;mcoords.dataset.lng=p.lng}
function nav(id){let x=D().find(i=>i.id===id);if(x&&x.lat)open('https://www.google.com/maps/search/?api=1&query='+x.lat+','+x.lng,'_blank')}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.getElementById(b.dataset.v).classList.add('active');if(b.dataset.v==='map')setTimeout(()=>{initMap();map.invalidateSize();renderMap()},100);render()});
q.oninput=render;flt.onchange=render;mcity.onchange=geoCurrent;mloc.onchange=()=>{if(!mcity.value)geoCurrent()};
csv.onclick=()=>{let lines=['מערכת,עיר,מיקום,סטטוס,תאריך,רגיל 06-05,כבד 06-05,רגיל 05-06,כבד 05-06,פירוט,קישור,lat,lng'];D().forEach(x=>lines.push([x.id,x.city,x.loc,x.st,x.date,x.regMain,x.heavyMain,x.regEarly,x.heavyEarly,x.det,x.file,x.lat||'',x.lng||''].map(v=>'"'+String(v||'').replaceAll('"','""')+'"').join(',')));let a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv'}));a.download='nmt.csv';a.click()};
prt.onclick=()=>print();clr.onclick=()=>{if(confirm('לאפס נתונים?')){localStorage.removeItem(key);render()}};
render();