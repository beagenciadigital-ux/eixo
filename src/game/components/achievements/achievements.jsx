import { memo, useMemo } from "react"
import { Title, Notification, Group, Box, Text } from "@mantine/core"
import { processAchievement } from "../../functions/processAchievement"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

const ERA_KEYS = ["past", "present", "future"]

function categoryLabel(category, era, t) {
	const pk = ERA_KEYS[era ?? 0] ?? "past"
	if (category === "trpArm")
		return t(`eras:eras.${pk}.trparm`)
	if (category === "trpLnd")
		return t(`eras:eras.${pk}.trplnd`)
	if (category === "trpFly")
		return t(`eras:eras.${pk}.trpfly`)
	if (category === "trpSea")
		return t(`eras:eras.${pk}.trpsea`)
	if (category === "trpWiz")
		return t(`eras:eras.${pk}.trpwiz`)
	return t(`achievements:categories.${category}`)
}

const AchievementNotification = memo(({ achievement }) => {
	const { t, i18n } = useTranslation("achievements")
	const { message, icon } = processAchievement(achievement.name, t)
	const dateStr = achievement.time
		? new Date(achievement.time).toLocaleDateString(i18n.language)
		: ""
	return (
		<Notification
			title={message}
			color={achievement.awarded ? "blue" : "gray"}
			icon={icon}
			disallowClose
			shadow={0}
			radius={0}
			h={87}
		>
			{achievement.awarded && dateStr ? (
				<Text size="xs" color="dimmed">
					{t("awardedOn", { date: dateStr })}
				</Text>
			) : null}
		</Notification>
	)
})

function Achievements() {
	const { empire } = useSelector((state) => state.empire)
	const { t } = useTranslation(["achievements", "eras"])

	const achievementsByCategory = useMemo(() => {
		const achievements = empire.achievements
		const achievementArray = Object.keys(achievements).map((key) => {
			if (key === "indy" || key === "magic") {
				return
			}
			return {
				name: key,
				awarded: achievements[key].awarded,
				time: achievements[key].timeAwarded,
			}
		})

		const categories = [
			"turns",
			"exploreGains",
			"income",
			"expenses",
			"food",
			"foodcon",
			"networth",
			"peasants",
			"land",
			"indy",
			"magic",
			"trpArm",
			"trpLnd",
			"trpFly",
			"trpSea",
			"trpWiz",
			"attackGains",
			"attacks",
			"defends",
			"rank",
			"build",
			"joinClan",
		]

		const food = achievementArray.filter(
			(achievement) =>
				achievement.name.includes("food") &&
				!achievement.name.includes("foodcon"),
		)

		return categories.map((category) => ({
			category,
			achievements:
				category === "food"
					? food
					: achievementArray
							.filter((achievement) => achievement.name.includes(category))
							.sort((a, b) => a.name.localeCompare(b.name)),
		}))
	}, [empire.achievements, empire.era])

	return (
		<div>
			<Title order={1} align="center" mb="sm">
				{t("achievements:pageTitle")}
			</Title>

			<Group
				position="center"
				sx={{ display: "flex", alignItems: "flex-start" }}
			>
				{achievementsByCategory.map(({ category, achievements }) => (
					<Box w={400} key={category} mt="sm">
						<Title order={3} align="center" mb="sm">
							{categoryLabel(category, empire.era, t)}
						</Title>
						{achievements.map(
							(achievement) =>
								achievement && (
									<AchievementNotification
										key={achievement.name}
										achievement={achievement}
									/>
								),
						)}
					</Box>
				))}
			</Group>
		</div>
	)
}

export default memo(Achievements)
