import { useEffect, useMemo, useState, useCallback, useId } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import CheckpointForm from '../common/components/CheckpointForm';
import { checkpointsActions } from '../store';
import { calculateDistance } from '../common/util/checkpointUtil';
import { fetchCheckpoints, createCheckpoint, updateCheckpoint, deleteCheckpoint } from '../store/checkpoints';
import { map } from './core/MapView';

const MapCheckpoints = ({
    theme,
    checkpointFormOpen,
    setCheckpointFormOpen,
    editingCheckpoint = null,
    setEditingCheckpoint = null,
}) => {
    const checkpointLayerId = useId();
    const busLineLayerId = useId();
    const radiusCircleLayerId = useId();

    const dispatch = useDispatch();

    const checkpoints = useSelector((state) => state.checkpoints.items);
    const devices = useSelector((state) => state.devices.items);
    const selectedCheckpointId = useSelector((state) => state.checkpoints.selectedId);
    const checkpointsError = useSelector((state) => state.checkpoints.error);
    const checkpointsLoading = useSelector((state) => state.checkpoints.loading);

    const [formOpen, setFormOpen] = useState(false);
    const [localEditingCheckpoint, setLocalEditingCheckpoint] = useState(null);
    const [mapClickPos, setMapClickPos] = useState(null);

    // Usar el checkpoint externo si viene, sino usar el local
    const currentEditingCheckpoint = editingCheckpoint || localEditingCheckpoint;

    // Cargar checkpoints desde la API al montar el componente
    useEffect(() => {
        console.log('MapCheckpoints: Cargando checkpoints desde API...');
        dispatch(fetchCheckpoints());
    }, [dispatch]);

    // Sincronizar el estado del formulario del padre
    useEffect(() => {
        setFormOpen(checkpointFormOpen);
    }, [checkpointFormOpen]);

    // Sincronizar cuando viene un checkpoint externo para editar
    useEffect(() => {
        if (editingCheckpoint) {
            setFormOpen(true);
        }
    }, [editingCheckpoint]);

    // Mostrar error si hay
    useEffect(() => {
        if (checkpointsError) {
            console.error('Error en checkpoints:', checkpointsError);
        }
    }, [checkpointsError]);

    const handleFormClose = () => {
        setFormOpen(false);
        setLocalEditingCheckpoint(null);
        setMapClickPos(null);
        setCheckpointFormOpen(false);
        if (setEditingCheckpoint) {
            setEditingCheckpoint(null);
        }
    };

    // Manejar envío del formulario
    const handleFormSubmit = (formData) => {
        const checkpointPayload = {
            name: formData.name,
            description: formData.description,
            latitude: formData.latitude,
            longitude: formData.longitude,
            radius: formData.radius,
        };

        // Solo incluir groupId si es válido (backend lo asignará si no se proporciona)
        if (formData.groupId && formData.groupId !== 0) {
            checkpointPayload.groupId = formData.groupId;
        }

        console.log('MapCheckpoints.handleFormSubmit:', {
            isEditing: !!editingCheckpoint,
            payload: checkpointPayload,
        });

        if (editingCheckpoint) {
            checkpointPayload.id = editingCheckpoint.id;
            console.log('Actualizando checkpoint:', checkpointPayload);
            dispatch(updateCheckpoint(checkpointPayload))
                .then((result) => {
                    console.log('Checkpoint actualizado correctamente:', result);
                    handleFormClose();
                })
                .catch((error) => {
                    console.error('Error al actualizar checkpoint:', error);
                });
        } else {
            console.log('Creando nuevo checkpoint:', checkpointPayload);
            dispatch(createCheckpoint(checkpointPayload))
                .then((result) => {
                    console.log('Checkpoint creado correctamente:', result);
                    handleFormClose();
                })
                .catch((error) => {
                    console.error('Error al crear checkpoint:', error);
                });
        }
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
                radius: checkpoint.radius || 50,
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
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 14,
                    'text-offset': [0, 2.5],
                    'text-anchor': 'top',
                    'text-allow-overlap': true,
                    'icon-allow-overlap': true,
                },
                paint: {
                    'text-color': '#EF4444',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                },
            });

            // Agregar capa de círculos grandes para los checkpoints (más visible)
            map.addLayer({
                id: `${checkpointLayerId}-circles`,
                type: 'circle',
                source: checkpointLayerId,
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#F97316',
                    'circle-opacity': 0.9,
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#FFFFFF',
                    'circle-stroke-opacity': 1,
                },
            }, `${radiusCircleLayerId}-circles`);
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
                setLocalEditingCheckpoint(checkpoint);
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
                radius: checkpoint.radius || 50,
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
                    'circle-radius': ['/', ['get', 'radius'], 80],
                    'circle-color': '#F97316',
                    'circle-opacity': 0.15,
                    'circle-stroke-width': 2.5,
                    'circle-stroke-color': '#F97316',
                    'circle-stroke-opacity': 0.6,
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

            const isActive = minDistance <= (closestCheckpoint.radius || 50);
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
            e.preventDefault();
            setMapClickPos({
                latitude: e.lngLat.lat,
                longitude: e.lngLat.lng,
            });
            setEditingCheckpoint(null);
            setFormOpen(true);
        },
        []
    );

    useEffect(() => {
        if (!map) return;

        map.on('contextmenu', handleMapContextMenu);
        // Prevenir el menú contextual del navegador
        map.getCanvas().addEventListener('contextmenu', (e) => e.preventDefault());

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
                checkpoint={currentEditingCheckpoint}
                mapLocation={mapClickPos}
            />
        </>
    );
};

export default MapCheckpoints;
