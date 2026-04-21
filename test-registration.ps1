# Test registration with the first user (should be auto-promoted to admin)
$BaseUrl = "http://localhost:8082"

# Step 1: Register first user
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Registering first admin user..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$UserData = @{
    name = "Admin User"
    email = "admin@localhost"
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $RegisterResponse = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $UserData `
        -ErrorAction Stop
    
    Write-Host "Registration successful!" -ForegroundColor Green
    $User = $RegisterResponse.Content | ConvertFrom-Json
    Write-Host "User ID: $($User.id)" -ForegroundColor Green
    Write-Host "Is Administrator: $($User.administrator)" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "Registration failed!" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    try {
        $ErrorContent = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
        Write-Host "Details: $ErrorContent" -ForegroundColor Red
    } catch { }
    exit 1
}

# Step 2: Login with registered user
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Logging in with admin credentials..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Note: Session endpoint expects form-encoded data, not JSON
$LoginData = "email=admin@localhost&password=TestPass123!"

try {
    $LoginResponse = Invoke-WebRequest -Uri "$BaseUrl/api/session" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $LoginData `
        -ErrorAction Stop
    
    Write-Host "Login successful!" -ForegroundColor Green
    $SessionData = $LoginResponse.Content | ConvertFrom-Json
    Write-Host "Session User ID: $($SessionData.id)" -ForegroundColor Green
    Write-Host "Session Expires: $($SessionData.expires)" -ForegroundColor Green
    
    # Extract cookies for authenticated requests
    $Cookies = $LoginResponse.BaseResponse.Cookies
    Write-Host ""
}
catch {
    Write-Host "Login failed!" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    try {
        $ErrorContent = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
        Write-Host "Details: $ErrorContent" -ForegroundColor Red
    } catch { }
    exit 1
}

# Step 3: Create a checkpoint
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Creating a checkpoint..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$CheckpointData = @{
    name = "Test Checkpoint"
    description = "This is a test checkpoint for monitoring"
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
        -WebSession (New-Object Microsoft.PowerShell.Commands.WebRequestSession -Property @{ Cookies = $Cookies }) `
        -ErrorAction Stop
    
    Write-Host "Checkpoint created successfully!" -ForegroundColor Green
    $Checkpoint = $CheckpointResponse.Content | ConvertFrom-Json
    Write-Host "Checkpoint ID: $($Checkpoint.id)" -ForegroundColor Green
    Write-Host "Checkpoint Name: $($Checkpoint.name)" -ForegroundColor Green
    Write-Host "Location: ($($Checkpoint.latitude), $($Checkpoint.longitude))" -ForegroundColor Green
    Write-Host "Radius: $($Checkpoint.radius)m" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "Checkpoint creation failed!" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    try {
        $ErrorContent = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()).ReadToEnd()
        Write-Host "Details: $ErrorContent" -ForegroundColor Red
    } catch { }
    exit 1
}

Write-Host "[SUCCESS] All tests passed!" -ForegroundColor Green
