class AddBookingTermsToSettings < ActiveRecord::Migration[7.0]
  def change
    add_column :settings, :booking_terms, :text
  end
end