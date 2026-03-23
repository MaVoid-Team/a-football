class AddScheduleControlsToTournamentMatches < ActiveRecord::Migration[8.1]
  def change
    add_column :tournament_matches, :schedule_locked, :boolean, null: false, default: false
    add_column :tournament_matches, :schedule_lock_reason, :text
  end
end
