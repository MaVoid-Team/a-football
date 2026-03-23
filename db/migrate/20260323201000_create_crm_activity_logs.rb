class CreateCrmActivityLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :activity_logs do |t|
      t.string :player_type
      t.bigint :player_id
      t.string :activity_type, null: false
      t.string :reference_type
      t.bigint :reference_id
      t.bigint :branch_id
      t.bigint :actor_admin_id
      t.jsonb :metadata, null: false, default: {}
      t.timestamps
    end

    add_index :activity_logs, [:player_type, :player_id, :created_at], name: "idx_activity_logs_player_timeline"
    add_index :activity_logs, [:branch_id, :created_at], name: "idx_activity_logs_branch_feed"
    add_index :activity_logs, [:activity_type, :created_at], name: "idx_activity_logs_type_created_at"
    add_index :activity_logs, [:reference_type, :reference_id], name: "idx_activity_logs_reference"

    add_foreign_key :activity_logs, :branches, column: :branch_id
    add_foreign_key :activity_logs, :admins, column: :actor_admin_id
  end
end
