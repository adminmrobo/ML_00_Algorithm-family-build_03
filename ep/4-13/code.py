# ===============================================================
# 인공지능 알고리즘 패밀리 4-13 · 엘보·실루엣으로 k 고르기, t-SNE 설정의 함정
#  - 라이브러리: numpy, scikit-learn (Colab 기본 설치)
#  - 하는 일: 숨은 무리 4개인 8차원 고객 데이터에서
#            ① 엘보 ② 실루엣으로 k를 고르고 ③ t-SNE 그림 속 덩어리 수와 비교
# ===============================================================
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score
from sklearn.manifold import TSNE

# ---------------------------------------------------------------
# 1) 데이터: 고객 240명 × 특징 8개, 숨은 무리 4개(각 60명)
#    무리 0·1은 안에 작은 덩어리 두 개씩이 있다 (t-SNE 함정의 재료)
#    [내 데이터로 바꾸려면] X를 내 표준화된 특징 행렬로 바꾼다 (y는 없어도 된다)
def make(sub=2.0, sd=0.75, sep=7.0, seed=13):
    rng = np.random.default_rng(seed)
    C = np.zeros((4, 8))
    for g in range(4):
        C[g, g] = sep
    X, y = [], []
    for g in range(4):
        if g < 2:
            d = rng.normal(0, 1, 8); d /= np.linalg.norm(d)
            for s in (1, -1):
                X.append(C[g] + s * sub * d + rng.normal(0, sd, (30, 8))); y += [g] * 30
        else:
            X.append(C[g] + rng.normal(0, sd, (60, 8))); y += [g] * 60
    return np.vstack(X), np.array(y)

X, y = make()

# ---------------------------------------------------------------
# 2) 엘보와 실루엣 (Money-Robo의 방법)
print(" k   오차제곱합   평균실루엣")
sse, sil = [], {}
for k in range(1, 11):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)
    sse.append(km.inertia_)
    s = silhouette_score(X, km.labels_) if k > 1 else float("nan")
    if k > 1:
        sil[k] = s
    print(f"{k:2d}  {km.inertia_:10.0f}   {s:8.3f}")

# 꺾이는 점: 첫 점과 끝 점을 잇는 직선에서 가장 먼 k
xs = (np.arange(1, 11) - 1) / 9
ys = (np.array(sse) - sse[-1]) / (sse[0] - sse[-1])
knee = int(np.argmax(np.abs((1 - xs) - ys))) + 1
best = max(sil, key=sil.get)
print(f"엘보가 고른 k = {knee},  실루엣이 고른 k = {best},  숨긴 정답 = 4")

# ---------------------------------------------------------------
# 3) t-SNE 그림 속 덩어리 세기 (초파리의 방법)
#    지도를 0~1로 맞추고 화면 폭의 6%보다 가까운 점끼리 잇는다 (DBSCAN)
print("이웃수  그림 속 덩어리")
for p in (3, 8, 30, 80):
    E = TSNE(n_components=2, perplexity=p, init="pca", random_state=0, max_iter=1000).fit_transform(X)
    E = (E - E.min(0)) / (E.max(0) - E.min(0)).max()
    lab = DBSCAN(eps=0.06, min_samples=4).fit_predict(E)
    print(f"{p:5d}   {len(set(lab) - {-1})}개")
