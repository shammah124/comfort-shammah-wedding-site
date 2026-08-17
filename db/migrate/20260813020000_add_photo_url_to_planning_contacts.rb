class AddPhotoUrlToPlanningContacts < ActiveRecord::Migration[8.0]
  def change
    add_column :planning_contacts, :photo_url, :string
  end
end
