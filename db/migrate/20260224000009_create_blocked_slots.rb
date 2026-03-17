class CreateBlockedSlots < ActiveRecord::Migration[8.0]
  def change
    create_table :blocked_slots do |t|
      t.references :branch, null: false, foreign_key: true
      t.references :court, null: false, foreign_key: true
      t.date :date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.text :reason

      t.timestamps
    end

    add_index :blocked_slots, [:court_id, :date]

    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE blocked_slots
            ADD CONSTRAINT no_overlapping_blocked_slots
            EXCLUDE USING gist (
              court_id WITH =,
              date WITH =,
              tsrange(
                (DATE '2000-01-01' + start_time)::timestamp,
                (DATE '2000-01-01' + end_time)::timestamp
              ) WITH &&
            );
        SQL
      end

      dir.down do
        execute "ALTER TABLE blocked_slots DROP CONSTRAINT IF EXISTS no_overlapping_blocked_slots;"
      end
    end
  end
end
