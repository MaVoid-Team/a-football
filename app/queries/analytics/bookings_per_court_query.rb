module Analytics
  class BookingsPerCourtQuery
    def initialize(scope:)
      @scope = scope
    end

    def call
      @scope
        .confirmed
        .joins(:court)
        .group("courts.id", "courts.name")
        .select("courts.id as court_id, courts.name as court_name, COUNT(bookings.id) as bookings_count")
        .map do |row|
          {
            court_id: row.court_id,
            court_name: row.court_name,
            bookings_count: row.bookings_count
          }
        end
    end
  end
end
