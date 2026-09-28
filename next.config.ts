import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 是原生模块,需要让 Next 在服务端直接引用而不是打包
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
