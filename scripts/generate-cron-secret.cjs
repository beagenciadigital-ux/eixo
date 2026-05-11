#!/usr/bin/env node
/**
 * Gera um CRON_SECRET forte (48 bytes aleatórios em base64url).
 * Cola o valor em CRON_SECRET no EasyPanel / .env.local e no header Bearer do cron.
 *
 * Uso: pnpm run generate:cron-secret
 *      node scripts/generate-cron-secret.cjs
 */
const crypto = require("crypto");

const secret = crypto.randomBytes(48).toString("base64url");
process.stdout.write(`${secret}\n`);
