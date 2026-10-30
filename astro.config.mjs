import { defineConfig } from 'astro/config';

export default defineConfig({
  // 커스텀 도메인(i-heaven.kr)이라 루트에서 열림. 옛 주소 n-utti.github.io/iheaven 은 GitHub 가 여기로 301
  site: 'https://i-heaven.kr',
  // 레이아웃의 이미지·링크가 상대 경로라 하위 페이지도 index.html 옆에 privacy.html 로 둔다
  build: { format: 'file' },
});
