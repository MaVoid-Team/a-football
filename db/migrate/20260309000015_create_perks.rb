class CreatePerks < ActiveRecord::Migration[7.1]
  def change
    create_table :perks do |t|
      t.references :court, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.boolean :active, default: true
      t.integer :position, default: 0

      t.timestamps
    end
    
    add_index :perks, [:court_id, :position]
    add_index :perks, :active
  end
end
