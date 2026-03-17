class CreateAdmins < ActiveRecord::Migration[8.0]
  def change
    create_table :admins do |t|
      t.references :branch, null: true, foreign_key: true
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :role, null: false, default: 1

      t.timestamps
    end

    add_index :admins, :email, unique: true
  end
end
