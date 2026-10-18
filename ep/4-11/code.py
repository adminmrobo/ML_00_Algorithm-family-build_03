# ===============================================================
# 인공지능 알고리즘 패밀리 4-11 · 올바른 절차와 누수 절차
#  - 라이브러리: numpy, scikit-learn (Colab 기본 설치)
#  - 하는 일: 시험 점수(보고한 점수)와 배포 뒤 점수(진짜 실력)를 절차별로 비교
# ===============================================================
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import GridSearchCV, cross_val_score

# ---------------------------------------------------------------
# 1) 데이터: 특징 200개 중 쓸모 있는 것은 셋(소득·부채비율·근속), 나머지는 난수
#    [내 데이터로 바꾸려면] X(특징)와 y(0/1 정답)를 내 데이터로 바꾼다
def make(n, seed):
    rng = np.random.default_rng(seed)
    X = rng.normal(size=(n, 200))
    s = 1.2 * X[:, 0] - 1.0 * X[:, 1] + 0.6 * X[:, 2]
    y = (s + rng.normal(scale=0.35, size=n) > 0).astype(int)
    flip = rng.uniform(size=n) < 0.03
    y[flip] = 1 - y[flip]
    X[:, 0] = 3000 + 800 * X[:, 0]          # 단위가 제각각인 특징
    X[:, 2] = 10 + 5 * X[:, 2]
    return X, y

KS = list(range(1, 21))                    # 고를 특징 수 m 후보 스무 개

def model(k):
    return make_pipeline(StandardScaler(), SelectKBest(f_classif, k=k), LogisticRegression(max_iter=500))

def run(seed):
    X, y = make(200, seed)
    Xf, yf = make(1000, seed + 7777)       # 배포 뒤 새 데이터
    Xtv, ytv, Xte, yte = X[:160], y[:160], X[160:], y[160:]
    out = {}
    # ① 올바른 절차: 전처리까지 Pipeline 안에서, m은 5겹 교차 검증으로 고르고 시험은 한 번
    g = GridSearchCV(model(1), {"selectkbest__k": KS}, cv=5).fit(Xtv, ytv)
    out["올바른 절차"] = (g.score(Xte, yte), g.score(Xf, yf))
    # ② 누수 ①: 표준화와 특징 고르기를 시험까지 포함한 전체로 먼저 한다
    sc = StandardScaler().fit(X); sel = SelectKBest(f_classif, k=5).fit(sc.transform(X), y)
    Z = sel.transform(sc.transform(X)); lr = LogisticRegression(max_iter=500).fit(Z[:160], ytv)
    out["누수① 전체로 전처리"] = (lr.score(Z[160:], yte), lr.score(sel.transform(sc.transform(Xf)), yf))
    # ③ 누수 ②: 시험 점수를 보며 m을 스무 번 바꿔 가장 높은 것
    best = max(KS, key=lambda k: model(k).fit(Xtv, ytv).score(Xte, yte))
    m = model(best).fit(Xtv, ytv)
    out["누수② 시험 보며 20번"] = (m.score(Xte, yte), m.score(Xf, yf))
    return out

# ---------------------------------------------------------------
# 2) 다섯 판 평균: 보고한 시험 점수 vs 배포 뒤 점수
tot = {}
for s in range(5):
    for k, (te, fr) in run(1000 + s).items():
        a = tot.setdefault(k, [0, 0]); a[0] += te / 5; a[1] += fr / 5
print("절차                  시험   배포뒤  차이")
for k, (te, fr) in tot.items():
    print(f"{k:18s}  {te:.3f}  {fr:.3f}  {te - fr:+.3f}")

# ---------------------------------------------------------------
# 3) 극단적인 누수 실험: 정답과 아무 상관 없는 난수 특징 1,000개, 표본 60개
rng = np.random.default_rng(0)
Xn = rng.normal(size=(60, 1000)); yn = rng.integers(0, 2, 60)
sel = SelectKBest(f_classif, k=10).fit(Xn, yn)                 # 전체로 고르기 (누수)
leak = cross_val_score(LogisticRegression(max_iter=500), sel.transform(Xn), yn, cv=5).mean()
fair = cross_val_score(make_pipeline(SelectKBest(f_classif, k=10), LogisticRegression(max_iter=500)), Xn, yn, cv=5).mean()
print(f"\n난수 특징만: 전체로 고른 뒤 교차 검증 {leak:.3f}  /  Pipeline 안에서 고르기 {fair:.3f}  (진짜 실력은 0.5)")
