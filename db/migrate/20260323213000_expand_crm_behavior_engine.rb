class ExpandCrmBehaviorEngine < ActiveRecord::Migration[8.0]
  def change
    add_column :segments, :auto_update, :boolean, default: true, null: false

    add_column :users, :no_show_count, :integer, default: 0, null: false
    add_column :users, :cancellation_count, :integer, default: 0, null: false

    add_column :tournament_players, :no_show_count, :integer, default: 0, null: false
    add_column :tournament_players, :cancellation_count, :integer, default: 0, null: false

    create_table :segment_memberships do |t|
      t.references :segment, null: false, foreign_key: true
      t.string :player_type, null: false
      t.bigint :player_id, null: false
      t.bigint :branch_id
      t.datetime :matched_at, null: false
      t.timestamps
    end

    add_index :segment_memberships, [:segment_id, :player_type, :player_id], unique: true, name: "idx_segment_memberships_unique_player"
    add_index :segment_memberships, [:player_type, :player_id]
    add_foreign_key :segment_memberships, :branches, column: :branch_id

    create_table :automation_rules do |t|
      t.string :name, null: false
      t.string :trigger_type, null: false
      t.jsonb :conditions, null: false, default: {}
      t.string :action_type, null: false
      t.references :template, foreign_key: { to_table: :message_templates }
      t.boolean :is_active, null: false, default: true
      t.bigint :branch_id
      t.bigint :created_by_admin_id
      t.timestamps
    end

    add_index :automation_rules, [:branch_id, :is_active]
    add_index :automation_rules, :trigger_type
    add_foreign_key :automation_rules, :branches, column: :branch_id
    add_foreign_key :automation_rules, :admins, column: :created_by_admin_id

    create_table :action_items do |t|
      t.string :player_type, null: false
      t.bigint :player_id, null: false
      t.references :automation_rule, foreign_key: true
      t.references :suggested_template, foreign_key: { to_table: :message_templates }
      t.bigint :branch_id
      t.text :reason, null: false
      t.string :status, null: false, default: "pending"
      t.bigint :acted_by_admin_id
      t.datetime :completed_at
      t.datetime :ignored_at
      t.timestamps
    end

    add_index :action_items, [:branch_id, :status]
    add_index :action_items, [:player_type, :player_id]
    add_foreign_key :action_items, :branches, column: :branch_id
    add_foreign_key :action_items, :admins, column: :acted_by_admin_id

    create_table :player_scores do |t|
      t.string :player_type, null: false
      t.bigint :player_id, null: false
      t.bigint :branch_id
      t.integer :engagement_score, null: false, default: 0
      t.integer :activity_score, null: false, default: 0
      t.integer :frequency_score, null: false, default: 0
      t.integer :reliability_score, null: false, default: 0
      t.integer :total_score, null: false, default: 0
      t.datetime :calculated_at
      t.timestamps
    end

    add_index :player_scores, [:player_type, :player_id], unique: true
    add_index :player_scores, :total_score
    add_foreign_key :player_scores, :branches, column: :branch_id

    create_table :behavior_flags do |t|
      t.string :player_type, null: false
      t.bigint :player_id, null: false
      t.bigint :branch_id
      t.string :flag_type, null: false
      t.text :reason, null: false
      t.boolean :active, null: false, default: true
      t.datetime :assigned_at, null: false
      t.timestamps
    end

    add_index :behavior_flags, [:player_type, :player_id, :flag_type, :active], name: "idx_behavior_flags_player_flag_active"
    add_index :behavior_flags, [:branch_id, :active]
    add_foreign_key :behavior_flags, :branches, column: :branch_id

    create_table :crm_scoring_settings do |t|
      t.bigint :branch_id, null: false
      t.integer :activity_weight, null: false, default: 30
      t.integer :frequency_weight, null: false, default: 25
      t.integer :engagement_weight, null: false, default: 25
      t.integer :reliability_weight, null: false, default: 20
      t.timestamps
    end

    add_index :crm_scoring_settings, :branch_id, unique: true
    add_foreign_key :crm_scoring_settings, :branches, column: :branch_id
  end
end
