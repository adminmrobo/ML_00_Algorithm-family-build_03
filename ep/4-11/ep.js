/* ══ 4-11 가문의 규칙 ═══════════════════════════════════════════════ */
var DUELW=FAIR.world(1111);

/* ── 히어로: 3부 개막 전 세력도 ── */
heroStage($('heroCv'),{bg:'sc_meeting',bgY:0,fly:'magnify',robo:'tux',motif:function(ctx,t,W,H){
  ctx.fillStyle='rgba(15,13,11,.82)';rr(ctx,250,20,600,268,16);ctx.fill();ctx.strokeStyle='rgba(212,165,74,.55)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.textAlign='center';ctx.font=font(13,700);ctx.fillStyle='#d4a54a';ctx.fillText('세력도 · 3부 가문 회합 개막 전',550,44);
  ctx.font=font(50,800);ctx.fillStyle='#d0533f';ctx.fillText('3',455,104);ctx.fillStyle='rgba(239,230,216,.7)';ctx.fillText(':',505,100);ctx.fillStyle='#6fb7b4';ctx.fillText('5',555,104);ctx.fillStyle='rgba(239,230,216,.7)';ctx.fillText(':',605,100);ctx.fillStyle='#d4a54a';ctx.fillText('2',655,104);
  ctx.font=font(11.5);ctx.fillStyle='rgba(239,230,216,.75)';ctx.fillText('초파리',455,124);ctx.fillText('Money-Robo',555,124);ctx.fillText('나눠 가짐',655,124);
  var lab=['1부 가계도','2부 명부','3부 회합'],col={f:'#d0533f',x:'#d0533f',r:'#6fb7b4',d:'#d4a54a'};
  for(var row=0;row<3;row++){var y=146+row*44;ctx.textAlign='right';ctx.font=font(11.5,700);ctx.fillStyle=row===2?'#efe6d8':'rgba(239,230,216,.6)';ctx.fillText(lab[row],380,y+22);
    for(var c=0;c<5;c++){var e=EPISODES[row*5+c],x=392+c*86,known=row<2;ctx.fillStyle=known?rgba(col[e.plan],.22):'rgba(239,230,216,.05)';rr(ctx,x,y,78,34,7);ctx.fill();
      var on=row===2&&c===0,g=(Math.sin(t*3)+1)/2;ctx.strokeStyle=known?rgba(col[e.plan],.8):(on?rgba('#d4a54a',.4+.5*g):'rgba(239,230,216,.25)');ctx.lineWidth=on?2.5:1.2;ctx.stroke();
      ctx.textAlign='center';ctx.font=font(11,700);ctx.fillStyle=known?'#efe6d8':'rgba(239,230,216,.7)';ctx.fillText(e.n,x+39,y+15);ctx.font=font(10.5);
      ctx.fillStyle=known?col[e.plan]:'rgba(239,230,216,.5)';ctx.fillText(known?({f:'초파리',r:'Money-Robo',d:'나눠 가짐'})[e.plan]:(on?'오늘':'?'),x+39,y+28);}}}});
document.querySelectorAll('#door11 a').forEach(function(a){var c=a.getAttribute('data-c');if(c)a.insertBefore(NPC.crest(c,2,''),a.firstChild);});

/* ── 01 데이터 나누기 ── */
(function(){var cv=$('splitCv'),p=0,run=false,ratio=60,order=ML.shuffle(Array.from({length:100},function(_,i){return i}),ML.R(5));
 npcLine($('owlHost'),['owl'],2,'금고지기 부엉이 <b>봉인관</b>: "시험 금고는 지금 봉인합니다. 마지막 날, 한 번만 엽니다."');
 function counts(){var v=(100-ratio)/2;return [ratio,v,v];}
 function draw(){var H=280,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols();ctx.clearRect(0,0,Wd,H);
  var n=counts(),names=['훈련','검증','시험'],cc=[C.info,C.amber,C.eye],bw=(Wd-40)/3,by=170;
  for(var b=0;b<3;b++){var bx=14+b*(bw+6);ctx.fillStyle=rgba(cc[b],.1);rr(ctx,bx,by,bw,96,10);ctx.fill();ctx.strokeStyle=rgba(cc[b],.7);ctx.lineWidth=1.5;ctx.stroke();
   ctx.font=font(12,700);ctx.fillStyle=cc[b];ctx.textAlign='left';ctx.fillText(names[b]+' '+n[b]+'장',bx+8,by+16);}
  var gx=Math.max(14,(Wd-10*20)/2),ant=NPC.draw('ant',1);
  order.forEach(function(id,k){var box=k<n[0]?0:(k<n[0]+n[1]?1:2),j=box===0?k:(box===1?k-n[0]:k-n[0]-n[1]),per=box===0?Math.max(10,Math.floor((bw-16)/9)):Math.floor((bw-16)/9);
   var cols_=Math.max(1,Math.floor((bw-16)/9)),tx=14+box*(bw+6)+8+(j%cols_)*9,ty=by+24+Math.floor(j/cols_)*9,sx=gx+(id%10)*20,sy=14+Math.floor(id/10)*14;
   var s=Math.max(0,Math.min(1,p*1.6-k/100*0.6)),e=s<.5?2*s*s:1-Math.pow(-2*s+2,2)/2,x=sx+(tx-sx)*e,y=sy+(ty-sy)*e;
   ctx.fillStyle=s>0&&s<1?C.text:(s>=1?cc[box]:C.muted);ctx.fillRect(Math.round(x),Math.round(y),7,9);
   if(s>0&&s<1&&k%3===0)ctx.drawImage(ant,Math.round(x)-3,Math.round(y)+8);});
  if(p>=1){var sx2=14+2*(bw+6)+bw-30,sy2=by+12;ctx.fillStyle=C.eye;ctx.beginPath();ctx.arc(sx2,sy2,11,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font=font(10,800);ctx.textAlign='center';ctx.fillText('봉',sx2,sy2+4);}
  stamp(ctx,Wd,'카드 = 데이터 한 건');}
 function ui(){var n=counts();$('splitInfo').innerHTML='훈련 <b>'+n[0]+'</b>장으로 배우고, 검증 <b>'+n[1]+'</b>장으로 고르고, 시험 <b>'+n[2]+'</b>장은 봉인한다. '+(ratio>=80?'시험이 10장뿐이면 한 장이 10%p다. 점수가 운에 크게 흔들린다.':ratio>=70?'훈련 몫을 늘리면 모델은 더 많이 배우지만, 검증·시험 점수의 흔들림은 커진다.':'흔히 쓰는 비율이다. 데이터가 적으면 교차 검증(02장)이 검증 몫을 아껴 준다.');$('splitPlay').textContent=run?'❚❚ 멈춤':'▶ 나누기';}
 $('splitPlay').addEventListener('click',function(){if(p>=1)p=0;run=!run;if(REDUCE&&run){p=1;run=false;draw();}ui();});
 $('splitReset').addEventListener('click',function(){run=false;p=0;draw();ui();});
 seg('#m1 .pills button',function(v){ratio=+v;p=p>=1?1:p;draw();ui();});
 onTick(cv,function(dt){if(!run)return;p=Math.min(1,p+dt/3.2);if(p>=1)run=false;draw();ui();});
 draw();ui();onRedraw(draw);})();

/* ── 02 교차 검증 ── */
var CVS=(function(){var W=DUELW,D=W.tr.concat(W.va),fold=5,sz=Math.floor(D.length/fold),score={};FAIR.MS.forEach(function(m){score[m]=[];});
  for(var f=0;f<fold;f++){var va=D.slice(f*sz,(f+1)*sz),tr=D.slice(0,f*sz).concat(D.slice((f+1)*sz)),s=FAIR.stats(tr),rk=FAIR.rank(tr,s);FAIR.MS.forEach(function(m){score[m].push(FAIR.acc(FAIR.fit(tr,s,rk.slice(0,m)),va));});}
  var out={};FAIR.MS.forEach(function(m){var a=score[m],mu=ML.mean(a),sd=Math.sqrt(ML.mean(a.map(function(v){return (v-mu)*(v-mu)})));out[m]={f:a,mu:mu,sd:sd};});return out;})();
(function(){var cv=$('cvCv'),m=3,t0=0,best=1;FAIR.MS.forEach(function(k){if(CVS[k].mu>CVS[best].mu)best=k;});
 function draw(){var H=272,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),o=CVS[m],l=10,bw=Math.min(300,Wd*.55),cell=bw/5,bx=Wd-150;ctx.clearRect(0,0,Wd,H);
  var act=REDUCE?-1:Math.floor(t0)%5;
  for(var r=0;r<5;r++){var y=34+r*38;ctx.font=font(11,700);ctx.fillStyle=C.muted;ctx.textAlign='left';ctx.fillText((r+1)+'번째',l,y+20);
   for(var c=0;c<5;c++){var x=l+52+c*cell,isV=c===r;ctx.fillStyle=isV?rgba(C.amber,r===act?.75:.45):rgba(C.info,.18);rr(ctx,x+2,y+4,cell-4,24,5);ctx.fill();
    ctx.fillStyle=isV?C.bg:C.muted;ctx.textAlign='center';ctx.font=font(10.5,700);ctx.fillText(isV?'검증':'훈련',x+cell/2,y+20);}
   var a=o.f[r],ww=Math.max(0,(a-.6)/.4)*110;ctx.fillStyle=rgba(C.amber,.8);ctx.fillRect(bx,y+8,ww,16);ctx.fillStyle=C.text;ctx.textAlign='left';ctx.fillText(pct(a),bx+ww+4,y+20);}
  var y2=34+5*38+8;ctx.font=font(12,700);ctx.fillStyle=C.text;ctx.textAlign='left';ctx.fillText('평균 '+pct(o.mu)+' ± '+pct(o.sd)+'  ·  가장 낮은 칸 '+pct(Math.min.apply(null,o.f))+', 가장 높은 칸 '+pct(Math.max.apply(null,o.f)),l,y2+12);
  stamp(ctx,Wd,'예시 데이터');}
 function ui(){$('cvVal').textContent=m;var o=CVS[m];$('cvStat').innerHTML='<div><b class="num">'+pct(o.mu)+'</b><span>평균 (m = '+m+')</span></div><div><b class="num">± '+pct(o.sd)+'</b><span>흩어진 정도 (표준편차)</span></div><div><b class="num">'+best+'</b><span>평균이 가장 높은 m</span></div><div><b class="num">'+pct(CVS[best].mu)+'</b><span>그때의 평균</span></div>';draw();}
 $('cvSl').addEventListener('input',function(){m=+this.value;ui();});
 onTick(cv,function(dt){var b=Math.floor(t0);t0+=dt*.8;if(Math.floor(t0)!==b)draw();});ui();onRedraw(draw);})();

/* ── 03 기준선 ── */
var BASE=FAIR.baseline(DUELW),PICK=FAIR.cvPick(DUELW,5);
(function(){
 /* 분류 */
 function d1(){var cv=$('b1Cv'),H=170,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols();ctx.clearRect(0,0,Wd,H);
  var rows=[['기준이 · 다 "상환"',BASE.fresh,C.muted],['로지스틱 · 특징 '+PICK.m+'개',PICK.fresh,C.gfp]];
  rows.forEach(function(r,i){var y=22+i*58,w=(Wd-24)*r[1];ctx.fillStyle=rgba(r[2],.75);rr(ctx,12,y+16,w,22,5);ctx.fill();ctx.font=font(12,700);ctx.fillStyle=C.text;ctx.textAlign='left';ctx.fillText(r[0]+' · '+pct(r[1]),12,y+10);});
  ctx.strokeStyle=C.rule;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(12+(Wd-24)*.5,10);ctx.lineTo(12+(Wd-24)*.5,H-8);ctx.stroke();ctx.setLineDash([]);stamp(ctx,Wd,'배포 뒤 1,000건');}
 $('b1Info').innerHTML='상환과 연체가 반반에 가까운 데이터라 기준이는 '+pct(BASE.fresh)+'에 그친다. 로지스틱은 '+pct(PICK.fresh)+'로 기준이보다 <b>'+fx((PICK.fresh-BASE.fresh)*100,1)+'%p</b> 높다. 이 차이가 모델이 "배운 몫"이다.';
 /* 회귀 */
 var r=ML.R(21),AD=[];for(var i=0;i<60;i++){var x=r()*10;AD.push({x:x,s:50+6*x+ML.N(r)*8});}var tr=AD.slice(0,40),te=AD.slice(40),mu=ML.mean(tr.map(function(d){return d.s})),ln=ML.linfit(tr.map(function(d){return [d.x]}),tr.map(function(d){return d.s}));
 var mBase=ML.mean(te.map(function(d){return Math.abs(d.s-mu)})),mLin=ML.mean(te.map(function(d){return Math.abs(d.s-ln.predict([d.x]))}));
 function d2(){var cv=$('b2Cv'),H=170,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=30,rr_=Wd-8,tp=8,bt=H-22;ctx.clearRect(0,0,Wd,H);function px(x){return l+x/10*(rr_-l)}function py(s){return bt-(s-30)/90*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(rr_,bt);ctx.stroke();ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText('광고비',(l+rr_)/2,H-6);
  te.forEach(function(d){circ(ctx,px(d.x),py(d.s),3,null,C.amber,1.5);});tr.forEach(function(d){circ(ctx,px(d.x),py(d.s),2.6,rgba(C.info,.7));});
  ctx.strokeStyle=C.muted;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(px(0),py(mu));ctx.lineTo(px(10),py(mu));ctx.stroke();
  ctx.strokeStyle=C.gfp;ctx.beginPath();ctx.moveTo(px(0),py(ln.predict([0])));ctx.lineTo(px(10),py(ln.predict([10])));ctx.stroke();stamp(ctx,Wd,'예시 데이터');}
 $('b2Info').innerHTML='회색 가로선이 기준이(훈련 평균 '+fx(mu,1)+'만 원). 처음 보는 20일에서 기준이는 평균 <b>'+fx(mBase,1)+'만 원</b>, 직선은 <b>'+fx(mLin,1)+'만 원</b> 빗나간다.';
 /* 시계열 */
 var r3=ML.R(33),T=[];for(var d=0;d<60;d++)T.push(15+8*Math.sin(2*Math.PI*d/60)+ML.N(r3)*1.2);var tmu=ML.mean(T.slice(0,40)),nv=0,mv=0;for(d=40;d<60;d++){nv+=Math.abs(T[d]-T[d-1])/20;mv+=Math.abs(T[d]-tmu)/20;}
 function d3(){var cv=$('b3Cv'),H=170,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=26,rr_=Wd-8,tp=8,bt=H-22;ctx.clearRect(0,0,Wd,H);function px(d){return l+d/59*(rr_-l)}function py(v){return bt-(v-3)/26*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(rr_,bt);ctx.stroke();ctx.fillStyle=rgba(C.amber,.08);ctx.fillRect(px(40),tp,px(59)-px(40),bt-tp);
  ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText('날짜 (뒤 20일이 시험)',(l+rr_)/2,H-6);
  ctx.strokeStyle=C.info;ctx.lineWidth=2;ctx.beginPath();T.forEach(function(v,d){d?ctx.lineTo(px(d),py(v)):ctx.moveTo(px(d),py(v));});ctx.stroke();
  ctx.strokeStyle=C.gfp;ctx.setLineDash([4,3]);ctx.beginPath();for(var d=41;d<60;d++){d>41?ctx.lineTo(px(d),py(T[d-1])):ctx.moveTo(px(d),py(T[d-1]));}ctx.stroke();ctx.setLineDash([]);stamp(ctx,Wd,'예시 데이터');}
 $('b3Info').innerHTML='초록 점선이 "내일도 오늘과 같다". 시험 20일에서 평균 <b>'+fx(nv,2)+'도</b> 빗나간다. 훈련 평균으로 다 찍으면 '+fx(mv,2)+'도. 시계열에서는 이 기준이를 이기기가 생각보다 어렵다.';
 function all(){d1();d2();d3();}all();onRedraw(all);
 (function(){var h=$('scareHost');h.className='npcline';h.appendChild(NPC.el('scare',3));var s=document.createElement('span');s.innerHTML='문 앞 허수아비 <b>기준이</b>. 무엇을 물어도 늘 같은 답을 한다. 세 카드의 회색이 기준이의 답이다.';h.appendChild(s);})();})();

/* ── 04 누수 찾기 ── */
(function(){var cv=$('leakCv'),res=null,busy=false;
 (function(){var h=$('mouseHost');h.appendChild(NPC.el('mouse',3));var s=document.createElement('span');s.innerHTML='금고 틈에 코를 대고 있는 생쥐 <b>찍찍이</b>. 장부를 훔치려는 게 아니라 틈이 있으니 들여다볼 뿐이다. 누수는 대개 이렇게 <b>틈</b>에서 생긴다.';h.appendChild(s);})();
 function draw(){var H=250,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=40,r=Wd-10,tp=14,bt=H-44;ctx.clearRect(0,0,Wd,H);
  function py(a){return bt-(a-.7)/.3*(bt-tp)}ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();
  ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='right';[.7,.8,.9,1].forEach(function(v){ctx.fillText(pct(v,0),l-4,py(v)+4);});
  var names=['올바른 절차','누수 ① 전체로 전처리','누수 ② 시험 보며 20번'],gw=(r-l)/3;
  names.forEach(function(nm,i){var cx=l+gw*i+gw/2;ctx.fillStyle=C.text;ctx.textAlign='center';ctx.font=font(11.5,700);ctx.fillText(nm,cx,bt+16);
   if(!res)return;var o=res[i];[[o.te,C.amber],[o.fresh,C.gfp]].forEach(function(b,j){var x=cx-34+j*36;ctx.fillStyle=rgba(b[1],.85);ctx.fillRect(x,py(b[0]),30,bt-py(b[0]));ctx.fillStyle=C.text;ctx.font=font(10.5,700);ctx.fillText(pct(b[0]),x+15,py(b[0])-4);});
   ctx.font=font(11);ctx.fillStyle=(o.te-o.fresh)>.02?C.eye:C.muted;ctx.fillText('차이 '+(o.te-o.fresh>=0?'+':'')+fx((o.te-o.fresh)*100,1)+'%p',cx,bt+32);});
  if(!res){ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.font=font(12);ctx.fillText(busy?'계산 중…':'▶ 여덟 판 돌리기',(l+r)/2,(tp+bt)/2);}
  stamp(ctx,Wd,'예시 데이터 · 8판 평균');}
 $('leakRun').addEventListener('click',async function(){if(busy)return;busy=true;this.disabled=true;var acc_=[[0,0],[0,0],[0,0]],N=8;
  for(var s=1;s<=N;s++){$('leakInfo').textContent='계산 중… '+s+'/'+N+'판';draw();await wait(16);var W=FAIR.world(3000+s),o=[FAIR.proper(W),FAIR.leakPre(W),FAIR.leakTest(W)];o.forEach(function(q,i){acc_[i][0]+=q.te/N;acc_[i][1]+=q.fresh/N;});}
  res=acc_.map(function(a){return {te:a[0],fresh:a[1]}});busy=false;this.disabled=false;this.textContent='▶ 다시 돌리기';draw();
  var g=res.map(function(o){return (o.te-o.fresh)*100});
  $('leakInfo').innerHTML='올바른 절차는 시험과 배포 뒤의 차이가 '+fx(g[0],1)+'%p다. <b>누수 ②</b>는 시험 점수가 '+fx(g[2],1)+'%p 부풀었다. 스무 번 고르는 동안 시험 장부 40건에 우연히 잘 맞는 설정이 뽑힌 것이다. <b>누수 ①</b>은 이번 데이터에서 '+fx(g[1],1)+'%p로 작다. 쓸모 있는 특징 셋이 워낙 뚜렷해서다. 표본이 적고 특징이 많을수록, 쓸모 있는 신호가 약할수록 이 누수는 커진다.';});
 draw();onRedraw(draw);})();

/* ── 담판: 금고를 몇 번 열었나 ── */
function traceChart(cv,trace,pick,H){var Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=38,r=Wd-10,tp=12,bt=H-26;ctx.clearRect(0,0,Wd,H);
  function px(m){return l+(m-1)/19*(r-l)}function py(a){return bt-(a-.6)/.4*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='right';[.6,.8,1].forEach(function(v){ctx.fillText(pct(v,0),l-4,py(v)+4);});
  ctx.textAlign='center';[1,5,10,15,20].forEach(function(v){ctx.fillText(v,px(v),bt+14);});ctx.fillText('특징 수 m (시험 점수를 보며 스무 번 바꿈)',(l+r)/2,H-2);
  ctx.strokeStyle=C.c_robo;ctx.lineWidth=2;ctx.beginPath();trace.forEach(function(q,i){i?ctx.lineTo(px(q[0]),py(q[1])):ctx.moveTo(px(q[0]),py(q[1]));});ctx.stroke();
  trace.forEach(function(q){circ(ctx,px(q[0]),py(q[1]),q[0]===pick?6:2.6,q[0]===pick?C.eye:C.c_robo);});}
Duel('d11',{title:'금고 속 장부를 몇 번 열었나',q:'대출 상환 데이터 200건(특징 200개). 훈련 120 · 검증 40 · 시험 40으로 나누고, 특징을 몇 개 쓸지(m) 골라 로지스틱 회귀를 만든다. 두 세력은 시험 정확도를 보고하고, 대부는 배포 뒤 새 데이터 1,000건으로 따로 잰다.',
 fly:['교차 검증으로 고르고, 시험은 한 번','금고는 마지막에 한 번만 열어.'],robo:['시험 점수가 오를 때까지 다시','시험 정확도 97%! 숫자가 말해 준다.'],roboMood:'tux',
 run:async function(p){p(.2);await wait(60);var W=DUELW,a=PICK,b=FAIR.leakAll(W);p(1);
  var ga=(a.te-a.fresh)*100,gb=(b.te-b.fresh)*100;
  return {winner:(b.te>a.te&&b.fresh<a.fresh)?'x':(b.fresh>a.fresh?'r':'f'),
   measure:'보고한 시험 정확도는 Money-Robo 쪽 '+pct(b.te)+', 초파리 쪽 '+pct(a.te)+'예요. 그런데 배포 뒤 새 데이터 1,000건에서는 초파리 쪽 '+pct(a.fresh)+', Money-Robo 쪽 '+pct(b.fresh)+'예요. Money-Robo는 전체 데이터로 특징 순위를 정하고 시험 점수를 보며 m을 스무 번 바꿨어요(고른 m = '+b.m+'). 보고한 점수와 실제의 차이는 초파리 쪽 '+fx(ga,1)+'%p, Money-Robo 쪽 '+fx(gb,1)+'%p예요.',
   verdict:'시험지를 보며 공부한 점수는 점수가 아니다. 금고를 스무 번 연 쪽은 보고한 숫자부터 믿을 수 없다. Money-Robo 실격.',key:'금고 속 장부는 마지막에 한 번만 연다.',
   render:function(box){box.innerHTML=statGrid([[pct(a.te),'초파리 · 보고한 시험 정확도','f'],[pct(a.fresh),'초파리 · 배포 뒤 1,000건','f'],[pct(b.te),'Money-Robo · 보고한 시험 정확도','r'],[pct(b.fresh),'Money-Robo · 배포 뒤 1,000건','r']])+
    '<figure style="margin:12px 0 0"><canvas class="fig" id="d11Cv" aria-label="Money-Robo가 m을 1부터 20까지 바꿔 가며 본 시험 정확도 곡선과 고른 점"></canvas><figcaption class="muted" style="font-size:13px">Money-Robo가 본 시험 점수 스무 개. 빨간 점이 고른 설정이다. 시험 40건에서 한 건은 2.5%p라, 우연히 잘 맞은 설정이 꼭대기에 오른다.</figcaption></figure>';
    function dr(){traceChart($('d11Cv'),b.trace,b.m,190);}setTimeout(dr,0);onRedraw(dr);}};},
 alts:[{label:'기준선과 나란히 보면?',run:async function(box){var b=FAIR.leakAll(DUELW);
   box.innerHTML=statGrid([[pct(BASE.fresh),'기준이 · 다 "상환" · 배포 뒤'],[pct(PICK.fresh),'초파리 · 배포 뒤','f'],[pct(b.fresh),'Money-Robo · 배포 뒤','r']])+say('asst','ledger','둘 다 기준이('+pct(BASE.fresh)+')보다는 훨씬 높아요. 모델 자체는 둘 다 쓸 만해요. 문제는 Money-Robo가 <b>보고한 숫자</b>예요. '+pct(b.te)+'라고 적었는데 실제는 '+pct(b.fresh)+'였어요.');}},
  {label:'데이터를 열 번 새로 뽑으면?',run:async function(box){var s=[0,0,0,0],N=10;for(var i=1;i<=N;i++){box.innerHTML='<p class="muted">계산 중… '+i+'/'+N+'판</p>';await wait(16);var W=FAIR.world(2000+i),c=FAIR.cvPick(W,5),l=FAIR.leakAll(W);s[0]+=c.te/N;s[1]+=c.fresh/N;s[2]+=l.te/N;s[3]+=l.fresh/N;}
   box.innerHTML=statGrid([[pct(s[0]),'초파리 · 시험 (10판 평균)','f'],[pct(s[1]),'초파리 · 배포 뒤','f'],[pct(s[2]),'Money-Robo · 시험','r'],[pct(s[3]),'Money-Robo · 배포 뒤','r']])+say('fly','magnify','열 판 평균으로 봐도 같아. 금고를 여러 번 연 쪽은 보고한 점수가 '+fx((s[2]-s[3])*100,1)+'%p 부풀었고, 배포 뒤 점수는 오히려 '+(s[3]<s[1]?'내 쪽보다 낮아':'내 쪽과 비슷해')+'. 내 쪽 차이는 '+fx((s[0]-s[1])*100,1)+'%p.');}}]});

/* ══ 확인 문제 ══ */
var QUIZ={q11:[
 {q:'검증 데이터와 시험 데이터를 따로 두는 까닭은?',o:[['검증 점수로 설정을 여러 번 고르면 그 과정이 검증 데이터에 맞춰지기 때문에',1,'고르는 데 한 번도 쓰지 않은 장부(시험)가 있어야 마지막 점수를 믿을 수 있다.'],['데이터가 많을수록 좋아서',0,'양의 문제가 아니라 쓰임새의 문제다. 오히려 데이터를 세 몫으로 나누면 훈련 몫이 준다.'],['시험 데이터는 정답이 없어서',0,'시험 데이터에도 정답이 있다. 다만 마지막까지 열지 않을 뿐이다.']]},
 {q:'"정확도 90%"라는 보고를 들었을 때 가장 먼저 물어볼 것은?',o:[['기준선은 몇 %인가',1,'정답이 한쪽으로 쏠려 있으면 다 찍기만 해도 90%가 나온다. 4-12에서 이 함정을 본다.'],['어떤 프로그래밍 언어로 만들었나',0,'점수의 뜻과는 상관없다.'],['모델의 크기가 얼마인가',0,'크기는 비용 문제다(4-15). 점수가 의미 있는지는 기준선과 비교해야 안다.']]},
 {q:'시험 점수를 보며 설정을 스무 번 바꿔 가장 높은 것을 고르면?',o:[['시험 점수가 실제보다 부풀어 오른다',1,'우연히 시험 장부에 잘 맞은 설정이 뽑힌다. 담판에서 보고 점수와 배포 뒤 점수의 차이로 확인했다.'],['시험 점수가 실제보다 낮아진다',0,'반대다. 가장 높은 것을 고르므로 부풀어 오른다.'],['아무 문제 없다. 설정은 많이 시험할수록 좋다',0,'많이 시험하는 것 자체는 좋다. 다만 그 고르기는 검증(또는 교차 검증)으로 해야 한다.']]}]};

var PROMPTS=[
 {t:'① 내 파이프라인의 누수 점검',use:'모델 점수가 너무 좋아 보일 때',p:'아래는 내 머신러닝 코드다. 데이터 누수가 생길 수 있는 지점을 모두 찾아 줘.\n\n〔코드 붙여넣기〕\n\n특히 1) 데이터를 나누기 전에 전체로 한 전처리(표준화, 결측치 채우기, 특징 고르기) 2) 시험 데이터로 설정을 고른 흔적 3) 미래 정보가 섞인 특징(예: 결과가 난 뒤에야 알 수 있는 값) 4) 같은 사람·같은 원본에서 나온 행이 훈련과 시험에 갈려 들어간 경우를 확인해 줘. 고친 코드는 scikit-learn의 Pipeline으로 다시 써 줘.'},
 {t:'② 기준선 먼저 만들기',use:'새 문제를 시작할 때',p:'〔예) 고객 이탈 예측, 다음 주 판매량 예측〕 문제의 기준선을 만들어 줘. 분류면 가장 많은 쪽으로 다 찍기, 회귀면 평균(또는 중앙값), 시계열이면 "어제 값"과 "작년 같은 날 값"을 각각 계산하고, 내 모델 점수와 한 표에 나란히 보여 주는 코드를 짜 줘. 데이터: 〔설명〕'},
 {t:'③ 교차 검증으로 설정 고르기',use:'데이터가 적어 검증 몫을 따로 떼기 아까울 때',p:'훈련 데이터로 5겹 교차 검증을 해서 하이퍼파라미터를 고르고, 시험 데이터는 맨 마지막에 한 번만 쓰는 코드를 짜 줘. GridSearchCV와 Pipeline을 써서 전처리도 매 겹마다 훈련 몫으로만 맞추게 해 줘. 각 설정의 평균과 표준편차 표도 보여 주고, 고른 설정의 최종 시험 점수를 출력해 줘. 모델: 〔예) 로지스틱 회귀, 규제 세기 C〕'},
 {t:'④ 수업용 누수 시연',use:'학생들에게 누수를 체감시키고 싶을 때',p:'고등학생도 이해할 수 있는 데이터 누수 시연을 기획해 줘. 1) 시험 전에 답안지를 본 학생 비유 2) 정답과 아무 상관 없는 난수 특징 1,000개로 "전체 데이터로 특징 고르기" 누수를 재현하는 Colab 코드(누수 절차는 높은 점수, 올바른 절차는 50% 근처) 3) 학생에게 던질 질문 세 개. 왜 난수 특징만으로도 점수가 오르는지 쉬운 말로 설명해 줘.'}];
var GL=[
 ['데이터','훈련 데이터','모델이 배우는 데 쓰는 데이터.'],['데이터','검증 데이터','설정(하이퍼파라미터)을 고르는 데 쓰는 데이터.'],['데이터','시험 데이터','마지막에 한 번만 열어 실력을 재는 데이터.'],
 ['데이터','배포 뒤 데이터','모델을 실제로 쓰기 시작한 뒤 들어오는 새 데이터. 진짜 실력은 여기서 드러난다.'],
 ['절차','하이퍼파라미터','학습 전에 사람이 정하는 설정. 트리 깊이, 특징 수, 규제 세기 등.'],['절차','교차 검증','데이터를 k등분해 돌아가며 검증으로 쓰고 평균을 내는 방법.'],['절차','표준화','특징마다 평균을 빼고 표준편차로 나눠 크기를 맞추는 일.'],
 ['절차','특징 고르기','쓸모 있어 보이는 특징만 골라 쓰는 일. 전체 데이터로 하면 누수가 된다.'],['절차','파이프라인','전처리와 모델을 한 덩어리로 묶어, 매번 훈련 몫으로만 맞추게 하는 장치.'],
 ['평가','기준선','아무것도 배우지 않은 가장 단순한 답. 모든 모델이 먼저 이겨야 할 점수.'],['평가','데이터 누수','시험 데이터의 정보가 학습이나 고르기에 새어 들어 점수가 부풀어 오르는 일.'],
 ['평가','정확도','맞힌 개수 ÷ 전체 개수.'],['평가','표준편차','값들이 평균에서 얼마나 흩어져 있는지.'],['평가','과적합','훈련 데이터만 외워 처음 보는 데이터에서 틀리는 상태(4-2).'],['평가','시드','난수의 출발점. 같은 시드면 같은 데이터가 나온다.']];
var ANALOGY=[
 ['데이터 누수','시험 전에 답안지를 본 학생',1,'','본인도 모르게 보는 경우가 대부분이다. 전처리 한 줄이 답안지를 펼쳐 놓는다'],
 ['기준선','"내일도 오늘과 같다"는 일기예보관',1,'','단순해 보여도 이기기 어렵다. 시계열에서는 특히 그렇다'],
 ['교차 검증','모의고사를 한 번이 아니라 다섯 번 보고 평균 내기',1,'','다섯 번 모두 같은 문제집에서 나왔다면 평균도 함께 치우친다'],
 ['시험 데이터 봉인','개봉하면 무효가 되는 봉인 봉투',2,'초파리 실험에서도 학습 단계와 시험 단계를 시간으로 나눠, 시험 때 처음 맡는 냄새 조합을 쓴다','실험실은 봉인을 규칙으로 강제하지만, 코드에서는 스스로 지켜야 한다']];
var REFS=[
 'Hastie, T., Tibshirani, R., &amp; Friedman, J. (2009). <i>The Elements of Statistical Learning</i> (2nd ed.), 7장(모델 평가와 선택, 7.10.2 교차 검증의 잘못된 방법과 올바른 방법). Springer.',
 'Kaufman, S., Rosset, S., Perlich, C., &amp; Stitelman, O. (2012). Leakage in data mining: Formulation, detection, and avoidance. <i>ACM Transactions on Knowledge Discovery from Data</i>, 6(4), 15.',
 'Ambroise, C., &amp; McLachlan, G. J. (2002). Selection bias in gene extraction on the basis of microarray gene-expression data. <i>PNAS</i>, 99(10), 6562–6566. — 전체 데이터로 특징을 고르는 누수',
 'Cawley, G. C., &amp; Talbot, N. L. C. (2010). On over-fitting in model selection and subsequent selection bias in performance evaluation. <i>Journal of Machine Learning Research</i>, 11, 2079–2107.',
 'Varma, S., &amp; Simon, R. (2006). Bias in error estimation when using cross-validation for model selection. <i>BMC Bioinformatics</i>, 7, 91. — 중첩 교차 검증'];
var TIP={who:'모델을 한 번 이상 만들어 본 학습자. 4-2의 훈련·검증을 읽었으면 좋다',goal:'① 훈련·검증·시험의 쓰임새를 구별한다 ② 교차 검증의 평균과 흩어짐을 읽는다 ③ 문제에 맞는 기준선을 세운다 ④ 누수가 생기는 절차를 찾아낸다',time:'읽기 15분 · 누수 실험과 담판 10분 · Colab 10분',
 plans:[['강의형 30분','01장 애니메이션으로 금고 셋 5분 → 03장 기준선 세 가지 5분 → 04장 여덟 판 돌리기 10분 → 담판을 열기 전에 "누가 이길까" 손 들기 10분.'],['실무 OJT 60분','팀의 실제 학습 코드를 프롬프트 ①로 점검 30분 → 찾은 누수를 Pipeline으로 고치고 점수 다시 재기 20분 → 공유 10분.'],['1:1 튜터링','학습자가 만든 모델의 보고서를 함께 읽으며 "기준선은?", "시험은 몇 번 열었나?" 두 질문에 답하게 한다.']],
 myths:[['시험 점수가 높으면 좋은 모델이다','시험을 몇 번 열었는지에 따라 같은 숫자도 뜻이 달라진다'],['전처리는 누수와 상관없다','전체 데이터로 한 표준화·특징 고르기도 누수다. 특징이 많고 표본이 적을수록 크다'],['기준선은 너무 쉬워서 볼 필요 없다','쏠린 데이터나 시계열에서는 기준선이 의외로 높다']]};
var CODE={title:'올바른 절차와 누수 절차',sub:'담판 재현 · numpy, scikit-learn · CPU 몇 초',file:'fair_rules_leakage',
 desc:'04장과 담판을 옮겼다. 특징 200개 가운데 셋만 쓸모 있는 데이터를 만들고, 올바른 절차(Pipeline + 교차 검증, 시험 한 번)와 누수 절차(전체로 특징 고르기, 시험 점수로 설정 고르기)의 시험 점수와 배포 뒤 점수를 비교한다. 정답과 아무 상관 없는 난수 특징만으로 누수를 재현하는 실험도 붙였다.',
 cap:'실행 결과 (scikit-learn 1.x, CPU). 데이터 규칙은 브라우저와 같지만 난수 생성기와 로지스틱 회귀 풀이가 달라 숫자는 조금 다르다. 결론(누수 절차는 보고 점수가 배포 뒤 점수보다 부풀어 오른다)은 같다.'};
