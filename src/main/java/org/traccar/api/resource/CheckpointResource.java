/*
 * Copyright 2025 Urbus Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.traccar.api.resource;

import java.util.List;

import org.traccar.api.ExtendedObjectResource;
import org.traccar.model.Checkpoint;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST API resource for Checkpoint management.
 * Provides CRUD operations for bus stop checkpoints/paraderos.
 * 
 * Endpoints:
 * - GET    /api/checkpoints       - List all checkpoints (filtered by permissions)
 * - POST   /api/checkpoints       - Create new checkpoint
 * - GET    /api/checkpoints/{id}  - Get specific checkpoint
 * - PUT    /api/checkpoints/{id}  - Update checkpoint
 * - DELETE /api/checkpoints/{id}  - Delete checkpoint
 */
@Path("checkpoints")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CheckpointResource extends ExtendedObjectResource<Checkpoint> {

    public CheckpointResource() {
        super(Checkpoint.class, "name", List.of("name", "description"));
    }

    @POST
    public Response add(Checkpoint entity) throws Exception {
        // Ensure checkpoint has valid data before processing
        if (entity.getName() == null || entity.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Checkpoint name is required");
        }
        if (entity.getRadius() <= 0) {
            throw new IllegalArgumentException("Checkpoint radius must be greater than 0");
        }
        
        // Allow creation with empty groupId (0)
        // This creates system-wide checkpoints accessible to all users
        // Admin users can later reassign checkpoints to specific groups if needed
        return super.add(entity);
    }

}
