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
package org.traccar.model;

import org.traccar.storage.StorageName;
import java.util.Date;

/**
 * DeviceRoute model for assigning devices (buses) to routes.
 * Tracks which devices are assigned to which routes.
 * Extends BaseModel (simple join table).
 */
@StorageName("tc_device_route")
public class DeviceRoute extends BaseModel {

    private long deviceId;
    private long routeId;
    private Date assignedAt;
    private long currentCheckpointId; // Which checkpoint the device is heading to
    private boolean completedRoute; // Has the device completed this route?

    public long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(long deviceId) {
        this.deviceId = deviceId;
    }

    public long getRouteId() {
        return routeId;
    }

    public void setRouteId(long routeId) {
        this.routeId = routeId;
    }

    public Date getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Date assignedAt) {
        this.assignedAt = assignedAt;
    }

    public long getCurrentCheckpointId() {
        return currentCheckpointId;
    }

    public void setCurrentCheckpointId(long currentCheckpointId) {
        this.currentCheckpointId = currentCheckpointId;
    }

    public boolean isCompletedRoute() {
        return completedRoute;
    }

    public void setCompletedRoute(boolean completedRoute) {
        this.completedRoute = completedRoute;
    }
}
