import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://n-utti.github.io',
  // GitHub Pages 주소가 /iheaven/ 아래라 배포 빌드에만 붙인다. 개발 서버는 루트에서 열리게
  base: process.argv.includes('dev') ? '/' : '/iheaven',
});
