# EC-Sales frontend deploy — skips re-uploading unchanged images.
# CRA content-hashes files in build/static/media, so an unchanged image keeps
# the same filename every build. We only upload media the server doesn't have.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$server = "root@143.198.236.191"
$remote = "/var/www/ecsales.work/html"

Write-Host "==> Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

# 1. Top-level build files (index.html, manifests, service-worker, favicon, etc.)
Write-Host "==> Uploading root files..." -ForegroundColor Cyan
Get-ChildItem ./build -File | ForEach-Object {
    scp $_.FullName "${server}:${remote}/"
}

# 2. JS + CSS bundles (new hashed names every build — always upload)
Write-Host "==> Uploading js/css..." -ForegroundColor Cyan
scp -r ./build/static/js  "${server}:${remote}/static/"
scp -r ./build/static/css "${server}:${remote}/static/"

# 3. Media: only upload files not already on the server
Write-Host "==> Diffing media..." -ForegroundColor Cyan
ssh $server "mkdir -p ${remote}/static/media"
$remoteMedia = @(ssh $server "ls -1 '${remote}/static/media' 2>/dev/null")
$localMedia  = Get-ChildItem ./build/static/media -File
$new         = $localMedia | Where-Object { $remoteMedia -notcontains $_.Name }

Write-Host ("==> {0} new media file(s) to upload, {1} already on server" -f $new.Count, $remoteMedia.Count) -ForegroundColor Green
foreach ($f in $new) {
    Write-Host "    + $($f.Name)"
    scp $f.FullName "${server}:${remote}/static/media/"
}

# 4. Fix ownership
Write-Host "==> Fixing ownership..." -ForegroundColor Cyan
ssh $server "chown -R www-data:www-data ${remote}"

Write-Host "==> Done." -ForegroundColor Green
