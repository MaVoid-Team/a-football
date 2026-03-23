class AddAdminNotesToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :admin_notes, :text unless column_exists?(:bookings, :admin_notes)
  end
end
