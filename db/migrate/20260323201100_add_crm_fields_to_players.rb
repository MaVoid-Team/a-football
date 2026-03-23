class AddCrmFieldsToPlayers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :last_activity_date, :datetime
    add_column :users, :total_bookings, :integer, null: false, default: 0
    add_column :users, :total_matches, :integer, null: false, default: 0
    add_column :users, :total_tournaments, :integer, null: false, default: 0
    add_column :users, :tags, :text, array: true, null: false, default: []

    add_column :tournament_players, :last_activity_date, :datetime
    add_column :tournament_players, :total_bookings, :integer, null: false, default: 0
    add_column :tournament_players, :total_matches, :integer, null: false, default: 0
    add_column :tournament_players, :total_tournaments, :integer, null: false, default: 0
    add_column :tournament_players, :tags, :text, array: true, null: false, default: []

    add_index :users, :tags, using: :gin
    add_index :tournament_players, :tags, using: :gin
    add_index :users, :last_activity_date
    add_index :tournament_players, :last_activity_date
  end
end
