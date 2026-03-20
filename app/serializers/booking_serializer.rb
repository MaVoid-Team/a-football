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
      blob_path = Rails.application.routes.url_helpers.rails_blob_path(
        booking.payment_screenshot,
        only_path: true
      )

      api_blob_path = blob_path.start_with?("/api/") ? blob_path : "/api#{blob_path}"

      if url_options[:host].present?
        protocol = (url_options[:protocol] || "https").to_s
        host = url_options[:host].to_s
        port = url_options[:port]
        default_port = (protocol == "https" ? 443 : 80)
        port_segment = port.present? && port.to_i != default_port ? ":#{port}" : ""
        "#{protocol}://#{host}#{port_segment}#{api_blob_path}"
      else
        api_blob_path
      end
    else
      nil
    end
  end
end
