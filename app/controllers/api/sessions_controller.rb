module Api
  class SessionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def show
      restore_legacy_session!
      render json: { signed_in: admin_signed_in?, admin: current_admin_user&.session_payload }
    end

    def create
      AdminUser.bootstrap_primary!
      admin = find_admin

      unless admin&.authenticate(params[:password].to_s)
        render json: { success: false, errors: ["Incorrect password."] }, status: :unauthorized
        return
      end

      reset_session
      session[:admin_user_id] = admin.id
      admin.update_column(:last_sign_in_at, Time.current)
      render json: { success: true, admin: admin.session_payload }
    end

    def destroy
      reset_session
      render json: { success: true }
    end

    private

    def find_admin
      name = params[:name].to_s.squish
      return AdminUser.active.find_by("LOWER(name) = ?", name.downcase) if name.present?

      AdminUser.active.find { |admin| admin.authenticate(params[:password].to_s) }
    end

    def restore_legacy_session!
      return unless session[:admin_signed_in] == true && session[:admin_user_id].blank?

      session[:admin_user_id] = AdminUser.bootstrap_primary!.id
      session.delete(:admin_signed_in)
      remove_instance_variable(:@current_admin_user) if defined?(@current_admin_user)
    end
  end
end
