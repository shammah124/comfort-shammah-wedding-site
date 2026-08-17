class CreateSupportDetailsAndContacts < ActiveRecord::Migration[8.0]
  def change
    create_table :support_details do |t|
      t.string :heading, null: false, default: "Support and Gifts"
      t.string :bank_name
      t.string :account_name
      t.string :account_number
      t.string :sort_code
      t.text :note

      t.timestamps
    end

    create_table :planning_contacts do |t|
      t.string :name, null: false
      t.string :position, null: false
      t.string :phone
      t.string :whatsapp_url
      t.integer :display_order, null: false, default: 0

      t.timestamps
    end
  end
end
