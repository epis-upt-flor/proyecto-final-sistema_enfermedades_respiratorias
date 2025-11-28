# Script para migrar imports de src/ a medical-app/
# Ejecutar desde la raíz del proyecto: .\mobile\__tests__\MIGRAR_TESTS.ps1

$testFiles = Get-ChildItem -Path "mobile\__tests__" -Recurse -Filter "*.test.ts*"

$replacements = @{
    "from '../../src/services/api'" = "from '../../medical-app/lib/api/services/authService'"
    "from '../../src/services/localStorage'" = "from '../../medical-app/lib/services/offlineQueue'"
    "from '../../src/services/aiService'" = "from '../../medical-app/lib/api/services/symptomAnalyzerService'"
    "from '../../src/store/useAppStore'" = "from '../../medical-app/store/useAppStore'"
    "from '../../src/components/" = "from '../../medical-app/components/"
    "from '../../src/hooks/" = "from '../../medical-app/hooks/"
    "from '../../src/services/" = "from '../../medical-app/lib/api/services/"
    "from '../../src/" = "from '../../medical-app/"
    "require('../../src/" = "require('../../medical-app/"
    "jest.mock('../../src/" = "jest.mock('../../medical-app/"
}

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Migrado: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nMigración completada!" -ForegroundColor Cyan

