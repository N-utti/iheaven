import { readFile } from "node:fs/promises";
import path from "node:path";
import routes from "@/sites/iheaven/routes.json";

// 원본 홈페이지(iheaven.kr)의 화면을 원래 주소 그대로 내보낸다.
// 화면 파일은 scripts/build-iheaven.mjs 가 src/sites/iheaven/pages 에 만든다.
// shortcut: 화면을 HTML 통째로 내보낸다. 어떤 화면에 새 기능(상담 신청 등)을 붙일 때 그 화면부터 React 페이지로 바꾼다.
const PAGES_DIR = path.join(process.cwd(), "src/sites/iheaven/pages");
const table: Record<string, string> = routes;

export async function GET(request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const pathname = "/" + (slug ?? []).join("/");
  const idx = new URL(request.url).searchParams.get("idx");
  const file = (idx && /^\d+$/.test(idx) ? table[`${pathname}?idx=${idx}`] : undefined) ?? table[pathname];

  if (!file) {
    // 원본은 로그인이 필요한 화면(마이페이지 등)을 첫 화면으로 돌려보낸다
    if (pathname.startsWith("/page/member/")) return Response.redirect(new URL("/", request.url), 302);
    return new Response("Not Found", { status: 404 });
  }
  const html = await readFile(path.join(PAGES_DIR, file), "utf8");
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
