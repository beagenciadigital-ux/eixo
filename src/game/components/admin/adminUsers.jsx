import { Table, Text, Button, Title, Menu, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import Axios from 'axios';
import { IconSettings, IconTrash } from '@tabler/icons-react'
import classes from './guide.module.css'
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AdminUsers()
{
    const { t } = useTranslation('admin')
    const [users, setUsers] = useState([]);
    const [response, setResponse] = useState(null);

    const { gameId } = useParams();

    useEffect(() =>
    {
        const loadUsers = async () =>
        {
            const response = await Axios.get(`/admin/users?gameId=${gameId}`);
            const data = response.data;
            setUsers(data);
        }

        loadUsers()

    }, [response]);

    const deleteUser = async (uuid) =>
    {
        console.log('deleting user')
        const response = await Axios.delete('/admin/deleteuser/' + uuid);
        const data = response.data;
        console.log(data);
        setResponse(data);
    }


    const rows = users.map((user) =>
    (
        <tr key={user.uuid}>
            <td>
                <Menu shadow="md" width={100} mt='xs' position='top'>
                    <Menu.Target>
                        <Button size='xs' compact><IconSettings size={14} /></Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item icon={<IconSettings size={14} />}>{t('menu.edit')}</Menu.Item>
                        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => deleteUser(user.uuid)}>{t('menu.delete')}</Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </td>
            <td>
                {user.role}
            </td>
            <td>
                {user.username}
            </td>
            <td>
                {user.email}
            </td>
            <td>
                {user.lastIp}
            </td>
            <td>
                {user.createdAt}
            </td>
            <td>
                {user.empires[0]?.name}
            </td>
            <td>
                {user.empires[0]?.id}
            </td>
        </tr>
    ))

    return (
        <Stack>
            <Title>{t('pageTitle.users')}</Title>
            <Text color='red'>{response?.message}</Text>
            {users.length > 0 &&
                <div className={classes.guideTable}>

                    <Table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('users.columns.role')}</th>
                                <th>{t('users.columns.username')}</th>
                                <th>{t('users.columns.email')}</th>
                                <th>{t('users.columns.lastIp')}</th>
                                <th>{t('users.columns.createdAt')}</th>
                                <th>{t('users.columns.empireName')}</th>
                                <th>{t('users.columns.empireId')}</th>
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

export default AdminUsers;
