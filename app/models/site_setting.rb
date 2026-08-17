class SiteSetting < ApplicationRecord
  PORTAL_MODES = %w[auto invitation main].freeze

  validates :portal_mode, inclusion: { in: PORTAL_MODES }

  def wedding_gallery_items
    parse_json_list(wedding_gallery_items_json, default_gallery_items("wedding"))
  end

  def prewedding_gallery_items
    parse_json_list(prewedding_gallery_items_json, default_gallery_items("prewedding"))
  end

  def video_gallery_items
    parse_json_list(video_gallery_items_json, default_video_items)
  end

  def self.current
    setting = first_or_create!(
      portal_mode: "auto",
      switch_at: Time.zone.local(2026, 10, 17, 0, 0, 0),
      church_programme_url: "/programmes/church",
      reception_programme_url: "/programmes/reception",
      church_direction_url: "https://maps.google.com/?q=ECWA%20Headquarters%20Church%2C%20Jos",
      reception_direction_url: "https://maps.google.com/?q=ECWA%20Headquarters%20International%20Conference%20Hall%2C%20Jos"
    )
    if setting.switch_at.blank? && setting.portal_mode == "auto"
      setting.update!(switch_at: Time.zone.local(2026, 10, 17, 0, 0, 0))
    end
    setting
  end

  def portal_state(now = Time.current)
    return "main" if portal_mode == "main"
    return "invitation" if portal_mode == "invitation"

    switch_at.present? && now >= switch_at ? "main" : "invitation"
  end

  def frontend_payload(now = Time.current)
    {
      portal_mode: portal_mode,
      switch_at: switch_at&.iso8601,
      portal_state: portal_state(now),
      manual_override: portal_mode != "auto",
      church_programme_url: church_programme_url,
      reception_programme_url: reception_programme_url,
      church_direction_url: church_direction_url,
      reception_direction_url: reception_direction_url,
      wedding_gallery_items: wedding_gallery_items,
      prewedding_gallery_items: prewedding_gallery_items,
      video_gallery_items: video_gallery_items
    }
  end

  private

  def parse_json_list(raw, fallback)
    return fallback if raw.blank?

    JSON.parse(raw)
  rescue JSON::ParserError
    fallback
  end

  def default_gallery_items(kind)
    if kind == "wedding"
      [
        { "src" => "/gallery/wedding-1.svg", "alt" => "Wedding glow one", "caption" => "Golden evening light", "downloadName" => "wedding-1.svg" },
        { "src" => "/gallery/wedding-2.svg", "alt" => "Wedding glow two", "caption" => "Graceful portrait moment", "downloadName" => "wedding-2.svg" },
        { "src" => "/gallery/wedding-3.svg", "alt" => "Wedding glow three", "caption" => "Together in bloom", "downloadName" => "wedding-3.svg" },
        { "src" => "/gallery/wedding-4.svg", "alt" => "Wedding glow four", "caption" => "Soft ceremonial frame", "downloadName" => "wedding-4.svg" }
      ]
    else
      [
        { "src" => "/gallery/prewedding-1.svg", "alt" => "Pre-wedding one", "caption" => "Warm planning session", "downloadName" => "prewedding-1.svg" },
        { "src" => "/gallery/prewedding-2.svg", "alt" => "Pre-wedding two", "caption" => "Elegant monogram pose", "downloadName" => "prewedding-2.svg" },
        { "src" => "/gallery/prewedding-3.svg", "alt" => "Pre-wedding three", "caption" => "Promise and anticipation", "downloadName" => "prewedding-3.svg" },
        { "src" => "/gallery/prewedding-4.svg", "alt" => "Pre-wedding four", "caption" => "Editorial-style portrait", "downloadName" => "prewedding-4.svg" }
      ]
    end
  end

  def default_video_items
    [
      { "title" => "Teaser clip 1" },
      { "title" => "Teaser clip 2" },
      { "title" => "Teaser clip 3" }
    ]
  end
end
