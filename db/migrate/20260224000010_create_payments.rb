class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true
      t.string :provider
      t.string :status, null: false, default: "pending"
      t.string :transaction_id
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.jsonb :raw_payload, default: {}

      t.timestamps
    end

    add_index :payments, :transaction_id
  end
end
