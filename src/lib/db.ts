import "reflect-metadata";
import {
	createConnection,
	getConnection,
	getConnectionManager,
	type Connection,
	type Repository,
} from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { typeOrmEntities, typeOrmSubscribers } from "@/server/entity/allEntities";
import type User from "@/server/entity/User";
import type Session from "@/server/entity/Session";
import type ResetToken from "@/server/entity/ResetToken";
import type Game from "@/server/entity/Game";
import type Empire from "@/server/entity/Empire";
import type RoundHistory from "@/server/entity/RoundHistory";
import type EmpireHistory from "@/server/entity/EmpireHistory";
import type ClanHistory from "@/server/entity/ClanHistory";
import type Clan from "@/server/entity/Clan";
import type ClanMessage from "@/server/entity/ClanMessage";
import type ClanRelation from "@/server/entity/ClanRelation";
import type EmpireNews from "@/server/entity/EmpireNews";
import type Market from "@/server/entity/Market";
import type EmpireMessage from "@/server/entity/EmpireMessage";
import type EmpireIntel from "@/server/entity/EmpireIntel";
import type EmpireSnapshot from "@/server/entity/EmpireSnapshot";
import type Lottery from "@/server/entity/Lottery";
import type EmpireEffect from "@/server/entity/EmpireEffect";

const g = globalThis as typeof globalThis & {
	__eixo_typeorm_connection?: Promise<Connection>;
	__eixo_game_bootstrap_done?: boolean;
};

function assertEnv(): void {
	const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
	const dbPassword = process.env.DB_PASSWORD;
	const passwordMissingOrPlaceholder =
		!dbPassword || dbPassword === "REPLACE_WITH_DATABASE_PASSWORD";

	if (!hasDatabaseUrl && passwordMissingOrPlaceholder) {
		throw new Error(
			"[Eixo do Mal] Configura DATABASE_URL ou DB_PASSWORD no .env (ver .env.example).",
		);
	}

	if (!process.env.JWT_SECRET?.trim()) {
		if (process.env.NODE_ENV === "production") {
			throw new Error(
				"[Eixo do Mal] JWT_SECRET é obrigatório em produção.",
			);
		}
		process.env.JWT_SECRET =
			"dev-only-jwt-secret-not-for-production-never-deploy-this";
	}
}

function buildConnectionOptions() {
	const databaseUrl =
		typeof process.env.DATABASE_URL === "string"
			? process.env.DATABASE_URL.trim()
			: "";

	const useSsl = process.env.DB_SSL === "true" || process.env.DB_SSL === "1";

	const common = {
		synchronize: process.env.TYPEORM_SYNC !== "false",
		logging: process.env.TYPEORM_LOGGING === "true",
		namingStrategy: new SnakeNamingStrategy(),
		entities: typeOrmEntities,
		subscribers: typeOrmSubscribers,
		name: "default" as const,
	};

	if (databaseUrl) {
		return {
			type: "postgres" as const,
			url: databaseUrl,
			...common,
		};
	}

	return {
		type: (process.env.DB_DIALECT || "postgres") as "postgres",
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		...(useSsl && {
			ssl: { rejectUnauthorized: false },
		}),
		...common,
	};
}

/**
 * Em desenv: garante pelo menos um jogo listável — cria um se a tabela `game`
 * estiver vazia, ou reativa o mais recente se todos estiverem inativos.
 * Para criar jogo default em produção numa base vazia, define `SEED_DEFAULT_GAME=true`.
 */
async function bootstrapDefaultGameIfNeeded(connection: Connection): Promise<void> {
	if (g.__eixo_game_bootstrap_done) {
		return;
	}

	const dev = process.env.NODE_ENV === "development";
	const seedWhenEmpty =
		dev || process.env.SEED_DEFAULT_GAME === "true";

	try {
		const repo = connection.getRepository("game") as Repository<Game>;

		if (dev) {
			const total = await repo.count();
			const activeCount = await repo.count({ where: { isActive: true } });
			if (total > 0 && activeCount === 0) {
				const latest = await repo.find({
					order: { createdAt: "DESC" },
					take: 1,
				});
				const row = latest[0];
				if (row) {
					row.isActive = true;
					await repo.save(row);
					console.warn(
						"[Eixo do Mal] Nenhum jogo ativo: reativámos o mais recente (dev).",
					);
				}
			}
		}

		if (seedWhenEmpty && (await repo.count()) === 0) {
			const now = new Date();
			const roundEnd = new Date(now.getTime());
			roundEnd.setUTCFullYear(roundEnd.getUTCFullYear() + 1);

			await repo.save(
				repo.create({
					name: "Jogo padrão",
					isActive: true,
					roundName: "Ronda 1",
					roundStart: now,
					roundEnd,
					lastTurnsUpdate: now,
					lastAidUpdate: now,
					roundDescription:
						"Criado automaticamente (tabela de jogos vazia). Podes editar no admin.",
				}),
			);
			console.warn(
				"[Eixo do Mal] Criámos um jogo padrão (base vazia). Configura no admin se precisares.",
			);
		}
	} finally {
		g.__eixo_game_bootstrap_done = true;
	}
}

/**
 * Single cached connection per serverless instance / dev process.
 * Use a pooler URL (e.g. Neon pooled) in production on Vercel.
 */
export function ensureDb(): Promise<Connection> {
	assertEnv();
	if (!g.__eixo_typeorm_connection) {
		g.__eixo_typeorm_connection = (async () => {
			const manager = getConnectionManager();
			let connection: Connection;
			if (manager.has("default")) {
				connection = manager.get("default");
			} else {
				connection = await createConnection(buildConnectionOptions());
			}
			await bootstrapDefaultGameIfNeeded(connection);
			return connection;
		})();
	}
	return g.__eixo_typeorm_connection;
}

/**
 * Close the default connection and drop the cached promise. Call after HMR when
 * entity modules were re-evaluated so TypeORM metadata matches current classes.
 */
export async function resetEixoTypeormConnection(): Promise<void> {
	const prev = g.__eixo_typeorm_connection;
	g.__eixo_typeorm_connection = undefined;
	g.__eixo_game_bootstrap_done = undefined;
	if (prev) {
		try {
			const c = await prev;
			if (c.isConnected) await c.close();
		} catch {
			// ignore
		}
	}
	const manager = getConnectionManager();
	if (manager.has("default")) {
		try {
			const c = manager.get("default");
			if (c.isConnected) await c.close();
		} catch {
			// ignore
		}
	}
}

if (
	process.env.NODE_ENV === "development" &&
	typeof module !== "undefined"
) {
	const hot = (
		module as NodeModule & { hot?: { dispose: (cb: () => void) => void } }
	).hot;
	hot?.dispose(() => {
		void resetEixoTypeormConnection();
	});
}

/**
 * Resolve repositories by @Entity() table name so routes still work after Next.js
 * dev HMR replaces entity class constructors while a cached TypeORM connection keeps
 * the old metadata targets (otherwise BaseEntity / getRepository(User) throws
 * RepositoryNotFoundError).
 */
export function getUserRepo(): Repository<User> {
	return getConnection().getRepository("users") as Repository<User>;
}

export function getSessionRepo(): Repository<Session> {
	return getConnection().getRepository("session") as Repository<Session>;
}

export function getResetTokenRepo(): Repository<ResetToken> {
	return getConnection().getRepository(
		"reset token",
	) as Repository<ResetToken>;
}

export function getGameRepo(): Repository<Game> {
	return getConnection().getRepository("game") as Repository<Game>;
}

export function getEmpireRepo(): Repository<Empire> {
	return getConnection().getRepository("empires") as Repository<Empire>;
}

export function getRoundHistoryRepo(): Repository<RoundHistory> {
	return getConnection().getRepository(
		"round history",
	) as Repository<RoundHistory>;
}

export function getEmpireHistoryRepo(): Repository<EmpireHistory> {
	return getConnection().getRepository(
		"empire history",
	) as Repository<EmpireHistory>;
}

export function getClanHistoryRepo(): Repository<ClanHistory> {
	return getConnection().getRepository(
		"clan history",
	) as Repository<ClanHistory>;
}

/** Repositórios por nome de entity (@Entity primeiro arg) — evita RepositoryNotFoundError com Next HMR. */
export function getClanRepo(): Repository<Clan> {
	return getConnection().getRepository("clans") as Repository<Clan>;
}

export function getClanMessageRepo(): Repository<ClanMessage> {
	return getConnection().getRepository(
		"clan messages",
	) as Repository<ClanMessage>;
}

export function getClanRelationRepo(): Repository<ClanRelation> {
	return getConnection().getRepository(
		"clan relations",
	) as Repository<ClanRelation>;
}

export function getEmpireNewsRepo(): Repository<EmpireNews> {
	return getConnection().getRepository(
		"empire news",
	) as Repository<EmpireNews>;
}

export function getMarketRepo(): Repository<Market> {
	return getConnection().getRepository("market") as Repository<Market>;
}

export function getEmpireMessageRepo(): Repository<EmpireMessage> {
	return getConnection().getRepository(
		"empire messages",
	) as Repository<EmpireMessage>;
}

export function getEmpireIntelRepo(): Repository<EmpireIntel> {
	return getConnection().getRepository(
		"empire intel",
	) as Repository<EmpireIntel>;
}

export function getEmpireSnapshotRepo(): Repository<EmpireSnapshot> {
	return getConnection().getRepository(
		"empire snapshots",
	) as Repository<EmpireSnapshot>;
}

export function getLotteryRepo(): Repository<Lottery> {
	return getConnection().getRepository("lottery") as Repository<Lottery>;
}

export function getEmpireEffectRepo(): Repository<EmpireEffect> {
	return getConnection().getRepository(
		"empire effects",
	) as Repository<EmpireEffect>;
}
