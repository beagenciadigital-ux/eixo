import { Router, Request, Response } from 'express'

import user from '../middleware/user'
import { isAdmin } from '../middleware/admin'
import auth from '../middleware/auth'
import { getGameRepo, getEmpireRepo } from '@/lib/db'

const getGames = async (req: Request, res: Response) => {
	const games = await getGameRepo().find({ where: { isActive: true } })
	const { empires } = res.locals.user

	// console.log('get games', games, empires)
	const { gamesUserIsIn, gamesUserNotIn } = games.reduce(
		(x, game) => {
			const userInGame = empires.some(
				(empire) => empire.game_id === game.game_id
			)
			if (userInGame) {
				x.gamesUserIsIn.push(game)
			} else {
				x.gamesUserNotIn.push(game)
			}
			return x
		},
		{ gamesUserIsIn: [], gamesUserNotIn: [] }
	)

	return res.json({ gamesUserIsIn, gamesUserNotIn })
}

// const createGame = async (req: Request, res: Response) => {
// 	const game: any = await Game.create(req.body)
// 	await game.save()

// 	return res.json(game)
// }

const games = async (req: Request, res: Response) => {
	const games = await getGameRepo().find({ order: { createdAt: 'DESC' } })

	// add stats to each game
	for (const game of games) {
		const empires = await getEmpireRepo().find({
			where: { game_id: game.game_id },
		})
		const numEmpires = empires.length
		const totalLand = empires.reduce((x, empire) => x + empire.land, 0)
		const avgLand = numEmpires ? Math.round(totalLand / numEmpires) : 0
		const totalNetWorth = empires.reduce((x, empire) => x + empire.networth, 0)
		const avgNetWorth = numEmpires ? Math.round(totalNetWorth / numEmpires) : 0

		// @ts-ignore
		game.numEmpires = numEmpires
		// @ts-ignore
		game.avgLand = avgLand
		// @ts-ignore
		game.avgNetWorth = avgNetWorth
	}

	// console.log(games)

	return res.json(games)
}

const gameStats = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const empires = await getEmpireRepo().find({ where: { game_id: id } })

		// get number of empires, average land, and average net worth
		const numEmpires = empires.length
		const totalLand = empires.reduce((x, empire) => x + empire.land, 0)
		const avgLand = numEmpires ? Math.round(totalLand / numEmpires) : 0
		const totalNetWorth = empires.reduce((x, empire) => x + empire.networth, 0)
		const avgNetWorth = numEmpires ? Math.round(totalNetWorth / numEmpires) : 0

		// console.log('stats', numEmpires, avgLand, avgNetWorth)
		return res.json({ numEmpires, avgLand, avgNetWorth })
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err)
		return res.status(500).json({ error: message })
	}
}

const router = Router()

router.get('/', user, auth, getGames)
// router.post('/', isAdmin, createGame)
router.get('/games', games)
router.get('/:id/stats', gameStats)

export default router
