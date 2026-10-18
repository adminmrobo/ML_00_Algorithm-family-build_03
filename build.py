#!/usr/bin/env python3
"""알고리즘 패밀리 4-x 빌드: 공용 조각 + 편별 조각 → 한 장짜리 HTML (편마다 그 편이 쓰는 그림만 base64로 넣는다)."""
import base64, json, os, re, subprocess, sys, html

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC, EPD, ASSETS, OUT = (os.path.join(ROOT, d) for d in ('src', 'ep', 'assets', 'out'))
rd = lambda p: open(p, encoding='utf-8').read()

CSS = rd(f'{SRC}/base.css') + rd(f'{SRC}/extra.css')
CORE, MLJS = rd(f'{SRC}/core.js'), rd(f'{SRC}/ml.js')
# 대결 엔진·점수판·미니맵이 늘 쓰는 그림
CORE_SPRITES = {'fly_point', 'fly_arms', 'fly_coffee', 'fly_cry', 'fly_clip', 'robo_coin', 'robo_sigh', 'robo_blush',
                'robo_happy', 'robo_meh', 'robo_smile', 'asst_ledger', 'asst_shock', 'asst_smile', 'doc_verdict', 'doc_don', 'doc_scale', 'doc_front'}

AUTHOR = rd(f'{SRC}/author.html')
NOTES_COMMON = [
    ('바탕 자료', '조직도의 구조는 <i>Machine Learning Algorithm Family Tree</i> 인포그래픽(Pooja Pawar)을 참고했다. 이미지를 옮기지 않고 가문·파·알고리즘의 관계만 참고해 새로 그렸다.'),
    ('그림', '등장인물과 장면은 이 시리즈를 위해 그린 그림이다. NPC와 가문 문장은 이 페이지가 픽셀로 직접 그린다.'),
    ('"대부" 컨셉', '범죄 가문 장르의 일반적인 분위기만 빌렸다. 특정 영화의 인물·대사·로고·음악을 쓰지 않았고, 폭력을 다루지 않는다. "가문"은 알고리즘 무리를 부르는 은유다.'),
    ('등장인물', 'Money-Robo는 저자가 운영하는 서비스의 마스코트 캐릭터다. 박사·조수·초파리 연구원과 NPC는 실존 인물을 나타내지 않는다. 대사 속 돈·투자 표현은 말버릇일 뿐 투자 권유가 아니다.'),
]


def notes_section(items, sid='notes'):
    li = ''.join(f'<li><b>{k}.</b> {v}</li>' for k, v in items)
    return (f'<section class="part common notes" id="{sid}">\n<div class="wrap">\n'
            f'  <div class="part-head"><div class="part-no">G</div><div class="en">Notes</div><h2>설정 및 유의사항</h2>'
            f'<p class="lin">이 페이지의 데이터, 그림, 컨셉에 대한 안내</p></div>\n'
            f'  <div class="card"><ul class="reflist">{li}</ul></div>\n</div>\n</section>')


def run_code(path):
    env = dict(os.environ, MPLBACKEND='Agg', PYTHONHASHSEED='0')
    r = subprocess.run([sys.executable, path], capture_output=True, text=True, timeout=300, env=env, cwd=os.path.dirname(path))
    if r.returncode:
        raise SystemExit(f'코드 실행 실패: {path}\n{r.stderr}')
    return r.stdout.rstrip()


def need_sprites(text):
    s = set(CORE_SPRITES)
    for who, mood in re.findall(r'data-who="(\w+)"\s+data-mood="(\w+)"', text): s.add(f'{who}_{mood}')
    for who, mood in re.findall(r"(?:sprite|say)\('(\w+)','(\w+)'", text): s.add(f'{who}_{mood}')
    for k in re.findall(r'data-scene="(\w+)"', text): s.add(k)
    for k in re.findall(r"bg:'(\w+)'", text): s.add(k)
    for k in re.findall(r"fly:'(\w+)'", text): s.add('fly_' + k)
    for k in re.findall(r"robo:'(\w+)'", text): s.add('robo_' + k)
    return s


ALIASES = {'doc_don': 'doc_magic', 'doc_verdict': 'doc_judge', 'asst_ledger': 'asst_firm', 'fly_fedora': 'fly_arms',
           'robo_tux': 'robo_coin', 'sc_meeting': 'sc_board', 'sc_alley': 'sc_night',
           'doc_scale': 'doc_don', 'asst_board': 'asst_ledger', 'fly_tip': 'fly_arms', 'fly_magnify': 'fly_point',
           'robo_dq': 'robo_blush', 'robo_calc': 'robo_count', 'sc_registry': 'sc_lab', 'sc_family': 'sc_party',
           'sc_vault': 'sc_night', 'sc_final': 'sc_party',
           # 2부·3부 추가 그림 (이미지_제작_규격_2부3부.md) — 오기 전까지 대신 쓸 그림
           'sc_estate': 'sc_board', 'sc_border': 'sc_board', 'sc_moons': 'sc_night', 'sc_maze': 'sc_night',
           'sc_grove': 'sc_magic', 'asst_dossier': 'asst_ledger', 'fly_ruler': 'fly_point', 'robo_sapling': 'robo_stack',
           'doc_files': 'doc_don', 'sc_ledger': 'sc_vault', 'sc_mirror': 'sc_lab', 'sc_carpet': 'sc_night',
           'sc_scale': 'sc_final', 'asst_confusion': 'asst_board', 'robo_reward': 'robo_happy'}


def b64(key):
    p = f'{ASSETS}/{key}.webp'
    if not os.path.exists(p) and key in ALIASES: p = f'{ASSETS}/{ALIASES[key]}.webp'
    if not os.path.exists(p): return None
    return 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()


def common_sections(m):
    return f'''
<!-- ═══════════ 시즌 지도 ═══════════ -->
<section class="part" id="map">
<div class="wrap">
  <div class="part-head"><div class="part-no">▦</div><div class="en">The territory</div><h2>구역 지도 — 열다섯 구역</h2><p class="lin">가로는 부, 세로는 가문. 같은 세로줄은 같은 가문을 다른 눈으로 본다</p></div>
  <div id="minimap"></div>
</div>
</section>

<!-- ═══════════ 공통 A: Colab 코드 ═══════════ -->
<section class="part common" id="code">
<div class="wrap">
  <div class="part-head"><div class="part-no">A</div><div class="en">Colab code</div><h2>Colab 코드 — 이 편의 대결을 직접 돌려 보기</h2><p class="lin">Colab에 기본으로 설치된 라이브러리만 쓴다</p></div>
  <div id="codebox"></div>
</div>
</section>

<!-- ═══════════ 공통 B: 프롬프트 ═══════════ -->
<section class="part common" id="prompt">
<div class="wrap">
  <div class="part-head"><div class="part-no">B</div><div class="en">Prompts</div><h2>AI 응용 프롬프트 — 이 코드를 출발점으로</h2><p class="lin">〔 〕 안을 내 상황으로 바꿔 쓴다</p></div>
  <div class="prompts" id="prompts"></div>
  <p class="muted" style="font-size:14px;margin-top:12px">AI의 답은 출발점일 뿐이다. 제안된 논문·수치·함수는 원문과 공식 문서로 확인한다. 공모전·논문에 AI 도움을 받았다면 규정에 따라 사용 사실과 범위를 밝힌다.</p>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
</section>

<!-- ═══════════ 공통 C: 용어 ═══════════ -->
<section class="part common" id="glossary-sec">
<div class="wrap">
  <div class="part-head"><div class="part-no">C</div><div class="en">Glossary</div><h2>용어 정리</h2><p class="lin">본문의 노란 점선 밑줄과 같은 사전</p></div>
  <div class="card tw" style="padding:6px 12px"><table class="tb" id="glossary"></table></div>
</div>
</section>

<!-- ═══════════ 공통 D: 비유 ═══════════ -->
<section class="part common" id="analogy-sec">
<div class="wrap">
  <div class="part-head"><div class="part-no">D</div><div class="en">Analogies</div><h2>비유 모음 — 그리고 비유가 틀리는 지점</h2><p class="lin">초파리·뇌 비유에는 강도를 표시했다: <span class="str s3">직접</span> 같은 일을 한다는 근거가 있음 · <span class="str s2">부분</span> 일부만 닮음 · <span class="str s1">없음</span> 대응이 알려지지 않음</p></div>
  <div class="card tw" style="padding:6px 12px"><table class="tb" id="analogy"></table></div>
</div>
</section>

<!-- ═══════════ 공통 E: 저자와 레퍼런스 ═══════════ -->
<section class="part common" id="refs-sec">
<div class="wrap">
  <div class="part-head"><div class="part-no">E</div><div class="en">References</div><h2>저자 소개와 레퍼런스</h2><p class="lin">E-1 저자 · E-2 레퍼런스</p></div>
  {AUTHOR}
  <div class="card"><h3>E-2 레퍼런스</h3><ol class="reflist" id="refs"></ol></div>
</div>
</section>

<!-- ═══════════ 공통 F: 교육자 TIP ═══════════ -->
<section class="part common" id="teach">
<div class="wrap">
  <div class="part-head"><div class="part-no">F</div><div class="en">For educators</div><h2>교육자를 위한 TIP</h2><p class="lin">시간은 제작자의 추정이다. 수업에 맞춰 조정한다</p></div>
  <div id="tipbox"></div>
</div>
</section>
'''


def build(ep):
    d = f'{EPD}/{ep}'
    m = json.loads(rd(f'{d}/meta.json'))
    body, outro, js, code = rd(f'{d}/body.html'), rd(f'{d}/outro.html'), rd(f'{d}/ep.js'), rd(f'{d}/code.py')
    data_js = rd(f'{d}/data.js') if os.path.exists(f'{d}/data.js') else ''
    assert '</script' not in code.lower(), 'code.py에 </script 금지'
    out = run_code(f'{d}/code.py')
    keys = need_sprites(body + outro + js + data_js) | set(m.get('sprites', []))
    spr, missing = {}, []
    for k in sorted(keys):
        v = b64(k)
        if v: spr[k] = v
        else: missing.append(k)
    toc = ''.join(f'<a href="#{a}">{b}</a>' for a, b in m['toc'] + [['notes', '유의사항']])
    ep_meta = json.dumps({'n': m['n'], 'title': m['title']}, ensure_ascii=False)
    page = f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{m['n']} {m['title']} | 인공지능 알고리즘 패밀리 조직도</title>
<meta name="description" content="{html.escape(m['desc'])}">
<meta name="author" content="안상선">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;700&family=Nanum+Myeongjo:wght@400;700;800&family=Cinzel:wght@500;700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<nav class="top" aria-label="이 페이지의 목차">
  <div class="wrap">
    <div class="toc">{toc}</div>
    <div class="score" id="score" aria-live="polite" title="세력도: 지난 구역까지 차지한 수에 이 구역의 담판 결과를 더한다">
      <span class="lab">세력도</span><img data-who="fly" data-mood="clip" alt="초파리 연구원"><span class="f" id="sF">0</span>:<span class="r" id="sR">0</span><img data-who="robo" data-mood="smile" alt="Money-Robo"><span class="d">· 무 <span id="sD">0</span></span> <span class="prev" id="sP"></span>
    </div>
  </div>
</nav>
{body}
{common_sections(m)}
{outro}
{notes_section([('데이터와 계산', m['foot'] + (' 도표에 찍힌 "설명용 모형" 표시는 이 뜻이다.' if '설명용 모형' in js else ''))] + NOTES_COMMON)}
<footer>
  <div class="wrap">
    <p><b style="color:var(--text)">인공지능 알고리즘 패밀리 조직도 · {m['n']} {m['title']}</b> · <a href="4-0_index.html">가계도 목차</a> — 글 안상선 ((주)M-Robo 대표)</p>
  </div>
</footer>
<script type="text/plain" id="src-code">
{code}</script>
<script>
var SPR={json.dumps(spr)};
var EP={ep_meta};
var CODE_OUT={json.dumps(out, ensure_ascii=False)};
{CORE}
{MLJS}
{data_js}
{js}
boot();
</script>
</body>
</html>
'''
    os.makedirs(OUT, exist_ok=True)
    path = f"{OUT}/{m['file']}"
    open(path, 'w', encoding='utf-8').write(page)
    img = sum(len(v) for v in spr.values())
    print(f"{m['file']}: {len(page)//1024} KB (그림 {img//1024} KB, {len(spr)}장)" + (f'  ⚠ 없는 그림: {missing}' if missing else ''))
    return out


if __name__ == '__main__':
    eps = sys.argv[1:] or sorted(os.listdir(EPD), key=lambda s: [int(x) for x in s.split('-')])
    for e in eps: build(e)


INDEX_SPRITES = ['sc_alley', 'sc_family', 'sc_registry', 'sc_meeting'] + [f'doc_{m}' for m in ('don', 'verdict', 'scale', 'magic', 'front', 'judge', 'board')] + \
    [f'asst_{m}' for m in ('ledger', 'board', 'smile', 'spark', 'firm', 'shock', 'sigh', 'cry')] + \
    [f'fly_{m}' for m in ('fedora', 'tip', 'magnify', 'clip', 'point', 'arms', 'type', 'coffee', 'cry')] + \
    [f'robo_{m}' for m in ('tux', 'calc', 'dq', 'coin', 'happy', 'chart', 'stack', 'meh', 'sigh', 'wow', 'count', 'smile')]


def build_index():
    t = rd(f'{SRC}/index_tpl.html')
    spr = {k: b64(k) for k in INDEX_SPRITES if b64(k)}
    notes = ''.join(f'<li><b>{k}.</b> {v}</li>' for k, v in [('데이터와 계산', '각 편의 데이터는 규칙으로 만든 예시이며 실제 기록이 아니다(난수 고정). 담판 결과와 도표는 그 편의 페이지가 브라우저에서 직접 계산한다.')] + NOTES_COMMON)
    notes = f'<section class="part notes" id="notes" aria-labelledby="notes-h">\n  <div class="wrap">\n    <p class="eyebrow">Notes</p>\n    <h2 id="notes-h">설정 및 유의사항</h2>\n    <div class="box"><ul>{notes}</ul></div>\n  </div>\n</section>'
    page = t.replace('{{SPR}}', json.dumps(spr)).replace('{{CORE}}', CORE).replace('{{NOTES}}', notes)
    open(f'{OUT}/4-0_index.html', 'w', encoding='utf-8').write(page)
    open(f'{OUT}/index.html', 'w', encoding='utf-8').write(page)  # GitHub Pages 첫 화면
    print(f"4-0_index.html: {len(page)//1024} KB (그림 {sum(len(v) for v in spr.values())//1024} KB, {len(spr)}장)")


if __name__ == '__main__' and not sys.argv[1:]:
    build_index()
