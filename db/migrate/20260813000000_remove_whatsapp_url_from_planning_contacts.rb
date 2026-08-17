class RemoveWhatsappUrlFromPlanningContacts < ActiveRecord::Migration[8.0]
  def change
    remove_column :planning_contacts, :whatsapp_url, :string
  end
end
