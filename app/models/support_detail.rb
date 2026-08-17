class SupportDetail < ApplicationRecord
  def self.current
    first_or_create!(
      heading: "Support and Gifts",
      note: "Support and gift details will be shared here once finalized."
    )
  end
end
