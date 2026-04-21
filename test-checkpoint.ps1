# Simple test of checkpoint workflow
$BaseUrl = "http://localhost:8082"
$Unique = Get-Random -Minimum 10000 -Maximum 99999
$Email = "admin$Unique@localhost"
$Password = "Test123456"

# Step 1: Register
Write-Host "Registering user..."
$UserData = @{
    name = "Admin User"
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $Reg = Invoke-WebRequest -Uri "$BaseUrl/api/users" -Method POST `
        -ContentType "application/json" -Body $UserData -UseBasicParsing -ErrorAction Stop
    $User = $Reg.Content | ConvertFrom-Json
    Write-Host "[OK] User ID: $($User.id)"
}
catch {
    Write-Host "[FAIL] Registration error"
    exit 1
}

# Step 2: Login
Write-Host "Logging in..."
$LoginBody = "email=$Email&password=$Password"
$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

try {
    $Login = Invoke-WebRequest -Uri "$BaseUrl/api/session" -Method POST `
        -ContentType "application/x-www-form-urlencoded" -Body $LoginBody `
        -WebSession $Session -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Logged in"
}
catch {
    Write-Host "[FAIL] Login error"
    exit 1
}

# Step 3: Create checkpoint
Write-Host "Creating checkpoint..."
$CheckpointBody = @{
    name = "Test Checkpoint"
    description = "Test"
    latitude = 40.7128
    longitude = -74.0060
    radius = 100
    groupId = 0
} | ConvertTo-Json

try {
    $Checkpoint = Invoke-WebRequest -Uri "$BaseUrl/api/checkpoints" -Method POST `
        -ContentType "application/json" -Body $CheckpointBody `
        -WebSession $Session -UseBasicParsing -ErrorAction Stop
    $C = $Checkpoint.Content | ConvertFrom-Json
    Write-Host "[OK] Checkpoint ID: $($C.id)"
}
catch {
    if ($_.Exception.Response) {
        $Status = $_.Exception.Response.StatusCode.value__
        Write-Host "[FAIL] HTTP $Status"
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        $Body = $Reader.ReadToEnd()
        Write-Host "Server response: $Body"
    } else {
        Write-Host "[FAIL] Error: $($_.Exception.Message)"
    }
    exit 1
}

Write-Host "[SUCCESS] Workflow completed!"
