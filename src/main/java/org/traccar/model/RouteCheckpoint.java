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

/**
 * RouteCheckpoint model for managing checkpoint sequences within routes.
 * Links checkpoints to routes with specific ordering.
 * Extends BaseModel (no group permissions needed for this join table).
 */
@StorageName("tc_route_checkpoint")
public class RouteCheckpoint extends BaseModel {

    private long routeId;
    private long checkpointId;
    private int sequence;

    public long getRouteId() {
        return routeId;
    }

    public void setRouteId(long routeId) {
        this.routeId = routeId;
    }

    public long getCheckpointId() {
        return checkpointId;
    }

    public void setCheckpointId(long checkpointId) {
        this.checkpointId = checkpointId;
    }

    public int getSequence() {
        return sequence;
    }

    public void setSequence(int sequence) {
        this.sequence = sequence;
    }
}
