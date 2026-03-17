class AddOperatingHoursToSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :settings, :opening_hour, :integer, default: 8, null: false
    add_column :settings, :closing_hour, :integer, default: 23, null: false
  end
end
