class CreateSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :settings do |t|
      t.references :branch, null: false, foreign_key: true, index: false
      t.string :whatsapp_number
      t.string :contact_email
      t.string :contact_phone

      t.timestamps
    end

    add_index :settings, :branch_id, unique: true
  end
end
