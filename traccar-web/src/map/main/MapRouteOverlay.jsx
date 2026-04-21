import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { map } from '../core/MapView';

const MapRouteOverlay = () => {
    const positions = useSelector((state) =>
        state.devices.selectedId
            ? Object.values(state.events.items[state.devices.selectedId] || []).map(
                (e) => e.position
            )
            : []
    );

    const devices = useSelector((state) => state.devices);
    const deviceRoutes = useSelector((state) => state.routes.deviceRoutes);
    const checkpoints = useSelector((state) => state.checkpoints.items);
    const allPositions = useSelector((state) =>
        Object.values(state.events.items || {}).reduce(
            (acc, posArr) => ({
                ...acc,
                ...posArr.reduce((a, e) => ({ ...a, [e.deviceId]: e.position }), {}),
            }),
            {}
        )
    );

    const sourceId = 'route-line-source';
    const layerId = 'route-line-layer';
    const radiusLayerId = 'route-radius-layer';
    const radiusCircleLayerId = 'route-radius-circles';

    useEffect(() => {
        // Initialize source and layers if not already present
        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });

            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': ['get', 'lineWidth'],
                    'line-opacity': ['get', 'opacity'],
                    'line-dasharray': ['get', 'dashArray'],
                },
            });

            // Add label for checkpoint direction
            map.addLayer({
                id: `${layerId}-label`,
                type: 'symbol',
                source: sourceId,
                layout: {
                    'symbol-placement': 'line',
                    'text-field': ['get', 'label'],
                    'text-size': 12,
                    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                    'text-offset': [0, 1],
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                },
            });

            // Add radius circle layer (showing checkpoint detection radius)
            map.addSource(radiusCircleLayerId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });

            map.addLayer({
                id: radiusCircleLayerId,
                type: 'circle',
                source: radiusCircleLayerId,
                paint: {
                    'circle-radius': 40, // Default checkpoint detection radius in pixels
                    'circle-color': '#3B82F6',
                    'circle-opacity': 0.1,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#3B82F6',
                    'circle-stroke-opacity': 0.5,
                },
            });
        }

        // Update data
        const features = [];
        const radiusFeatures = [];

        deviceRoutes.forEach((deviceRoute) => {
            // Find device position
            const devicePosition = allPositions[deviceRoute.deviceId];
            if (!devicePosition || !deviceRoute.currentCheckpointId) return;

            // Find checkpoint
            const checkpoint = checkpoints[deviceRoute.currentCheckpointId];
            if (!checkpoint) return;

            // Create line from device to checkpoint
            const coordinates = [
                [devicePosition.longitude, devicePosition.latitude],
                [checkpoint.longitude, checkpoint.latitude],
            ];

            // Calculate distance to determine line style
            const R = 6371; // Earth radius in km
            const lat1 = (devicePosition.latitude * Math.PI) / 180;
            const lat2 = (checkpoint.latitude * Math.PI) / 180;
            const dLat = ((checkpoint.latitude - devicePosition.latitude) * Math.PI) / 180;
            const dLng =
                ((checkpoint.longitude - devicePosition.longitude) * Math.PI) / 180;

            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km

            // Use blue for route line, adjust width based on distance
            const color = '#2563EB'; // Vibrant blue
            let lineWidth = 3;
            let opacity = 1;
            let dashArray = undefined; // Solid by default

            // Increase width as device gets closer
            if (distance < 0.5) {
                lineWidth = 5; // Thicker when very close
            } else if (distance < 2) {
                lineWidth = 4; // Medium thickness when approaching
            } else {
                dashArray = [5, 5]; // Dashed when far
            }

            features.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates,
                },
                properties: {
                    color,
                    opacity,
                    dashArray,
                    lineWidth,
                    label: `${checkpoint.name} (${distance.toFixed(1)}km)`,
                    deviceId: deviceRoute.deviceId,
                    checkpointId: deviceRoute.currentCheckpointId,
                },
            });

            // Add radius circle at checkpoint
            radiusFeatures.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [checkpoint.longitude, checkpoint.latitude],
                },
                properties: {
                    radius: 500, // 500m default detection radius
                    checkpointId: deviceRoute.currentCheckpointId,
                },
            });
        });

        const source = map.getSource(sourceId);
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features,
            });
        }

        const radiusSource = map.getSource(radiusCircleLayerId);
        if (radiusSource) {
            radiusSource.setData({
                type: 'FeatureCollection',
                features: radiusFeatures,
            });
        }
    }, [deviceRoutes, allPositions, checkpoints]);

    // Cleanup
    useEffect(() => {
        return () => {
            // Don't cleanup on unmount to keep visualization during navigation
        };
    }, []);

    return null;
};

export default MapRouteOverlay;
