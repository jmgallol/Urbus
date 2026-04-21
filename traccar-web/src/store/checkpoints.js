import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import checkpointService from '../common/util/checkpointService';

/**
 * Async thunks for API communication
 */
export const fetchCheckpoints = createAsyncThunk(
    'checkpoints/fetchCheckpoints',
    async (_, { rejectWithValue }) => {
        try {
            return await checkpointService.getAll();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createCheckpoint = createAsyncThunk(
    'checkpoints/create',
    async (checkpoint, { rejectWithValue }) => {
        try {
            console.log('Redux createCheckpoint - Enviando checkpoint:', checkpoint);
            const result = await checkpointService.create(checkpoint);
            console.log('Redux createCheckpoint - Respuesta del servidor:', result);
            if (!result || !result.id) {
                console.error('Servidor devolvió respuesta sin ID:', result);
                return rejectWithValue('Server response missing checkpoint ID');
            }
            return result;
        } catch (error) {
            console.error('Redux createCheckpoint - Error:', error);
            const errorMessage = error.message || 'Failed to create checkpoint';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateCheckpoint = createAsyncThunk(
    'checkpoints/update',
    async (checkpoint, { rejectWithValue }) => {
        try {
            return await checkpointService.update(checkpoint);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCheckpoint = createAsyncThunk(
    'checkpoints/delete',
    async (id, { rejectWithValue }) => {
        try {
            await checkpointService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const { reducer, actions } = createSlice({
    name: 'checkpoints',
    initialState: {
        items: {},
        selectedId: null,
        arrivals: {}, // { checkpointId: { deviceId: timestamp } }
        loading: false,
        error: null,
    },
    reducers: {
        // Local-only reducers for UI state
        selectId(state, action) {
            state.selectedId = action.payload;
        },
        recordArrival(state, action) {
            const { checkpointId, deviceId } = action.payload;
            if (!state.arrivals[checkpointId]) {
                state.arrivals[checkpointId] = {};
            }
            state.arrivals[checkpointId][deviceId] = Date.now();
        },
        clearArrival(state, action) {
            const { checkpointId, deviceId } = action.payload;
            if (state.arrivals[checkpointId]) {
                delete state.arrivals[checkpointId][deviceId];
            }
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch checkpoints
        builder
            .addCase(fetchCheckpoints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCheckpoints.fulfilled, (state, action) => {
                state.loading = false;
                state.items = {};
                action.payload.forEach((item) => {
                    state.items[item.id] = item;
                });
            })
            .addCase(fetchCheckpoints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create checkpoint
        builder
            .addCase(createCheckpoint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCheckpoint.fulfilled, (state, action) => {
                state.loading = false;
                console.log('Checkpoint creado:', action.payload);
                state.items[action.payload.id] = action.payload;
            })
            .addCase(createCheckpoint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('Error al crear checkpoint:', action.payload);
            });

        // Update checkpoint
        builder
            .addCase(updateCheckpoint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCheckpoint.fulfilled, (state, action) => {
                state.loading = false;
                state.items[action.payload.id] = action.payload;
            })
            .addCase(updateCheckpoint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Delete checkpoint
        builder
            .addCase(deleteCheckpoint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCheckpoint.fulfilled, (state, action) => {
                state.loading = false;
                delete state.items[action.payload];
                if (state.selectedId === action.payload) {
                    state.selectedId = null;
                }
            })
            .addCase(deleteCheckpoint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export { actions as checkpointsActions };
export { reducer as checkpointsReducer };
