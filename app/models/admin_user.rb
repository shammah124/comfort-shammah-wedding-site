class AdminUser < ApplicationRecord
  PERMISSIONS = {
    "site_settings" => "Portal settings",
    "programmes" => "Church and reception programmes",
    "galleries" => "Gallery and video files",
    "live_updates" => "Live updates",
    "goodwill_messages" => "Goodwill messages",
    "support" => "Support and gift accounts",
    "planning_team" => "Planning team",
    "rsvps" => "RSVP dashboard"
  }.freeze

  has_secure_password

  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 8 }, allow_nil: true
  validates :role, inclusion: { in: %w[super_admin admin] }

  before_validation :normalize_name

  scope :active, -> { where(active: true) }

  def super_admin?
    role == "super_admin"
  end

  def permissions
    return PERMISSIONS.keys if super_admin?

    JSON.parse(permissions_json.to_s) & PERMISSIONS.keys
  rescue JSON::ParserError
    []
  end

  def permissions=(values)
    self.permissions_json = JSON.generate(Array(values).map(&:to_s) & PERMISSIONS.keys)
  end

  def allowed?(permission)
    super_admin? || permissions.include?(permission.to_s)
  end

  def session_payload
    {
      id: id,
      name: name,
      role: role,
      super_admin: super_admin?,
      permissions: permissions
    }
  end

  def management_payload
    session_payload.merge(active: active, last_sign_in_at: last_sign_in_at, created_at: created_at)
  end

  def self.bootstrap_primary!
    super_admin = find_by(role: "super_admin")
    return super_admin if super_admin

    password = ENV.fetch("ADMIN_PASSWORD", "Cosh@2026")
    create!(
      name: ENV.fetch("PRIMARY_ADMIN_NAME", "Primary Admin"),
      password: password,
      password_confirmation: password,
      role: "super_admin",
      active: true
    )
  rescue ActiveRecord::RecordNotUnique
    find_by!(role: "super_admin")
  end

  private

  def normalize_name
    self.name = name.to_s.squish
  end
end
