// 扫描 pictures/ 目录，生成 assets/pictures.js 图片清单。
// 纯 Node.js（无第三方依赖），本地运行：node scripts/build-pictures.mjs
import { readdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const picDir = path.join(root, 'pictures');
const outFile = path.join(root, 'assets', 'pictures.js');

const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp', '.svg']);

try {
  await access(picDir);
} catch {
  console.error(`找不到目录：${picDir}`);
  process.exit(1);
}

const entries = await readdir(picDir, { withFileTypes: true });
const names = entries
  .filter((e) => e.isFile() && EXTS.has(path.extname(e.name).toLowerCase()))
  .map((e) => e.name)
  .sort();

const body =
  'window.PICTURES = [\n' +
  names.map((n) => `  ${JSON.stringify(n)},\n`).join('') +
  '];\n';

await writeFile(outFile, body, 'utf8');

console.log(`已写入 ${path.relative(root, outFile)}，共 ${names.length} 张图片：`);
for (const n of names) console.log(`  - ${n}`);
