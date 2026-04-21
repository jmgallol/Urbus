import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { checkpointsActions } from '../../store';
import { isDeviceAtCheckpoint } from '../util/checkpointUtil';

/**
 * Hook para detectar cuando un dispositivo llega a un checkpoint
 * Dispara una acción cuando se detecta la llegada
 * 
 * Validación de rutas:
 * - Si el dispositivo tiene una ruta asignada (deviceRoute), solo verifica checkpoints en esa ruta
 * - Si no tiene ruta, verifica todos los checkpoints (retrocompatibilidad)
 */
export const useCheckpointDetection = (proximityRadius = 50, onArrival = null) => {
    const dispatch = useDispatch();
    const checkpointsRef = useRef({});
    const devicesRef = useRef({});
    const deviceRoutesRef = useRef([]);
    const routeCheckpointsRef = useRef({});
    const notifiedRef = useRef({}); // Para evitar notificaciones duplicadas

    const checkpoints = useSelector((state) => state.checkpoints.items);
    const devices = useSelector((state) => state.devices.items);
    const deviceRoutes = useSelector((state) => state.routes.deviceRoutes);
    const routeCheckpoints = useSelector((state) => state.routes.checkpointsByRoute);

    useEffect(() => {
        checkpointsRef.current = checkpoints;
    }, [checkpoints]);

    useEffect(() => {
        devicesRef.current = devices;
    }, [devices]);

    useEffect(() => {
        deviceRoutesRef.current = deviceRoutes;
    }, [deviceRoutes]);

    useEffect(() => {
        routeCheckpointsRef.current = routeCheckpoints;
    }, [routeCheckpoints]);

    useEffect(() => {
        const detectArrivals = () => {
            Object.values(devicesRef.current).forEach((device) => {
                if (!device.position) return;

                // Find route assignment for this device (if any)
                const deviceRoute = deviceRoutesRef.current.find(
                    (dr) => dr.deviceId === device.id && !dr.completedRoute
                );

                // Get checkpoints to validate
                let checkpointsToCheck = Object.values(checkpointsRef.current);

                // If device has an active route, only check checkpoints in that route
                if (deviceRoute) {
                    const routeCheckpointIds = (routeCheckpointsRef.current[deviceRoute.routeId] || [])
                        .map((rc) => rc.checkpointId);

                    checkpointsToCheck = checkpointsToCheck.filter(
                        (cp) => routeCheckpointIds.includes(cp.id)
                    );
                }

                // Check each checkpoint
                checkpointsToCheck.forEach((checkpoint) => {
                    const isAt = isDeviceAtCheckpoint(device.position, checkpoint, proximityRadius);
                    const notificationKey = `${checkpoint.id}-${device.id}`;

                    if (isAt && !notifiedRef.current[notificationKey]) {
                        // Primera llegada detectada
                        notifiedRef.current[notificationKey] = true;

                        // Grabar llegada en Redux
                        dispatch(
                            checkpointsActions.recordArrival({
                                checkpointId: checkpoint.id,
                                deviceId: device.id,
                            }),
                        );

                        // Llamar callback si existe
                        if (onArrival) {
                            onArrival({
                                checkpoint,
                                device,
                                timestamp: Date.now(),
                                isRouteCheckpoint: !!deviceRoute, // Indicate if this is a route checkpoint
                            });
                        }
                    } else if (!isAt && notifiedRef.current[notificationKey]) {
                        // El dispositivo se fue del checkpoint
                        delete notifiedRef.current[notificationKey];

                        // Limpiar registro de llegada
                        dispatch(
                            checkpointsActions.clearArrival({
                                checkpointId: checkpoint.id,
                                deviceId: device.id,
                            }),
                        );
                    }
                });
            });
        };

        // Ejecutar detección cada 5 segundos
        const interval = setInterval(detectArrivals, 5000);

        return () => clearInterval(interval);
    }, [dispatch, proximityRadius, onArrival]);
};

export default useCheckpointDetection;

