#!/usr/bin/env node
/**
 * Define role=admin para um utilizador existente pela coluna username.
 * Uso: node scripts/promote-user-admin.cjs maverick
 */
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const usernameArg = process.argv[2]?.trim();
if (!usernameArg) {
	console.error("Uso: node scripts/promote-user-admin.cjs <username>");
	process.exit(1);
}

async function main() {
	const databaseUrl =
		typeof process.env.DATABASE_URL === "string"
			? process.env.DATABASE_URL.trim()
			: "";
	const useSsl =
		process.env.DB_SSL === "true" ||
		process.env.DB_SSL === "1" ||
		/database\.neon\.tech|neon\.tech|sslmode=require/i.test(databaseUrl);

	const config = databaseUrl
		? { connectionString: databaseUrl }
		: {
				host: process.env.DB_HOST,
				port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
				user: process.env.DB_USERNAME,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_DATABASE,
		  };

	if (useSsl && !databaseUrl) {
		config.ssl = { rejectUnauthorized: false };
	}

	const client = new Client(config);
	await client.connect();
	try {
		const res = await client.query(
			`UPDATE users SET role = 'admin'
       WHERE lower(username) = lower($1)
       RETURNING u_id, username, role`,
			[usernameArg],
		);
		if (res.rowCount === 0) {
			console.error(
				`Nenhum utilizador com username igual a "${usernameArg}".`,
			);
			process.exitCode = 1;
			return;
		}
		console.log("OK:", res.rows[0]);
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
