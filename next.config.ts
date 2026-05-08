import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
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
