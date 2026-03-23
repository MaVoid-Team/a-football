class CreateTournamentCoreTables < ActiveRecord::Migration[8.1]
  def change
    create_table :tournaments do |t|
      t.references :branch, null: false, foreign_key: true
      t.references :created_by, null: true, foreign_key: { to_table: :admins }
      t.string :name, null: false
      t.integer :tournament_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.integer :max_players
      t.integer :max_teams
      t.datetime :start_date, null: false
      t.datetime :end_date
      t.datetime :registration_deadline, null: false
      t.integer :match_duration_minutes, null: false, default: 60
      t.integer :points_win, null: false, default: 3
      t.integer :points_loss, null: false, default: 0
      t.jsonb :bracket_data, null: false, default: {}
      t.boolean :manual_seeding, null: false, default: false
      t.text :description

      t.timestamps
    end

    add_index :tournaments, :status
    add_index :tournaments, :tournament_type
    add_index :tournaments, [:branch_id, :start_date]

    create_table :tournament_players do |t|
      t.references :tournament, null: false, foreign_key: true
      t.bigint :user_id
      t.string :name, null: false
      t.string :phone, null: false
      t.integer :skill_level, null: false, default: 1
      t.integer :status, null: false, default: 0
      t.integer :ranking_points

      t.timestamps
    end

    add_index :tournament_players, [:tournament_id, :phone]
    add_index :tournament_players, [:tournament_id, :user_id], unique: true, where: "user_id IS NOT NULL", name: "idx_tournament_players_unique_user"

    create_table :tournament_teams do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :player1, null: false, foreign_key: { to_table: :tournament_players }
      t.references :player2, null: true, foreign_key: { to_table: :tournament_players }
      t.string :name, null: false
      t.integer :seeding_position
      t.integer :status, null: false, default: 0

      t.timestamps
    end

    add_index :tournament_teams, [:tournament_id, :seeding_position]

    create_table :tournament_registrations do |t|
      t.references :tournament, null: false, foreign_key: true
      t.references :player, null: false, foreign_key: { to_table: :tournament_players }
      t.references :team, null: true, foreign_key: { to_table: :tournament_teams }
      t.references :approved_by, null: true, foreign_key: { to_table: :admins }
      t.integer :status, null: false, default: 0
      t.integer :refund_status, null: false, default: 0
      t.text :notes

      t.timestamps
    end

    add_index :tournament_registrations, [:tournament_id, :status]
    add_index :tournament_registrations, [:tournament_id, :player_id], unique: true

    create_table :tournament_matches do |t|
      t.references :tournament, null: false, foreign_key: true
      t.integer :round_number, null: false
      t.integer :match_number, null: false
      t.references :team1, null: true, foreign_key: { to_table: :tournament_teams }
      t.references :team2, null: true, foreign_key: { to_table: :tournament_teams }
      t.references :winner, null: true, foreign_key: { to_table: :tournament_teams }
      t.references :court, null: true, foreign_key: true
      t.integer :status, null: false, default: 0
      t.datetime :scheduled_time
      t.jsonb :score, null: false, default: {}

      t.timestamps
    end

    add_index :tournament_matches, [:tournament_id, :round_number, :match_number], unique: true, name: "idx_tournament_matches_round_order"
    add_index :tournament_matches, [:tournament_id, :status]
    add_index :tournament_matches, [:court_id, :scheduled_time]
  end
end
