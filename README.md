# 아이헤븐 옛 홈페이지(iheaven.kr) 보존본

2026-11-20 에 iheaven.kr 의 공개 화면 25개를 그대로 내려받아 Next.js 앱에서 같은 주소로 내보내도록 옮긴 것이다.
`main` 가지의 Astro 사이트(i-heaven.kr)와는 별개이며 서로 이력이 이어지지 않는다. 이 가지를 `main` 에 합치지 않는다.

## 실행

```bash
npm ci
npx next dev -p 3100        # http://localhost:3100
node scripts/check-iheaven.mjs http://localhost:3100   # 화면·파일·링크·법인 정보 점검
```

## 구조

| 위치 | 내용 |
|------|------|
| `public/` | 원본의 그림·글꼴·CSS·JS (원본과 같은 주소) |
| `src/sites/iheaven/pages/` | 변환된 화면 HTML 25개 |
| `src/app/[[...slug]]/route.ts` | 원본 주소(`/page/…​.php`)로 화면을 내보낸다 |
| `docs/research/iheaven/` | 내려받은 원본 HTML, 게시글·팝업·연혁 저장본 |
| `docs/design-references/iheaven/` | 원본(`source`)과 새 화면(`local`) 캡처 |
| `scripts/mirror-iheaven.mjs` | 원본 내려받기 |
| `scripts/build-iheaven.mjs` | 내려받은 것을 `public/`·`src/sites/` 로 변환 |

## 원본과 다른 점

- 대표자 임채윤, 대표 전화 1577-5474 로 바꿨다 (사업자등록증 2026-07-02).
- 방문 통계 코드(구글·네이버·스마트로그·광고 추적)를 뺐다. `KEEP_TRACKERS=1 node scripts/build-iheaven.mjs` 로 되살릴 수 있다.
- 없는 화면을 가리키던 `petforest-brandstory.php` 링크를 `iheaven-brandstory.php` 로 고쳤다.
- 예약 접수·로그인·회원가입은 서버가 없어 작동하지 않는다. 누르면 전화 문의 안내가 뜬다.

앱의 틀은 [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)(MIT)에서 가져왔다.
