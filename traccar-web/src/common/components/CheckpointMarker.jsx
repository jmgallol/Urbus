import { useMemo } from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    marker: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: `2px solid ${theme.palette.primary.main}`,
        backgroundColor: '#FFFFFF',
        fontSize: '18px',
        boxShadow: `0 2px 8px rgba(37, 99, 235, 0.3)`,
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'scale(1.15)',
            boxShadow: `0 4px 12px rgba(37, 99, 235, 0.5)`,
        },
    },
    markerActive: {
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontSize: '16px',
    },
    label: {
        position: 'absolute',
        top: '-28px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: 1000,
    },
    container: {
        position: 'relative',
        width: '32px',
        height: '32px',
    },
}));

const CheckpointMarker = ({
    checkpoint,
    isActive = false,
    isSelected = false,
    onClick = () => { },
    onContextMenu = () => { },
}) => {
    const { classes, cx } = useStyles();

    const markerClass = useMemo(
        () =>
            cx(classes.marker, {
                [classes.markerActive]: isActive || isSelected,
            }),
        [isActive, isSelected, classes, cx]
    );

    const handleClick = (e) => {
        onClick(checkpoint);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        onContextMenu(checkpoint);
    };

    return (
        <div
            className={classes.container}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            title={checkpoint.name}
        >
            <div className={markerClass}>📍</div>
            {isSelected && <div className={classes.label}>{checkpoint.name}</div>}
        </div>
    );
};

export default CheckpointMarker;
