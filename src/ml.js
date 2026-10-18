/* ══ ML: 작은 학습 엔진 (브라우저와 node에서 같은 코드) ═════════════ */
var ML=(function(){
function R(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function N(r){var u=0;while(!u)u=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*r())}
function sig(z){return 1/(1+Math.exp(-z))}
function mean(a){var s=0;for(var i=0;i<a.length;i++)s+=a[i];return s/a.length}
/* 섞어서 나누기 */
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a}
function split(D,frac,seed){var s=shuffle(D,R(seed)),k=Math.round(s.length*frac);return [s.slice(0,k),s.slice(k)]}

/* ── 선형 회귀 (특징 여러 개, 정규방정식) ── */
function solve(A,b){var n=b.length,M=A.map(function(r,i){return r.concat([b[i]])});
  for(var c=0;c<n;c++){var p=c;for(var r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;var t=M[c];M[c]=M[p];M[p]=t;
    for(r=0;r<n;r++){if(r===c)continue;var f=M[r][c]/M[c][c];for(var k=c;k<=n;k++)M[r][k]-=f*M[c][k];}}
  return M.map(function(r,i){return r[n]/r[i]});}
function linfit(X,y,l2){var d=X[0].length+1,A=[],b=[],i,j,k;for(i=0;i<d;i++){A.push(new Array(d).fill(0));b.push(0);}
  X.forEach(function(x,n){var v=[1].concat(x);for(i=0;i<d;i++){b[i]+=v[i]*y[n];for(j=0;j<d;j++)A[i][j]+=v[i]*v[j];}});
  if(l2)for(i=1;i<d;i++)A[i][i]+=l2;var w=solve(A,b);
  return {w:w,predict:function(x){var s=w[0];for(var i=0;i<x.length;i++)s+=w[i+1]*x[i];return s;}};}
function mae(m,X,y){var s=0;X.forEach(function(x,i){s+=Math.abs(m.predict(x)-y[i]);});return s/X.length}

/* ── 로지스틱 회귀 (경사 하강) ── */
function logfit(X,y,ep,lr){var d=X[0].length,w=new Array(d).fill(0),b=0,n=X.length;
  for(var e=0;e<ep;e++){var g=new Array(d).fill(0),gb=0;for(var i=0;i<n;i++){var z=b;for(var k=0;k<d;k++)z+=w[k]*X[i][k];var p=sig(z)-y[i];for(k=0;k<d;k++)g[k]+=p*X[i][k];gb+=p;}
    for(k=0;k<d;k++)w[k]-=lr*g[k]/n;b-=lr*gb/n;}
  return {w:w,b:b,prob:function(x){var z=b;for(var k=0;k<d;k++)z+=w[k]*x[k];return sig(z);},predict:function(x){return this.prob(x)>=.5?1:0;}};}
function acc(m,X,y){var s=0;X.forEach(function(x,i){if(m.predict(x)===y[i])s++;});return s/X.length}

/* ── 결정 트리 분류 (지니, 깊이 제한) ── */
function gini(c){var n=c[0]+c[1];if(!n)return 0;var p=c[1]/n;return 2*p*(1-p)}
function tree(X,y,maxD,minLeaf,r,mtry,w){minLeaf=minLeaf||1;var d=X[0].length,idx=X.map(function(_,i){return i});w=w||X.map(function(){return 1});
  function leaf(ix){var c=[0,0];ix.forEach(function(i){c[y[i]]+=w[i];});return {leaf:1,v:c[1]>=c[0]?1:0,c:c};}
  function grow(ix,dep){var c=[0,0];ix.forEach(function(i){c[y[i]]+=w[i];});if(dep>=maxD||ix.length<2*minLeaf||!c[0]||!c[1])return leaf(ix);
    var best=null,feats=[];for(var f=0;f<d;f++)feats.push(f);if(mtry&&r)feats=shuffle(feats,r).slice(0,mtry);
    feats.forEach(function(f){var s=ix.slice().sort(function(a,b){return X[a][f]-X[b][f]}),L=[0,0],tot=c[0]+c[1];
      for(var k=0;k<s.length-1;k++){L[y[s[k]]]+=w[s[k]];if(k+1<minLeaf||s.length-k-1<minLeaf)continue;var a=X[s[k]][f],b=X[s[k+1]][f];if(a===b)continue;
        var Rr=[c[0]-L[0],c[1]-L[1]],nl=L[0]+L[1],nr=Rr[0]+Rr[1],g=(nl*gini(L)+nr*gini(Rr))/tot;if(!best||g<best.g)best={g:g,f:f,t:(a+b)/2};}});
    if(!best||best.g>=gini(c)-1e-12)return leaf(ix);
    var li=[],ri=[];ix.forEach(function(i){(X[i][best.f]<=best.t?li:ri).push(i);});
    return {f:best.f,t:best.t,l:grow(li,dep+1),r:grow(ri,dep+1)};}
  var root=grow(idx,0);
  function pred(x){var n=root;while(!n.leaf)n=x[n.f]<=n.t?n.l:n.r;return n.v;}
  function leaves(n){return n.leaf?1:leaves(n.l)+leaves(n.r)}
  return {root:root,predict:pred,leaves:leaves(root)};}

/* ── 배깅(랜덤 포레스트 흉내)과 다수결 ── */
function forest(X,y,nT,maxD,seed,mtry){var r=R(seed),T=[];for(var t=0;t<nT;t++){var bx=[],by=[];for(var i=0;i<X.length;i++){var j=Math.floor(r()*X.length);bx.push(X[j]);by.push(y[j]);}T.push(tree(bx,by,maxD,1,r,mtry));}
  return {trees:T,predict:function(x){var v=0;T.forEach(function(t){v+=t.predict(x);});return v*2>=T.length?1:0;},vote:function(x){var v=0;T.forEach(function(t){v+=t.predict(x);});return v/T.length;}};}
/* ── 부스팅(AdaBoost, 그루터기) ── */
function adaboost(X,y,M){var n=X.length,w=X.map(function(){return 1/n}),H=[],hist=[];
  for(var m=0;m<M;m++){var st=tree(X,y,1,1,null,null,w),err=0;X.forEach(function(x,i){if(st.predict(x)!==y[i])err+=w[i];});err=Math.max(err,1e-9);var a=.5*Math.log((1-err)/err);
    H.push({t:st,a:a});w=w.map(function(wi,i){return wi*Math.exp(st.predict(X[i])!==y[i]?a:-a);});var s=w.reduce(function(p,q){return p+q},0);w=w.map(function(v){return v/s});hist.push(w.slice());}
  return {H:H,weights:hist,predict:function(x){var s=0;H.forEach(function(h){s+=h.a*(h.t.predict(x)?1:-1);});return s>=0?1:0;}};}

/* ── K-평균 (단계별) ── */
function kmeans(P,k,seed,iters){var r=R(seed),C=shuffle(P,r).slice(0,k).map(function(p){return p.slice()}),steps=[],a=P.map(function(){return 0});
  for(var it=0;it<(iters||20);it++){var ch=0;P.forEach(function(p,i){var bi=0,bd=1e18;C.forEach(function(c,j){var dd=0;for(var q=0;q<p.length;q++)dd+=(p[q]-c[q])*(p[q]-c[q]);if(dd<bd){bd=dd;bi=j;}});if(a[i]!==bi||it===0)ch++;a[i]=bi;});
    steps.push({C:C.map(function(c){return c.slice()}),a:a.slice()});
    C=C.map(function(c,j){var s=c.map(function(){return 0}),n=0;P.forEach(function(p,i){if(a[i]===j){n++;p.forEach(function(v,q){s[q]+=v;});}});return n?s.map(function(v){return v/n}):c;});
    if(!ch&&it>0)break;}
  var sse=0;P.forEach(function(p,i){var c=C[a[i]];p.forEach(function(v,q){sse+=(v-c[q])*(v-c[q]);});});
  return {C:C,a:a,steps:steps,sse:sse};}
/* 군집 번호와 숨긴 정답의 겹침(가장 잘 맞는 짝 맞추기) */
function overlap(a,t,k){var perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]],best=0;if(k===2)perms=[[0,1],[1,0]];
  perms.forEach(function(p){var s=0;a.forEach(function(v,i){if(p[v]===t[i])s++;});best=Math.max(best,s);});return best/a.length;}

/* ── 주성분 분석 (거듭제곱법) ── */
function pca(P,nc){var d=P[0].length,mu=new Array(d).fill(0);P.forEach(function(p){p.forEach(function(v,q){mu[q]+=v/P.length;});});
  var Z=P.map(function(p){return p.map(function(v,q){return v-mu[q]})}),Cv=[];for(var i=0;i<d;i++){Cv.push(new Array(d).fill(0));}
  Z.forEach(function(z){for(var i=0;i<d;i++)for(var j=0;j<d;j++)Cv[i][j]+=z[i]*z[j]/(P.length-1);});
  var tot=0;for(i=0;i<d;i++)tot+=Cv[i][i];var comps=[],vals=[],M=Cv.map(function(r){return r.slice()});
  for(var c=0;c<nc;c++){var v=new Array(d).fill(0).map(function(_,q){return 1/(q+1.3)});for(var it=0;it<300;it++){var nv=M.map(function(r){return r.reduce(function(s,x,j){return s+x*v[j]},0)});var nn=Math.hypot.apply(null,nv);v=nv.map(function(x){return x/nn});}
    var lam=M.map(function(r){return r.reduce(function(s,x,j){return s+x*v[j]},0)}).reduce(function(s,x,i){return s+x*v[i]},0);comps.push(v);vals.push(lam);
    for(i=0;i<d;i++)for(var j=0;j<d;j++)M[i][j]-=lam*v[i]*v[j];}
  return {mu:mu,comps:comps,ratio:vals.map(function(l){return l/tot}),proj:Z.map(function(z){return comps.map(function(v){return z.reduce(function(s,x,i){return s+x*v[i]},0)})})};}

/* ── 두 갈래 선택(밴딧) ── */
function bandit(eps,T,pA,pB,switchAt,seed){var r=R(seed),Q=[0,0],n=[0,0],tot=0,curve=[],pulls=[];
  for(var t=0;t<T;t++){var p=t<switchAt?[pA,pB]:[pB,pA],a;
    if(r()<eps)a=r()<.5?0:1;else a=Q[0]===Q[1]?(r()<.5?0:1):(Q[0]>Q[1]?0:1);
    var rew=r()<p[a]?1:0;n[a]++;Q[a]+=(rew-Q[a])/n[a];tot+=rew;curve.push(tot);pulls.push(a);}
  return {total:tot,curve:curve,pulls:pulls,Q:Q};}
/* 상수 학습률판(최근 결과에 더 무게): Q ← Q + α(r − Q) */
function banditA(eps,alpha,T,pA,pB,switchAt,seed){var r=R(seed),Q=[0,0],tot=0,curve=[],pulls=[];
  for(var t=0;t<T;t++){var p=t<switchAt?[pA,pB]:[pB,pA],a;
    if(r()<eps)a=r()<.5?0:1;else a=Q[0]===Q[1]?(r()<.5?0:1):(Q[0]>Q[1]?0:1);
    var rew=r()<p[a]?1:0;Q[a]+=alpha*(rew-Q[a]);tot+=rew;curve.push(tot);pulls.push(a);}
  return {total:tot,curve:curve,pulls:pulls,Q:Q};}

/* ── 다수결 위원회 ── */
function choose(n,k){var c=1;for(var i=0;i<k;i++)c=c*(n-i)/(i+1);return c}
function majority(n,p){var s=0;for(var k=Math.floor(n/2)+1;k<=n;k++)s+=choose(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);return s}
/* 상관이 있는 위원: 문항마다 '함께 틀리는 몫' rho만큼은 한 번의 공통 판정을 모두가 따른다 */
function committeeSim(n,p,rho,Q,seed){var r=R(seed),ok=0;for(var q=0;q<Q;q++){var common=r()<p,v=0;for(var i=0;i<n;i++){var right=r()<rho?common:(r()<p);if(right)v++;}if(v*2>n)ok++;}return ok/Q}


/* ══ 2부 추가: 회귀·분류·군집·강화 조직원들 ══════════════════════ */
/* 표준화 (훈련 평균·표준편차로) */
function scaler(X){var d=X[0].length,mu=[],sd=[];for(var j=0;j<d;j++){var m=0;X.forEach(function(x){m+=x[j]/X.length;});var v=0;X.forEach(function(x){v+=(x[j]-m)*(x[j]-m)/X.length;});mu.push(m);sd.push(Math.sqrt(v)||1);}
  return {mu:mu,sd:sd,t:function(x){return x.map(function(v,j){return (v-mu[j])/sd[j]})}};}
/* ── Elastic Net (좌표 하강). alpha=0 → Ridge, alpha=1 → Lasso, lam=0 → 선형 ── */
function enet(X,y,lam,alpha,iters){var sc=scaler(X),Z=X.map(sc.t),n=Z.length,d=Z[0].length,ym=mean(y),w=new Array(d).fill(0),res=y.map(function(v){return v-ym});
  for(var it=0;it<(iters||300);it++){var mx=0;for(var j=0;j<d;j++){var rho=0,zz=0;for(var i=0;i<n;i++){rho+=Z[i][j]*(res[i]+Z[i][j]*w[j]);zz+=Z[i][j]*Z[i][j];}rho/=n;zz/=n;
    var l1=lam*alpha,l2=lam*(1-alpha),nw=(rho>l1?rho-l1:(rho<-l1?rho+l1:0))/(zz+l2),dw=nw-w[j];if(dw){for(i=0;i<n;i++)res[i]-=Z[i][j]*dw;w[j]=nw;mx=Math.max(mx,Math.abs(dw));}}if(mx<1e-7)break;}
  return {w:w,b:ym,sc:sc,coef:w.map(function(v,j){return v/sc.sd[j]}),predict:function(x){var z=sc.t(x),s=ym;for(var j=0;j<d;j++)s+=w[j]*z[j];return s;}};}
/* ── 회귀 트리 (제곱 오차, 깊이 제한). extra=1 이면 자르는 지점을 무작위로 ── */
function regTree(X,y,maxD,minLeaf,r,mtry,extra){minLeaf=minLeaf||1;var d=X[0].length;
  function avg(ix){var s=0;ix.forEach(function(i){s+=y[i];});return s/ix.length}
  function grow(ix,dep){var m=avg(ix);if(dep>=maxD||ix.length<2*minLeaf)return {leaf:1,v:m,n:ix.length};
    var feats=[];for(var f=0;f<d;f++)feats.push(f);if(mtry&&r)feats=shuffle(feats,r).slice(0,mtry);var best=null,S=0,SS=0;ix.forEach(function(i){S+=y[i];SS+=y[i]*y[i];});var base=SS-S*S/ix.length;
    feats.forEach(function(f){var s=ix.slice().sort(function(a,b){return X[a][f]-X[b][f]}),lo=X[s[0]][f],hi=X[s[s.length-1]][f];if(lo===hi)return;
      if(extra){var th=lo+(hi-lo)*r(),ls=0,lss=0,ln=0;s.forEach(function(i){if(X[i][f]<=th){ls+=y[i];lss+=y[i]*y[i];ln++;}});var rn=s.length-ln;if(ln<minLeaf||rn<minLeaf)return;
        var sse=lss-ls*ls/ln+(SS-lss)-(S-ls)*(S-ls)/rn;if(!best||sse<best.e)best={e:sse,f:f,t:th};return;}
      var L=0,LL=0;for(var k=0;k<s.length-1;k++){L+=y[s[k]];LL+=y[s[k]]*y[s[k]];var nl=k+1,nr=s.length-nl;if(nl<minLeaf||nr<minLeaf)continue;var a=X[s[k]][f],b=X[s[k+1]][f];if(a===b)continue;
        var e=LL-L*L/nl+(SS-LL)-(S-L)*(S-L)/nr;if(!best||e<best.e)best={e:e,f:f,t:(a+b)/2};}});
    if(!best||best.e>=base-1e-12)return {leaf:1,v:m,n:ix.length};var li=[],ri=[];ix.forEach(function(i){(X[i][best.f]<=best.t?li:ri).push(i);});
    return {f:best.f,t:best.t,l:grow(li,dep+1),r:grow(ri,dep+1)};}
  var root=grow(X.map(function(_,i){return i}),0);function pred(x){var n=root;while(!n.leaf)n=x[n.f]<=n.t?n.l:n.r;return n.v;}
  function leaves(n){return n.leaf?1:leaves(n.l)+leaves(n.r)}return {root:root,predict:pred,leaves:leaves(root)};}
/* ── GBM 회귀: 잔차를 다음 트리가 배운다. predictK(x,k) = 앞의 k그루까지 ── */
function gbmReg(X,y,M,lr,depth){var f0=mean(y),F=y.map(function(){return f0}),T=[];
  for(var m=0;m<M;m++){var res=y.map(function(v,i){return v-F[i]}),t=regTree(X,res,depth||2,3);T.push(t);F=F.map(function(v,i){return v+lr*t.predict(X[i])});}
  function pk(x,k){var s=f0;for(var m=0;m<k;m++)s+=lr*T[m].predict(x);return s;}
  return {trees:T,f0:f0,lr:lr,predictK:pk,predict:function(x){return pk(x,T.length)}};}
/* ── GBM 분류 (로그 손실, 잔차 = 정답 − 확률) ── */
function gbmClf(X,y,M,lr,depth){var p0=Math.min(Math.max(mean(y),1e-3),1-1e-3),f0=Math.log(p0/(1-p0)),F=y.map(function(){return f0}),T=[];
  for(var m=0;m<M;m++){var res=y.map(function(v,i){return v-sig(F[i])}),t=regTree(X,res,depth||3,3);
    T.push(t);F=F.map(function(v,i){return v+lr*4*t.predict(X[i])});}
  function fk(x,k){var s=f0;for(var m=0;m<k;m++)s+=lr*4*T[m].predict(x);return s;}
  return {trees:T,prob:function(x){return sig(fk(x,T.length))},probK:function(x,k){return sig(fk(x,k))},predict:function(x){return fk(x,T.length)>=0?1:0}};}
/* ── Extra Trees (분류): 자르는 특징·지점 모두 무작위, 부트스트랩 없음 ── */
function extraTrees(X,y,nT,maxD,seed){var r=R(seed),T=[];for(var t=0;t<nT;t++){var rt=regTree(X,y,maxD,1,r,1,1);T.push(rt);}
  return {trees:T,vote:function(x){var v=0;T.forEach(function(t){v+=t.predict(x)});return v/T.length},predict:function(x){return this.vote(x)>=.5?1:0}};}
/* ── K-최근접 이웃 ── */
function knn(X,y,k){return {predict:function(x){var D=X.map(function(p,i){var s=0;for(var j=0;j<p.length;j++)s+=(p[j]-x[j])*(p[j]-x[j]);return [s,y[i]]}).sort(function(a,b){return a[0]-b[0]}),v=0;for(var i=0;i<k;i++)v+=D[i][1];return v*2>k?1:(v*2<k?0:D[0][1]);}};}
/* ── 가우스 나이브 베이즈 ── */
function gnb(X,y){var d=X[0].length,S=[0,1].map(function(c){var P=X.filter(function(_,i){return y[i]===c}),mu=[],va=[];for(var j=0;j<d;j++){var m=0;P.forEach(function(p){m+=p[j]/P.length});var v=0;P.forEach(function(p){v+=(p[j]-m)*(p[j]-m)/P.length});mu.push(m);va.push(v+1e-6);}return {pr:P.length/X.length,mu:mu,va:va};});
  function lp(x,c){var s=Math.log(S[c].pr);for(var j=0;j<d;j++)s+=-.5*Math.log(2*Math.PI*S[c].va[j])-(x[j]-S[c].mu[j])*(x[j]-S[c].mu[j])/(2*S[c].va[j]);return s;}
  return {prob:function(x){var a=lp(x,0),b=lp(x,1),m=Math.max(a,b);return Math.exp(b-m)/(Math.exp(a-m)+Math.exp(b-m))},predict:function(x){return lp(x,1)>=lp(x,0)?1:0}};}
/* ── RBF 커널 근사(무작위 푸리에 특징): 커널 SVM·SVR을 선형 모델로 흉내 ── */
function rff(d,D,gamma,seed){var r=R(seed),W=[],b=[];for(var k=0;k<D;k++){var w=[];for(var j=0;j<d;j++)w.push(N(r)*Math.sqrt(2*gamma));W.push(w);b.push(r()*2*Math.PI);}
  return function(x){var o=[];for(var k=0;k<D;k++){var s=b[k];for(var j=0;j<d;j++)s+=W[k][j]*x[j];o.push(Math.sqrt(2/D)*Math.cos(s));}return o;};}
/* ── 선형 SVM (Pegasos, 힌지 손실). phi로 커널 근사 특징을 줄 수 있다 ── */
function svm(X,y,lam,ep,seed,phi){var Z=phi?X.map(phi):X,n=Z.length,d=Z[0].length,w=new Array(d).fill(0),b=0,r=R(seed||1),t=0;
  for(var e=0;e<ep;e++)for(var q=0;q<n;q++){var i=Math.floor(r()*n);t++;var eta=1/(lam*t),yy=y[i]?1:-1,m=b;for(var j=0;j<d;j++)m+=w[j]*Z[i][j];
    for(j=0;j<d;j++)w[j]*=(1-eta*lam);if(yy*m<1){for(j=0;j<d;j++)w[j]+=eta*yy*Z[i][j];b+=eta*yy*0.1;}}
  function sc(x){var z=phi?phi(x):x,s=b;for(var j=0;j<d;j++)s+=w[j]*z[j];return s;}
  return {score:sc,predict:function(x){return sc(x)>=0?1:0}};}
/* ── SVR (ε-무감 손실, 경사 하강). ε 폭 안의 오차는 봐준다 ── */
function svr(X,y,eps,lam,ep,lr,phi){var Z=phi?X.map(phi):X,n=Z.length,d=Z[0].length,w=new Array(d).fill(0),b=mean(y);
  for(var e=0;e<ep;e++){var g=new Array(d).fill(0),gb=0;for(var i=0;i<n;i++){var p=b;for(var j=0;j<d;j++)p+=w[j]*Z[i][j];var r=p-y[i];if(Math.abs(r)>eps){var s=r>0?1:-1;for(j=0;j<d;j++)g[j]+=s*Z[i][j];gb+=s;}}
    for(j=0;j<d;j++)w[j]-=lr*(g[j]/n+lam*w[j]);b-=lr*gb/n;}
  return {predict:function(x){var z=phi?phi(x):x,s=b;for(var j=0;j<d;j++)s+=w[j]*z[j];return s;}};}
/* ── K-메도이드: 중심을 실제 데이터 점 중에서 고른다 ── */
function d2(a,b){var s=0;for(var i=0;i<a.length;i++)s+=(a[i]-b[i])*(a[i]-b[i]);return s}
function kmedoids(P,k,seed,iters){var r=R(seed),M=shuffle(P.map(function(_,i){return i}),r).slice(0,k),a=[];
  for(var it=0;it<(iters||20);it++){a=P.map(function(p){var bi=0,bd=1e18;M.forEach(function(m,j){var dd=Math.sqrt(d2(p,P[m]));if(dd<bd){bd=dd;bi=j;}});return bi;});
    var nm=M.map(function(m,j){var mem=[];a.forEach(function(v,i){if(v===j)mem.push(i)});if(!mem.length)return m;var best=m,bc=1e18;mem.forEach(function(c){var s=0;mem.forEach(function(o){s+=Math.sqrt(d2(P[c],P[o]))});if(s<bc){bc=s;best=c;}});return best;});
    if(nm.join()===M.join())break;M=nm;}
  return {M:M,C:M.map(function(m){return P[m]}),a:a};}
/* ── DBSCAN: 반지름 eps 안에 이웃이 minPts개 이상이면 핵심 점. −1은 잡음 ── */
function dbscan(P,eps,minPts){var n=P.length,lab=new Array(n).fill(-2),e2=eps*eps,c=-1;
  function nb(i){var o=[];for(var j=0;j<n;j++)if(d2(P[i],P[j])<=e2)o.push(j);return o;}
  for(var i=0;i<n;i++){if(lab[i]!==-2)continue;var N0=nb(i);if(N0.length<minPts){lab[i]=-1;continue;}c++;lab[i]=c;var Q=N0.slice();
    while(Q.length){var q=Q.shift();if(lab[q]===-1)lab[q]=c;if(lab[q]!==-2)continue;lab[q]=c;var Nq=nb(q);if(Nq.length>=minPts)Q=Q.concat(Nq);}}
  return {a:lab,k:c+1,noise:lab.filter(function(v){return v<0}).length};}
/* ── 계층적 군집 (병합, 평균 연결). merges[t] = [a,b,높이] ── */
function agglo(P,link){var n=P.length,cl=P.map(function(_,i){return {id:i,m:[i]}}),merges=[],D={};
  function dist(A,B){var s=link==='single'?1e18:0;A.m.forEach(function(i){B.m.forEach(function(j){var v=Math.sqrt(d2(P[i],P[j]));if(link==='single')s=Math.min(s,v);else s+=v;});});return link==='single'?s:s/(A.m.length*B.m.length);}
  var nid=n;while(cl.length>1){var bi=0,bj=1,bd=1e18;for(var i=0;i<cl.length;i++)for(var j=i+1;j<cl.length;j++){var key=cl[i].id+','+cl[j].id;if(D[key]==null)D[key]=dist(cl[i],cl[j]);if(D[key]<bd){bd=D[key];bi=i;bj=j;}}
    var A=cl[bi],B=cl[bj],C={id:nid++,m:A.m.concat(B.m)};merges.push([A.id,B.id,bd,C.id]);cl.splice(bj,1);cl.splice(bi,1);cl.push(C);}
  function cut(k){var lab=P.map(function(_,i){return i}),grp={};for(var i=0;i<n;i++)grp[i]=[i];for(var t=0;t<n-k;t++){var m=merges[t];grp[m[3]]=grp[m[0]].concat(grp[m[1]]);delete grp[m[0]];delete grp[m[1]];}
    var c=0;Object.keys(grp).forEach(function(g){grp[g].forEach(function(i){lab[i]=c});c++;});return lab;}
  return {merges:merges,cut:cut};}
/* ── 가우스 혼합 (EM, 축 방향 분산) ── */
function gmm(P,k,seed,iters){var km=kmeans(P,k,seed,10),d=P[0].length,mu=km.C.map(function(c){return c.slice()}),va=mu.map(function(){return new Array(d).fill(1)}),pi=mu.map(function(){return 1/k}),Rr=[];
  for(var it=0;it<(iters||60);it++){Rr=P.map(function(p){var l=mu.map(function(m,j){var s=Math.log(pi[j]);for(var q=0;q<d;q++)s+=-.5*Math.log(2*Math.PI*va[j][q])-(p[q]-m[q])*(p[q]-m[q])/(2*va[j][q]);return s;}),mx=Math.max.apply(null,l),e=l.map(function(v){return Math.exp(v-mx)}),t=e.reduce(function(a,b){return a+b},0);return e.map(function(v){return v/t});});
    for(var j=0;j<k;j++){var nj=0;Rr.forEach(function(rw){nj+=rw[j]});pi[j]=nj/P.length;for(var q=0;q<d;q++){var m=0;P.forEach(function(p,i){m+=Rr[i][j]*p[q]});m/=nj;var v=0;P.forEach(function(p,i){v+=Rr[i][j]*(p[q]-m)*(p[q]-m)});mu[j][q]=m;va[j][q]=v/nj+1e-4;}}}
  return {mu:mu,va:va,pi:pi,R:Rr,a:Rr.map(function(rw){return rw.indexOf(Math.max.apply(null,rw))})};}
/* 군집 번호와 정답의 겹침 (군집 수가 달라도: 군집마다 다수 정답으로 이름 붙이기) */
function purity(a,t){var m={};a.forEach(function(v,i){if(v<0)return;m[v]=m[v]||{};m[v][t[i]]=(m[v][t[i]]||0)+1;});var s=0;Object.keys(m).forEach(function(k){s+=Math.max.apply(null,Object.values(m[k]));});return s/a.length;}
/* ── Q-러닝 (격자 미로). 행동 0↑ 1→ 2↓ 3← ── */
function qgrid(n,walls,goal,start,opt){opt=opt||{};var al=opt.alpha==null?.5:opt.alpha,ga=opt.gamma==null?.9:opt.gamma,ep=opt.eps==null?.2:opt.eps,r=R(opt.seed||1),Q=[],hist=[],snaps=[];
  for(var s=0;s<n*n;s++)Q.push([0,0,0,0]);var W={};(walls||[]).forEach(function(w){W[w]=1});var DX=[0,1,0,-1],DY=[-1,0,1,0];
  function move(s,a){var x=s%n,y=Math.floor(s/n),nx=x+DX[a],ny=y+DY[a];if(nx<0||ny<0||nx>=n||ny>=n||W[ny*n+nx])return [s,-1];var ns=ny*n+nx;return [ns,ns===goal?10:-0.1];}
  for(var e=0;e<(opt.episodes||200);e++){var s=start,steps=0;while(s!==goal&&steps<(opt.maxSteps||4*n*n)){var a;if(r()<ep)a=Math.floor(r()*4);else{var q=Q[s],m=Math.max.apply(null,q),c=[];q.forEach(function(v,i){if(v===m)c.push(i)});a=c[Math.floor(r()*c.length)];}
      var o=move(s,a),ns=o[0],rw=o[1],tg=rw+(ns===goal?0:ga*Math.max.apply(null,Q[ns]));Q[s][a]+=al*(tg-Q[s][a]);s=ns;steps++;}
    hist.push(steps);if(opt.snapEvery&&(e+1)%opt.snapEvery===0)snaps.push(Q.map(function(q){return q.slice()}));}
  function greedy(){var s=start,path=[s],seen={};while(s!==goal&&path.length<n*n*2){if(seen[s])break;seen[s]=1;var q=Q[s],a=q.indexOf(Math.max.apply(null,q));s=move(s,a)[0];path.push(s);}return {path:path,ok:s===goal};}
  return {Q:Q,hist:hist,snaps:snaps,greedy:greedy,visited:Q.filter(function(q){return q.some(function(v){return v!==0})}).length};}
/* ── 데이터 만들기 ── */
function blobs(seed,specs){var r=R(seed),D=[];specs.forEach(function(s,ci){for(var i=0;i<s.n;i++)D.push({x:[s.c[0]+N(r)*s.s[0],s.c[1]+N(r)*s.s[1]],y:ci});});return D;}
return {scaler:scaler,enet:enet,regTree:regTree,gbmReg:gbmReg,gbmClf:gbmClf,extraTrees:extraTrees,knn:knn,gnb:gnb,rff:rff,svm:svm,svr:svr,kmedoids:kmedoids,dbscan:dbscan,agglo:agglo,gmm:gmm,purity:purity,qgrid:qgrid,R:R,N:N,sig:sig,mean:mean,shuffle:shuffle,split:split,linfit:linfit,mae:mae,logfit:logfit,acc:acc,tree:tree,forest:forest,adaboost:adaboost,kmeans:kmeans,overlap:overlap,pca:pca,bandit:bandit,banditA:banditA,majority:majority,committeeSim:committeeSim,blobs:blobs};
})();
if(typeof module!=='undefined')module.exports=ML;
