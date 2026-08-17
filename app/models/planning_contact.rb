class PlanningContact < ApplicationRecord
  validates :name, presence: true
  validates :position, presence: true

  scope :ordered, -> { order(display_order: :asc, created_at: :asc) }
end
