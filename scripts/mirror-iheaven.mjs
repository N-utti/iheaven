// 원본(iheaven.kr)의 공개 페이지와 그 페이지가 실제로 불러오는 파일을 그대로 내려받는다.
// 사용: node scripts/mirror-iheaven.mjs   (결과: docs/research/iheaven/mirror, manifest.json)
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ORIGIN = "https://iheaven.kr";
const OUT = path.resolve("docs/research/iheaven/mirror");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const MAX_PAGES = 400;
// 상태를 바꾸거나 로그인이 필요한 주소는 건드리지 않는다.
const SKIP = /logout|write|delete|modify|update|_proc|process|download|admin|mypage/i;

const pages = new Map(); // url -> 저장 경로
const assets = new Map();
const failed = [];
// 추가 시작 주소는 명령줄 인자로 준다 (버튼으로만 열리는 화면 등)
const queue = [ORIGIN + "/", ...process.argv.slice(2).map((p) => ORIGIN + p)];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function localPath(u, isPage) {
  const url = new URL(u);
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith("/")) p += "index.html";
  if (url.search) p += "__" + url.search.slice(1).replace(/[^\w.=-]+/g, "_");
  if (isPage && !/\.html?$/.test(p)) p += ".html";
  const host = url.origin === ORIGIN ? "" : "_ext/" + url.host;
  return path.join(OUT, host, p.replace(/[<>:"|?*]/g, "_"));
}

async function get(u) {
  const res = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get("content-type") || "", finalUrl: res.url };
}

async function save(file, buf) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
}

function abs(ref, base) {
  try {
    const u = new URL(ref.trim().replace(/&amp;/g, "&"), base);
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

function refsFromHtml(html, base) {
  const pageLinks = [];
  const assetLinks = [];
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["']/gi)) {
    const u = abs(m[1], base);
    if (u && u.startsWith(ORIGIN) && !SKIP.test(u) && !/\.(jpe?g|png|gif|webp|svg|pdf|zip|hwp)(\?|$)/i.test(u)) pageLinks.push(u);
    else if (u && u.startsWith(ORIGIN) && /\.(jpe?g|png|gif|webp|svg|pdf)(\?|$)/i.test(u)) assetLinks.push(u);
  }
  for (const m of html.matchAll(/link\('([^'\\]+)'\)/g)) {
    const u = abs(m[1], base);
    if (u && u.startsWith(ORIGIN) && !SKIP.test(u) && !u.includes("' +")) pageLinks.push(u);
  }
  for (const m of html.matchAll(/<(?:img|script|source|video|audio|link|iframe)\b[^>]*?(?:src|href|data-src|data-lazy|poster)\s*=\s*["']([^"']+)["']/gi)) {
    const u = abs(m[1], base);
    if (u) assetLinks.push(u);
  }
  for (const m of html.matchAll(/srcset\s*=\s*["']([^"']+)["']/gi))
    for (const part of m[1].split(",")) {
      const u = abs(part.trim().split(/\s+/)[0], base);
      if (u) assetLinks.push(u);
    }
  for (const m of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const u = abs(m[1], base);
    if (u && !m[1].startsWith("data:")) assetLinks.push(u);
  }
  return { pageLinks, assetLinks };
}

async function fetchAsset(u) {
  if (assets.has(u) || /\.php(\?|$)/i.test(u) && u.startsWith(ORIGIN)) return;
  assets.set(u, null);
  try {
    const file = localPath(u, false);
    const had = existsSync(file);
    const { buf, type } = had ? { buf: readFileSync(file), type: /\.css(\?|$)/i.test(u) ? "text/css" : "" } : await get(u);
    if (!had) await save(file, buf);
    assets.set(u, { file: path.relative(OUT, file), type, bytes: buf.length });
    if (/css/i.test(type) || /\.css(\?|$)/i.test(u)) {
      const css = buf.toString("utf8");
      for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/gi)) {
        const ref = m[1] || m[2];
        if (ref.startsWith("data:")) continue;
        const a = abs(ref, u);
        if (a) await fetchAsset(a);
      }
    }
  } catch (e) {
    failed.push({ url: u, error: String(e.message || e) });
  }
  await sleep(40);
}

while (queue.length && pages.size < MAX_PAGES) {
  const u = queue.shift();
  if (pages.has(u)) continue;
  pages.set(u, null);
  try {
    const { buf, type } = await get(u);
    if (!/html/i.test(type)) {
      pages.delete(u);
      await fetchAsset(u);
      continue;
    }
    const file = localPath(u, true);
    await save(file, buf);
    pages.set(u, path.relative(OUT, file));
    const { pageLinks, assetLinks } = refsFromHtml(buf.toString("utf8"), u);
    for (const p of pageLinks) if (!pages.has(p) && !queue.includes(p)) queue.push(p);
    for (const a of assetLinks) await fetchAsset(a);
    console.log(`[${pages.size}] ${u} (+${queue.length} 대기)`);
  } catch (e) {
    failed.push({ url: u, error: String(e.message || e) });
  }
  await sleep(150);
}

const manifest = {
  pages: Object.fromEntries([...pages].filter(([, v]) => v)),
  assets: Object.fromEntries([...assets].filter(([, v]) => v)),
  failed,
  leftInQueue: queue,
};
await writeFile(path.resolve("docs/research/iheaven/manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`페이지 ${Object.keys(manifest.pages).length} / 파일 ${Object.keys(manifest.assets).length} / 실패 ${failed.length} / 남은 대기 ${queue.length}`);
