import {
	Scales,
	Sword,
	Shield,
	MagicWand,
	Coins,
	AirplaneTilt,
	Boat,
	UsersThree,
	ForkKnife,
	Skull,
	Grains,
	Mountains,
	MapTrifold,
	CreditCard,
	Trophy,
	Factory,
	Hammer,
	GitBranch,
	MedalMilitary,
	UsersFour,
	ShieldChevron,
} from "@phosphor-icons/react"
import { Text } from "@mantine/core"
import { achievements as ACH_CONFIG } from "../config/achievements"

function amountForKey(key) {
	const def = ACH_CONFIG.find((a) => a.keys.includes(key))
	if (!def) return null
	return def.thresholds[def.keys.indexOf(key)]
}

function fmtNum(n) {
	return typeof n === "number" ? n.toLocaleString() : String(n)
}

const ICON = {
	income: Coins,
	indyProd: Factory,
	magicProd: MagicWand,
	expenses: CreditCard,
	foodcon: ForkKnife,
	food: Grains,
	exploreGains: Mountains,
	land: MapTrifold,
	networth: Scales,
	peasants: UsersThree,
	trpArm: Sword,
	trpLnd: ShieldChevron,
	trpFly: AirplaneTilt,
	trpSea: Boat,
	trpWiz: MagicWand,
	attackGains: Skull,
	turns: GitBranch,
	attacks: MedalMilitary,
	defends: Shield,
	rank: Trophy,
	build: Hammer,
	joinClan: UsersFour,
}

function iconForKey(key) {
	if (key.startsWith("turns")) return ICON.turns
	if (key === "rank1") return ICON.rank
	if (key === "build") return ICON.build
	if (key === "joinClan") return ICON.joinClan
	const base = key.replace(/\d+$/, "")
	return ICON[base] ?? null
}

/**
 * @param {string} achievementKey — e.g. income0, turns1, build
 * @param {function} t — i18n t bound to `achievements` namespace (or pass keyPrefix)
 */
export function processAchievement(achievementKey, t) {
	const key = achievementKey
	const Icon = iconForKey(key)
	const amount = amountForKey(key)
	const vars =
		amount != null && typeof amount === "number"
			? { amount: fmtNum(amount) }
			: {}

	const title = t(`items.${key}.title`)
	const subtitle = t(`items.${key}.subtitle`, vars)

	return {
		message: (
			<div>
				<Text>{title}</Text>
				<Text size="sm" color="dimmed">
					{subtitle}
				</Text>
			</div>
		),
		icon: Icon ? <Icon /> : null,
	}
}
