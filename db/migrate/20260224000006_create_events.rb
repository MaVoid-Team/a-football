class CreateEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :events do |t|
      t.references :branch, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.datetime :start_date, null: false
      t.decimal :participation_price, precision: 10, scale: 2, null: false
      t.integer :max_participants, null: false

      t.timestamps
    end
  end
end
