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
import org.traccar.model.Route;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST API resource for Route management.
 * Provides CRUD operations for bus routes with checkpoint sequences.
 * 
 * Endpoints:
 * - GET    /api/routes       - List all routes (filtered by permissions)
 * - POST   /api/routes       - Create new route
 * - GET    /api/routes/{id}  - Get specific route
 * - PUT    /api/routes/{id}  - Update route
 * - DELETE /api/routes/{id}  - Delete route
 */
@Path("routes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RouteResource extends ExtendedObjectResource<Route> {

    public RouteResource() {
        super(Route.class, "name", List.of("name", "description"));
    }

    @POST
    public Response add(Route entity) throws Exception {
        // Ensure route has valid data before processing
        if (entity.getName() == null || entity.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Route name is required");
        }
        
        // Default to active status if not specified
        // Allow creation with empty groupId (0) for system-wide routes
        return super.add(entity);
    }

}
