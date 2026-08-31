module Api
  class AdminUsersController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :require_super_admin!
    before_action :set_admin_user, only: [:update, :destroy]

    def index
      render json: {
        admin_users: AdminUser.order(:name).map(&:management_payload),
        available_permissions: AdminUser::PERMISSIONS
      }
    end

    def create
      admin_user = AdminUser.new(create_params.merge(role: "admin", active: true))
      admin_user.permissions = params.dig(:admin_user, :permissions)

      if admin_user.save
        render json: { success: true, admin_user: admin_user.management_payload }, status: :created
      else
        render json: { success: false, errors: admin_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      attributes = update_params
      attributes[:password] = nil if attributes[:password].blank?
      attributes[:password_confirmation] = nil if attributes[:password_confirmation].blank?
      attributes.except!(:active) if @admin_user == current_admin_user
      @admin_user.assign_attributes(attributes.compact)
      @admin_user.permissions = params.dig(:admin_user, :permissions) unless @admin_user.super_admin?

      if @admin_user.save
        render json: { success: true, admin_user: @admin_user.management_payload }
      else
        render json: { success: false, errors: @admin_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      if @admin_user == current_admin_user || @admin_user.super_admin?
        return render json: { success: false, errors: ["The primary admin account cannot be deleted."] }, status: :unprocessable_entity
      end

      @admin_user.destroy!
      render json: { success: true }
    end

    private

    def create_params
      params.require(:admin_user).permit(:name, :password, :password_confirmation)
    end

    def update_params
      params.require(:admin_user).permit(:name, :active, :password, :password_confirmation)
    end

    def set_admin_user
      @admin_user = AdminUser.find(params[:id])
    end

    def require_super_admin!
      return if current_admin_user&.super_admin?

      render json: { success: false, errors: ["Only the primary admin can manage admin accounts."] }, status: current_admin_user ? :forbidden : :unauthorized
    end
  end
end
