class CreatePromoCodes < ActiveRecord::Migration[7.0]
  def change
    create_table :promo_codes do |t|
      t.string :code, null: false, index: { unique: true }
      t.string :description
      t.decimal :discount_percentage, precision: 5, scale: 2
      t.decimal :discount_amount, precision: 8, scale: 2
      t.decimal :minimum_amount, precision: 8, scale: 2
      t.integer :usage_limit
      t.integer :used_count, default: 0
      t.datetime :starts_at
      t.datetime :expires_at
      t.boolean :active, default: true
      t.references :branch, null: false, foreign_key: true
      t.timestamps

      t.index :expires_at
      t.index :active
    end
  end
end
