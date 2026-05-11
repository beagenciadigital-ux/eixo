import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

/**
 * Garante DATABASE_URL, DB_*, JWT_SECRET, etc. em process.env antes da API Express / TypeORM.
 * Alinha com a convenção Next: `.env` base → `.env.local` sobrepõe no teu PC (incl. localhost).
 */
const cwd = process.cwd();
for (const filename of [".env", ".env.local"] as const) {
	const p = path.join(cwd, filename);
	if (existsSync(p)) {
		loadDotenv({
			path: p,
			override: filename === ".env.local",
		});
	}
}

const nextConfig: NextConfig = {
	output: "standalone",
	// Recompile deps that still ship classic JSX (`__self`) so React 19 stops warning in dev.
	transpilePackages: ["react-router", "react-router-dom"],
	allowedDevOrigins: ["192.168.15.159"],
	experimental: {
		serverMinification: false,
	},
	turbopack: {
		root: path.resolve(process.cwd()),
	},
	serverExternalPackages: [
		"typeorm",
		"class-transformer",
		"class-validator",
		"pg",
		"mysql",
		"reflect-metadata",
		"bcrypt",
		"express",
		"i18next-fs-backend",
		"@sentry/profiling-node",
		"json2csv",
		"nodemailer",
		"@aws-sdk/client-ses",
		"@sendgrid/mail",
	],
};

export default nextConfig;
