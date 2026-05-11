import { Button, Stack, Title } from '@mantine/core'
import { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const GAME_SECTION_LINKS = [
    { route: 'Summary', labelKey: 'linkSummary' },
    { route: 'Settings', labelKey: 'linkSettings' },
    { route: 'Users', labelKey: 'linkUsers' },
    { route: 'Empires', labelKey: 'linkEmpires' },
    { route: 'Mail', labelKey: 'linkMail' },
    { route: 'ClanMail', labelKey: 'linkClanMail' },
    { route: 'Market', labelKey: 'linkMarket' },
    { route: 'News', labelKey: 'linkNews' },
]

const AdminSidebar = () =>
{
    const { t } = useTranslation('admin')
    const activeGame = useSelector((state) => state.games.activeGame)

    const location = useLocation()
    const locationString = location.pathname.split('/admin/')[1]

    return (
        <Fragment>
            <Stack spacing='xs' sx={{ marginBottom: '1rem', marginRight: '0.5rem', marginTop: '1rem' }}>
                <Button
                    component={Link}
                    compact
                    to={'/'}
                    variant='filled'
                >
                    {t('sidebar.homePage')}
                </Button>
                <Button
                    component={Link}
                    compact
                    to={'/select/'}
                    variant='filled'
                >
                    {t('sidebar.gameSelect')}
                </Button>
                <Button
                    component={Link}
                    compact
                    to={'/admin/'}
                    variant='filled'
                >
                    {t('sidebar.gamesIndex')}
                </Button>
                {activeGame && <Title order={4} align='center'>{activeGame.name}</Title>}
                <Button
                    component={Link}
                    compact
                    to='/app/'
                    variant='outline'
                >
                    {t('sidebar.goToGame')}
                </Button>
                <Title order={4}>{t('sidebar.manageGame')}</Title>
                {activeGame && GAME_SECTION_LINKS.map(({ route, labelKey }) =>
                {
                    let variant = 'subtle'
                    if (locationString.split('%').length > 1 && locationString.split('%')[0] === route.split(' ')[0]) {
                        variant = 'filled'
                    } else if (locationString === route) {
                        variant = 'filled'
                    }
                    return (
                        <Button
                            component={Link}
                            compact
                            to={`/admin/${activeGame?.game_id}/${route}`}
                            variant={variant}
                            key={route}
                        >
                            {t(`sidebar.${labelKey}`)}
                        </Button>)

                })}
            </Stack>
        </Fragment>
    )
}

export default AdminSidebar
