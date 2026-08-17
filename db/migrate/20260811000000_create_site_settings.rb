class CreateSiteSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :site_settings do |t|
      t.string :portal_mode, null: false, default: "auto"
      t.datetime :switch_at
      t.string :church_programme_url
      t.string :reception_programme_url
      t.string :church_direction_url
      t.string :reception_direction_url
      t.text :wedding_gallery_items_json
      t.text :prewedding_gallery_items_json
      t.text :video_gallery_items_json

      t.timestamps
    end
  end
end
