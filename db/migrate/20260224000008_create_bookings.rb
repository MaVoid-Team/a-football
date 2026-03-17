class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :branch, null: false, foreign_key: true
      t.references :court, null: false, foreign_key: true
      t.string :user_name, null: false
      t.string :user_phone, null: false
      t.date :date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.integer :hours, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.integer :status, null: false, default: 0
      t.integer :payment_status, null: false, default: 0
      t.integer :lock_version, null: false, default: 0

      t.timestamps
    end

    add_index :bookings, [:court_id, :date, :start_time], unique: true
    add_index :bookings, [:court_id, :date]
    add_index :bookings, :status
  end
end
