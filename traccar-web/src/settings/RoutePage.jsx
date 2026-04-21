import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    Container,
    Paper,
    Button,
    CircularProgress,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import EditItemView from './components/EditItemView';
import { useTranslation } from '../common/components/LocalizationProvider';
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
        Object.values(state.checkpoints.items)
    );

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true,
    });
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
            if (id) {
                await dispatch(
                    updateRoute({
                        id: parseInt(id),
                        ...formData,
                    })
                ).unwrap();
            } else {
                const result = await dispatch(createRoute(formData)).unwrap();
                navigate(`/settings/route/${result.id}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        // Delete handled by parent component via EditItemView
    };

    const handleAddCheckpoint = async () => {
        if (!selectedCheckpoint || !id) return;

        try {
            await dispatch(
                addCheckpointToRoute({
                    routeId: parseInt(id),
                    checkpointId: selectedCheckpoint,
                })
            ).unwrap();
            setAddCheckpointOpen(false);
            setSelectedCheckpoint(null);
        } catch (error) {
            console.error('Failed to add checkpoint:', error);
        }
    };

    const handleRemoveCheckpoint = async (checkpointId) => {
        try {
            await dispatch(removeCheckpointFromRoute(checkpointId)).unwrap();
        } catch (error) {
            console.error('Failed to remove checkpoint:', error);
        }
    };

    // Get available checkpoints (not already in route)
    const availableCheckpoints = allCheckpoints.filter(
        (cp) => !checkpoints.find((rc) => rc.checkpointId === cp.id)
    );

    return (
        <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedRoutes']}>
            <EditItemView
                item={id ? route : null}
                onSave={handleSave}
                onDelete={handleDelete}
                loading={loading}
            >
                <Container maxWidth="sm">
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <TextField
                            fullWidth
                            label={t('sharedName')}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            margin="normal"
                            disabled={loading}
                        />
                        <TextField
                            fullWidth
                            label={t('sharedDescription')}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            multiline
                            rows={3}
                            disabled={loading}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            }
                            label={t('sharedActive')}
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    {id && (
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{t('sharedCheckpoints')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    {checkpoints.length === 0 ? (
                                        <Typography color="textSecondary" sx={{ mb: 2 }}>
                                            {t('sharedNoData')}
                                        </Typography>
                                    ) : (
                                        <List sx={{ mb: 2 }}>
                                            {checkpoints.map((rc, index) => {
                                                const cp = allCheckpoints.find(
                                                    (c) => c.id === rc.checkpointId
                                                );
                                                return (
                                                    <ListItem
                                                        key={rc.id}
                                                        secondaryAction={
                                                            <IconButton
                                                                edge="end"
                                                                onClick={() =>
                                                                    handleRemoveCheckpoint(rc.id)
                                                                }
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        }
                                                    >
                                                        <ListItemText
                                                            primary={`${index + 1}. ${cp?.name || 'Unknown'}`}
                                                            secondary={`${t('sharedLatitude')}: ${cp?.latitude}, ${t('sharedLongitude')}: ${cp?.longitude}`}
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    )}
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => setAddCheckpointOpen(true)}
                                        disabled={availableCheckpoints.length === 0}
                                        variant="outlined"
                                    >
                                        {t('sharedAdd')}
                                    </Button>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )}

                    <Dialog open={addCheckpointOpen} onClose={() => setAddCheckpointOpen(false)}>
                        <DialogTitle>{t('sharedSelectCheckpoint')}</DialogTitle>
                        <DialogContent>
                            <Box sx={{ pt: 2, minWidth: '300px' }}>
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
                                        {availableCheckpoints.map((cp) => (
                                            <MenuItem key={cp.id} value={cp.id}>
                                                {cp.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAddCheckpointOpen(false)}>
                                {t('sharedCancel')}
                            </Button>
                            <Button
                                onClick={handleAddCheckpoint}
                                variant="contained"
                                disabled={!selectedCheckpoint}
                            >
                                {t('sharedAdd')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </EditItemView>
        </PageLayout>
    );
};

export default RoutePage;
