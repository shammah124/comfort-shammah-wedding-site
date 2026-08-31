class CreateGoodwillMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :goodwill_messages do |t|
      t.string :name, null: false
      t.text :message, null: false

      t.timestamps
    end

    add_index :goodwill_messages, :created_at
  end
end
