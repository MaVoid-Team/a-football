# frozen_string_literal: true

meilisearch_host = ENV.fetch("MEILISEARCH_HOST", "")
meilisearch_api_key = ENV.fetch("MEILISEARCH_API_KEY", "")

MeiliSearch::Rails.configuration = {
  meilisearch_url: meilisearch_host.presence || "http://localhost:7700",
  meilisearch_api_key: meilisearch_api_key.presence || "",
  active: meilisearch_host.present?,
  per_environment: true
}
