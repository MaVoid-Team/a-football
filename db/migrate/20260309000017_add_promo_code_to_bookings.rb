class AddPromoCodeToBookings < ActiveRecord::Migration[7.0]
  def change
    unless column_exists?(:bookings, :promo_code_id)
      # We add the index explicitly below with guards to avoid duplicate-index failures.
      add_reference :bookings, :promo_code, null: true, foreign_key: true, index: false
    end

    add_foreign_key :bookings, :promo_codes, column: :promo_code_id unless foreign_key_exists?(:bookings, :promo_codes, column: :promo_code_id)
    add_column :bookings, :original_price, :decimal, precision: 8, scale: 2 unless column_exists?(:bookings, :original_price)
    add_column :bookings, :discount_amount, :decimal, precision: 8, scale: 2, default: 0 unless column_exists?(:bookings, :discount_amount)
    add_index :bookings, :promo_code_id, if_not_exists: true
  end
end
