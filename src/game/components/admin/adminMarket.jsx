import { Table, Text, Button, Title, Menu, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { IconSettings, IconTrash } from '@tabler/icons-react'
import classes from './guide.module.css'
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const marketArray = [
    'trpArm', 'trpLnd', 'trpFly', 'trpSea', 'food', 'runes'
]

function AdminMarket()
{
    const { t } = useTranslation('admin')
    const [items, setItems] = useState([]);
    const [response, setResponse] = useState(null);

    const { gameId } = useParams();

    useEffect(() =>
    {
        const loadItems = async () =>
        {
            const response = await Axios.get('/admin/markets?gameId=' + gameId);
            const data = response.data;
            setItems(data);
        }

        loadItems()

    }, [response]);

    const deleteItem = async (uuid) =>
    {
        console.log('deleting item')
        const response = await Axios.delete('/admin/deletemarket/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }


    const rows = items.map((item) =>
    {
        const hours = Math.round((new Date().getTime() - new Date(item.createdAt).getTime()) / 1000 / 60 / 60)
        return (
        <tr key={item.uuid}>
            <td>
                <Menu shadow="md" width={100} mt='xs' position='top'>
                    <Menu.Target>
                        <Button size='xs' compact><IconSettings size={14} /></Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<IconSettings size={14} />}>{t('menu.edit')}</Menu.Item>
                        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => deleteItem(item.uuid)}>{t('menu.delete')}</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </td>
            <td>
                {item.createdAt}
            </td>
            <td>
                {item.empire_id}
            </td>
            <td>
                {marketArray[item.type]}
            </td>
            <td>
                {item.amount.toLocaleString()}
            </td>
            <td>
                {item.price.toLocaleString()}
            </td>
            <td>
                {t('market.hoursOnMarket', { count: hours })}
            </td>
            <td>
                {item.conversationId}
            </td>
            <td>
                {item.secret.toString()}
            </td>
        </tr>
        )
    })

    return (
        <Stack>
            <Title>{t('pageTitle.market')}</Title>
            <Text color='red'>{response?.message}</Text>
            {items.length > 0 &&
                <div className={classes.guideTable}>

                    <Table striped>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('market.columns.createdAt')}</th>
                                <th>{t('market.columns.empireId')}</th>
                                <th>{t('market.columns.type')}</th>
                                <th>{t('market.columns.amount')}</th>
                                <th>{t('market.columns.price')}</th>
                                <th>{t('market.columns.timeOnMarket')}</th>
                                <th>{t('market.columns.conversationId')}</th>
                                <th>{t('market.columns.secret')}</th>
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

export default AdminMarket;
