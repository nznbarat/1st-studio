/**
 * Толины шалгалт: JS синтакс, давхардал, хоосон утга, латин үсэг.
 * Ажиллуулах:  node tools/check-dict.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dictDir = join(root, "world-builder", "js", "dict");

const cats = [];
const map = new Map();
const dupes = [];
const problems = [];

const sandbox = {
  WB: {
    dict: {
      add(cat) {
        const words = cat.w || cat.words || {};
        let n = 0;
        for (const key of Object.keys(words)) {
          const mn = key.trim().toLowerCase();
          const en = words[key];
          if (!mn) { problems.push(`[${cat.id}] хоосон түлхүүр`); continue; }
          if (!en) { problems.push(`[${cat.id}] "${mn}" — англи утга хоосон`); continue; }
          if (/[a-z]/i.test(mn) && !/[а-яөүё]/i.test(mn)) problems.push(`[${cat.id}] "${mn}" — латин түлхүүр?`);
          if (/[а-яөүё]/i.test(en)) problems.push(`[${cat.id}] "${mn}" → "${en}" — англи талд кирилл`);
          if (map.has(mn)) { dupes.push(`${mn}  (${map.get(mn)} ↔ ${cat.id})`); continue; }
          map.set(mn, cat.id);
          n++;
        }
        cats.push({ id: cat.id, label: cat.label, icon: cat.icon, count: n, file: currentFile });
      }
    }
  }
};
vm.createContext(sandbox);

let currentFile = "";
const files = readdirSync(dictDir).filter((f) => f.endsWith(".js")).sort();
for (const f of files) {
  currentFile = f;
  const code = readFileSync(join(dictDir, f), "utf8");
  try {
    vm.runInContext(code, sandbox, { filename: f });
  } catch (e) {
    console.error(`✗ ${f}: ${e.message}`);
    process.exitCode = 1;
  }
}

const byFile = {};
for (const c of cats) {
  byFile[c.file] = (byFile[c.file] || 0) + c.count;
}

console.log("── Ангилал ──");
for (const c of cats) console.log(String(c.count).padStart(6), " ", c.icon, c.label, `(${c.id})`);
console.log("\n── Файл ──");
for (const [f, n] of Object.entries(byFile)) console.log(String(n).padStart(6), " ", f);

console.log("\nАнгилал:", cats.length);
console.log("Нийт давтагдашгүй үг:", map.size);
if (dupes.length) {
  console.log("\nДавхардсан (" + dupes.length + "):");
  console.log(dupes.slice(0, 60).join("\n"));
}
if (problems.length) {
  console.log("\nАнхаарах (" + problems.length + "):");
  console.log(problems.slice(0, 60).join("\n"));
}
