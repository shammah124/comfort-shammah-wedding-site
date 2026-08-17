class CreateLiveUpdates < ActiveRecord::Migration[8.0]
  def change
    create_table :live_updates do |t|
      t.string :context, null: false, default: "General"
      t.text :message, null: false
      t.string :author_name
      t.datetime :published_at, null: false, default: -> { "CURRENT_TIMESTAMP" }

      t.timestamps
    end
  end
end
