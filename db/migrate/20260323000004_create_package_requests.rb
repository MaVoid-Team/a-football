class CreatePackageRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :package_requests do |t|
      t.references :package, null: false, foreign_key: true
      t.references :branch, null: true, foreign_key: true
      t.string :customer_name, null: false
      t.string :customer_email, null: false
      t.string :customer_phone, null: false
      t.text :special_needs
      t.string :status, default: "pending", null: false

      t.timestamps
    end

    add_index :package_requests, :status
    add_index :package_requests, :branch_id
    add_index :package_requests, :created_at
  end
end
