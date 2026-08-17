class LiveUpdate < ApplicationRecord
  CONTEXTS = %w[General Church Reception].freeze

  validates :context, inclusion: { in: CONTEXTS }
  validates :message, presence: true

  scope :latest_first, -> { order(published_at: :desc, created_at: :desc) }
end
