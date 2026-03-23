class AddPlayerExperienceModels < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :phone, null: false
      t.string :email, null: false
      t.string :password_digest, null: false
      t.integer :skill_level, null: false, default: 1

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :phone, unique: true

    create_table :user_teams do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :teammate_name, null: false
      t.string :teammate_phone, null: false
      t.string :teammate_email
      t.integer :teammate_skill_level, null: false, default: 1

      t.timestamps
    end

    add_index :user_teams, [:user_id, :name]

    create_table :user_notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :notification_type, null: false
      t.string :title, null: false
      t.text :body, null: false
      t.string :link_url
      t.jsonb :data, null: false, default: {}
      t.datetime :read_at

      t.timestamps
    end

    add_index :user_notifications, [:user_id, :created_at]
    add_index :user_notifications, [:user_id, :read_at]

    add_reference :bookings, :user, foreign_key: true
  end
end
