param(
  [Parameter(Position = 0)]
  [ValidateSet('start', 'stop', 'restart', 'status')]
  [string]$Action = 'status'
)

$ErrorActionPreference = 'Stop'

$pgRoot = if ($env:PATSAKORN_PG_ROOT) { $env:PATSAKORN_PG_ROOT } else { 'C:\Users\admin\patsakorn-postgres' }
$pgBin = Join-Path $pgRoot 'pgsql\bin'
$dataDir = Join-Path $pgRoot 'data'
$logDir = Join-Path $pgRoot 'logs'
$logFile = Join-Path $logDir 'postgres.log'
$pgCtl = Join-Path $pgBin 'pg_ctl.exe'

if (-not (Test-Path $pgCtl)) {
  Write-Error "PostgreSQL was not found at $pgRoot. Set PATSAKORN_PG_ROOT to the install folder."
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-PgRunning {
  & $pgCtl -D $dataDir status *> $null
  return $LASTEXITCODE -eq 0
}

switch ($Action) {
  'start' {
    if (Test-PgRunning) {
      Write-Host 'PostgreSQL is already running (localhost:5432)'
      break
    }
    & $pgCtl -D $dataDir -l $logFile -w start
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host 'PostgreSQL is ready at localhost:5432'
  }
  'stop' {
    if (-not (Test-PgRunning)) {
      Write-Host 'PostgreSQL is not running'
      break
    }
    & $pgCtl -D $dataDir -m fast -w stop
    if ($LASTEXITCODE -eq 0) { Write-Host 'PostgreSQL stopped' }
  }
  'restart' {
    if (Test-PgRunning) {
      & $pgCtl -D $dataDir -m fast -w stop
      if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    & $pgCtl -D $dataDir -l $logFile -w start
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host 'PostgreSQL is ready at localhost:5432'
  }
  'status' {
    & $pgCtl -D $dataDir status
    exit $LASTEXITCODE
  }
}
