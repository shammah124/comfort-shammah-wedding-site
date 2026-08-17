class AddDynamicContentFieldsToSiteSettings < ActiveRecord::Migration[8.0]
  def change
    add_column :site_settings, :church_programme_url, :string
    add_column :site_settings, :reception_programme_url, :string
    add_column :site_settings, :church_direction_url, :string
    add_column :site_settings, :reception_direction_url, :string
    add_column :site_settings, :wedding_gallery_items_json, :text
    add_column :site_settings, :prewedding_gallery_items_json, :text
    add_column :site_settings, :video_gallery_items_json, :text
  end
end
