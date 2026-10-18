# ===============================================================
# 인공지능 알고리즘 패밀리 4-15 · 배포 저울: 로지스틱 vs 큰 앙상블
#  - 라이브러리: numpy, scikit-learn (Colab 기본 설치)
#  - 하는 일: 대출 표 데이터에서 정확도 · 학습 시간 · 예측 1건 시간 · 설명(가중치) 비교
# ===============================================================
import time
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import (GradientBoostingClassifier, RandomForestClassifier,
                              HistGradientBoostingClassifier, VotingClassifier)

FEAT = ["소득", "부채 비율", "근속 연수", "신용 이력 길이", "저축 여부", "나이", "거주 기간", "문의 횟수"]

# ---------------------------------------------------------------
# 1) 데이터: 상환 점수 규칙 + 정답 3% 뒤집기 (브라우저와 같은 규칙)
#    [내 데이터로 바꾸려면] X(특징)와 y(0/1)를 내 데이터로 바꾼다
def loan(seed, noise=0.03, n=800):
    rng = np.random.default_rng(seed)
    X = rng.normal(size=(n, 8))
    s = (1.2 * X[:, 0] - 1.0 * X[:, 1] + 0.8 * X[:, 2] * X[:, 3]
         + np.where(X[:, 4] > 0.3, 1.0, -0.5) + 0.5 * np.sin(2 * X[:, 5]))
    y = (s > 0).astype(int)
    flip = rng.uniform(size=n) < noise
    y[flip] = 1 - y[flip]
    return train_test_split(X, y, test_size=0.3, random_state=seed)

def per_row_us(model, X, reps=20):
    t = time.perf_counter()
    for _ in range(reps):
        model.predict_proba(X)
    return (time.perf_counter() - t) / (reps * len(X)) * 1e6

# ---------------------------------------------------------------
# 2) 두 후보
def make_models():
    logi = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    ens = VotingClassifier([
        ("gbm", GradientBoostingClassifier(n_estimators=150, max_depth=3, random_state=0)),
        ("rf", RandomForestClassifier(n_estimators=200, random_state=0)),
        ("hgb", HistGradientBoostingClassifier(random_state=0)),
    ], voting="soft")
    return {"초파리 · 로지스틱": logi, "Money-Robo · 큰 앙상블": ens}

res = {}
for seed in (1, 2, 3):
    X_tr, X_va, y_tr, y_va = loan(150 + seed)
    for name, m in make_models().items():
        t = time.perf_counter(); m.fit(X_tr, y_tr); fit_ms = (time.perf_counter() - t) * 1000
        r = res.setdefault(name, {"acc": [], "fit": [], "pred": []})
        r["acc"].append(m.score(X_va, y_va)); r["fit"].append(fit_ms); r["pred"].append(per_row_us(m, X_va))
        if name.startswith("초파리") and seed == 1:
            coef = m[-1].coef_[0]

print("모델                     검증 정확도   학습(ms)   예측 1건(µs)")
for name, r in res.items():
    print(f"{name:22s} {np.mean(r['acc']):.3f}       {np.mean(r['fit']):8.1f}   {np.mean(r['pred']):8.2f}")

# ---------------------------------------------------------------
# 3) 설명: 로지스틱의 가중치 (표준화한 특징 기준)
print("\n로지스틱 가중치 (오른쪽 + 는 갚을 쪽)")
for f, c in sorted(zip(FEAT, coef), key=lambda t: -abs(t[1])):
    print(f"  {f:10s} {c:+.2f}")
