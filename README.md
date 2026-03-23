# A Football

A modern football court booking platform. Book your court in seconds, manage events, and purchase packages—all in one place.

## API Documentation

- **[API Reference](docs/API.md)** — Full REST API documentation including authentication, endpoints, parameters, and response formats.
- **Postman Collection** — Import `docs/Court_Management_API.postman_collection.json` into Postman to test the API. Run **Admin API → Auth → Login** first to obtain a token; it will be stored automatically for subsequent requests.

## Tournament Notifications

- `TOURNAMENT_NOTIFICATION_CHANNELS` controls active channels. Example: `log,email`.
- `MAILER_ENABLED=true` must be set to allow outbound email delivery.
- SMTP settings for production:
	- `MAILER_FROM`
	- `MAILER_SMTP_ADDRESS`
	- `MAILER_SMTP_PORT` (default `587`)
	- `MAILER_SMTP_DOMAIN`
	- `MAILER_SMTP_USERNAME`
	- `MAILER_SMTP_PASSWORD`
	- `MAILER_SMTP_AUTH` (default `plain`)
	- `MAILER_SMTP_STARTTLS` (`true`/`false`, default `true`)

## Brand Identity

- **Primary Color**: Electric Lemon Yellow (#EFFD5F)
- **Secondary Color**: Smoky Black (#2D2D2D)
- **Typography**: Poppins (headings), Inter (body)
- **Voice**: Energetic, simple, direct, premium

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Rails 8 + JWT Auth + JSON:API
- **Animations**: Anime.js + Framer Motion
- **Internationalization**: next-intl (English/Arabic)

---

This README would normally document whatever steps are necessary to get the
application up and running.

## VPS Deployment Without BuildKit

If you want to avoid BuildKit/buildx cache usage on your VPS, deploy with the
classic Docker builder:

1. Disable buildx redirection on the VPS (one-time):
	 - `docker buildx uninstall || true`
2. Disable Docker BuildKit at daemon level (one-time):
	 - Create/update `/etc/docker/daemon.json` with:
		 ```json
		 {
			 "features": {
				 "buildkit": false
			 }
		 }
		 ```
	 - Restart Docker: `sudo systemctl restart docker`
3. Run `chmod +x script/deploy_no_buildkit.sh` once on the server.
4. Deploy with `./script/deploy_no_buildkit.sh`.

This script sets `DOCKER_BUILDKIT=0`, `COMPOSE_DOCKER_CLI_BUILD=0`, and
`BUILDX_BAKE=0`, and uses `docker-compose` when available.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...
