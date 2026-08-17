require "fileutils"

module Api
  class PlanningContactsController < ApplicationController
    IMAGE_EXTENSIONS = %w[.avif .gif .jpeg .jpg .png .webp].freeze
    MAX_PHOTO_SIZE = 10.megabytes

    skip_before_action :verify_authenticity_token
    before_action :refresh_photo_column_cache
    before_action :require_admin!, only: [:create, :update, :destroy]

    def index
      render json: { planning_contacts: PlanningContact.ordered }
    end

    def create
      validate_contact_photo!(contact_photo) if contact_photo.present?
      contact = PlanningContact.new(planning_contact_attributes)
      if contact.save
        save_contact_photo(contact, contact_photo) if contact_photo.present?
        render json: { success: true, planning_contact: contact.reload }, status: :created
      else
        render json: { success: false, errors: contact.errors.full_messages }, status: :unprocessable_entity
      end
    rescue StandardError => error
      render json: { success: false, errors: [error.message.presence || "Could not save the planning team member."] }, status: :unprocessable_entity
    end

    def update
      contact = PlanningContact.find(params[:id])
      validate_contact_photo!(contact_photo) if contact_photo.present?
      if contact.update(planning_contact_attributes)
        save_contact_photo(contact, contact_photo) if contact_photo.present?
        render json: { success: true, planning_contact: contact.reload }
      else
        render json: { success: false, errors: contact.errors.full_messages }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: { success: false, errors: ["Planning team member not found."] }, status: :not_found
    rescue StandardError => error
      render json: { success: false, errors: [error.message.presence || "Could not update the planning team member."] }, status: :unprocessable_entity
    end

    def destroy
      contact = PlanningContact.find(params[:id])
      delete_contact_photo(contact.photo_url)
      contact.destroy
      render json: { success: true }
    end

    private

    def planning_contact_params
      params.require(:planning_contact).permit(:name, :position, :phone, :display_order, :photo)
    end

    def refresh_photo_column_cache
      return if PlanningContact.attribute_names.include?("photo_url")

      PlanningContact.reset_column_information
    end

    def planning_contact_attributes
      planning_contact_params.except(:photo)
    end

    def contact_photo
      planning_contact_params[:photo]
    end

    def save_contact_photo(contact, file)
      validate_contact_photo!(file)

      folder = Rails.root.join("public", "uploads", "planning-team")
      base_name = File.basename(file.original_filename, ".*").parameterize.presence || "team-member"
      final_name = "#{base_name}-#{Time.current.strftime('%Y%m%d%H%M%S%L')}#{File.extname(file.original_filename).downcase}"
      photo_url = if ObjectStorage.configured?
        ObjectStorage.upload("planning-team/#{final_name}", file, content_type: file.content_type)
      else
        FileUtils.mkdir_p(folder)
        File.binwrite(folder.join(final_name), file.read)
        "/uploads/planning-team/#{final_name}"
      end

      delete_contact_photo(contact.photo_url)
      contact.update!(photo_url: photo_url)
    end

    def validate_contact_photo!(file)
      extension = File.extname(file.original_filename).downcase
      content_type = file.content_type.to_s
      accepted_content_type = content_type.blank? || content_type == "application/octet-stream" || content_type.start_with?("image/")
      unless IMAGE_EXTENSIONS.include?(extension) && accepted_content_type
        raise "Please upload a JPG, PNG, WEBP, GIF, or AVIF image."
      end

      raise "Planning team photos must be 10 MB or smaller." if file.size > MAX_PHOTO_SIZE
    end

    def delete_contact_photo(photo_url)
      if ObjectStorage.configured? && photo_url.to_s.match?(%r{\Ahttps?://}i)
        ObjectStorage.delete(photo_url)
        return
      end

      return unless photo_url.to_s.start_with?("/uploads/planning-team/")

      full_path = Rails.root.join("public", photo_url.delete_prefix("/"))
      File.delete(full_path) if File.exist?(full_path)
    end

    def require_admin!
      head :unauthorized unless session[:admin_signed_in] == true
    end
  end
end
