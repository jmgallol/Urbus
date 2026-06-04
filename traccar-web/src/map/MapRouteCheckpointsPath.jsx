import { useId, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { map } from './core/MapView';
import { fetchRouteCheckpoints } from '../store/routes';
import { useAttributePreference } from '../common/util/preferences';

const MapRouteCheckpointsPath = () => {
    const id = useId();
    const lineLayerId = `${id}-line`;
    const timeLayerId = `${id}-time`;
    const dispatch = useDispatch();
    const theme = useTheme();

    // Get selected device and route
    const selectedDeviceId = useSelector((state) => state.devices.selectedId);
    const selectedDevice = useSelector((state) =>
        selectedDeviceId ? state.devices.items[selectedDeviceId] : null
    );

    const routes = useSelector((state) => state.routes.items);
    const checkpointsByRoute = useSelector((state) => state.routes.checkpointsByRoute);
    const allCheckpoints = useSelector((state) => state.checkpoints.items);
    const deviceRoutes = useSelector((state) => state.routes.deviceRoutes);

    const mapLineWidth = useAttributePreference('mapLineWidth', 3);
    const mapLineOpacity = useAttributePreference('mapLineOpacity', 0.8);

    // Initialize layers
    useEffect(() => {
        if (!map.getSource(id)) {
            map.addSource(id, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });

            map.addLayer({
                source: id,
                id: lineLayerId,
                type: 'line',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#3B82F6',
                    'line-width': mapLineWidth,
                    'line-opacity': mapLineOpacity,
                    'line-dasharray': [3, 3],
                },
            });

            // Add time labels as symbols
            map.addLayer({
                source: id,
                id: timeLayerId,
                type: 'symbol',
                layout: {
                    'text-field': '{time}',
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 12,
                    'text-anchor': 'center',
                    'text-offset': [0, -10],
                    'symbol-placement': 'line',
                    'text-rotation-alignment': 'map',
                    'symbol-spacing': 250,
                },
                paint: {
                    'text-color': '#3B82F6',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                },
            });
        }

        return () => {
            if (map.getLayer(lineLayerId)) {
                map.removeLayer(lineLayerId);
            }
            if (map.getLayer(timeLayerId)) {
                map.removeLayer(timeLayerId);
            }
            if (map.getSource(id)) {
                map.removeSource(id);
            }
        };
    }, []);

    // Update route visualization when device or route changes
    useEffect(() => {
        if (!selectedDevice || !selectedDeviceId) {
            map.getSource(id)?.setData({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        // Find if this device has an assigned route
        const deviceRoute = deviceRoutes.find((dr) => dr.deviceId === selectedDeviceId);

        if (!deviceRoute) {
            map.getSource(id)?.setData({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        const route = routes[deviceRoute.routeId];
        if (!route) {
            map.getSource(id)?.setData({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        // Fetch checkpoints for this route if not already loaded
        if (!checkpointsByRoute[deviceRoute.routeId]) {
            dispatch(fetchRouteCheckpoints(deviceRoute.routeId));
            return;
        }

        const routeCheckpoints = checkpointsByRoute[deviceRoute.routeId] || [];
        if (routeCheckpoints.length < 2) {
            map.getSource(id)?.setData({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        // Get checkpoint coordinates in order
        const checkpointCoords = routeCheckpoints
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
            .map((rc) => allCheckpoints[rc.checkpointId])
            .filter((cp) => cp && cp.latitude && cp.longitude)
            .map((cp) => [cp.longitude, cp.latitude]);

        if (checkpointCoords.length < 2) {
            map.getSource(id)?.setData({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        // Create line features with time labels
        const features = [];
        for (let i = 0; i < checkpointCoords.length - 1; i += 1) {
            const startCoord = checkpointCoords[i];
            const endCoord = checkpointCoords[i + 1];

            // Calculate distance in km
            const distance = calculateDistance(
                startCoord[1],
                startCoord[0],
                endCoord[1],
                endCoord[0]
            );

            // Estimate time (assuming 40 km/h average speed)
            const estimatedTimeMinutes = Math.round((distance / 40) * 60);
            const timeLabel =
                estimatedTimeMinutes < 60
                    ? `${estimatedTimeMinutes}m`
                    : `${Math.floor(estimatedTimeMinutes / 60)}h ${estimatedTimeMinutes % 60}m`;

            features.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [startCoord, endCoord],
                },
                properties: {
                    time: timeLabel,
                    distance: distance.toFixed(1),
                },
            });
        }

        map.getSource(id)?.setData({
            type: 'FeatureCollection',
            features,
        });
    }, [selectedDeviceId, selectedDevice, routes, checkpointsByRoute, deviceRoutes, allCheckpoints, dispatch]);

    return null;
};

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default MapRouteCheckpointsPath;
