import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Axios from 'axios'
import { fetchGames } from '../../store/gamesSlice'
import { Card, Container, Title, Stack, Group, Text, Button } from '@mantine/core'
import { CheckCircle } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router-dom'
import { useKickOut } from '../../hooks/useKickOut'
import { setActiveGame } from '../../store/gamesSlice'
import { useTranslation } from 'react-i18next'

const GamesManager = () =>
{
  const { t } = useTranslation('admin')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { games, status } = useSelector((state) => state.games)
  const [stats, setStats] = useState({});

  const kickOut = useKickOut()

  useEffect(() =>
  {
    if (status === 'idle') {
      dispatch(fetchGames())
    }

    const loadStats = async () =>
    {
      try {
        const response = await Axios.get('/admin/counteverything');
        const data = response.data;
        setStats(data);
      } catch (err) {
        kickOut(err);
      }
    }

    loadStats();

  }, [status])

  const handleGameSelect = (game) =>
  {
    dispatch(setActiveGame(game))
    navigate(`/admin/${game.game_id}/Summary`)
  }

  return (
    <Container>
      <Stack>
        <Card withBorder shadow='sm'>
          <Title>{t('gamesManager.overallSummary')}</Title>
          <Text>{t('stats.users')} {stats.users}</Text>
          <Text>{t('stats.empires')} {stats.empires}</Text>
          <Text>{t('stats.mail')} {stats.mail} ({stats.reports})</Text>
          <Text>{t('stats.marketItems')} {stats.markets}</Text>
          <Text>{t('stats.newsEvents')} {stats.news}</Text>
        </Card>
        {games ? games.map((game) => (
          <Card key={game.id} onClick={() => handleGameSelect(game)} shadow='sm' padding='sm' withBorder sx={(theme) => ({
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '',
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            },
          })}>
            <Group><Title order={2}>{game.name}</Title>
              {game.isActive && <CheckCircle color='green' weight='fill' size={20} />}
            </Group>

            <Text>{game.roundDescription}</Text>
            <Stack my='sm'>
              <Group spacing='xs'>
                <Text align='left'>
                  <b>{t('gameDetails.maxTurns')}</b> {game.turnsMax}</Text>
                <Text align='left'>
                  <b>{t('gameDetails.storedTurns')}</b> {game.turnsStored}</Text>
                <Text align='left'>
                  <b>{t('gameDetails.turnRateLabel')}</b>{' '}
                  {t('gameDetails.turnRate', { count: game.turnsCount, freq: game.turnsFreq })}</Text>
                <Text align='left'>
                  <b>{t('gameDetails.roundStart')}</b> {new Date(game.roundStart).toLocaleDateString()}</Text>
                <Text align='left'>
                  <b>{t('gameDetails.roundEnd')}</b> {new Date(game.roundEnd).toLocaleDateString()}</Text>
              </Group>

              <Group spacing='xs'>
                {game.numEmpires && <Text align='left'>
                  <b>{t('gameDetails.players')}</b> {game.numEmpires.toLocaleString()}</Text>}
                {game.avgLand && (
                  <Text align="left">
                    <b>{t('gameDetails.avgLand')}</b> {game.avgLand.toLocaleString()}
                  </Text>
                )}
                {game.avgNetWorth && (
                  <Text align="left">
                    <b>{t('gameDetails.avgNetWorth')}</b> $
                    {game.avgNetWorth.toLocaleString()}
                  </Text>
                )}
              </Group>
            </Stack>
          </Card>
        )) : <Text>{t('gamesManager.noGames')}</Text>}
        <Button component={Link} to='/admin/create'>{t('gamesManager.createNew')}</Button>
      </Stack>
    </Container>
  )
}

export default GamesManager
