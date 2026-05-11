import { Button, Paper, Stack, TextInput, Title, Select, Container, createStyles, Table, Text, Group, Image, ColorSchemeProvider, MantineProvider } from '@mantine/core'
import { useForm } from '@mantine/form'
import { create } from '../../store/empireSlice'
import { useEffect, forwardRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { raceArray } from '../../config/races'
import { load } from '../../store/userSlice'
import { getTime } from '../../store/timeSlice'
import { useLocalStorage } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'

/** Server error strings from translate(errors:empire.*) / generic — all API locales */
const API_EMPIRE_ALREADY = new Set([
	'User already has an empire in this game',
	'Ya tienes un imperio en esta partida',
	'Já tens um império nesta partida',
])
const API_EMPIRE_NAME_EXISTS = new Set([
	'Empire name already exists',
	'Ese nombre de imperio ya existe',
	'Esse nome de império já existe',
])
const API_EMPIRE_NAME_EMPTY = new Set([
	'Name must not be empty',
	'El nombre no puede estar vacío',
	'O nome não pode estar vazio',
])
const API_GENERIC = new Set([
	'Something went wrong',
	'Algo salió mal',
	'Algo deu errado',
])

const useStyles = createStyles(() => ({
	form: {
		minHeight: '100vh',
		marginTop: 50,
		// maxWidth: 900,
		padding: 20,

		'@media (max-width: 400)': {
			maxWidth: '100%',
		},
	},
	guideTable: {
		overflowX: 'auto',
		whiteSpace: 'nowrap',
		textAlign: 'center',
	}
}));

const RaceItem = forwardRef(({ icon, label, ...others }, ref) => (
	<div ref={ref} {...others} key={label}>
		<Group>
			<Image src={`/icons/${raceArray[icon].name.toLowerCase()}.svg`} height={22} width={22} fit='contain' sx={(theme) => theme.colorScheme === 'dark' ? ({ filter: 'invert(1)', opacity: '75%' }) : ({ filter: 'invert(0)', })} />
			<Text>{label}</Text>
		</Group>
	</div>
))

export default function CreateEmpire()
{
	const { t } = useTranslation('pages')
	const { t: tGuide } = useTranslation('guide')
	const { t: tRaces } = useTranslation('races')

	const { isLoggedIn, user } = useSelector((state) => state.user)
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const [error, setError] = useState(null)
	const { game_id } = useSelector((state) => state.games.activeGame)

	const raceObjects = useMemo(() => raceArray.map((race, index) => ({
		icon: index,
		label: tRaces(`names.${race.name.toLowerCase()}`, { defaultValue: race.name }),
		value: index
	})), [tRaces])

	useEffect(() =>
	{
		if (!isLoggedIn || !user) {
			navigate('/')
		}

		if (user && user.role === 'demo') {
			navigate('/demo')
		}

	}, [user, dispatch, navigate, isLoggedIn])

	const form = useForm({
		initialValues: {
			name: '',
			race: 0
		},

		validationRules: {

		},

		errorMessages: {

		},
	})

	const { classes } = useStyles();

	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'prom-color-scheme',
		defaultValue: 'dark'
	});
	const toggleColorScheme = (value) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	const empireErrorMessage = (raw) =>
	{
		const s = raw == null ? '' : String(raw)
		if (!s || s === 'request failed') {
			return t('createEmpire.errors.requestFailed')
		}
		if (API_EMPIRE_ALREADY.has(s)) return t('createEmpire.errors.alreadyHasEmpire')
		if (API_EMPIRE_NAME_EXISTS.has(s)) return t('createEmpire.errors.nameExists')
		if (API_EMPIRE_NAME_EMPTY.has(s)) return t('createEmpire.errors.nameEmpty')
		if (API_GENERIC.has(s)) return t('createEmpire.errors.generic')
		return s
	}

	return (
		<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
			<MantineProvider theme={{ colorScheme }} withGlobalStyles>
				<div>
					<Container size='lg'>
						<Paper className={classes.form} radius={0} >
							<Stack align='left'>
								<Title order={1} align='center'>
									{t('createEmpire.title')}
								</Title>
								<form
									onSubmit={form.onSubmit((values) =>
									{
										dispatch(create({ values, game_id }))
											.unwrap()
											.then(() =>
											{
												dispatch(load())
													.then(() =>
													{
														dispatch(getTime(game_id)).then(() => navigate('/app/'))
													})
											})
											.catch((err) =>
											{
												console.log(err)
												const msg = err?.error
												if (msg != null && API_EMPIRE_ALREADY.has(String(msg))) {
													navigate('/app/')
												}
												setError(err)
											})
									})}
								>
									<Stack spacing='sm' align='center'>
										<Image
											src={`/images/races/${(raceArray[Number(form.values.race ?? 0)] ?? raceArray[0]).name.toLowerCase()}.webp`}
											alt={tRaces(`names.${(raceArray[Number(form.values.race ?? 0)] ?? raceArray[0]).name.toLowerCase()}`, { defaultValue: (raceArray[Number(form.values.race ?? 0)] ?? raceArray[0]).name })}
											radius='md'
											fit='cover'
											width='100%'
											sx={{ maxWidth: 500 }}
										/>
										<TextInput
											label={t('createEmpire.nameLabel')}
											placeholder={t('createEmpire.namePlaceholder')}
											type='text'
											required
											{...form.getInputProps('name')}
										/>
										<Select
											label={t('createEmpire.raceLabel')}
											placeholder={t('createEmpire.racePlaceholder')}
											required
											itemComponent={RaceItem}
											data={raceObjects}
											{...form.getInputProps('race')}
										/>
										<Button type='submit'>{t('createEmpire.submit')}</Button>
										{error && <Text color='red'>{empireErrorMessage(error.error)}</Text>}
									</Stack>
								</form>

								<Title order={3}>{tGuide('guide.content.race.title')}</Title>
								<Text>{tGuide('guide.content.race.description')}</Text>
								<dl>
									<dt>{tGuide('guide.content.race.attributes.offense.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.offense.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.defense.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.defense.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.building.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.building.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.upkeep.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.upkeep.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.magic.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.magic.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.industry.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.industry.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.economy.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.economy.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.exploration.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.exploration.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.market.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.market.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.consumption.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.consumption.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.energy.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.energy.description')}</dd>
									<dt>{tGuide('guide.content.race.attributes.agriculture.name')}</dt>
									<dd>{tGuide('guide.content.race.attributes.agriculture.description')}</dd>
								</dl>
								<i>{tGuide('guide.content.race.scroll')}</i>
								<div className={classes.guideTable}>
									<Table highlightOnHover striped style={{ width: 1300 }}>
										<thead>
											<tr>
												<th>{tGuide('guide.content.race.attributes.name')}</th>
												<th>{tGuide('guide.content.race.attributes.offense.name')}</th>
												<th>{tGuide('guide.content.race.attributes.defense.name')}</th>
												<th>{tGuide('guide.content.race.attributes.building.name')}</th>
												<th>{tGuide('guide.content.race.attributes.upkeep.name')}</th>
												<th>{tGuide('guide.content.race.attributes.magic.name')}</th>
												<th>{tGuide('guide.content.race.attributes.industry.name')}</th>
												<th>{tGuide('guide.content.race.attributes.economy.name')}</th>
												<th>{tGuide('guide.content.race.attributes.exploration.name')}</th>
												<th>{tGuide('guide.content.race.attributes.market.name')}</th>
												<th>{tGuide('guide.content.race.attributes.consumption.name')}</th>
												<th>{tGuide('guide.content.race.attributes.energy.name')}</th>
												<th>{tGuide('guide.content.race.attributes.agriculture.name')}</th>
											</tr>
										</thead>
										<tbody>
											{raceArray.map(race =>
											{
												return (
													<tr key={race.name}>
														<td>{tRaces(`names.${race.name.toLowerCase()}`, { defaultValue: race.name })}</td>
														<td style={race.mod_offense >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_offense}%</td>
														<td style={race.mod_defense >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_defense}%</td>
														<td style={race.mod_buildrate >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_buildrate}%</td>
														<td style={race.mod_expenses >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_expenses}%</td>
														<td style={race.mod_magic >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_magic}%</td>
														<td style={race.mod_industry >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_industry}%</td>
														<td style={race.mod_income >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_income}%</td>
														<td style={race.mod_explore >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_explore}%</td>
														<td style={race.mod_market >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_market}%</td>
														<td style={race.mod_foodcon >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_foodcon}%</td>
														<td style={race.mod_runepro >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_runepro}%</td>
														<td style={race.mod_foodpro >= 0 ? { color: 'green' } : { color: 'red' }}>{race.mod_foodpro}%</td>
													</tr>
												)
											})}
										</tbody>
									</Table>
								</div>
								<p>{tGuide('guide.content.race.note')}</p>

							</Stack>
						</Paper>
					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	)
}
