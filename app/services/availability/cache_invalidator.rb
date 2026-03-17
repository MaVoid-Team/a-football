module Availability
  class CacheInvalidator
    def initialize(branch_id:, court_id:, date:)
      @cache_key = "availability:#{branch_id}:#{court_id}:#{date}"
    end

    def call
      REDIS.del(@cache_key)
    end
  end
end
