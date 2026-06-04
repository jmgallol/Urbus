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
    Chip,
    IconButton,
    Tooltip,
    Box,
    Container,
    Typography,
    TableContainer,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import SearchHeader from './components/SearchHeader';
import { useTranslation } from '../common/components/LocalizationProvider';
import { fetchRoutes, deleteRoute } from '../store/routes';
import useSettingsStyles from './common/useSettingsStyles';

const RoutesPage = () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { classes } = useSettingsStyles();

    const routesMap = useSelector((state) => state.routes.items);
    const loading = useSelector((state) => state.routes.loading);

    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        dispatch(fetchRoutes());
    }, [dispatch]);

    useEffect(() => {
        const routes = Object.values(routesMap || {});
        if (searchValue) {
            setFilteredRoutes(
                routes.filter((route) =>
                    route.name.toLowerCase().includes(searchValue.toLowerCase())
                )
            );
        } else {
            setFilteredRoutes(routes);
        }
    }, [routesMap, searchValue]);

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta ruta?')) {
            dispatch(deleteRoute(id));
        }
    };

    const handleEdit = (id) => {
        navigate(`/settings/route/${id}`);
    };

    return (
        <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedRoutes']}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <SearchHeader value={searchValue} onChange={setSearchValue} />
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        boxShadow: 1,
                        mb: 4,
                        overflow: 'auto',
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        backgroundColor: '#fafafa',
                                        borderBottom: '2px solid #e0e0e0',
                                    }}
                                >
                                    {t('sharedName')}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        backgroundColor: '#fafafa',
                                        borderBottom: '2px solid #e0e0e0',
                                    }}
                                >
                                    {t('sharedDescription')}
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        backgroundColor: '#fafafa',
                                        borderBottom: '2px solid #e0e0e0',
                                        width: '120px',
                                    }}
                                >
                                    Activa
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        backgroundColor: '#fafafa',
                                        borderBottom: '2px solid #e0e0e0',
                                        width: '120px',
                                    }}
                                >
                                    {t('sharedActions')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRoutes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <Typography color="textSecondary" variant="body2">
                                            {searchValue
                                                ? 'No se encontraron rutas con ese criterio'
                                                : 'No hay rutas aún. Crea una nueva.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRoutes.map((route) => (
                                    <TableRow
                                        key={route.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#fafafa',
                                            },
                                            borderBottom: '1px solid #e0e0e0',
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                fontWeight: 500,
                                                py: 1.5,
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight="600">
                                                {route.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, maxWidth: '300px' }}>
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {route.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <Chip
                                                label={route.active ? 'Activa' : 'Inactiva'}
                                                color={route.active ? 'success' : 'default'}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(route.id)}
                                                        sx={{
                                                            color: 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(route.id)}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
            <CollectionFab editPath="/settings/route" />
        </PageLayout>
    );
};

export default RoutesPage;
