class CreateEventBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :event_bookings do |t|
      t.references :event, null: false, foreign_key: true
      t.string :user_name, null: false
      t.string :user_phone, null: false
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :event_bookings, [:event_id, :status]
  end
end
