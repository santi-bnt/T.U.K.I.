$ErrorActionPreference = 'Stop'

$compiler = Get-Command gcc -ErrorAction SilentlyContinue
if (-not $compiler) { $compiler = Get-Command clang -ErrorAction SilentlyContinue }
if (-not $compiler) {
    Write-Output 'No se encontró gcc ni clang. Instala un compilador C para ejecutar el test host.'
    exit 2
}

$testExe = Join-Path $env:TEMP ("tuki_protocol_test_" + [guid]::NewGuid().ToString('N') + '.exe')
$source = Join-Path $PSScriptRoot 'test_tuki_protocol.c'
$parser = Join-Path $PSScriptRoot '..\src\tuki_protocol.c'
$include = Join-Path $PSScriptRoot '..\include'

try {
    & $compiler.Source -std=c11 -Wall -Wextra -Werror "-I$include" $source $parser -o $testExe
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $testExe
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Output 'OK: parser UART y validación de rangos.'
}
finally {
    if (Test-Path -LiteralPath $testExe) { Remove-Item -LiteralPath $testExe -Force }
}
