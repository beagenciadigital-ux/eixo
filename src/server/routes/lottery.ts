import type { Request, Response } from 'express'
import { Router } from 'express'
import Empire from '../entity/Empire'
import auth from '../middleware/auth'
import user from '../middleware/user'
import { Not } from 'typeorm'
import Lottery from '../entity/Lottery'
import { generalLog } from '../functions/functions'
import { attachGame } from '../middleware/game'
import type Game from '../entity/Game'
import { translate } from '../util/translation'
import { language as languageMiddleware } from '../middleware/language'
// lottery
// set base jackpot

// buy lottery ticket
// add to lottery db
// check if enough money, limit on tickets, etc
const buyTicket = async (req: Request, res: Response) => {
	const language = res.locals.language
	const { empireId, type } = req.body

	const game: Game = res.locals.game

	if (type !== 'lottery') {
		return res.status(400).json({
			error: translate('errors:lottery.invalidRequest', language),
		})
	}

	const empire = await Empire.findOne({ id: empireId })

	if (!empire) {
		return res.status(404).json({
			error: translate('errors:empire.notFound', language),
		})
	}

	if (empire.turnsUsed < game.turnsProtection || empire.mode === 'demo') {
		return res.status(400).json({
			error: translate('errors:lottery.notAllowed', language),
		})
	}

	const empireTickets = await Lottery.find({
		where: { empire_id: empireId, game_id: game.game_id },
		order: {
			createdAt: 'DESC',
		},
	})

	const ticketCost = Math.round(
		empire.networth / generalLog(empire.networth, 25)
	)

	if (empire.cash < ticketCost) {
		return res.status(400).json({
			error: translate('errors:lottery.notEnoughMoneyTicket', language),
		})
	}

	if (empireTickets.length >= game.lotteryMaxTickets) {
		return res.status(400).json({
			error: translate('errors:lottery.maxTicketsReached', language),
		})
	}

	empire.cash -= ticketCost
	await empire.save()

	const ticketCount = await Lottery.count({
		where: { game_id: game.game_id, ticket: Not(0) },
	})

	const ticket = new Lottery()
	ticket.empire_id = empireId
	ticket.cash = ticketCost * 10
	ticket.ticket = ticketCount + 1
	ticket.game_id = game.game_id
	await ticket.save()

	return res.json({ success: 'Ticket Purchased!' })
}

const getJackpot = async (req: Request, res: Response) => {
	const game: Game = res.locals.game

	const allTickets = await Lottery.find({
		where: { game_id: game.game_id },
	})

	let jackpot = 0
	const jackpotTracker = await Lottery.findOne({
		ticket: 0,
		game_id: game.game_id,
	})
	// console.log(jackpotTracker)
	if (!jackpotTracker) {
		jackpot += game.lotteryJackpot
		for (let i = 0; i < allTickets.length; i++) {
			// console.log(jackpot)
			jackpot = jackpot + Number(allTickets[i].cash)
		}
	} else {
		for (let i = 0; i < allTickets.length; i++) {
			jackpot += Number(allTickets[i].cash)
		}
	}

	return res.json({ success: jackpot })
}

const getTickets = async (req: Request, res: Response) => {
	const language = res.locals.language
	const empireId = Number(req.params.empireId)
	if (!Number.isFinite(empireId)) {
		return res.status(400).json({
			error: translate('errors:lottery.invalidEmpireId', language),
		})
	}

	const empire = await Empire.findOne({ id: empireId })
	if (!empire) {
		return res.status(404).json({
			error: translate('errors:empire.notFound', language),
		})
	}

	const tickets = await Lottery.findAndCount({
		where: { empire_id: empireId, game_id: empire.game_id },
	})

	return res.json({ success: tickets[1] })
}

const getTotalTickets = async (req: Request, res: Response) => {
	const language = res.locals.language
	const { gameId } = req.query
	const gameIdNum = Number(gameId)
	if (!Number.isFinite(gameIdNum)) {
		return res.status(400).json({
			error: translate('errors:empire.gameIdRequired', language),
		})
	}

	const tickets = await Lottery.findAndCount({
		where: { ticket: Not(0), game_id: gameIdNum },
	})

	return res.json({ success: tickets[1] })
}

// increase jackpot for each ticket bought

const router = Router()

router.post('/buyTicket', user, auth, languageMiddleware, attachGame, buyTicket)
router.get('/getJackpot', attachGame, getJackpot)
router.get('/getTickets/:empireId', languageMiddleware, getTickets)
router.get('/getTotalTickets', languageMiddleware, getTotalTickets)

export default router
