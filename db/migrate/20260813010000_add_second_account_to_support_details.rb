class AddSecondAccountToSupportDetails < ActiveRecord::Migration[8.0]
  def change
    add_column :support_details, :secondary_bank_name, :string
    add_column :support_details, :secondary_account_name, :string
    add_column :support_details, :secondary_account_number, :string
    add_column :support_details, :secondary_sort_code, :string
  end
end
