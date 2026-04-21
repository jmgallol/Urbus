#!/bin/bash
# Use curl to test registration
curl -v -X POST http://localhost:8082/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@localhost","login":"admin","password":"TestPass123!"}'
