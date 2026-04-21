# Test registration with unique email
$BaseUrl = "http://localhost:8082"
$UniqueCounter = Get-Random -Minimum 10000 -Maximum 99999

# Step 1: Register first admin user
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Registering admin user..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$UserData = @{
    name = "Admin User"
    email = "admin$UniqueCounter@localhost"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $RegisterResponse = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $UserData `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "Registration successful!" -ForegroundColor Green
    $User = $RegisterResponse.Content | ConvertFrom-Json
    Write-Host "User ID: $($User.id)"  -ForegroundColor Green
    Write-Host "Email: admin$UniqueCounter@localhost" -ForegroundColor Green
}
catch {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            if ($errorBody) { Write-Host "Error: $errorBody" -ForegroundColor Red }
        } catch {}
    }
    exit 1
}

# Step 2: Login
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 2: Logging in..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$LoginData = "email=admin$UniqueCounter@localhost&password=TestPass123!"

try {
    $LoginResponse = Invoke-WebRequest -Uri "$BaseUrl/api/session" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $LoginData `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "Login successful!" -ForegroundColor Green
    $SessionData = $LoginResponse.Content | ConvertFrom-Json
    Write-Host "Session User ID: $($SessionData.id)" -ForegroundColor Green
   
    $Cookies = $LoginResponse.BaseResponse.Cookies
}
catch {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    exit 1
}

# Step 3: Create checkpoint (this will fail if not authenticated, but show the response)
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 3: Creating a checkpoint..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$CheckpointData = @{
    name = "Test Checkpoint"
    description = "Test check point"
    latitude = 40.7128
    longitude = -74.0060
    radius = 100
    groupId = 0
} | ConvertTo-Json

try {
    $CheckpointResponse = Invoke-WebRequest -Uri "$BaseUrl/api/checkpoints" `
        -Method POST `
        -ContentType "application/json" `
        -Body $CheckpointData `
        -UseBasicParsing `
        -WebSession (New-Object Microsoft.PowerShell.Commands.WebRequestSession -Property @{ Cookies = $Cookies }) `
        -ErrorAction Stop
    
    Write-Host "Checkpoint created successfully!" -ForegroundColor Green
    $Checkpoint = $CheckpointResponse.Content | ConvertFrom-Json
    Write-Host "Checkpoint ID: $($Checkpoint.id)" -ForegroundColor Green
}
catch {
    Write-Host "Checkpoint creation failed!" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            if ($errorBody) { Write-Host "Error: $errorBody" -ForegroundColor Red }
        } catch {}
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n[SUCCESS] Workflow test completed!" -ForegroundColor Green
