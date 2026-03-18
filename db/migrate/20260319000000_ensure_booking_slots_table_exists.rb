class EnsureBookingSlotsTableExists < ActiveRecord::Migration[8.1]
  def change
    return if table_exists?(:booking_slots)

    create_table :booking_slots do |t|
      t.references :booking, null: false, foreign_key: true
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.timestamps
    end
  end
end
