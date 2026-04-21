import fetchOrThrow from './fetchOrThrow';

class CheckpointService {
    /**
     * Fetch all checkpoints accessible to current user
     */
    async getAll() {
        const response = await fetchOrThrow('/api/checkpoints?all=true');
        return response.json();
    }

    /**
     * Fetch checkpoint by ID
     */
    async getById(id) {
        const response = await fetchOrThrow(`/api/checkpoints/${id}`);
        return response.json();
    }

    /**
     * Create new checkpoint
     */
    async create(checkpoint) {
        console.log('CheckpointService.create - Recibido:', checkpoint);
        this.validateCheckpoint(checkpoint);
        console.log('CheckpointService.create - Enviando POST a /api/checkpoints');
        const response = await fetchOrThrow('/api/checkpoints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkpoint),
        });
        const result = await response.json();
        console.log('CheckpointService.create - Respuesta:', result);
        return result;
    }

    /**
     * Update existing checkpoint
     */
    async update(checkpoint) {
        this.validateCheckpoint(checkpoint);
        const response = await fetchOrThrow(`/api/checkpoints/${checkpoint.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkpoint),
        });
        return response.json();
    }

    /**
     * Delete checkpoint by ID
     */
    async delete(id) {
        await fetchOrThrow(`/api/checkpoints/${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Validate checkpoint data
     */
    validateCheckpoint(checkpoint) {
        console.log('Validando checkpoint:', checkpoint);
        if (!checkpoint.name || !checkpoint.name.trim()) {
            throw new Error('Checkpoint name is required');
        }
        if (checkpoint.latitude === undefined || checkpoint.latitude === '' || checkpoint.latitude < -90 || checkpoint.latitude > 90) {
            throw new Error(`Invalid latitude: ${checkpoint.latitude}`);
        }
        if (checkpoint.longitude === undefined || checkpoint.longitude === '' || checkpoint.longitude < -180 || checkpoint.longitude > 180) {
            throw new Error(`Invalid longitude: ${checkpoint.longitude}`);
        }
        if (!checkpoint.radius || checkpoint.radius < 10) {
            throw new Error(`Radius must be at least 10 meters, got: ${checkpoint.radius}`);
        }
        // groupId no es requerido - el servidor lo asignará si es necesario
        console.log('Checkpoint válido para enviar');
    }
}

export default new CheckpointService();
