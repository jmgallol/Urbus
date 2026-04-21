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

import org.junit.jupiter.api.Test;
import org.traccar.model.Checkpoint;

import static org.junit.jupiter.api.Assertions.*;

public class CheckpointResourceTest {

    @Test
    public void testCheckpointCreation() {
        Checkpoint checkpoint = new Checkpoint();
        checkpoint.setName("Test Checkpoint");
        checkpoint.setDescription("A test checkpoint");
        checkpoint.setLatitude(10.5);
        checkpoint.setLongitude(20.5);
        checkpoint.setRadius(100);
        checkpoint.setGroupId(0);

        assertEquals("Test Checkpoint", checkpoint.getName());
        assertEquals("A test checkpoint", checkpoint.getDescription());
        assertEquals(10.5, checkpoint.getLatitude());
        assertEquals(20.5, checkpoint.getLongitude());
        assertEquals(100, checkpoint.getRadius());
        assertEquals(0, checkpoint.getGroupId());
    }

    @Test
    public void testCheckpointWithId() {
        Checkpoint checkpoint = new Checkpoint();
        checkpoint.setId(123L);
        checkpoint.setName("Named Checkpoint");
        checkpoint.setLatitude(-15.3);
        checkpoint.setLongitude(-45.2);
        checkpoint.setRadius(50);

        assertEquals(123L, checkpoint.getId());
        assertEquals("Named Checkpoint", checkpoint.getName());
        assertEquals(-15.3, checkpoint.getLatitude());
        assertEquals(-45.2, checkpoint.getLongitude());
        assertEquals(50, checkpoint.getRadius());
    }

    @Test
    public void testCheckpointValidation() {
        Checkpoint checkpoint = new Checkpoint();
        
        // Empty name should be handled by service
        checkpoint.setName("");
        assertTrue(checkpoint.getName().isEmpty());

        // Valid coordinates
        checkpoint.setLatitude(0.0);
        checkpoint.setLongitude(0.0);
        assertEquals(0.0, checkpoint.getLatitude());
        assertEquals(0.0, checkpoint.getLongitude());

        // Extreme coordinates
        checkpoint.setLatitude(90.0);
        checkpoint.setLongitude(180.0);
        assertEquals(90.0, checkpoint.getLatitude());
        assertEquals(180.0, checkpoint.getLongitude());

        checkpoint.setLatitude(-90.0);
        checkpoint.setLongitude(-180.0);
        assertEquals(-90.0, checkpoint.getLatitude());
        assertEquals(-180.0, checkpoint.getLongitude());
    }

    @Test
    public void testCheckpointRadius() {
        Checkpoint checkpoint = new Checkpoint();
        
        // Test minimum radius
        checkpoint.setRadius(10);
        assertEquals(10, checkpoint.getRadius());

        // Test larger radius
        checkpoint.setRadius(500);
        assertEquals(500, checkpoint.getRadius());

        // Test very large radius
        checkpoint.setRadius(10000);
        assertEquals(10000, checkpoint.getRadius());
    }

    @Test
    public void testCheckpointGroupAssignment() {
        Checkpoint checkpoint = new Checkpoint();
        checkpoint.setName("Group Checkpoint");
        checkpoint.setLatitude(5.0);
        checkpoint.setLongitude(5.0);
        checkpoint.setRadius(50);

        // No group assigned
        assertEquals(0, checkpoint.getGroupId());

        // Assign to group
        checkpoint.setGroupId(42L);
        assertEquals(42L, checkpoint.getGroupId());

        // Reassign to different group
        checkpoint.setGroupId(100L);
        assertEquals(100L, checkpoint.getGroupId());
    }

    @Test
    public void testCheckpointAttributes() {
        Checkpoint checkpoint = new Checkpoint();
        
        // Test attributes map (from ExtendedModel)
        assertTrue(checkpoint.getAttributes().isEmpty());
        
        checkpoint.set("customKey", "customValue");
        assertTrue(checkpoint.hasAttribute("customKey"));
    }

}
