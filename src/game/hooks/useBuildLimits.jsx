import { useEffect, useState } from "react"
import Axios from "axios"

const empty = { canBuild: 0, buildRate: 0, buildCost: 0 }

/**
 * Fetches build caps from the API so the UI matches server validation (build.ts getBuildAmounts).
 */
export function useBuildLimits(empire) {
	const [limits, setLimits] = useState(empty)
	const [status, setStatus] = useState("idle")

	useEffect(() => {
		if (!empire?.id || empire.game_id == null) {
			setLimits(empty)
			setStatus("idle")
			return
		}

		let cancelled = false
		setStatus("loading")

		Axios.get(`/build/limits?gameId=${empire.game_id}&empireId=${empire.id}`)
			.then((res) => {
				if (cancelled) return
				setLimits({
					canBuild: res.data.canBuild ?? 0,
					buildRate: res.data.buildRate ?? 0,
					buildCost: res.data.buildCost ?? 0,
				})
				setStatus("succeeded")
			})
			.catch(() => {
				if (cancelled) return
				setLimits(empty)
				setStatus("error")
			})

		return () => {
			cancelled = true
		}
	}, [
		empire?.id,
		empire?.game_id,
		empire?.cash,
		empire?.turns,
		empire?.freeLand,
		empire?.land,
		empire?.race,
	])

	return { limits, status }
}
