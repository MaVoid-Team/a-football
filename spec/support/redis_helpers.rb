RSpec.configure do |config|
  config.before(:each) do
    REDIS.flushdb
  rescue Redis::BaseConnectionError
    # Allow local test execution without a running Redis instance.
    true
  end
end
