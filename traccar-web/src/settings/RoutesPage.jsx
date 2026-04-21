import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import SearchHeader from './components/SearchHeader';
import { useTranslation } from '../common/components/LocalizationProvider';
import { fetchRoutes, deleteRoute } from '../store/routes';

const RoutesPage = () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const routes = useSelector((state) => Object.values(state.routes.items));
    const loading = useSelector((state) => state.routes.loading);

    const [filteredRoutes, setFilteredRoutes] = useState(routes);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        dispatch(fetchRoutes());
    }, [dispatch]);

    useEffect(() => {
        if (searchValue) {
            setFilteredRoutes(
                routes.filter((route) =>
                    route.name.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else {
            setFilteredRoutes(routes);
        }
    }, [routes, searchValue]);

    const handleDelete = (id) => {
        dispatch(deleteRoute(id));
    };

    return (
        <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedRoutes']}>
            <SearchHeader value={searchValue} onChange={setSearchValue} />
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('sharedName')}</TableCell>
                            <TableCell>{t('sharedDescription')}</TableCell>
                            <TableCell>{t('sharedStatus')}</TableCell>
                            <TableCell align="right">{t('sharedActions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRoutes.map((route) => (
                            <TableRow key={route.id}>
                                <TableCell>{route.name}</TableCell>
                                <TableCell>{route.description || '-'}</TableCell>
                                <TableCell>{route.active ? t('sharedYes') : t('sharedNo')}</TableCell>
                                <TableCell align="right">
                                    <CollectionActions
                                        itemId={route.id}
                                        editPath={`/settings/route/${route.id}`}
                                        onDelete={handleDelete}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
            <CollectionFab editPath="/settings/route" />
        </PageLayout>
    );
};

export default RoutesPage;
