import { Text, Button, Title, TextInput, Group, Stack, Container } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { useForm } from '@mantine/form'
import { useSelector } from 'react-redux';
import { CheckCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

function AdminSummary()
{
    const { t } = useTranslation('admin')
    const [stats, setStats] = useState({});
    const [result, setResult] = useState();

    const game = useSelector((state) => state.games.activeGame)

    useEffect(() =>
    {
        const loadStats = async () =>
        {
            const response = await Axios.get(`/admin/countall?gameId=${game.game_id}`);
            const data = response.data;
            setStats(data);
        }

        loadStats()

    }, [game]);

    const form = useForm({
        initialValues: {
            code: '',
        },
    })

    const submitReset = async (values) =>
    {
        try {
            const res = await Axios.post(`/admin/resetgame?gameId=${game.game_id}`, values)
            setResult(res.data)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <Container>
            <Stack>
                <div>
                    <Group><Title>{game.name}</Title>
                        {game.isActive && <CheckCircle color='green' weight='fill' size={20} />}
                    </Group>
                    <Title order={2}>{t('summary.sectionTitle')}</Title>
                    <Text>{t('stats.users')} {stats.users}</Text>
                    <Text>{t('stats.empires')} {stats.empires}</Text>
                    <Text>{t('stats.mail')} {stats.mail} ({stats.reports})</Text>
                    <Text>{t('stats.marketItems')} {stats.markets}</Text>
                    <Text>{t('stats.newsEvents')} {stats.news}</Text>
                </div>
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
                <div>
                    <Title>{t('summary.resetTitle')}</Title>
                    <Text>{t('summary.resetDescription')}</Text>
                    <form onSubmit={form.onSubmit((values) =>
                    {
                        console.log('resetting game')
                        console.log(values)
                        submitReset(values)
                    })}>
                        <TextInput placeholder={t('summary.resetPlaceholder')}
                            {...form.getInputProps('code')}
                            mb='sm'
                            maw={300}
                        />
                        <Button color="red" type='submit'>{t('summary.resetButton')}</Button>
                        {result && <Text>{result.message}</Text>}
                    </form>
                </div>
            </Stack>
        </Container>
    );
}

export default AdminSummary;
