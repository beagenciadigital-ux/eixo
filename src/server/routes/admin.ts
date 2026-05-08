import type { Request, Response } from 'express'
import { Router } from 'express'
import type Game from '../entity/Game'
import auth from '../middleware/auth'
import user from '../middleware/user'
import {
	getClanHistoryRepo,
	getClanMessageRepo,
	getClanRelationRepo,
	getClanRepo,
	getEmpireHistoryRepo,
	getEmpireIntelRepo,
	getEmpireMessageRepo,
	getEmpireNewsRepo,
	getEmpireRepo,
	getEmpireSnapshotRepo,
	getGameRepo,
	getLotteryRepo,
	getMarketRepo,
	getRoundHistoryRepo,
	getSessionRepo,
	getUserRepo,
} from '@/lib/db'
import { makeId } from '../util/helpers'
import { raceArray } from '../config/races'
import { eraArray } from '../config/eras'
import { attachGame } from '../middleware/game'

// READ
const getEmpires = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const empires = await getEmpireRepo().find({
			where: { game_id: req.query.gameId },
			order: {
				createdAt: 'DESC',
			},
		})
		return res.json(empires)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const getUsers = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const users = await getUserRepo().find({
			relations: ['empires'],
			order: {
				createdAt: 'DESC',
			},
		})

		const filteredUsers = users.filter((user) => {
			user.empires = user.empires.filter((empire) => {
				return empire.game_id === Number(req.query.gameId)
			})
			return user.empires.length !== 0
		})

		return res.json(filteredUsers)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const getNews = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const news = await getEmpireNewsRepo().find({
			where: { game_id: req.query.gameId },
			order: {
				createdAt: 'DESC',
			},
		})
		return res.json(news)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const getMarkets = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const markets = await getMarketRepo().find({
			where: { game_id: req.query.gameId },
			order: {
				createdAt: 'DESC',
			},
		})
		return res.json(markets)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const getMails = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const mail = await getEmpireMessageRepo().find({
			where: { game_id: req.query.gameId },
			order: {
				createdAt: 'DESC',
			},
		})
		return res.json(mail)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const getClanMails = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	try {
		const mail = await getClanMessageRepo().find({
			where: { game_id: req.query.gameId },
			order: {
				createdAt: 'DESC',
			},
		})
		return res.json(mail)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countUsers = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const users = await getUserRepo().count()
		return res.json(users)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countEmpires = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const empires = await getEmpireRepo().count()
		return res.json(empires)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countNews = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const news = await getEmpireNewsRepo().count()
		return res.json(news)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countMarkets = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const markets = await getMarketRepo().count()
		return res.json(markets)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countMails = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const mail = await getEmpireMessageRepo().count()
		return res.json(mail)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateEmpire = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params
	const body = req.body

	try {
		await getEmpireRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'Empire updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteEmpire = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params

	try {
		const empire = await getEmpireRepo().findOneOrFail({ uuid })
		if (empire.clanId !== 0) {
			const clan = await getClanRepo().findOne({ id: empire.clanId })
			if (clan.empireIdLeader === empire.id) {
				clan.empireIdLeader = 0
				if (clan.empireIdAssistant) {
					clan.empireIdLeader = clan.empireIdAssistant
					clan.empireIdAssistant = 0
				} else {
					let members = await getEmpireRepo().find({ clanId: clan.id })
					if (members.length > 1) {
						members = members.filter((member) => member.id !== empire.id)
						members = members.sort((a, b) => b.networth - a.networth)
						clan.empireIdLeader = members[0].id
					}
				}
			} else if (clan.empireIdAssistant === empire.id) {
				clan.empireIdAssistant = 0
			}

			clan.clanMembers -= 1

			if (clan.clanMembers < 1) {
				const relations = await getClanRelationRepo().find({
					where: [{ c_id1: clan.id }, { c_id2: clan.id }],
				})
				if (relations?.length) {
					await getClanRelationRepo().remove(relations)
				}

				const messages = await getClanMessageRepo().find({ clanId: clan.id })
				if (messages?.length) {
					await getClanMessageRepo().remove(messages)
				}

				await getClanRepo().remove(clan)
			} else {
				await getClanRepo().save(clan)
			}
		}
		// delete market items
		await getMarketRepo().delete({ empire_id: empire.id })
		// delete snapshots
		await getEmpireSnapshotRepo().delete({ e_id: empire.id })

		await getEmpireRepo().remove(empire)
		return res.json({ message: 'empire deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const disableEmpire = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params

	try {
		const empire = await getEmpireRepo().findOne({ uuid: uuid })
		if (empire.flags === 0) {
			empire.flags = 1
		} else if (empire.flags === 1) {
			empire.flags = 0
		}
		await getEmpireRepo().save(empire)
		return res.json({ message: 'Empire disabled status changed' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateUser = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params
	const body = req.body

	try {
		await getUserRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'User updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const loadOneUser = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		const row = await getUserRepo().findOneOrFail({ uuid })
		return res.json(row)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const loadOneEmpire = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		const empire = await getEmpireRepo().findOneOrFail({ uuid })
		return res.json(empire)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const loadOneMessage = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		const message = await getEmpireMessageRepo().findOneOrFail({ uuid })
		return res.json(message)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const loadOneMarket = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		const market = await getMarketRepo().findOneOrFail({ uuid })
		return res.json(market)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const loadOneNews = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		const news = await getEmpireNewsRepo().findOneOrFail({ uuid })
		return res.json(news)
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteUser = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		await getUserRepo().delete({ uuid: uuid })
		return res.json({ message: 'User deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateNews = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params
	const body = req.body

	try {
		await getEmpireNewsRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'News updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteNews = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params

	try {
		await getEmpireNewsRepo().delete({ uuid: uuid })
		return res.json({ message: 'News deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateMarket = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params
	const body = req.body

	try {
		await getMarketRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'Market updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteMarket = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params

	try {
		await getMarketRepo().delete({ uuid: uuid })
		return res.json({ message: 'Market deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateMail = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params
	const body = req.body

	try {
		await getEmpireMessageRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'Mail updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteMail = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const { uuid } = req.params

	try {
		await getEmpireMessageRepo().delete({ uuid: uuid })
		return res.json({ message: 'Mail deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const updateClanMail = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params
	const body = req.body

	try {
		await getClanMessageRepo().update({ uuid: uuid }, body)
		return res.json({ message: 'Clan Mail updated' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const deleteClanMail = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}
	const { uuid } = req.params

	try {
		await getClanMessageRepo().delete({ uuid: uuid })
		return res.json({ message: 'Clan Mail deleted' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countEverything = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	try {
		const users = await getUserRepo().count()
		const empires = await getEmpireRepo().count()
		const news = await getEmpireNewsRepo().count()
		const markets = await getMarketRepo().count()
		const messageRepo = getEmpireMessageRepo()
		const mail = await messageRepo.count()
		const mailReports = await messageRepo.count({
			where: { messageFlags: 1 },
		})
		return res.json({
			users: users,
			empires: empires,
			news: news,
			markets: markets,
			mail: mail,
			reports: mailReports,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const countAll = async (req: Request, res: Response) => {
	if (res.locals.user.role !== 'admin') {
		return res.status(401).json({ message: 'Not authorized' })
	}

	const game: Game = res.locals.game

	// console.log(game.game_id)

	try {
		let userCount = 0
		let empires = 0
		let news = 0
		let markets = 0
		let mail = 0
		let mailReports = 0

		let users = await getUserRepo().find({ relations: ['empires'] })
		users = users.filter((user) => {
			user.empires = user.empires.filter((empire) => {
				return empire.game_id === Number(game.game_id)
			})
			return user.empires.length !== 0
		})
		userCount = users.length
		empires = await getEmpireRepo().count({ where: { game_id: game.game_id } })
		news = await getEmpireNewsRepo().count({
			where: { game_id: game.game_id },
		})
		markets = await getMarketRepo().count({
			where: { game_id: game.game_id },
		})
		mail = await getEmpireMessageRepo().count({
			where: { game_id: game.game_id },
		})
		mailReports = await getEmpireMessageRepo().count({
			where: { messageFlags: 1, game_id: game.game_id },
		})

		return res.json({
			users: userCount,
			empires: empires,
			news: news,
			markets: markets,
			mail: mail,
			reports: mailReports,
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

// reset game and round
const resetGame = async (req: Request, res: Response) => {
	const { code } = req.body
	const game: Game = res.locals.game

	if (!res.locals.user || res.locals.user.role !== 'admin') {
		return res.status(401).json({
			error: 'Not authorized',
		})
	}

	if (code !== process.env.GAME_RESET) {
		return res.status(401).json({
			error: 'Not authorized',
		})
	}

	try {
		// create round history
		const round_h_id = makeId(10)
		const name: string = game.roundName
		const description: string = game.roundDescription
		const startDate = game.roundStart
		const stopDate = game.roundEnd

		// save empire data into empire history table
		// save clan data into clan history
		// delete empires, intel, clans, clan relations, messages, clan messages, news, market, sessions, lottery, etc...
		// update user stats
		let users = await getUserRepo().find({
			relations: ['empires'],
		})

		// filter out users with no empires in this game
		users = users.filter((user) => {
			if (user.empires.length === 0) {
				return false
			}
			user.empires = user.empires.filter((empire) => {
				return empire.game_id === Number(game.game_id)
			})
			return user.empires.length !== 0
		})

		// biome-ignore lint/complexity/noForEach: <explanation>
		users.forEach(async (user) => {
			// console.log(user)
			const empire = await getEmpireRepo().findOne({
				where: { id: user.empires[0].id, game_id: game.game_id },
			})

			if (empire.rank > user.bestRank) {
				user.bestRank = empire.rank
			}

			user.defSucc += empire.defSucc
			user.defTotal += empire.defTotal
			user.offSucc += empire.offSucc
			user.offTotal += empire.offTotal
			user.numPlays += 1

			if (user.avgRank === 0) {
				user.avgRank = empire.rank
			} else {
				user.avgRank = (user.avgRank + empire.rank) / user.numPlays
			}

			user.totalProduction +=
				empire.income +
				empire.foodpro * (game.pvtmFood / game.pvtmTrpArm) +
				empire.indyProd +
				empire.magicProd

			user.totalConsumption +=
				empire.expenses + empire.foodcon * (game.pvtmFood / game.pvtmTrpArm)

			await getUserRepo().save(user)
		})

		console.log('user stats updated')

		// get clans
		const clans = await getClanRepo().find({ where: { game_id: game.game_id } })
		// biome-ignore lint/complexity/noForEach: <explanation>
		clans.forEach(async (clan) => {
			// create clan history
			const roundHistory_id = round_h_id
			const clanHistoryName = clan.clanName
			const clanHistoryMembers = clan.clanMembers
			let totalNetworth = 0
			const clan_id = clan.id
			const clanHistoryLeader = clan.empireIdLeader
			const clanHistoryAssistant = clan.empireIdAssistant

			const empires = await getEmpireRepo().find({
				where: { clanId: clan.id },
			})

			// biome-ignore lint/complexity/noForEach: <explanation>
			empires.forEach((empire) => {
				totalNetworth += empire.networth
			})
			const clanHistoryTotalNet = totalNetworth

			// create clan history
			await getClanHistoryRepo().save(
				getClanHistoryRepo().create({
					roundHistory_id,
					clanHistoryName,
					clanHistoryMembers,
					clanHistoryTotalNet,
					clanHistoryLeader,
					clanHistoryAssistant,
					clan_id,
				}),
			)
			await getClanRepo().remove(clan)
		})

		console.log('clan history added and clans removed')

		// get empires
		const empires = await getEmpireRepo().find({
			relations: ['user'],
			where: { game_id: game.game_id },
		})

		// biome-ignore lint/complexity/noForEach: <explanation>
		empires.forEach(async (empire) => {
			if (empire.turnsUsed > game.turnsProtection) {
				// console.log(empire.user)
				const roundHistory_id = round_h_id
				const u_id = empire.user.id
				const empireHistoryName = empire.name
				const empireHistoryId = empire.id
				const empireHistoryRace = raceArray[empire.race].name
				const empireHistoryEra = eraArray[empire.era].name
				const clanHistory_id = empire.clanId
				const empireHistoryOffSucc = empire.offSucc
				const empireHistoryOffTotal = empire.offTotal
				const empireHistoryDefSucc = empire.defSucc
				const empireHistoryDefTotal = empire.defTotal
				const empireHistoryNetworth = empire.networth
				const empireHistoryLand = empire.land
				const empireHistoryRank = empire.rank
				const empireHistoryAttackGain = empire.attackGains
				const empireHistoryAttackLoss = empire.attackLosses
				const empireHistoryExpenses = empire.expenses
				const empireHistoryIncome = empire.income
				const empireHistoryFoodCon = empire.foodcon
				const empireHistoryFoodPro = empire.foodpro
				const empireHistoryIndyProd = empire.indyProd
				const empireHistoryMagicProd = empire.magicProd
				const profile = empire.profile
				const profileIcon = empire.profileIcon
				const turnsUsed = empire.turnsUsed
				const finalTrpArm = empire.trpArm
				const finalTrpLnd = empire.trpLnd
				const finalTrpFly = empire.trpFly
				const finalTrpSea = empire.trpSea
				const finalTrpWiz = empire.trpWiz
				const peakCash = empire.peakCash
				const peakLand = empire.peakLand
				const peakNetworth = empire.peakNetworth
				const peakFood = empire.peakFood
				const peakRunes = empire.peakRunes
				const peakPeasants = empire.peakPeasants
				const peakTrpArm = empire.peakTrpArm
				const peakTrpLnd = empire.peakTrpLnd
				const peakTrpFly = empire.peakTrpFly
				const peakTrpSea = empire.peakTrpSea
				const peakTrpWiz = empire.peakTrpWiz

				// create empire history
				await getEmpireHistoryRepo().save(
					getEmpireHistoryRepo().create({
						roundHistory_id,
						u_id,
						empireHistoryName,
						empireHistoryId,
						empireHistoryRace,
						empireHistoryEra,
						clanHistory_id,
						empireHistoryOffSucc,
						empireHistoryOffTotal,
						empireHistoryDefSucc,
						empireHistoryDefTotal,
						empireHistoryNetworth,
						empireHistoryLand,
						empireHistoryRank,
						empireHistoryAttackGain,
						empireHistoryAttackLoss,
						empireHistoryExpenses,
						empireHistoryIncome,
						empireHistoryFoodCon,
						empireHistoryFoodPro,
						empireHistoryIndyProd,
						empireHistoryMagicProd,
						profile,
						profileIcon,
						turnsUsed,
						finalTrpArm,
						finalTrpLnd,
						finalTrpFly,
						finalTrpSea,
						finalTrpWiz,
						peakCash,
						peakLand,
						peakNetworth,
						peakFood,
						peakRunes,
						peakPeasants,
						peakTrpArm,
						peakTrpLnd,
						peakTrpFly,
						peakTrpSea,
						peakTrpWiz,
					}),
				)
			}
			await getEmpireRepo().remove(empire)
		})

		console.log('empire history added and empires removed')

		const allClans = clans.length
		const allEmpires = empires.length
		const gameVersion = String(game.version)
		const countUnclanned = empires.filter((empire) => {
			return empire.clanId === 0
		})
		const nonClanEmpires = countUnclanned.length
		const icon = game.icon
		const color = game.color
		const type = game.type

		const roundHistoryRepo = getRoundHistoryRepo()
		await roundHistoryRepo.save(
			roundHistoryRepo.create({
				round_h_id,
				name,
				description,
				startDate,
				stopDate,
				allClans,
				allEmpires,
				nonClanEmpires,
				gameVersion,
				icon,
				color,
				type,
			}),
		)

		console.log('round history added')

		await getClanMessageRepo().delete({ game_id: game.game_id })

		console.log('clan messages removed')

		await getEmpireMessageRepo().delete({ game_id: game.game_id })

		console.log('empire messages removed')

		await getMarketRepo().delete({ game_id: game.game_id })

		console.log('market items removed')

		await getEmpireNewsRepo().delete({ game_id: game.game_id })

		console.log('news removed')

		await getClanRelationRepo().delete({ game_id: game.game_id })

		console.log('clan relations removed')

		await getEmpireIntelRepo().delete({ game_id: game.game_id })
		console.log('empire intel removed')

		await getSessionRepo().clear()
		console.log('sessions removed')

		await getEmpireSnapshotRepo().delete({ game_id: game.game_id })
		console.log('snapshots removed')

		await getLotteryRepo().delete({ game_id: game.game_id })
		console.log('lottery tickets removed')

		console.log('game reset')
		return res.json({ message: 'Game reset' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const createGame = async (req: Request, res: Response) => {
	if (!res.locals.user || res.locals.user.role !== 'admin') {
		return res.status(401).json({
			error: 'Not authorized',
		})
	}

	// console.log(req.body)
	// request body should have game details object from form
	const game = {
		name: req.body.name,
		version: req.body.version,
		roundName: req.body.roundName,
		roundStart: req.body.roundStart,
		roundEnd: req.body.roundEnd,
		type: req.body.type,
		icon: req.body.icon,
		color: req.body.color,
		isActive: req.body.isActive,
		roundDescription: req.body.description,
		empiresPerUser: req.body.empiresPerUser,
		turnsProtection: req.body.turnsProtection,
		turnsInitial: req.body.turnsInitial,
		turnsMax: req.body.turnsMax,
		turnsStored: req.body.turnsStored,
		turnsDemo: req.body.turnsDemo,
		turnsFreq: req.body.turnsFreq,
		turnsCount: req.body.turnsCount,
		turnsUnstore: req.body.turnsUnstore,
		lotteryMaxTickets: req.body.lotteryMaxTickets,
		lotteryJackpot: req.body.lotteryJackpot,
		buildCost: req.body.buildCost,
		bankSaveRate: req.body.bankSaveRate,
		bankLoanRate: req.body.bankLoanRate,
		pubMktStart: req.body.pubMktStart,
		pubMktMaxTime: req.body.pubMktMaxTime,
		pubMktMinSell: req.body.pubMktMinSell,
		pubMktMaxSell: req.body.pubMktMaxSell,
		pubMktMinFood: req.body.pubMktMinFood,
		pubMktMaxFood: req.body.pubMktMaxFood,
		pubMktMinRunes: req.body.pubMktMinRunes,
		pubMktMaxRunes: req.body.pubMktMaxRunes,
		clanEnable: req.body.clanEnable,
		clanSize: req.body.clanSize,
		clanMinJoin: req.body.clanMinJoin,
		clanMinRejoin: req.body.clanMinRejoin,
		clanMaxWar: req.body.clanMaxWar,
		pvtmMaxSell: req.body.pvtmMaxSell,
		pvtmShopBonus: req.body.pvtmShopBonus,
		pvtmTrpArm: req.body.pvtmTrpArm,
		pvtmTrpLnd: req.body.pvtmTrpLnd,
		pvtmTrpFly: req.body.pvtmTrpFly,
		pvtmTrpSea: req.body.pvtmTrpSea,
		pvtmFood: req.body.pvtmTrpWiz,
		pvtmRunes: req.body.pvtmRunes,
		industryMult: req.body.industryMult,
		maxAttacks: req.body.maxAttacks,
		maxSpells: req.body.maxSpells,
		drRate: req.body.drRate,
		baseLuck: req.body.baseLuck,
		aidEnable: req.body.aidEnable,
		aidMaxCredits: req.body.aidMaxCredits,
		aidDelay: req.body.aidDelay,
		allowMagicRegress: req.body.allowMagicRegress,
		lastTurnsUpdate: req.body.roundStart,
		lastAidUpdate: req.body.roundStart,
	}

	try {
		const newGame = getGameRepo().create(game as Partial<Game>)
		await getGameRepo().save(newGame)
		return res.json({ message: 'Game created' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const editGame = async (req: Request, res: Response) => {
	if (!res.locals.user || res.locals.user.role !== 'admin') {
		return res.status(401).json({
			error: 'Not authorized',
		})
	}

	// console.log(req.body)

	try {
		const gameRow = await getGameRepo().findOne({
			where: { game_id: Number(req.query.gameId) },
		})
		if (!gameRow) {
			return res.status(404).json({ error: 'Game not found' })
		}

		gameRow.name = req.body.name
		gameRow.version = req.body.version
		gameRow.roundName = req.body.roundName
		gameRow.roundStart = req.body.roundStart
		gameRow.roundEnd = req.body.roundEnd
		gameRow.isActive = req.body.isActive
		gameRow.type = req.body.type
		gameRow.icon = req.body.icon
		gameRow.color = req.body.color
		gameRow.roundDescription = req.body.description
		gameRow.empiresPerUser = req.body.empiresPerUser
		gameRow.turnsProtection = req.body.turnsProtection
		gameRow.turnsInitial = req.body.turnsInitial
		gameRow.turnsMax = req.body.turnsMax
		gameRow.turnsStored = req.body.turnsStored
		gameRow.turnsDemo = req.body.turnsDemo
		gameRow.turnsFreq = req.body.turnsFreq
		gameRow.turnsCount = req.body.turnsCount
		gameRow.turnsUnstore = req.body.turnsUnstore
		gameRow.lotteryMaxTickets = req.body.lotteryMaxTickets
		gameRow.lotteryJackpot = req.body.lotteryJackpot
		gameRow.buildCost = req.body.buildCost
		gameRow.bankSaveRate = req.body.bankSaveRate
		gameRow.bankLoanRate = req.body.bankLoanRate
		gameRow.pubMktStart = req.body.pubMktStart
		gameRow.pubMktMaxTime = req.body.pubMktMaxTime
		gameRow.pubMktMinSell = req.body.pubMktMinSell
		gameRow.pubMktMaxSell = req.body.pubMktMaxSell
		gameRow.pubMktMinFood = req.body.pubMktMinFood
		gameRow.pubMktMaxFood = req.body.pubMktMaxFood
		gameRow.pubMktMinRunes = req.body.pubMktMinRune
		gameRow.pubMktMaxRunes = req.body.pubMktMaxRune
		gameRow.clanEnable = req.body.clanEnable
		gameRow.clanSize = req.body.clanSize
		gameRow.clanMinJoin = req.body.clanMinJoin
		gameRow.clanMinRejoin = req.body.clanMinRejoin
		gameRow.clanMaxWar = req.body.clanMaxWar
		gameRow.pvtmMaxSell = req.body.pvtmMaxSell
		gameRow.pvtmShopBonus = req.body.pvtmShopBonus
		gameRow.pvtmTrpArm = req.body.pvtmTrpArm
		gameRow.pvtmTrpLnd = req.body.pvtmTrpLnd
		gameRow.pvtmTrpFly = req.body.pvtmTrpFly
		gameRow.pvtmTrpSea = req.body.pvtmTrpSea
		gameRow.pvtmFood = req.body.pvtmFood
		gameRow.pvtmRunes = req.body.pvtmRunes
		gameRow.industryMult = req.body.industryMult
		gameRow.maxAttacks = req.body.maxAttacks
		gameRow.maxSpells = req.body.maxSpells
		gameRow.drRate = req.body.drRate
		gameRow.baseLuck = req.body.baseLuck
		gameRow.aidEnable = req.body.aidEnable
		gameRow.aidMaxCredits = req.body.aidMaxCredits
		gameRow.aidDelay = req.body.aidDelay
		gameRow.allowMagicRegress = req.body.allowMagicRegress

		console.log(gameRow)
		await getGameRepo().save(gameRow)
		return res.json({ message: 'Game Edited' })
	} catch (error) {
		console.log(error)
		return res.status(500).json(error)
	}
}

const router = Router()

router.get('/empires', user, auth, getEmpires)
router.get('/users', user, auth, getUsers)
router.get('/news', user, auth, getNews)
router.get('/markets', user, auth, getMarkets)
router.get('/mail', user, auth, getMails)
router.get('/clanMail', user, auth, getClanMails)

router.get('/countusers', user, auth, countUsers)
router.get('/countempires', user, auth, countEmpires)
router.get('/countnews', user, auth, countNews)
router.get('/countmarkets', user, auth, countMarkets)
router.get('/countmail', user, auth, countMails)
router.get('/countall', user, auth, attachGame, countAll)
router.get('/counteverything', user, auth, countEverything)

router.get('/users/:uuid', user, auth, loadOneUser)
router.get('/empires/:uuid', user, auth, loadOneEmpire)
router.get('/news/:uuid', user, auth, loadOneNews)
router.get('/markets/:uuid', user, auth, loadOneMarket)
router.get('/mail/:uuid', user, auth, loadOneMessage)

router.post('/updateempire/:uuid', user, auth, updateEmpire)
router.delete('/deleteempire/:uuid', user, auth, deleteEmpire)
router.post('/disableempire/:uuid', user, auth, disableEmpire)
router.post('/updateuser/:uuid', user, auth, updateUser)
router.delete('/deleteuser/:uuid', user, auth, deleteUser)
router.post('/updatenews/:uuid', user, auth, updateNews)
router.delete('/deletenews/:uuid', user, auth, deleteNews)
router.post('/updatemarket/:uuid', user, auth, updateMarket)
router.delete('/deletemarket/:uuid', user, auth, deleteMarket)
router.post('/updatemail/:uuid', user, auth, updateMail)
router.delete('/deletemail/:uuid', user, auth, deleteMail)
router.post('/updateClanMail/:uuid', user, auth, updateClanMail)
router.delete('/deleteClanMail/:uuid', user, auth, deleteClanMail)

router.post('/resetgame', user, auth, attachGame, resetGame)
router.post('/creategame', user, auth, createGame)
router.post('/edit', user, auth, editGame)

export default router
