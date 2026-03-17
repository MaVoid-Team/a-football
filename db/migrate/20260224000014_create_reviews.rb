class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews, if_not_exists: true do |t|
      # booking_id needs a unique index; avoid creating the default index first.
      t.references :booking, null: false, foreign_key: true, index: false
      t.references :court,   null: false, foreign_key: true, index: false
      t.references :branch,  null: false, foreign_key: true, index: false

      t.string  :reviewer_name, null: false
      t.integer :rating,        null: false
      t.text    :body

      t.timestamps
    end

    if index_exists?(:reviews, :booking_id) && !index_exists?(:reviews, :booking_id, unique: true)
      remove_index :reviews, :booking_id
    end
    add_index :reviews, :booking_id, unique: true, if_not_exists: true
    add_index :reviews, [:court_id, :rating], if_not_exists: true
    add_index :reviews, [:branch_id, :rating], if_not_exists: true
  end
end
