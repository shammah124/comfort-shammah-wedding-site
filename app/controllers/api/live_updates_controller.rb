module Api
  class LiveUpdatesController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action -> { require_admin_permission!("live_updates") }, only: [:create, :destroy]

    def index
      updates = LiveUpdate.latest_first.limit(20)

      render json: {
        live_updates: updates.as_json(only: %i[id context message author_name published_at created_at]),
      }
    end

    def create
      update = LiveUpdate.new(live_update_params)

      if update.save
        render json: { success: true, live_update: update.as_json(only: %i[id context message author_name published_at created_at]) }, status: :created
      else
        render json: { success: false, errors: update.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      update = LiveUpdate.find(params[:id])
      update.destroy
      render json: { success: true }
    end

    private

    def live_update_params
      params.require(:live_update).permit(:context, :message, :author_name)
    end

  end
end
