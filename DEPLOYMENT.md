# EC-Sales deployment

The backend now stores email work on the order itself before returning success.
An interrupted deploy can delay an email, but it cannot erase the job. The next
server process reclaims pending work and any `processing` job whose five-minute
lease expired. Resend also receives `order-email/<order id>` as an idempotency
key so a retry within Resend's idempotency window does not send a duplicate.

## One-time PM2 migration

The existing unnamed `pm2 start "npm run start"` process must be replaced once.
This first migration has a short interruption, so do it when nobody is actively
submitting an order:

```bash
cd /apps/EC-Sales/server
npm ci --omit=dev
npm test

pm2 list
pm2 delete <the-old-process-name-or-id>
pm2 start ../ecosystem.config.js --env production
pm2 save
```

Confirm that `ecsales-server` is online and that the API responds:

```bash
pm2 status ecsales-server
curl --fail --silent --show-error http://localhost:3001/api/ping
pm2 logs ecsales-server --lines 100
```

## Routine backend deployment

After the one-time migration, use graceful reloads instead of restarts:

```bash
cd /apps/EC-Sales
git pull --ff-only

cd server
npm ci --omit=dev
npm test

cd ..
pm2 startOrGracefulReload ecosystem.config.js --env production
curl --fail --silent --show-error http://localhost:3001/api/ping
pm2 save
```

PM2 starts the replacement process, waits for MongoDB and the HTTP listener to
be ready, then asks the old process to drain. The old process has up to 60
seconds to finish its current email before PM2 force-stops it. If it cannot
finish, the durable email worker reclaims that order after the lease expires.

Do not use `pm2 restart` for routine deployments. It kills the listening
process before its replacement is ready.

## Relevant settings

The defaults can be overridden in the server environment:

- `EMAIL_MAX_ATTEMPTS=5`
- `EMAIL_WORKER_POLL_MS=10000`
- `EMAIL_WORKER_STALE_MS=300000`
- `PDF_RENDER_TIMEOUT_MS=30000`
- `PDF_BASE_URL=https://ecsales.work`
- `CATALOG_PDF_URL=https://ecsales.work/api/catalog/pdf` (optional; defaults to
  the `/api/catalog/pdf` route under `PDF_BASE_URL`)

Each order records `emailDelivery.status`, attempts, the Resend ID, accepted
recipients, dropped-address warnings, and the last error. Historical orders do
not receive queue state automatically and therefore will not be resent when the
worker is first deployed.

## Product catalogue release

The catalogue reader uses files from both halves of the repository:

- `server/catalog/pages` contains the 41 ordered JPG pages served by `/api/catalog`.
- `output/pdf/EC_Product_Catalog_2026.pdf` is the attachment sent through Resend.
- The React catalogue reader is included in the normal client build.

After pulling a catalogue release, deploy the backend with the routine PM2 steps
above. Then build and publish the client:

```bash
cd /apps/EC-Sales/client
npm ci
npm run build
sudo rsync -a --delete build/ /var/www/ecsales.work/html/
```

Confirm that the metadata, first page, and PDF are available:

```bash
curl --fail --silent --show-error http://localhost:3001/api/catalog
curl --fail --silent --show-error --output /dev/null http://localhost:3001/api/catalog/pages/001_Cover.jpg
curl --fail --silent --show-error --output /dev/null http://localhost:3001/api/catalog/pdf
```

Catalogue email uses the same `RESEND_API_KEY` and `EMAIL_FROM` settings as
order email. Resend fetches the attachment from the public catalogue PDF URL,
which avoids loading and JSON-encoding the full PDF in the Node process. To
replace the catalogue later, put the new numbered JPGs in
`server/catalog/pages` and run `server/scripts/generateCatalogPdf.py` with a
Python environment containing ReportLab before committing the release.
