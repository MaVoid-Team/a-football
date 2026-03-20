class ChangeBookingHoursToDecimal < ActiveRecord::Migration[8.1]
  def change
    change_column :bookings, :hours, :decimal, precision: 5, scale: 2, null: false
  end
end
