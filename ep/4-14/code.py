# ===============================================================
# 인공지능 알고리즘 패밀리 4-14 · 보상 세 가지와 보상 해킹
#  - 라이브러리: numpy (Colab 기본 설치)
#  - 하는 일: 5×5 청소 방에서 Q-Learning을 보상 세 가지로 학습,
#             누적 보상과 청소된 칸 비율을 시드 5개로 비교
# ===============================================================
import numpy as np

# ---------------------------------------------------------------
# 1) 방: 충전기(출발)는 0번 칸, 먼지 칸 8개, 벽 2칸, 한 판 40걸음
#    [내 문제로 바꾸려면] DUST, WALL, T와 아래 reward()를 바꾼다
N, T = 5, 40
DUST = [2, 4, 7, 11, 13, 17, 20, 23]
WALL = {6, 18}
DIDX = {d: i for i, d in enumerate(DUST)}
MOVES = [(0, -1), (1, 0), (0, 1), (-1, 0)]   # 위, 오른쪽, 아래, 왼쪽

def move(s, a):
    x, y = s % N, s // N
    nx, ny = x + MOVES[a][0], y + MOVES[a][1]
    if not (0 <= nx < N and 0 <= ny < N) or ny * N + nx in WALL:
        return s                               # 벽·바깥이면 제자리
    return ny * N + nx

# ---------------------------------------------------------------
# 2) 보상 세 가지
#    1번: 먼지 칸을 밟을 때마다 +1 (이미 치운 칸도)
#    2번: 처음 치울 때만 +1, 걸음마다 -0.01
#    3번: 1번 + 충전기로 돌아오면 +5 (그 판 끝)
def reward(design, s, ns, mask, t):
    r, done, nm = 0.0, False, mask
    if design == 2:
        r -= 0.01
    if ns in DIDX and ns != s:
        bit = 1 << DIDX[ns]
        first = not (mask & bit)
        nm = mask | bit
        r += 1 if (design != 2 or first) else 0
    if design == 3 and ns == 0 and t > 0:
        r += 5; done = True
    return r, nm, done

# ---------------------------------------------------------------
# 3) Q-Learning: 상태 = (위치, 치운 먼지 묶음)
def train(design, seed, episodes=1500, alpha=0.3, gamma=0.95):
    rng = np.random.default_rng(seed)
    Q = np.zeros((1 << len(DUST), N * N, 4))
    for e in range(episodes):
        eps = max(0.05, 1 - e / (episodes * 0.7))
        s, m = 0, 0
        for t in range(T):
            a = rng.integers(4) if rng.random() < eps else rng.choice(np.flatnonzero(Q[m, s] == Q[m, s].max()))
            ns = move(s, a)
            r, nm, done = reward(design, s, ns, m, t)
            target = r + (0 if done else gamma * Q[nm, ns].max())
            Q[m, s, a] += alpha * (target - Q[m, s, a])
            s, m = ns, nm
            if done:
                break
    return Q

def evaluate(Q, design):
    s, m, total = 0, 0, 0.0
    for t in range(T):
        a = int(np.argmax(Q[m, s]))
        ns = move(s, a)
        r, m, done = reward(design, s, ns, m, t)
        total += r; s = ns
        if done:
            break
    cleaned = bin(m).count("1") / len(DUST)
    return total, cleaned

# ---------------------------------------------------------------
# 4) 시드 5개로 비교 (담판: 1번 = Money-Robo, 2번 = 초파리)
print("보상  누적 보상(평균, 최저~최고)   청소된 칸(평균)")
for design in (1, 2, 3):
    res = [evaluate(train(design, seed), design) for seed in range(11, 16)]
    tot = np.array([r[0] for r in res]); cl = np.array([r[1] for r in res])
    print(f"{design}번   {tot.mean():6.2f} ({tot.min():.2f}~{tot.max():.2f})        {cl.mean():.0%}")
