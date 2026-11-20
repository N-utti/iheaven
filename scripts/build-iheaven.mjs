// 내려받은 원본(docs/research/iheaven/mirror)을 이 앱이 내보낼 형태로 옮긴다.
//   그림·글꼴·CSS·JS  -> public/  (원본과 같은 주소)
//   화면 HTML        -> src/sites/iheaven/pages/  + routes.json (주소 -> 파일)
// 사용: node scripts/build-iheaven.mjs   (KEEP_TRACKERS=1 이면 방문 통계 코드를 남긴다)
import fs from "node:fs";
import path from "node:path";

const R = "docs/research/iheaven";
const MIRROR = path.join(R, "mirror");
const PAGES_OUT = "src/sites/iheaven/pages";
const ORIGIN = "https://iheaven.kr";
const KEEP_TRACKERS = process.env.KEEP_TRACKERS === "1";

const manifest = JSON.parse(fs.readFileSync(path.join(R, "manifest.json"), "utf8"));
const snap = JSON.parse(fs.readFileSync(path.join(R, "dynamic-snapshot.json"), "utf8"));

// ---- 1. 파일 복사: 수집기가 붙인 "__dt=…" "__v=2" 꼬리표(주소의 ? 뒷부분)는 떼어낸다
let copied = 0;
function copyDir(from, to) {
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, e.name);
    if (e.isDirectory()) copyDir(src, path.join(to, e.name));
    else {
      fs.mkdirSync(to, { recursive: true });
      fs.copyFileSync(src, path.join(to, e.name.replace(/__[\w.=-]*$/, "")));
      copied++;
    }
  }
}
for (const d of ["css", "font", "images", "js", "js_lib", "upload", "video"]) {
  if (fs.existsSync(path.join(MIRROR, d))) copyDir(path.join(MIRROR, d), path.join("public", d));
}

// ---- 2. 화면에 직접 적혀 있지 않고 스크립트·게시글·팝업 안에서만 불리는 파일도 받아 둔다
const modal = JSON.parse(fs.readFileSync(path.join(R, "modal-snapshot.json"), "utf8")).modalHtml;
const localize = (s) => s.replaceAll(ORIGIN + "/upload/", "/upload/").replaceAll(ORIGIN + "/ajax/", "/ajax/");
const haystack = [
  localize(JSON.stringify(snap)),
  modal,
  ...fs.readdirSync("public/js").map((f) => fs.readFileSync(path.join("public/js", f), "utf8")),
  ...Object.values(manifest.pages).map((rel) => localize(fs.readFileSync(path.join(MIRROR, rel), "utf8"))),
].join("\n");
const extra = new Set();
for (const m of haystack.matchAll(/["'(=](\/(?:images|upload|font|video|css|js|js_lib)\/[^"')\s\\<>+]+\.(?:png|jpe?g|gif|svg|webp|mp4|css|js|woff2?|ttf))/gi)) extra.add(m[1]);
const missing = [];
for (const p of extra) {
  const file = path.join("public", decodeURIComponent(p.split("?")[0]));
  if (fs.existsSync(file)) continue;
  const res = await fetch(ORIGIN + encodeURI(decodeURIComponent(p)), { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    missing.push(`${res.status} ${p}`);
    continue;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  copied++;
}

// ---- 3. 화면 HTML 변환
const TRACKER_SRC = /googletagmanager\.com|smlog\.co\.kr|onetag\.co\.kr|wcs\.naver\.net/;
const TRACKER_INLINE = /gtag\(|hpt_info|hpt_trace_info|wcs_add|wcs_do\(/;
function stripTrackers(html) {
  return html
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (all, attrs, body) => (TRACKER_SRC.test(attrs) || TRACKER_INLINE.test(body) ? "" : all))
    .replace(/<noscript>[\s\S]*?smlog[\s\S]*?<\/noscript>/gi, "");
}

const embed = (v) => JSON.stringify(v).replace(/<\//g, "<\\/");

function tailScript(key) {
  const fill = snap[key] ? JSON.parse(localize(JSON.stringify(snap[key]))) : null;
  // 원본은 화면이 뜰 때 약관·사이트맵 팝업 묶음을 서버에서 받아 붙였다. 받아 둔 것을 같은 방식으로 붙인다.
  const parts = [`$('body').append(${embed(modal)});`];
  // 원본은 서버가 화면이 뜬 뒤 내용을 채워 줬다. 여기서는 받아 둔 내용으로 같은 자리를 채운다.
  if (fill) parts.push(`var S=${embed(fill)};$.each(S,function(sel,arr){$(sel).each(function(i){if(arr[i]!=null)this.innerHTML=arr[i];});});`);
  if (key === "/page/brandstory/iheaven-brandstory.php")
    parts.push(
      `var H=${embed(snap.history)};window.showHistoryHighlight=function(id){var d=H[id];if(!d)return;$('#sub-history-content').html(d.highlight_content);$('.background-minor .content h6').text(d.content);$('.major-history').fadeIn();$('.background-minor').fadeIn();};`,
    );
  // shortcut: 로그인·가입·예약 저장은 아직 서버가 없다. 조용히 실패하지 않게 알린다. 해당 기능을 만들면 이 줄을 지운다.
  parts.push(`$(document).ajaxError(function(e,x,s){if(s.type==='POST'&&(x.status===404||x.status===405)&&s.url.indexOf('modal-html')<0)alert('이 기능은 새 홈페이지로 옮기는 중입니다.\\n전화 010-5773-2119 로 문의해 주세요.');});`);
  return `<script type="text/javascript">/* 이전 작업으로 추가됨 */$(function(){${parts.join("")}});</script>\n`;
}

fs.rmSync(PAGES_OUT, { recursive: true, force: true });
fs.mkdirSync(PAGES_OUT, { recursive: true });
const routes = {};
for (const [url, rel] of Object.entries(manifest.pages)) {
  const u = new URL(url);
  const idx = u.searchParams.get("idx");
  if (u.search && !idx) continue; // ?page=1 같은 변형은 기본 화면과 같다
  const key = u.pathname + (idx ? `?idx=${idx}` : "");
  const snapKey = idx ? u.pathname + u.search : u.pathname;
  let html = fs.readFileSync(path.join(MIRROR, rel), "utf8");
  if (!KEEP_TRACKERS) html = stripTrackers(html);
  html = localize(html)
    // 원본에 남아 있던 옛 이름(petforest)의 깨진 링크를 바로잡는다
    .replaceAll("/page/brandstory/petforest-brandstory.php", "/page/brandstory/iheaven-brandstory.php");
  if (!/<\/body>/i.test(html)) continue; // 로그인해야 열리는 화면: 원본도 내용 없이 첫 화면으로 돌려보낸다
  html = html.replace(/<\/body>/i, tailScript(snapKey) + "</body>");
  const name = (u.pathname === "/" ? "index" : u.pathname.replace(/^\/|\.php$/g, "").replaceAll("/", "__")) + (idx ? `-${idx}` : "") + ".html";
  // 법인 정보로 바꾼다 (사업자등록증 2026-07-02: 대표자 임채윤 / 대표 전화 1577-5474). 원본 글자 간격 표기는 유지한다.
  html = html.replaceAll("010-5773-2119", "1577-5474").replaceAll("정 이 찬", "임 채 윤");
  // 네이버 서치어드바이저 소유 확인 태그
  html = html.replace(/<meta charset="UTF-8">/i, (m) => `${m}\n\t<meta name="naver-site-verification" content="d469350708569523a48875194527494c01b6256e" />`);
  fs.writeFileSync(path.join(PAGES_OUT, name), html);
  routes[key] = name;
}
fs.writeFileSync("src/sites/iheaven/routes.json", JSON.stringify(routes, null, 2) + "\n");

console.log(`파일 ${copied}개 복사 / 화면 ${Object.keys(routes).length}개 변환 / 통계코드 ${KEEP_TRACKERS ? "유지" : "제거"}`);
if (missing.length) console.log("못 받은 그림:\n  " + missing.join("\n  "));
