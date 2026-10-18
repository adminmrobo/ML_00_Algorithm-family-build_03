/* ══ 4-14 데이터: 먼지 청소 방과 보상 세 가지 (규칙으로 만든 예시, 난수 고정) ══ */
var RLM=(function(){
/* 방: 5×5, 충전기(출발점)는 왼쪽 위 0번 칸. 먼지 칸 8개. 한 판은 40걸음. */
var N=5,T=40,DX=[0,1,0,-1],DY=[-1,0,1,0];
var LAYOUT={A:{dust:[2,4,7,11,13,17,20,23],wall:[6,18],name:'원래 방'},B:{dust:[1,9,10,12,16,19,21,24],wall:[8,15],name:'처음 보는 방'}};
/* 보상 설계: 1 = 먼지 무늬 칸을 밟을 때마다 +1 (이미 치운 칸도) / 2 = 처음 치울 때만 +1, 다시 밟으면 0, 걸음마다 −0.01 / 3 = 1번 + 충전기로 돌아오면 +5 (판 끝) */
var DESIGN={1:'먼지 칸을 밟을 때마다 +1',2:'처음 치울 때만 +1 · 걸음마다 −0.01',3:'1번 + 충전기 도착 +5'};
function env(L){var W={},D={};L.wall.forEach(function(w){W[w]=1});L.dust.forEach(function(d,i){D[d]=i});return {W:W,D:D,n:L.dust.length,L:L};}
function move(E,s,a){var x=s%N,y=Math.floor(s/N),nx=x+DX[a],ny=y+DY[a];if(nx<0||ny<0||nx>=N||ny>=N||E.W[ny*N+nx])return s;return ny*N+nx;}
/* 한 걸음: 상태 = (위치, 치운 먼지 묶음). 벽에 막혀 제자리면 밟은 것으로 치지 않는다 */
function step(E,des,pos,mask,a,t){var np=move(E,pos,a),r=0,nm=mask,done=false,di=E.D[np];
  if(des===2)r-=0.01;
  if(di!==undefined&&np!==pos){var first=!(mask&(1<<di));nm=mask|(1<<di);if(des===2){if(first)r+=1;}else r+=1;}
  if(des===3&&np===0&&t>0){r+=5;done=true;}
  return {p:np,m:nm,r:r,done:done};}
function key(p,m){return m*N*N+p}
/* Q-러닝 학습. 기록: 판마다 받은 보상의 합 */
function train(L,des,seed,episodes,opt){opt=opt||{};var E=env(L),r=ML.R(seed),Q={},al=opt.alpha||.3,ga=opt.gamma||.95,curve=[];
  function q(k){return Q[k]||(Q[k]=[0,0,0,0])}
  for(var e=0;e<episodes;e++){var eps=Math.max(.05,1-e/(episodes*.7)),p=0,m=0,tot=0;
    for(var t=0;t<T;t++){var k=key(p,m),qv=q(k),a;if(r()<eps)a=Math.floor(r()*4);else{var mx=Math.max.apply(null,qv),c=[];qv.forEach(function(v,i){if(v===mx)c.push(i)});a=c[Math.floor(r()*c.length)];}
      var o=step(E,des,p,m,a,t),nq=q(key(o.p,o.m)),tg=o.r+(o.done?0:ga*Math.max.apply(null,nq));qv[a]+=al*(tg-qv[a]);tot+=o.r;p=o.p;m=o.m;if(o.done)break;}
    curve.push(tot);}
  return {Q:Q,curve:curve,E:E};}
/* 배운 대로(탐험 없이) 한 판 돌리기. 다른 방(L2)에서 돌리면 처음 보는 배치 시험 */
function rollout(model,des,L2){var E=L2?env(L2):model.E,p=0,m=0,tot=0,path=[0],cleaned={},vis={};
  for(var t=0;t<T;t++){var qv=model.Q[key(p,m)]||[0,0,0,0],mx=Math.max.apply(null,qv),a=qv.indexOf(mx);
    var o=step(E,des,p,m,a,t);tot+=o.r;p=o.p;m=o.m;path.push(p);vis[p]=(vis[p]||0)+1;if(E.D[p]!==undefined)cleaned[p]=1;if(o.done)break;}
  var nc=Object.keys(cleaned).length,maxv=0,mv=-1;Object.keys(vis).forEach(function(k){if(E.D[k]!==undefined&&vis[k]>maxv){maxv=vis[k];mv=+k;}});
  return {total:tot,clean:nc/E.n,cleanN:nc,n:E.n,path:path,maxVisit:maxv,maxCell:mv,steps:path.length-1};}
/* 시드 여러 개로 학습·평가 */
var cache={};
function run(des,seeds,layout,episodes){var k=des+'|'+seeds.join(',')+'|'+layout+'|'+(episodes||1500);if(cache[k])return cache[k];
  var L=LAYOUT[layout||'A'],out=seeds.map(function(s){var md=train(L,des,s,episodes||1500);var ro=rollout(md,des);return {seed:s,model:md,ro:ro,curve:md.curve};});
  var o={runs:out,total:ML.mean(out.map(function(x){return x.ro.total})),clean:ML.mean(out.map(function(x){return x.ro.clean})),
    totals:out.map(function(x){return x.ro.total}),cleans:out.map(function(x){return x.ro.clean})};cache[k]=o;return o;}
var SEEDS=[11,12,13,14,15];
return {N:N,T:T,LAYOUT:LAYOUT,DESIGN:DESIGN,env:env,train:train,rollout:rollout,run:run,SEEDS:SEEDS,key:key};})();
