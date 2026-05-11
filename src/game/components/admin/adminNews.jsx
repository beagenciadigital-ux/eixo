import { Table, Text, Button, Title, Menu, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { IconSettings, IconTrash } from '@tabler/icons-react'
import classes from './guide.module.css'
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminNews()
{
    const { t } = useTranslation('admin')
    const [items, setItems] = useState([]);
    const [response, setResponse] = useState(null);
    const { gameId } = useParams();

    useEffect(() =>
    {
        const loadItems = async () =>
        {
            const response = await Axios.get('/admin/news?gameId=' + gameId);
            const data = response.data;
            setItems(data);
        }

        loadItems()

    }, [response]);

    const deleteItem = async (uuid) =>
    {
        console.log('deleting item')
        const response = await Axios.delete('/admin/deletenews/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }


    const rows = items.map((item) =>
    (
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
                {item.type}
            </td>
            <td>
                {item.result}
            </td>
            <td>
                {item.sourceName}
            </td>
            <td>
                {item.empireIdSource}
            </td>
            <td>
                {item.destinationName}
            </td>
            <td>
                {item.empireIdDestination}
            </td>
            <td>
                {item.personalContent}
            </td>
            <td>
                {item.publicContent}
            </td>
        </tr>
    ))

    return (
        <Stack>
            <Title>{t('pageTitle.news')}</Title>
            <Text color='red'>{response?.message}</Text>
            {items.length > 0 &&
                <div className={classes.guideTable}>

                    <Table striped>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('news.columns.createdAt')}</th>
                                <th>{t('news.columns.type')}</th>
                                <th>{t('news.columns.result')}</th>
                                <th>{t('news.columns.sourceName')}</th>
                                <th>{t('news.columns.sourceId')}</th>
                                <th>{t('news.columns.destinationName')}</th>
                                <th>{t('news.columns.destinationId')}</th>
                                <th>{t('news.columns.personalContent')}</th>
                                <th>{t('news.columns.publicContent')}</th>
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

export default AdminNews;
