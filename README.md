# 별의 파편

할아버지의 일지를 따라 13개 지층을 파 내려가고, 별빛골 장터에서 거래하며, 별을 하늘로 돌려보낼 99층 탑을 쌓는 도트 채굴 힐링 게임.

- 플레이(프로토타입): https://claude.ai/artifact/7BVjWgiLEMpQrzduoFij87
- 도트 제작 규격표: `docs/dot-spec.html`
- 작업 메모와 결정 사항: `docs/memo.md`

## 폴더
| 경로 | 내용 |
|---|---|
| `src/` | 게임 소스 (데이터, 도트 그래픽, 상태, 장터, 채굴, 합성, 탑, 화면, 소리, 안내) |
| `fonts/` | 갈무리 글꼴 원본 (SIL OFL 1.1) |
| `dist/starfall.html` | 빌드 결과 (한 파일짜리 게임) |
| `tools/build.py` | 빌드 |
| `tools/bot.js`, `tools/mkharness.py` | 밸런스용 자동 플레이 봇 |
| `tools/calibrate/` | 밸런스 보정 스크립트와 현재 값(`bal.json`) |
| `tools/tests/` | 휴대폰 화면 자동 테스트 (Playwright) |

## 빌드
```bash
pip install fonttools brotli
```
```bash
python3 tools/build.py
```

## 밸런스 확인 (엔딩까지 걸리는 시간)
저장소 루트에서 실행:
```bash
python3 tools/mkharness.py
```
```bash
node tools/calibrate/fr7.js
```

## 테스트
```bash
node tools/tests/t10.js dist/starfall.html
```
