import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import { useTranslation } from '../common/components/LocalizationProvider';
import { fetchRoutes, deleteRoute, createRoute, updateRoute, fetchRouteCheckpoints, addCheckpointToRoute, removeCheckpointFromRoute } from '../store/routes';

const RoutesReportPage = () => {
    const t = useTranslation();
    const dispatch = useDispatch();

    const routes = useSelector((state) => Object.values(state.routes.items));
    const checkpoints = useSelector((state) => state.checkpoints.items);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addCheckpointOpen, setAddCheckpointOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', active: true });
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' o 'detail'

    useEffect(() => {
        dispatch(fetchRoutes());
    }, [dispatch]);

    useEffect(() => {
        if (selectedRoute) {
            dispatch(fetchRouteCheckpoints(selectedRoute.id));
        }
    }, [selectedRoute, dispatch]);

    const routeCheckpoints = useSelector((state) =>
        selectedRoute ? state.routes.checkpointsByRoute[selectedRoute.id] || [] : []
    );

    const filteredRoutes = routes.filter((route) =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableCheckpoints = Object.values(checkpoints).filter(
        (cp) => !routeCheckpoints.find((rc) => rc.checkpointId === cp.id)
    );

    const handleCreate = () => {
        setFormData({ name: '', description: '', active: true });
        setEditDialogOpen(true);
    };

    const handleEdit = (route) => {
        setSelectedRoute(route);
        setFormData({ name: route.name, description: route.description, active: route.active });
        setEditDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;

        if (selectedRoute) {
            await dispatch(updateRoute({ id: selectedRoute.id, ...formData }));
        } else {
            await dispatch(createRoute(formData));
        }
        setEditDialogOpen(false);
        setSelectedRoute(null);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('sharedConfirmDelete'))) {
            dispatch(deleteRoute(id));
            if (selectedRoute?.id === id) {
                setSelectedRoute(null);
                setViewMode('list');
            }
        }
    };

    const handleAddCheckpoint = async () => {
        if (!selectedCheckpoint || !selectedRoute) return;

        await dispatch(
            addCheckpointToRoute({
                routeId: selectedRoute.id,
                checkpointId: selectedCheckpoint,
            })
        );
        dispatch(fetchRouteCheckpoints(selectedRoute.id));
        setAddCheckpointOpen(false);
        setSelectedCheckpoint(null);
    };

    const handleRemoveCheckpoint = async (checkpointId) => {
        await dispatch(removeCheckpointFromRoute(checkpointId));
        dispatch(fetchRouteCheckpoints(selectedRoute.id));
    };

    if (viewMode === 'detail' && selectedRoute) {
        return (
            <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedRoutes']}>
                <Box sx={{ p: 2 }}>
                    <Button onClick={() => setViewMode('list')} sx={{ mb: 2 }}>
                        ← {t('sharedBack')}
                    </Button>
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <h2>{selectedRoute.name}</h2>
                        <p>{selectedRoute.description}</p>
                        <p>{t('sharedStatus')}: {selectedRoute.active ? t('sharedYes') : t('sharedNo')}</p>
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <h3>{t('sharedCheckpoints')}</h3>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setAddCheckpointOpen(true)}
                                disabled={availableCheckpoints.length === 0}
                            >
                                {t('sharedAdd')}
                            </Button>
                        </Box>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>{t('sharedName')}</TableCell>
                                    <TableCell>{t('sharedLatitude')}</TableCell>
                                    <TableCell>{t('sharedLongitude')}</TableCell>
                                    <TableCell align="right">{t('sharedActions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {routeCheckpoints.map((rc, index) => {
                                    const cp = checkpoints[rc.checkpointId];
                                    return (
                                        <TableRow key={rc.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cp?.name || 'Unknown'}</TableCell>
                                            <TableCell>{cp?.latitude}</TableCell>
                                            <TableCell>{cp?.longitude}</TableCell>
                                            <TableCell align="right">
                                                <DeleteIcon
                                                    sx={{ cursor: 'pointer', color: 'error.main' }}
                                                    onClick={() => handleRemoveCheckpoint(rc.id)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Paper>

                    <Dialog open={addCheckpointOpen} onClose={() => setAddCheckpointOpen(false)}>
                        <DialogTitle>{t('sharedSelectCheckpoint')}</DialogTitle>
                        <DialogContent sx={{ minWidth: '300px', pt: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>{t('sharedCheckpoint')}</InputLabel>
                                <Select
                                    value={selectedCheckpoint || ''}
                                    label={t('sharedCheckpoint')}
                                    onChange={(e) => setSelectedCheckpoint(e.target.value)}
                                >
                                    {availableCheckpoints.map((cp) => (
                                        <MenuItem key={cp.id} value={cp.id}>
                                            {cp.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAddCheckpointOpen(false)}>{t('sharedCancel')}</Button>
                            <Button onClick={handleAddCheckpoint} variant="contained" disabled={!selectedCheckpoint}>
                                {t('sharedAdd')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedRoutes']}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        placeholder={t('sharedSearch')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                        {t('sharedAdd')}
                    </Button>
                </Box>

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
                                <TableRow
                                    key={route.id}
                                    onClick={() => {
                                        setSelectedRoute(route);
                                        setViewMode('detail');
                                    }}
                                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                >
                                    <TableCell>{route.name}</TableCell>
                                    <TableCell>{route.description || '-'}</TableCell>
                                    <TableCell>{route.active ? t('sharedYes') : t('sharedNo')}</TableCell>
                                    <TableCell align="right">
                                        <EditIcon
                                            sx={{ cursor: 'pointer', mr: 1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(route);
                                            }}
                                        />
                                        <DeleteIcon
                                            sx={{ cursor: 'pointer', color: 'error.main' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(route.id);
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>

                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>{selectedRoute ? t('sharedEdit') : t('sharedAdd')}</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label={t('sharedName')}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label={t('sharedDescription')}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>{t('sharedCancel')}</Button>
                        <Button onClick={handleSave} variant="contained">
                            {t('sharedSave')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </PageLayout>
    );
};

export default RoutesReportPage;
