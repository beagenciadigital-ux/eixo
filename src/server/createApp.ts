import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRoutes from "./routes";
import trim from "./middleware/trim";
import { ensureDb } from "@/lib/db";

let appSingleton: express.Express | null = null;

function readAppVersion(): string {
	if (process.env.APP_VERSION) {
		return process.env.APP_VERSION;
	}
	try {
		const packageJsonPath = path.resolve(process.cwd(), "package.json");
		const contents = fs.readFileSync(packageJsonPath, "utf8");
		const parsed = JSON.parse(contents) as { version?: string };
		if (parsed && typeof parsed.version === "string") {
			return parsed.version;
		}
	} catch {
		// ignore
	}
	return "unknown";
}

const APP_VERSION = readAppVersion();

export function getApiApp(): express.Express {
	if (appSingleton) {
		return appSingleton;
	}

	const app = express();

	/** Avoid 304 + empty body on API GETs (axios then gets no JSON → Redux/UI breaks). */
	app.set("etag", false);

	Sentry.init({
		dsn: "https://31985fcd0be208efe31e249cf10b34f5@o4505988856676352.ingest.sentry.io/4505988959895552",
		integrations: [
			new Sentry.Integrations.Http({ tracing: true }),
			new Sentry.Integrations.Express({ app }),
			new ProfilingIntegration(),
		],
		tracesSampleRate: 0.5,
		profilesSampleRate: 0.5,
	});

	app.use(Sentry.Handlers.requestHandler());
	app.use(Sentry.Handlers.tracingHandler());

	app.use(async (_req, _res, next) => {
		try {
			await ensureDb();
			next();
		} catch (e) {
			next(e);
		}
	});

	app.use(express.json());
	app.use(process.env.NODE_ENV === "development" ? morgan("dev") : morgan("tiny"));
	app.use(trim);
	app.use(cookieParser());

	const allowedOriginsFromEnv = (process.env.ORIGIN || "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);

	const defaultAllowedOrigins = [
		"https://neopromisance.com",
		"https://www.neopromisance.com",
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	];

	const mergedAllowedOrigins = Array.from(
		new Set([...defaultAllowedOrigins, ...allowedOriginsFromEnv]),
	);

	app.use(
		cors({
			credentials: true,
			origin: mergedAllowedOrigins,
			optionsSuccessStatus: 200,
		}),
	);

	const devWebUrl = process.env.PUBLIC_WEB_URL || "http://localhost:3000";

	app.get("/", (_, res) => {
		if (process.env.NODE_ENV === "development") {
			return res.type("html").send(`<!DOCTYPE html>
<html lang="pt"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/><title>Eixo do Mal — API</title>
<style>body{font-family:system-ui,sans-serif;max-width:42rem;margin:2rem auto;line-height:1.5;padding:0 1rem}a{color:#0d9488}</style></head><body>
<h1>Next.js + API integrados</h1>
<p>Interface do jogo: <a href="${devWebUrl}">${devWebUrl}</a></p>
</body></html>`);
		}
		res.type("text/plain").send("Eixo do Mal — use a interface web.");
	});

	app.get("/api/", (_, res) => {
		res.json({
			ok: true,
			service: "Eixo do Mal API",
			hint:
				process.env.NODE_ENV === "development"
					? `Game UI (dev): ${devWebUrl}`
					: undefined,
		});
	});

	app.get("/api/version", (_, res) => {
		res.json({ version: APP_VERSION });
	});

	app.get("/api/perpetual/hello", (req, res) => {
		console.log(req.url);
		res.send("hello perpetual");
	});

	app.use("/api", apiRoutes);

	app.get("/debug-sentry", function mainHandler(_req, _res) {
		throw new Error("My first Sentry error!");
	});

	app.use(Sentry.Handlers.errorHandler());

	app.use(function onError(
		err: unknown,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) {
		const sentryId = (res as express.Response & { sentry?: string }).sentry;
		res.statusCode = 500;
		res.end(String(sentryId ?? err) + "\n");
	});

	if (process.env.NODE_ENV === "development") {
		const g = globalThis as typeof globalThis & {
			__eixoDevSchedulerStarted?: boolean;
		};
		if (!g.__eixoDevSchedulerStarted) {
			g.__eixoDevSchedulerStarted = true;
			void import("./devScheduler")
				.then((m) => m.startDevScheduler())
				.catch((err) => {
					console.error("[Eixo do Mal] dev scheduler failed:", err);
				});
		}
	}

	appSingleton = app;
	return app;
}

if (
	process.env.NODE_ENV === "development" &&
	typeof module !== "undefined"
) {
	const hot = (
		module as NodeModule & { hot?: { dispose: (cb: () => void) => void } }
	).hot;
	hot?.dispose(() => {
		void import("@/lib/db").then((m) => m.resetEixoTypeormConnection());
	});
}
