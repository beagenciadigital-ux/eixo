#!/usr/bin/env node
/**
 * Compare flattened JSON keys across public/locales/{en,es,pt-BR}/*.json
 * Usage: node scripts/locale-key-diff.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LOCALES_DIR = path.join(ROOT, "public", "locales");
const LANGS = ["en", "es", "pt-BR"];

function flatten(obj, prefix = "") {
	const out = [];
	for (const k of Object.keys(obj)) {
		const key = prefix ? `${prefix}.${k}` : k;
		if (
			obj[k] !== null &&
			typeof obj[k] === "object" &&
			!Array.isArray(obj[k])
		) {
			out.push(...flatten(obj[k], key));
		} else {
			out.push(key);
		}
	}
	return out;
}

const files = new Set();
for (const lang of LANGS) {
	const dir = path.join(LOCALES_DIR, lang);
	if (!fs.existsSync(dir)) continue;
	for (const f of fs.readdirSync(dir)) {
		if (f.endsWith(".json")) files.add(f);
	}
}

let exitCode = 0;
for (const file of [...files].sort()) {
	const sets = {};
	for (const lang of LANGS) {
		const p = path.join(LOCALES_DIR, lang, file);
		if (!fs.existsSync(p)) {
			sets[lang] = null;
			continue;
		}
		sets[lang] = new Set(
			flatten(JSON.parse(fs.readFileSync(p, "utf8"))),
		);
	}
	const ref = sets.en;
	if (!ref) {
		console.warn(`[skip] ${file}: no en baseline`);
		continue;
	}
	for (const lang of ["es", "pt-BR"]) {
		if (!sets[lang]) {
			console.error(`MISSING FILE ${lang}/${file}`);
			exitCode = 1;
			continue;
		}
		for (const k of ref) {
			if (!sets[lang].has(k)) {
				console.error(`MISSING ${lang}/${file}: ${k}`);
				exitCode = 1;
			}
		}
		for (const k of sets[lang]) {
			if (!ref.has(k)) {
				console.error(`EXTRA ${lang}/${file}: ${k}`);
				exitCode = 1;
			}
		}
	}
}

process.exit(exitCode);
