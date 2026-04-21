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
import java.util.stream.Stream;

import org.traccar.api.BaseObjectResource;
import org.traccar.model.RouteCheckpoint;
import org.traccar.storage.StorageException;
import org.traccar.storage.query.Columns;
import org.traccar.storage.query.Condition;
import org.traccar.storage.query.Order;
import org.traccar.storage.query.Request;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * REST API resource for RouteCheckpoint management.
 * Manages checkpoint assignments to routes with sequence ordering.
 * 
 * Endpoints:
 * - GET    /api/route-checkpoints           - List all checkpoint assignments
 * - POST   /api/route-checkpoints           - Assign checkpoint to route
 * - GET    /api/route-checkpoints/{id}      - Get specific assignment
 * - DELETE /api/route-checkpoints/{id}      - Remove checkpoint from route
 */
@Path("route-checkpoints")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class RouteCheckpointResource extends BaseObjectResource<RouteCheckpoint> {

    public RouteCheckpointResource() {
        super(RouteCheckpoint.class);
    }

    @GET
    public Stream<RouteCheckpoint> get(
            @QueryParam("routeId") long routeId,
            @QueryParam("limit") int limit,
            @QueryParam("offset") int offset) throws StorageException {
        
        Condition condition = routeId > 0 ? new Condition.Equals("routeId", routeId) : null;
        Order order = new Order("sequence", false, limit > 0 ? limit : 0, offset > 0 ? offset : 0);
        Request request = new Request(new Columns.All(), condition, order);
        
        return storage.getObjects(baseClass, request).stream();
    }

    @POST
    public Response add(RouteCheckpoint entity) throws Exception {
        // Validate required fields
        if (entity.getRouteId() <= 0) {
            throw new IllegalArgumentException("Route ID is required");
        }
        if (entity.getCheckpointId() <= 0) {
            throw new IllegalArgumentException("Checkpoint ID is required");
        }
        
        // If no sequence specified, get the max sequence for this route and add 1
        if (entity.getSequence() == 0) {
            List<RouteCheckpoint> existing = storage.getObjects(
                baseClass,
                new Request(
                    new Columns.Include("sequence"),
                    new Condition.Equals("routeId", entity.getRouteId()),
                    new Order("sequence", true, 1, 0)
                )
            );
            entity.setSequence(existing.isEmpty() ? 1 : existing.size() + 1);
        }
        
        return super.add(entity);
    }

}
