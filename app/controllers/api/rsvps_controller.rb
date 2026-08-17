module Api
  class RsvpsController < ApplicationController
    skip_before_action :verify_authenticity_token

    def index
      rsvps = Rsvp.order(created_at: :desc)
      attending = rsvps.where(attendance: "yes")
      render json: {
        rsvps: rsvps.as_json(only: %i[id name email attendance guest_count message created_at]),
        stats: {
          total: rsvps.count,
          attending: attending.count,
          not_attending: rsvps.where(attendance: "no").count,
          total_guests: attending.sum(:guest_count)
        }
      }
    end

    def create
      @rsvp = Rsvp.new(rsvp_params)
      if @rsvp.save
        render json: { success: true, message: "RSVP submitted successfully!" }, status: :created
      else
        render json: { success: false, errors: @rsvp.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def rsvp_params
      params.require(:rsvp).permit(:name, :email, :attendance, :guest_count, :message)
    end
  end
end
