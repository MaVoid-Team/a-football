class AddTournamentNotificationSettingsAndPlayerEmail < ActiveRecord::Migration[8.1]
  def change
    add_column :settings, :tournament_registration_admin_email, :string
    add_column :settings, :send_registration_alerts_to_global_recipient, :boolean, default: false, null: false

    add_column :tournament_players, :email, :string
    add_index :tournament_players, [:tournament_id, :email]
  end
end
