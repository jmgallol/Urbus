import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Stack,
    Typography,
    InputAdornment,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const useStyles = makeStyles()((theme) => ({
    dialog: {
        '& .MuiDialog-paper': {
            borderRadius: '16px',
        },
    },
    title: {
        fontWeight: 700,
        color: theme.palette.primary.main,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    coordsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing(1.5),
    },
    coordsLabel: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(0.5),
    },
    note: {
        padding: theme.spacing(1.5),
        backgroundColor: theme.palette.primary.light + '20',
        borderRadius: '8px',
        borderLeft: `3px solid ${theme.palette.primary.main}`,
    },
    noteText: {
        fontSize: '0.85rem',
        color: theme.palette.text.secondary,
    },
    actions: {
        display: 'flex',
        gap: theme.spacing(1),
        justifyContent: 'flex-end',
    },
    button: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
    },
    submitButton: {
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    },
}));

const CheckpointForm = ({ open, onClose, onSubmit, checkpoint = null, mapLocation = null }) => {
    const { classes } = useStyles();
    const user = useSelector((state) => state.session.user);

    const [formData, setFormData] = useState({
        name: checkpoint?.name || '',
        latitude: mapLocation?.latitude || checkpoint?.latitude || '',
        longitude: mapLocation?.longitude || checkpoint?.longitude || '',
        description: checkpoint?.description || '',
        radius: checkpoint?.radius || 50,
        groupId: checkpoint?.groupId || user?.groupId || 0,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setFormData({
                name: checkpoint?.name || '',
                latitude: mapLocation?.latitude || checkpoint?.latitude || '',
                longitude: mapLocation?.longitude || checkpoint?.longitude || '',
                description: checkpoint?.description || '',
                radius: checkpoint?.radius || 50,
                groupId: checkpoint?.groupId || user?.groupId || 0,
            });
            setErrors({});
        }
    }, [open, checkpoint, mapLocation, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'radius' || name === 'latitude' || name === 'longitude'
                ? parseFloat(value) || ''
                : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
        if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
            newErrors.latitude = 'Latitud inválida (-90 a 90)';
        }
        if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) {
            newErrors.longitude = 'Longitud inválida (-180 a 180)';
        }
        if (!formData.radius || formData.radius < 10) {
            newErrors.radius = 'Radio mínimo: 10m';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = () => {
        if (validate()) {
            onSubmit(formData);
            handleDialogClose();
        }
    };

    const handleDialogClose = () => {
        setFormData({
            name: checkpoint?.name || '',
            latitude: mapLocation?.latitude || checkpoint?.latitude || '',
            longitude: mapLocation?.longitude || checkpoint?.longitude || '',
            description: checkpoint?.description || '',
            radius: checkpoint?.radius || 50,
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth className={classes.dialog}>
            <DialogTitle className={classes.title}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon />
                    {checkpoint ? 'Editar Checkpoint' : 'Nuevo Checkpoint'}
                </Box>
            </DialogTitle>

            <DialogContent>
                <Stack className={classes.form} sx={{ pt: 2 }}>
                    <TextField
                        label="Nombre del Paradero"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Ej: Centro Comercial, Estación..."
                        error={!!errors.name}
                        helperText={errors.name}
                        variant="outlined"
                        size="small"
                    />

                    <TextField
                        label="Descripción"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Descripción opcional del paradero"
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                    />

                    <Box>
                        <Typography className={classes.coordsLabel}>Ubicación en el Mapa</Typography>
                        <Box className={classes.coordsContainer}>
                            <TextField
                                label="Latitud"
                                name="latitude"
                                type="number"
                                value={formData.latitude}
                                onChange={handleChange}
                                inputProps={{ step: '0.0001', min: -90, max: 90 }}
                                error={!!errors.latitude}
                                helperText={errors.latitude || ''}
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">°N</InputAdornment>,
                                }}
                            />
                            <TextField
                                label="Longitud"
                                name="longitude"
                                type="number"
                                value={formData.longitude}
                                onChange={handleChange}
                                inputProps={{ step: '0.0001', min: -180, max: 180 }}
                                error={!!errors.longitude}
                                helperText={errors.longitude || ''}
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">°E</InputAdornment>,
                                }}
                            />
                        </Box>
                    </Box>

                    <TextField
                        label="Radio de Proximidad (metros)"
                        name="radius"
                        type="number"
                        value={formData.radius}
                        onChange={handleChange}
                        fullWidth
                        inputProps={{ min: 10, max: 500, step: 10 }}
                        error={!!errors.radius}
                        helperText={errors.radius || 'Distancia para detectar llegada'}
                        variant="outlined"
                        size="small"
                    />

                    <Box className={classes.note}>
                        <Typography className={classes.noteText}>
                            💡 <strong>Tip:</strong> Haz clic derecho en el mapa y selecciona "Agregar Checkpoint"
                            para establecer la ubicación automáticamente.
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions className={classes.actions} sx={{ p: 2 }}>
                <Button onClick={handleDialogClose} className={classes.button}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleFormSubmit}
                    variant="contained"
                    className={`${classes.button} ${classes.submitButton}`}
                >
                    {checkpoint ? 'Actualizar' : 'Crear'} Checkpoint
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CheckpointForm;
