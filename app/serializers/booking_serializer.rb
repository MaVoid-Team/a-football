class BookingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :court_id, :user_name, :user_phone,
             :date, :start_time, :end_time, :hours, :total_price,
             :original_price, :discount_amount, :status, :payment_status,
             :payment_option, :deposit_percentage_snapshot,
             :amount_due_now, :amount_remaining,
             :notes, :admin_notes, :promo_code_id, :created_at, :updated_at

  has_one :promo_code

  attribute :start_time do |booking|
    booking.start_time&.strftime("%H:%M")
  end

  attribute :end_time do |booking|
    booking.end_time&.strftime("%H:%M")
  end

  attribute :hours do |booking|
    booking.hours&.to_f
  end

  attribute :promo_code_code do |booking|
    booking.promo_code&.code
  end

  attribute :branch_name do |booking|
    booking.branch&.name
  end

  attribute :court_name do |booking|
    booking.court&.name
  end

  attribute :booking_slots do |booking|
    booking.booking_slots.map do |slot|
      {
        start_time: slot.start_time.strftime("%H:%M"),
        end_time: slot.end_time.strftime("%H:%M")
      }
    end
  end

  attribute :payment_screenshot_url do |booking, params|
    if booking.payment_screenshot.attached?
      url_options = (params[:url_options] || {}).dup
      if url_options[:host].present?
        Rails.application.routes.url_helpers.rails_blob_url(
          booking.payment_screenshot,
          **url_options
        )
      else
        Rails.application.routes.url_helpers.rails_blob_path(
          booking.payment_screenshot,
          only_path: true
        )
      end
    else
      nil
    end
  end
end
