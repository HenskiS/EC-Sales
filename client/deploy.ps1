# EC-Sales frontend deploy.
#
# The complete build is packed locally and streamed through one SSH session.
# This avoids opening a new password-authenticated SCP connection for every
# file. With password authentication there is one prompt; with an SSH key
# there are no prompts.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$server = "root@143.198.236.191"
$remote = "/var/www/ecsales.work/html"
$staging = "${remote}.deploying"
$previous = "${remote}.previous"
$archiveName = "ecsales-frontend-$([guid]::NewGuid().ToString('N')).tar.gz"
$archivePath = Join-Path ([IO.Path]::GetTempPath()) $archiveName

foreach ($command in @("npm", "tar", "ssh")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command '$command' was not found in PATH."
    }
}

try {
    Write-Host "==> Building..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

    Write-Host "==> Packing build into one upload..." -ForegroundColor Cyan
    tar -C ./build -czf $archivePath .
    if ($LASTEXITCODE -ne 0) { throw "Could not create frontend archive" }

    $archiveSize = [math]::Round((Get-Item -LiteralPath $archivePath).Length / 1MB, 1)
    Write-Host "==> Uploading ${archiveSize} MB in one SSH session..." -ForegroundColor Cyan

    # OpenSSH reads an interactive password from the console even though its
    # standard input carries the archive. cmd.exe performs byte-safe stdin
    # redirection on both Windows PowerShell 5 and PowerShell 7.
    # Extract away from the live Nginx directory. The final rename only runs
    # after tar receives the complete archive, so an interrupted connection
    # leaves the currently deployed frontend untouched.
    $remoteCommand = "set -e; rm -rf '$staging' '$previous'; mkdir -p '$staging'; tar -xzf - -C '$staging'; chown -R www-data:www-data '$staging'; if [ -d '$remote' ]; then mv '$remote' '$previous'; fi; mv '$staging' '$remote'; rm -rf '$previous'"
    $sshCommand = "ssh $server `"$remoteCommand`" < `"$archivePath`""
    & $env:ComSpec /d /s /c $sshCommand
    if ($LASTEXITCODE -ne 0) { throw "Frontend upload failed" }

    Write-Host "==> Done." -ForegroundColor Green
}
finally {
    if (Test-Path -LiteralPath $archivePath) {
        Remove-Item -LiteralPath $archivePath -Force
    }
}
