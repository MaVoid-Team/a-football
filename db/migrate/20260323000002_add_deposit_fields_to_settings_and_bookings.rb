class AddDepositFieldsToSettingsAndBookings < ActiveRecord::Migration[8.1]
  def up
    add_column :settings, :deposit_enabled, :boolean, default: false, null: false
    add_column :settings, :deposit_percentage, :decimal, precision: 5, scale: 2, default: 0, null: false

    add_column :bookings, :payment_option, :integer, default: 0, null: false
    add_column :bookings, :deposit_percentage_snapshot, :decimal, precision: 5, scale: 2, default: 0, null: false
    add_column :bookings, :amount_due_now, :decimal, precision: 10, scale: 2, default: 0, null: false
    add_column :bookings, :amount_remaining, :decimal, precision: 10, scale: 2, default: 0, null: false

    execute <<~SQL.squish
      UPDATE bookings
      SET amount_due_now = total_price,
          amount_remaining = 0,
          deposit_percentage_snapshot = 0,
          payment_option = 0
    SQL
  end

  def down
    remove_column :bookings, :amount_remaining
    remove_column :bookings, :amount_due_now
    remove_column :bookings, :deposit_percentage_snapshot
    remove_column :bookings, :payment_option

    remove_column :settings, :deposit_percentage
    remove_column :settings, :deposit_enabled
  end
end
