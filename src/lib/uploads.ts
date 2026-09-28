import fs from "node:fs";
import path from "node:path";

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// 删除上传的照片文件;只处理 /uploads/ 路径(防路径穿越),文件缺失等错误一律忽略
export function deleteUploadedFiles(paths: string[]) {
  for (const p of paths) {
    if (!p.startsWith("/uploads/")) continue;
    const file = path.join(UPLOADS_DIR, path.basename(p));
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch {
      // 忽略:文件可能已被删除或不可写
    }
  }
}
