# Complete test: register, login, and create checkpoint
$BaseUrl = "http://localhost:8082"
$Email = "admin99999@test"
$Password = "Test123456"

Write-Host "=== Test Workflow ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register
Write-Host "1. Registering user..." -ForegroundColor Yellow
$RegData = @{
    name = "Admin"
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $RegResp = Invoke-WebRequest -Uri "$BaseUrl/api/users" -Method POST `
        -ContentType "application/json" -Body $RegData -UseBasicParsing -ErrorAction Stop
    $User = $RegResp.Content | ConvertFrom-Json
    Write-Host "   [OK] User ID: $($User.id), Admin: $($User.administrator)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Login
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$LoginData = "email=$Email&password=$Password"

try {
    $LoginResp = Invoke-WebRequest -Uri "$BaseUrl/api/session" -Method POST `
        -ContentType "application/x-www-form-urlencoded" -Body $LoginData `
        -WebSession $Session -UseBasicParsing -ErrorAction Stop
    $Session_User = $LoginResp.Content | ConvertFrom-Json
    Write-Host "   [OK] Session created for user $($Session_User.id)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    exit 1
}

# Step 3: Create checkpoint
Write-Host "`n3. Creating checkpoint..." -ForegroundColor Yellow
$CheckpointData = @{
    name = "Test Point"
    description = "Testing checkpoint system"
    latitude = 40.7128
    longitude = -74.0060
    radius = 100
    groupId = 0
} | ConvertTo-Json

try {
    $CpResp = Invoke-WebRequest -Uri "$BaseUrl/api/checkpoints" -Method POST `
        -ContentType "application/json" -Body $CheckpointData `
        -WebSession $Session -UseBasicParsing -ErrorAction Stop
    $Checkpoint = $CpResp.Content | ConvertFrom-Json
    Write-Host "   [OK] Checkpoint ID: $($Checkpoint.id), Name: $($Checkpoint.name)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            if ($body) { Write-Host "   Error: $body" -ForegroundColor Yellow }
        } catch {}
    }
    exit 1
}

Write-Host "`n[SUCCESS] All steps completed!" -ForegroundColor Green
Write-Host "`nAccess the app: http://localhost:8082" -ForegroundColor Cyan
