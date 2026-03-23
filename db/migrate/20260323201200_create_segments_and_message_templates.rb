class CreateSegmentsAndMessageTemplates < ActiveRecord::Migration[8.0]
  def up
    create_table :segments do |t|
      t.string :name, null: false
      t.jsonb :conditions, null: false, default: {}
      t.boolean :active, null: false, default: true
      t.bigint :branch_id
      t.timestamps
    end

    add_index :segments, [:name, :branch_id], unique: true
    add_foreign_key :segments, :branches, column: :branch_id

    create_table :message_templates do |t|
      t.string :name, null: false
      t.text :content, null: false
      t.string :whatsapp_number, null: false
      t.boolean :active, null: false, default: true
      t.bigint :branch_id
      t.timestamps
    end

    add_index :message_templates, [:name, :branch_id], unique: true
    add_foreign_key :message_templates, :branches, column: :branch_id

    seed_default_segments
  end

  def down
    drop_table :message_templates
    drop_table :segments
  end

  private

  def seed_default_segments
    now = Time.current

    execute <<~SQL.squish
      INSERT INTO segments (name, conditions, active, branch_id, created_at, updated_at)
      VALUES
        ('active', '{"operator":"all","rules":[{"field":"last_activity_days","op":"lte","value":7}]}'::jsonb, true, NULL, '#{now.to_s(:db)}', '#{now.to_s(:db)}'),
        ('inactive', '{"operator":"all","rules":[{"field":"last_activity_days","op":"gte","value":30}]}'::jsonb, true, NULL, '#{now.to_s(:db)}', '#{now.to_s(:db)}'),
        ('frequent', '{"operator":"all","rules":[{"field":"total_bookings","op":"gte","value":3}]}'::jsonb, true, NULL, '#{now.to_s(:db)}', '#{now.to_s(:db)}'),
        ('tournament_players', '{"operator":"all","rules":[{"field":"total_tournaments","op":"gte","value":1}]}'::jsonb, true, NULL, '#{now.to_s(:db)}', '#{now.to_s(:db)}')
    SQL
  end
end
