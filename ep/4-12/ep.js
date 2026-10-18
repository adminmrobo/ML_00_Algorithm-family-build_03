/* ══ 4-12 지도 가문의 장부 ════════════════════════════════════════ */
var W=LEDG.world(0.01),TH0=W.th;
function prS(v){return v==null?'—':pct(v)}
function nfmt(n){return n.toLocaleString('ko-KR')}

/* ── 히어로: 네 칸 장부가 두 모델 사이를 오간다 ── */
(function(){var A=LEDG.cm(W.TE,1.01),B=LEDG.cm(W.TE,TH0);
heroStage($('heroCv'),{bg:'sc_ledger',bgY:.25,fly:'magnify',robo:'calc',motif:function(ctx,t,W_,H){
  ctx.fillStyle='rgba(13,12,11,.82)';rr(ctx,250,18,600,274,16);ctx.fill();
  var k=Math.floor(t/3.2)%2,c=k?B:A,lab=k?'로지스틱 (문턱 '+TH0.toFixed(2)+')':'전부 "정상"';
  ctx.font=font(14,700);ctx.textAlign='center';ctx.fillStyle='#d4a54a';ctx.fillText('처음 보는 거래 1,000건 · '+lab,550,44);
  var x0=380,y0=82,cw=170,ch=78,g=8,cells=[[c.tp,'맞힌 사기',1],[c.fn,'놓친 사기',0],[c.fp,'잘못 막은 정상',0],[c.tn,'맞힌 정상',1]];
  ctx.font=font(11);ctx.fillStyle='#a89a86';ctx.textAlign='right';ctx.fillText('진짜 사기',x0-10,y0+ch/2+4);ctx.fillText('진짜 정상',x0-10,y0+ch+g+ch/2+4);
  ctx.textAlign='center';ctx.fillText('모델: 막음',x0+cw/2,y0-7);ctx.fillText('모델: 통과',x0+cw+g+cw/2,y0-7);
  cells.forEach(function(q,i){var x=x0+(i%2)*(cw+g),y=y0+Math.floor(i/2)*(ch+g),col=q[2]?'#8fb878':'#c8442f';
    ctx.fillStyle=rgba(col,.14);rr(ctx,x,y,cw,ch,10);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;rr(ctx,x,y,cw,ch,10);ctx.stroke();
    ctx.fillStyle=col;ctx.font=font(26,700);ctx.fillText(nfmt(q[0]),x+cw/2,y+42);ctx.font=font(11.5);ctx.fillStyle='#efe6d8';ctx.fillText(q[1],x+cw/2,y+64);});
  var blink=(Math.sin(t*4)+1)/2;ctx.font=font(15,700);ctx.textAlign='center';
  ctx.fillStyle='#efe6d8';ctx.fillText('정확도 '+pct(c.acc),460,y0+2*ch+g+30);
  ctx.fillStyle=c.re===0?rgba('#c8442f',.55+.45*blink):'#8fb878';ctx.fillText('재현율 '+pct(c.re,0),650,y0+2*ch+g+30);}});})();

/* ── 혼동 행렬 칸 그리기 (사람 그림 = 거래 한 건) ── */
var GK=['g1','g2','g3'];
function person(i,flag){var s=document.createElement('span');s.style.cssText='display:inline-flex;flex-direction:column;align-items:center;gap:1px';
  if(flag){s.appendChild(NPC.el('qmark',2));}else{var sp=document.createElement('i');sp.style.cssText='display:block;height:12px';s.appendChild(sp);}
  s.appendChild(NPC.el(GK[i%3],2));return s;}
function renderCM(host,c){
  var cells=[['tp','맞힌 사기','참양성 · 사기를 막았다','ok',1],['fn','놓친 사기','거짓음성 · 사기가 통과했다','bad',0],['fp','잘못 막은 정상','거짓양성 · 정상 고객을 막았다','bad',1],['tn','맞힌 정상','참음성 · 정상을 통과시켰다','ok',0]];
  host.innerHTML='<div></div><div class="h">모델: "의심 거래"<br>(막음)</div><div class="h">모델: "정상"<br>(통과)</div>'+
    cells.map(function(q,i){return (i%2===0?'<div class="h">진짜 '+(i<2?'사기':'정상')+'</div>':'')+'<div class="cell '+q[3]+'"><b>'+nfmt(c[q[0]])+'</b><span><b style="font-size:13px;color:inherit">'+q[1]+'</b> · '+q[2]+'</span><div class="ppl" data-k="'+q[0]+'"></div></div>';}).join('');
  cells.forEach(function(q){var box=host.querySelector('[data-k="'+q[0]+'"]'),n=c[q[0]],show=q[0]==='tn'?Math.min(n,6):Math.min(n,q[0]==='fp'?14:10);
    for(var i=0;i<show;i++)box.appendChild(person(i+(q[0]==='fn'?1:0),q[4]));
    if(n>show){var m=document.createElement('span');m.className='muted';m.style.fontSize='12.5px';m.textContent='… 외 '+nfmt(n-show)+'건';box.appendChild(m);}});}
function metricStat(c){return [[pct(c.acc),'정확도'],[prS(c.pr),'정밀도'],[pct(c.re),'재현율'],[c.f1?fx(c.f1,2):'0','F1']];}

/* ── 01 네 칸 장부 ── */
(function(){var mode='base';
 npcLine($('m1npc'),['scare'],3,'문 앞 허수아비 <b>기준이</b>: "나는 늘 \'정상\'이라고만 답한다. 그래도 정확도는 99%다."');
 function ui(){var c=mode==='base'?LEDG.cm(W.TE,1.01):LEDG.cm(W.TE,TH0);renderCM($('cm1'),c);
  $('cm1Stat').innerHTML=statGrid(metricStat(c)).replace(/^<div class="stat">|<\/div>$/g,'');}
 seg('#m1 .pills button',function(v){mode=v;ui();});ui();})();

/* ── 02 문턱 · 평면 · 정밀도–재현율 곡선 ── */
var PRC=LEDG.prCurve(W.TE);
(function(){var cv=$('scCv'),pc=$('prCv'),th=TH0,lg=W.lg,sc=W.sc;
 var LA=[Math.log(1),Math.log(900)],LD=[Math.log(0.3),Math.log(2000)];
 function prob(la,ld){var z0=(la-sc.mu[0])/sc.sd[0],z1=(ld-sc.mu[1])/sc.sd[1];return ML.sig(lg.b+lg.w[0]*z0+lg.w[1]*z1);}
 function drawSc(){var H=300,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=46,r=Wd-12,tp=12,bt=H-34;ctx.clearRect(0,0,Wd,H);
  function px(la){return l+(la-LA[0])/(LA[1]-LA[0])*(r-l)}function py(ld){return bt-(ld-LD[0])/(LD[1]-LD[0])*(bt-tp)}
  var nx=70,ny=44;for(var i=0;i<nx;i++)for(var j=0;j<ny;j++){var la=LA[0]+(i+.5)/nx*(LA[1]-LA[0]),ld=LD[0]+(j+.5)/ny*(LD[1]-LD[0]);if(prob(la,ld)>=th){ctx.fillStyle=rgba(C.orange,.16);ctx.fillRect(px(LA[0]+i/nx*(LA[1]-LA[0])),py(LD[0]+(j+1)/ny*(LD[1]-LD[0])),(r-l)/nx+.6,(bt-tp)/ny+.6);}}
  ctx.strokeStyle=C.rule;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();
  ctx.font=font(11);ctx.fillStyle=C.muted;ctx.textAlign='center';[1,10,100,900].forEach(function(v){ctx.fillText(v,px(Math.log(v)),bt+14);});ctx.fillText('결제 금액 (만 원, 로그 눈금)',(l+r)/2,H-4);
  ctx.textAlign='right';[1,10,100,1000].forEach(function(v){ctx.fillText(v,l-5,py(Math.log(v))+4);});
  ctx.save();ctx.translate(11,(tp+bt)/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('평소 장소와의 거리 (km)',0,0);ctx.restore();
  W.TE.forEach(function(t){if(t.y)return;var x=px(Math.log(t.a)),y=py(Math.log(t.d));ctx.fillStyle=rgba(C.info,t.p>=th?.95:.45);ctx.fillRect(Math.round(x)-1.5,Math.round(y)-1.5,3,3);});
  W.TE.forEach(function(t){if(!t.y)return;var x=px(Math.log(t.a)),y=py(Math.log(t.d)),s=6;ctx.fillStyle=C.orange;ctx.strokeStyle=t.p>=th?C.text:C.eye;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s);ctx.lineTo(x-s,y);ctx.closePath();ctx.fill();ctx.stroke();});
  stamp(ctx,Wd,'예시 데이터');}
 function drawPr(){var H=240,Wd=fit(pc,H),ctx=pc.getContext('2d'),C=cols(),l=42,r=Wd-14,tp=12,bt=H-30;ctx.clearRect(0,0,Wd,H);
  function px(v){return l+v*(r-l)}function py(v){return bt-v*(bt-tp)}
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,tp);ctx.lineTo(l,bt);ctx.lineTo(r,bt);ctx.stroke();ctx.font=font(11);ctx.fillStyle=C.muted;ctx.textAlign='center';
  [0,.5,1].forEach(function(v){ctx.fillText(pct(v,0),px(v),bt+14);});ctx.fillText('재현율',(l+r)/2,H-3);ctx.textAlign='right';[0,.5,1].forEach(function(v){ctx.fillText(pct(v,0),l-5,py(v)+4);});
  ctx.setLineDash([4,4]);ctx.strokeStyle=rgba(C.muted,.7);ctx.beginPath();ctx.moveTo(px(0),py(.01));ctx.lineTo(px(1),py(.01));ctx.stroke();ctx.setLineDash([]);ctx.textAlign='left';ctx.fillStyle=C.muted;ctx.fillText('아무렇게나 막을 때 정밀도 ≈ 1%',px(.32),py(.01)-6);
  ctx.strokeStyle=C.gfp;ctx.lineWidth=2.4;ctx.beginPath();PRC.forEach(function(q,i){var X=px(q.re),Y=py(q.pr);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.stroke();
  var c=LEDG.cm(W.TE,th);if(c.pr!=null){circ(ctx,px(c.re),py(c.pr),7,C.amber,C.text,2);}else{circ(ctx,px(0),py(1),7,C.amber,C.text,2);}
  stamp(ctx,Wd,'처음 보는 1,000건');}
 function ui(){var c=LEDG.cm(W.TE,th);$('thVal').textContent=th.toFixed(2);renderCM($('cm2'),c);drawSc();drawPr();
  $('prStat').innerHTML=statGrid(metricStat(c).concat([[nfmt(c.flag),'막은 거래']])).replace(/^<div class="stat">|<\/div>$/g,'');}
 $('thSl').addEventListener('input',function(){th=+this.value/100;ui();});ui();onRedraw(function(){drawSc();drawPr();});})();

/* ── 03 MAE와 RMSE ── */
(function(){var cv=$('errCv'),mode='A',big=false;
 function errs(){var e=(mode==='A'?LEDG.ERR_A:LEDG.ERR_B).slice();if(big)e.push(40);return e;}
 function draw(){var e=errs(),H=230,Wd=fit(cv,H),ctx=cv.getContext('2d'),C=cols(),l=40,r=Wd-12,tp=14,bt=H-24,mid=(tp+bt)/2+30,sc=(bt-tp)/90;ctx.clearRect(0,0,Wd,H);
  function py(v){return mid-v*sc}
  ctx.strokeStyle=C.rule;ctx.beginPath();ctx.moveTo(l,py(0));ctx.lineTo(r,py(0));ctx.stroke();ctx.font=font(11);ctx.fillStyle=C.muted;ctx.textAlign='right';[-10,0,20,40].forEach(function(v){ctx.fillText(v+'분',l-4,py(v)+4);});
  var bw=(r-l)/11;e.forEach(function(v,i){var x=l+bw*(i+.5),big2=Math.abs(v)>=30;ctx.fillStyle=big2?C.eye:(v>0?C.orange:C.info);ctx.fillRect(x-bw*.3,Math.min(py(0),py(v)),bw*.6,Math.abs(py(v)-py(0)));});
  var m=LEDG.mae(e),q=LEDG.rmse(e);[[m,C.gfp,'MAE '+fx(m,1)],[q,C.amber,'RMSE '+fx(q,1)]].forEach(function(s,i){ctx.setLineDash([6,4]);ctx.strokeStyle=s[1];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(l,py(s[0]));ctx.lineTo(r,py(s[0]));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=s[1];ctx.font=font(11.5,700);if(i){ctx.textAlign='right';ctx.fillText(s[2],r-2,py(s[0])-5);}else{ctx.textAlign='left';ctx.fillText(s[2],l+4,py(s[0])+14);}});
  stamp(ctx,Wd,'예시 데이터');}
 function ui(){var e=errs(),m=LEDG.mae(e),q=LEDG.rmse(e);$('bigBtn').setAttribute('aria-pressed',big?'true':'false');$('bigBtn').textContent=big?'큰 실수 빼기':'큰 실수 하나 더하기 (+40분)';
  $('errStat').innerHTML='<div><b class="num">'+fx(m,1)+'분</b><span>MAE</span></div><div><b class="num">'+fx(q,1)+'분</b><span>RMSE</span></div><div><b class="num">'+fx(q/m,2)+'배</b><span>RMSE ÷ MAE</span></div><div><b class="num">'+e.length+'건</b><span>주문 수</span></div>';draw();}
 seg('#m3 .pills button',function(v){mode=v;ui();});$('bigBtn').addEventListener('click',function(){big=!big;ui();});ui();onRedraw(draw);})();

/* ── 담판: 정확도 99% ── */
function cmTable(rows){return '<div class="tw"><table class="tb"><thead><tr><th></th><th>정확도</th><th>정밀도</th><th>재현율</th><th>F1</th><th>맞힌 사기</th><th>놓친 사기</th><th>잘못 막은 정상</th></tr></thead><tbody>'+
  rows.map(function(r){var c=r[1];return '<tr><td><b>'+r[0]+'</b></td><td>'+pct(c.acc)+'</td><td>'+prS(c.pr)+'</td><td>'+pct(c.re)+'</td><td>'+(c.f1?fx(c.f1,2):'0')+'</td><td>'+c.tp+'</td><td>'+c.fn+'</td><td>'+c.fp+'</td></tr>';}).join('')+'</tbody></table></div>';}
Duel('d12',{title:'정확도 99%면 끝일까',q:'처음 보는 거래 1,000건 중 사기는 10건(1%). 배울 거래 3,000건(사기 30건)으로 모델을 만들고, 처음 보는 1,000건으로 잰다. 사기를 찾는 모델로 누구 것이 나을까?',
 fly:['로지스틱 + 문턱 조정','99%가 뭐든, 사기를 몇 건 잡았는지부터 봐야지.'],robo:['전부 "정상"이라고 답한다','정확도 99%! 이보다 높기도 힘들걸.'],roboMood:'calc',
 run:async function(p){p(.4);await wait(120);var a=LEDG.cm(W.TE,1.01),b=LEDG.cm(W.TE,TH0);p(1);
  return {winner:b.re>a.re&&b.f1>a.f1?'f':(b.f1<a.f1?'r':'d'),big:false,
   measure:'정확도는 Money-Robo 쪽 '+pct(a.acc)+', 초파리 쪽 '+pct(b.acc)+'. 차이는 '+fx((b.acc-a.acc)*100,1)+'%p뿐이에요. 그런데 사기 10건 중 Money-Robo 쪽은 '+a.tp+'건을 잡아 재현율 '+pct(a.re,0)+', 초파리 쪽은 '+b.tp+'건을 잡아 재현율 '+pct(b.re,0)+'예요. 초파리 쪽이 막은 거래 '+b.flag+'건 중 진짜 사기가 '+b.tp+'건이라 정밀도는 '+prS(b.pr)+', F1은 '+fx(b.f1,2)+'입니다. 문턱 '+TH0.toFixed(2)+'는 배울 데이터에서만 골랐어요.',
   verdict:'드문 사건을 찾는 문제에서 정확도는 거짓말을 한다. 전부 "정상"은 사기를 한 건도 막지 못했다. 이 구역은 초파리 쪽이다.',key:'놓침과 헛경보 중 무엇이 비싼지 먼저 정하고, 그에 맞는 지표로 잰다.',
   render:function(box){box.innerHTML=statGrid([[pct(a.acc),'Money-Robo · 정확도','r'],[pct(a.re,0),'Money-Robo · 재현율','r'],[pct(b.acc),'초파리 · 정확도','f'],[pct(b.re,0),'초파리 · 재현율','f']])+cmTable([['Money-Robo · 전부 "정상"',a],['초파리 · 로지스틱 (문턱 '+TH0.toFixed(2)+')',b]]);}};},
 alts:[{label:'문턱을 아주 낮추면?',run:async function(box){var c=LEDG.cm(W.TE,0.05),b=LEDG.cm(W.TE,TH0);
   box.innerHTML=cmTable([['문턱 '+TH0.toFixed(2)+' (담판)',b],['문턱 0.05',c]])+say('fly','magnify','문턱을 0.05까지 내리면 사기 '+c.tp+'건을 잡아 재현율 '+pct(c.re,0)+'. 대신 정상 고객 '+c.fp+'명을 막아서 정밀도가 '+prS(c.pr)+'로 떨어져.')+say('asst','confusion','어느 문턱이 맞는지는 놓친 사기 한 건과 잘못 막은 고객 한 명의 비용을 비교해서 정해요. 숫자가 아니라 사업이 정할 몫이에요.');}},
  {label:'사기가 절반이라면?',run:async function(box){var H=LEDG.world(0.5),a=LEDG.cm(H.TE,1.01),b=LEDG.cm(H.TE,H.th);
   box.innerHTML=cmTable([['전부 "정상"',a],['로지스틱 (문턱 '+H.th.toFixed(2)+')',b]])+say('robo','sigh','사기가 500건이면 전부 "정상"의 정확도가 '+pct(a.acc)+'로 떨어지네… 계산기가 이번엔 편을 안 들어 주는군.')+say('asst','confusion','두 종류가 비슷하게 많으면 정확도도 쓸 만한 지표예요. 정확도가 거짓말을 하는 건 한쪽이 드물 때예요. 로지스틱은 '+pct(b.acc)+'예요.');}}]});

/* ══ 확인 문제 ══ */
var QUIZ={q12:[
 {q:'거래 1,000건 중 사기가 10건이다. "전부 정상"이라고 답하는 모델의 정확도와 재현율은?',o:[['정확도 99%, 재현율 0%',1,'맞힌 정상 990건 ÷ 1,000건 = 99%. 진짜 사기 10건 중 잡은 건이 0건이라 재현율은 0%다.'],['정확도 1%, 재현율 100%',0,'반대다. 정상을 모두 맞혔으니 정확도는 높고, 사기를 하나도 못 잡았으니 재현율은 0%다.'],['정확도 99%, 재현율 99%',0,'재현율은 진짜 사기 중 잡은 비율이다. 잡은 사기가 없으면 0%다.']]},
 {q:'문턱을 내려 조금만 수상해도 막게 하면 보통 어떻게 되나?',o:[['재현율은 오르고 정밀도는 내려간다',1,'더 많이 막으니 놓친 사기는 줄지만, 잘못 막는 정상 고객이 늘어난다. 02장 슬라이더로 확인할 수 있다.'],['둘 다 오른다',0,'둘은 대개 맞바꾸는 관계다. 둘 다 오르려면 문턱이 아니라 모델 자체가 좋아져야 한다.'],['정확도만 오른다',0,'드문 사건에서는 막을수록 정상 고객을 잘못 막아 정확도가 오히려 내려가기 쉽다.']]},
 {q:'오차가 [4, −4, 4, −4] 인 모델과 [0, 0, 0, 16] 인 모델이 있다. 두 모델의 MAE와 RMSE는?',o:[['MAE는 둘 다 4, RMSE는 4와 8',1,'MAE = 절댓값 평균이라 둘 다 4. RMSE = √(제곱 평균)이라 √16 = 4와 √64 = 8이다. 큰 실수 하나가 RMSE를 키운다.'],['MAE도 RMSE도 같다',0,'RMSE는 제곱을 하므로 큰 오차가 한 번 있는 쪽이 커진다.'],['MAE는 4와 16, RMSE는 같다',0,'16을 네 건으로 나누면 평균 4다.']]}]};

var PROMPTS=[
 {t:'① 내 분류 모델의 혼동 행렬 읽기',use:'정확도는 높은데 쓸모가 의심될 때',p:'내 분류 모델의 예측과 정답이 아래와 같다. 혼동 행렬을 만들고 정확도·정밀도·재현율·F1을 계산해 줘. 그리고 양성 비율(〔예) 2%〕)을 고려할 때 정확도가 믿을 만한지, "전부 음성" 기준선과 비교해 설명해 줘.\n\n- 문제: 〔예) 불량품 찾기, 양성 = 불량〕\n- 데이터: 〔예측 열과 정답 열이 있는 CSV 또는 표〕\n\n파이썬(scikit-learn) 코드도 붙여 줘.'},
 {t:'② 문턱 정하기',use:'놓침과 헛경보의 비용이 다를 때',p:'이진 분류 모델의 문턱을 정하려 한다. 놓친 양성 한 건의 비용은 〔예) 50만 원〕, 잘못 막은 음성 한 건의 비용은 〔예) 1만 원〕이다. 검증 데이터의 예측 확률로 문턱을 0.01 간격으로 바꿔 가며 총비용이 가장 작은 문턱을 찾는 코드를 써 줘. 시험 데이터는 문턱을 고른 뒤 한 번만 쓰도록 나눠 줘.'},
 {t:'③ 불균형 데이터 대응',use:'한쪽 정답이 아주 드물 때',p:'양성이 〔예) 1%〕뿐인 데이터로 분류 모델을 만든다. 1) 왜 정확도 대신 정밀도·재현율·PR 곡선을 봐야 하는지 2) class_weight, 표본 다시 뽑기(오버·언더샘플링), 문턱 조정의 차이와 주의점 3) 교차 검증할 때 층화(stratify)가 필요한 이유를 정리해 줘. 예시 코드도 붙여 줘.'},
 {t:'④ 회귀 지표 고르기',use:'MAE와 RMSE 중 무엇을 보고할지 정할 때',p:'〔예) 배달 도착 시간〕 예측 모델의 성능을 보고하려 한다. MAE, RMSE, MAPE의 뜻과 장단점을 표로 비교하고, 큰 오차가 특히 위험한 경우와 아닌 경우 각각 무엇을 주 지표로 삼으면 좋을지 알려 줘. 같은 예측으로 세 지표를 계산하는 파이썬 코드도 써 줘.'}];
var GL=[
 ['장부','혼동 행렬','정답(행)과 모델의 판단(열)을 나눠 센 네 칸 표.'],['장부','참양성','진짜 양성을 양성이라고 맞힌 경우. 여기서는 맞힌 사기.'],['장부','거짓음성','진짜 양성을 음성이라고 놓친 경우. 놓친 사기.'],['장부','거짓양성','진짜 음성을 양성이라고 잘못 막은 경우. 헛경보.'],['장부','참음성','진짜 음성을 음성이라고 맞힌 경우.'],
 ['지표','정확도','맞힌 개수 ÷ 전체. 한쪽이 드물면 믿기 어렵다.'],['지표','정밀도','양성이라고 한 것 중 진짜 양성의 비율.'],['지표','재현율','진짜 양성 중 잡아낸 비율. 민감도라고도 한다.'],['지표','F1','정밀도와 재현율의 조화 평균. 둘 중 낮은 쪽에 끌려간다.'],
 ['지표','PR 곡선','문턱을 바꿀 때 정밀도와 재현율이 함께 움직이는 길.'],['판단','문턱','확률을 "막음/통과"로 바꾸는 기준값.'],['데이터','불균형 데이터','한쪽 정답이 다른 쪽보다 훨씬 드문 데이터.'],['데이터','기준선','가장 단순한 답(예: 전부 정상). 모든 모델이 먼저 이겨야 할 상대.'],
 ['회귀','MAE','평균 절대 오차. 오차 크기를 그대로 평균.'],['회귀','RMSE','제곱 평균 제곱근 오차. 큰 오차에 벌점을 더 준다.']];
var ANALOGY=[
 ['정확도의 함정','"우리 동네 화재는 1년에 하루뿐이니, 매일 \'불 안 남\'이라고 하면 99.7% 맞는다"는 예보관',1,'','실제 예보관은 이런 답이 쓸모없다는 걸 알지만, 정확도라는 숫자는 모른다'],
 ['재현율','화재 경보가 실제 불을 놓치지 않는 비율',2,'위험 신호에 민감하게 반응하는 회피 행동','생물은 비용을 계산해 문턱을 고르지 않는다'],
 ['정밀도','경보가 울렸을 때 진짜 불일 확률',1,'','경보가 너무 자주 헛울리면 사람들이 무시하게 된다. 지표에는 이 효과가 들어 있지 않다'],
 ['RMSE','지각 열 번 중 한 번 크게 늦은 것을 유난히 크게 기억하는 손님',1,'','손님의 기억은 제곱 규칙을 정확히 따르지 않는다. RMSE는 늘 같은 규칙으로 벌점을 준다']];
var REFS=[
 'Saito, T., &amp; Rehmsmeier, M. (2015). The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. <i>PLOS ONE</i>, 10(3), e0118432. — 불균형 데이터와 PR 곡선',
 'Davis, J., &amp; Goadrich, M. (2006). The relationship between precision-recall and ROC curves. <i>Proceedings of the 23rd International Conference on Machine Learning (ICML)</i>, 233–240.',
 'Powers, D. M. W. (2011). Evaluation: From precision, recall and F-measure to ROC, informedness, markedness and correlation. <i>Journal of Machine Learning Technologies</i>, 2(1), 37–63. — 혼동 행렬 지표 정리',
 'Willmott, C. J., &amp; Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean square error (RMSE) in assessing average model performance. <i>Climate Research</i>, 30, 79–82.',
 'Chai, T., &amp; Draxler, R. R. (2014). Root mean square error (RMSE) or mean absolute error (MAE)? – Arguments against avoiding RMSE in the literature. <i>Geoscientific Model Development</i>, 7, 1247–1250.'];
var TIP={who:'분류와 회귀를 한 번 만들어 본 학습자. 4-2·4-7을 읽었으면 좋다',goal:'① 혼동 행렬 네 칸을 읽고 정확도·정밀도·재현율·F1을 계산한다 ② 쏠린 데이터에서 정확도가 왜 속이는지 설명한다 ③ 문턱이 정밀도와 재현율을 맞바꾸는 것을 보인다 ④ MAE와 RMSE의 차이를 큰 오차 하나로 설명한다',time:'읽기 15분 · 슬라이더와 담판 10분 · Colab 10분',
 plans:[['강의형 30분','01장에서 "전부 정상" 장부를 먼저 보여 주고 정확도를 맞히게 한다 5분 → 02장 문턱 슬라이더를 학생과 함께 움직이며 "어디서 멈출까" 토론 10분 → 03장 큰 실수 버튼 5분 → 담판 10분.'],['실무 OJT 60분','사내 분류 모델의 예측 결과로 프롬프트 ①을 돌려 혼동 행렬을 만든다 20분 → 프롬프트 ②로 비용 기반 문턱을 정한다 25분 → 결과 공유 15분.'],['1:1 튜터링','담판 결과를 열기 전에 "정확도 99%가 왜 꼴찌일 수 있나"를 학습자가 먼저 설명하게 하고, 네 칸을 직접 채우게 한다.']],
 myths:[['정확도가 높으면 좋은 모델이다','한쪽이 드물면 "전부 다수 쪽"만으로도 정확도가 높다. 기준선과 비교하고 재현율을 함께 본다'],['정밀도와 재현율은 둘 다 올릴 수 있다','같은 모델에서 문턱만 바꾸면 하나를 얻고 하나를 내준다. 둘 다 올리려면 모델이 좋아져야 한다'],['RMSE가 MAE보다 늘 좋은 지표다','큰 오차가 특히 위험할 때 RMSE가 낫고, 오차 크기를 그대로 보고 싶으면 MAE가 낫다. 목적이 정한다']]};
var CODE={title:'정확도 99%의 함정',sub:'담판 재현 · numpy, scikit-learn · CPU 몇 초',file:'imbalanced_metrics',
 desc:'담판을 옮겼다. 사기가 1%인 거래 데이터에서 "전부 정상" 기준선과 로지스틱 회귀를 비교한다. 혼동 행렬·정밀도·재현율·F1을 계산하고, 문턱을 바꿔 가며 정밀도와 재현율이 맞바뀌는 것을 본다. 끝으로 MAE와 RMSE를 큰 오차 하나로 비교한다.',
 cap:'실행 결과 (scikit-learn 1.x, CPU). 데이터 규칙은 브라우저와 같지만 난수 생성기와 학습 구현이 달라 숫자는 조금 다르다. 결론(전부 정상은 정확도 99%에 재현율 0%, 문턱을 내리면 재현율이 오르고 정밀도가 내려간다)은 같다.'};
