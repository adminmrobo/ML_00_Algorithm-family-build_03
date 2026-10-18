/* ══ 4-11 데이터 (규칙으로 만든 예시, 난수 고정) ══ */
var FAIR=(function(){
/* 대출 상환 흉내: 특징 200개. 진짜로 쓸모 있는 건 소득(0)·부채비율(1)·근속(2) 셋, 나머지 197개는 뜻 없는 잡음 */
var NF=200;
function gen(n,seed,flip){var r=ML.R(seed),D=[];flip=flip==null?.03:flip;for(var i=0;i<n;i++){var x=[];for(var j=0;j<NF;j++)x.push(ML.N(r));
  var s=1.2*x[0]-1.0*x[1]+0.6*x[2],y=s+ML.N(r)*0.35>0?1:0;if(r()<flip)y=1-y;
  x[0]=3000+800*x[0];x[2]=10+5*x[2];D.push({x:x,y:y});}return D;}
function stats(D){var d=NF,mu=[],sd=[];for(var j=0;j<d;j++){var m=0;D.forEach(function(p){m+=p.x[j]/D.length});var v=0;D.forEach(function(p){v+=(p.x[j]-m)*(p.x[j]-m)/D.length});mu.push(m);sd.push(Math.sqrt(v)||1);}return {mu:mu,sd:sd};}
/* 정답과의 상관이 큰 특징 순서 (주어진 데이터로만 잰다) */
function rank(D,s){var ym=ML.mean(D.map(function(p){return p.y})),sc=[];for(var j=0;j<NF;j++){var c=0;D.forEach(function(p){c+=((p.x[j]-s.mu[j])/s.sd[j])*(p.y-ym)});sc.push([Math.abs(c),j]);}
  return sc.sort(function(a,b){return b[0]-a[0]}).map(function(v){return v[1]});}
/* 모델: 고른 특징 m개로 로지스틱 회귀 */
function fit(D,s,feats){var X=D.map(function(p){return feats.map(function(j){return (p.x[j]-s.mu[j])/s.sd[j]})});var lg=ML.logfit(X,D.map(function(p){return p.y}),250,1);
  return {feats:feats,predict:function(x){return lg.predict(feats.map(function(j){return (x[j]-s.mu[j])/s.sd[j]}))}};}
function acc(m,D){var s=0;D.forEach(function(p){if(m.predict(p.x)===p.y)s++;});return s/D.length;}
var MS=[];for(var i=1;i<=20;i++)MS.push(i);
/* 한 판: 훈련 120 · 검증 40 · 시험 40, 그리고 배포 뒤 새 데이터 1,000건 */
function world(seed){var all=gen(200,seed),fresh=gen(1000,seed+7777);return {tr:all.slice(0,120),va:all.slice(120,160),te:all.slice(160,200),fresh:fresh};}
/* 올바른 절차: 표준화·특징 순위는 훈련으로만, 특징 수 m은 검증으로 고르고, 시험은 한 번 */
function proper(W){var s=stats(W.tr),rk=rank(W.tr,s),best=null,trace=[];
  MS.forEach(function(m){var md=fit(W.tr,s,rk.slice(0,m)),a=acc(md,W.va);trace.push([m,a]);if(!best||a>best.va)best={m:m,va:a,md:md};});
  return {m:best.m,va:best.va,te:acc(best.md,W.te),fresh:acc(best.md,W.fresh),trace:trace,feats:best.md.feats};}
/* 누수①: 표준화와 특징 순위를 훈련·검증·시험 전체로 정한 뒤 나머지는 같게 */
function leakPre(W){var A=W.tr.concat(W.va,W.te),s=stats(A),rk=rank(A,s),best=null;
  MS.forEach(function(m){var md=fit(W.tr,s,rk.slice(0,m)),a=acc(md,W.va);if(!best||a>best.va)best={m:m,va:a,md:md};});
  return {m:best.m,va:best.va,te:acc(best.md,W.te),fresh:acc(best.md,W.fresh),feats:best.md.feats};}
/* 누수②: 시험 점수를 보며 m을 스무 번 바꿔 가장 높은 것을 고른다 */
function leakTest(W){var s=stats(W.tr),rk=rank(W.tr,s),best=null,trace=[];
  MS.forEach(function(m){var md=fit(W.tr,s,rk.slice(0,m)),a=acc(md,W.te);trace.push([m,a]);if(!best||a>best.te)best={m:m,te:a,md:md};});
  return {m:best.m,te:best.te,fresh:acc(best.md,W.fresh),trace:trace};}
/* 누수①+②: 전체로 전처리하고 시험 점수로 고르기 (Money-Robo의 방식) */
function leakAll(W){var A=W.tr.concat(W.va,W.te),s=stats(A),rk=rank(A,s),best=null,trace=[];
  MS.forEach(function(m){var md=fit(W.tr.concat(W.va),s,rk.slice(0,m)),a=acc(md,W.te);trace.push([m,a]);if(!best||a>best.te)best={m:m,te:a,md:md};});
  return {m:best.m,te:best.te,fresh:acc(best.md,W.fresh),trace:trace};}
/* k겹 교차 검증 (훈련+검증 240건으로 m 고르기) */
function cvPick(W,fold){var D=W.tr.concat(W.va),n=D.length,sz=Math.floor(n/fold),score={};MS.forEach(function(m){score[m]=[];});
  for(var f=0;f<fold;f++){var va=D.slice(f*sz,(f+1)*sz),tr=D.slice(0,f*sz).concat(D.slice((f+1)*sz)),s=stats(tr),rk=rank(tr,s);MS.forEach(function(m){score[m].push(acc(fit(tr,s,rk.slice(0,m)),va));});}
  var best=null;MS.forEach(function(m){var mu=ML.mean(score[m]);if(!best||mu>best.mean)best={m:m,mean:mu,folds:score[m]};});
  var s=stats(D),rk=rank(D,s),md=fit(D,s,rk.slice(0,best.m));best.te=acc(md,W.te);best.fresh=acc(md,W.fresh);
  var mu=best.mean;best.sd=Math.sqrt(ML.mean(best.folds.map(function(v){return (v-mu)*(v-mu)})));return best;}
/* 기준선: 가장 많은 쪽으로 다 찍기 */
function baseline(W){var p=ML.mean(W.tr.map(function(d){return d.y})),c=p>=.5?1:0;return {c:c,te:ML.mean(W.te.map(function(d){return d.y===c?1:0})),fresh:ML.mean(W.fresh.map(function(d){return d.y===c?1:0}))};}
return {NF:NF,gen:gen,stats:stats,rank:rank,fit:fit,acc:acc,MS:MS,world:world,proper:proper,leakPre:leakPre,leakTest:leakTest,leakAll:leakAll,cvPick:cvPick,baseline:baseline};})();
if(typeof module!=='undefined')module.exports=FAIR;
