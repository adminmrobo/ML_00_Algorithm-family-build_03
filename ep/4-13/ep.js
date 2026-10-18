/* ══ 4-13 비지도 가문의 장부 ══════════════════════════════════════ */
var U=UNS13,PCA2=ML.pca(U.X,2).proj,FLYP=1;/* 초파리가 읽은 지도: perplexity 8 */
function kcol(i){var C=cols();return [C.info,C.orange,C.gfp,C.stain,C.amber,'#7d6bb8','#c0794a','#4f9b9b','#9a9a5a','#b0607a'][((i%10)+10)%10];}
/* 2D 점 배치용 틀 */
function frame2(P,Wd,H,pad){pad=pad==null?14:pad;var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
  var s=Math.min((Wd-2*pad)/(x1-x0||1),(H-2*pad)/(y1-y0||1)),ox=(Wd-(x1-x0)*s)/2,oy=(H-(y1-y0)*s)/2;
  return {s:s,X:function(x){return ox+(x-x0)*s},Y:function(y){return H-oy-(y-y0)*s}};}
function plot2(cv,P,colorOf,H,opt){opt=opt||{};var Wd=fit(cv,H),ctx=cv.getContext('2d'),F=frame2(P,Wd,H,opt.pad);ctx.clearRect(0,0,Wd,H);
  P.forEach(function(p,i){circ(ctx,F.X(p[0]),F.Y(p[1]),opt.r||3,colorOf(i));});if(opt.stamp)stamp(ctx,Wd,opt.stamp);return {ctx:ctx,F:F,W:Wd};}

/* ── 히어로: 거울 세 개, 같은 장부 ── */
heroStage($('heroCv'),{bg:'sc_mirror',bgY:0,fly:'magnify',robo:'calc',motif:function(ctx,t,W,H){
  var maps=[['8차원을 PCA로',PCA2],['t-SNE · 이웃 8',U.E[1]],['t-SNE · 이웃 80',U.E[3]]],xs=[300,550,800];
  maps.forEach(function(m,j){var cx=xs[j],cy=150,w=190,h=220;
    ctx.fillStyle='rgba(15,13,11,.82)';rr(ctx,cx-w/2,cy-h/2,w,h,90);ctx.fill();ctx.strokeStyle='#d4a54a';ctx.lineWidth=3;rr(ctx,cx-w/2,cy-h/2,w,h,90);ctx.stroke();
    var P=m[1],x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    var s=Math.min(120/(x1-x0),130/(y1-y0)),sh=.75+.25*Math.sin(t*1.3+j);
    P.forEach(function(p,i){ctx.fillStyle='rgba(240,212,140,'+(.55+.35*sh)+')';ctx.fillRect(Math.round(cx+(p[0]-(x0+x1)/2)*s)-2,Math.round(cy+((y0+y1)/2-p[1])*s)-2,4,4);});
    ctx.font=font(12,700);ctx.fillStyle='#efe6d8';ctx.textAlign='center';ctx.fillText(m[0],cx,cy+h/2+18);});
  ctx.font=font(13,700);ctx.fillStyle='#d4a54a';ctx.textAlign='center';ctx.fillText('같은 장부, 세 개의 거울 — 무리는 몇 개인가?',550,24);}});

/* ── 01 엘보 ── */
(function(){var cv=$('elbCv'),pv=$('elbPca'),k=4,C0=U.sseCurve(),KN=U.knee(C0);
 function draw(){var H=240,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=56,r=Wd-14,tp=16,bt=H-34;ctx.clearRect(0,0,Wd,H);
  var mx=C0[0];function px(i){return l+(i-1)/9*(r-l)}function py(v){return bt-v/mx*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();
  ctx.font=font(11);ctx.fillStyle=C.muted;ctx.textAlign='center';for(var i=1;i<=10;i++)ctx.fillText(i,px(i),bt+14);ctx.fillText('무리 수 k',(l+r)/2,H-4);
  ctx.textAlign='right';[0,.5,1].forEach(function(f){ctx.fillText(Math.round(mx*f).toLocaleString(),l-6,py(mx*f)+4);});
  ctx.save();ctx.translate(12,(tp+bt)/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('무리 안 오차 제곱합',0,0);ctx.restore();
  ctx.setLineDash([4,4]);ctx.strokeStyle=rgba(C.muted,.6);ctx.beginPath();ctx.moveTo(px(1),py(C0[0]));ctx.lineTo(px(10),py(C0[9]));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=C.gfp;ctx.lineWidth=2.6;ctx.beginPath();C0.forEach(function(v,i){i?ctx.lineTo(px(i+1),py(v)):ctx.moveTo(px(i+1),py(v));});ctx.stroke();
  C0.forEach(function(v,i){circ(ctx,px(i+1),py(v),i+1===k?6:3.5,i+1===KN?C.amber:C.gfp,i+1===k?C.text:null,2);});
  ctx.font=font(11.5,700);ctx.fillStyle=C.amber;ctx.textAlign='left';ctx.fillText('꺾이는 점 k = '+KN,px(KN)+8,py(C0[KN-1])-8);
  var pc=plot2(pv,PCA2,function(i){return kcol(U.km(k).a[i])},240,{r:2.6});
  stamp(pc.ctx,pc.W,'8차원 → PCA 2차원으로 본 그림');}
 function ui(){$('elbVal').textContent=k;var c=C0[k-1],prev=k>1?C0[k-2]:null;
  $('elbStat').innerHTML=statGrid([[k+'개','고른 무리 수'],[Math.round(c).toLocaleString(),'무리 안 오차 제곱합'],[prev?'−'+pct((prev-c)/prev,0):'—','한 개 늘릴 때 줄어든 몫'],[KN+'개','꺾이는 점']]);draw();}
 $('elbSl').addEventListener('input',function(){k=+this.value;ui();});ui();onRedraw(draw);})();

/* ── 02 실루엣 ── */
(function(){var cv=$('silCv'),bc=$('silBar'),k=4,BEST=U.bestSil();
 function draw(){var o=U.sil(k),H=300,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=30,r=Wd-12,tp=12,bt=H-26,zero=l+(r-l)/3;ctx.clearRect(0,0,Wd,H);
  function px(v){return zero+v*(r-zero)}
  var order=[];for(var c=0;c<k;c++){var g=[];o.s.forEach(function(v,i){if(o.a[i]===c)g.push([v,i]);});g.sort(function(a,b){return b[0]-a[0]});order.push(g);}
  var gap=6,n=U.N,rowH=(bt-tp-gap*(k-1))/n,y=tp;
  order.forEach(function(g,c){var y0=y;g.forEach(function(e){ctx.fillStyle=e[0]<0?C.eye:kcol(c);ctx.fillRect(Math.min(px(0),px(e[0])),y,Math.abs(px(e[0])-px(0)),Math.max(rowH,.8));y+=rowH;});
    ctx.font=font(10.5,700);ctx.fillStyle=C.muted;ctx.textAlign='right';ctx.fillText('무리 '+(c+1),zero-6,(y0+y)/2+4);y+=gap;});
  ctx.strokeStyle=C.text;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px(0),tp);ctx.lineTo(px(0),bt);ctx.stroke();
  ctx.setLineDash([5,4]);ctx.strokeStyle=C.amber;ctx.beginPath();ctx.moveTo(px(o.mean),tp);ctx.lineTo(px(o.mean),bt);ctx.stroke();ctx.setLineDash([]);
  ctx.font=font(11);ctx.fillStyle=C.muted;ctx.textAlign='center';[-.25,0,.25,.5,.75,1].forEach(function(v){if(px(v)>l)ctx.fillText(v,px(v),bt+14);});
  ctx.fillStyle=C.amber;ctx.textAlign='left';ctx.font=font(11,700);ctx.fillText('평균 '+fx(o.mean,2),px(o.mean)+5,tp+10);
  /* k별 평균 실루엣 */
  var H2=150,W2=fit(bc,H2),c2=bc.getContext('2d'),L=36,R=W2-10,T=14,B=H2-24;c2.clearRect(0,0,W2,H2);
  c2.strokeStyle=C.rule;c2.beginPath();c2.moveTo(L,T);c2.lineTo(L,B);c2.lineTo(R,B);c2.stroke();var bw=(R-L)/9;
  for(var kk=2;kk<=10;kk++){var m=U.sil(kk).mean,x=L+(kk-2)*bw+bw*.18,h=Math.max(0,m)*(B-T);c2.fillStyle=kk===BEST?C.amber:(kk===k?C.text:rgba(C.muted,.55));c2.fillRect(x,B-h,bw*.64,h);
    c2.font=font(10.5);c2.fillStyle=C.muted;c2.textAlign='center';c2.fillText(kk,x+bw*.32,B+13);if(kk===BEST||kk===k){c2.fillStyle=C.text;c2.fillText(fx(m,2),x+bw*.32,B-h-4);}}
  c2.textAlign='left';c2.fillStyle=C.muted;c2.fillText('평균 실루엣 (k = 2 ~ 10)',L+4,T-2);}
 function ui(){var o=U.sil(k);$('silVal').textContent=k;
  $('silStat').innerHTML=statGrid([[fx(o.mean,3),'평균 실루엣 점수'],[o.neg+'명','엉뚱한 무리에 든 점 (음수)'],[BEST+'개','점수가 가장 높은 k'],[pct(U.match(o.a),0),'숨긴 정답과 겹침 (채점용)']]);
  $('silCap').innerHTML=k===BEST?'<b>k = '+k+'.</b> 거의 모든 막대가 오른쪽으로 길다. 점들이 자기 무리와는 가깝고 옆 무리와는 멀다는 뜻이다.':
   (k<BEST?'<b>k = '+k+'.</b> 서로 다른 무리가 억지로 한 무리로 묶여 막대가 짧아졌다.':'<b>k = '+k+'.</b> 한 무리를 억지로 쪼갰다. 쪼개진 두 조각은 서로 가까워서 막대가 짧아지고, 빨간 음수 막대(옆 무리가 더 가까운 점)가 생긴다.');draw();}
 $('silSl').addEventListener('input',function(){k=+this.value;ui();});ui();onRedraw(draw);})();

/* ── 03 t-SNE의 함정 ── */
(function(){var cv=$('tsCv'),pi=1,truth=false;
 npcLine($('mouseHost'),['mouse'],3,'금고 틈의 <b>찍찍이</b>가 거울 뒤를 기웃거린다. 거울에 비친 모습만 보고는 방 안에 몇 무리가 있는지 알 수 없다.');
 function draw(){var E=U.E[pi],o=plot2(cv,E,function(i){return truth?kcol(U.Y[i]):cols().amber},280,{r:2.8,stamp:'미리 계산한 결과'});}
 function ui(){var b=U.blobs(pi),p=U.P[pi];
  $('tsStat').innerHTML=statGrid([['이웃 '+p,'t-SNE 설정 (perplexity)'],[b.k+'개','그림에서 눈으로 센 덩어리'],[U.bestSil()+'개','실루엣이 고른 무리 수 (8차원)'],['4개','숨긴 정답']]);
  var t={3:'이웃을 3명만 보면 지도가 잘게 부서진다. 한 무리 안의 작은 덩어리까지 따로 떨어져 보인다.',8:'덩어리가 여섯으로 또렷하다. 그런데 숨긴 정답은 넷이다. 두 무리 안에 있는 작은 덩어리 두 개씩이 각각 다른 무리처럼 떨어져 보인다.',
   30:'이웃을 30명 보면 작은 덩어리 둘이 붙어 네 덩어리로 보인다. 다만 덩어리 사이의 거리는 원래 거리와 다르다.',80:'이웃을 80명 보면 네 덩어리가 된다. 덩어리의 크기와 간격은 이번에도 그대로 믿을 수 없다.'}[p];
  $('tsCap').innerHTML=t+(truth?' <b>색은 숨긴 정답이다.</b>':'');draw();}
 seg('#tsPick button',function(v){pi=+v;ui();});
 $('tsTruth').addEventListener('click',function(){truth=!truth;this.setAttribute('aria-pressed',truth?'true':'false');this.textContent=truth?'정답 색 끄기':'숨긴 정답 색 보기';ui();});
 ui();onRedraw(draw);})();

/* ── 담판: 무리는 몇 개인가 ── */
Duel('d13',{title:'무리는 몇 개인가',q:'고객 240명, 특징 8개. 정답 없이 무리 수를 정해야 한다. 초파리는 t-SNE 그림을 읽고, Money-Robo는 k를 바꿔 가며 실루엣 점수를 잰다. 금고에 넣어 둔 진짜 무리 수와 누가 맞을까?',
 fly:['t-SNE 그림을 읽는다','무리가 6개로 보이는데? 그림이 이렇게 또렷하잖아.'],robo:['실루엣 점수로 고른다','k를 2부터 10까지 재 봤다. 숫자는 하나를 가리킨다.'],roboMood:'calc',
 run:async function(p){p(.3);await wait(120);var fb=U.blobs(FLYP),fk=fb.k,rk=U.bestSil(),T=4;p(.8);
  var fm=U.match(U.km(fk).a),rm=U.match(U.km(rk).a);p(1);
  var w=Math.abs(rk-T)<Math.abs(fk-T)?'r':(Math.abs(rk-T)>Math.abs(fk-T)?'f':'d');
  return {winner:w,big:false,
   measure:'금고 속 진짜 무리 수는 '+T+'개예요. 초파리 쪽은 이웃 8 그림에서 덩어리 '+fk+'개를 셌고, Money-Robo 쪽은 평균 실루엣이 가장 높은 k = '+rk+'(점수 '+fx(U.sil(rk).mean,3)+')를 골랐어요. 그 수로 K-평균을 돌려 숨긴 정답과 맞춰 보면 '+pct(fm,0)+' 대 '+pct(rm,0)+'예요.',
   verdict:'이번엔 차가운 숫자가 이겼다. t-SNE는 보기 좋게 펼치는 도구지 무리 수를 세는 도구가 아니다. 이 구역은 Money-Robo 쪽이다.',key:'군집 수는 지표와 업무 의미로 정한다. 그림만 보고 정하지 않는다.',
   render:function(box){box.innerHTML=statGrid([[fk+'개','초파리 · 그림에서 센 무리','f'],[pct(fm,0),'초파리 · 정답과 겹침','f'],[rk+'개','Money-Robo · 실루엣이 고른 무리','r'],[pct(rm,0),'Money-Robo · 정답과 겹침','r']])+
    '<div class="two" style="margin-top:12px"><figure style="margin:0"><canvas class="fig" id="dA" aria-label="초파리가 읽은 t-SNE 지도. 덩어리 여섯 개가 보인다"></canvas><figcaption class="muted" style="font-size:13px">초파리 · t-SNE(이웃 8) 그림</figcaption></figure><figure style="margin:0"><canvas class="fig" id="dB" aria-label="k별 평균 실루엣 막대. k=4가 가장 높다"></canvas><figcaption class="muted" style="font-size:13px">Money-Robo · k별 평균 실루엣</figcaption></figure></div>'+
    '<div class="card" style="margin-top:12px;border-left:4px solid var(--amber)"><span class="tag">실전 체크 ③</span><p style="margin:0">군집 수는 지표(엘보, 실루엣)와 업무 의미로 함께 정한다. 시각화 그림만 보고 정하지 않는다.</p></div>';
    function dr(){plot2($('dA'),U.E[FLYP],function(){return cols().amber},210,{r:2.5,stamp:'미리 계산한 결과'});
     var cv=$('dB'),H=210,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),L=30,R=Wd-10,T2=14,B=H-24,bw=(R-L)/9;ctx.clearRect(0,0,Wd,H);
     ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(L,T2);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();
     for(var kk=2;kk<=10;kk++){var m=U.sil(kk).mean,x=L+(kk-2)*bw+bw*.18,h=Math.max(0,m)*(B-T2);ctx.fillStyle=kk===rk?C.c_robo:(kk===fk?C.c_fly:rgba(C.muted,.5));ctx.fillRect(x,B-h,bw*.64,h);
      ctx.font=font(10.5);ctx.fillStyle=C.muted;ctx.textAlign='center';ctx.fillText(kk,x+bw*.32,B+13);if(kk===rk||kk===fk){ctx.fillStyle=C.text;ctx.fillText(fx(m,2),x+bw*.32,B-h-4);}}}
    setTimeout(dr,0);onRedraw(dr);}};},
 alts:[{label:'퍼플렉시티를 바꾸면?',run:async function(box){var rows=U.P.map(function(p,i){return '<tr><td>이웃 '+p+'</td><td>'+U.blobs(i).k+'개</td><td>'+U.bestSil()+'개</td></tr>'}).join('');
   box.innerHTML='<div class="tw"><table class="tb"><thead><tr><th>t-SNE 설정</th><th>그림에서 센 덩어리</th><th>실루엣이 고른 무리 수</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    say('asst','ledger','그림은 설정 하나에 덩어리 수가 '+U.blobs(0).k+'개에서 '+U.blobs(3).k+'개까지 바뀌어요. 실루엣은 원래 8차원 거리로 재니까 설정과 상관없이 '+U.bestSil()+'개예요.')+say('robo','calc','거울을 바꿔도 장부의 숫자는 그대로지.');}},
  {label:'엘보로 고르면?',run:async function(box){var c=U.sseCurve(),kn=U.knee(c);
   box.innerHTML=statGrid([[Math.round(c[2]).toLocaleString(),'k = 3 오차 제곱합'],[Math.round(c[3]).toLocaleString(),'k = 4 오차 제곱합'],[Math.round(c[4]).toLocaleString(),'k = 5 오차 제곱합'],[kn+'개','꺾이는 점']])+
    say('asst','ledger','3에서 4로 갈 때 오차 제곱합이 '+pct((c[2]-c[3])/c[2],0)+' 줄고, 4에서 5로는 '+pct((c[3]-c[4])/c[3],0)+'만 줄어요. 꺾이는 점도 '+kn+'개라 실루엣과 같은 답이에요.')+
    say('fly','point','두 지표가 같은 답을 내면 믿을 만하지. 다만 꺾이는 점이 흐릿한 데이터도 많다는 건 기억해 둬.');}}]});

/* ══ 확인 문제 ══ */
var QUIZ={q13:[
 {q:'엘보 그래프에서 k를 늘리면 무리 안 오차 제곱합은?',o:[['늘 줄어든다. 그래서 가장 작은 값이 아니라 꺾이는 점을 본다',1,'무리를 늘릴수록 점과 중심이 가까워져 값은 계속 준다. k = 점 수면 0이다. 줄어드는 폭이 갑자기 작아지는 곳이 꺾이는 점이다.'],['가장 작은 k에서 가장 작다',0,'반대다. k = 1일 때 가장 크다.'],['진짜 무리 수에서 0이 된다',0,'잡음이 있으면 0이 되지 않는다. 0이 되는 건 점마다 무리가 하나씩일 때뿐이다.']]},
 {q:'어떤 점의 실루엣 값이 음수라면?',o:[['자기 무리보다 옆 무리와 더 가깝다',1,'s = (b − a) / max(a, b)에서 a > b면 음수다. 02장에서 k를 너무 크게 잡으면 빨간 음수 막대가 생겼다.'],['그 점은 잡음이다',0,'실루엣은 잡음을 따로 판정하지 않는다.'],['무리가 아주 잘 나뉘었다',0,'잘 나뉘었으면 1에 가깝다.']]},
 {q:'t-SNE 그림에서 덩어리가 여섯 개로 보였다. 가장 알맞은 해석은?',o:[['설정(이웃 수)에 따라 덩어리 수와 간격이 달라지므로, 무리 수는 원래 데이터의 지표로 따로 확인한다',1,'03장에서 이웃 수만 바꿔도 덩어리가 7개에서 4개까지 바뀌었다. 실루엣은 그대로 4였다.'],['무리는 여섯 개다',0,'숨긴 정답은 4개였다. 무리 안의 작은 덩어리가 떨어져 보였을 뿐이다.'],['덩어리 사이 간격이 멀수록 원래 데이터에서도 더 멀다',0,'t-SNE는 가까운 이웃을 지키는 데 집중해서, 먼 덩어리 사이의 간격은 믿기 어렵다.']]}]};

var PROMPTS=[
 {t:'① 내 데이터로 k 고르기',use:'고객·제품을 몇 무리로 나눌지 정해야 할 때',p:'아래 순서로 내 데이터의 군집 수를 골라 주는 파이썬 코드를 짜 줘.\n\n- 데이터: 〔예) customers.csv, 숫자 특징 열 8개〕\n1) 특징을 표준화한다\n2) k = 2~10으로 K-평균을 돌려 엘보 그래프와 평균 실루엣 점수를 그린다\n3) 두 지표가 고른 k를 표로 비교하고, 서로 다르면 각 k의 무리별 평균값 표를 보여 줘\n\n마지막에 "업무에서 이 무리들이 서로 다르게 다뤄질 수 있는가"를 판단할 질문 세 개를 붙여 줘.'},
 {t:'② t-SNE 그림 검증하기',use:'t-SNE·UMAP 그림을 보고서에 넣기 전에',p:'내 t-SNE 그림 〔설명: 덩어리 몇 개, 데이터 크기〕를 그대로 믿어도 되는지 점검해 줘. 1) perplexity를 5·30·50으로 바꿔 그린 그림 세 장 2) 원래 공간에서 잰 실루엣 점수와의 비교 3) 덩어리 크기와 간격을 해석할 때의 주의점. 보고서에 넣을 한 줄 단서 문구도 써 줘.'},
 {t:'③ 군집 결과를 업무 언어로',use:'군집을 마케팅·운영 팀에 설명할 때',p:'K-평균으로 고객을 〔k〕개 무리로 나눴다. 무리별 특징 평균표는 〔붙여 넣기〕다. 무리마다 짧은 이름과 한 줄 설명, 그리고 "이 무리를 따로 다룰 만한 이유"를 표로 정리해 줘. 숫자로 뒷받침되지 않는 해석은 따로 표시해 줘.'},
 {t:'④ 수업용 함정 실습',use:'강의에서 시각화의 함정을 보여 줄 때',p:'고등학생도 따라 할 수 있는 실습을 기획해 줘. 1) 무리 4개가 숨은 데이터를 만들고 2) t-SNE를 perplexity 세 가지로 그려 학생에게 "무리가 몇 개인가"를 묻고 3) 실루엣 점수로 답을 확인하는 흐름. 학생에게 던질 질문 세 개와 예상 답도 붙여 줘.'}];
var GL=[
 ['평가','무리 안 오차 제곱합','점마다 자기 무리 중심까지 거리의 제곱을 모두 더한 값. SSE 또는 inertia.'],['평가','엘보 방법','k를 늘리며 무리 안 오차 제곱합을 그려, 줄어드는 폭이 갑자기 작아지는 꺾이는 점을 고르는 방법.'],
 ['평가','꺾이는 점','곡선이 팔꿈치처럼 꺾이는 곳. 여기서는 첫 점과 끝 점을 잇는 직선에서 가장 먼 점으로 찾았다.'],['평가','실루엣 값','점마다 (b − a) / max(a, b). a는 내 무리와의 평균 거리, b는 가장 가까운 다른 무리와의 평균 거리. −1 ~ 1.'],
 ['평가','평균 실루엣 점수','모든 점의 실루엣 값의 평균. 클수록 무리가 촘촘하고 서로 떨어져 있다.'],['평가','정답 겹침','찾은 무리와 숨긴 정답을 일대일로 짝지어 맞은 점의 몫. 실제 업무에는 정답이 없어서 쓸 수 없고, 이 페이지는 채점용으로만 쓴다.'],
 ['파','K-평균','무리 중심까지 거리로 점을 나누는 군집 알고리즘(4-3, 4-8).'],['파','DBSCAN','가까운 점끼리 이어 덩어리를 찾는 군집 알고리즘. 03장에서 그림 속 덩어리 수를 셀 때 썼다.'],
 ['파','t-SNE','가까운 이웃 관계를 지키며 2차원 지도로 펼치는 차원 축소 방법(4-8).'],['데이터','이웃 수 (perplexity)','t-SNE가 점마다 몇 명쯤의 이웃을 눈여겨볼지 정하는 설정. 바꾸면 그림이 크게 달라진다.'],
 ['데이터','특징','데이터 한 건을 설명하는 숫자. 여기서는 고객 한 명에 8개.'],['데이터','표준화','특징마다 평균을 0, 표준편차를 1로 맞추는 일. 거리 기반 방법 앞에 거의 늘 한다.'],
 ['평가','지표','결과를 숫자 하나로 요약하는 잣대.'],['평가','시각화','데이터를 그림으로 보이는 일. 보기는 좋지만 그 자체가 측정은 아니다.']];
var ANALOGY=[
 ['엘보 방법','이삿짐 상자를 늘려 가다 "하나 더 사도 별로 안 편해지는" 순간',1,'','꺾이는 점이 흐릿해서 사람마다 다르게 읽는 경우가 많다'],
 ['실루엣 점수','반 배정 뒤 "우리 반 친구가 옆 반 친구보다 가까운가"를 학생마다 묻기',1,'','거리 하나로만 잰다. 둥글지 않은 무리(초승달)에서는 점수가 낮게 나와도 좋은 군집일 수 있다'],
 ['t-SNE 그림','놀이공원 거울방. 같은 사람이 거울마다 다르게 보인다',2,'초파리의 겹눈이 보는 모자이크 상도 실제 모양과 다르다','거울방은 일부러 왜곡하지만, t-SNE는 가까운 이웃을 지키려다 먼 거리를 희생한다'],
 ['무리 안의 작은 덩어리','한 반 안의 단짝 모임',1,'','단짝 모임을 반으로 착각하면 반이 여섯 개가 된다. 어디까지를 한 무리로 볼지는 업무 의미가 정한다']];
var REFS=[
 'Rousseeuw, P. J. (1987). Silhouettes: A graphical aid to the interpretation and validation of cluster analysis. <i>Journal of Computational and Applied Mathematics</i>, 20, 53–65. — 실루엣',
 'Thorndike, R. L. (1953). Who belongs in the family? <i>Psychometrika</i>, 18(4), 267–276. — 엘보 방법의 기원으로 자주 인용된다',
 'van der Maaten, L., &amp; Hinton, G. (2008). Visualizing data using t-SNE. <i>Journal of Machine Learning Research</i>, 9, 2579–2605.',
 'Wattenberg, M., Viégas, F., &amp; Johnson, I. (2016). How to use t-SNE effectively. <i>Distill</i>. doi:10.23915/distill.00002 — 이웃 수에 따라 덩어리 크기·간격·개수가 달라지는 함정'];
var TIP={who:'군집을 실무에 써 보려는 학습자. 4-3·4-8을 읽었으면 좋다',goal:'① 정답 없이 군집을 재는 두 지표(엘보, 실루엣)를 계산 원리와 함께 설명한다 ② k를 바꿔 실루엣 막대가 어떻게 변하는지 읽는다 ③ t-SNE 그림의 덩어리 수·간격을 그대로 믿으면 안 되는 이유를 말한다',time:'읽기 15분 · 슬라이더와 담판 10분 · Colab 10분',
 plans:[['강의형 30분','03장 그림을 먼저 보여 주고 "무리가 몇 개인가"를 손들어 답하게 한다 → 01·02장으로 지표를 계산 → 담판으로 확인. 마지막에 03장의 정답 색을 켠다.'],['실무 OJT 60분','사내 고객 데이터로 프롬프트 ①을 돌려 엘보·실루엣 표 만들기 30분 → 프롬프트 ③으로 무리 이름 붙이기 15분 → 업무 의미 토론 15분.'],['1:1 튜터링','02장에서 k를 6으로 두고 빨간 음수 막대가 어디서 생겼는지, 왜 생겼는지 설명하게 한다.']],
 myths:[['오차 제곱합이 가장 작은 k가 정답이다','k를 늘리면 늘 줄어든다. 꺾이는 점이나 실루엣을 본다'],['t-SNE 그림의 덩어리 수가 곧 무리 수다','설정에 따라 바뀐다. 원래 데이터의 지표로 확인한다'],['실루엣이 낮으면 군집이 쓸모없다','둥글지 않은 무리에서는 낮게 나올 수 있다. 업무 의미와 함께 본다']]};
var CODE={title:'엘보·실루엣으로 k 고르기, t-SNE 설정의 함정',sub:'담판 재현 · numpy, scikit-learn · CPU 약 20초',file:'choose_k_silhouette_tsne',
 desc:'무리 4개(그중 둘은 안에 작은 덩어리 두 개)가 숨은 8차원 고객 데이터를 만들고, K-평균의 무리 안 오차 제곱합(엘보)과 평균 실루엣으로 k를 고른다. 같은 데이터를 t-SNE로 이웃 수 네 가지에 펼쳐 그림 속 덩어리 수를 DBSCAN으로 센다.',
 cap:'실행 결과 (scikit-learn 1.x, CPU). 페이지와 같은 규칙으로 데이터를 만들었고, 실루엣이 고른 k와 그림 속 덩어리 수의 관계는 같다. t-SNE 좌표는 버전에 따라 조금 달라질 수 있다.'};
