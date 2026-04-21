import { useState } from 'react';
import {
    Drawer,
    Toolbar,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CloseIcon from '@mui/icons-material/Close';
import CheckpointsList from '../common/components/CheckpointsList';

const useStyles = makeStyles()((theme) => ({
    drawer: {
        width: 420,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
    },
    title: {
        flexGrow: 1,
        fontWeight: 600,
    },
    content: {
        height: 'calc(100% - 64px)',
        overflow: 'auto',
        padding: theme.spacing(2),
    },
}));

const CheckpointsDrawer = ({ open, onClose, onEditCheckpoint }) => {
    const { classes } = useStyles();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                className: classes.drawer,
            }}
        >
            <Toolbar className={classes.toolbar} disableGutters>
                <Typography variant="h6" className={classes.title}>
                    Checkpoints
                </Typography>
                <IconButton
                    size="small"
                    color="inherit"
                    onClick={onClose}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Toolbar>
            <Box className={classes.content}>
                <CheckpointsList onEdit={onEditCheckpoint} />
            </Box>
        </Drawer>
    );
};

export default CheckpointsDrawer;
