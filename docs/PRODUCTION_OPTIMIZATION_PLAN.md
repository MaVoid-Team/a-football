# Production Optimization Plan (Rails + Next.js + Docker)

This plan is prioritized for **fast wins first**, then medium-term improvements.

## What was implemented in this pass

1. **Reduced Docker build context size** for backend builds via `.dockerignore` additions:
   - Excluded large/non-runtime paths (`Agent-Skills`, `Brand`, `docs`, `spec`, frontend build artifacts, etc.).
2. **Frontend Docker build context narrowed** in `docker-compose.yml`:
   - Changed from repo root (`.`) to `./frontend`.
   - Prevents sending the full repository when building frontend image.
3. **Frontend runtime image optimized** in `frontend/Dockerfile`:
   - Uses standalone Next.js output + static assets.
   - Runs as non-root user.
   - Uses `npm ci --prefer-offline --no-audit` and prunes dev dependencies.
4. **Backend bundle install made stricter and more cache-friendly** in `Dockerfile`:
   - `BUNDLE_DEPLOYMENT=1`, `BUNDLE_FROZEN=true`, jobs/retry tuning.
5. **Puma production throughput improved** in `config/puma.rb`:
   - Enabled clustered workers with `WEB_CONCURRENCY` and `preload_app!`.
6. **Fixed invalid Next.js config that caused build failures** in `frontend/next.config.ts`:
   - Removed unsupported options.
   - Added `turbopack.root` to avoid incorrect workspace-root detection.

---

## Expected impact

- **Build time reduction (high probability):**
  - Biggest gain comes from reducing Docker context transfer and frontend context isolation.
- **Runtime throughput improvement (medium-high probability):**
  - Puma now uses worker processes + thread pool, improving CPU utilization under load.
- **Operational stability (high probability):**
  - Frontend build now succeeds with valid Next.js config.

> Exact gains depend on VPS CPU, disk IO, network, and Docker cache persistence.

---

## Next optimization steps (recommended order)

### Phase 1 — Measure & cache (do next)

1. **Use classic Docker builder on VPS (BuildKit disabled)**
   - Set `DOCKER_BUILDKIT=0` and `COMPOSE_DOCKER_CLI_BUILD=0` for deployment commands.
   - Set `BUILDX_BAKE=0` for compose/buildx bake fallback paths.
   - On VPS, disable buildx redirection (`docker buildx uninstall`) and set Docker daemon `features.buildkit=false`.
   - Use `./script/deploy_no_buildkit.sh` to keep this behavior consistent.
2. **Capture baseline metrics for each stage**
   - Time backend image build, frontend image build, and total `docker compose up --build`.
   - Keep historical timings in a simple deployment log.
3. **Pin base image versions intentionally**
   - Keep Ruby/Node versions pinned and updated on schedule.

### Phase 2 — Rails runtime tuning

1. **Tune `WEB_CONCURRENCY` and `RAILS_MAX_THREADS` per VPS size**
   - Start with `WEB_CONCURRENCY=2`, `RAILS_MAX_THREADS=5`.
   - For 2 vCPU VPS: often `2x5` or `2x4` is good.
2. **Tune DB pool for concurrency envelope**
   - Ensure PostgreSQL `max_connections` comfortably handles:
     - `WEB_CONCURRENCY * RAILS_MAX_THREADS`
     - plus Sidekiq concurrency and admin connections.
3. **Add request and DB timing instrumentation**
   - Track p95 latency and slow queries.

### Phase 3 — Frontend runtime optimization

1. **Audit heavy routes/components**
   - Use Next.js bundle analysis to identify large client bundles.
2. **Limit client-side JS for non-interactive sections**
   - Move more UI to server components where possible.
3. **Image optimization policy**
   - Keep AVIF/WebP and ensure all large hero images are properly sized/compressed.

### Phase 4 — Deployment process improvements

1. **Separate build and run pipelines**
   - Build and push images once, then deploy by digest/tag.
2. **Use rolling restart strategy**
   - Avoid full downtime when replacing containers.
3. **Add health-gated startup checks**
   - Keep `/up` checks and fail fast on migration errors.

---

## Suggested verification checklist after deployment

- [ ] `docker compose config` renders successfully.
- [ ] Frontend container starts and serves traffic.
- [ ] Rails app boots with Puma workers (`WEB_CONCURRENCY` applied).
- [ ] Sidekiq starts and processes queue.
- [ ] p95 API latency is improved or stable.
- [ ] Full build duration reduced compared with previous deployment.

---

## Notes

- There is an existing `.env` file in repo root with real-looking credentials. Rotate any exposed secrets and avoid committing real secrets to source control.
