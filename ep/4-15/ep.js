/* ══ 4-15 마지막 담판 ════════════════════════════════════════════ */
/* 담판과 01장 저울이 같은 계산 결과를 쓴다 (한 번만 계산) */
var FINP=null;function finResult(p){if(!FINP)FINP=FIN.duel(p);return FINP;}

/* ── 히어로: 저울 ── */
heroStage($('heroCv'),{bg:'sc_scale',bgY:0,fly:'magnify',robo:'calc',motif:function(ctx,t,W,H){var C=cols(),cx=W/2,cy=96,ang=Math.sin(t*.8)*.08;
  ctx.fillStyle='rgba(15,13,11,.78)';rr(ctx,290,26,520,262,16);ctx.fill();
  ctx.strokeStyle='#d4a54a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,250);ctx.stroke();ctx.fillStyle='#d4a54a';ctx.fillRect(cx-46,248,92,10);
  ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-190,0);ctx.lineTo(190,0);ctx.stroke();ctx.restore();
  circ(ctx,cx,cy,9,'#d4a54a');
  [[-1,'초파리 · 로지스틱',['설명','속도']],[1,'Money-Robo · 큰 앙상블',['성능']]].forEach(function(s){var px=cx+s[0]*190*Math.cos(ang),py=cy+s[0]*190*Math.sin(ang);
    ctx.strokeStyle=rgba('#d4a54a',.7);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-44,py+70);ctx.moveTo(px,py);ctx.lineTo(px+44,py+70);ctx.stroke();
    ctx.fillStyle=rgba('#d4a54a',.85);rr(ctx,px-56,py+70,112,10,5);ctx.fill();
    s[2].forEach(function(w,i){ctx.fillStyle=s[0]<0?'rgba(208,83,63,.9)':'rgba(111,183,180,.9)';rr(ctx,px-44+i*48,py+42,42,26,6);ctx.fill();ctx.font=font(12,700);ctx.fillStyle='#0f0d0b';ctx.textAlign='center';ctx.fillText(w,px-23+i*48,py+60);});
    ctx.font=font(12.5,700);ctx.fillStyle=s[0]<0?'#ff9a86':'#8fd6d2';ctx.textAlign='center';ctx.fillText(s[1],px,py+104);});
  ctx.font=font(14,700);ctx.fillStyle='#efe6d8';ctx.textAlign='center';ctx.fillText('성능 · 비용 · 설명의 저울',cx,52);}});

/* ── 01 결승 저울 ── */
(function(){var cv=$('scaleCv'),wv=$('wCv'),R=null,Wt={p:1,c:1,e:1},tilt=0,target=0;
 var PRE={loan:{p:1,c:1,e:3,t:'대출 심사: 거절 이유를 고객에게 설명해야 한다'},reco:{p:3,c:1,e:0.5,t:'상품 추천: 조금이라도 더 맞히는 것이 매출이다'},even:{p:1,c:1,e:1,t:'세 칸에 같은 무게'}};
 function sides(){if(!R)return [0,0,0];return [R.ea>R.la?-1:(R.ea<R.la?1:0),R.lp<R.ep?1:-1,1];}/* +1 초파리 쪽, −1 Money-Robo 쪽 */
 function score(){var s=sides();return Wt.p*s[0]+Wt.c*s[1]+Wt.e*s[2];}
 function draw(){var H=300,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols();ctx.clearRect(0,0,Wd,H);var cx=Wd/2,cy=70;
  ctx.strokeStyle=C.amber;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,H-40);ctx.stroke();ctx.fillStyle=C.amber;ctx.fillRect(cx-50,H-42,100,10);
  var L=Math.min(260,Wd*0.36),a=tilt;ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();ctx.moveTo(-L,0);ctx.lineTo(L,0);ctx.stroke();ctx.restore();circ(ctx,cx,cy,8,C.amber);
  [[-1,'초파리 · 로지스틱',C.c_fly],[1,'Money-Robo · 큰 앙상블',C.c_robo]].forEach(function(s){var px=cx+s[0]*L*Math.cos(a),py=cy+s[0]*L*Math.sin(a);
   ctx.strokeStyle=rgba(C.amber,.7);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-48,py+80);ctx.moveTo(px,py);ctx.lineTo(px+48,py+80);ctx.stroke();ctx.fillStyle=rgba(C.amber,.8);rr(ctx,px-60,py+80,120,9,4);ctx.fill();
   var sd=sides(),names=['성능','비용','설명'],k=0;sd.forEach(function(v,i){var w=[Wt.p,Wt.c,Wt.e][i];if((s[0]<0&&v>0)||(s[0]>0&&v<0)){if(w<=0)return;var hh=10+w*9;ctx.fillStyle=rgba(s[2],.85);rr(ctx,px-52+k*36,py+80-hh,32,hh,4);ctx.fill();ctx.font=font(10.5,700);ctx.fillStyle=C.text;ctx.textAlign='center';ctx.fillText(names[i],px-36+k*36,py+74-hh);k++;}});
   ctx.font=font(12.5,700);ctx.fillStyle=s[2];ctx.textAlign='center';ctx.fillText(s[1],px,py+108);});
  var sc=score();ctx.font=font(13,700);ctx.fillStyle=C.text;ctx.textAlign='center';ctx.fillText(!R?'저울에 올리는 중…':(Math.abs(sc)<0.01?'저울이 수평이다':(sc>0?'초파리 쪽으로 기운다':'Money-Robo 쪽으로 기운다')),cx,24);
  stamp(ctx,Wd,'예시 데이터');}
 function drawW(){if(!R)return;var H=200,Wd=fit(wv,H),ctx=wv.getContext('2d'),C=cols(),l=110,r=Wd-20,mid=(l+r)/2,mx=2.2;ctx.clearRect(0,0,Wd,H);
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(mid,6);ctx.lineTo(mid,H-6);ctx.stroke();
  FIN.FEAT.forEach(function(f,i){var y=12+i*23,v=R.w[i],x=mid+v/mx*(r-mid);ctx.fillStyle=v>=0?rgba(C.gfp,.8):rgba(C.eye,.8);ctx.fillRect(Math.min(mid,x),y,Math.abs(x-mid),15);
   ctx.font=font(12);ctx.fillStyle=C.text;ctx.textAlign='right';ctx.fillText(f,l-8,y+12);ctx.textAlign=v>=0?'left':'right';ctx.fillStyle=C.muted;ctx.fillText(fx(v,2),x+(v>=0?5:-5),y+12);});}
 function ui(){var s=score();target=Math.max(-.22,Math.min(.22,-s*.05));
  $('scaleInfo').innerHTML=R?statGrid([[pct(R.la),'초파리 · 로지스틱 · 검증 정확도','f'],[pct(R.ea),'Money-Robo · 큰 앙상블 · 검증 정확도','r'],[fx(R.lp,2)+' µs','로지스틱 · 예측 1건','f'],[fx(R.ep,1)+' µs','앙상블 · 예측 1건','r'],[fx(R.tl,0)+' ms','로지스틱 · 학습','f'],[fx(R.te,0)+' ms','앙상블 · 학습','r'],['9개','로지스틱이 기억하는 숫자 (가중치 8 + 절편)','f'],[R.size.e.toLocaleString()+'개','앙상블의 질문·잎 수','r']]):'<p class="muted">계산 중…</p>';
  ['p','c','e'].forEach(function(k){$('w_'+k).value=Wt[k];$('wv_'+k).textContent=Wt[k];});}
 onTick(cv,function(dt){var d=target-tilt;if(Math.abs(d)>1e-4){tilt+=d*Math.min(1,dt*6);draw();}});
 ['p','c','e'].forEach(function(k){$('w_'+k).addEventListener('input',function(){Wt[k]=+this.value;$('ownerInfo').textContent='직접 정한 무게';document.querySelectorAll('#owner button').forEach(function(b){b.setAttribute('aria-pressed','false')});ui();draw();});});
 seg('#owner button',function(v){var p=PRE[v];Wt={p:p.p,c:p.c,e:p.e};$('ownerInfo').textContent=p.t;ui();draw();});
 $('ownerInfo').textContent=PRE.even.t;ui();draw();onRedraw(function(){draw();drawW();});
 setTimeout(function(){finResult().then(function(o){R=o;ui();draw();drawW();});},300);})();

/* ── 02 알고리즘 선택 지도 ── */
var MAPQ={
 start:{q:'정답 y가 있나?',o:[['예, 데이터마다 정답이 붙어 있다','num'],['아니요, 데이터만 있다','uns'],['정답 대신 행동 뒤에 보상이 온다','rl']]},
 num:{q:'정답 y가 숫자인가?',o:[['예, 금액·온도처럼 숫자다','reg'],['아니요, 이름표(예/아니요, 종류)다','cls']]},
 cls:{q:'표 데이터에서 성능이 가장 중요한가?',o:[['예, 조금이라도 더 맞혀야 한다','boost'],['설명과 속도도 함께 중요하다','clsend']]},
 uns:{q:'무엇을 하고 싶나?',o:[['비슷한 것끼리 묶고 싶다','clu'],['한눈에 보거나 특징 수를 줄이고 싶다','dim']]}};
var MAPE={
 reg:{t:'회귀',ep:'4-6_regression_seven.html',n:'4-6 회귀파 일곱',s:'선형 회귀로 기준선을 잡고, 휘어 있으면 트리·GBM 회귀를 견줘 본다. 특징이 많으면 Lasso·Ridge.'},
 clsend:{t:'분류',ep:'4-7_classification_eight.html',n:'4-7 분류파 여덟',s:'로지스틱 회귀로 기준선을 잡고, 경계가 휘었으면 랜덤 포레스트·KNN·RBF SVM을 견줘 본다.'},
 boost:{t:'부스팅 계열',ep:'4-10_ensemble_lineage.html',n:'4-10 앙상블 계보',s:'로지스틱 기준선 → 랜덤 포레스트 → GBM(XGBoost·LightGBM·CatBoost) 순으로 올라가며 검증 점수를 비교한다.'},
 clu:{t:'군집',ep:'4-8_unsupervised_nine.html',n:'4-8 비지도 아홉',s:'K-Means로 시작하고, 무리 모양이 둥글지 않으면 DBSCAN, 확률이 필요하면 GMM. 무리 수는 4-13의 지표로 고른다.'},
 dim:{t:'차원 축소',ep:'4-8_unsupervised_nine.html#m3',n:'4-8 비지도 아홉 · 03',s:'PCA로 시작한다. 그림으로 보기만 할 거라면 t-SNE·UMAP, 단 무리 간격은 믿지 않는다(4-13).'},
 rl:{t:'강화학습',ep:'4-9_rl_three.html',n:'4-9 강화 삼대',s:'상태가 작으면 Q 표, 크면 근사(DQN 계열), 행동이 연속이거나 안정이 중요하면 PPO 계열. 보상 설계부터 따진다(4-14).'}};
(function(){var host=$('pathBox'),trail=[];
 function render(id){var node=MAPQ[id];
  var tr='<div class="trail">'+trail.map(function(s){return '<span>'+s+'</span>';}).join('<i>›</i>')+'</div>';
  if(node){host.innerHTML=tr+'<p class="qq">'+node.q+'</p><div class="pills qopts">'+node.o.map(function(o){return '<button data-next="'+o[1]+'" data-lab="'+o[0]+'">'+o[0]+'</button>';}).join('')+'</div>'+(trail.length?'<button class="btn" id="mapBack" style="margin-top:10px">처음부터</button>':'');}
  else{var e=MAPE[id];host.innerHTML=tr+'<div class="endcard"><span class="tag">도착 · '+e.t+'</span><p style="margin:6px 0"><b>처음 시도하기 좋은 출발점.</b> '+e.s+'</p><p style="margin:0"><a href="'+e.ep+'">'+e.n+' 신상 파일로 →</a></p></div>'+
   '<p class="muted" style="margin:12px 0 4px">어느 길로 왔든 다음은 같다.</p><div class="evalpath"><a href="4-11_fair_rules.html">공정하게 잰다 · 4-11</a><i>→</i><a href="'+(id==='rl'?'4-14_rl_metrics.html':(id==='clu'||id==='dim'?'4-13_unsupervised_metrics.html':'4-12_supervised_metrics.html'))+'">맞는 지표로 · '+(id==='rl'?'4-14':(id==='clu'||id==='dim'?'4-13':'4-12'))+'</a><i>→</i><a href="#m1">저울에 올린다 · 4-15</a></div><button class="btn" id="mapBack" style="margin-top:12px">처음부터</button>';}
  var b=$('mapBack');if(b)b.addEventListener('click',function(){trail=[];render('start');});}
 host.addEventListener('click',function(e){var b=e.target.closest('[data-next]');if(!b)return;trail.push(b.getAttribute('data-lab'));render(b.getAttribute('data-next'));});
 render('start');})();

/* ── 04 시즌 결산과 포스터 ── */
function renderRecap(){var rows=EPISODES.map(function(e,i){var w=e.n===EP.n?(SCORE.mine||''):e.plan;return '<tr><td><a href="'+e.f+'">'+e.n+'</a></td><td>'+e.t+'</td><td>'+FIN.RECAP[e.n]+'</td><td class="wcell">'+(w?winIcon(w)+(w==='x'?' <span class="dq">실격승</span>':''):'<span class="muted">장부 열기 전</span>')+'</td></tr>';});
 $('recap').innerHTML='<div class="tw"><table class="tb"><thead><tr><th>구역</th><th>제목</th><th>담판</th><th>차지한 쪽</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
 var p=prevTotals(),f=p.f,r=p.r,d=p.d,w=SCORE.mine;if(w==='f'||w==='x')f++;else if(w==='r')r++;else if(w==='d')d++;
 $('finalScore').innerHTML=statGrid([[f,'초파리 쪽 구역','f'],[r,'Money-Robo 쪽 구역','r'],[d,'나눠 가진 구역'],[w?'15 / 15':'14 / 15','장부를 연 구역']]);}
(function(){var fc={sup:'var(--fam-sup)',uns:'var(--fam-uns)',rl:'var(--fam-rl)',ens:'var(--fam-ens)'},fn={sup:'지도 가문',uns:'비지도 가문',rl:'강화 가문',ens:'앙상블 연합'},file={};EPISODES.forEach(function(e){file[e.n]=e.f;});
 $('poster').innerHTML=FIN.POSTER.map(function(g){return '<div class="pgrp" style="--fc:'+fc[g.fam]+'"><div class="ph"><b>'+g.p+'</b><span>'+fn[g.fam]+' · <a href="'+file[g.ep]+'">'+g.ep+'</a></span></div><div class="pcells">'+
  g.m.map(function(m){var dbl=m.slice(-1)==='*',nm=dbl?m.slice(0,-1):m;return '<a class="pcell" href="'+file[g.ep]+'">'+nm+(dbl?'<span class="dbl" title="두 가문에 몸담은 조직원">두 가문</span>':'')+'</a>';}).join('')+'</div></div>';}).join('');
 var n=FIN.POSTER.reduce(function(a,g){return a+g.m.length},0);$('posterN').textContent=n;
 $('printBtn').addEventListener('click',function(){window.print();});
 renderRecap();})();

/* ── 담판: 배포할 모델 ── */
Duel('d15',{title:'대출 심사에 어떤 모델을 배포할까',q:'대출 800건(특징 8개, 잘못 적힌 정답 3%)으로 배우고 240건으로 잰다. 데이터를 세 벌 만들어 평균한다. 정확도만이 아니라 예측 속도와 설명 가능성까지 저울에 올린다. 어느 쪽으로 기울까?',
 fly:['로지스틱 회귀','조금 덜 맞혀도 왜 거절했는지 말할 수 있어야지.'],robo:['큰 앙상블 (GBM 두 벌 + 랜덤 포레스트)','가장 잘 맞히는 놈을 배포한다. 투자는 성능에.'],roboMood:'calc',
 run:async function(p){var o=await finResult(p);
  var perf=o.ea>=o.la,fast=o.lp<o.ep,w=perf&&fast?'d':(perf?'r':'f');
  return {winner:w,measure:'세 벌 평균 검증 정확도는 Money-Robo 쪽 앙상블 '+pct(o.ea)+', 초파리 쪽 로지스틱 '+pct(o.la)+'예요. 차이는 '+fx((o.ea-o.la)*100,1)+'%p예요. 대신 예측 1건에 앙상블은 '+fx(o.ep,1)+'µs, 로지스틱은 '+fx(o.lp,2)+'µs로 약 '+Math.round(o.ep/o.lp)+'배 차이가 나고, 학습도 '+fx(o.te,0)+'ms 대 '+fx(o.tl,0)+'ms예요. 로지스틱은 숫자 9개로 이유를 설명하지만, 앙상블은 질문·잎이 '+o.size.e.toLocaleString()+'개라 따로 설명 도구가 필요해요.',
   verdict:'성능은 Money-Robo, 속도와 설명은 초파리다. 성능이 중요한 추천이라면 Money-Robo, 결정 이유를 설명해야 하는 심사라면 초파리다. 무엇이 중요한지는 문제의 주인이 정한다. 이 구역은 나눠 갖는다.',key:'배포할 모델은 성능 · 비용 · 설명의 저울로 고른다.',
   render:function(box){box.innerHTML=statGrid([[pct(o.la),'초파리 · 검증 정확도','f'],[pct(o.ea),'Money-Robo · 검증 정확도','r'],[fx(o.lp,2)+' µs','초파리 · 예측 1건','f'],[fx(o.ep,1)+' µs','Money-Robo · 예측 1건','r']])+
    '<div class="tw" style="margin-top:10px"><table class="tb"><thead><tr><th>데이터</th><th>로지스틱</th><th>큰 앙상블</th></tr></thead><tbody>'+o.rows.map(function(r){return '<tr><td>'+r[0]+'번째 벌</td><td>'+pct(r[1])+'</td><td>'+pct(r[2])+'</td></tr>';}).join('')+'</tbody></table></div>';setTimeout(renderRecap,0);}};},
 alts:[{label:'설명이 꼭 필요하다면? (대출 심사)',run:async function(box){var o=await finResult();
   box.innerHTML=statGrid([['성능','Money-Robo 쪽 (+'+fx((o.ea-o.la)*100,1)+'%p)','r'],['속도','초파리 쪽 (약 '+Math.round(o.ep/o.lp)+'배 빠름)','f'],['설명 ×3','초파리 쪽 (가중치 9개)','f']])+say('fly','tip','거절당한 고객에게 "소득 가중치 '+fx(o.w[0],2)+', 부채 비율 '+fx(o.w[1],2)+'"처럼 이유를 댈 수 있어. 저울은 내 쪽이야.')+say('robo','sigh',''+fx((o.ea-o.la)*100,1)+'%p를 포기하는 셈이군. 설명 도구를 붙이면 되지 않나? …비용이 또 드는군.');}},
  {label:'추천 시스템이라면?',run:async function(box){var o=await finResult();
   box.innerHTML=statGrid([['성능 ×3','Money-Robo 쪽','r'],['속도','초파리 쪽','f'],['설명 ×0.5','초파리 쪽','f']])+say('robo','happy','상품 추천은 한 건 한 건 설명할 필요가 적지. '+fx((o.ea-o.la)*100,1)+'%p가 곧 매출이야. 저울은 내 쪽!')+say('fly','coffee','예측 1건 '+fx(o.ep,1)+'µs면 아직은 버틸 만하네. 인정. 그래도 기준선으로 로지스틱은 꼭 같이 돌려.');}}]});

/* ══ 확인 문제 ══ */
var QUIZ={q15:[
 {q:'담판에서 앙상블이 정확도가 더 높은데도 "나눠 가짐"이 된 까닭은?',o:[['배포는 성능 · 비용 · 설명을 함께 따지고, 무게는 문제마다 다르기 때문',1,'성능은 앙상블, 속도와 설명은 로지스틱이 앞섰다. 어느 쪽이 중요한지는 문제의 주인이 정한다.'],['차이가 작아 통계적으로 같기 때문',0,'차이가 작은 것도 사실이지만, 판정의 까닭은 저울의 다른 두 칸이다.'],['로지스틱이 더 최신 모델이기 때문',0,'로지스틱 회귀는 오래된 모델이다. 최신인지는 기준이 아니다.']]},
 {q:'정답 y가 없고 비슷한 고객끼리 묶고 싶다. 선택 지도에서 가는 곳은?',o:[['군집 (4-8), 무리 수는 4-13의 지표로',1,'정답이 없으니 비지도 가문, 묶기는 군집파다.'],['분류 (4-7)',0,'분류에는 정답 이름표가 있어야 한다.'],['강화학습 (4-9)',0,'강화학습은 행동 뒤에 보상이 오는 문제다.']]},
 {q:'다섯 줄 체크리스트에 없는 것은?',o:[['가장 최신 알고리즘을 먼저 고른다',1,'체크리스트는 공정한 측정과 맞는 지표, 저울에 관한 것이다. 출발점은 오히려 단순한 기준선이다.'],['시험 데이터는 마지막에 한 번만, 기준선과 함께',0,'① 4-11의 체크다.'],['쏠린 데이터에는 정밀도·재현율',0,'② 4-12의 체크다.']]}]};

var PROMPTS=[
 {t:'① 배포 후보 저울표 만들기',use:'모델 두세 개 중 무엇을 배포할지 정할 때',p:'아래 후보 모델들을 배포 관점에서 비교하는 표를 만들어 줘.\n\n- 후보: 〔예) 로지스틱 회귀, 랜덤 포레스트, LightGBM〕\n- 데이터: 〔설명〕\n- 업무: 〔예) 대출 심사, 거절 이유를 고객에게 알려야 함〕\n\n칸은 검증 성능(같은 분할, 교차 검증 평균과 표준편차), 학습 시간, 예측 1건 시간, 모델 크기, 설명 방법(계수/특징 중요도/SHAP 등)으로 하고, 업무에 맞춰 각 칸의 무게를 제안한 뒤 결론을 내 줘. 시간을 재는 파이썬 코드도 붙여 줘.'},
 {t:'② 내 문제로 선택 지도 따라가기',use:'어떤 알고리즘 가문부터 볼지 막막할 때',p:'내 문제를 설명할 테니 알고리즘 선택 순서를 정해 줘. 1) 정답이 있는지, 숫자인지 이름표인지, 보상인지 판단 2) 처음 시도할 기준선 모델 3) 그다음 견줄 후보 둘 4) 쓸 평가 지표와 데이터 나누는 법. 단정하지 말고 "출발점"으로 제안해 줘.\n\n내 문제: 〔예) 매장별 다음 주 판매량을 예측하고 싶다. 지난 2년 기록이 있다〕'},
 {t:'③ 블랙박스 모델 설명 붙이기',use:'성능 때문에 앙상블을 골랐지만 설명도 필요할 때',p:'〔예) LightGBM〕 모델의 예측을 설명하는 방법을 비교해 줘. 전역 설명(특징 중요도, 부분 의존 그림)과 개별 설명(SHAP, LIME)의 차이, 각각의 함정(상관된 특징, 불안정성)을 표로 정리하고, scikit-learn과 shap 라이브러리로 개별 고객 한 명의 예측을 설명하는 예시 코드를 써 줘. 설명 도구의 결과를 그대로 믿으면 안 되는 경우도 알려 줘.'},
 {t:'④ 시리즈 복습 수업 설계',use:'15편을 한 번에 정리하는 수업을 열 때',p:'머신러닝 알고리즘을 네 가문(지도·비지도·강화·앙상블)과 34개 알고리즘으로 정리한 시리즈를 복습하는 90분 수업을 설계해 줘. 1) 선택 지도를 학생이 직접 그려 보는 활동 2) 다섯 줄 체크리스트(시험 데이터 한 번, 쏠린 데이터의 정밀도·재현율, 군집 수는 지표로, 강화학습은 실제 목표도, 성능·비용·설명의 저울)로 사례를 채점하는 활동 3) 마무리 퀴즈 5문항.'}];
var GL=[
 ['선택','기준선 모델','가장 단순한 모델. 모든 후보는 이것부터 이겨야 한다.'],['선택','앙상블','여러 모델의 예측을 묶어 하나로 내는 방법.'],
 ['선택','배포','만든 모델을 실제 서비스에 넣어 새 데이터에 쓰는 일.'],['비용','학습 시간','모델을 데이터로 훈련하는 데 걸리는 시간.'],['비용','예측 시간','새 데이터 한 건에 답을 내는 데 걸리는 시간. 배포 비용과 직결된다.'],
 ['비용','µs (마이크로초)','100만 분의 1초.'],['설명','설명 가능성','모델이 왜 그 답을 냈는지 사람이 이해할 수 있는 정도.'],['설명','가중치','로지스틱·선형 모델에서 특징마다 곱하는 수. 부호와 크기로 영향 방향을 읽는다.'],
 ['설명','특징 중요도','트리 계열에서 특징이 예측에 얼마나 쓰였는지 매긴 값.'],['설명','SHAP','예측 하나를 특징별 기여로 나눠 보여 주는 설명 방법.'],['설명','LIME','예측 하나 주변에서 단순한 모델을 맞춰 설명하는 방법.'],
 ['평가','검증 정확도','배우는 동안 보여 주지 않은 데이터에서 맞힌 비율.'],['평가','세력도','이 시리즈에서 각 구역 담판의 승자를 모은 점수판.'],['평가','체크리스트','3부 다섯 편의 실전 체크 한 줄씩을 모은 것.']];
var ANALOGY=[
 ['성능·비용·설명의 저울','차를 살 때 성능·연비·정비 쉬움을 함께 따지기',1,'','차는 사는 사람이 정하지만, 모델은 그 결정을 받는 사람(고객)도 이해해야 할 때가 있다'],
 ['설명 가능성','의사가 진단 이유를 말해 주는 것',1,'','설명이 그럴듯해도 틀릴 수 있다. 설명과 정확성은 따로 확인한다'],
 ['선택 지도','처음 가는 길에서 갈림길 표지판',2,'초파리가 냄새 농도 차이로 갈림길에서 방향을 고르는 행동','표지판은 출발점일 뿐, 실제 길은 데이터를 재 보며 고친다'],
 ['시즌 결산','한 해 장부를 덮으며 결산서를 쓰는 일',1,'','장부의 숫자는 재는 방법이 공정했을 때만 의미가 있다(4-11)']];
var REFS=[
 'Rudin, C. (2019). Stop explaining black box machine learning models for high stakes decisions and use interpretable models instead. <i>Nature Machine Intelligence</i>, 1, 206–215.',
 'Lundberg, S. M., &amp; Lee, S.-I. (2017). A unified approach to interpreting model predictions. <i>Advances in Neural Information Processing Systems 30</i>. — SHAP',
 'Ribeiro, M. T., Singh, S., &amp; Guestrin, C. (2016). "Why should I trust you?": Explaining the predictions of any classifier. <i>Proceedings of KDD 2016</i>. — LIME',
 'Grinsztajn, L., Oyallon, E., &amp; Varoquaux, G. (2022). Why do tree-based models still outperform deep learning on typical tabular data? <i>NeurIPS 2022 Datasets and Benchmarks Track</i>.',
 'Pawar, P. <i>Machine Learning Algorithm Family Tree</i> (인포그래픽). — 조직도 포스터의 칸 구성'];
var TIP={who:'1·2부와 3부 앞 네 편을 읽은 학습자. 처음 읽어도 02장 선택 지도와 04장 포스터는 따라올 수 있다',goal:'① 배포할 모델을 성능·비용·설명의 저울로 비교한다 ② 문제를 듣고 선택 지도로 출발 가문과 기준선을 고른다 ③ 다섯 줄 체크리스트로 남의 실험을 점검한다',time:'읽기 15분 · 저울과 지도 10분 · 결산과 포스터 5분 · Colab 10분',
 plans:[['강의형 30분','01장 저울에서 "대출 심사"와 "상품 추천"을 번갈아 눌러 기우는 쪽 보기 7분 → 02장 지도를 학생이 고른 문제로 따라가기 10분 → 담판 5분 → 04장 결산표로 시즌 복습 8분.'],['실무 OJT 60분','팀의 실제 후보 모델 두세 개로 프롬프트 ①의 저울표 만들기 35분 → 다섯 줄 체크리스트로 서로의 실험 점검 25분.'],['1:1 튜터링','담판을 열기 전에 "무엇이 중요한 문제인가"를 먼저 말하게 하고, 그 답에 맞춰 01장 무게를 직접 정하게 한다.']],
 myths:[['가장 정확한 모델을 배포하면 된다','속도·비용·설명이 받쳐 주지 않으면 배포가 어렵거나 위험하다'],['설명 가능한 모델은 늘 성능이 나쁘다','이 담판에서도 차이는 2%p 안쪽이었다. 데이터에 따라 거의 같기도 하다'],['선택 지도대로만 하면 된다','지도는 출발점이다. 공정하게 재고(4-11) 맞는 지표로(4-12~4-14) 확인해야 한다']]};
var CODE={title:'배포 저울: 로지스틱 vs 큰 앙상블',sub:'담판 재현 · numpy, scikit-learn · CPU 30초 안팎',file:'deploy_scale',
 desc:'담판을 옮겼다. 대출 표 데이터(특징 8개)를 세 벌 만들어 로지스틱 회귀와 큰 앙상블(GBM·랜덤 포레스트·히스토그램 GBM의 확률 평균)의 검증 정확도, 학습 시간, 예측 1건 시간을 재고, 로지스틱의 가중치로 설명을 출력한다.',
 cap:'실행 결과 (scikit-learn 1.x, CPU). 데이터 규칙은 브라우저와 같지만 난수 생성기와 구현이 달라 숫자는 조금 다르다. 시간은 컴퓨터마다 다르니 배율로 본다.'};
