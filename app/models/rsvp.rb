class Rsvp < ApplicationRecord
  validates :name, presence: true
  validates :attendance, inclusion: { in: %w[yes no] }
  validates :guest_count, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 10 }, allow_nil: true
end
