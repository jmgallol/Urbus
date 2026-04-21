import { useState, useEffect } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
    Snackbar,
    Alert,
    Box,
    Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const useStyles = makeStyles()((theme) => ({
    snackbar: {
        '& .MuiSnackbarContent-root': {
            backgroundColor: theme.palette.success.light,
            borderLeft: `4px solid ${theme.palette.success.main}`,
        },
    },
    alert: {
        width: '100%',
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark || '#0F172A',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
    },
    iconContainer: {
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'center',
        minWidth: '60px',
    },
    icon: {
        fontSize: '28px',
    },
    content: {
        flex: 1,
    },
    message: {
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: theme.spacing(0.5),
    },
    timestamp: {
        fontSize: '0.85rem',
        opacity: 0.8,
    },
}));

const CheckpointNotification = ({ open, onClose, checkpoint, device, autoHideDuration = 6000 }) => {
    const { classes } = useStyles();
    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        setIsOpen(open);
    }, [open]);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <Snackbar
            open={isOpen}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            className={classes.snackbar}
        >
            <Box className={classes.alert}>
                <Box className={classes.iconContainer}>
                    <DirectionsBusIcon className={classes.icon} />
                    <Typography variant="body2" sx={{ fontSize: '20px' }}>
                        →
                    </Typography>
                    <LocationOnIcon className={classes.icon} />
                </Box>
                <Box className={classes.content}>
                    <Typography className={classes.message}>
                        ✓ {device?.name || 'Bus'} llegó a {checkpoint?.name || 'checkpoint'}
                    </Typography>
                    <Typography className={classes.timestamp}>
                        {formatTime(Date.now())}
                    </Typography>
                </Box>
            </Box>
        </Snackbar>
    );
};

export default CheckpointNotification;
