class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :load_site_settings
  helper_method :admin_signed_in?, :current_admin_user

  def index
    render :index
  end

  private

  def load_site_settings
    @site_settings = SiteSetting.current
  end

  def admin_signed_in?
    current_admin_user.present?
  end

  def current_admin_user
    return @current_admin_user if defined?(@current_admin_user)

    @current_admin_user = AdminUser.active.find_by(id: session[:admin_user_id])
  end

  def require_admin_permission!(permission)
    if current_admin_user.nil?
      render json: { success: false, errors: ["Please sign in again."] }, status: :unauthorized
    elsif !current_admin_user.allowed?(permission)
      render json: { success: false, errors: ["Your admin account does not have permission for this section."] }, status: :forbidden
    end
  end
end
