class CreateRsvps < ActiveRecord::Migration[8.0]
  def change
    create_table :rsvps do |t|
      t.string :name
      t.string :email
      t.string :attendance
      t.integer :guest_count
      t.text :message

      t.timestamps
    end
  end
end
