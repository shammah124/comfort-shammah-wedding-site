module Api
  class SupportDetailsController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action -> { require_admin_permission!("support") }, only: [:update]

    def show
      render json: { support_detail: support_detail_payload(SupportDetail.current) }
    end

    def update
      detail = SupportDetail.current
      if detail.update(support_detail_params)
        render json: { success: true, support_detail: support_detail_payload(detail) }
      else
        render json: { success: false, errors: detail.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def support_detail_params
      params.require(:support_detail).permit(
        :heading,
        :bank_name,
        :account_name,
        :account_number,
        :sort_code,
        :secondary_bank_name,
        :secondary_account_name,
        :secondary_account_number,
        :secondary_sort_code,
        :note
      )
    end

    def support_detail_payload(detail)
      detail.as_json(only: %i[
        heading
        note
        bank_name
        account_name
        account_number
        sort_code
        secondary_bank_name
        secondary_account_name
        secondary_account_number
        secondary_sort_code
      ])
    end
  end
end
