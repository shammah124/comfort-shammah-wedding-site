class ApplicationController < ActionController::Base
  allow_browser versions: :modern
  before_action :load_site_settings
  helper_method :admin_signed_in?

  def index
    render :index
  end

  private

  def load_site_settings
    @site_settings = SiteSetting.current
  end

  def admin_signed_in?
    session[:admin_signed_in] == true
  end
end
