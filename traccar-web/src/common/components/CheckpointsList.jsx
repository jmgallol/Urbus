import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
    Card,
    CardHeader,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import { deleteCheckpoint } from '../../store/checkpoints';

const useStyles = makeStyles()((theme) => ({
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRadius: '16px',
    },
    header: {
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        padding: theme.spacing(2),
        borderRadius: '16px 16px 0 0',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        fontWeight: 700,
        fontSize: '1.1rem',
    },
    routeBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        marginTop: theme.spacing(0.5),
        opacity: 0.85,
        fontSize: '0.8rem',
    },
    tableContainer: {
        flex: 1,
        overflow: 'auto',
    },
    table: {
        '& .MuiTableCell-head': {
            backgroundColor: theme.palette.primary.light + '20',
            fontWeight: 600,
            color: theme.palette.text.primary,
            borderBottom: `2px solid ${theme.palette.primary.main}`,
        },
        '& .MuiTableRow-root:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    nameCell: {
        fontWeight: 600,
        color: theme.palette.primary.main,
    },
    coordCell: {
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        color: theme.palette.text.secondary,
    },
    radiusCell: {
        fontWeight: 500,
    },
    actionsCell: {
        display: 'flex',
        gap: theme.spacing(0.5),
    },
    iconButton: {
        padding: theme.spacing(0.75),
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4),
        color: theme.palette.text.secondary,
        gap: theme.spacing(1),
    },
    emptyIcon: {
        fontSize: '3rem',
        opacity: 0.5,
    },
    loadingState: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(4),
    },
    deleteDialog: {
        '& .MuiDialog-paper': {
            borderRadius: '16px',
        },
    },
    deleteButton: {
        backgroundColor: theme.palette.error.main,
        color: '#FFFFFF',
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
        },
    },
}));

const CheckpointsList = ({ onEdit, deviceId }) => {
    const { classes } = useStyles();
    const dispatch = useDispatch();

    const allCheckpoints = useSelector((state) => state.checkpoints.items);
    const routes = useSelector((state) => state.routes.items);

    const [filteredCheckpointIds, setFilteredCheckpointIds] = useState(null); // null = sin filtro (mostrar todos)
    const [assignedRouteId, setAssignedRouteId] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        checkpoint: null,
    });

    // Cuando cambia el dispositivo seleccionado, cargar su ruta asignada y los checkpoints de esa ruta
    useEffect(() => {
        if (!deviceId) {
            // Sin dispositivo seleccionado → mostrar todos
            setFilteredCheckpointIds(null);
            setAssignedRouteId(null);
            return;
        }

        let cancelled = false;
        setLoadingRoute(true);

        const loadDeviceRoute = async () => {
            try {
                // 1. Obtener la ruta asignada al dispositivo
                const deviceRoutesRes = await fetch(`/api/device-routes?deviceId=${deviceId}`);
                if (!deviceRoutesRes.ok || cancelled) return;
                const deviceRoutes = await deviceRoutesRes.json();

                if (!deviceRoutes || deviceRoutes.length === 0) {
                    // Dispositivo sin ruta → mostrar todos
                    if (!cancelled) {
                        setFilteredCheckpointIds(null);
                        setAssignedRouteId(null);
                    }
                    return;
                }

                // Tomar la asignación más reciente (último elemento)
                const latestAssignment = deviceRoutes[deviceRoutes.length - 1];
                const routeId = latestAssignment.routeId;

                if (!cancelled) setAssignedRouteId(routeId);

                // 2. Obtener los checkpoints de esa ruta
                const routeCpRes = await fetch(`/api/route-checkpoints?routeId=${routeId}`);
                if (!routeCpRes.ok || cancelled) return;
                const routeCheckpoints = await routeCpRes.json();

                if (!cancelled) {
                    const ids = new Set(routeCheckpoints.map((rc) => rc.checkpointId));
                    setFilteredCheckpointIds(ids);
                }
            } catch (e) {
                // En caso de error, mostrar todos
                if (!cancelled) {
                    setFilteredCheckpointIds(null);
                    setAssignedRouteId(null);
                }
            } finally {
                if (!cancelled) setLoadingRoute(false);
            }
        };

        loadDeviceRoute();
        return () => { cancelled = true; };
    }, [deviceId]);

    const handleDeleteClick = (checkpoint) => {
        setDeleteDialog({ open: true, checkpoint });
    };

    const handleDeleteConfirm = async () => {
        if (deleteDialog.checkpoint) {
            dispatch(deleteCheckpoint(deleteDialog.checkpoint.id));
            setDeleteDialog({ open: false, checkpoint: null });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, checkpoint: null });
    };

    const handleEditClick = (checkpoint) => {
        onEdit(checkpoint);
    };

    // Determinar la lista a mostrar
    const allCheckpointsList = Object.values(allCheckpoints);
    const checkpointsList = filteredCheckpointIds
        ? allCheckpointsList.filter((cp) => filteredCheckpointIds.has(cp.id))
        : allCheckpointsList;

    const assignedRoute = assignedRouteId ? routes[assignedRouteId] : null;

    const headerSubtitle = assignedRoute ? (
        <Box className={classes.routeBadge}>
            <RouteIcon sx={{ fontSize: '0.9rem' }} />
            <span>{assignedRoute.name}</span>
        </Box>
    ) : null;

    return (
        <>
            <Card className={classes.card}>
                <CardHeader
                    className={classes.header}
                    title={
                        <Box>
                            <Box className={classes.headerTitle}>
                                <LocationOnIcon />
                                <span>
                                    Checkpoints ({checkpointsList.length})
                                </span>
                            </Box>
                            {headerSubtitle}
                        </Box>
                    }
                />

                <CardContent style={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {loadingRoute ? (
                        <Box className={classes.loadingState}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : checkpointsList.length === 0 ? (
                        <Box className={classes.emptyState}>
                            <LocationOnIcon className={classes.emptyIcon} />
                            {filteredCheckpointIds !== null ? (
                                <>
                                    <Typography>Sin checkpoints en esta ruta</Typography>
                                    <Typography variant="body2">
                                        Agrega checkpoints a la ruta desde Configuración
                                    </Typography>
                                </>
                            ) : (
                                <>
                                    <Typography>Sin checkpoints creados</Typography>
                                    <Typography variant="body2">
                                        Haz clic derecho en el mapa para agregar uno
                                    </Typography>
                                </>
                            )}
                        </Box>
                    ) : (
                        <TableContainer className={classes.tableContainer}>
                            <Table className={classes.table} stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell align="center">Ubicación</TableCell>
                                        <TableCell align="center">Radio (m)</TableCell>
                                        <TableCell align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {checkpointsList.map((checkpoint) => (
                                        <TableRow key={checkpoint.id}>
                                            <TableCell className={classes.nameCell}>
                                                {checkpoint.name}
                                            </TableCell>
                                            <TableCell align="center" className={classes.coordCell}>
                                                {checkpoint.latitude.toFixed(4)}, {checkpoint.longitude.toFixed(4)}
                                            </TableCell>
                                            <TableCell align="center" className={classes.radiusCell}>
                                                <Chip
                                                    label={`${checkpoint.radius || 50}m`}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box className={classes.actionsCell}>
                                                    <IconButton
                                                        size="small"
                                                        className={classes.iconButton}
                                                        onClick={() => handleEditClick(checkpoint)}
                                                        title="Editar"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        className={classes.iconButton}
                                                        onClick={() => handleDeleteClick(checkpoint)}
                                                        title="Eliminar"
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleDeleteCancel}
                className={classes.deleteDialog}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Está seguro de que desea eliminar el checkpoint{' '}
                        <strong>{deleteDialog.checkpoint?.name}</strong>?
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancelar</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        className={classes.deleteButton}
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CheckpointsList;

