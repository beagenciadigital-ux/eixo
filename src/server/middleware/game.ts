import type { Request, Response, NextFunction } from 'express'

import { getGameRepo } from '@/lib/db'

export const attachGame = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { gameId } = req.query
		// console.log(gameId)
		// console.log(res.locals.user.empires[0].game_id)
		if (gameId === undefined || gameId === '')
			return res.status(400).json({ error: 'Game ID is required.' })

		const gameIdNum = Number(gameId)
		if (!Number.isFinite(gameIdNum))
			return res.status(400).json({ error: 'Game ID is required.' })

		const game = await getGameRepo().findOne({
			where: { game_id: gameIdNum },
		})
		if (!game)
			return res.status(404).json({ error: 'Game not found.' })

		res.locals.game = game

		next()
	} catch (error) {
		console.log(error)
		return res.status(500).json({ error: 'Error finding specified game.' })
	}
}
