import { useSelector } from "react-redux"

export const checkRoundStatus = (early) =>
{
	const slice = useSelector((state) => state.time)
	const payload = slice.time
	if (
		!payload ||
		payload.start == null ||
		payload.end == null ||
		payload.time == null
	) {
		return false
	}
	let roundStatus = false
	const upcoming = payload.start - payload.time
	const remaining = payload.end - payload.time
	let earlyEnd = false
	if (early) {
		earlyEnd = remaining / 1000 / 60 / 60 < 24
	}

	if (upcoming > 0) {
		roundStatus = true
	} else if (remaining < 0 || earlyEnd) {
		roundStatus = true
	} else {
		roundStatus = false
	}

	return roundStatus
}