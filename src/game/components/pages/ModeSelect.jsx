import {
	Container,
	Group,
	Loader,
	MantineProvider,
	ColorSchemeProvider,
	Center,
	Text,
} from "@mantine/core"
import { Suspense } from "react"
import { SlimHero } from "./slimHero"
import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import { fetchGames } from "../../store/gamesSlice"
import { resetUser, userLoaded } from "../../store/userSlice"
import Axios from "axios"
import FooterSocial from "../layout/footer"
import ModeCard from "./ModeCard"
import { persistor } from "../../store/store"
import { logoutEmpire } from "../../store/empireSlice"
import { useLocalStorage } from "@mantine/hooks"

function LoadingFallback() {
	return (
		<Center style={{ width: "100%", height: "100vh" }}>
			<Loader size="xl" />
		</Center>
	)
}

export default function ModeSelect() {
	const dispatch = useDispatch()
	const { user } = useSelector((state) => state.user)

	useEffect(() => {
		dispatch(fetchGames())
		async function loadUser() {
			try {
				const res = await Axios.get("auth/me")
				if (res?.data) {
					dispatch(userLoaded(res.data))
				}
			} catch (error) {
				// console.log(error)
				// localStorage.removeItem('persist:root');
				persistor.pause()
				persistor.flush().then(() => {
					return persistor.purge()
				})
				dispatch(resetUser())
				dispatch(logoutEmpire())
			}
		}

		loadUser()
	}, [dispatch])

	const { status, games } = useSelector((state) => state.games)

	const activeGames = Array.isArray(games)
		? games.filter((game) => game.isActive !== false)
		: []

	// get game data from scores to show information on the page
	// useEffect(() =>
	// {

	// }, [games])

	// logged in user can join both game modes
	// if they have not joined, clicking button will send them to create an empire for that mode
	// if they have joined, clicking button will send them into the game for that mode

	const [colorScheme, setColorScheme] = useLocalStorage({
		key: "prom-color-scheme",
		defaultValue: "dark",
	})
	const toggleColorScheme = (value) =>
		setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"))

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<MantineProvider theme={{ colorScheme }} withGlobalStyles>
				<Suspense fallback={<LoadingFallback />}>
					<SlimHero />
					<Container size="lg" align="center" py="xl">
						<Group mt="md" position="center" key="owjojd">
							{status === "loading" || status === "idle" ? (
								<Loader size="xl" />
							) : status === "failed" ? (
								<Text align="center" color="dimmed">
									Não foi possível carregar os jogos. Atualiza a página.
								</Text>
							) : activeGames.length > 0 ? (
								activeGames.map((game) => {
									let empireFound = false
									if (user?.empires?.length > 0) {
										const empire = user.empires.find(
											(empire) => empire.game_id === game.game_id,
										)
										if (empire) {
											empireFound = true
										}
									}

									return (
										<ModeCard
											game={game}
											empireFound={empireFound}
											user={user}
											key={game.id}
										/>
									)
								})
							) : (
								<Text align="center" color="dimmed">
									Não há jogos ativos disponíveis.
								</Text>
							)}
						</Group>
					</Container>
					<FooterSocial />
				</Suspense>
			</MantineProvider>
		</ColorSchemeProvider>
	)
}
