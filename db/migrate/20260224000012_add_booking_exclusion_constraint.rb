class AddBookingExclusionConstraint < ActiveRecord::Migration[8.0]
  def up
    execute <<-SQL
      ALTER TABLE bookings
        ADD CONSTRAINT no_overlapping_confirmed_bookings
        EXCLUDE USING gist (
          court_id WITH =,
          date WITH =,
          tsrange(
            (DATE '2000-01-01' + start_time)::timestamp,
            (DATE '2000-01-01' + end_time)::timestamp
          ) WITH &&
        )
        WHERE (status = 0);
    SQL
  end

  def down
    execute "ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_overlapping_confirmed_bookings;"
  end
end
