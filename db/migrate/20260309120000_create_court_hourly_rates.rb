class CreateCourtHourlyRates < ActiveRecord::Migration[8.1]
  def change
    create_table :court_hourly_rates do |t|
      t.references :court, null: false, foreign_key: true
      t.integer :start_hour, null: false
      t.integer :end_hour, null: false
      t.decimal :price_per_hour, precision: 10, scale: 2, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :court_hourly_rates, [ :court_id, :start_hour, :end_hour ], name: "idx_court_hourly_rates_on_court_and_range"
    add_check_constraint :court_hourly_rates, "start_hour >= 0 AND start_hour <= 23", name: "chk_hourly_rates_start_hour_range"
    add_check_constraint :court_hourly_rates, "end_hour >= 1 AND end_hour <= 24", name: "chk_hourly_rates_end_hour_range"
    add_check_constraint :court_hourly_rates, "end_hour > start_hour", name: "chk_hourly_rates_valid_range"
  end
end
