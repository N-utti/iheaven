import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 화면 HTML 은 실행 중에 파일로 읽으므로 배포 묶음에 함께 넣는다
  outputFileTracingIncludes: {
    "/[[...slug]]": ["./src/sites/iheaven/pages/**"],
  },
};

export default nextConfig;
