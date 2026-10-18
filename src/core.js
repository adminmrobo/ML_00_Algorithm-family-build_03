/* ══ 공용 도구 ══════════════════════════════════════════════════ */
var $=function(id){return document.getElementById(id)};
var REDUCE=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var FF='"IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif';
var PIXF='"Cinzel",Georgia,serif';
function font(s,w){return (w||400)+' '+s+'px '+FF}
function cols(){var cs=getComputedStyle(document.documentElement),o={};
  ['bg','panel','panel2','rule','text','muted','soft','eye','gfp','stain','amber','info','orange','c-doc','c-asst','c-fly','c-robo'].forEach(function(k){o[k.replace('c-','c_')]=cs.getPropertyValue('--'+k).trim();});return o;}
function rgba(c,a){if(!c)return 'rgba(0,0,0,'+a+')';if(c[0]==='#'){var h=c.length===4?c.replace(/#(.)(.)(.)/,'#$1$1$2$2$3$3'):c;return 'rgba('+parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')';}return c;}
function fx(x,d){d=d==null?2:d;var m=Math.pow(10,d),r=Math.round(x*m)/m;if(Math.abs(r)<0.5/m)r=0;return (r<0?'−':'')+Math.abs(r).toFixed(d);}
function pct(x,d){d=d==null?1:d;return (x*100).toFixed(d)+'%'}
function fit(c,h){var dpr=window.devicePixelRatio||1,w=c.clientWidth||c.parentElement.clientWidth||600;
  if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.height=h+'px';}
  var x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return w;}
function rr(ctx,x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);}
function circ(ctx,x,y,r,fill,stroke,lw){ctx.beginPath();ctx.arc(x,y,r,0,7);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||1.5;ctx.stroke();}}
function glow(ctx,x,y,r,c,a){var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(1,rgba(c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function stamp(ctx,W,txt){ctx.save();ctx.font=font(11,700);var tw=ctx.measureText(txt).width+16,x=W-tw-8,y=8;var C=cols();
  ctx.fillStyle=rgba(C.amber,.14);ctx.strokeStyle=rgba(C.amber,.7);ctx.lineWidth=1;rr(ctx,x,y,tw,20,10);ctx.fill();ctx.stroke();
  ctx.fillStyle=C.amber;ctx.textAlign='left';ctx.fillText(txt,x+8,y+14);ctx.restore();}
var REDRAW=[];function onRedraw(fn){REDRAW.push(fn);}
function redrawAll(){REDRAW.forEach(function(f){try{f();}catch(e){}});}
if(window.matchMedia){var mq=window.matchMedia('(prefers-color-scheme: dark)');(mq.addEventListener?mq.addEventListener('change',redrawAll):mq.addListener&&mq.addListener(redrawAll));}
new MutationObserver(redrawAll).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
var rzT;window.addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(redrawAll,90);});
var TICK=[],VIS=new Set(),IO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?VIS.add(e.target):VIS.delete(e.target);});},{rootMargin:'60px'}):null,lastTs=0,ticking=false;
function onTick(el,fn){TICK.push({el:el,fn:fn});if(IO)IO.observe(el);else VIS.add(el);if(!ticking){ticking=true;requestAnimationFrame(loop);}}
function loop(ts){var dt=lastTs?Math.min(0.05,(ts-lastTs)/1000):0.016;lastTs=ts;TICK.forEach(function(m){if(VIS.has(m.el))m.fn(dt);});requestAnimationFrame(loop);}
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
function toast(msg){var t=$('toast');if(!t)return;t.textContent=msg;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('on')},1800);}
function seg(sel,fn){var bs=document.querySelectorAll(sel);bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});fn(b.getAttribute('data-v'),b);});});}
/* 난수: 시드 고정 */
function RNG(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function gauss(r){var u=0;while(!u)u=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*r())}

/* ══ 등장인물 그림 ══════════════════════════════════════════════════ */
var CAST={doc:'대부 박사',asst:'참모 조수',fly:'초파리 연구원',robo:'Money-Robo'};
var DEFAULT={doc:'doc_front',asst:'asst_smile',fly:'fly_clip',robo:'robo_smile'};
function sprite(who,mood){var k=who+'_'+mood;return SPR[k]||SPR[DEFAULT[who]]||'';}
function hydrate(root){root=root||document;
  root.querySelectorAll('img[data-who]').forEach(function(i){i.src=sprite(i.getAttribute('data-who'),i.getAttribute('data-mood'));});
  root.querySelectorAll('img[data-scene]').forEach(function(i){i.src=SPR[i.getAttribute('data-scene')]||'';});}
function say(who,mood,txt,extra){return '<div class="say '+who+'"'+(extra||'')+'><img src="'+sprite(who,mood)+'" alt="" aria-hidden="true"><div class="bub"><span class="who">'+CAST[who]+'</span>'+txt+'</div></div>';}

/* ══ NPC 픽셀 그림 (직접 그림) ═══════════════════════════════════════ */
var NPC=(function(){
var PAL={K:'#1d1612',k:'#3a2a20',B:'#6b4a2f',b:'#a8784a',c:'#d9b07a',W:'#f4f2f8',w:'#c9c6d8',Y:'#f1b646',y:'#b07a1e',R:'#d8452f',G:'#5ee39c',U:'#82b8ff',u:'#3d5f99',P:'#d672d6',D:'#2b2d42',d:'#4a4d68',O:'#1a1420',E:'#eceaf3',S:'#9d9bb8'};
var MAP={
ant:['....K..K....','.....KK.....','....kkkk....','...kEkkEk...','...kkkkkk...','.K..kkkk..K.','..K.kkkk.K..','...KkkkkK...','..K.kkkk.K..','.K..kkkk..K.','...kkkkkk...','....kkkk....'],
card:['WWWWWWWW','WSSSSSSW','WWWWWWWW','WSSSSWWW','WWWWWWWW'],
owl:['...b......b...','..bbb....bbb..','..bBBBBBBBBb..','.bBBBBBBBBBBb.','.BWWWBBBBWWWB.','.WOOOWBBWOOOW.','.WOKOWYYWOKOW.','.BWWWBYYBWWWB.','.BBccccccccBB.','BBcccRRRRcccBB','BBccRWWWWRccBB','BBccRWRRWRccBB','BBccRWWWWRccBB','.BBcRRRRRRcBB.','..BBccccccBB..','...YY....YY...'],
sweep_top:['....dddddd....','..ddDDDDDDdd..','.dDDDDDDDDDDd.','dDDDDGGDDDDDDd','dDDDDGGDDDDDDd','dYYYYYYYYYYYYd','dDDDDDDDDDDDDd','.dDDDDDDDDDDd.','..ddDDDDDDdd..','....dddddd....'],
sweep_side:['...GG.........','dddddddddddddd','dDDDDDDDDDDDDd','dYYYYYYYYYYYYd','dDDDDDDDDDDDDd','.SS........SS.'],
g1:['..UUUU..','.UUUUUU.','..cccc..','..cccc..','.UUUUUU.','UUUUUUUU','UUUUUUUU','UUUUUUUU','.uu..uu.','.uu..uu.','.KK..KK.'],
g2:['..KKKK..','..cccc..','.KcKKcK.','..cccc..','.PPPPPP.','PPPPPPPP','PPPPPPPP','PPPPPPPP','.dd..dd.','.dd..dd.','.KK..KK.'],
g3:['........','..kkkk..','..cccc..','..cccc..','.GGGGGG.','GGGGGGGG','GGGGGGYY','GGGGGGYY','.dd..dd.','.dd..dd.','.KK..KK.'],
crest_sup:['KKKKKKKKKKKK','KUUUUUUUUUUK','KUUUEEEEUUUK','KUUEUUUUEUUK','KUEUUEEUUEUK','KUEUEKKEUEUK','KUEUEKKEUEUK','KUEUUEEUUEUK','KUUEUUUUEUUK','KUUUEEEEUUUK','.KUUUUUUUUK.','..KUUUUUUK..','...KUUUUK...','....KKKK....'],
crest_uns:['KKKKKKKKKKKK','KUUUUUUUUUUK','KUUUUEEUUUUK','KUUUUEEUUUUK','KUUUUUUUUUUK','KUUUUUUUUUUK','KUEEUUUUEEUK','KUEEUUUUEEUK','KUUUUUUUUUUK','KUUUUUUUUUUK','.KUUUUUUUUK.','..KUUUUUUK..','...KUUUUK...','....KKKK....'],
crest_rl:['KKKKKKKKKKKK','KUUUUUUUUUUK','KUUUEEEEUUUK','KUUEEEKEEUUK','KUEEEKKKEEUK','KUEEEKEEEEUK','KUEEEKKKEEUK','KUEEEEEKEEUK','KUUEEKKKEUUK','KUUUEEKEUUUK','.KUUUUUUUUK.','..KUUUUUUK..','...KUUUUK...','....KKKK....'],
crest_ens:['KKKKKKKKKKKK','KUUUUUUUUUUK','KUUEUUUUEUUK','KUEEEUUEEEUK','KEEEEEEEEEEK','KUUEUUUUEUUK','KUUEEUUEEUUK','KUUUEEEEUUUK','KUUUUEEUUUUK','KUUUEEEEUUUK','.KUUEUUEUUK.','..KUUUUUUK..','...KUUUUK...','....KKKK....'],
scare:['....yyyy....','...yYYYYy...','.yyYYYYYYyy.','....cccc....','...cKccKc...','...cccccc...','....cKKc....','bbbbBBBBbbbb','...BWWWWB...','...BWSSWB...','...BWWWWB...','...BBBBBB...','....bbbb....','.....bb.....','.....bb.....','....bbbb....'],
mouse:['.S........','SwS.......','.SSSSSS...','SSSSSSSS..','KSSSSSSSS.','.SSSSSSSSS','..d..d..dS','.........S'],
tree:['...GGG...','..GGGGG..','.GGKGKGG.','GGGGGGGGG','GGGGGGGGG','.GGGGGGG.','..GGGGG..','....B....','...BBB...','....B....','...B.B...','..BB.BB..'],
token:['...KKKK...','..KccccK..','..KcKKcK..','..KccccK..','...KKKK...','..KUUUUK..','.KUUUUUUK.','.KUEEEEUK.','.KUUUUUUK.','KUUUUUUUUK','KWWWWWWWWK','KKKKKKKKKK'],
sweep2:['..G.G.G.......','...GGG........','....dddddd....','..ddDDDDDDdd..','.dDDDDDDDDDDd.','dDDDDGGDDDDDDd','dDDDDGGDDDDDDd','dYYYYYYYYYYYYd','dDDDDDDDDDDDDd','.dDDDDDDDDDDd.','..ddDDDDDDdd..','....dddddd....'],
sweep3:['.........RR...','.........RRR..','.........K....','....ddddKd....','..ddDDDDKDdd..','.dDDDDDDDDDDd.','dDDDDGGDDDDDDd','dDDDDGGDDDDDDd','dYYYYYYYYYYYYd','dDDDDDDDDDDDDd','.dDDDDDDDDDDd.','..ddDDDDDDdd..','....dddddd....'],
qmark:['.YYY.','Y...Y','...Y.','..Y..','.....','..Y..']};
var cache={};
function draw(kind,scale,col){var m=MAP[kind];if(!m)return null;var k=kind+scale+(col||'');if(cache[k])return cache[k];var h=m.length,w=m[0].length,c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;var x=c.getContext('2d');
  for(var j=0;j<h;j++)for(var i=0;i<w;i++){var ch=m[j][i];if(ch==='.')continue;x.fillStyle=(col&&'UPG'.indexOf(ch)>=0)?col:PAL[ch];x.fillRect(i*scale,j*scale,scale,scale);}
  cache[k]=c;return c;}
function el(kind,scale,label,col){var src=draw(kind,scale,col);var c=document.createElement('canvas');c.className='npc';c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);
  if(label){c.setAttribute('role','img');c.setAttribute('aria-label',label);}else c.setAttribute('aria-hidden','true');return c;}
function crest(fam,scale,label){var col={sup:'#6f8fb5',uns:'#7aa063',rl:'#c99a3e',ens:'#a65d7d'}[fam];var src=draw('crest_'+fam,scale,col);var c=document.createElement('canvas');c.className='crest';c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);
  if(label){c.setAttribute('role','img');c.setAttribute('aria-label',label);}else c.setAttribute('aria-hidden','true');return c;}
return {draw:draw,el:el,crest:crest,MAP:MAP};})();
function npcLine(host,kinds,scale,text){var d=document.createElement('div');d.className='npcline';kinds.forEach(function(k){d.appendChild(NPC.el(k,scale||3));});var s=document.createElement('span');s.innerHTML=text;d.appendChild(s);host.appendChild(d);}

/* ══ 시리즈 목록 · 미니맵 · 시즌 점수판 ═════════════════════════════ */
/* plan: 1부 기획안 1-4절 대결 계획표. f 초파리 승 · r Money-Robo 승 · d 무승부 · x Money-Robo 실격(초파리 승) */
var EPISODES=[
 {n:'4-1',f:'4-1_ml_family_map.html',t:'가계도',plan:'d',ready:1},
 {n:'4-2',f:'4-2_supervised.html',t:'지도 가문',plan:'f',ready:1},
 {n:'4-3',f:'4-3_unsupervised.html',t:'비지도 가문',plan:'r',ready:1},
 {n:'4-4',f:'4-4_reinforcement.html',t:'강화 가문',plan:'f',ready:1},
 {n:'4-5',f:'4-5_ensemble.html',t:'앙상블 연합',plan:'r',ready:1},
 {n:'4-6',f:'4-6_regression_seven.html',t:'회귀파 일곱',plan:'r',ready:1},
 {n:'4-7',f:'4-7_classification_eight.html',t:'분류파 여덟',plan:'r',ready:1},
 {n:'4-8',f:'4-8_unsupervised_nine.html',t:'비지도 아홉',plan:'f',ready:1},
 {n:'4-9',f:'4-9_rl_three.html',t:'강화 삼대',plan:'d',ready:1},
 {n:'4-10',f:'4-10_ensemble_lineage.html',t:'앙상블 계보',plan:'r',ready:1},
 {n:'4-11',f:'4-11_fair_rules.html',t:'가문의 규칙',plan:'x',ready:1},
 {n:'4-12',f:'4-12_supervised_metrics.html',t:'지도 가문의 장부',plan:'f',ready:1},
 {n:'4-13',f:'4-13_unsupervised_metrics.html',t:'비지도 가문의 장부',plan:'r',ready:1},
 {n:'4-14',f:'4-14_rl_metrics.html',t:'강화 가문의 장부',plan:'f',ready:1},
 {n:'4-15',f:'4-15_final_and_choice.html',t:'마지막 담판',plan:'d',ready:1}];
var PARTS=['1부 · 가계도','2부 · 명부','3부 · 회합'];
var COLS=[['전체','회귀'],['지도','분류'],['비지도',''],['강화',''],['앙상블','']];
function epIdx(n){for(var i=0;i<EPISODES.length;i++)if(EPISODES[i].n===n)return i;return -1;}
function renderSeries(){var el=$('series');if(!el)return;var cur=epIdx(EP.n);
  el.innerHTML='<a class="home" href="4-0_index.html">⌂ 가계도 목차</a>'+EPISODES.map(function(e,i){var lab=e.n+' '+e.t;var sep=(i===5||i===10)?'<span class="sep">|</span>':'';
    if(i===cur)return sep+'<a class="cur" href="#top" aria-current="page">'+lab+'</a>';
    return sep+(e.ready?'<a href="'+e.f+'">'+lab+'</a>':'<span class="s" title="준비 중">'+lab+'</span>');}).join('');}
function winIcon(w){if(w==='f'||w==='x')return '<img class="wn" src="'+sprite('fly','arms')+'" alt="초파리 쪽 구역">';if(w==='r')return '<img class="wn" src="'+sprite('robo','happy')+'" alt="Money-Robo 쪽 구역">';if(w==='d')return '<span class="wd" title="무승부">=</span>';return '';}
function renderMinimap(){var el=$('minimap');if(!el)return;var cur=epIdx(EP.n),me=EPISODES[cur];
  var head='<div class="corner"></div>'+['① 대부 / 회귀파','② 지도 가문 / 분류파','③ 비지도 가문','④ 강화 가문','⑤ 앙상블 연합 / 마지막 담판'].map(function(h){return '<div class="ch">'+h+'</div>';}).join('');
  var grid='';for(var p=0;p<3;p++){grid+='<div class="rh">'+PARTS[p]+'</div>';
    for(var c=0;c<5;c++){var i=p*5+c,e=EPISODES[i],cls='cell'+(i===cur?' cur':'')+(i!==cur&&(i%5)===(cur%5)?' col':'')+(e.ready?'':' soon');
      var w=i<cur?e.plan:(i===cur?(SCORE.mine||''):'');
      var inner='<b>'+e.n+'</b><span class="t">'+e.t+'</span>'+winIcon(w);
      grid+=(e.ready&&i!==cur)?'<a class="'+cls+'" href="'+e.f+'">'+inner+'</a>':'<div class="'+cls+'"'+(i===cur?' aria-current="page"':'')+'>'+inner+'</div>';}}
  el.innerHTML='<div class="mm">'+head+grid+'</div><div class="mmkey"><span><img src="'+sprite('fly','arms')+'" alt="">초파리 쪽 구역</span><span><img src="'+sprite('robo','happy')+'" alt="">Money-Robo 쪽 구역</span><span><b>=</b> 나눠 가진 구역</span><span>흐린 칸: 아직 열리지 않은 구역</span><span>지난 구역의 주인은 시즌 계획표대로 표시하고, 이 구역은 장부를 열면 켜진다</span></div>';}
var SCORE={mine:null};
function prevTotals(){var cur=epIdx(EP.n),f=0,r=0,d=0;for(var i=0;i<cur;i++){var w=EPISODES[i].plan;if(w==='f'||w==='x')f++;else if(w==='r')r++;else d++;}return {f:f,r:r,d:d};}
function updateScore(){var p=prevTotals(),f=p.f,r=p.r,d=p.d,w=SCORE.mine;if(w==='f'||w==='x')f++;else if(w==='r')r++;else if(w==='d')d++;
  var s=$('score');if(!s)return;$('sF').textContent=f;$('sR').textContent=r;$('sD').textContent=d;
  $('sP').textContent=w?EP.n+'까지':(EPISODES[epIdx(EP.n)-1]?EPISODES[epIdx(EP.n)-1].n+'까지 · 이 편 대기':'시즌 개막');
  s.classList.remove('bump');void s.offsetWidth;if(!REDUCE&&w)s.classList.add('bump');renderMinimap();}

/* ══ 대결 ═════════════════════════════════════════════════════════ */
/* 표정 규칙: 캐릭터_이미지_설정.md 5-1절 */
function Duel(id,o){var el=$(id);
  el.innerHTML='<div class="duel-head"><span class="lab">담판 · '+EP.n+'</span><h3>'+o.title+'</h3></div><p class="duel-q">'+o.q+'</p>'+
   '<div class="vs"><div class="side fly"><img data-who="fly" data-mood="point" alt="" aria-hidden="true"><span class="nm">초파리 연구원</span><span class="pick">'+o.fly[0]+'</span><q>'+o.fly[1]+'</q><span class="badge" hidden></span></div><div class="mid">VS</div>'+
   '<div class="side robo"><img data-who="robo" data-mood="'+(o.roboMood||'coin')+'" alt="" aria-hidden="true"><span class="nm">Money-Robo</span><span class="pick">'+o.robo[0]+'</span><q>'+o.robo[1]+'</q><span class="badge" hidden></span></div></div>'+
   '<div class="duel-go"><button class="btn go">장부 열기 ▶</button><span class="muted" style="font-size:13.5px">누가 이길지 먼저 맞혀 보세요.</span><div class="prog" hidden><i></i></div></div><div class="result" hidden aria-live="polite"></div>';
  hydrate(el);
  var btn=el.querySelector('.go'),prog=el.querySelector('.prog'),bar=prog.querySelector('i'),res=el.querySelector('.result'),done=false;
  function setP(p){bar.style.width=Math.round(p*100)+'%';}
  async function open(){if(done)return;done=true;btn.disabled=true;btn.textContent='계산 중…';prog.hidden=false;await wait(30);
    var out=await o.run(setP);prog.hidden=true;btn.textContent='장부 열림';btn.parentNode.querySelector('.muted').textContent='';
    var w=out.winner;
    res.innerHTML='<div class="rbox"></div>'+say('asst',w==='x'?'shock':'ledger',out.measure,' style="margin-top:12px"')+
      '<div class="verdict"><img src="'+sprite('doc',w==='d'?'scale':'verdict')+'" alt="" aria-hidden="true"><div class="bub"><span class="who">대부 · 판정</span>'+out.verdict+'<span class="key">'+out.key+'</span></div></div>'+
      (o.alts?'<div class="alt"><span class="lab">조건 바꾸기</span>'+o.alts.map(function(a,i){return '<button class="btn" data-alt="'+i+'" aria-pressed="false">'+a.label+'</button>';}).join('')+'</div><div class="altout"></div>':'');
    res.hidden=false;out.render(res.querySelector('.rbox'));
    var fs=el.querySelector('.side.fly'),rs=el.querySelector('.side.robo'),fi=fs.querySelector('img'),ri=rs.querySelector('img'),fb=fs.querySelector('.badge'),rb=rs.querySelector('.badge');fb.hidden=rb.hidden=false;
    if(w==='f'||w==='x'){fs.classList.add('win');fb.textContent='WIN';rb.innerHTML=w==='x'?'<span class="dq">실격</span>':'LOSE';fi.src=sprite('fly','arms');ri.src=sprite('robo',w==='x'?'blush':'sigh');}
    else if(w==='r'){rs.classList.add('win');rb.textContent='WIN';fb.textContent='LOSE';ri.src=sprite('robo','happy');fi.src=sprite('fly',out.big?'cry':'coffee');}
    else{fb.textContent=rb.textContent='DRAW';fi.src=sprite('fly','coffee');ri.src=sprite('robo','meh');}
    SCORE.mine=w;updateScore();
    if(o.alts)res.querySelector('.alt').addEventListener('click',async function(e){var b=e.target.closest('[data-alt]');if(!b)return;var a=o.alts[+b.getAttribute('data-alt')],box=res.querySelector('.altout');
      res.querySelectorAll('[data-alt]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});box.innerHTML='<p class="muted">계산 중…</p>';await wait(20);await a.run(box);});}
  btn.addEventListener('click',open);el._open=open;}
function statGrid(items){return '<div class="stat">'+items.map(function(s){return '<div class="'+(s[2]||'')+'"><b>'+s[0]+'</b><span>'+s[1]+'</span></div>';}).join('')+'</div>';}

/* ══ 확인 문제 ════════════════════════════════════════════════════ */
function renderQuiz(){document.querySelectorAll('[data-quiz]').forEach(function(box){var qs=QUIZ[box.getAttribute('data-quiz')];if(!qs)return;
  box.innerHTML=qs.map(function(q,i){return '<div class="qz"><div class="q">Q'+(i+1)+'. '+q.q+'</div><div class="opts">'+q.o.map(function(o,k){return '<button class="o" data-k="'+k+'">'+o[0]+'<span class="why" hidden><b>'+(o[1]?'정답.':'오답.')+'</b>'+o[2]+'</span></button>';}).join('')+'</div></div>';}).join('');
  box.addEventListener('click',function(e){var b=e.target.closest('button.o');if(!b)return;var qz=b.closest('.qz');
    qz.querySelectorAll('button.o').forEach(function(x){var good=x.querySelector('.why b').textContent==='정답.';x.classList.toggle('ok',good);x.classList.toggle('no',!good&&x===b);x.querySelector('.why').hidden=false;});});});}

/* ══ 복사·내려받기 ════════════════════════════════════════════════ */
function copyText(txt,msg){function fb(){var ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(msg||'복사했습니다');}catch(err){toast('직접 선택해 복사해 주세요');}ta.remove();}
  try{navigator.clipboard.writeText(txt).then(function(){toast(msg||'복사했습니다')},fb);}catch(err){fb();}}
function download(name,txt,mime){try{var bl=new Blob([txt],{type:mime||'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},400);toast(name+' 저장');}catch(err){toast('저장하지 못했습니다. 복사를 써 주세요');}}

/* ══ 공통 A: Colab 코드 ════════════════════════════════════════════ */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
var KW=/\b(import|from|as|def|return|for|in|if|else|elif|lambda|with|while|True|False|None|and|or|not|print|range)\b/g;
function hl(code){return code.split('\n').map(function(line){var out='',i=0,q=null,start=0;
  for(;i<line.length;i++){var ch=line[i];
    if(q){if(ch==='\\'){i++;continue;}if(ch===q){out+='<span class="s">'+esc(line.slice(start,i+1))+'</span>';q=null;start=i+1;}continue;}
    if(ch==='"'||ch==="'"){out+=esc(line.slice(start,i)).replace(KW,'<span class="k">$1</span>');q=ch;start=i;continue;}
    if(ch==='#'){out+=esc(line.slice(start,i)).replace(KW,'<span class="k">$1</span>')+'<span class="c">'+esc(line.slice(i))+'</span>';start=line.length;break;}}
  if(start<line.length)out+=q?'<span class="s">'+esc(line.slice(start))+'</span>':esc(line.slice(start)).replace(KW,'<span class="k">$1</span>');
  return out;}).join('\n');}
function notebook(c){var cells=[{cell_type:'markdown',metadata:{},source:['# '+c.title+'\n','\n','알고리즘 패밀리 '+EP.n+' · 글 안상선. 위에서부터 차례로 실행한다(Shift + Enter).']}];
  var chunks=[],cur=[];c.text.split('\n').forEach(function(l){if(/^# -{6,}/.test(l)&&cur.length){chunks.push(cur);cur=[];}cur.push(l);});if(cur.length)chunks.push(cur);
  chunks.forEach(function(ch){while(ch.length&&ch[ch.length-1].trim()==='')ch.pop();cells.push({cell_type:'code',execution_count:null,metadata:{},outputs:[],source:ch.map(function(l,i){return l+(i<ch.length-1?'\n':'')})});});
  return JSON.stringify({cells:cells,metadata:{kernelspec:{display_name:'Python 3',language:'python',name:'python3'},language_info:{name:'python'}},nbformat:4,nbformat_minor:5},null,1);}
function renderCode(){var box=$('codebox');if(!box||!window.CODE)return;var c=CODE,src=$('src-code').textContent.replace(/^\n/,'');c.text=src;
  box.innerHTML='<div class="codepanel"><div class="codehead"><div><b>'+c.title+'</b><span>'+c.sub+'</span></div><div class="codebtns"><button class="btn" data-a="copy">복사</button><button class="btn" data-a="py">.py 저장</button><button class="btn" data-a="nb">노트북(.ipynb) 저장</button></div></div>'+
   '<p style="margin:10px 0 0;font-size:15px">'+c.desc+'</p><pre class="code" tabindex="0"><code>'+hl(src)+'</code></pre>'+
   '<figure class="runshot"><pre>'+esc(c.out||CODE_OUT)+'</pre><figcaption>'+c.cap+'</figcaption></figure></div>';
  box.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a'),name=EP.n+'_'+c.file;
    if(a==='copy')copyText(src,'코드를 복사했습니다');else if(a==='py')download(name+'.py',src,'text/x-python');else download(name+'.ipynb',notebook(c),'application/x-ipynb+json');});}

/* ══ 공통 B: 프롬프트 ══════════════════════════════════════════════ */
function renderPrompts(){var el=$('prompts');if(!el)return;
  el.innerHTML=PROMPTS.map(function(o,i){return '<article class="pcard"><h4>'+o.t+'</h4><span class="muted" style="font-size:13.5px">'+o.use+'</span><pre>'+esc(o.p)+'</pre><div class="bts"><button class="btn" data-c="'+i+'">복사</button><button class="btn" data-cc="'+i+'">프롬프트 + 코드 복사</button></div></article>';}).join('');
  el.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var c=b.getAttribute('data-c'),cc=b.getAttribute('data-cc');
    if(c!=null)copyText(PROMPTS[+c].p);if(cc!=null)copyText(PROMPTS[+cc].p+'\n\n```python\n'+$('src-code').textContent.replace(/^\n/,'')+'\n```','프롬프트와 코드를 복사했습니다');});}

/* ══ 공통 C: 용어 + 말풍선 ═════════════════════════════════════════ */
function renderGloss(){if(!$('glossary'))return;
  $('glossary').innerHTML='<thead><tr><th>용어</th><th>묶음</th><th>뜻</th></tr></thead><tbody>'+GL.map(function(g){return '<tr><td>'+g[1]+'</td><td style="white-space:nowrap">'+g[0]+'</td><td>'+g[2]+'</td></tr>';}).join('')+'</tbody>';
  var MAP={};GL.forEach(function(g){MAP[g[1]]=g;});var terms=Object.keys(MAP).sort(function(a,b){return b.length-a.length});
  var RX=new RegExp('('+terms.map(function(t){return t.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}).join('|')+')');
  document.querySelectorAll('section.part:not(.common) p, .lede, .pair p, .card li').forEach(function(p){if(p.closest('.duel,.quiz,.say,.verdict'))return;var used={},w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT,null),list=[],n;while((n=w.nextNode()))if(RX.test(n.nodeValue)&&!n.parentElement.closest('a,b,.str,.jt,button'))list.push(n);
    list.forEach(function(t){var parts=t.nodeValue.split(RX),frag=document.createDocumentFragment(),ch=false;parts.forEach(function(s,i){if(i%2&&!used[s]){used[s]=1;ch=true;var sp=document.createElement('span');sp.className='jt';sp.tabIndex=0;sp.setAttribute('data-k',s);sp.textContent=s;frag.appendChild(sp);}else if(s)frag.appendChild(document.createTextNode(s));});if(ch)t.parentNode.replaceChild(frag,t);});});
  var tip=document.createElement('div');tip.id='tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);var cur=null;
  function show(el){var g=MAP[el.getAttribute('data-k')];if(!g)return;cur=el;tip.innerHTML='<b>'+g[1]+'</b><small>'+g[0]+'</small>'+g[2];tip.classList.add('on');var r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight,x=clamp(r.left+r.width/2-tw/2,10,window.innerWidth-tw-10),y=r.top-th-10;if(y<70)y=r.bottom+10;tip.style.left=x+'px';tip.style.top=y+'px';}
  function hide(){tip.classList.remove('on');cur=null;}
  document.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('.jt');if(el)show(el);else if(cur)hide();});
  document.addEventListener('focusin',function(e){var el=e.target.closest&&e.target.closest('.jt');if(el)show(el);});
  document.addEventListener('focusout',function(e){if(e.target.closest&&e.target.closest('.jt'))hide();});
  document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('.jt');if(el){cur===el?hide():show(el);}});
  window.addEventListener('scroll',function(){if(cur)hide();},{passive:true});document.addEventListener('keydown',function(e){if(e.key==='Escape')hide();});}

/* ══ 공통 D·E·F: 비유 · 레퍼런스 · 교육자 TIP ══════════════════════ */
var STRN={3:['직접','s3'],2:['부분','s2'],1:['없음','s1']};
function renderAppendix(){
  if($('analogy'))$('analogy').innerHTML='<thead><tr><th>개념</th><th>일상 비유</th><th>초파리·뇌 비유</th><th>비유가 틀리는 지점</th></tr></thead><tbody>'+ANALOGY.map(function(a){var s=STRN[a[2]];return '<tr><td><b style="color:var(--text)">'+a[0]+'</b></td><td>'+a[1]+'</td><td><span class="str '+s[1]+'">'+s[0]+'</span> '+(a[3]||'')+'</td><td>'+a[4]+'</td></tr>';}).join('')+'</tbody>';
  if($('refs'))$('refs').innerHTML=REFS.map(function(r){return '<li>'+r+'</li>';}).join('');
  if($('tipbox')){var T=TIP;$('tipbox').innerHTML='<div class="card tw" style="padding:6px 12px"><table class="tb"><tbody><tr><th style="width:120px">대상</th><td>'+T.who+'</td></tr><tr><th>학습 목표</th><td>'+T.goal+'</td></tr><tr><th>예상 시간</th><td>'+T.time+'</td></tr></tbody></table></div>'+
    '<div class="tipgrid">'+T.plans.map(function(p){return '<div><h4>'+p[0]+'</h4><p>'+p[1]+'</p></div>';}).join('')+'</div>'+
    '<h3 style="margin:22px 0 10px;font-size:17px">흔한 오해</h3><div class="card tw" style="padding:6px 12px"><table class="tb"><thead><tr><th>오해</th><th>바른 설명</th></tr></thead><tbody>'+T.myths.map(function(m){return '<tr><td>'+m[0]+'</td><td>'+m[1]+'</td></tr>';}).join('')+'</tbody></table></div>';}}

/* ══ 히어로 무대: 배경 장면 + 두 라이벌 + 주제 그림 ═══════════════════ */
function heroStage(cv,opt){var ctx=cv.getContext('2d'),t=0,IM={},W=1100,H=340;
  function ld(k,src){if(!src)return;var i=new Image();i.onload=function(){IM[k]=i;draw();};i.src=src;}
  ld('bg',SPR[opt.bg]);ld('fly',sprite('fly',opt.fly||'clip'));ld('robo',sprite('robo',opt.robo||'coin'));
  function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0d0c1c';ctx.fillRect(0,0,W,H);
    if(IM.bg){var b=IM.bg,sh=b.width*H/W;ctx.drawImage(b,0,Math.max(0,(b.height-sh)*(opt.bgY==null?.3:opt.bgY)),b.width,sh,0,0,W,H);}
    ctx.fillStyle='rgba(10,9,24,.55)';ctx.fillRect(0,0,W,H);
    var gr=ctx.createLinearGradient(0,220,0,H);gr.addColorStop(0,'rgba(10,9,24,0)');gr.addColorStop(1,'rgba(10,9,24,.9)');ctx.fillStyle=gr;ctx.fillRect(0,220,W,120);
    ctx.save();opt.motif(ctx,t,W,H);ctx.restore();
    var bob=Math.round(Math.sin(t*2.2)*2)*2;ctx.imageSmoothingEnabled=true;
    if(IM.fly){var fh=190,fw=IM.fly.width*fh/IM.fly.height;ctx.drawImage(IM.fly,24,H-fh-36+bob,fw,fh);}
    if(IM.robo){var rh=190,rw=IM.robo.width*rh/IM.robo.height;ctx.drawImage(IM.robo,W-rw-24,H-rh-36+Math.sin(t*1.8)*3,rw,rh);}
    ctx.imageSmoothingEnabled=false;ctx.font=font(15,700);ctx.textAlign='left';ctx.fillStyle='#ff7a7a';ctx.fillText('초파리 연구원',34,H-14);
    ctx.textAlign='right';ctx.fillStyle='#57d0dc';ctx.fillText('Money-Robo',W-34,H-14);}
  draw();if(!REDUCE)onTick(cv,function(dt){t+=dt;draw();});}

/* ══ 시작 ═════════════════════════════════════════════════════════ */
function boot(){renderSeries();updateScore();renderQuiz();renderCode();renderPrompts();renderAppendix();renderGloss();hydrate(document);
  if(location.hash){var id=decodeURIComponent(location.hash.slice(1));setTimeout(function(){var e=$(id);if(e)e.scrollIntoView();},80);}}
