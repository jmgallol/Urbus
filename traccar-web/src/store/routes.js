import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const ROUTES_URL = '/api/routes';

const apiCall = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

export const fetchRoutes = createAsyncThunk(
    'routes/fetchAll',
    async () => {
        return apiCall(ROUTES_URL);
    }
);

export const createRoute = createAsyncThunk(
    'routes/create',
    async (route) => {
        return apiCall(ROUTES_URL, {
            method: 'POST',
            body: JSON.stringify(route),
        });
    }
);

export const updateRoute = createAsyncThunk(
    'routes/update',
    async (route) => {
        return apiCall(`${ROUTES_URL}/${route.id}`, {
            method: 'PUT',
            body: JSON.stringify(route),
        });
    }
);

export const deleteRoute = createAsyncThunk(
    'routes/delete',
    async (id) => {
        await apiCall(`${ROUTES_URL}/${id}`, {
            method: 'DELETE',
        });
        return id;
    }
);

export const fetchRouteCheckpoints = createAsyncThunk(
    'routes/fetchCheckpoints',
    async (routeId) => {
        return apiCall(`/api/route-checkpoints?routeId=${routeId}`);
    }
);

export const addCheckpointToRoute = createAsyncThunk(
    'routes/addCheckpoint',
    async (checkpoint) => {
        return apiCall('/api/route-checkpoints', {
            method: 'POST',
            body: JSON.stringify(checkpoint),
        });
    }
);

export const removeCheckpointFromRoute = createAsyncThunk(
    'routes/removeCheckpoint',
    async (checkpointId) => {
        await apiCall(`/api/route-checkpoints/${checkpointId}`, {
            method: 'DELETE',
        });
        return checkpointId;
    }
);

export const fetchDeviceRoutes = createAsyncThunk(
    'routes/fetchDeviceRoutes',
    async ({ deviceId, routeId, activeOnly = false } = {}) => {
        let url = '/api/device-routes?';
        if (deviceId) url += `deviceId=${deviceId}&`;
        if (routeId) url += `routeId=${routeId}&`;
        if (activeOnly) url += `activeOnly=true&`;

        return apiCall(url.slice(0, -1));
    }
);

export const assignDeviceToRoute = createAsyncThunk(
    'routes/assignDevice',
    async (deviceRoute) => {
        return apiCall('/api/device-routes', {
            method: 'POST',
            body: JSON.stringify(deviceRoute),
        });
    }
);

export const unassignDeviceFromRoute = createAsyncThunk(
    'routes/unassignDevice',
    async (deviceRouteId) => {
        await apiCall(`/api/device-routes/${deviceRouteId}`, {
            method: 'DELETE',
        });
        return deviceRouteId;
    }
);

const initialState = {
    items: {},
    selectedId: null,
    checkpointsByRoute: {}, // routeId -> [checkpoints]
    deviceRoutes: [],
    loading: false,
    error: null,
};

const routesSlice = createSlice({
    name: 'routes',
    initialState,
    extraReducers: (builder) => {
        builder
            // Fetch Routes
            .addCase(fetchRoutes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoutes.fulfilled, (state, action) => {
                state.loading = false;
                state.items = {};
                action.payload.forEach((route) => {
                    state.items[route.id] = route;
                });
            })
            .addCase(fetchRoutes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Create Route
            .addCase(createRoute.fulfilled, (state, action) => {
                state.items[action.payload.id] = action.payload;
                state.selectedId = action.payload.id;
            })

            // Update Route
            .addCase(updateRoute.fulfilled, (state, action) => {
                state.items[action.payload.id] = action.payload;
            })

            // Delete Route
            .addCase(deleteRoute.fulfilled, (state, action) => {
                delete state.items[action.payload];
                if (state.selectedId === action.payload) {
                    state.selectedId = null;
                }
            })

            // Fetch Route Checkpoints
            .addCase(fetchRouteCheckpoints.fulfilled, (state, action) => {
                const routeId = action.meta.arg;
                state.checkpointsByRoute[routeId] = action.payload;
            })

            // Add Checkpoint to Route
            .addCase(addCheckpointToRoute.fulfilled, (state, action) => {
                const { routeId } = action.payload;
                if (!state.checkpointsByRoute[routeId]) {
                    state.checkpointsByRoute[routeId] = [];
                }
                state.checkpointsByRoute[routeId].push(action.payload);
                // Sort by sequence
                state.checkpointsByRoute[routeId].sort((a, b) => a.sequence - b.sequence);
            })

            // Remove Checkpoint from Route
            .addCase(removeCheckpointFromRoute.fulfilled, (state, action) => {
                // Find and remove from all route checkpoint lists
                Object.keys(state.checkpointsByRoute).forEach((routeId) => {
                    state.checkpointsByRoute[routeId] = state.checkpointsByRoute[routeId].filter(
                        (cp) => cp.id !== action.payload
                    );
                });
            })

            // Fetch Device Routes
            .addCase(fetchDeviceRoutes.fulfilled, (state, action) => {
                state.deviceRoutes = action.payload;
            })

            // Assign Device to Route
            .addCase(assignDeviceToRoute.fulfilled, (state, action) => {
                state.deviceRoutes.push(action.payload);
            })

            // Unassign Device from Route
            .addCase(unassignDeviceFromRoute.fulfilled, (state, action) => {
                state.deviceRoutes = state.deviceRoutes.filter(
                    (dr) => dr.id !== action.payload
                );
            });
    },
});

export default routesSlice.reducer;
