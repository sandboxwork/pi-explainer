# 모든 원에 숨은 수, 파이

원주율 π를 "둘레가 지름의 몇 배인가"로 보여 주는 2분 28초짜리 모션그래픽 설명 영상입니다.
브라우저 페이지 자체가 영상이며, 내레이션 타이밍에 맞춰 GSAP 타임라인으로 재생됩니다.

**보기:** https://sandboxwork.github.io/pi-explainer/

## 재생
- **전체화면으로 재생**(Enter) 또는 **창에서 재생**(Space)
- Space 재생/일시정지 · ←/→ 5초 이동 · R 처음부터 · C 자막 · D 디버그 바
- 로컬에서는 `index.html`을 더블클릭해도 재생됩니다(서버 불필요).

## 구성
| 파일 | 내용 |
|---|---|
| `script.json` | 내레이션 큐(말하는 문장 / 화면 표기) |
| `storyboard.md` | 콘셉트, 색 체계, 큐별 연출 |
| `js/scenes.js` | 타임라인(모든 애니메이션) |
| `js/cues.js` | 큐 타이밍(생성됨) |
| `audio/narration.mp3` | 전체 내레이션 (`narration.wav`, `cues/*.wav`는 편집용) |

색의 약속: 청록 = 지름·반지름, 호박색 = 둘레·π.

## 사용한 것
- [Pretendard](https://github.com/orioncactus/pretendard) — SIL Open Font License 1.1
- [GSAP](https://gsap.com/) — GreenSock standard license
- 내레이션: Fish Audio TTS
