class CreateAdminUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :admin_users do |t|
      t.string :name, null: false
      t.string :password_digest, null: false
      t.string :role, null: false, default: "admin"
      t.text :permissions_json, null: false, default: "[]"
      t.boolean :active, null: false, default: true
      t.datetime :last_sign_in_at

      t.timestamps
    end

    add_index :admin_users, "LOWER(name)", unique: true, name: "index_admin_users_on_lower_name"
  end
end
