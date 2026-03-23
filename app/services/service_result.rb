class ServiceResult
  attr_reader :data, :errors, :error_codes

  def initialize(success:, data: nil, errors: [], error_codes: [])
    @success = success
    @data = data
    @errors = Array(errors)
    @error_codes = Array(error_codes)
  end

  def success?
    @success
  end

  def failure?
    !@success
  end

  def self.success(data = nil)
    new(success: true, data: data)
  end

  def self.failure(errors, error_codes: [])
    new(success: false, errors: errors, error_codes: error_codes)
  end
end
