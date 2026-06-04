import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    FormControlLabel,
    Switch,
    Box,
    Card,
    CardHeader,
    CardContent,
    Button,
    CircularProgress,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Stack,
    Tooltip,
    Chip,
    Container,
    Alert,
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
} from '@mui/lab';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';
import EditIcon from '@mui/icons-material/Edit';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import SettingsMenu from './components/SettingsMenu';
import PageLayout from '../common/components/PageLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import useSettingsStyles from './common/useSettingsStyles';
import {
    fetchRoutes,
    createRoute,
    updateRoute,
    fetchRouteCheckpoints,
    addCheckpointToRoute,
    removeCheckpointFromRoute,
} from '../store/routes';

const RoutePage = () => {
    const t = useTranslation();
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const route = useSelector((state) =>
        id ? state.routes.items[parseInt(id)] : null
    );
    const checkpoints = useSelector((state) =>
        id ? state.routes.checkpointsByRoute[id] || [] : []
    );
    const allCheckpoints = useSelector((state) =>
        Object.values(state.checkpoints.items || {})
    );

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true,
    });
    const [temporaryCheckpoints, setTemporaryCheckpoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addCheckpointOpen, setAddCheckpointOpen] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

    useEffect(() => {
        if (!id) {
            // Creating new route
            dispatch(fetchRoutes());
            setFormData({
                name: '',
                description: '',
                active: true,
            });
            setTemporaryCheckpoints([]);
        } else {
            // Editing existing route
            dispatch(fetchRoutes());
            dispatch(fetchRouteCheckpoints(parseInt(id)));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (route) {
            setFormData({
                name: route.name || '',
                description: route.description || '',
                active: route.active !== false,
            });
        }
    }, [route]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            let savedRoute;
            if (id) {
                const response = await fetch(`/api/routes/${parseInt(id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!response.ok) throw new Error('Error guardando ruta');
                savedRoute = await response.json();
            } else {
                const response = await fetch('/api/routes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (!response.ok) throw new Error('Error creando ruta');
                savedRoute = await response.json();

                // Add temporary checkpoints after route is created
                for (const checkpointId of temporaryCheckpoints) {
                    await fetch('/api/route-checkpoints', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            routeId: savedRoute.id,
                            checkpointId: checkpointId,
                        }),
                    });
                }
            }

            dispatch(fetchRoutes());
            navigate('/settings/routes');
        } catch (error) {
            console.error('Error guardando ruta:', error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Delete handled by parent component via EditItemView
    };

    const handleAddCheckpoint = async () => {
        if (!selectedCheckpoint) return;

        if (id) {
            // If route exists, add directly via API
            try {
                await dispatch(
                    addCheckpointToRoute({
                        routeId: parseInt(id),
                        checkpointId: selectedCheckpoint,
                    })
                ).unwrap();
            } catch (error) {
                console.error('Failed to add checkpoint:', error);
            }
        } else {
            // If new route, add to temporary list
            if (!temporaryCheckpoints.includes(selectedCheckpoint)) {
                setTemporaryCheckpoints([...temporaryCheckpoints, selectedCheckpoint]);
            }
        }
        setAddCheckpointOpen(false);
        setSelectedCheckpoint(null);
    };

    const handleRemoveCheckpoint = async (checkpointId, isTemporary = false) => {
        if (isTemporary) {
            setTemporaryCheckpoints(temporaryCheckpoints.filter((id) => id !== checkpointId));
        } else {
            try {
                await dispatch(removeCheckpointFromRoute(checkpointId)).unwrap();
            } catch (error) {
                console.error('Failed to remove checkpoint:', error);
            }
        }
    };

    // Get available checkpoints (not already in route)
    const getAvailableCheckpoints = () => {
        const usedIds = [...checkpoints.map((c) => c.checkpointId), ...temporaryCheckpoints];
        return allCheckpoints.filter((cp) => !usedIds.includes(cp.id));
    };

    const activeCheckpoints = id ? checkpoints : temporaryCheckpoints;
    const checkpointObjects = activeCheckpoints.map((item) =>
        typeof item === 'object' && item.checkpointId
            ? allCheckpoints.find((c) => c.id === item.checkpointId)
            : allCheckpoints.find((c) => c.id === item)
    ).filter(Boolean);

    return (
        <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedRoutes']}>
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Grid container spacing={3}>
                    {/* Form Section */}
                    <Grid item xs={12} md={id ? 6 : 12}>
                        <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
                            <CardHeader
                                title={t('sharedInfoTitle')}
                                avatar={<DirectionsIcon color="primary" />}
                                titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                                sx={{ pb: 1 }}
                            />
                            <CardContent>
                                <Stack spacing={2.5}>
                                    <TextField
                                        fullWidth
                                        label={t('sharedName')}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        required
                                        placeholder="Ej: Ruta de entrega sur"
                                        helperText={t('sharedRequired')}
                                    />
                                    <TextField
                                        fullWidth
                                        label={t('sharedDescription')}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        multiline
                                        rows={4}
                                        placeholder="Describe los detalles de la ruta..."
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="active"
                                                checked={formData.active}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight="500">
                                                    {t('sharedActive')}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formData.active ? 'La ruta está activa' : 'La ruta está inactiva'}
                                                </Typography>
                                            </Box>
                                        }
                                    />

                                    {!id && temporaryCheckpoints.length > 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                                            <Typography variant="body2">
                                                {temporaryCheckpoints.length} checkpoint(s) serán agregados después de crear la ruta
                                            </Typography>
                                        </Alert>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Checkpoints Section */}
                    <Grid item xs={12} md={id ? 6 : 12}>
                        <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MapIcon color="primary" />
                                        <Typography variant="h6" fontWeight="bold">
                                            {t('sharedCheckpoints')}
                                        </Typography>
                                        {checkpointObjects.length > 0 && (
                                            <Chip
                                                label={checkpointObjects.length}
                                                color="primary"
                                                variant="filled"
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                }
                                action={
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => setAddCheckpointOpen(true)}
                                        disabled={getAvailableCheckpoints().length === 0 || loading}
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
                                    >
                                        AGREGAR
                                    </Button>
                                }
                                sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '500px' }}>
                                {checkpointObjects.length === 0 ? (
                                    <Box sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                        <MapIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                        <Typography color="textSecondary" variant="body1" textAlign="center">
                                            {!id ? 'Sin checkpoints aún' : t('sharedNoData')}
                                        </Typography>
                                        <Typography color="textSecondary" variant="caption" textAlign="center" sx={{ mt: 1 }}>
                                            Agrega puntos de parada a la ruta
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Timeline position="right" sx={{ p: 0, m: 0 }}>
                                        {checkpointObjects.map((cp, index) => {
                                            const isStart = index === 0;
                                            const isEnd = index === checkpointObjects.length - 1;

                                            let dotColor = 'primary';
                                            let dotIcon = <LocationOnIcon sx={{ fontSize: 16 }} />;
                                            if (isStart) {
                                                dotColor = 'success';
                                                dotIcon = <FlagIcon sx={{ fontSize: 16 }} />;
                                            } else if (isEnd) {
                                                dotColor = 'error';
                                                dotIcon = <FlagIcon sx={{ fontSize: 16 }} />;
                                            }

                                            const isTemporary = !id && temporaryCheckpoints.includes(cp?.id);
                                            const checkpointId = isTemporary ? cp?.id : (activeCheckpoints[index]?.id);

                                            return (
                                                <TimelineItem key={cp?.id} sx={{ minHeight: '90px', '&::before': { display: 'none' } }}>
                                                    <TimelineSeparator>
                                                        <TimelineDot color={dotColor} sx={{ p: 0.75, my: 0 }}>
                                                            {dotIcon}
                                                        </TimelineDot>
                                                        {!isEnd && <TimelineConnector sx={{ minHeight: '40px' }} />}
                                                    </TimelineSeparator>
                                                    <TimelineContent sx={{ py: 0, px: 2, flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                    <DragIndicatorIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                                        {cp?.name || 'Sin nombre'}
                                                                    </Typography>
                                                                    {isTemporary && (
                                                                        <Chip
                                                                            label="Temporal"
                                                                            size="small"
                                                                            variant="outlined"
                                                                            color="warning"
                                                                        />
                                                                    )}
                                                                </Box>
                                                                <Box sx={{ pl: 3 }}>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        <strong>Lat:</strong> {cp?.latitude?.toFixed(4)}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                                        <strong>Lon:</strong> {cp?.longitude?.toFixed(4)}
                                                                    </Typography>
                                                                    {cp?.description && (
                                                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                                            {cp.description}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                            <Tooltip title={t('sharedRemove')}>
                                                                <IconButton
                                                                    edge="end"
                                                                    color="error"
                                                                    size="small"
                                                                    onClick={() => handleRemoveCheckpoint(checkpointId, isTemporary)}
                                                                    sx={{ mt: 0.5 }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            );
                                        })}
                                    </Timeline>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Centered Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 3 }}>
                    <Button
                        color="primary"
                        variant="outlined"
                        onClick={() => navigate('/settings/routes')}
                        disabled={loading}
                        sx={{ minWidth: '150px' }}
                    >
                        CANCELAR
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading || !formData.name}
                        sx={{ minWidth: '150px' }}
                    >
                        {loading ? 'Guardando...' : 'GUARDAR'}
                    </Button>
                </Box>
            </Container>

            <Dialog
                open={addCheckpointOpen}
                onClose={() => {
                    setAddCheckpointOpen(false);
                    setSelectedCheckpoint(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>Agregar Checkpoint a la Ruta</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {getAvailableCheckpoints().length === 0 ? (
                            <Alert severity="warning">
                                No hay checkpoints disponibles. Crea algunos primero en la sección de Checkpoints.
                            </Alert>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel id="checkpoint-select-label">
                                    {t('sharedCheckpoint')}
                                </InputLabel>
                                <Select
                                    labelId="checkpoint-select-label"
                                    value={selectedCheckpoint || ''}
                                    label={t('sharedCheckpoint')}
                                    onChange={(e) => setSelectedCheckpoint(e.target.value)}
                                >
                                    {getAvailableCheckpoints().map((cp) => (
                                        <MenuItem key={cp.id} value={cp.id}>
                                            <Box>
                                                <Typography variant="body2">{cp.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    ({cp.latitude?.toFixed(4)}, {cp.longitude?.toFixed(4)})
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setAddCheckpointOpen(false);
                            setSelectedCheckpoint(null);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleAddCheckpoint}
                        variant="contained"
                        disabled={!selectedCheckpoint}
                    >
                        Agregar
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
};

export default RoutePage;
