# ===============================================================
# 인공지능 알고리즘 패밀리 4-12 · 정확도 99%의 함정
#  - 라이브러리: numpy, scikit-learn (Colab 기본 설치)
#  - 하는 일: 사기 1% 데이터에서 "전부 정상"과 로지스틱 비교, 문턱 바꾸기, MAE·RMSE
# ===============================================================
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score

# ---------------------------------------------------------------
# 1) 데이터: 결제 금액과 평소 장소와의 거리. 사기는 금액이 크고 먼 경향 (겹침 있음)
#    [내 데이터로 바꾸려면] X(특징)와 y(1=양성)를 내 데이터로 바꾼다
def make(n, n_fraud, seed):
    rng = np.random.default_rng(seed)
    y = np.r_[np.ones(n_fraud), np.zeros(n - n_fraud)].astype(int)
    amt = np.where(y == 1, np.exp(np.log(60) + rng.normal(0, .75, n)), np.exp(np.log(12) + rng.normal(0, .85, n)))
    dst = np.where(y == 1, np.exp(np.log(90) + rng.normal(0, .9, n)), np.exp(np.log(6) + rng.normal(0, 1.0, n)))
    X = np.c_[np.log(np.minimum(amt, 900)), np.log(np.minimum(dst, 2000))]
    p = rng.permutation(n)
    return X[p], y[p]

X_tr, y_tr = make(3000, 30, 1201)   # 배울 거래
X_te, y_te = make(1000, 10, 1207)   # 처음 보는 거래 (사기 10건)
sc = StandardScaler().fit(X_tr)
lg = LogisticRegression().fit(sc.transform(X_tr), y_tr)
p_tr, p_te = lg.predict_proba(sc.transform(X_tr))[:, 1], lg.predict_proba(sc.transform(X_te))[:, 1]

# ---------------------------------------------------------------
# 2) 문턱은 배울 데이터에서만 고른다 (F1 최대)
ths = np.arange(0.01, 0.96, 0.01)
th = ths[np.argmax([f1_score(y_tr, p_tr >= t) for t in ths])]

def report(name, pred):
    tn, fp, fn, tp = confusion_matrix(y_te, pred, labels=[0, 1]).ravel()
    pr = precision_score(y_te, pred, zero_division=0)
    print(f"{name:24s} 정확도 {accuracy_score(y_te, pred):.3f}  정밀도 {pr:.3f}  재현율 {recall_score(y_te, pred):.3f}  "
          f"F1 {f1_score(y_te, pred, zero_division=0):.3f}  | 맞힌 사기 {tp} 놓친 사기 {fn} 잘못 막은 정상 {fp}")

print("--- 담판: 처음 보는 1,000건 (사기 10건) ---")
report("Money-Robo · 전부 정상", np.zeros_like(y_te))
report(f"초파리 · 로지스틱 (문턱 {th:.2f})", (p_te >= th).astype(int))

# ---------------------------------------------------------------
# 3) 문턱을 바꾸면 정밀도와 재현율이 맞바뀐다
print("--- 문턱별 ---")
for t in (0.9, 0.7, 0.5, th, 0.2, 0.05):
    report(f"문턱 {t:.2f}", (p_te >= t).astype(int))

# ---------------------------------------------------------------
# 4) MAE와 RMSE: 평균 오차가 비슷해도 큰 실수 하나가 RMSE를 키운다
for name, e in (("모델 A (고르게)", [3, -4, 5, -3, 4, -5, 3, -4, 5, -4]), ("모델 B (한 번 크게)", [1, -1, 0, 1, -1, 0, 1, 0, -1, 36])):
    e = np.array(e, float)
    print(f"{name:18s} MAE {np.abs(e).mean():.2f}분  RMSE {np.sqrt((e**2).mean()):.2f}분")
