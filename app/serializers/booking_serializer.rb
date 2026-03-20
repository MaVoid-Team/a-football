class BookingSerializer
  include JSONAPI::Serializer

  attributes :id, :branch_id, :court_id, :user_name, :user_phone,
             :date, :start_time, :end_time, :hours, :total_price,
             :original_price, :discount_amount, :status, :payment_status, 
             :notes, :promo_code_id, :created_at, :updated_at

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
      url_options[:script_name] ||= "/api"

      if url_options[:host].present?
        Rails.application.routes.url_helpers.rails_blob_url(
          booking.payment_screenshot,
          **url_options
        )
      else
        Rails.application.routes.url_helpers.rails_blob_path(
          booking.payment_screenshot,
          only_path: true,
          script_name: url_options[:script_name]
        )
      end
    else
      nil
    end
  end
end
