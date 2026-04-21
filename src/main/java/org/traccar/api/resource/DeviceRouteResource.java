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

import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

import org.traccar.api.BaseObjectResource;
import org.traccar.model.DeviceRoute;
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
 * REST API resource for DeviceRoute management.
 * Manages device (bus) assignments to routes.
 * 
 * Endpoints:
 * - GET    /api/device-routes              - List all device-route assignments
 * - POST   /api/device-routes              - Assign device to route
 * - GET    /api/device-routes/{id}         - Get specific assignment
 * - DELETE /api/device-routes/{id}         - Remove device from route
 */
@Path("device-routes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DeviceRouteResource extends BaseObjectResource<DeviceRoute> {

    public DeviceRouteResource() {
        super(DeviceRoute.class);
    }

    @GET
    public Stream<DeviceRoute> get(
            @QueryParam("deviceId") long deviceId,
            @QueryParam("routeId") long routeId,
            @QueryParam("activeOnly") boolean activeOnly,
            @QueryParam("limit") int limit,
            @QueryParam("offset") int offset) throws StorageException {
        
        // Build condition based on filters
        Condition condition = null;
        
        if (deviceId > 0) {
            condition = new Condition.Equals("deviceId", deviceId);
        } else if (routeId > 0) {
            condition = new Condition.Equals("routeId", routeId);
        }
        
        // Add active-only filter if requested
        if (activeOnly) {
            Condition activeCondition = new Condition.Equals("completedRoute", false);
            if (condition != null) {
                condition = new Condition.And(condition, activeCondition);
            } else {
                condition = activeCondition;
            }
        }
        
        Order order = new Order("assignedAt", true, limit > 0 ? limit : 0, offset > 0 ? offset : 0);
        Request request = new Request(new Columns.All(), condition, order);
        
        return storage.getObjects(baseClass, request).stream();
    }

    @POST
    public Response add(DeviceRoute entity) throws Exception {
        // Validate required fields
        if (entity.getDeviceId() <= 0) {
            throw new IllegalArgumentException("Device ID is required");
        }
        if (entity.getRouteId() <= 0) {
            throw new IllegalArgumentException("Route ID is required");
        }
        
        // Set assigned time if not provided
        if (entity.getAssignedAt() == null) {
            entity.setAssignedAt(new Date());
        }
        
        // Get first checkpoint of the route as starting point
        List<RouteCheckpoint> checkpoints = storage.getObjects(
            RouteCheckpoint.class,
            new Request(
                new Columns.Include("checkpointId"),
                new Condition.Equals("routeId", entity.getRouteId()),
                new Order("sequence", false, 1, 0)
            )
        );
        
        if (!checkpoints.isEmpty()) {
            entity.setCurrentCheckpointId(checkpoints.get(0).getCheckpointId());
        }
        
        // Initialize route as not completed
        entity.setCompletedRoute(false);
        
        return super.add(entity);
    }

}
