# Test with direct cookie handling
$BaseUrl = "http://localhost:8082"
$UniqueCounter = Get-Random -Minimum 10000 -Maximum 99999

# Step 1: Register
Write-Host "Step 1: Register" -ForegroundColor Cyan
$UserData = @{
    name = "Admin User"
    email = "admin$UniqueCounter@localhost"
    password = "Test123456"
} | ConvertTo-Json

try {
    $RegisterResponse = Invoke-WebRequest -Uri "$BaseUrl/api/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $UserData `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $User = $RegisterResponse.Content | ConvertFrom-Json
    Write-Host "✓ User created: ID=$($User.id)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Registration failed" -ForegroundColor Red
    exit 1
}

# Step 2: Login (get session)
Write-Host "Step 2: Login" -ForegroundColor Cyan
$LoginData = "email=admin$UniqueCounter@localhost`&password=Test123456"
$WebSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession

try {
    $LoginResponse = Invoke-WebRequest -Uri "$BaseUrl/api/session" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $LoginData `
        -WebSession $WebSession `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✓ Login successful" -ForegroundColor Green
    Write-Host "Cookies in session: $($WebSession.Cookies.Count)"
}
catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create checkpoint (use same session with cookies)
Write-Host "Step 3: Create checkpoint" -ForegroundColor Cyan
$CheckpointData = @{
    name = "Test Checkpoint"
    description = "Test checkpoint"
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
        -WebSession $WebSession `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $Checkpoint = $CheckpointResponse.Content | ConvertFrom-Json
    Write-Host "✓ Checkpoint created: ID=$($Checkpoint.id), Name=$($Checkpoint.name)" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response) {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Checkpoint creation failed: Status=$status" -ForegroundColor Red
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            if ($errorBody) { Write-Host "Server error: $errorBody" -ForegroundColor Yellow }
        } catch {}
    } else {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n[SUCCESS] All tests passed!" -ForegroundColor Green
