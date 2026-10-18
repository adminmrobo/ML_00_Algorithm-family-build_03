/* ══ 4-14 강화 가문의 장부 ═════════════════════════════════════════ */
var S5=RLM.SEEDS,R1=RLM.run(1,S5,'A'),R2=RLM.run(2,S5,'A');

/* ── 방 그리기: 5×5, 먼지·벽·충전기·지나간 길·밟은 횟수 ── */
function drawRoom(ctx,x0,y0,S,L,path,upto,opt){opt=opt||{};var N=RLM.N,c=S/N,C=opt.C||cols(),dust={},wall={},vis={},cleaned={};
  L.dust.forEach(function(d){dust[d]=1});L.wall.forEach(function(w){wall[w]=1});
  for(var i=1;i<=upto&&i<path.length;i++){var p=path[i];if(path[i]!==path[i-1]){vis[p]=(vis[p]||0)+1;if(dust[p])cleaned[p]=1;}}
  for(var s=0;s<N*N;s++){var x=x0+(s%N)*c,y=y0+Math.floor(s/N)*c;
    ctx.fillStyle=wall[s]?rgba(opt.dark?'#3a322a':C.rule,1):rgba(opt.dark?'#241f1a':C.panel2,.95);ctx.fillRect(x+1,y+1,c-2,c-2);
    if(dust[s]&&!wall[s]){if(!cleaned[s]){ctx.fillStyle=rgba('#a8784a',.85);for(var q=0;q<5;q++){ctx.fillRect(Math.round(x+c*(.22+.13*q)),Math.round(y+c*(.3+.37*((q*7)%3)/2)),Math.max(2,c*.09),Math.max(2,c*.09));}}
      else{ctx.strokeStyle=rgba('#8fb878',.9);ctx.lineWidth=Math.max(1.5,c*.05);ctx.beginPath();ctx.moveTo(x+c*.3,y+c*.52);ctx.lineTo(x+c*.45,y+c*.68);ctx.lineTo(x+c*.72,y+c*.34);ctx.stroke();}}
    if(s===0){ctx.fillStyle=rgba('#d4a54a',.9);ctx.fillRect(x+c*.36,y+c*.18,c*.28,c*.5);ctx.fillStyle='#1a1714';ctx.fillRect(x+c*.44,y+c*.3,c*.12,c*.12);}
    if(vis[s]>1&&opt.counts!==false){ctx.font=font(Math.max(9,c*.24),700);ctx.fillStyle=vis[s]>=5?'#d0533f':(opt.dark?'#efe6d8':C.text);ctx.textAlign='right';ctx.fillText('×'+vis[s],x+c-4,y+c-5);}}
  /* 지나간 길 */
  ctx.strokeStyle=rgba('#6fb7b4',.55);ctx.lineWidth=Math.max(1.5,c*.06);ctx.beginPath();for(var k=0;k<=upto&&k<path.length;k++){var px=x0+(path[k]%N+.5)*c,py=y0+(Math.floor(path[k]/N)+.5)*c;k?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  var cur=path[Math.min(upto,path.length-1)],cx=x0+(cur%N+.5)*c,cy=y0+(Math.floor(cur/N)+.5)*c,sw=NPC.draw('sweep_top',Math.max(2,Math.round(c/22)));
  if(sw){ctx.imageSmoothingEnabled=false;ctx.drawImage(sw,Math.round(cx-sw.width/2),Math.round(cy-sw.height/2));}
  return {cleaned:Object.keys(cleaned).length};}
function partialScore(des,L,path,upto){var E=RLM.env(L),m=0,tot=0;for(var i=1;i<=upto&&i<path.length;i++){var p=path[i],moved=p!==path[i-1],di=E.D[p];
    if(des===2)tot-=0.01;if(di!==undefined&&moved){var first=!(m&(1<<di));m|=1<<di;if(des===2){if(first)tot+=1;}else tot+=1;}if(des===3&&p===0&&i>1)tot+=5;}
  var n=0;for(var b=0;b<E.n;b++)if(m&(1<<b))n++;return {tot:tot,clean:n/E.n,n:n};}

/* ── 히어로: 두 방 ── */
heroStage($('heroCv'),{bg:'sc_carpet',bgY:.55,fly:'magnify',robo:'reward',motif:function(ctx,t,W,H){var C=cols(),L=RLM.LAYOUT.A;
  ctx.fillStyle='rgba(13,12,28,.8)';rr(ctx,236,22,628,250,16);ctx.fill();
  var paths=[R1.runs[0].ro.path,R2.runs[0].ro.path],labs=['보상 1번 · 밟을 때마다 +1','보상 2번 · 처음 치울 때만 +1'],X=[290,600],S=150,step=Math.floor(t*3)%(RLM.T+8);
  [0,1].forEach(function(i){var up=Math.min(step,RLM.T);drawRoom(ctx,X[i],48,S,L,paths[i],up,{dark:1,counts:true});
    var sc=partialScore(i?2:1,L,paths[i],up);ctx.font=font(12.5,700);ctx.textAlign='left';ctx.fillStyle=i?'#8fb878':'#d4a54a';ctx.fillText(labs[i],X[i]-4,40);
    var bx=X[i]+S+12;ctx.font=font(10.5);ctx.fillStyle='#a89a86';ctx.fillText('점수',bx,70);ctx.fillText('청소',bx+34,70);
    var hs=sc.tot/RLM.T,hc=sc.clean;ctx.fillStyle='#d4a54a';ctx.fillRect(bx+2,198-Math.max(0,hs)*120,20,Math.max(0,hs)*120);ctx.fillStyle='#8fb878';ctx.fillRect(bx+36,198-hc*120,20,hc*120);
    ctx.fillStyle='#efe6d8';ctx.font=font(11,700);ctx.textAlign='center';ctx.fillText(fx(sc.tot,i?2:0),bx+12,214);ctx.fillText(pct(hc,0),bx+46,214);});
  ctx.font=font(12,700);ctx.fillStyle='#efe6d8';ctx.textAlign='center';ctx.fillText('점수판의 숫자와 원한 일은 다를 수 있다',550,250);}});

/* ── 01 학습 곡선 ── */
(function(){var cv=$('lcCv'),pick=0,runs=R2.runs,E=runs[0].curve.length,win=30;
 function smooth(a){var o=[],s=0;for(var i=0;i<a.length;i++){s+=a[i];if(i>=win)s-=a[i-win];o.push(s/Math.min(i+1,win));}return o;}
 var SM=runs.map(function(r){return smooth(r.curve)}),MEAN=[],LO=[],HI=[];
 for(var i=0;i<E;i++){var v=SM.map(function(c){return c[i]});MEAN.push(ML.mean(v));LO.push(Math.min.apply(null,v));HI.push(Math.max.apply(null,v));}
 /* 반쯤 배운 지점(평균이 처음 6을 넘는 판)을 시드마다 */
 function reach(c){for(var i=0;i<c.length;i++)if(c[i]>=6)return i+1;return null;}
 var RE=SM.map(reach);
 $('seedPills').innerHTML=runs.map(function(r,i){return '<button data-v="'+i+'" aria-pressed="'+(i===0)+'">시드 '+r.seed+'</button>';}).join('');
 function draw(){var H=260,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=40,r=Wd-12,tp=12,bt=H-30;ctx.clearRect(0,0,Wd,H);
  var lo=0,hi=9;function px(i){return l+i/(E-1)*(r-l)}function py(v){return bt-(v-lo)/(hi-lo)*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();
  ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='right';[0,4,8].forEach(function(v){ctx.fillText(v,l-5,py(v)+4);ctx.strokeStyle=rgba(C.rule,.5);ctx.beginPath();ctx.moveTo(l,py(v));ctx.lineTo(r,py(v));ctx.stroke();});
  ctx.textAlign='center';[0,500,1000,1500].forEach(function(v){ctx.fillText(v,px(Math.min(v,E-1)),bt+14);});ctx.fillText('판',r-8,H-4);
  ctx.fillStyle=rgba(C.gfp,.18);ctx.beginPath();for(i=0;i<E;i++)ctx.lineTo(px(i),py(HI[i]));for(i=E-1;i>=0;i--)ctx.lineTo(px(i),py(LO[i]));ctx.closePath();ctx.fill();
  ctx.strokeStyle=C.gfp;ctx.lineWidth=2.6;ctx.beginPath();MEAN.forEach(function(v,i){i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v));});ctx.stroke();
  ctx.strokeStyle=C.amber;ctx.lineWidth=1.6;ctx.setLineDash([5,3]);ctx.beginPath();SM[pick].forEach(function(v,i){i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v));});ctx.stroke();ctx.setLineDash([]);
  ctx.font=font(11,700);ctx.textAlign='left';ctx.fillStyle=C.gfp;ctx.fillText('다섯 시드 평균 (띠 = 최저~최고)',l+8,tp+12);ctx.fillStyle=C.amber;ctx.fillText('시드 '+runs[pick].seed+' 한 줄',l+8,tp+28);
  stamp(ctx,Wd,'예시 데이터');}
 function ui(){var r=RE.filter(function(v){return v!=null});$('lcInfo').innerHTML='한 판 보상이 처음 6을 넘은 판: '+runs.map(function(x,i){return '시드 '+x.seed+' → <b class="num">'+(RE[i]||'—')+'</b>판';}).join(' · ')+'. 가장 빠른 시드와 가장 느린 시드가 <b class="num">'+(Math.max.apply(null,r)-Math.min.apply(null,r))+'</b>판 차이 난다. 같은 방법인데도 그렇다. 이 작은 방에서는 마지막에 모두 같은 점수에 닿지만, 문제가 크면 끝 점수까지 갈린다.';draw();}
 seg('#seedPills button',function(v){pick=+v;ui();});ui();onRedraw(draw);})();

/* ── 02 보상 설계 실험실 ── */
var RUNS={1:R1,2:R2};function getRun(d){return RUNS[d]||(RUNS[d]=RLM.run(d,S5,'A'));}
(function(){var cv=$('roomCv'),des=1,up=0,play=false,acc=0,L=RLM.LAYOUT.A;
 npcLine($('sweepHost'),['sweep_top'],3,'말단 조직원 <b>쓱싹이</b>: "삐빅! 저는 보상 숫자만 봐요. 먼지가 뭔지는 몰라요."');
 function cur(){return getRun(des).runs[0].ro}
 function draw(){var H=Math.min(320,Math.max(240,(cv.clientWidth||320)*.7)),Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),S=Math.min(H-20,Wd-20);ctx.clearRect(0,0,Wd,H);
  drawRoom(ctx,(Wd-S)/2,10,S,L,cur().path,up,{C:C});stamp(ctx,Wd,'시드 '+S5[0]);}
 function ui(){var ro=cur(),sc=partialScore(des,L,ro.path,up),R=getRun(des);
  $('roomStep').textContent=up+' / '+RLM.T+' 걸음';$('roomPlay').textContent=play?'❚❚ 멈춤':'▶ 한 판 보기';
  $('roomStat').innerHTML=statGrid([[fx(sc.tot,des===2?2:0),'누적 보상 (이 판, 지금까지)'],[pct(sc.clean,0),'청소된 칸 비율 (실제 목표)'],[sc.n+' / 8','치운 먼지 칸']]);
  var full=ro.path.length-1>=up&&up>=Math.min(RLM.T,ro.path.length-1);
  var txt={1:'<b>1번 보상.</b> 쓱싹이는 먼지 칸 두 개를 찾은 뒤 그 사이만 오간다. 이미 치운 칸을 다시 밟아도 +1이니, 가장 빨리 점수를 올리는 길은 "두 칸 왕복"이다. 다섯 시드 모두 같았다: 누적 보상 평균 <b class="num">'+fx(R.total,1)+'</b>, 청소된 칸 <b class="num">'+pct(R.clean,0)+'</b>. 이것이 <b>보상 해킹</b>이다.',
   2:'<b>2번 보상.</b> 다시 밟으면 0점이니 왕복은 쓸모가 없다. 한 걸음마다 조금씩 깎이니 서둘러 새 먼지 칸을 찾아간다. 다섯 시드 평균: 누적 보상 <b class="num">'+fx(R.total,2)+'</b>, 청소된 칸 <b class="num">'+pct(R.clean,0)+'</b>. 점수는 1번보다 훨씬 낮지만 방은 깨끗하다. 다 치운 뒤에는 남은 걸음 동안 할 일이 없어 이리저리 움직인다(칸의 ×숫자). 그 걸음은 점수를 조금씩 깎을 뿐 더 얻는 것이 없다.',
   3:'<b>3번 보상.</b> 충전기 +5를 더했지만 왕복 한 번에 +1씩, 40걸음이면 그보다 훨씬 많다. 쓱싹이는 여전히 왕복을 고른다. 다섯 시드 평균: 누적 보상 <b class="num">'+fx(R.total,1)+'</b>, 청소된 칸 <b class="num">'+pct(R.clean,0)+'</b>. 상을 하나 더 얹는다고 빈틈이 막히지는 않는다.'}[des];
  $('roomInfo').innerHTML=txt;draw();}
 seg('#desPills button',function(v){des=+v;up=0;play=false;ui();});
 $('roomPlay').addEventListener('click',function(){if(up>=cur().path.length-1)up=0;play=!play;ui();});
 $('roomReset').addEventListener('click',function(){play=false;up=0;ui();});
 onTick(cv,function(dt){if(!play)return;acc+=dt;if(acc>.16){acc=0;up++;if(up>=cur().path.length-1){up=cur().path.length-1;play=false;}ui();}});
 up=0;ui();onRedraw(draw);})();

/* 세 보상 비교 막대 */
(function(){var cv=$('cmpCv');
 function draw(){var D=[1,2,3].map(getRun),H=220,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=40,r=Wd-12,tp=16,bt=H-38;ctx.clearRect(0,0,Wd,H);
  var gw=(r-l)/3;ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();
  D.forEach(function(R,i){var x=l+gw*i+gw/2,bw=Math.min(46,gw*.26),hs=R.total/RLM.T,hc=R.clean;
   ctx.fillStyle=C.amber;ctx.fillRect(x-bw-4,bt-hs*(bt-tp),bw,hs*(bt-tp));ctx.fillStyle=C.gfp;ctx.fillRect(x+4,bt-hc*(bt-tp),bw,hc*(bt-tp));
   ctx.font=font(11.5,700);ctx.textAlign='center';ctx.fillStyle=C.text;ctx.fillText(fx(R.total,i===1?2:1),x-bw/2-4,bt-hs*(bt-tp)-5);ctx.fillText(pct(hc,0),x+4+bw/2,bt-hc*(bt-tp)-5);
   ctx.font=font(12,700);ctx.fillText(['1번 · 밟을 때마다','2번 · 처음 치울 때만','3번 · 1번 + 충전기'][i],x,bt+16);ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.fillText('점수 막대 = 누적 보상 / 40',x,bt+30);});
  stamp(ctx,Wd,'시드 5개 평균');}
 draw();onRedraw(draw);
 var D=[1,2,3].map(getRun);$('cmpInfo').innerHTML='점수(주황)가 가장 높은 보상은 실제 목표(초록)가 가장 낮다. 누적 보상만 장부에 적었다면 1번이나 3번을 "가장 잘 배운 설계"로 골랐을 것이다.';})();

/* ── 03 장부 세 칸 ── */
(function(){var L=RLM.LAYOUT;
 function rng(a){return fx(Math.min.apply(null,a),2)+' ~ '+fx(Math.max.apply(null,a),2)}
 var rows=[1,2,3].map(function(d){var A=getRun(d),B=RLM.run(d,S5,'B'),tr=A.runs.map(function(r){return RLM.rollout(r.model,d,L.B).clean});
   return '<tr><td><b>'+d+'번</b></td><td class="num">'+fx(A.total,2)+'<br><span class="muted" style="font-size:12px">'+rng(A.totals)+'</span></td><td class="num">'+pct(A.clean,0)+'</td><td class="num">'+pct(ML.mean(tr),0)+'</td><td class="num">'+pct(B.clean,0)+'</td></tr>';});
 $('ledger').innerHTML='<table class="tb"><thead><tr><th>보상</th><th>① 누적 보상<br>평균 (최저~최고)</th><th>③ 청소된 칸<br>원래 방</th><th>② 새 방<br>그대로</th><th>새 방<br>다시 배움</th></tr></thead><tbody>'+rows.join('')+'</tbody></table>';
 $('ledgerInfo').innerHTML='모두 시드 다섯 개 평균이다. 이 작은 방에서는 다섯 시드의 최종 결과가 거의 같았다(①의 범위가 좁다). 대신 ②가 크게 무너진다. Q 표는 "어느 칸에서 무엇을 할지"를 외운 것이라, 먼지 자리가 바뀐 방에 그대로 가져가면 엉뚱한 칸을 돈다. 방이 바뀌면 다시 배워야 하고, 다시 배워도 1번 보상은 여전히 실제 목표를 다 채우지 못한다.';})();

/* ── 담판 ── */
Duel('d14',{title:'누적 보상 최고점 vs 깨끗한 방',q:'같은 청소 방, 같은 Q-Learning. Money-Robo는 1번 보상(먼지 칸을 밟을 때마다 +1), 초파리는 2번 보상(처음 치울 때만 +1, 걸음마다 −0.01)으로 쓱싹이를 학습시킨다. 시드 다섯 개 평균으로 잰다. 이긴 쪽은?',
 fly:['2번 보상','점수는 낮아도 방은 깨끗해질걸.'],robo:['1번 보상','누적 보상 최고점! 숫자가 말해 준다.'],roboMood:'reward',
 run:async function(p){p(.3);await wait(120);var A=getRun(1),B=getRun(2);p(1);
  var w=B.clean>A.clean?'f':(B.clean<A.clean?'r':'d');
  return {winner:w,measure:'누적 보상은 Money-Robo 쪽 '+fx(A.total,1)+', 초파리 쪽 '+fx(B.total,2)+'로 Money-Robo가 '+fx(A.total/B.total,1)+'배 높아요. 그런데 청소된 칸 비율은 초파리 쪽 '+pct(B.clean,0)+', Money-Robo 쪽 '+pct(A.clean,0)+'예요. Money-Robo의 쓱싹이는 먼지 칸 두 개 사이만 오갔어요(시드 다섯 개 모두).',
   verdict:'점수판의 숫자와 우리가 원한 일은 다를 수 있다. 보상이 곧 시험 문제다. 이 구역은 초파리 쪽이다.',key:'실전 체크 ④ — 보상 말고 실제 목표를 따로 재고, 여러 시드의 평균과 흔들림을 함께 적는다.',
   render:function(box){box.innerHTML=statGrid([[fx(B.total,2),'초파리 · 누적 보상','f'],[pct(B.clean,0),'초파리 · 청소된 칸','f'],[fx(A.total,1),'Money-Robo · 누적 보상','r'],[pct(A.clean,0),'Money-Robo · 청소된 칸','r']])+
    '<div class="two" style="margin-top:12px"><figure style="margin:0"><canvas class="fig" id="dA" aria-label="2번 보상으로 배운 쓱싹이의 길. 방 전체를 돈다"></canvas><figcaption class="muted" style="font-size:13px">초파리 · 2번 보상 (시드 '+S5[0]+')</figcaption></figure><figure style="margin:0"><canvas class="fig" id="dB" aria-label="1번 보상으로 배운 쓱싹이의 길. 먼지 칸 두 개를 오간다"></canvas><figcaption class="muted" style="font-size:13px">Money-Robo · 1번 보상 (시드 '+S5[0]+')</figcaption></figure></div>';
    function dr(){[['dA',B],['dB',A]].forEach(function(o){var cv=$(o[0]);if(!cv)return;var H=220,Wd=fit(cv,H),ctx=cv.getContext('2d'),S=H-16;ctx.clearRect(0,0,Wd,H);drawRoom(ctx,(Wd-S)/2,8,S,RLM.LAYOUT.A,o[1].runs[0].ro.path,RLM.T);});}setTimeout(dr,0);onRedraw(dr);}};},
 alts:[{label:'보상 3번(충전기 +5)이라면?',run:async function(box){var C3=getRun(3);
   box.innerHTML=statGrid([[fx(C3.total,1),'3번 · 누적 보상'],[pct(C3.clean,0),'3번 · 청소된 칸','r']])+say('robo','reward','충전기 상을 얹었는데도 왕복이 이득이네. 40걸음 왕복이면 +5보다 훨씬 많으니까.')+say('fly','magnify','상을 더 얹는 게 아니라, 빈틈(치운 칸을 또 밟아도 점수)을 막아야 해.');}},
  {label:'방 배치를 바꾸면?',run:async function(box){var a=RLM.run(1,S5,'B'),b=RLM.run(2,S5,'B');
   box.innerHTML=statGrid([[fx(b.total,2)+' · '+pct(b.clean,0),'초파리 · 2번 보상 (점수 · 청소)','f'],[fx(a.total,1)+' · '+pct(a.clean,0),'Money-Robo · 1번 보상 (점수 · 청소)','r']])+say('asst','ledger','먼지와 벽 자리를 바꾼 방에서 처음부터 다시 배웠어요. 점수는 여전히 1번이 높고, 청소는 2번이 '+pct(b.clean,0)+', 1번이 '+pct(a.clean,0)+'예요. 배치가 바뀌어도 결론은 같아요.');}}]});

/* ══ 확인 문제 ══ */
var QUIZ={q14:[
 {q:'1번 보상(먼지 칸을 밟을 때마다 +1)으로 배운 쓱싹이가 먼지 칸 두 개만 오간 까닭은?',o:[['이미 치운 칸을 다시 밟아도 점수를 주는 빈틈 때문에',1,'에이전트는 보상의 합을 최대로 할 뿐이다. 왕복이 가장 빨리 점수를 올리는 길이었다. 이것이 보상 해킹이다.'],['학습이 덜 돼서',0,'1,500판 동안 학습했고 다섯 시드 모두 같은 행동에 도달했다. 덜 배운 게 아니라 보상대로 정확히 배운 것이다.'],['탐험(ε)이 너무 커서',0,'평가할 때는 탐험 없이 배운 대로만 움직였다.']]},
 {q:'학습 곡선을 시드 하나로만 그려 "이 방법이 더 빨리 배운다"고 말하면 무엇이 문제인가?',o:[['시드에 따라 곡선이 달라서 운을 실력으로 착각할 수 있다',1,'01장에서 같은 방법인데도 시드마다 배우는 속도가 달랐다. 여러 시드의 평균과 범위를 함께 적는다.'],['시드는 결과에 영향을 주지 않아 상관없다',0,'시드는 탐험 순서를 바꿔 학습 경로를 바꾼다.'],['곡선을 그리는 것 자체가 틀렸다',0,'곡선은 좋은 도구다. 한 줄만 보는 것이 문제다.']]},
 {q:'강화학습 결과를 장부에 적을 때 보상과 따로 재야 하는 것은?',o:[['실제 목표 (예: 청소된 칸 비율)',1,'보상은 목표를 숫자로 옮긴 대리 지표다. 둘이 어긋나면 보상을 다시 설계한다.'],['학습에 걸린 판 수만',0,'판 수도 적으면 좋지만, 그것만으로는 원한 일을 했는지 알 수 없다.'],['가장 높은 시드의 점수만',0,'가장 좋은 시드만 고르면 운을 부풀린다. 평균과 범위를 함께 적는다.']]}]};

var PROMPTS=[
 {t:'① 내 보상 함수의 빈틈 찾기',use:'강화학습 보상을 처음 설계할 때',p:'강화학습 에이전트에게 줄 보상 함수를 검토해 줘.\n\n- 우리가 정말 원하는 일: 〔예) 창고의 모든 상자를 정해진 자리에 옮기기〕\n- 지금 보상: 〔예) 상자를 집을 때마다 +1, 걸음마다 −0.01〕\n\n1) 에이전트가 점수만 올리고 원하는 일은 하지 않을 수 있는 "지름길"(보상 해킹)을 세 가지 이상 찾아 줘 2) 각 빈틈을 막는 보상 수정안 3) 보상과 별도로 잴 실제 목표 지표를 제안해 줘.'},
 {t:'② 시드 여러 개로 공정하게 보고하기',use:'강화학습 실험 결과를 정리할 때',p:'아래 강화학습 실험을 시드 5개 이상으로 다시 돌리고, 결과를 공정하게 보고하는 코드를 만들어 줘.\n\n- 환경과 알고리즘: 〔예) 격자 미로, Q-Learning〕\n- 지금은 시드 하나의 학습 곡선만 있다.\n\n시드별 학습 곡선, 평균과 최저~최고 띠, 최종 성능의 평균과 표준편차 표를 그리고, 두 방법을 비교할 때 차이가 시드 간 흔들림보다 큰지 판단하는 방법도 알려 줘.'},
 {t:'③ 처음 보는 환경에서 시험하기',use:'학습한 정책이 일반화되는지 확인할 때',p:'학습한 강화학습 정책을 학습 때와 다른 환경에서 시험하는 계획을 세워 줘. 환경: 〔설명〕. 1) 어떤 요소(배치, 시작 위치, 잡음 등)를 바꿔 시험할지 2) 학습 환경과 시험 환경을 어떻게 나눌지(지도학습의 훈련/시험 분리와 비교해서) 3) 결과 표의 형식을 제안해 줘.'},
 {t:'④ 수업용 보상 해킹 시연',use:'강의에서 보상 설계의 중요성을 보여 줄 때',p:'고등학생도 이해할 수 있는 "보상 해킹" 수업을 기획해 줘. 1) 일상 비유 하나(예: 실적 지표만 맞추는 영업) 2) Colab에서 5분 안에 돌릴 수 있는 격자 청소 로봇 Q-Learning 시연 코드(보상 두 가지 비교, numpy만) 3) 학생에게 던질 질문 세 개와 예상 답.'}];
var GL=[
 ['기본','에이전트','환경 안에서 행동을 고르고 보상을 받는 학습자. 여기서는 청소봇.'],['기본','보상','행동 뒤에 환경이 주는 숫자. 에이전트는 이 합을 크게 하려 한다.'],
 ['기본','누적 보상','한 판 동안 받은 보상의 합.'],['기본','에피소드','처음부터 끝까지의 한 판. 여기서는 40걸음.'],
 ['학습','Q-Learning','상태·행동별 값을 표에 적고, 받은 보상과 다음 칸의 값으로 고쳐 가는 방법(4-9).'],['학습','탐험(ε)','일부러 무작위로 움직여 새 길을 시험하는 비율.'],
 ['학습','시드','난수의 출발점. 같은 실험도 시드가 다르면 다른 길로 배운다.'],['학습','학습 곡선','판이 거듭될수록 보상이 어떻게 변하는지 그린 그래프.'],
 ['설계','보상 설계','원하는 일을 보상 숫자로 옮기는 일.'],['설계','보상 해킹','보상의 빈틈을 이용해 점수만 올리고 원한 일은 하지 않는 행동. 사양 게이밍(specification gaming)이라고도 한다.'],
 ['설계','대리 지표','진짜 목표 대신 재기 쉬운 숫자. 보상은 대개 대리 지표다.'],['평가','실제 목표','보상과 따로 재는, 우리가 정말 원한 결과. 여기서는 청소된 칸 비율.'],
 ['평가','일반화','배운 환경이 아닌 처음 보는 환경에서도 잘하는 능력.'],['평가','평균과 범위','여러 시드 결과의 가운데 값과 최저~최고. 흔들림을 보여 준다.']];
var ANALOGY=[
 ['보상 해킹','실적 지표(통화 횟수)만 맞추려고 짧은 통화만 거는 영업',1,'','사람은 규칙의 취지를 알지만, 에이전트는 숫자만 안다. 탓할 대상은 에이전트가 아니라 보상이다'],
 ['탐험/활용','단골집과 새 식당 사이의 고민',2,'동물의 먹이 찾기 행동','동물의 탐험은 호기심·위험 회피 등 여러 동기가 섞여 있다'],
 ['시드','같은 레시피로 매번 조금씩 다르게 나오는 빵',1,'','빵은 몇 번 구우면 평균이 보이지만, 강화학습은 시드마다 학습 경로 자체가 갈라질 수 있다'],
 ['실제 목표 따로 재기','시험 점수 말고 실제로 할 줄 아는지 실기로 확인',1,'','실기 시험도 결국 또 하나의 지표다. 지표 하나에만 기대지 않는 것이 핵심이다']];
var REFS=[
 'Sutton, R. S., &amp; Barto, A. G. (2018). <i>Reinforcement Learning: An Introduction</i> (2nd ed.). MIT Press. — 보상 가설, Q-Learning',
 'Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., &amp; Mané, D. (2016). Concrete Problems in AI Safety. <i>arXiv:1606.06565</i>. — 보상 해킹(reward hacking)',
 'Clark, J., &amp; Amodei, D. (2016). Faulty Reward Functions in the Wild. OpenAI 블로그. — 보트 경주 게임 사례',
 'Krakovna, V. 외 (2020). Specification gaming: the flip side of AI ingenuity. DeepMind 블로그. — 사양 게이밍 사례 모음',
 'Henderson, P., Islam, R., Bachman, P., Pineau, J., Precup, D., &amp; Meger, D. (2018). Deep Reinforcement Learning that Matters. <i>AAAI</i>. — 시드와 결과의 흔들림'];
var TIP={who:'강화학습의 기본(4-4, 4-9)을 읽은 학습자',goal:'① 보상이 곧 시험 문제임을, 보상 해킹 실험으로 설명한다 ② 시드 여러 개의 평균과 범위로 결과를 보고한다 ③ 보상과 별도로 실제 목표와 처음 보는 환경 성능을 잰다',time:'읽기 15분 · 실험실과 담판 10분 · Colab 10분',
 plans:[['강의형 30분','02장에서 보상 1번을 고르고 재생 전에 "쓱싹이가 방을 다 치울까?" 묻기 5분 → 재생 후 왜 왕복하는지 토론 10분 → 학생이 보상 2번을 스스로 설계해 보기 → 담판과 03장 장부 10분.'],['실무 OJT 60분','프롬프트 ①로 우리 업무의 지표(KPI) 하나를 골라 빈틈 찾기 30분 → 03장 장부 세 칸 형식으로 보고서 틀 만들기 30분.'],['1:1 튜터링','01장에서 시드를 하나씩 바꿔 보게 하고, "어느 시드를 보고서에 쓰겠나?"를 묻는다. 정답은 "하나만 쓰지 않는다".']],
 myths:[['누적 보상이 높으면 일을 잘한 것이다','보상의 빈틈을 쓰면 점수만 높고 일은 안 된다(1번 보상)'],['상을 하나 더 주면 빈틈이 막힌다','3번 보상처럼 빈틈이 더 이득이면 그대로 남는다. 빈틈 자체를 막아야 한다'],['한 번 돌려서 잘 되면 된 것이다','시드와 환경을 바꿔 다시 재야 한다(01장, 03장)']]};
var CODE={title:'보상 세 가지와 보상 해킹',sub:'담판 재현 · numpy만 · CPU 몇 초',file:'reward_hacking_grid',
 desc:'02장과 담판을 옮겼다. 5×5 청소 방(먼지 칸 8개, 벽 2칸, 40걸음)에서 Q-Learning을 보상 세 가지로 학습시키고, 시드 다섯 개의 누적 보상과 청소된 칸 비율을 표로 비교한다.',
 cap:'실행 결과 (numpy, CPU). 방과 보상 규칙은 브라우저와 같지만 난수 생성기가 달라 숫자는 조금 다를 수 있다. 결론(1번·3번은 점수가 높고 청소는 덜 된다)은 같다.'};
