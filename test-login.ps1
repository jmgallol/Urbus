# Test login with exact user from registration
$BaseUrl = "http://localhost:8082"

# Register a specific user
$Email = "testuser@example.com"
$Password = "MyTestPassword123"

Write-Host "Step 1: Register user: $Email" -ForegroundColor Cyan
$RegData = @{
    name = "Test User"
    email = $Email
    password = $Password
} | ConvertTo-Json

$RegResp = Invoke-WebRequest -Uri "$BaseUrl/api/users" -Method POST `
    -ContentType "application/json" -Body $RegData -UseBasicParsing -ErrorAction SilentlyContinue

if ($RegResp) {
    $User = $RegResp.Content | ConvertFrom-Json
    Write-Host "User created: ID=$($User.id), Email=$($User.email)" -ForegroundColor Green
} else {
    Write-Host "Registration failed" -ForegroundColor Red
    exit 1
}

# Try to login with same credentials
Write-Host "`nStep 2: Try login with email=$Email, password=$Password" -ForegroundColor Cyan

$Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$LoginData = "email=$Email&password=$Password"

try {
    $LoginResp = Invoke-WebRequest -Uri "$BaseUrl/api/session" -Method POST `
        -ContentType "application/x-www-form-urlencoded" -Body $LoginData `
        -WebSession $Session -UseBasicParsing -ErrorAction Stop
    
    $SessionUser = $LoginResp.Content | ConvertFrom-Json
    Write-Host "LOGIN SUCCESS: User ID=$($SessionUser.id)" -ForegroundColor Green
}
catch {
    Write-Host "LOGIN FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        if ($body) {
            Write-Host "Server response: $body" -ForegroundColor Yellow
        }
    } catch {}
}
