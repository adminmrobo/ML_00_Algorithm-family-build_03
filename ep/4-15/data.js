/* ══ 4-15 데이터 (규칙으로 만든 예시, 난수 고정) ══ */
var FIN=(function(){
/* 대출 심사 표 데이터: 특징 8개 (4-10과 같은 규칙, 잡음 3%) */
var FEAT=['소득','부채 비율','근속 연수','신용 이력 길이','저축 여부','나이','거주 기간','문의 횟수'];
function loan(seed,noise,n){var r=ML.R(seed),D=[];for(var i=0;i<n;i++){var x=[];for(var j=0;j<8;j++)x.push(ML.N(r));
  var s=1.2*x[0]-1.0*x[1]+0.8*x[2]*x[3]+(x[4]>0.3?1:-0.5)+0.5*Math.sin(2*x[5]);var y=s>0?1:0;if(r()<noise)y=1-y;D.push({x:x,y:y});}return D;}
function XY(A){return [A.map(function(d){return d.x}),A.map(function(d){return d.y})];}
function now(){return (typeof performance!=='undefined'?performance:Date).now();}
/* 예측 1건에 걸리는 시간(µs): 검증 데이터를 50ms 넘게 되풀이해 평균 */
function perRow(f,X){var n=0,t0=now(),s=0;do{for(var i=0;i<X.length;i++)s+=f(X[i]);n+=X.length;}while(now()-t0<50);return (now()-t0)*1000/n;}
/* 한 벌: 로지스틱(표준화) vs 큰 앙상블(GBM 두 벌 + 랜덤 포레스트의 확률 평균) */
function one(s){var D=loan(150+s,0.03,800),sp=ML.split(D,0.7,9+s),t=XY(sp[0]),v=XY(sp[1]);
  var t0=now(),sc=ML.scaler(t[0]),Z=t[0].map(sc.t),lg=ML.logfit(Z,t[1],800,0.5),tl=now()-t0;
  var L={prob:function(x){return lg.prob(sc.t(x))},predict:function(x){return lg.prob(sc.t(x))>=.5?1:0}};
  t0=now();var g1=ML.gbmClf(t[0],t[1],60,0.1,3),rf=ML.forest(t[0],t[1],25,8,3+s,3),g2=ML.gbmClf(t[0],t[1],40,0.15,4),te=now()-t0;
  var E={prob:function(x){return (g1.prob(x)+rf.vote(x)+g2.prob(x))/3},predict:function(x){return this.prob(x)>=.5?1:0}};
  return {L:L,E:E,lg:lg,sc:sc,la:ML.acc(L,v[0],v[1]),ea:ML.acc(E,v[0],v[1]),tl:tl,te:te,lp:perRow(function(x){return L.prob(x)},v[0]),ep:perRow(function(x){return E.prob(x)},v[0]),nv:v[0].length,
    size:{l:9,e:countNodes(g1.trees)+countNodes(g2.trees)+rf.trees.reduce(function(a,tr){return a+nodes(tr.root)},0)}};}
function nodes(n){return n.leaf?1:1+nodes(n.l)+nodes(n.r)}
function countNodes(T){return T.reduce(function(a,t){return a+nodes(t.root)},0)}
/* 세 벌 평균 */
async function duel(p){var o={la:0,ea:0,tl:0,te:0,lp:0,ep:0,rows:[],w:null,size:null},S=[1,2,3];
  for(var k=0;k<S.length;k++){var r=one(S[k]);o.la+=r.la/3;o.ea+=r.ea/3;o.tl+=r.tl/3;o.te+=r.te/3;o.lp+=r.lp/3;o.ep+=r.ep/3;o.rows.push([S[k],r.la,r.ea]);if(!o.w){o.w=r.lg.w.slice();o.size=r.size;o.nv=r.nv;}if(p)p((k+1)/3);await wait(10);}
  return o;}
/* 시즌 15구역 담판 한 줄 */
var RECAP={'4-1':'같은 매출 데이터, 분류 vs 회귀','4-2':'트리 깊이 3 vs 끝까지','4-3':'결제액 나누기 vs K-평균','4-4':'탐험 10% vs 몰빵','4-5':'위원 한 명 vs 스물다섯 명',
 '4-6':'휜 데이터: 선형 회귀 vs GBM 회귀','4-7':'동심원: 로지스틱 vs 랜덤 포레스트','4-8':'초승달: DBSCAN vs K-Means','4-9':'미로 크기: Q 표 vs 근사 Q','4-10':'표 데이터: 랜덤 포레스트 vs GBM',
 '4-11':'시험지를 본 점수는 실격','4-12':'사기 1%: 재현율 vs 정확도 99%','4-13':'군집 수: t-SNE 그림 vs 실루엣','4-14':'보상 설계: 청소한 칸 vs 누적 보상','4-15':'배포: 로지스틱 vs 큰 앙상블'};
/* 조직도 포스터: 34칸 */
var POSTER=[
 {fam:'sup',p:'회귀파',ep:'4-6',m:['선형 회귀','Ridge','Lasso','Elastic Net','SVR','결정 트리 회귀','GBM 회귀']},
 {fam:'sup',p:'분류파',ep:'4-7',m:['로지스틱 회귀','SVM','KNN','나이브 베이즈','결정 트리','랜덤 포레스트*','GBM*','XGBoost·LightGBM·CatBoost']},
 {fam:'uns',p:'군집파',ep:'4-8',m:['K-Means','K-Medoids','DBSCAN','계층적 군집','GMM']},
 {fam:'uns',p:'차원축소파',ep:'4-8',m:['PCA','t-SNE','UMAP','오토인코더']},
 {fam:'rl',p:'강화 삼대',ep:'4-9',m:['Q-Learning','DQN','PPO']},
 {fam:'ens',p:'배깅파',ep:'4-10',m:['배깅','랜덤 포레스트*','Extra Trees']},
 {fam:'ens',p:'부스팅파',ep:'4-10',m:['GBM*','XGBoost','LightGBM','CatBoost']}];
return {FEAT:FEAT,loan:loan,duel:duel,RECAP:RECAP,POSTER:POSTER};})();
