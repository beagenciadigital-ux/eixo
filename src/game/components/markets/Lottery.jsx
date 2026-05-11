import { Button, Center, Title, Text, Stack, Loader } from "@mantine/core"
import { useSelector } from "react-redux"
import Axios from "axios"
import { useEffect, useState } from "react"
import { generalLog } from "../../functions/functions"
import { checkRoundStatus } from "../../functions/checkRoundStatus"
import { useLoadEmpire } from "../../hooks/useLoadEmpire"
import { showNotification } from "@mantine/notifications"
import { useTranslation } from "react-i18next"

export default function Lottery() {
	const { t } = useTranslation(["finance"])
	const [loading, setLoading] = useState(false)
	const [jackpot, setJackpot] = useState(0)
	const [tickets, setTickets] = useState(0)
	const [totalTickets, setTotalTickets] = useState(0)
	const { empire } = useSelector((state) => state.empire)
	const activeGame = useSelector((state) => state.games.activeGame)

	const loadEmpire = useLoadEmpire(empire?.uuid)

	useEffect(() => {
		if (!empire?.game_id || empire.id == null) return

		const gid = empire.game_id
		const eid = empire.id

		const fetchJackpot = async () => {
			try {
				const res = await Axios.get(`/lottery/getJackpot?gameId=${gid}`)
				return res.data.success
			} catch (error) {
				console.log(error)
			}
		}

		const getTickets = async () => {
			try {
				const res = await Axios.get(`/lottery/getTickets/${eid}`)
				return res.data.success
			} catch (error) {
				console.log(error)
			}
		}

		const getTotalTickets = async () => {
			try {
				const res = await Axios.get(`/lottery/getTotalTickets?gameId=${gid}`)
				return res.data.success
			} catch (error) {
				console.log(error)
			}
		}

		void Promise.all([
			fetchJackpot(),
			getTickets(),
			getTotalTickets(),
		]).then(([jackpotVal, ticketsVal, totalVal]) => {
			setJackpot(jackpotVal ?? 0)
			setTickets(ticketsVal ?? 0)
			setTotalTickets(totalVal ?? 0)
		})
	}, [empire?.game_id, empire?.id])

	const roundStatus = checkRoundStatus(true)

	if (!empire || !activeGame) {
		return (
			<main>
				<Center style={{ minHeight: 240 }}>
					<Loader />
				</Center>
			</main>
		)
	}

	const { lotteryMaxTickets, turnsProtection } = activeGame

	const buyTicket = async () => {
		setLoading(true)
		const values = {
			empireId: empire.id,
			type: "lottery",
		}
		try {
			await Axios.post(
				`/lottery/buyTicket?gameId=${empire.game_id}`,
				values,
			)
			showNotification({
				title: t("finance:lottery.responseSuccess"),
				color: "blue",
				autoClose: 2000,
			})
			loadEmpire()
		} catch (error) {
			console.log(error)
			showNotification({
				title: t("finance:lottery.responseError"),
				color: "orange",
				autoClose: 2000,
			})
		}
		setLoading(false)
	}

	const ticketCost = Math.round(
		empire.networth / generalLog(empire.networth, 25),
	)

	return (
		<main>
			<Center mb={10}>
				<Stack spacing="sm" align="center" maw={650}>
					<img
						src="/images/lottery.webp"
						height="200"
						style={{
							maxHeight: "200px",
							maxWidth: "100%",
							borderRadius: "10px",
						}}
						alt="world bank"
					/>
					<Title order={1} align="center">
						{t("finance:lottery.title")}
					</Title>
					{empire.mode === "demo" && (
						<Text align="center" color="red">
							{t("finance:lottery.demoWarning")}
						</Text>
					)}
					{empire.turnsUsed <= turnsProtection && (
						<Text align="center" color="red">
							{t("finance:lottery.turnsWarning")}
						</Text>
					)}
					<Text align="center">
						{t("finance:lottery.description", { lotteryMaxTickets })}
					</Text>
					<Text align="center">
						{t("finance:lottery.tickets", {
							tickets,
							lotteryMaxTickets,
						})}
					</Text>
					<Text>
						{t("finance:lottery.totalTickets", { totalTickets })}
					</Text>
					<Text align="center">
						{t("finance:lottery.jackpot", {
							jackpot: jackpot.toLocaleString(),
						})}
					</Text>
					<Text align="center">
						{t("finance:lottery.ticketCost", {
							ticketCost: ticketCost.toLocaleString(),
						})}
					</Text>
					<Button
						onClick={buyTicket}
						disabled={
							roundStatus ||
							tickets >= lotteryMaxTickets ||
							empire.turnsUsed <= turnsProtection ||
							empire.cash < ticketCost ||
							empire.mode === "demo"
						}
						loading={loading}
					>
						{t("finance:lottery.submit")}
					</Button>
				</Stack>
			</Center>
		</main>
	)
}
