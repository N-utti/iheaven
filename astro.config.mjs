import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://n-utti.github.io',
  // GitHub Pages 주소가 /iheaven/ 아래라 배포 빌드에만 붙인다. 개발 서버는 루트에서 열리게
  base: process.argv.includes('dev') ? '/' : '/iheaven',
  // 레이아웃의 이미지·링크가 상대 경로라 하위 페이지도 index.html 옆에 privacy.html 로 둔다
  build: { format: 'file' },
});
