module Api
  class SessionsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def show
      render json: { signed_in: session[:admin_signed_in] == true }
    end

    def create
      if params[:password].to_s == ENV.fetch("ADMIN_PASSWORD", "Cosh@2026")
        session[:admin_signed_in] = true
        render json: { success: true }
      else
        render json: { success: false, errors: ["Incorrect password."] }, status: :unauthorized
      end
    end

    def destroy
      session[:admin_signed_in] = false
      render json: { success: true }
    end
  end
end
