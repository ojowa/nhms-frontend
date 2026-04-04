$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$targets = @(
  (Join-Path $root 'src\server\api'),
  (Join-Path $root 'src\app\api')
)

$violations = @()

foreach ($target in $targets) {
  if (-not (Test-Path -LiteralPath $target)) {
    continue
  }

  Get-ChildItem -LiteralPath $target -Recurse -File | ForEach-Object {
    $lineCount = (Get-Content -LiteralPath $_.FullName).Count
    if ($lineCount -gt 400) {
      $violations += [PSCustomObject]@{
        File = $_.FullName
        Lines = $lineCount
      }
    }
  }
}

if ($violations.Count -gt 0) {
  $violations | Format-Table -AutoSize
  throw 'API migration files exceed the 400-line limit.'
}

Write-Host 'API migration files are within the 400-line limit.'
