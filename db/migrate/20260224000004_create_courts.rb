class CreateCourts < ActiveRecord::Migration[8.0]
  def change
    create_table :courts do |t|
      t.references :branch, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :price_per_hour, precision: 10, scale: 2, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :courts, [:branch_id, :active]
  end
end
