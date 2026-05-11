import { useCallback, useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate, Link } from "react-router-dom"
import Axios from "axios"
import { useLocalStorage, useMediaQuery } from "@mantine/hooks"
import useInterval from "./hooks/useInterval"
import {
	ColorSchemeProvider,
	Group,
	Loader,
	MantineProvider,
	Grid,
	AppShell,
	Burger,
	Header,
	MediaQuery,
	Navbar,
	Title,
	Button,
	Image,
	Center,
	Box,
	Drawer,
	Stack,
} from "@mantine/core"
import { NotificationsProvider, showNotification } from "@mantine/notifications"
import neoIcon from "./icons/neoIcon.svg"

const neoIconSrc = typeof neoIcon === "string" ? neoIcon : neoIcon.src
import Sidebar from "./components/layout/sidebar"
import InfoBar from "./components/layout/infobar"
import { useDispatch, useSelector } from "react-redux"
import TurnResultContainer from "./components/useTurns/TurnResultContainer"
import { fetchEmpire, empireLoaded, logoutEmpire } from "./store/empireSlice"
import { resetUser, userLoaded } from "./store/userSlice"
import ThemeToggle from "./components/utilities/themeToggle"
import { useLocation } from "react-router-dom"
import { setPage } from "./store/guideSlice"
import { getTime } from "./store/timeSlice"
import EffectIcons from "./components/layout/EffectIcons"
import BonusTurns from "./components/layout/bonusTurns"
import { persistor } from "./store/store"
import { useTour } from "@reactour/tour"
import { processAchievement } from "./functions/processAchievement"
import GuideModalButton from "./components/guide/guideModalButton"
import NewsDrawerButton from "./components/news/newsDrawerButton"
import RefreshButton from "./components/utilities/refreshButton"
import MailButton from "./components/mail/mailButton"
import ClanMailButton from "./components/diplomacy/clans/clanMessagesButton"
import RepeatButton from "./components/utilities/repeatButton"
import { fetchGames, setActiveGame } from "./store/gamesSlice"
import * as Sentry from "@sentry/react"
import ResumeTutorialButton from "./components/utilities/resumeTutorialButton"
import { LanguageSelector } from "./components/utilities/LanguageSelector"
import { axiosSessionCheckConfig } from "./config/apiOrigin"
import { BRAND_NAME } from "./config/oldConfig"
import { useTranslation } from "react-i18next"

function App() {
	const { t: tAchievements } = useTranslation("achievements")
	const { t: tPages } = useTranslation("pages")
	const { t: tLayout } = useTranslation("layout")
	const { t: tAdmin } = useTranslation("admin")
	const [opened, setOpened] = useState(false)
	const isMobile = useMediaQuery("(max-width: 767px)", false, true)
	const dispatch = useDispatch()
	const location = useLocation()
	const navigate = useNavigate()
	const empireStatus = useSelector((state) => state.empire.status)
	const timeStatus = useSelector((state) => state.time.status)
	const roundClock = useSelector((state) => state.time.time)
	const { isLoggedIn, user } = useSelector((state) => state.user)
	const { empire } = useSelector((state) => state.empire)

	const shellReady =
		empireStatus === "succeeded" &&
		empire != null &&
		timeStatus === "succeeded" &&
		roundClock != null

	// handle condition where there is no active game in redux store
	const games = useSelector((state) => state.games.games)
	const activeGame = useSelector((state) => state.games.activeGame)

	const { pageState, pageName } = useMemo(() => {
		const locationArr = location.pathname.split("/")
		const last = locationArr.length - 1
		const pageState = locationArr[last]
		const pageName = pageState.replace("%20", " ")
		return { pageState, pageName }
	}, [location.pathname])

	const kickOut = useCallback(
		(error) => {
			console.log(error)
			persistor.pause()
			persistor.flush().then(() => {
				return persistor.purge()
			})
			dispatch(resetUser())
			dispatch(logoutEmpire())
			navigate("/select")
		},
		[dispatch, navigate],
	)

	const { setIsOpen, currentStep, meta } = useTour()

	/** Refresh round clock when the active game changes; do not redirect — Summary/effects restore activeGame from empire + games. */
	useEffect(() => {
		if (!activeGame?.game_id) return
		dispatch(getTime(activeGame.game_id))
	}, [activeGame?.game_id, dispatch])

	useEffect(() => {
		async function loadUser() {
			const res = await Axios.get("auth/me", axiosSessionCheckConfig)
			if (res.status === 401) return
			if (res.data) {
				dispatch(userLoaded(res.data))
			}
		}

		if (!isLoggedIn) {
			void loadUser()
		}
	}, [dispatch, isLoggedIn])

	useEffect(() => {
		const empires = user?.empires
		if (
			!isLoggedIn ||
			!empires?.length ||
			!activeGame ||
			empireStatus !== "idle"
		) {
			return
		}

		const row = empires.find((e) => e.game_id === activeGame.game_id)
		if (!row?.uuid) return

		dispatch(fetchEmpire({ uuid: row.uuid }))
			.unwrap()
			.catch((err) => {
				// A deleted/stale empire should redirect to mode select instead of hard logout.
				if (err?.empire === "empire not found") {
					dispatch(logoutEmpire())
					navigate("/select", { replace: true })
					return
				}
				kickOut(err)
			})
	}, [
		activeGame,
		dispatch,
		empireStatus,
		isLoggedIn,
		kickOut,
		navigate,
		user?.empires,
	])

	useEffect(() => {
		if (!isLoggedIn || !user || (user.empires?.length ?? 0) > 0) return
		if (!location.pathname.startsWith("/app")) return
		if (user.role === "demo") {
			navigate("/demo", { replace: true })
		} else {
			navigate("/create", { replace: true })
		}
	}, [
		isLoggedIn,
		location.pathname,
		navigate,
		user?.empires?.length,
		user?.role,
	])

	useEffect(() => {
		if (activeGame || !empire?.game_id) return
		dispatch(fetchGames())
	}, [activeGame, dispatch, empire?.game_id])

	useEffect(() => {
		if (activeGame || !empire?.game_id || !Array.isArray(games)) return
		const game = games.find((g) => g.game_id === empire.game_id)
		if (!game) return
		dispatch(setActiveGame(game))
		dispatch(getTime(game.game_id))
	}, [activeGame, dispatch, empire?.game_id, games])

	useEffect(() => {
		dispatch(setPage(pageState))
	}, [dispatch, pageState])

	useEffect(() => {
		setOpened(false)
	}, [location.pathname])

	useEffect(() => {
		if (empireStatus !== "succeeded" || !empire) return
		if (empire.flags === 1 && location.pathname !== "/app/disabled") {
			navigate("/app/disabled")
		}
	}, [empire, empireStatus, location.pathname, navigate])

	let achievements = {} // Extract achievements from empire
	if (empire) {
		achievements = empire.achievements
		// console.log(achievements)
	}

	useEffect(() => {
		for (const key of Object.keys(achievements)) {
			if (
				achievements[key].awarded &&
				new Date(achievements[key].timeAwarded).getTime() + 1000 > Date.now()
			) {
				// console.log(key)
				const { message, icon } = processAchievement(key, tAchievements)
				showNotification({
					title: tAchievements("notificationAwarded"),
					message: message,
					icon: icon,
				})
			}
		}
	}, [achievements, tAchievements])

	useEffect(() => {
		if (meta === "new player tour") {
			if (currentStep === 3 || currentStep === 0) {
				setOpened(true)
			} else {
				setOpened(false)
			}
			if (currentStep === 1 && pageName !== "Explore") {
				navigate("/app/Explore")
			}
			if (currentStep === 4 && pageName !== "Build") {
				navigate("/app/Build")
			}
		}
	}, [currentStep, meta, navigate, pageName, setIsOpen])

	useInterval(async () => {
		if (
			empireStatus === "succeeded" &&
			empire?.uuid &&
			pageName !== "Public Market"
		) {
			try {
				const res = await Axios.get(`/empire/${empire.uuid}`)
				// console.log(res.data)
				dispatch(empireLoaded(res.data))
			} catch (error) {
				kickOut(error)
			}
		}
	}, 120000)

	const [colorScheme, setColorScheme] = useLocalStorage({
		key: "prom-color-scheme",
		defaultValue: "dark",
	})
	const toggleColorScheme = (value) =>
		setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))

	function FallbackComponent() {
		const { t } = useTranslation("layout")
		return (
			<Center h="100vh">
				<Title>{t("layout.shell.errorBoundaryMessage")}</Title>
			</Center>
		)
	}

	const myFallback = <FallbackComponent />

	return (
		<Sentry.ErrorBoundary fallback={myFallback}>
			<ColorSchemeProvider
				colorScheme={colorScheme}
				toggleColorScheme={toggleColorScheme}
			>
				<MantineProvider theme={{ colorScheme }} withGlobalStyles>
					<NotificationsProvider autoClose={4000}>
						<>
						<AppShell
							styles={(theme) => ({
								main: {
									backgroundColor:
										theme.colorScheme === "dark"
											? theme.colors.dark[8]
											: theme.colors.gray[1],
								},
							})}
							className="gnome9 vampire9 minotaur9 gnome8 vampire8 minotaur8"
							navbarOffsetBreakpoint="sm"
							fixed
							navbar={
								isMobile ? undefined : (
								<Navbar
									padding="sm"
									hidden={false}
									width={{ base: 300, sm: 300 }}
									zIndex={110}
									sx={{
										paddingBottom: "calc(1em + env(safe-area-inset-bottom))",
										overflow: "hidden",
									}}
								>
									<Navbar.Section
										grow
										ml={10}
										sx={{ minHeight: 0, flex: "1 1 0" }}
									>
										<Box
											h="100%"
											sx={{
												minHeight: 0,
												maxHeight: "100%",
												overflowY: "auto",
												overflowX: "hidden",
											}}
										>
											<Sidebar game={activeGame} />
										</Box>
									</Navbar.Section>
									<Navbar.Section>
										<Button
											component={Link}
											to="/select"
											variant="subtle"
											color="red"
											fullWidth
										>
											{tPages("hero.select")}
										</Button>
									</Navbar.Section>
								</Navbar>
								)
							}
							header={
								<Header height={60} p="sm" zIndex={120}>
									<Group position="apart" spacing={2}>
										<MediaQuery largerThan="sm" styles={{ display: "none" }}>
											<Burger
												opened={opened}
												onClick={() => setOpened((o) => !o)}
												size="md"
												aria-label="Menu"
												sx={(theme) => ({
													minWidth: 44,
													minHeight: 44,
													padding: theme.spacing.xs,
												})}
											/>
										</MediaQuery>
										<a
											style={{ textDecoration: "none", color: "inherit" }}
											href="/"
										>
											<Group align="center" spacing={4} noWrap>
												<Image
													src={neoIconSrc}
													height={38}
													width={38}
													alt=""
													sx={(theme) => ({
														flexShrink: 0,
														...(colorScheme === "dark"
															? { filter: "invert(1)", opacity: "75%" }
															: { filter: "invert(0)" }),
														[theme.fn.smallerThan("sm")]: {
															height: 32,
															width: 32,
														},
													})}
												/>
												<Title
													order={1}
													ml={0}
													sx={(theme) => ({
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
														minWidth: 0,
														[theme.fn.smallerThan("sm")]: {
															fontSize: theme.fontSizes.lg,
														},
													})}
												>
													{BRAND_NAME}
												</Title>
											</Group>
										</a>
										<Group>
											{user?.role === "admin" ? (
												<Button
													component="a"
													href="/admin/"
													compact
													variant="light"
												>
													{tAdmin("headerButton")}
												</Button>
											) : (
												""
											)}
											<MediaQuery smallerThan="sm" styles={{ display: "none" }}>
												<Box>
													<LanguageSelector />
												</Box>
											</MediaQuery>
											<ThemeToggle />
										</Group>
									</Group>
								</Header>
							}
						>
							<main
								style={{
									paddingBottom: "calc(15px + env(safe-area-inset-bottom))",
								}}
								className="gremlin14 dwarf14 ghoul14 goblin14 orc14 hobbit14 elf10 drow10 pixie10 gnome14 vampire14 minotaur14"
							>
								{!shellReady ? (
									timeStatus === "failed" &&
									empireStatus === "succeeded" &&
									empire ? (
										<Center style={{ minHeight: "40vh" }}>
											<Stack align="center" spacing="sm">
												<Title order={4} ta="center">
													{tLayout("layout.shell.clockError")}
												</Title>
												<Button
													variant="light"
													onClick={() => {
														if (activeGame?.game_id)
															dispatch(getTime(activeGame.game_id))
													}}
												>
													{tLayout("layout.shell.retry")}
												</Button>
											</Stack>
										</Center>
									) : (
										<Loader />
									)
								) : (
									<>
										<InfoBar data={empire} />
										<Grid
											grow
											justify="center"
											sx={{ marginTop: "0.5rem", marginBottom: "0.25rem" }}
										>
											<Grid.Col span={{ base: 12, sm: 2 }}>
												<EffectIcons pageState={pageState} empire={empire} />
											</Grid.Col>
											<Grid.Col span={{ base: 12, sm: 3 }}>
												<Group spacing="xs" position="center">
													<GuideModalButton
														pageName={pageName}
														empire={empire}
														protection={activeGame?.turnsProtection}
													/>
													<RefreshButton empire={empire} />
												</Group>
											</Grid.Col>
											<Grid.Col span={{ base: 12, sm: 2 }}>
												<Group
													spacing="xs"
													sx={(theme) => ({
														flexWrap: "wrap",
														justifyContent: "center",
														[theme.fn.largerThan("sm")]: {
															justifyContent: "flex-end",
															marginRight: theme.spacing.sm,
														},
													})}
												>
													<BonusTurns />
													{empire.clanId !== 0 && (
														<ClanMailButton empire={empire} kickOut={kickOut} />
													)}
													<MailButton
														empire={empire}
														kickOut={kickOut}
														pageState={pageState}
													/>
													<NewsDrawerButton
														kickOut={kickOut}
														empire={empire}
														pageState={pageState}
													/>
												</Group>
											</Grid.Col>
										</Grid>
										<TurnResultContainer empire={empire} />
										<ResumeTutorialButton />
										<RepeatButton empire={empire} kickOut={kickOut} />
										<Outlet />
									</>
								)}
							</main>
						</AppShell>
						{isMobile && (
							<Drawer
								opened={opened}
								onClose={() => setOpened(false)}
								position="left"
								size={280}
								padding="sm"
								title=""
								zIndex={400}
								styles={{
									body: {
										paddingBottom:
											"calc(1em + env(safe-area-inset-bottom))",
									},
								}}
							>
								<Stack
									justify="space-between"
									sx={{
										minHeight: "calc(100vh - 2rem - env(safe-area-inset-bottom))",
									}}
								>
									<Box
										sx={{
											flex: 1,
											minHeight: 0,
											maxHeight:
												"calc(100vh - 200px - env(safe-area-inset-bottom))",
											overflowY: "auto",
											overflowX: "hidden",
										}}
									>
										<Sidebar game={activeGame} />
									</Box>
									<Stack spacing="sm">
										<LanguageSelector />
										<Button
											component={Link}
											to="/select"
											variant="subtle"
											color="red"
											fullWidth
											onClick={() => setOpened(false)}
										>
											{tPages("hero.select")}
										</Button>
									</Stack>
								</Stack>
							</Drawer>
						)}
						</>
					</NotificationsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</Sentry.ErrorBoundary>
	)
}

export default App
