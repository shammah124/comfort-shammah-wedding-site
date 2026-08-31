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

ActiveRecord::Schema[8.0].define(version: 2026_08_31_120000) do
  create_table "admin_users", force: :cascade do |t|
    t.string "name", null: false
    t.string "password_digest", null: false
    t.string "role", default: "admin", null: false
    t.text "permissions_json", default: "[]", null: false
    t.boolean "active", default: true, null: false
    t.datetime "last_sign_in_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "LOWER(name)", name: "index_admin_users_on_lower_name", unique: true
  end

  create_table "goodwill_messages", force: :cascade do |t|
    t.string "name", null: false
    t.text "message", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_goodwill_messages_on_created_at"
  end

  create_table "live_updates", force: :cascade do |t|
    t.string "context", default: "General", null: false
    t.text "message", null: false
    t.string "author_name"
    t.datetime "published_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "planning_contacts", force: :cascade do |t|
    t.string "name", null: false
    t.string "position", null: false
    t.string "phone"
    t.integer "display_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "photo_url"
  end

  create_table "rsvps", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "attendance"
    t.integer "guest_count"
    t.text "message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "site_settings", force: :cascade do |t|
    t.string "portal_mode", default: "auto", null: false
    t.datetime "switch_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "church_programme_url"
    t.string "reception_programme_url"
    t.string "church_direction_url"
    t.string "reception_direction_url"
    t.text "wedding_gallery_items_json"
    t.text "prewedding_gallery_items_json"
    t.text "video_gallery_items_json"
  end

  create_table "support_details", force: :cascade do |t|
    t.string "heading", default: "Support and Gifts", null: false
    t.string "bank_name"
    t.string "account_name"
    t.string "account_number"
    t.string "sort_code"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "secondary_bank_name"
    t.string "secondary_account_name"
    t.string "secondary_account_number"
    t.string "secondary_sort_code"
  end
end
