class AddPaymentNumberToSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :settings, :payment_number, :string
  end
end
