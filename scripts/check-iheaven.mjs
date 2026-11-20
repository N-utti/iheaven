// 옮겨 온 홈페이지 점검: (1) 모든 화면 주소가 열리는가 (2) 화면이 부르는 내부 파일이 실제로 있는가
// (3) 화면 안의 내부 링크가 죽은 주소를 가리키지 않는가.
// 사용: 서버를 켠 뒤  node scripts/check-iheaven.mjs [http://localhost:3000]
import fs from "node:fs";
import assert from "node:assert/strict";

const BASE = process.argv[2] || "http://localhost:3000";
const routes = JSON.parse(fs.readFileSync("src/sites/iheaven/routes.json", "utf8"));
// 원본에서도 이미 없는 파일(원본의 깨진 참조)은 실패로 치지 않는다
const manifest = JSON.parse(fs.readFileSync("docs/research/iheaven/manifest.json", "utf8"));
const brokenOnSource = new Set(manifest.failed.map((f) => new URL(f.url).pathname));
const fails = [];
const seenAssets = new Set();
const seenLinks = new Set();
let pages = 0;

for (const key of Object.keys(routes)) {
  const res = await fetch(BASE + key, { redirect: "manual" });
  const html = await res.text();
  if (res.status !== 200 || !/<div id="wrap"|id="content/.test(html)) {
    fails.push(`화면 ${res.status} ${key}`);
    continue;
  }
  pages++;
  if (/googletagmanager|smlog\.co\.kr|onetag\.co\.kr|wcs\.naver\.net/.test(html)) fails.push(`통계코드 남음 ${key}`);
  // 법인 정보(사업자등록증 2026-07-02): 대표자 임채윤, 대표 전화 1577-5474
  if (/5773[-. ]?2119/.test(html)) fails.push(`옛 전화번호 남음 ${key}`);
  if (/정\s*이\s*찬/.test(html)) fails.push(`옛 대표자명 남음 ${key}`);
  if (!html.includes("tel:1577-5474")) fails.push(`새 전화번호 없음 ${key}`);
  if (!/대표[\s\S]{0,200}임\s*채\s*윤/.test(html)) fails.push(`새 대표자명 없음 ${key}`);
  for (const m of html.matchAll(/(?:src|href)\s*=\s*\\?["'](\/(?!\/)[^"'\\#]*)/g)) {
    const ref = m[1];
    if (/\.(css|js|png|jpe?g|gif|svg|webp|ico|mp4|woff2?|ttf|eot)(\?|$)/i.test(ref)) seenAssets.add(ref);
    else if (ref.startsWith("/page/") || ref === "/") seenLinks.add(ref);
  }
  for (const m of html.matchAll(/link\(\\?'(\/[^'\\#]*)/g)) seenLinks.add(m[1]);
}

// 공용 스크립트가 화면에 끼워 넣는 그림(예약·전화 버튼 등)도 같이 확인한다
for (const f of fs.readdirSync("public/js")) {
  const js = fs.readFileSync("public/js/" + f, "utf8");
  for (const m of js.matchAll(/["'(=](\/(?:images|upload|font|video|css|js|js_lib)\/[^"')\s\\<>+]+\.(?:png|jpe?g|gif|svg|webp|mp4|css|js|woff2?|ttf))/gi)) seenAssets.add(m[1]);
}
for (const ref of seenAssets) {
  const file = "public" + decodeURIComponent(ref.split("?")[0]);
  if (!fs.existsSync(file) && !brokenOnSource.has(ref.split("?")[0])) fails.push(`파일 없음 ${ref}`);
}
for (const ref of seenLinks) {
  if (/[=/]$/.test(ref) && ref !== "/") continue; // 스크립트가 뒤에 값을 이어 붙이는 주소 조각
  const res = await fetch(BASE + ref, { redirect: "manual" });
  // 마이페이지 등 로그인 화면은 원본처럼 첫 화면으로 돌려보내므로 302 도 정상이다
  if (res.status !== 200 && res.status !== 302) fails.push(`링크 ${res.status} ${ref}`);
}

console.log(`화면 ${pages}/${Object.keys(routes).length} 열림 · 내부 파일 ${seenAssets.size}개 · 내부 링크 ${seenLinks.size}개 확인`);
if (fails.length) console.log("실패:\n  " + fails.join("\n  "));
assert.equal(fails.length, 0, `${fails.length}건 실패`);
console.log("통과");
