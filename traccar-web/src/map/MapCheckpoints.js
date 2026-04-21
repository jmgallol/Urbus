import { useEffect, useMemo, useState, useCallback, useId } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import CheckpointForm from '../common/components/CheckpointForm';
import { checkpointsActions } from '../store';
import { calculateDistance } from '../common/util/checkpointUtil';
import { map } from './core/MapView';

const MapCheckpoints = ({
    theme,
    checkpointFormOpen,
    setCheckpointFormOpen,
}) => {
    const checkpointLayerId = useId();
    const busLineLayerId = useId();
    const radiusCircleLayerId = useId();

    const dispatch = useDispatch();

    const checkpoints = useSelector((state) => state.checkpoints.items);
    const devices = useSelector((state) => state.devices.all);
    const selectedCheckpointId = useSelector((state) => state.checkpoints.selectedId);

    const [formOpen, setFormOpen] = useState(false);
    const [editingCheckpoint, setEditingCheckpoint] = useState(null);
    const [mapClickPos, setMapClickPos] = useState(null);

    // Sincronizar el estado del formulario del padre
    useEffect(() => {
        setFormOpen(checkpointFormOpen);
    }, [checkpointFormOpen]);

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingCheckpoint(null);
        setMapClickPos(null);
        setCheckpointFormOpen(false);
    };

    // Manejar envío del formulario
    const handleFormSubmit = (formData) => {
        const checkpointData = {
            ...formData,
            id: editingCheckpoint?.id || `checkpoint_${Date.now()}`,
            latitude: formData.latitude,
            longitude: formData.longitude,
            createdAt: editingCheckpoint?.createdAt || new Date().toISOString(),
        };

        if (editingCheckpoint) {
            dispatch(checkpointsActions.update(checkpointData));
        } else {
            dispatch(checkpointsActions.add(checkpointData));
        }

        handleFormClose();
    };

    // Crear y actualizar marcadores de checkpoints en el mapa
    useEffect(() => {
        if (!map) return;

        const checkpointMarkers = [];

        // Crear fuente GeoJSON para checkpoints
        const checkpointFeatures = Object.values(checkpoints).map((checkpoint) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [checkpoint.longitude, checkpoint.latitude],
            },
            properties: {
                name: checkpoint.name,
                id: checkpoint.id,
                isSelected: checkpoint.id === selectedCheckpointId,
                proximityRadius: checkpoint.proximityRadius || 50,
            },
        }));

        // Crear la fuente si no existe
        if (!map.getSource(checkpointLayerId)) {
            map.addSource(checkpointLayerId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: checkpointFeatures,
                },
            });

            // Agregar capa de puntos
            map.addLayer({
                id: `${checkpointLayerId}-points`,
                type: 'symbol',
                source: checkpointLayerId,
                layout: {
                    'icon-image': 'marker-15',
                    'text-field': '{name}',
                    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                    'text-size': 11,
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                },
                paint: {
                    'text-color': '#2563EB',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 1,
                },
            });
        } else {
            // Actualizar la fuente existente
            map.getSource(checkpointLayerId).setData({
                type: 'FeatureCollection',
                features: checkpointFeatures,
            });
        }

        // Manejar clics en los checkpoints
        const handleCheckpointClick = (e) => {
            if (e.features.length > 0) {
                const checkpoint = checkpoints[e.features[0].properties.id];
                dispatch(checkpointsActions.selectId(checkpoint.id));
            }
        };

        // Evento de contexto
        const handleCheckpointContextMenu = (e) => {
            if (e.features.length > 0) {
                const checkpoint = checkpoints[e.features[0].properties.id];
                setEditingCheckpoint(checkpoint);
                setFormOpen(true);
            }
        };

        map.on('click', `${checkpointLayerId}-points`, handleCheckpointClick);
        map.on('contextmenu', `${checkpointLayerId}-points`, handleCheckpointContextMenu);

        return () => {
            map.off('click', `${checkpointLayerId}-points`, handleCheckpointClick);
            map.off('contextmenu', `${checkpointLayerId}-points`, handleCheckpointContextMenu);
        };
    }, [map, checkpoints, selectedCheckpointId, checkpointLayerId, dispatch]);

    // Dibujar círculos de proximidad
    useEffect(() => {
        if (!map) return;

        const radiusFeatures = Object.values(checkpoints).map((checkpoint) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [checkpoint.longitude, checkpoint.latitude],
            },
            properties: {
                name: checkpoint.name,
                proximityRadius: checkpoint.proximityRadius || 50,
            },
        }));

        if (!map.getSource(radiusCircleLayerId)) {
            map.addSource(radiusCircleLayerId, {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: radiusFeatures,
                },
            });

            map.addLayer({
                id: `${radiusCircleLayerId}-circles`,
                type: 'circle',
                source: radiusCircleLayerId,
                paint: {
                    'circle-radius': ['/', ['get', 'proximityRadius'], 100],
                    'circle-color': '#2563EB',
                    'circle-opacity': 0.1,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#2563EB',
                    'circle-stroke-opacity': 0.3,
                },
            });
        } else {
            map.getSource(radiusCircleLayerId).setData({
                type: 'FeatureCollection',
                features: radiusFeatures,
            });
        }
    }, [map, checkpoints, radiusCircleLayerId]);

    // Dibujar líneas de buses a checkpoints más cercanos
    useEffect(() => {
        if (!map || !map.getLayer(`${busLineLayerId}-lines`)) {
            if (!map.getSource(busLineLayerId)) {
                map.addSource(busLineLayerId, {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [],
                    },
                });

                map.addLayer({
                    id: `${busLineLayerId}-lines`,
                    type: 'line',
                    source: busLineLayerId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': ['get', 'color'],
                        'line-width': ['get', 'width'],
                        'line-dasharray': ['get', 'dashArray'],
                        'line-opacity': ['get', 'opacity'],
                    },
                });
            }
        }

        const lineFeatures = Object.values(devices).flatMap((device) => {
            if (!device.latitude || !device.longitude) return [];

            let closestCheckpoint = null;
            let minDistance = Infinity;

            Object.values(checkpoints).forEach((checkpoint) => {
                const dist = calculateDistance(
                    device.latitude,
                    device.longitude,
                    checkpoint.latitude,
                    checkpoint.longitude
                );

                if (dist < minDistance) {
                    minDistance = dist;
                    closestCheckpoint = checkpoint;
                }
            });

            if (!closestCheckpoint) return [];

            const isActive = minDistance <= (closestCheckpoint.proximityRadius || 50);
            const color = isActive ? '#10B981' : '#2563EB';
            const width = isActive ? 3 : 2;
            const dashArray = isActive ? [0] : [5, 5];
            const opacity = isActive ? 0.9 : 0.6;

            return [{
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [device.longitude, device.latitude],
                        [closestCheckpoint.longitude, closestCheckpoint.latitude],
                    ],
                },
                properties: {
                    color,
                    width,
                    dashArray: dashArray.join(','),
                    opacity,
                    distance: minDistance,
                    deviceId: device.id,
                    checkpointId: closestCheckpoint.id,
                },
            }];
        });

        if (map.getSource(busLineLayerId)) {
            map.getSource(busLineLayerId).setData({
                type: 'FeatureCollection',
                features: lineFeatures,
            });
        }
    }, [map, devices, checkpoints, busLineLayerId]);

    // Gestionar clic derecho en el mapa
    const handleMapContextMenu = useCallback(
        (e) => {
            setMapClickPos({
                latitude: e.latlng.lat,
                longitude: e.latlng.lng,
            });
            setEditingCheckpoint(null);
            setFormOpen(true);
        },
        []
    );

    useEffect(() => {
        if (!map) return;

        map.on('contextmenu', handleMapContextMenu);

        return () => {
            map.off('contextmenu', handleMapContextMenu);
        };
    }, [map, handleMapContextMenu]);

    return (
        <>
            <CheckpointForm
                open={formOpen}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
                checkpoint={editingCheckpoint}
                mapLocation={mapClickPos}
            />
        </>
    );
};

export default MapCheckpoints;
