require "fileutils"

module Api
  class SiteSettingsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :require_admin!, only: [:update]
    before_action :require_admin!, only: [:media_upload, :media_delete, :programme_upload, :programme_delete]

    def show
      render json: { site_settings: SiteSetting.current.frontend_payload }
    end

    def update
      site_setting = SiteSetting.current

      if site_setting.update(site_setting_params)
        render json: { success: true, site_settings: site_setting.frontend_payload }
      else
        render json: { success: false, errors: site_setting.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def media_upload
      site_setting = SiteSetting.current
      kind = params[:kind].to_s
      file = params[:file]

      unless %w[wedding prewedding video].include?(kind)
        return render json: { success: false, errors: ["Unsupported media section."] }, status: :unprocessable_entity
      end

      if file.blank?
        return render json: { success: false, errors: ["Please choose a file to upload."] }, status: :unprocessable_entity
      end

      media = save_media_file(kind, file)
      items = gallery_items(site_setting, kind)
      items << media
      persist_gallery_items(site_setting, kind, items)

      render json: { success: true, site_settings: site_setting.frontend_payload, media: media }, status: :created
    rescue StandardError => e
      render json: { success: false, errors: [e.message] }, status: :unprocessable_entity
    end

    def media_delete
      site_setting = SiteSetting.current
      kind = params[:kind].to_s
      src = params[:src].to_s

      unless %w[wedding prewedding video].include?(kind)
        return render json: { success: false, errors: ["Unsupported media section."] }, status: :unprocessable_entity
      end

      items = gallery_items(site_setting, kind)
      next_items = items.reject { |item| item["src"].to_s == src }

      if next_items.length == items.length
        return render json: { success: false, errors: ["Media item not found."] }, status: :not_found
      end

      delete_media_file(src)
      persist_gallery_items(site_setting, kind, next_items)

      render json: { success: true, site_settings: site_setting.frontend_payload }
    rescue StandardError => e
      render json: { success: false, errors: [e.message] }, status: :unprocessable_entity
    end

    def programme_upload
      programme = params[:programme].to_s
      file = params[:file]

      unless %w[church reception].include?(programme)
        return render json: { success: false, errors: ["Unsupported programme."] }, status: :unprocessable_entity
      end

      if file.blank?
        return render json: { success: false, errors: ["Please choose a PDF file to upload."] }, status: :unprocessable_entity
      end

      unless File.extname(file.original_filename).downcase == ".pdf"
        return render json: { success: false, errors: ["Only PDF files can be uploaded for a programme."] }, status: :unprocessable_entity
      end

      site_setting = SiteSetting.current
      field = programme_setting_field(programme)
      delete_media_file(site_setting.public_send(field).to_s)
      site_setting.update!(field => save_programme_file(programme, file))

      render json: { success: true, site_settings: site_setting.frontend_payload }
    rescue StandardError => e
      render json: { success: false, errors: [e.message] }, status: :unprocessable_entity
    end

    def programme_delete
      programme = params[:programme].to_s

      unless %w[church reception].include?(programme)
        return render json: { success: false, errors: ["Unsupported programme."] }, status: :unprocessable_entity
      end

      site_setting = SiteSetting.current
      field = programme_setting_field(programme)
      delete_media_file(site_setting.public_send(field).to_s)
      site_setting.update!(field => "")

      render json: { success: true, site_settings: site_setting.frontend_payload }
    rescue StandardError => e
      render json: { success: false, errors: [e.message] }, status: :unprocessable_entity
    end

    private

    def site_setting_params
      params.require(:site_setting).permit(
        :portal_mode,
        :switch_at,
        :church_programme_url,
        :reception_programme_url,
        :church_direction_url,
        :reception_direction_url,
        :wedding_gallery_items_json,
        :prewedding_gallery_items_json,
        :video_gallery_items_json
      )
    end

    def gallery_items(site_setting, kind)
      case kind
      when "wedding"
        site_setting.wedding_gallery_items
      when "prewedding"
        site_setting.prewedding_gallery_items
      else
        site_setting.video_gallery_items
      end
    end

    def persist_gallery_items(site_setting, kind, items)
      field =
        case kind
        when "wedding"
          :wedding_gallery_items_json
        when "prewedding"
          :prewedding_gallery_items_json
        else
          :video_gallery_items_json
        end

      site_setting.update!(field => JSON.pretty_generate(items))
    end

    def programme_setting_field(programme)
      programme == "church" ? :church_programme_url : :reception_programme_url
    end

    def save_programme_file(programme, file)
      stamp = Time.current.strftime("%Y%m%d%H%M%S")
      final_name = "#{programme}-programme-#{stamp}.pdf"
      return ObjectStorage.upload("programmes/#{final_name}", file, content_type: "application/pdf") if ObjectStorage.configured?

      folder = Rails.root.join("public", "uploads", "programmes")
      FileUtils.mkdir_p(folder)
      File.binwrite(folder.join(final_name), file.read)

      "/uploads/programmes/#{final_name}"
    end

    def save_media_file(kind, file)
      extension = File.extname(file.original_filename).downcase
      raise "File type not allowed." if extension.blank?

      storage_folder =
        case kind
        when "video"
          "videos"
        else
          "gallery"
        end

      base_name = File.basename(file.original_filename, ".*").parameterize.presence || "upload"
      stamp = Time.current.strftime("%Y%m%d%H%M%S")
      final_name = "#{base_name}-#{stamp}#{extension}"
      src = if ObjectStorage.configured?
        ObjectStorage.upload("#{storage_folder}/#{final_name}", file, content_type: file.content_type)
      else
        folder = Rails.root.join("public", "uploads", storage_folder)
        FileUtils.mkdir_p(folder)
        File.binwrite(folder.join(final_name), file.read)
        "/uploads/#{storage_folder}/#{final_name}"
      end

      if kind == "video"
        { "src" => src, "title" => file.original_filename }
      else
        { "src" => src, "alt" => file.original_filename, "caption" => file.original_filename, "downloadName" => final_name }
      end
    end

    def delete_media_file(src)
      if ObjectStorage.configured? && src.match?(%r{\Ahttps?://}i)
        ObjectStorage.delete(src)
        return
      end

      return unless src.start_with?("/uploads/")

      full_path = Rails.root.join("public", src.delete_prefix("/"))
      File.delete(full_path) if File.exist?(full_path)
    end

    def require_admin!
      head :unauthorized unless session[:admin_signed_in] == true
    end
  end
end
