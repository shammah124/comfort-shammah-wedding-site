class GoodwillMessage < ApplicationRecord
  validates :name, presence: true, length: { maximum: 80 }
  validates :message, presence: true, length: { maximum: 2_000 }

  before_validation :normalize_content

  scope :latest_first, -> { order(created_at: :desc) }

  private

  def normalize_content
    self.name = name.to_s.strip
    self.message = message.to_s.strip
  end
end
