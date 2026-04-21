// Calcula la distancia en metros entre dos coordenadas usando la fórmula de Haversine
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// Detecta si un dispositivo llegó a un checkpoint
export const isDeviceAtCheckpoint = (devicePosition, checkpoint, proximityRadius = 50) => {
    if (!devicePosition || !checkpoint) return false;

    const distance = calculateDistance(
        devicePosition.latitude,
        devicePosition.longitude,
        checkpoint.latitude,
        checkpoint.longitude,
    );

    return distance <= proximityRadius;
};

// Convierte un checkpoint a feature GeoJSON para el mapa
export const checkpointToFeature = (checkpoint, theme) => ({
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [checkpoint.longitude, checkpoint.latitude],
    },
    properties: {
        id: checkpoint.id,
        name: checkpoint.name,
        description: checkpoint.description || '',
        color: checkpoint.color || theme.palette.primary.main,
        icon: 'checkpoint',
    },
});

// Obtiene el color del checkpoint basado en su estado
export const getCheckpointColor = (theme, checkpoint, isActive = false) => {
    if (isActive) return theme.palette.success.main; // Verde si es activo
    return checkpoint.color || theme.palette.primary.main;
};

// Crea una línea GeoJSON entre dos puntos
export const createLineFeature = (startLat, startLon, endLat, endLon, properties = {}) => ({
    type: 'Feature',
    geometry: {
        type: 'LineString',
        coordinates: [
            [startLon, startLat],
            [endLon, endLat],
        ],
    },
    properties,
});

// Obtiene el próximo checkpoint de un dispositivo (simulado)
export const getNextCheckpoint = (device, checkpoints) => {
    if (!device.checkpointId || !checkpoints[device.checkpointId]) {
        return null;
    }
    return checkpoints[device.checkpointId];
};
