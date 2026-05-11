import { Table, Text, Button, Title, Menu, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { IconSettings, IconTrash, IconAlertTriangle } from '@tabler/icons-react'
import classes from './guide.module.css'
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminEmpires()
{
    const { t } = useTranslation('admin')
    const [empires, setEmpires] = useState([]);
    const [response, setResponse] = useState(null);
    const { gameId } = useParams();

    useEffect(() =>
    {
        const loadEmpires = async () =>
        {
            const response = await Axios.get(`/admin/empires?gameId=${gameId}`);
            const data = response.data;
            setEmpires(data);
        }
        loadEmpires()

    }, [response]);

    const deleteEmpire = async (uuid) =>
    {
        console.log('deleting empire')
        const response = await Axios.delete('/admin/deleteempire/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }

    const disableEmpire = async (uuid) =>
    {
        console.log('disabling empire')
        const response = await Axios.post('/admin/disableempire/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }


    const rows = empires.map((item) =>
    (
        <tr key={item.uuid}>
            <td>
                <Menu shadow="md" width={100} mt='xs' position='top'>
                    <Menu.Target>
                        <Button size='xs' compact><IconSettings size={14} /></Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<IconSettings size={14} />}>{t('menu.edit')}</Menu.Item>
                        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => deleteEmpire(item.uuid)}>{t('menu.delete')}</Menu.Item>
                        <Menu.Item color="orange" icon={<IconAlertTriangle size={14} />} onClick={() => disableEmpire(item.uuid)}>{t('menu.disable')}</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </td>
            <td>
                {item.mode}
            </td>
            <td>
                {item.createdAt}
            </td>
            <td>
                {item.id}
            </td>
            <td>
                {item.name}
            </td>
            <td>
                {item.flags}
            </td>
            <td>
                {item.turns}
            </td>
            <td>
                {item.turnsUsed}
            </td>
            <td>
                {item.profile}
            </td>
            <td>
                {item.rank}
            </td>
            <td>
                {item.networth}
            </td>
            <td>
                {item.land}
            </td>
            <td>
                {item.cash}
            </td>
            <td>
                {item.food}
            </td>
        </tr>
    ))

    return (
        <Stack>
            <Title>{t('pageTitle.empires')}</Title>
            <Text color='red'>{response?.message}</Text>
            {empires.length > 0 &&
                <div className={classes.guideTable}>
                    <Table striped>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('empires.columns.mode')}</th>
                                <th>{t('empires.columns.created')}</th>
                                <th>{t('empires.columns.id')}</th>
                                <th>{t('empires.columns.name')}</th>
                                <th>{t('empires.columns.flags')}</th>
                                <th>{t('empires.columns.turns')}</th>
                                <th>{t('empires.columns.turnsUsed')}</th>
                                <th>{t('empires.columns.profile')}</th>
                                <th>{t('empires.columns.rank')}</th>
                                <th>{t('empires.columns.networth')}</th>
                                <th>{t('empires.columns.land')}</th>
                                <th>{t('empires.columns.cash')}</th>
                                <th>{t('empires.columns.food')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </Table>
                </div>
            }
        </Stack>
    );
}

export default AdminEmpires;
