import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from '../../common/components/LocalizationProvider';

const RouteCheckpointsManager = ({ routeId, onUpdate }) => {
    const t = useTranslation();
    const [checkpoints, setCheckpoints] = useState([]);
    const [allCheckpoints, setAllCheckpoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState('');

    // Cargar checkpoints de la ruta
    useEffect(() => {
        if (!routeId) return;

        const fetchCheckpoints = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/route-checkpoints?routeId=${routeId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCheckpoints(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Error loading checkpoints:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCheckpoints();
    }, [routeId]);

    // Cargar todos los checkpoints disponibles
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const response = await fetch('/api/checkpoints');
                if (response.ok) {
                    const data = await response.json();
                    setAllCheckpoints(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Error loading all checkpoints:', error);
            }
        };
        fetchAll();
    }, []);

    const handleAddCheckpoint = async () => {
        if (!selectedCheckpoint || !routeId) return;

        try {
            setLoading(true);
            const response = await fetch('/api/route-checkpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    routeId: parseInt(routeId),
                    checkpointId: parseInt(selectedCheckpoint),
                }),
            });

            if (response.ok) {
                // Recargar checkpoints
                const updatedResponse = await fetch(`/api/route-checkpoints?routeId=${routeId}`);
                if (updatedResponse.ok) {
                    const data = await updatedResponse.json();
                    setCheckpoints(Array.isArray(data) ? data : []);
                }
                setOpenDialog(false);
                setSelectedCheckpoint('');
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error adding checkpoint:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCheckpoint = async (checkpointId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/route-checkpoints/${checkpointId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCheckpoints(checkpoints.filter((cp) => cp.id !== checkpointId));
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Error removing checkpoint:', error);
        } finally {
            setLoading(false);
        }
    };

    const availableCheckpoints = allCheckpoints.filter(
        (cp) => !checkpoints.find((rc) => rc.checkpointId === cp.id)
    );

    return (
        <>
            <Stack spacing={2}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    disabled={loading}
                    size="small"
                >
                    {t('sharedAdd')} {t('sharedCheckpoint')}
                </Button>

                {checkpoints.length === 0 ? (
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                        {t('sharedNoData')}
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell width="5%">#</TableCell>
                                    <TableCell>{t('sharedName')}</TableCell>
                                    <TableCell width="15%">{t('sharedLatitude')}</TableCell>
                                    <TableCell width="15%">{t('sharedLongitude')}</TableCell>
                                    <TableCell align="center" width="10%">{t('sharedActions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {checkpoints.map((rc, index) => (
                                    <TableRow key={rc.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{rc.name || '-'}</TableCell>
                                        <TableCell>{rc.latitude}</TableCell>
                                        <TableCell>{rc.longitude}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveCheckpoint(rc.id)}
                                                disabled={loading}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>

            {/* Dialog para agregar checkpoint */}
            <Dialog open={openDialog} onClose={() => !loading && setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('sharedAdd')} {t('sharedCheckpoint')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 2 }}>
                        {availableCheckpoints.length === 0 ? (
                            <p>{t('sharedNoData')}</p>
                        ) : (
                            <FormControl fullWidth>
                                <InputLabel>{t('sharedCheckpoint')}</InputLabel>
                                <Select
                                    value={selectedCheckpoint}
                                    onChange={(e) => setSelectedCheckpoint(e.target.value)}
                                    label={t('sharedCheckpoint')}
                                >
                                    {availableCheckpoints.map((cp) => (
                                        <MenuItem key={cp.id} value={cp.id}>
                                            {cp.name} (Lat: {cp.latitude}, Lon: {cp.longitude})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} disabled={loading}>{t('sharedCancel')}</Button>
                    <Button
                        onClick={handleAddCheckpoint}
                        variant="contained"
                        disabled={!selectedCheckpoint || loading}
                    >
                        {t('sharedAdd')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RouteCheckpointsManager;
