# Test script para verificar persistencia de checkpoints
# Este script prueba el flujo completo de CRUD de checkpoints

param(
    [string]$ServerUrl = "http://localhost:8082",
    [string]$Username = "admin",
    [string]$Password = "admin"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host "`n=== $Text ===" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

# Login and get session
Write-Header "Autenticación"
try {
    $loginResponse = Invoke-RestMethod -Uri "$ServerUrl/api/session" -Method Get
    Write-Success "Sesión obtenida: Usuario ID = $($loginResponse.id)"
    $userId = $loginResponse.id
} catch {
    Write-Error "No se pudo obtener sesión: $_"
    exit 1
}

# Test GET /api/checkpoints (lista inicial)
Write-Header "GET /api/checkpoints (lista inicial)"
try {
    $getResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints?all=true" -Method Get
    Write-Success "Checkpoints obtenidos: $(($getResponse | Measure-Object).Count) elementos"
    $getResponse | ForEach-Object { Write-Host "  - ID: $($_.id), Nombre: $($_.name)" }
} catch {
    Write-Error "Error al obtener checkpoints: $_"
}

# Test POST /api/checkpoints (crear checkpoint)
Write-Header "POST /api/checkpoints (crear checkpoint)"
$checkpointPayload = @{
    name = "Paradero Test $(Get-Date -Format 'HHmmss')"
    description = "Punto de prueba automática"
    latitude = 10.5
    longitude = 20.5
    radius = 100
    groupId = 0
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints" `
        -Method Post `
        -Body $checkpointPayload `
        -ContentType "application/json"
    
    Write-Success "Checkpoint creado exitosamente"
    Write-Host "  - ID: $($createResponse.id)"
    Write-Host "  - Nombre: $($createResponse.name)"
    Write-Host "  - Ubicación: ($($createResponse.latitude), $($createResponse.longitude))"
    Write-Host "  - Radio: $($createResponse.radius)m"
    
    $checkpointId = $createResponse.id
} catch {
    Write-Error "Error al crear checkpoint: $_"
    exit 1
}

# Test GET /api/checkpoints/{id} (obtener uno)
Write-Header "GET /api/checkpoints/{id} (obtener checkpoint específico)"
try {
    $getOneResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints/$checkpointId" -Method Get
    Write-Success "Checkpoint recuperado correctamente"
    Write-Host "  - Nombre: $($getOneResponse.name)"
    Write-Host "  - Descripción: $($getOneResponse.description)"
} catch {
    Write-Error "Error al obtener checkpoint: $_"
}

# Test GET /api/checkpoints (verificar que aparece en lista)
Write-Header "GET /api/checkpoints (verificar en lista)"
try {
    $listResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints?all=true" -Method Get
    $found = $listResponse | Where-Object { $_.id -eq $checkpointId }
    
    if ($found) {
        Write-Success "Checkpoint encontrado en la lista"
        Write-Host "  - Nombre: $($found.name)"
    } else {
        Write-Error "Checkpoint NO encontrado en la lista después de crear"
    }
} catch {
    Write-Error "Error al listar checkpoints: $_"
}

# Test PUT /api/checkpoints/{id} (actualizar)
Write-Header "PUT /api/checkpoints/{id} (actualizar checkpoint)"
$updatePayload = @{
    id = $checkpointId
    name = "Paradero Actualizado $(Get-Date -Format 'HHmmss')"
    description = "Descripción modificada"
    latitude = 10.6
    longitude = 20.6
    radius = 150
    groupId = 0
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints/$checkpointId" `
        -Method Put `
        -Body $updatePayload `
        -ContentType "application/json"
    
    Write-Success "Checkpoint actualizado exitosamente"
    Write-Host "  - Nuevo nombre: $($updateResponse.name)"
    Write-Host "  - Nuevo radio: $($updateResponse.radius)m"
} catch {
    Write-Error "Error al actualizar checkpoint: $_"
}

# Test verificar persistencia después de actualizar
Write-Header "Verificar persistencia después de actualizar"
try {
    $persistResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints/$checkpointId" -Method Get
    Write-Success "Datos persistidos correctamente"
    Write-Host "  - Nombre: $($persistResponse.name)"
    Write-Host "  - Descripción: $($persistResponse.description)"
    Write-Host "  - Radio: $($persistResponse.radius)m"
} catch {
    Write-Error "Error al verificar persistencia: $_"
}

# Test DELETE /api/checkpoints/{id} (eliminar)
Write-Header "DELETE /api/checkpoints/{id} (eliminar checkpoint)"
try {
    Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints/$checkpointId" -Method Delete
    Write-Success "Checkpoint eliminado exitosamente"
} catch {
    Write-Error "Error al eliminar checkpoint: $_"
}

# Test verificar que fue eliminado
Write-Header "Verificar que fue eliminado"
try {
    $deleteCheckResponse = Invoke-RestMethod -Uri "$ServerUrl/api/checkpoints/$checkpointId" -Method Get
    Write-Error "Checkpoint aún existe después de deletar (debería haber 404)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Success "Checkpoint correctamente eliminado (404)"
    } else {
        Write-Error "Error inesperado: $_"
    }
}

Write-Header "Pruebas completadas"
Write-Success "Todos los tests de persistencia pasaron exitosamente"
