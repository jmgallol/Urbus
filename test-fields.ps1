# Test with minimal fields
$Uri = "http://localhost:8082/api/users"

# Try with just email and password 
$Body1 = @{
    email = "admin@localhost"
    password = "Test123"
} | ConvertTo-Json

Write-Host "Test 1: Email + Password only"
Write-Host "Request Body: $Body1"

try {
    $Response = Invoke-WebRequest -Uri $Uri `
        -Method POST `
        -ContentType "application/json" `
        -Body $Body1 `
        -ErrorAction Stop
    
    Write-Host "SUCCESS" -ForegroundColor Green
    $Response.Content | ConvertFrom-Json | ConvertTo-Json
}
catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Response: $errorBody" -ForegroundColor Yellow
        } catch { Write-Host "Could not read response" -ForegroundColor Yellow }
    }
}

Write-Host ""
Write-Host "Test 2: Email + Password + Name"
$Body2 = @{
    email = "admin2@localhost"
    password = "Test123"
    name = "Admin"
} | ConvertTo-Json

Write-Host "Request Body: $Body2"

try {
    $Response = Invoke-WebRequest -Uri $Uri `
        -Method POST `
        -ContentType "application/json" `
        -Body $Body2 `
        -ErrorAction Stop
    
    Write-Host "SUCCESS" -ForegroundColor Green
}
catch {
    Write-Host "FAILED - Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
