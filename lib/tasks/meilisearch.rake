# frozen_string_literal: true

namespace :meilisearch do
  desc "Reindex all searchable models in Meilisearch"
  task reindex: :environment do
    models = [Package, Event, Branch, Court, Booking, Admin]
    models.each do |model|
      next unless model.respond_to?(:reindex!)

      puts "Reindexing #{model.name}..."
      model.reindex!
      puts "  Done."
    end
    puts "Reindex complete."
  end
end
