module Api
  class GoodwillMessagesController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action -> { require_admin_permission!("goodwill_messages") }, only: :destroy

    def index
      render json: { goodwill_messages: GoodwillMessage.latest_first }
    end

    def create
      goodwill_message = GoodwillMessage.new(goodwill_message_params)

      if goodwill_message.save
        render json: { success: true, goodwill_message: goodwill_message }, status: :created
      else
        render json: { success: false, errors: goodwill_message.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      GoodwillMessage.find(params[:id]).destroy!
      render json: { success: true }
    rescue ActiveRecord::RecordNotFound
      render json: { success: false, errors: ["Goodwill message not found."] }, status: :not_found
    end

    private

    def goodwill_message_params
      params.require(:goodwill_message).permit(:name, :message)
    end

  end
end
