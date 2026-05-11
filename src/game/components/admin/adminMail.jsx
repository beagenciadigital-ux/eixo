import { Table, Text, Button, Title, Menu, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { IconSettings, IconTrash } from '@tabler/icons-react'
import classes from './guide.module.css'
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminMail()
{
    const { t } = useTranslation('admin')
    const [items, setItems] = useState([]);
    const [response, setResponse] = useState(null);

    const { gameId } = useParams()

    useEffect(() =>
    {
        const loadItems = async () =>
        {
            const response = await Axios.get('/admin/mail?gameId=' + gameId);
            const data = response.data;
            setItems(data);
        }

        loadItems()

    }, [response]);

    const deleteItem = async (uuid) =>
    {
        console.log('deleting item')
        const response = await Axios.delete('/admin/deletemail/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }

    const toggleReport = async (uuid) =>
    {
        console.log('toggling report')
        const response = await Axios.get('/messages/togglereport/' + uuid);
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
                        <Menu.Item icon={<IconSettings size={14} />} onClick={() => toggleReport(item.uuid)}>{t('menu.report')}</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </td>
            <td>
                {item.createdAt}
            </td>
            <td>
                {item.messageFlags}
            </td>
            <td>
                {item.empireIdSource}
            </td>
            <td>
                {item.empireSourceName}
            </td>
            <td>
                {item.empireIdDestination}
            </td>
            <td>
                {item.empireDestinationName}
            </td>
            <td>
                {item.messageBody}
            </td>
            <td>
                {item.conversationId}
            </td>
            <td>
                {item.seen.toString()}
            </td>
        </tr>
    ))

    return (
        <Stack>
            <Title>{t('pageTitle.mail')}</Title>
            <Text color='red'>{response?.message}</Text>
            {items.length > 0 &&
                <div className={classes.guideTable}>

                    <Table striped>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('mail.columns.createdAt')}</th>
                                <th>{t('mail.columns.reported')}</th>
                                <th>{t('mail.columns.sourceEmpireId')}</th>
                                <th>{t('mail.columns.sourceEmpireName')}</th>
                                <th>{t('mail.columns.destinationEmpireId')}</th>
                                <th>{t('mail.columns.destinationEmpireName')}</th>
                                <th>{t('mail.columns.messageBody')}</th>
                                <th>{t('mail.columns.conversationId')}</th>
                                <th>{t('mail.columns.seen')}</th>
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

export default AdminMail;
