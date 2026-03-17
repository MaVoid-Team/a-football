class CreateBranches < ActiveRecord::Migration[8.0]
  def change
    create_table :branches do |t|
      t.string :name, null: false
      t.text :address
      t.string :timezone, null: false, default: "UTC"
      t.boolean :active, null: false, default: true

      t.timestamps
    end
  end
end
