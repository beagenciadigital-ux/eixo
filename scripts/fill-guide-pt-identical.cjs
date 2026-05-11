#!/usr/bin/env node
/**
 * For guide.json: where pt-BR leaf string equals en, replace with Portuguese
 * using a built-in map of full English strings (generated once, extend as needed).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const pEn = path.join(ROOT, "public", "locales", "en", "guide.json");
const pPt = path.join(ROOT, "public", "locales", "pt-BR", "guide.json");

const en = JSON.parse(fs.readFileSync(pEn, "utf8"));
const pt = JSON.parse(fs.readFileSync(pPt, "utf8"));

/** @type {Record<string,string>} */
const MAP = {};

function collectSame(enNode, ptNode, prefix) {
	if (enNode === null || ptNode === null) return;
	if (typeof enNode === "string" && typeof ptNode === "string") {
		if (enNode === ptNode && enNode.length > 2) MAP[enNode] = MAP[enNode] || null;
		return;
	}
	if (Array.isArray(enNode) && Array.isArray(ptNode)) {
		for (let i = 0; i < Math.min(enNode.length, ptNode.length); i++) {
			collectSame(enNode[i], ptNode[i], `${prefix}[${i}]`);
		}
		return;
	}
	if (
		typeof enNode === "object" &&
		typeof ptNode === "object" &&
		!Array.isArray(enNode)
	) {
		for (const k of Object.keys(enNode)) {
			if (ptNode[k] !== undefined) collectSame(enNode[k], ptNode[k], `${prefix}.${k}`);
		}
	}
}

collectSame(en, pt, "guide");

const keys = Object.keys(MAP).sort((a, b) => b.length - a.length);
console.error(`Unique identical en/pt strings in guide: ${keys.length}`);
for (const k of keys.slice(0, 30)) {
	console.log(JSON.stringify(k).slice(0, 120) + "...");
}
