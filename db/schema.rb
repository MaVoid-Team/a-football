# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_20_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "btree_gist"
  enable_extension "pg_catalog.plpgsql"

  create_table "admins", force: :cascade do |t|
    t.bigint "branch_id"
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.integer "role", default: 1, null: false
    t.datetime "updated_at", null: false
    t.index ["branch_id"], name: "index_admins_on_branch_id"
    t.index ["email"], name: "index_admins_on_email", unique: true
  end

  create_table "blocked_slots", force: :cascade do |t|
    t.bigint "branch_id", null: false
    t.bigint "court_id", null: false
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.time "end_time", null: false
    t.text "reason"
    t.time "start_time", null: false
    t.datetime "updated_at", null: false
    t.index ["branch_id"], name: "index_blocked_slots_on_branch_id"
    t.index ["court_id", "date"], name: "index_blocked_slots_on_court_id_and_date"
    t.index ["court_id"], name: "index_blocked_slots_on_court_id"
    t.exclusion_constraint "court_id WITH =, date WITH =, tsrange(('2000-01-01'::date + start_time), ('2000-01-01'::date + end_time)) WITH &&", using: :gist, name: "no_overlapping_blocked_slots"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "branch_id", null: false
    t.bigint "court_id", null: false
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.time "end_time", null: false
    t.decimal "hours", precision: 5, scale: 2, null: false
    t.integer "lock_version", default: 0, null: false
    t.integer "payment_status", default: 0, null: false
    t.time "start_time", null: false
    t.integer "status", default: 0, null: false
    t.decimal "total_price", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.string "user_name", null: false
    t.string "user_phone", null: false
    t.index ["branch_id"], name: "index_bookings_on_branch_id"
    t.index ["court_id", "date", "start_time"], name: "index_bookings_on_court_id_and_date_and_start_time", unique: true
    t.index ["court_id", "date"], name: "index_bookings_on_court_id_and_date"
    t.index ["court_id"], name: "index_bookings_on_court_id"
    t.index ["status"], name: "index_bookings_on_status"
    t.exclusion_constraint "court_id WITH =, date WITH =, tsrange(('2000-01-01'::date + start_time), ('2000-01-01'::date + end_time)) WITH &&", where: "status = 0", using: :gist, name: "no_overlapping_confirmed_bookings"
  end

  create_table "branches", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.text "address"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "timezone", default: "UTC", null: false
    t.datetime "updated_at", null: false
  end

  create_table "courts", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.bigint "branch_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.decimal "price_per_hour", precision: 10, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.index ["branch_id", "active"], name: "index_courts_on_branch_id_and_active"
    t.index ["branch_id"], name: "index_courts_on_branch_id"
  end

  create_table "event_bookings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "event_id", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.string "user_name", null: false
    t.string "user_phone", null: false
    t.index ["event_id", "status"], name: "index_event_bookings_on_event_id_and_status"
    t.index ["event_id"], name: "index_event_bookings_on_event_id"
  end

  create_table "events", force: :cascade do |t|
    t.bigint "branch_id", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "max_participants", null: false
    t.decimal "participation_price", precision: 10, scale: 2, null: false
    t.datetime "start_date", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["branch_id"], name: "index_events_on_branch_id"
  end

  create_table "packages", force: :cascade do |t|
    t.bigint "branch_id"
    t.datetime "created_at", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["branch_id"], name: "index_packages_on_branch_id"
  end

  create_table "payments", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.bigint "booking_id", null: false
    t.datetime "created_at", null: false
    t.string "provider"
    t.jsonb "raw_payload", default: {}
    t.string "status", default: "pending", null: false
    t.string "transaction_id"
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_payments_on_booking_id"
    t.index ["transaction_id"], name: "index_payments_on_transaction_id"
  end

  create_table "settings", force: :cascade do |t|
    t.bigint "branch_id", null: false
    t.integer "closing_hour", default: 23, null: false
    t.string "contact_email"
    t.string "contact_phone"
    t.datetime "created_at", null: false
    t.integer "opening_hour", default: 8, null: false
    t.datetime "updated_at", null: false
    t.string "whatsapp_number"
    t.index ["branch_id"], name: "index_settings_on_branch_id", unique: true
  end

  add_foreign_key "admins", "branches"
  add_foreign_key "blocked_slots", "branches"
  add_foreign_key "blocked_slots", "courts"
  add_foreign_key "bookings", "branches"
  add_foreign_key "bookings", "courts"
  add_foreign_key "courts", "branches"
  add_foreign_key "event_bookings", "events"
  add_foreign_key "events", "branches"
  add_foreign_key "packages", "branches"
  add_foreign_key "payments", "bookings"
  add_foreign_key "settings", "branches"
end
