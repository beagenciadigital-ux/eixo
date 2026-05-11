import { Router } from "express";
import type { Request, Response } from "express";
import { raceArray } from "../config/races";
import Empire from "../entity/Empire";
import Clan from "../entity/Clan";
import { useTurnInternal } from "./useturns";
import user from "../middleware/user";
import auth from "../middleware/auth";
import { calcSizeFactors } from "../services/actions/actions";
import { takeSnapshot } from "../services/actions/snaps";
import { attachGame } from "../middleware/game";
import type Game from "../entity/Game";
import type User from "../entity/User";
import { updateEmpire } from "../services/actions/updateEmpire";
import { getServerStats } from "../services/game/serverStats";
import { translate } from "../util/translation";
import { language as languageMiddleware } from "../middleware/language";

// FIXED?: created new turn function for use in loops that is not async use returned values to update empire

const getBuildAmounts = async (empire: Empire, cost: number, gameId: number) => {
	// Get server statistics for balanced calculations
	const serverStats = await getServerStats(gameId);
	const sizeFactors = calcSizeFactors(empire, serverStats.medianNetworth, serverStats.dayOfRound);

	// Apply expansion difficulty instead of raw size
	let buildCost = Math.round((cost + empire.land * 0.3) * sizeFactors.expansionDifficulty);

	let buildRate = Math.round(empire.land * 0.015 + 4);

	buildRate = Math.round(
		((100 + raceArray[empire.race].mod_buildrate) / 100) * buildRate,
	);

	let canBuild = Math.min(
		Math.floor(empire.cash / buildCost),
		buildRate * empire.turns,
		empire.freeLand,
	);

	return { canBuild, buildRate, buildCost };
};

/** GET — same caps as POST /build so the client does not underestimate build cost. */
const getBuildLimits = async (req: Request, res: Response) => {
	const language = res.locals.language;
	const game: Game = res.locals.game;
	const user = res.locals.user as User;
	const empireId = Number.parseInt(String(req.query.empireId), 10);

	if (!Number.isFinite(empireId)) {
		return res.status(400).json({
			error: translate("errors:build.empireIdRequired", language),
			code: "MISSING_EMPIRE_ID",
		});
	}

	const empire = await Empire.findOne({ id: empireId });
	if (!empire) {
		return res.status(404).json({
			error: translate("errors:empire.notFound", language),
			code: "EMPIRE_NOT_FOUND",
		});
	}

	if (empire.game_id !== game.game_id) {
		return res.status(403).json({
			error: translate("errors:build.empireWrongGame", language),
			code: "GAME_MISMATCH",
		});
	}

	const owned = user.empires?.some((e) => e.id === empire.id) ?? false;
	if (!owned) {
		return res.status(403).json({
			error: translate("errors:unauthorized", language),
			code: "FORBIDDEN",
		});
	}

	const amounts = await getBuildAmounts(empire, game.buildCost, game.game_id);
	return res.json(amounts);
};

const build = async (req: Request, res: Response) => {
	const language = res.locals.language;
	// request will have object with type of building and number to build
	const {
		type,
		empireId,
		bldCash,
		bldPop,
		bldCost,
		bldDef,
		bldFood,
		bldTroop,
		bldWiz,
	} = req.body;

	const game: Game = res.locals.game;

	if (type !== "build") {
		return res.status(400).json({
			error: translate("errors:build.invalidType", language),
			code: "INVALID_TYPE",
		});
	}

	const empire = await Empire.findOne({ id: empireId });
	if (!empire) {
		return res.status(404).json({
			error: translate("errors:empire.notFound", language),
			code: "EMPIRE_NOT_FOUND",
		});
	}

	let clan = null;
	if (empire.clanId !== 0) {
		clan = await Clan.findOneOrFail({
			where: { id: empire.clanId },
			relations: ["relation"],
		});
	}

	const { canBuild, buildRate, buildCost } = await getBuildAmounts(
		empire,
		game.buildCost,
		game.game_id
	);

	let buildTotal =
		bldCash + bldPop + bldCost + bldDef + bldFood + bldTroop + bldWiz;

	if (buildTotal > canBuild) {
		const maxByCash = Math.floor(empire.cash / buildCost);
		const maxByTurns = buildRate * empire.turns;
		const maxByLand = empire.freeLand;
		console.warn('[BUILD] Request exceeds limits', {
			empireId,
			requested: buildTotal,
			maxByCash,
			maxByTurns,
			maxByLand,
			buildRate,
			buildCost,
			cash: empire.cash,
			turns: empire.turns,
			freeLand: empire.freeLand,
		});
		return res.status(400).json({
			error: translate("errors:build.exceedsLimits", language),
			code: "REQUEST_EXCEEDS_LIMITS",
			details: { requested: buildTotal, maxByCash, maxByTurns, maxByLand },
		});
	}

	// console.log(buildRate)
	// console.log(buildTotal)

	let buildArray = [
		{ bldCash: bldCash },
		{ bldPop: bldPop },
		{ bldCost: bldCost },
		{ bldDef: bldDef },
		{ bldFood: bldFood },
		{ bldTroop: bldTroop },
		{ bldWiz: bldWiz },
	];

	// console.log(buildArray)
	buildArray = buildArray.filter((object) => Object.values(object)[0] > 0);

  // Calculate required turns based on total requested buildings instead of per-category ceilings.
  // This allows remainders to spill across categories in the same turn.
  const requiredTurns = Math.ceil(buildTotal / buildRate);

  const buildLoop = async () => {
    try {
      if (requiredTurns > empire.turns) {
        return [{ error: translate("errors:build.notEnoughTurns", language), code: "NOT_ENOUGH_TURNS", requiredTurns, availableTurns: empire.turns }];
      }
      let resultArray = [];

      // Create a working list of remaining builds per category
      const remainingList: Array<{ key: string; remaining: number }> = buildArray.map((obj) => ({
        key: Object.keys(obj)[0],
        remaining: Object.values(obj)[0] as number,
      }));

      // While there's anything left to build, consume one turn at a time and distribute capacity
      while (remainingList.some((x) => x.remaining > 0)) {
        // use one turn
        let oneTurn = useTurnInternal("build", 1, empire, clan, true, game);
        let turnRes = oneTurn[0];

        // Detect both wrapped and direct error responses from the turn function
        if (turnRes?.messages?.error || turnRes?.error) {
          resultArray.push(turnRes);
          break;
        }

        let capacity = buildRate;
        for (let i = 0; i < remainingList.length && capacity > 0; i++) {
          const node = remainingList[i];
          if (node.remaining <= 0) continue;

          const buildAmount = Math.min(node.remaining, capacity);

          // spend and apply
          empire.cash -= buildAmount * buildCost;
          // increment appropriate building key on empire
          empire[node.key] += buildAmount as any;
          empire.freeLand -= buildAmount;

          node.remaining -= buildAmount;
          capacity -= buildAmount;
        }

        // Apply per-turn economy updates after building
        await updateEmpire(empire, turnRes, 1, game);
        resultArray.push(turnRes);

        // Guard in case turns run out mid-process
        if (empire.turns <= 0 && remainingList.some((x) => x.remaining > 0)) {
          resultArray.push({ error: translate("errors:build.notEnoughTurns", language), code: "NOT_ENOUGH_TURNS", requiredTurns, availableTurns: 0 });
          break;
        }
      }

      await takeSnapshot(empire, game.turnsProtection);
      return resultArray;
    } catch (err) {
      console.log(err);
      return [{ error: translate("errors:build.buildFailed", language), code: "BUILD_ERROR" }];
    }
  };

	let returnArray = await buildLoop();

	// If buildLoop returned an error shape, surface as a 400 with details
	if (
		Array.isArray(returnArray) &&
		returnArray.length > 0 &&
		(returnArray[0]?.error || returnArray.some((r) => r?.messages?.error))
	) {
		const firstErr = returnArray.find((r) => r?.error) || returnArray.find((r) => r?.messages?.error);
		console.warn('[BUILD] Build failed', { empireId, error: firstErr });
		return res.status(400).json(firstErr);
	}

	return res.json(returnArray);
};

const router = Router();

router.get("/limits", user, auth, languageMiddleware, attachGame, getBuildLimits);
router.post("/", user, auth, languageMiddleware, attachGame, build);

export default router;
