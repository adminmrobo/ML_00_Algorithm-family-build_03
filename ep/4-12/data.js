/* ══ 4-12 데이터 (규칙으로 만든 예시, 난수 고정) ══ */
var LEDG=(function(){
/* 거래 한 건: 결제 금액(만 원)과 평소 결제 장소에서 떨어진 거리(km). 사기는 금액이 크고 멀리서 일어나는 경향 — 겹치는 부분도 있다 */
function tx(r,fraud){var a,d;
  if(fraud){a=Math.exp(Math.log(60)+ML.N(r)*0.75);d=Math.exp(Math.log(90)+ML.N(r)*0.9);}
  else{a=Math.exp(Math.log(12)+ML.N(r)*0.85);d=Math.exp(Math.log(6)+ML.N(r)*1.0);}
  return {a:Math.min(a,900),d:Math.min(d,2000),y:fraud?1:0};}
function make(seed,n,nf){var r=ML.R(seed),D=[];for(var i=0;i<n;i++)D.push(tx(r,i<nf));return ML.shuffle(D,ML.R(seed+1));}
function feat(t){return [Math.log(t.a),Math.log(t.d)];}
/* 배울 거래 3,000건(사기 30건)과 처음 보는 거래 1,000건(사기 10건) */
function world(fraudRate){var nfTr=Math.round(3000*fraudRate),nfTe=Math.round(1000*fraudRate);
  var TR=make(1201,3000,nfTr),TE=make(1207,1000,nfTe),sc=ML.scaler(TR.map(feat));
  var X=TR.map(function(t){return sc.t(feat(t))}),Y=TR.map(function(t){return t.y});
  var lg=ML.logfit(X,Y,1500,1.5);
  function p(t){return lg.prob(sc.t(feat(t)))}
  TR.forEach(function(t){t.p=p(t)});TE.forEach(function(t){t.p=p(t)});
  /* 문턱은 배울 데이터에서 F1이 가장 높은 값으로 고른다(처음 보는 데이터는 보지 않는다) */
  var best={f:-1,th:.5};for(var th=0.01;th<0.96;th+=0.01){var c=cm(TR,th),f=c.f1;if(f>best.f)best={f:f,th:Math.round(th*100)/100};}
  return {TR:TR,TE:TE,lg:lg,sc:sc,th:best.th,thTrainF1:best.f};}
/* 혼동 행렬과 지표. 양성(1) = 사기 */
function cm(D,th){var tp=0,fn=0,fp=0,tn=0;D.forEach(function(t){var g=t.p>=th;if(t.y){g?tp++:fn++;}else{g?fp++:tn++;}});
  var pr=tp+fp?tp/(tp+fp):null,re=tp+fn?tp/(tp+fn):0,f1=pr&&re?2*pr*re/(pr+re):0;
  return {tp:tp,fn:fn,fp:fp,tn:tn,acc:(tp+tn)/D.length,pr:pr,re:re,f1:f1,flag:tp+fp};}
/* 정밀도–재현율 곡선 (문턱을 높은 값부터 내리며) */
function prCurve(D){var S=D.slice().sort(function(a,b){return b.p-a.p}),P=D.filter(function(t){return t.y}).length,tp=0,fp=0,out=[];
  S.forEach(function(t){if(t.y)tp++;else fp++;out.push({re:tp/P,pr:tp/(tp+fp),th:t.p});});return out;}
/* 회귀 지표: 배달 시간 예측 오차(분) */
var ERR_A=[3,-4,5,-3,4,-5,3,-4,5,-4], ERR_B=[1,-1,0,1,-1,0,1,0,-1,36];
function mae(e){return e.reduce(function(s,v){return s+Math.abs(v)},0)/e.length}
function rmse(e){return Math.sqrt(e.reduce(function(s,v){return s+v*v},0)/e.length)}
return {world:world,cm:cm,prCurve:prCurve,ERR_A:ERR_A,ERR_B:ERR_B,mae:mae,rmse:rmse};})();
