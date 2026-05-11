#!/usr/bin/env node
/**
 * List JSON leaf values where pt-BR equals en (likely untranslated).
 * Usage: node scripts/locale-value-audit.cjs [namespace.json ...]
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "public", "locales");

function flatten(obj, prefix = "") {
	const out = {};
	for (const k of Object.keys(obj)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (
			obj[k] !== null &&
			typeof obj[k] === "object" &&
			!Array.isArray(obj[k])
		) {
			Object.assign(out, flatten(obj[k], key));
		} else {
			out[key] = obj[k];
		}
	}
	return out;
}

const args = process.argv.slice(2);
const dirEn = path.join(LOCALES, "en");
const files =
	args.length > 0
		? args
		: fs.readdirSync(dirEn).filter((f) => f.endsWith(".json"));

let totalSame = 0;
for (const file of files.sort()) {
	const pEn = path.join(LOCALES, "en", file);
	const pPt = path.join(LOCALES, "pt-BR", file);
	if (!fs.existsSync(pEn) || !fs.existsSync(pPt)) continue;
	const en = flatten(JSON.parse(fs.readFileSync(pEn, "utf8")));
	const pt = flatten(JSON.parse(fs.readFileSync(pPt, "utf8")));
	let n = 0;
	for (const k of Object.keys(en)) {
		if (pt[k] === undefined) continue;
		if (typeof en[k] === "string" && en[k] === pt[k] && en[k].length > 2) {
			n++;
			console.log(`${file}\t${k}`);
		}
	}
	if (n) console.error(`# ${file}: ${n} keys with identical en/pt-BR string values`);
	totalSame += n;
}
console.error(`\nTotal identical string pairs: ${totalSame}`);
