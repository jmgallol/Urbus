import { useMemo } from 'react';
import { Polyline, Popup } from 'react-leaflet';
import { calculateDistance } from '../util/checkpointUtil';

const BusCheckpointLine = ({
    device,
    checkpoint,
    isActive = false,
    theme = null,
}) => {
    const lineOptions = useMemo(() => {
        const color = isActive ? '#10B981' : '#2563EB'; // Green if arrived, blue otherwise
        const weight = isActive ? 3 : 2;
        const dashArray = isActive ? null : '5, 5'; // Solid if arrived, dashed otherwise

        return {
            color,
            weight,
            dashArray,
            opacity: isActive ? 0.9 : 0.6,
            lineCap: 'round',
            lineJoin: 'round',
        };
    }, [isActive]);

    const points = useMemo(
        () => [
            [device.latitude, device.longitude],
            [checkpoint.latitude, checkpoint.longitude],
        ],
        [device, checkpoint]
    );

    const distance = useMemo(
        () => calculateDistance(device.latitude, device.longitude, checkpoint.latitude, checkpoint.longitude),
        [device, checkpoint]
    );

    const distanceText = distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(0)} m`;

    return (
        <>
            <Polyline positions={points} pathOptions={lineOptions}>
                <Popup>
                    <div style={{ fontSize: '12px', minWidth: '150px' }}>
                        <strong>{device.name}</strong> → <strong>{checkpoint.name}</strong>
                        <br />
                        Distancia: <strong>{distanceText}</strong>
                        <br />
                        {isActive && (
                            <>
                                <span style={{ color: '#10B981' }}>✓ En proximidad</span>
                            </>
                        )}
                    </div>
                </Popup>
            </Polyline>
        </>
    );
};

export default BusCheckpointLine;
