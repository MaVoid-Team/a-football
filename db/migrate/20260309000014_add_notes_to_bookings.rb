class AddNotesToBookings < ActiveRecord::Migration[7.1]
  def change
    add_column :bookings, :notes, :text
  end
end
