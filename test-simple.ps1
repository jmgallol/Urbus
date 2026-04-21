# Simple test - just try to see what error we get with raw curl
$Uri = "http://localhost:8082/api/users"

# Try with all possible fields
$Body = @{
    name = "Admin User"
    email = "admin@localhost"  
    login = "admin"
    password = "TestPass123!"
} | ConvertTo-Json

Write-Host "Request URI: $Uri"
Write-Host "Request Body: $Body"
Write-Host ""

try {
    $Response = Invoke-WebRequest -Uri $Uri `
        -Method POST `
        -ContentType "application/json" `
        -Body $Body `
        -Verbose `
        -ErrorAction Stop
    
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host $Response.Content
}
catch {
    Write-Host "ERROR" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody" -ForegroundColor Yellow
    }
}
