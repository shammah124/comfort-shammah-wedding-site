module Api
  class AdminAccountsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :require_signed_in_admin!

    def update_password
      unless current_admin_user.authenticate(params[:current_password].to_s)
        return render json: { success: false, errors: ["Current password is incorrect."] }, status: :unprocessable_entity
      end

      if current_admin_user.update(password_params)
        render json: { success: true, message: "Your password has been updated." }
      else
        render json: { success: false, errors: current_admin_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def password_params
      params.permit(:password, :password_confirmation)
    end

    def require_signed_in_admin!
      render json: { success: false, errors: ["Please sign in again."] }, status: :unauthorized unless current_admin_user
    end
  end
end
